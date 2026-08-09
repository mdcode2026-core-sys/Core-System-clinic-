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

**Implementation status (2026-08-08):** Milestone 3 (Unified Workspace) is implemented and builds successfully — see `CHANGELOG.md` 2026-08-08 entry and `PROJECT_HANDOFF.md` Open Item #9 for the full recovery record. `src/features/dashboard/DashboardShell.tsx` (the pre-Workspace static shell referenced throughout `IMPLEMENTATION_PACKAGE_MILESTONE_3.md`) is now confirmed dead code — zero imports anywhere in the repository — superseded by `src/features/workspace/WorkspaceShell.tsx`. Not deleted; retained pending an explicit cleanup decision.

---

## ADR-003 — Four-Layer Subscription & License Architecture

**Date:** 2026-07-31
**Status:** Approved (Product Owner Final Decision — frozen)

**Decision:** Subscriptions are modeled as four independent layers: (1) **Base Plan** — enabled modules, included users/branches/storage, support level, billing cycle only; (2) **Add-ons** — independently purchasable capabilities (extra users/storage/branches, WhatsApp, SMS, AI Assistant, Post-Visit Follow-up, Lab/Radiology/Pharmacy integration, API Access, Advanced Analytics); (3) **Resource Limits** — operational ceilings (users, branches, storage, attachments, file size, monthly messages, backups), storage treated as an expandable commercial resource, not a fixed package value; (4) **License Engine** — the single runtime source of truth, computed as Base Plan + Add-ons + Resource Limits + Feature Flags. **Every module validates against the License, never against `subscription_tier` directly.**

**Trial Policy:** every new tenant gets an automatic, full-platform trial, duration configurable by Super Admin (default 14 days). On expiry: data stays intact, access is suspended, Super Admin can extend/activate/change.

**Subscription Lifecycle (state machine):** `Trial → Active → Expiring Soon → Grace Period → Suspended → Reactivated → Cancelled`. Notifications follow state transitions.

**Repository impact (found during this audit, not yet resolved by this ADR — flagged for the implementation package):** `master_tenants.subscription_tier` currently conflates two orthogonal concepts this ADR separates — plan identity (`trial`/`essential`/`professional`/`enterprise`) and lifecycle state (`suspended` is in the same CHECK constraint as the plan names). Implementation must split these: `subscription_tier` should reference the Base Plan (Layer 1) only; lifecycle state (Trial/Active/Expiring/Grace/Suspended/Reactivated/Cancelled) needs its own column. `subscription_plans.max_branches` already exists in the schema, confirming Layer 3 (Resource Limits) was partially anticipated. Add-ons, per-tenant resource consumption tracking, and the License Engine itself have no schema yet — net new.

**Owner Home:** Milestone 5 (Super Admin Platform) builds and manages the License Engine and plan/add-on catalog. Milestone 2 (Tenant Administration Center) consumes it via the Subscription Center (ADR — see Milestone 2 scope).

---

## ADR-004 — Branch-Ready Architecture (Minimal Viable Addition)

**Date:** 2026-07-31
**Status:** Approved (Product Owner Final Decision — frozen), with one implementation-scope judgment made under this authority (see "Engineering interpretation" below)

**Decision:** The system must be architecturally prepared for multi-branch operation from day one; single-branch clinics automatically use a default branch; no future database redesign should be required to add real multi-branch operation later.

**Engineering interpretation (this ADR's technical scope, not a redesign of the decision above):** live inspection confirms `master_tenants` has no branch concept at all today, and no other table references branches. Satisfying "no future redesign required" does **not** require retrofitting `branch_id` onto every operational table today (patients, appointments, invoices, etc.) — that is a disproportionate change for a forward-looking requirement and would itself violate Minimal Change / Repository First Policy. The minimal viable addition that satisfies the stated requirement: introduce a `branches` table (`id`, `tenant_id → master_tenants`, `branch_name` (+`_ar`), `is_default boolean`, `address`, `phone`, `is_active`, soft-delete) and auto-create exactly one default branch per tenant (retroactively for existing tenants, and going forward inside `create_tenant_with_subscription`). Operational tables remain tenant-scoped as they are today; adding `branch_id` to them is deferred to whichever future milestone actually implements multi-branch operation, at which point the `branches` table already exists and no tenant/branch relationship redesign is needed — satisfying the decision as stated.

**Owner Home:** foundational — recommend this ships early (alongside or just before Milestone 2), since the Subscription Center (Milestone 2) is specified to show "Branch Usage."

---

## ADR-005 — Medical Master Libraries & Procedure/Service Catalog

**Date:** 2026-07-31
**Status:** Approved (Product Owner Final Decision — frozen)

**Decision:** CORE SYSTEM is a Multi-Specialty Medical Platform, not aesthetic-clinic-specific. Two centrally-maintained master libraries, managed by Super Admin:
- **Medical Specialty Library** — internationally recognized specialties; Clinic Admin selects from this list, does not create specialties.
- **Procedure Master Library** — permanent internal ID, international procedure code (where applicable), scientific name, medical name, description, categories, **many-to-many relationship with Medical Specialties** (a procedure may belong to multiple specialties).

**Clinic Procedure Catalog:** Clinic Admin never creates procedures from scratch — always selects from the Master Library, then customizes clinic-facing presentation (price, duration, assigned doctors, rooms, colors, commercial/display name) while the scientific identity is preserved unchanged (example given: "Botulinum Toxin Injection" scientifically, displayed commercially as "Botox Premium").

**Service Catalog:** a Service is a distinct, independent entity from a Procedure — a Service **may bundle multiple Procedures**. This distinction is permanent architecture, not a naming convenience.

**Repository impact:** `clinic_procedures` currently exists as a single flat table (no master-library reference, no specialty relationship, no distinction from "services"). This ADR requires: new `medical_specialties` table (Super-Admin-managed, global), new `procedure_master_library` table (global) with a `procedure_specialty_map` many-to-many join table, `clinic_procedures` reinterpreted as the clinic-level customization layer over the master library (needs a `master_procedure_id` FK added), and a new `services` + `service_procedures` (many-to-many) pair distinct from `clinic_procedures`. This is a substantial schema addition — **not started in any milestone's execution package yet.**

**Owner Home:** this does not fit cleanly into any currently-defined milestone. Recommend it becomes explicit prerequisite scope within Milestone 4 ("Clinical & Business Modules" — previously only vaguely described as "Medical Workflow Completion"), since Billing/Invoicing, Appointments, and Analytics all eventually need to reference real procedures rather than the current flat `clinic_procedures` table. See `MASTER_ROADMAP.md` Milestone 4 update.

---

## ADR-006 — Everything Is a Module Principle

**Date:** 2026-07-31
**Status:** Approved (Product Owner Final Decision — frozen)

**Decision:** The platform is officially module-driven. Every business capability (Patients, Appointments, Queue, Billing, Inventory, Analytics, Follow-up, and future: Radiology, Laboratory, Pharmacy, Prescription, CRM, Marketing, AI) is an independent module. Every module must support: Feature Flag, License Control (ADR-003), Permission Control (ADR-001), Independent Configuration, Independent Activation. Governing statement: **"Everything is a Module. Everything is Licensable. Everything is Permission Controlled."**

**Repository impact:** `feature_flags` table already exists (global or per-tenant, `allowed_tiers` array) — partial groundwork already in place. No module today checks a feature flag or license before rendering — Milestone 3's modules (Patients, Agenda, Queue, Billing, Inventory, Analytics, Follow-up) were specified in `IMPLEMENTATION_PACKAGE_MILESTONE_3.md` against ADR-001 (permissions) only. **This principle is not retroactively applied to the already-issued Milestone 3 package** — doing so now would restart in-flight, already-precise work. Recommend License/Feature-Flag gating is added as a Milestone 3 follow-up hardening pass, or folded into Milestone 6 ("System Integration," which already covers "Full Permission Integration") once the License Engine (ADR-003) actually exists to check against — a module can't validate a License Engine that hasn't been built yet.

**Owner Home:** cross-cutting principle; enforced going forward on every future module (Inventory/Reports/Follow-up in Milestone 3 onward, and all Milestone 4+ modules) once ADR-003's License Engine ships.

---

## ADR-007 — Reports Module (Package 3.1.7) and Reusable Feature Registry

**Date:** 2026-08-05
**Status:** Approved (Product Owner Final Decision — frozen)

**Decision — Reports Module scope:** a single, independent module — a unified viewer for pre-defined reports across other modules, explicitly **not** a new analytics/BI system (that remains Package 3.1.8, unaffected).

- **Flow:** Reports home shows a brief overview, then two cascading dropdowns — select **Module** (only modules the user's tenant has enabled, see Feature Registry below), then select **Report** (only reports defined for that module). Selected report renders in-page with **Print** and **Export PDF** buttons only.
- **Explicitly out of scope:** Excel/CSV export, scheduled reports, email delivery, charts, dashboards, BI, custom report builder, period-comparison features, or anything not listed below.
- **First-version report catalog (18 reports, 3 per module):**
  - **Patients:** Total Patients, New Patients, Active Patients
  - **Agenda:** Total Appointments, Cancelled Appointments, Attendance Rate
  - **Queue:** Waiting Patients, Average Waiting Time, Completed Queue
  - **Billing:** Revenue Summary, Paid Invoices, Outstanding Invoices
  - **Inventory:** Low Stock Items, Inventory Movements, Most Consumed Items
  - **Follow-up:** Scheduled Follow-ups, Completed Follow-ups, Overdue Follow-ups
- **Extensibility requirement:** adding a module or report must be a registry-entry addition, never a redesign — see Package 3.1.7 for the exact registry pattern.

**Decision — Feature Registry (elevated from a Reports-only concern to shared infrastructure):** the Owner's requirement that the module list be subscription-aware, not hardcoded, is implemented now — not deferred — by building the **read side** of feature-flag checking against the `feature_flags` table (already exists in the schema since before Milestone 3, currently unused by any code). This is a deliberately small, contained piece of Milestone 5/6 infrastructure pulled forward:

- New function `isFeatureEnabled(tenantId, moduleKey)`: checks `feature_flags` for a matching `flag_key` that is either global (`tenant_id IS NULL`) or tenant-specific, `is_enabled = true`.
- **Seed data, not new subscription logic:** insert one globally-enabled (`tenant_id = NULL, is_enabled = true`) row per module key (`patients`, `agenda`, `queue`, `billing`, `inventory`, `followup`) — this preserves today's behavior exactly (every tenant sees every module they have permission for) while making the check real rather than hardcoded.
- **Reusable beyond Reports:** any future module list (navigation, dashboard widgets) can call the same function without new infrastructure once real per-tenant/per-plan flags are needed — that becomes a data change (update rows in `feature_flags`), not a code or architecture change, satisfying the "no redesign to add a module" requirement directly.
- **Explicitly not built now:** the License Engine (ADR-003) itself, plan-to-feature mapping, or any UI for Super Admin to manage flags — the table and a read function are enough for this decision's scope.

**Consequence:** Reports' module dropdown filters by both permission (`hasPermission`) and feature flag (`isFeatureEnabled`) — two independent, already-existing mechanisms combined, no new permission keys needed. `reports:read` (added Session 1) continues to gate the Reports route itself, exactly as `navigationRegistry.ts` already specifies.
