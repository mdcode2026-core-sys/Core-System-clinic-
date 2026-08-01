# CHANGELOG.md

Reconstructed baseline as of 2026-07-31 from committed migration files and archived handoff records. Maintained going forward per change — not regenerated from scratch each time.

---

## 2026-07-31 — Engineering Audit & Documentation Consolidation
- Full repository and live-database inspection performed (Repository First Policy established for all future engineering work).
- `SECURITY_AUDIT_REPORT.md` / `SECURITY_HOTFIX_PLAN.md` / `SECURITY_HOTFIX_MIGRATION.sql` produced — no changes applied to production yet, pending Owner approval.
- ADR-001 approved: extend existing `roles`/`permissions`/`role_permissions` schema for the Permission Engine rather than building new tables.
- ADR-002 approved: Milestone 3 (Unified Workspace) confirmed as the current authoritative roadmap target.
- Documentation consolidated: `MASTER_ROADMAP.md`, `ARCHITECTURE_DECISIONS.md`, `DATABASE_SCHEMA.md`, `PROJECT_HANDOFF.md`, `CHANGELOG.md` created/updated per `DOCUMENTATION_CONSOLIDATION_PLAN.md`.

## 2026-07-30 — Analytics Engine Closed
- Phase 1A (Analytics Engine) formally closed per `CORE_SYSTEM_INDEX.md`.

## 2026-07-29 — Signup Flow Fix, Queue Diagnostics, Queue Schema Fix
- **Migration `20260729120000_add_file_number_to_clinic_patients.sql`:** added `file_number` (varchar 50) to `clinic_patients` — root-cause fix for the `/queue` failure (`column clinic_patients_1.file_number does not exist`).
- **Migration `20260729100000_capture_invoice_items_and_payments.sql`:** added `invoice_items` and `invoice_payments` tables.
- **`create_tenant_with_subscription()` rewritten:** stopped writing to legacy tables (`tenants`, `users`, `subscriptions`, `subscription_events`, `roles`, `subscription_plans`); now writes only to `master_tenants` and `clinic_users` (see `ARCHITECTURE_DECISIONS.md` ADR-000).
- **`src/core/auth/actions.ts` updated:** explicitly writes `tenant_id`/`role` into both `user_metadata` and `app_metadata` after tenant creation, since the `handle_new_user` trigger fires before the `clinic_users` row exists.
- **`src/infrastructure/supabase/server.ts` updated:** switched from a raw `set_config` RPC call to the dedicated `set_tenant_id()` function.
- **Security fix applied:** `set_tenant_id()` was found using database-connection-wide config scope (`set_config(..., false)`) instead of transaction-local (`true`) — a genuine tenant-isolation risk under connection pooling. Corrected to `true`.
- **Diagnosed and fully reverted:** temporary debug patch on `src/app/(dashboard)/queue/page.tsx` used to capture the exact `/queue` error, then cleanly reverted.

## 2026-07-21 — Initial Schema Baseline
- **Migration `20260721100539_remote_schema.sql`:** initial committed schema — full multi-tenant table set (patients, agenda, invoicing, queue/visit-sessions, inventory ledger, retention follow-ups, analytics snapshots, subscription/billing/platform tables, permissions/roles/role_permissions, audit trail), 34 RLS policies, and all core Postgres functions (`get_current_tenant_id`, `get_current_user_role`, `create_tenant_with_subscription`, `handle_new_user`, invoicing business logic, trigger helpers).
- **Migration `20260721112514_remote_schema.sql`:** same-day constraint refresh — dropped and re-added several `CHECK` constraints (`billing_events`, `clinic_inquiries`, `clinic_invoices`, `clinic_patients`, `clinic_rooms`, `clinic_users`) to update allowed enum values.

---

## Format Going Forward

Each entry should include: date, short title, and either a migration filename (for schema changes) or a file path (for code changes) plus a one-line reason. Task-level detail belongs in `PROJECT_HANDOFF.md`, not here — this file stays a scannable timeline.
