# ARCHITECTURE_DECISIONS.md

Log of every major architectural decision for CORE SYSTEM — ClinicSaaS™, per `ENGINEERING_CONSTITUTION.md` Chapter 6 ("Every Major Decision Requires an ADR"). Newest first is not used — entries are chronological (oldest first) so the log reads as project history.

Status values: `Proposed` · `Approved` · `Superseded`

---

## ADR-000 (Retroactive) — Tenant Model Migration: `master_tenants`/`clinic_users` replace `tenants`/`users`

**Date:** 2026-07-29 (reconstructed from `Handoff_Daily_Report_2026-07-29.md` and live schema — this decision was made and executed before this ADR log existed; recorded now so it is not lost to history)
**Status:** Approved (already in production)

**Context:** The original signup/tenant-creation function wrote to `tenants`, `users`, `subscriptions`, `subscription_events`, `roles`, and `subscription_plans`. As of 2026-07-29, `create_tenant_with_subscription()` was changed to write to `master_tenants` and `clinic_users` instead.

**Decision:** `master_tenants` and `clinic_users` are the active, current tenant/user tables. `tenants`, `users`, `subscriptions`, and `subscription_events` are legacy — confirmed still present in the live schema with residual data (3, 2, 2, and 2 rows respectively at time of audit) but no longer written to by the active signup path.

**Consequence:** Any new engineering work (including Milestone 3) must build against `master_tenants` / `clinic_users`, never `tenants` / `users`. The legacy tables are not yet formally deprecated (no migration drops them) — this ADR documents the de facto state so future engineers don't accidentally resurrect the old path. A formal deprecation/removal decision for the legacy tables has not been made and is out of scope here.

**Note on `roles`:** The Handoff report grouped `roles` in the same "no longer written to" list as the tenant tables above. Live inspection (this audit cycle) found `roles` has no `tenant_id` column and is not structurally tied to the legacy `tenants` table — it is a standalone, tenant-agnostic reference table. ADR-001 below addresses `roles` on its own merits, independent of this tenant-model migration.

---

## ADR-001 — Permission Engine: Extend the Existing `roles` / `permissions` / `role_permissions` Schema Instead of Building New Tables

**Date:** 2026-07-31
**Status:** Approved

**Context:** `PRODUCT_COMPLETION_ROADMAP_V2.md` (Section 3.4) requires a permission-driven architecture with no hardcoded employee roles. The current implementation is role-based at two levels:
- Application layer: `src/core/permissions/permissionMatrix.ts` — a static, hardcoded `Record<UserRole, Permission[]>` with exactly 4 roles (`super_admin`, `clinic_admin`, `doctor`, `receptionist`).
- Database layer: `clinic_users.role` has a `CHECK` constraint limited to the same 4 values, and 34 RLS policies call `get_current_user_role()` / `get_current_tenant_id()`, several with the role strings hardcoded directly in the policy definition.

Live inspection also found `roles`, `permissions`, and `role_permissions` tables already exist in the schema:
- `roles`: 6 rows already seeded (`super_admin`, `clinic_admin`, `clinic_owner`, `doctor`, `nurse`, `receptionist` — two more than the app currently supports), each with an `is_system_role` flag.
- `permissions` and `role_permissions`: present, structurally sound, currently empty (0 rows) — never populated or wired to the application.
- Read-only RLS policies (`rls_roles_read`, `rls_permissions_read`, `rls_role_permissions_read`, all `USING (true)`) already exist for all three tables.

**Decision:** Extend and repurpose the existing schema rather than design a new one.
- `roles` becomes the **System Permission Template** registry. `is_system_role = true` rows are the fixed defaults (**Doctor, Reception, Accounting** — mapped from the existing `doctor`, `receptionist`, and a to-be-added accounting-focused role/permission set); `is_system_role = false` rows become tenant-defined custom templates, which the schema already anticipated.
- `permissions` becomes the master permission-key catalog (populate it; currently empty).
- `role_permissions` becomes the template-to-permission mapping (populate it; currently empty).
- One new table is added for per-user overrides beyond a user's assigned template — this is the only net-new table, since the roadmap (Section 5) requires that every user ultimately receives individually-assigned permissions, with templates serving only as an accelerator, never a hard constraint.
- `clinic_users.role` (string column) is kept exactly as-is for now and used as the join key to `roles.role_key` — **no new foreign key column, no data migration, no change to the 34 existing RLS policies in this phase.** The new Permission Engine is additive: it runs alongside the existing role-based RLS, consumed only by the new Unified Workspace UI.

**Consequences:**
- Zero risk to currently-working authentication, RLS, and the recently-fixed (2026-07-29) signup flow.
- The `CHECK` constraint limiting `clinic_users.role` to 4 values means **true custom roles beyond the six already seeded are not yet possible** without a separate, later decision to relax or remove that constraint. This is explicitly deferred, not bundled into Milestone 3.
- `clinic_owner` and `nurse` — already present in `roles` but unsupported by the app and blocked by the `CHECK` constraint — can be enabled as a small, low-risk follow-up once the constraint question above is resolved.
- Existing RLS policies that hardcode role strings (e.g., `'super_admin'`, `'clinic_admin'`) are not touched by this decision. A future, separate ADR would be required to migrate them to permission-key-based checks.

**Alternatives considered:**
- *Design new tables from scratch* — rejected: would duplicate structurally sound, already-provisioned schema for no benefit, and increases migration surface for no reason (violates Minimal Change Principle).
- *Rewrite the 34 existing RLS policies immediately to be fully permission-key-based* — rejected for this phase: high blast radius against currently-working production policies for a benefit (full architectural purity) that can be captured incrementally later; the additive approach delivers the roadmap's functional requirement (permission-driven Unified Workspace) without that risk.

---

## ADR-002 — Milestone 3 Is the Current Authoritative Roadmap Reference

**Date:** 2026-07-31
**Status:** Approved

**Context:** Two documents in the repository describe project sequencing with different terminology and, apparently, different next-steps: `PRODUCT_COMPLETION_ROADMAP_V2.md` (Milestone numbering, next = Milestone 3 "Unified Workspace") and `CORE_SYSTEM_INDEX.md` (Phase numbering, next = Phase 6 "Settings Dashboard"). See `DOCUMENTATION_CONSOLIDATION_PLAN.md` for how these are being reconciled into a single `MASTER_ROADMAP.md`.

**Decision:** Milestone 3 (Unified Workspace) is confirmed as the current, authoritative next step. Phase 6 / "Settings Dashboard" content from `CORE_SYSTEM_INDEX.md` is understood to map to Milestone 2 ("Tenant Administration Center") in the Roadmap's numbering, not to a separate, earlier-priority track.

**Consequence:** The Software Engineering Execution Plan for Milestone 3 proceeds as the active plan. Milestone 2 content is still pending (see EN-001, unresolved — Sections 8–16 of the roadmap are not present even in the canonical repository copy).
