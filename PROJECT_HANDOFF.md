# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Purpose:** Single, living handoff document. Updated in place going forward — supersedes dated snapshot files (`Handoff_Daily_Report_2026-07-29.md`, `QUEUE_DEBUG_PROGRESS.md`, `QUEUE_FIX_PROGRESS.md`, `ANALYTICS_BUILD_PROGRESS.md`), which are archived under `/archive/` for historical reference.
**Last Updated:** 2026-07-31

---

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
| Permission Engine (dynamic, per ADR-001) | Not yet built — currently hardcoded 4-role system |
| Tenant Administration Center / Settings Dashboard | Not started |

Authoritative next milestone: **Milestone 3 — Unified Workspace** (confirmed 2026-07-31, see ADR-002 in `ARCHITECTURE_DECISIONS.md`).

---

## 2. Open Items Requiring Attention

### Open Item #1 — `/queue` page status unconfirmed
**History:** `/queue` redirected to `/login` due to a missing `clinic_patients.file_number` column (root cause captured verbatim in the archived `Handoff_Daily_Report_2026-07-29.md`, task `TASK-QUEUE-DEBUG-001`). A fix was applied same-day (`TASK-QUEUE-FIX-002`, per archived `QUEUE_FIX_PROGRESS.md`).
**Verified true by this audit (2026-07-31):**
- The `file_number` column **exists live** on `clinic_patients` (confirmed via direct schema inspection) and the matching migration `20260729120000_add_file_number_to_clinic_patients.sql` is committed.
- `database.types.ts` **does** include `file_number` (confirmed) — contradicts `QUEUE_FIX_PROGRESS.md`, which still listed this as PENDING; that file was stale.
**Still unverified:** whether `/queue` actually loads successfully end-to-end in the deployed app (`QUEUE_FIX_PROGRESS.md` steps 6.4–6.6 — build/deploy check, live verification, and formal closure — were never marked done). **Action needed: a manual load test of `/queue` with an authenticated session, then formally close this item.**

### Open Item #2 — Security hotfixes pending approval
See `SECURITY_AUDIT_REPORT.md` and `SECURITY_HOTFIX_PLAN.md`. Not yet applied to the live database. Two decisions needed from Owner before the migration can run: (a) `subscription_plans` read-policy shape, (b) whether to eventually `DROP` the debug functions or just leave access revoked.

### Open Item #3 — Legacy tenant tables not formally resolved
`tenants`, `users`, `subscriptions`, `subscription_events` (see ADR-000) still exist live with residual data, superseded since 2026-07-29 but never formally deprecated or dropped. No action taken yet; flagged for a future decision.

### Open Item #4 — Documentation consolidation in progress
See `DOCUMENTATION_CONSOLIDATION_PLAN.md`. `ARCHITECTURE_DECISIONS.md` and `DATABASE_SCHEMA.md` have been created. `MASTER_ROADMAP.md` (renamed/merged from `PRODUCT_COMPLETION_ROADMAP_V2.md`) and this file are being produced in the same pass. Archiving of superseded files has not been executed yet — plan only, pending approval.

### Open Item #5 — EN-001: Milestone 2 (Tenant Administration Center) roadmap content missing
Sections 8–16 of the roadmap, which almost certainly specify Milestone 2, are absent even from the canonical repository copy of `PRODUCT_COMPLETION_ROADMAP_V2.md`. Not yet resolved.

---

## 3. Historical Record (condensed from archived daily reports)

**2026-07-29 — TASK-SIGNUP-001:** Fixed sign-up flow so `tenant_id`/`role` are correctly written to both `user_metadata` and `app_metadata` after `create_tenant_with_subscription` succeeds (previously the `handle_new_user` trigger fired too early to have this data). `create_tenant_with_subscription` was rewritten to stop writing to the legacy tables (see ADR-000) and write only to `master_tenants`/`clinic_users`. Verified working end-to-end for Dashboard and Invoices; Queue was found broken (see Open Item #1's history).

**2026-07-29 — TASK-QUEUE-DEBUG-001:** Diagnostic task. Reverted an unauthorized modification to `get_current_user_role()` made during the prior task's troubleshooting. **Found and fixed a genuine tenant-isolation risk:** `set_tenant_id()` was using `set_config(..., false)` — database-connection-wide scope — instead of `true` (transaction-local). Under Supabase's connection pooling, this could have let one request's tenant context leak into another pooled connection. Corrected to `true`. Root-caused the `/queue` failure precisely to the missing `file_number` column via a temporary, then fully reverted, debug patch.

**2026-07-29 — TASK-QUEUE-FIX-002:** Added the `file_number` column. Migration and type-generation steps were left marked PENDING in the task log but are confirmed complete by this audit (Open Item #1).

**2026-07-30 — Analytics Engine (Phase 1A) closed.**

**2026-07-31 — This audit cycle:** Full repository + live database inspection performed. Findings: security exposures (see `SECURITY_AUDIT_REPORT.md`), confirmed the permission system architecture direction (ADR-001), confirmed Milestone 3 as current (ADR-002), and began documentation consolidation.
