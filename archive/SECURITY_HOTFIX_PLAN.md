# SECURITY_HOTFIX_PLAN.md

**Based on:** SECURITY_AUDIT_REPORT.md
**Migration artifact:** SECURITY_HOTFIX_MIGRATION.sql (drafted, **not executed** — review and apply manually per Owner approval)
**Principle followed:** Minimal Change — every action below only removes unused/unnecessary access or adds a missing policy. Nothing is redesigned. Nothing already working is touched beyond the specific grant/policy in question.

---

## Execution Order (dependency-aware)

Each phase is independent of the others and can be applied separately — they are grouped by risk/verification profile, not by a hard technical dependency.

### Phase A — Zero-risk removals (no app usage found anywhere)
**Items:** SEC-001 (`test_jwt_claims` ×2, `test_queue_access`), SEC-002 (`set_config`), SEC-004 (`fn_audit_changes`), SEC-005 (`handle_new_user`), SEC-009 (invoicing/trigger functions retaining `anon`).
**Action:** `REVOKE EXECUTE ... FROM anon` (and `authenticated` where noted "no usage found" in the audit).
**Regression risk:** None identified — confirmed no `.rpc()` call anywhere in `src/` for any of these.
**Verification before applying:** None needed beyond the grep already performed.
**Verification after applying:** Full app smoke test (login → patients → agenda → invoices → analytics) should show no change in behavior.
**Rollback:** Re-`GRANT EXECUTE` to the same roles (kept in the migration file as a commented-out rollback block).

### Phase B — Requires care: `anon`-only revocation on app-critical functions
**Items:** SEC-003 (`set_tenant_id` — revoke `anon` only, **do not touch `authenticated`**), SEC-006 (`get_current_tenant_id`, `get_current_user_role` — revoke `anon` only).
**Regression risk:** Low for `set_tenant_id` (confirmed `authenticated` is what the app actually uses). For SEC-006, revoking `anon` changes the *symptom* of blocked access from "empty result" to "permission error" — functionally equivalent, but worth a manual check.
**Verification before applying:** Confirm no public/pre-login page issues a Supabase query expected to silently return empty for a logged-out visitor.
**Verification after applying:** Load the landing page, `/login`, and `/register` while logged out; confirm no unexpected error surfaces in the browser console or UI.
**Rollback:** Re-`GRANT EXECUTE TO anon` (kept as commented rollback block).

### Phase C — Additive fix, not a revocation
**Item:** SEC-007 (`subscription_plans` has RLS enabled with zero policies).
**Action:** This phase does **not** touch grants — it adds one missing `SELECT` policy. Recommended shape: readable by `authenticated` (and optionally `anon` if the plan list must be visible on a public pricing/signup page before login — **this needs your confirmation**, since it changes who can see plan data, not just closes a gap).
**Open question for Owner:** Should the plan catalog be visible to logged-out visitors (e.g., a pricing page) or only to authenticated users mid-signup? The migration includes both options, commented, pick one.

### Phase D — Hardening, not urgent
**Items:** SEC-008 (`search_path` on ~20 functions), SEC-010 (extensions in `public`).
**Action:** `ALTER FUNCTION ... SET search_path = public` for each; extension relocation is deferred (moving `pg_net`/`btree_gist` to a new schema can be disruptive if anything references them unqualified — recommend leaving this for a dedicated, low-traffic maintenance window rather than bundling with this hotfix).

### Phase E — Dashboard setting, not a migration
**Item:** SEC-011 (Leaked Password Protection). Enable manually in Supabase Auth settings after confirming it won't lock out any test accounts using known-weak passwords during development.

---

## Summary of What Requires Your Explicit Decision (not just approval to execute)

1. **Phase C:** Should `subscription_plans` be readable by `anon`, or `authenticated` only?
2. **Phase A items SEC-001/SEC-002:** Confirmed safe to revoke — but do you want `test_jwt_claims`/`test_queue_access`/`set_config` fully **dropped** eventually (not just access-revoked), or kept in place (unreachable, but present) in case they're useful again during a future debugging session? Migration currently only revokes access; dropping is a separate, easily-added step once you confirm.

Nothing in this plan is applied until you approve it and run `SECURITY_HOTFIX_MIGRATION.sql` yourself (or explicitly ask me to apply it via a reviewed migration).
