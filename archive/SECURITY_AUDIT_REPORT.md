# SECURITY_AUDIT_REPORT.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Target:** Live Supabase project `core-system-clinic` (ref: `qaslsjyxjwvdoiczmhgq`)
**Audit Method:** Direct connection to the live project — `list_tables`, `get_advisors` (security), and direct SQL queries against `pg_proc`, `pg_roles`, `information_schema`, plus cross-referenced against actual application source code (`src/`) to distinguish real usage from dead/legacy surface.
**Date:** 2026-07-31
**Status:** Findings only — no changes applied to the live database. See `SECURITY_HOTFIX_PLAN.md` for remediation and `SECURITY_HOTFIX_MIGRATION.sql` for the review-only migration.

---

## 1. Scope & Method

Every finding below was verified two ways before being listed:
1. Confirmed live on the database itself (not just inferred from committed migration files, which can drift from reality).
2. Cross-checked against actual `src/` usage (`grep -rn ".rpc("`) to determine whether removing/changing it is safe, or whether the application genuinely depends on it. This distinction changes the recommendation for several items below — see Section 3.

Current data footprint at time of audit is small (`clinic_users`: 3 rows, `clinic_patients`: 3 rows, `tenants`/`master_tenants` combined: 7 rows) — real-world blast radius today is limited, but every item below must be resolved before onboarding real tenant data.

---

## 2. Findings — Critical

### SEC-001 — Debug/test functions exposed to unauthenticated users
`test_jwt_claims()` (two overloads: no-arg and `p_user_id uuid`) and `test_queue_access()` are `SECURITY DEFINER` functions with `EXECUTE` granted to both `anon` and `authenticated`, callable directly via `/rest/v1/rpc/test_jwt_claims` and `/rest/v1/rpc/test_queue_access`.

- **Origin:** Created during the `TASK-QUEUE-DEBUG-001` session (`QUEUE_DEBUG_PROGRESS.md`, 2026-07-29) as manual diagnostic tools.
- **Usage in application code:** None. Confirmed via full `src/` search — not called anywhere.
- **Risk:** Diagnostic functions of this kind commonly return internal state (JWT claim contents, access-check internals). Left exposed to `anon`, they give any unauthenticated caller a free tool to probe how tenant/role resolution behaves.

### SEC-002 — Unrestricted `set_config(key text, value text)` exposed to `anon`
A generic `SECURITY DEFINER` wrapper around Postgres's `set_config`, with no allow-list on which config key can be set, callable by `anon`.

- **Usage in application code:** None found.
- **Risk:** Allows an unauthenticated caller to set **any** session-level Postgres config value the function's owner can set — including, in principle, `app.current_tenant_id` (the same value `get_current_tenant_id()` falls back to reading — see SEC-003). This is the highest-leverage single finding in this audit because it is both unused and unrestricted.

---

## 3. Findings — High

### SEC-003 — `set_tenant_id(tenant_id uuid)` exposed to `anon` (application-critical function — requires care)
`SECURITY DEFINER`, sets `app.current_tenant_id` via `set_config(..., true)` (transaction-local). `get_current_tenant_id()` falls back to reading this exact value when JWT claims are absent.

- **Usage in application code:** **Actively and heavily used** — `src/infrastructure/supabase/server.ts`, `src/domain/patients/patients.actions.ts`, `src/domain/agenda/agenda.actions.ts`, `src/domain/analytics/analytics.actions.ts` all call `supabase.rpc("set_tenant_id", ...)`. This is core, working plumbing for every Server Action in Patients, Agenda, and Analytics.
- **Verified call context:** `server.ts` only calls it *after* `supabase.auth.getUser()` succeeds and a `tenantId` is found in that authenticated user's metadata — meaning in practice it currently runs under an authenticated session, not a genuinely anonymous one.
- **Risk:** The function does not itself check the caller's identity before setting the value — it trusts whatever `tenant_id` argument it's given. The `anon` grant is not needed for the app's own flow and has no other legitimate purpose. **Do not revoke `authenticated` — only `anon`.** Removing `authenticated` access would break Patients, Agenda, and Analytics immediately.

### SEC-004 — `fn_audit_changes()` directly callable by `anon`/`authenticated`
`SECURITY DEFINER`, `fn_` prefix indicates a trigger function (confirmed: no meaningful standalone parameters, not called anywhere as `.rpc(...)` in `src/`).

- **Risk:** A trigger function does not need direct public `EXECUTE` for the trigger itself to fire — the grant only enables someone to invoke it manually via `/rest/v1/rpc/fn_audit_changes`, serving no legitimate purpose and creating an unnecessary path to write to `audit_trail`.

### SEC-005 — `handle_new_user()` directly callable by `anon`/`authenticated`
Same pattern as SEC-004: this is the `auth.users` insert trigger (confirmed by a code comment in `src/core/auth/actions.ts` referencing it as "الـ Trigger"). Not called directly anywhere in `src/`. Revoking direct public `EXECUTE` does not affect trigger firing.

---

## 4. Findings — Medium

### SEC-006 — `get_current_tenant_id()` / `get_current_user_role()` — `anon` grant has a subtle side effect
Both `SECURITY DEFINER`, not called directly via `.rpc()` anywhere in `src/` — they are invoked implicitly whenever Postgres evaluates an RLS policy that references them (nearly every tenant-scoped table).

- **Important nuance:** Because these are invoked *during RLS policy evaluation*, the querying role must retain `EXECUTE` for the query to run at all. Revoking `anon`'s `EXECUTE` here means an anonymous query against any RLS-protected table will now fail with a **permission error** instead of silently returning zero rows (which is what happens today, since the functions return `NULL` for an unauthenticated caller and the policy comparison naturally evaluates to false). Both outcomes correctly block access; only the *symptom* changes (error vs. empty result). **Recommend testing the public/pre-auth pages (landing, login, register) after this change** to confirm nothing pre-auth relies on a "silently empty" result rather than an explicit error.

### SEC-007 — `subscription_plans`: RLS enabled, zero policies
Confirmed live: RLS is on, no `CREATE POLICY` exists for this table anywhere in the committed migrations, and it is absent from the live policy list. Result: **the table is fully inaccessible to every role except the table owner/superuser** — including `authenticated` users.

- **Risk (functional, not just security):** If any plan-selection or billing UI expects to read `subscription_plans`, it is silently broken right now, not just insecure. The table does hold 4 seeded rows.

### SEC-008 — ~20 functions missing explicit `search_path`
Includes `get_current_tenant_id`, `get_current_user_role`, `handle_new_user`, `create_tenant_with_subscription`, all invoicing functions, and trigger helpers. Standard Postgres hardening: without a pinned `search_path`, a function's unqualified object references can be redirected by a malicious schema earlier in a caller-controlled search path. Lower urgency than SEC-001–003 but broad in surface.

### SEC-009 — Business-logic functions retain `anon` `EXECUTE` with no use case
`can_edit_invoice`, `cancel_invoice`, `create_invoice_from_session`, `issue_invoice`, `recalculate_invoice_totals`, `record_invoice_payment`, `generate_invoice_number`, and a few trigger helpers (`fn_set_auto_close`, `fn_set_session_buffer`, `fn_set_updated_at`, `fn_log_subscription_change`, `update_updated_at_column`) are **not** `SECURITY DEFINER` — they run with the caller's own (RLS-governed) rights, so the practical risk is lower than SEC-001–005. Still, `anon` has no legitimate reason to call invoicing logic directly. Defense-in-depth: revoke from `anon`, keep `authenticated`.

---

## 5. Findings — Low

### SEC-010 — Extensions installed in `public` schema
`pg_net` and `btree_gist` are installed directly in `public` rather than a dedicated schema (e.g., `extensions`). Standard best practice, not an active exploit path today.

### SEC-011 — Leaked Password Protection disabled
Supabase Auth setting; checks new passwords against known-breached password lists. Currently off. One-click enable in the Auth settings — no code or migration required.

---

## 6. Summary Table

| ID | Finding | Severity | App depends on it? | Safe to revoke from `anon`? | Safe to revoke from `authenticated`? |
|---|---|---|---|---|---|
| SEC-001 | `test_jwt_claims`, `test_queue_access` | Critical | No | Yes | Yes |
| SEC-002 | `set_config` | Critical | No | Yes | Yes (no usage found) |
| SEC-003 | `set_tenant_id` | High | **Yes — heavily** | Yes | **No — will break Patients/Agenda/Analytics** |
| SEC-004 | `fn_audit_changes` | High | No (trigger only) | Yes | Yes |
| SEC-005 | `handle_new_user` | High | No (trigger only) | Yes | Yes |
| SEC-006 | `get_current_tenant_id`, `get_current_user_role` | Medium | Indirectly (via RLS) | Yes, but test pre-auth pages after | No — required for all authenticated queries |
| SEC-007 | `subscription_plans` no policy | Medium | Unknown — needs owner input | N/A (needs a SELECT policy, not a revoke) | N/A |
| SEC-008 | Mutable `search_path` (~20 functions) | Medium | N/A | N/A | N/A |
| SEC-009 | Invoicing functions retain `anon` EXECUTE | Medium | No | Yes | Keep |
| SEC-010 | Extensions in `public` | Low | N/A | N/A | N/A |
| SEC-011 | Leaked password protection off | Low | N/A | N/A | N/A |

See `SECURITY_HOTFIX_PLAN.md` for the remediation sequence and `SECURITY_HOTFIX_MIGRATION.sql` for the drafted (not executed) SQL.
