# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Purpose:** Single, living handoff document. Updated in place going forward — supersedes dated snapshot files (`Handoff_Daily_Report_2026-07-29.md`, `QUEUE_DEBUG_PROGRESS.md`, `QUEUE_FIX_PROGRESS.md`, `ANALYTICS_BUILD_PROGRESS.md`), which are archived under `/archive/` for historical reference.
**Last Updated:** 2026-07-31

---

**Note (2026-08-02):** `xalkair@gmail.com` and `yazeed48@gmail.com` are designated test accounts (real email addresses, test purpose). Roles/permissions on these two may be freely reassigned during verification without asking the Owner each time.

**Note (2026-08-04, Owner-confirmed product decision):** `doctor` role is intentionally read-only on `patients` (view list + view data only — no create/update/delete). Clinical data updates by doctors happen via `sessions:update` on `clinic_visit_sessions` (doctor_notes/clinical_notes), a separate table doctor already has write access to — patient master/administrative data is reception/admin territory by design. `clinic_admin` additionally has `patients:delete`. This supersedes the original Session 1 mapping for these two specific grants; not an error, do not revert.

## 1. Current State (as of this update)

| Area | Status |
|---|---|
| Core Foundation (auth, multi-tenancy, dashboard shell, analytics engine) | ✅ Closed |
| Patients | ✅ Closed |
| Agenda (Appointments) | 🟡 ~85% |
| Queue | 🟡 ~85% — see Open Item #1 below |
| Invoicing (Billing) | ✅ Closed |
| Analytics Engine | ✅ Closed (2026-07-30) |
| Inventory | ⚠️ Consumption log only (`inventory_ledger`); no stock/catalog model |
| Reports | ❌ Not started |
| Follow-up | ⚠️ Database fully modeled (`retention_followups`); no domain layer or UI |
| Dashboard (Unified Workspace) | Partial shell exists (`DashboardShell.tsx`) |
| Permission Engine (dynamic, per ADR-001) | 🟡 Runtime complete (Package 3.0.1, 2026-08-02) — DB populated, permissionEngine.ts + usePermissions.ts live, build green. Navigation/UI wiring next (Package 3.0.2). |
| Tenant Administration Center / Settings Dashboard | Not started |

Authoritative next milestone: **Milestone 3 — Unified Workspace** (confirmed 2026-07-31, see ADR-002 in `ARCHITECTURE_DECISIONS.md`).

---

## 2. Open Items Requiring Attention

### Open Item #8 — Deep audit across Sessions 3–7 (2026-08-04)
Full direct repository + live database inspection performed after Kimi self-reported cascading failures in Session 6.

**Session 4 (Inventory) — CRITICAL, found and fixed live:** `rls_inventory_items_insert`/`update` policies were missing the `tenant_id = get_current_tenant_id()` check entirely (role-only check) — any `clinic_admin`/`receptionist`/`accounting` user could write to **any tenant's** inventory rows. `adjust_inventory_stock()` was `SECURITY DEFINER` with no internal permission check, callable by any authenticated user regardless of role, fully bypassing RLS. **Both fixed directly against the live database** (policies now include tenant_id; function changed to `SECURITY INVOKER`). The edit-save bug and dead-code issues from the prior review are confirmed fixed in the current committed files. **Process gap:** the committed migration file (`20260804000000_inventory_items_and_ledger_fk.sql`) was overwritten with unrelated later content (transaction-type constraint changes) and no longer reflects the actual live policy/function definitions — repository and live database have drifted. A reconciling migration capturing current live state should be committed.

**Session 6 (Queue) — one real unresolved bug, architectural fix specified:** `isDoctorView = canUpdateSession` incorrectly shows the doctor-only view (`MyQueueView`) to any role with `sessions:update`, which includes `clinic_admin` (not just `doctor`) — confirmed via Session 1's role_permissions. View *selection* (which screen layout renders) is not the same concern as action *permission* (what's clickable within it); use `role === "doctor"` (already available from `clinic_users`) to choose the view, while `usePermissions()` continues to gate individual actions inside each view. The prop-mismatch chaos Kimi self-reported across multiple attempts is no longer present in the current committed files — verified directly, `queue/page.tsx` / `MyQueueView.tsx` / `LiveQueueBoard.tsx` are structurally consistent now.

**Session 7 (Invoicing) — no issues found**, permission wiring follows established pattern correctly.

**Session 3 (Patients) — no new issues found** in spot re-check.

**Note on Kimi's Session 6 self-report:** it contains one factual error worth correcting for the record — `getEffectivePermissions()` reads from the database (`clinic_users`→`roles`→`role_permissions`→`permissions`), not from `permissionMatrix.ts` as the report claimed. The actual bug found (view-selection logic) is real and correctly identified despite this mischaracterization of the cause.

### Open Item #1 — `/queue` page status unconfirmed
**History:** `/queue` redirected to `/login` due to a missing `clinic_patients.file_number` column (root cause captured verbatim in the archived `Handoff_Daily_Report_2026-07-29.md`, task `TASK-QUEUE-DEBUG-001`). A fix was applied same-day (`TASK-QUEUE-FIX-002`, per archived `QUEUE_FIX_PROGRESS.md`).
**Verified true by this audit (2026-07-31):**
- The `file_number` column **exists live** on `clinic_patients` (confirmed via direct schema inspection) and the matching migration `20260729120000_add_file_number_to_clinic_patients.sql` is committed.
- `database.types.ts` **does** include `file_number` (confirmed) — contradicts `QUEUE_FIX_PROGRESS.md`, which still listed this as PENDING; that file was stale.
**Still unverified:** whether `/queue` actually loads successfully end-to-end in the deployed app (`QUEUE_FIX_PROGRESS.md` steps 6.4–6.6 — build/deploy check, live verification, and formal closure — were never marked done). **Action needed: a manual load test of `/queue` with an authenticated session, then formally close this item.**

### Open Item #2 — Security hotfixes: Phases A/B/D applied and verified; Phase C still pending
**Update (2026-08-01):** Phases A/B/D from `SECURITY_HOTFIX_MIGRATION.sql` were applied directly to the live database by the Architect on 2026-07-31, using `execute_sql` rather than the blocked `apply_migration` path. **First attempt silently failed verification** — `REVOKE ... FROM anon, authenticated` had no effect because Postgres grants `EXECUTE` to the implicit `PUBLIC` role by default at function creation, and `anon`/`authenticated` still inherited access through that. Corrected by revoking from `PUBLIC` directly and re-granting only to the intended roles (`authenticated`/`service_role` where needed, none for the fully-locked-down debug functions). Re-verified against live grants: confirmed `anon` no longer has `EXECUTE` on any of the flagged functions, while `authenticated` retains exactly what Patients/Agenda/Analytics depend on. **Phase C (`subscription_plans` read policy) remains pending an Owner decision and does not block other work.**

### Open Item #6 — `service_role` key committed to git history (accepted risk, tracked)
**Found:** 2026-08-01. `.env.local`, containing the real `SUPABASE_SERVICE_ROLE_KEY` (full RLS bypass), is tracked in git history (first committed alongside `PRODUCT_COMPLETION_ROADMAP_V2.md`). `.gitignore` lists `.env.local` but this does not retroactively untrack an already-committed file.
**Owner decision (2026-08-01):** known and accepted for now — needed for current work procedures, project is pre-production with no real tenant data yet. **Hard condition, not optional: this key must be rotated in the Supabase dashboard and the file untracked (`git rm --cached`) before any real tenant data or production launch — whichever comes first.** Re-raise this explicitly at the start of any production-readiness (Milestone 7) or go-live discussion.

### Open Item #7 — Build verification, partial (2026-08-01)
The Architect cloned the repository directly and ran `npx tsc --noEmit`: **zero TypeScript errors, confirmed.** Full `next build` could not be completed in the Architect's sandbox — it failed only on fetching the Inter font from Google Fonts (a network restriction in that environment, not a code defect); this is not evidence of a real build failure. `next lint` hit a CLI/config resolution issue in the same sandbox, inconclusive — not yet confirmed clean. Kimi has no execution access at all (confirmed via Kimi's own Session 0 report) and cannot verify any of this independently — the Architect is the verification path for build/type-check results going forward, relayed through the Owner.

### Open Item #3 — Legacy tenant tables not formally resolved
`tenants`, `users`, `subscriptions`, `subscription_events` (see ADR-000) still exist live with residual data, superseded since 2026-07-29 but never formally deprecated or dropped. No action taken yet; flagged for a future decision.

### Open Item #4 — Documentation consolidation in progress
See `DOCUMENTATION_CONSOLIDATION_PLAN.md`. `ARCHITECTURE_DECISIONS.md` and `DATABASE_SCHEMA.md` have been created. `MASTER_ROADMAP.md` (renamed/merged from `PRODUCT_COMPLETION_ROADMAP_V2.md`) and this file are being produced in the same pass. Archiving of superseded files has not been executed yet — plan only, pending approval.

### Open Item #5 — EN-001: Milestone 2 (Tenant Administration Center) roadmap content missing
Sections 8–16 of the roadmap, which almost certainly specify Milestone 2, are absent even from the canonical repository copy of `PRODUCT_COMPLETION_ROADMAP_V2.md`. Not yet resolved.

---

## 3. Known Issues Register (consolidated from `CORE_SYSTEM_INDEX.md` "Current Known Problems," 11 issues total)

| # | Issue | Status |
|---|---|---|
| 001 | Dashboard routing — correct route is `src/app/(dashboard)/page.tsx`, not `.../dashboard/page.tsx` | ✅ Resolved |
| 002 | Repeated proposal of already-failed solutions | Process rule, not a bug — see `ENGINEERING_CONSTITUTION.md` |
| 003 | Blind file modification without dependency analysis | Process rule — same |
| 004 | Console/browser-devtools dependency (Owner develops from mobile) | Process rule — prefer server-side diagnostics |
| 005 | Artificial/temporary file creation | Process rule |
| 006 | RLS bugs in `rls_sessions_write_role_check`, `rls_invoices_doctor_read`, `rls_audit_read` | ✅ Resolved |
| 007 | Legacy tables (`users`/`clinic_users`, `tenants`/`master_tenants`) inconsistency | ✅ Resolved (app-layer only — legacy tables still physically present, see ADR-000) |
| 008 | `isDoctor` manually hardcoded to `false` in `queue/page.tsx` | 🟡 Suspended — waiting on `MyQueueView` |
| 009 | Analytics build error chain (dead import, `"use server"` misuse, unsupported locale glyphs) | ✅ Resolved |
| **010** | **`/queue` redirect to `/login`, missing `file_number` column** | **Still officially OPEN per `CORE_SYSTEM_INDEX.md` as of 2026-07-30 — matches Open Item #1 above. The column now exists (verified), but formal closure/live verification never happened.** |
| 011 | `@types/react` peer dependency warning (18.x vs 19.x) | Cosmetic, non-blocking |

**Production status:** Not yet in production (`Production: NO` per `CORE_SYSTEM_INDEX.md`).

---

## 4. Historical Record (condensed from archived daily reports)

**2026-07-29 — TASK-SIGNUP-001:** Fixed sign-up flow so `tenant_id`/`role` are correctly written to both `user_metadata` and `app_metadata` after `create_tenant_with_subscription` succeeds (previously the `handle_new_user` trigger fired too early to have this data). `create_tenant_with_subscription` was rewritten to stop writing to the legacy tables (see ADR-000) and write only to `master_tenants`/`clinic_users`. Verified working end-to-end for Dashboard and Invoices; Queue was found broken (see Open Item #1's history).

**2026-07-29 — TASK-QUEUE-DEBUG-001:** Diagnostic task. Reverted an unauthorized modification to `get_current_user_role()` made during the prior task's troubleshooting. **Found and fixed a genuine tenant-isolation risk:** `set_tenant_id()` was using `set_config(..., false)` — database-connection-wide scope — instead of `true` (transaction-local). Under Supabase's connection pooling, this could have let one request's tenant context leak into another pooled connection. Corrected to `true`. Root-caused the `/queue` failure precisely to the missing `file_number` column via a temporary, then fully reverted, debug patch.

**2026-07-29 — TASK-QUEUE-FIX-002:** Added the `file_number` column. Migration and type-generation steps were left marked PENDING in the task log but are confirmed complete by this audit (Open Item #1).

**2026-07-30 — Analytics Engine (Phase 1A) closed.**

**2026-07-31 — This audit cycle:** Full repository + live database inspection performed. Findings: security exposures (see `SECURITY_AUDIT_REPORT.md`), confirmed the permission system architecture direction (ADR-001), confirmed Milestone 3 as current (ADR-002), and began documentation consolidation.
