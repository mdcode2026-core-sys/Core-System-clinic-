# MILESTONE_2_SCOPE_PROPOSAL.md

**Status: APPROVED SCOPE (as of 2026-07-31)** — confirmed by the Product Owner's Final Product & Architecture Decision. Module #4 below is now fully specified (superseding the earlier read-only draft) per ADR-003. This document is now the basis for `IMPLEMENTATION_PACKAGE_MILESTONE_2.md`, which follows as the next deliverable — see the note at the end of this document on what remains before that package can be written with the same rigor as Milestone 3's.

**Resolution of the four open questions from the original draft:**
1. Module breakdown — confirmed, with Module #4 now expanded per the new directive.
2. Permission & Template Management shipping first — confirmed; no objection raised, and Milestone 3's acceptance criteria structurally depend on it.
3. Subscription module scope — resolved: **not read-only.** It is a full Subscription Center (see Module #4), but plan/tier changes flow through an **Upgrade Request** (routed to Super Admin / sales), not direct self-service checkout — consistent with a consultative rather than instant-checkout upgrade path.
4. Roadmap Sections 8–16 (EN-001) — still unresolved, no new information. If found later, reconcile against this approved scope rather than silently overriding it.

**Sources used:** `MASTER_ROADMAP.md` Section 4.2 (Clinic Admin responsibilities: Clinic Configuration, User Management, Permission Management, Workspace Management, Operational Administration) + `CORE_SYSTEM_INDEX.md`'s "Phase 6 — Settings Dashboard" expected areas (Clinic profile, User management, Subscription settings, Notification preferences, System preferences) + one confirmed repository fact: `src/app/(dashboard)/settings/page.tsx` already exists as a non-functional two-field mockup — a starting stub, not a spec.

---

## Proposed Modules

### 1. Clinic Profile
Clinic name (+ Arabic), logo, contact info, address, timezone, currency — maps directly to existing `master_tenants` columns (already confirmed in `DATABASE_SCHEMA.md`, no new table needed). Replaces the current stub in `settings/page.tsx`.

### 2. User Management
List/create/deactivate `clinic_users`; assign a role/template to each user. This is the natural home for the "assign template" action that Milestone 3's Permission Engine (ADR-001) built the backend for but has no UI to drive.

### 3. Permission & Template Management — **the module Milestone 3 is functionally waiting on**
View the system templates (Doctor/Reception/Accounting), create/edit custom tenant-specific templates (`roles.is_system_role = false` rows — schema already supports this per `DATABASE_SCHEMA.md`), and grant/revoke individual permission overrides per user (`clinic_user_permission_overrides`, the one new table Milestone 3's Package 3.0.1 creates). **Recommend this module ships first within Milestone 2**, since `MASTER_ROADMAP.md` Section 22's acceptance criterion "Templates correctly generate user workspaces" cannot be fully verified through a real UI until this exists.

### 4. Subscription Center (full scope per ADR-003, supersedes the earlier read-only draft)
Clinic Admin sees: Current Plan, License Information, Remaining Trial/Subscription Days, Enabled Features, Purchased Add-ons, Resource Consumption (users/branches/storage usage against limits), Upgrade Requests (submits a request — does not self-checkout a plan change), Payment History, Invoice History. Reads from `master_tenants`, `subscription_plans`, and the new Add-on/Resource-Limit/License Engine schema introduced by ADR-003 (not yet built — see Milestone 5). Delegated users may receive subscription notifications but cannot manage subscriptions unless explicitly permitted (ties into the Permission Engine from Milestone 3/ADR-001). **Blocked today by the missing `subscription_plans` RLS policy** — see `SECURITY_HOTFIX_MIGRATION.sql` Phase C, still pending your decision on read visibility.
**Sequencing note:** this module's full functionality depends on Milestone 5's License Engine existing. Recommend Milestone 2 ships this module's UI against `master_tenants`/`subscription_plans` data that already exists (Current Plan, Remaining Days, Payment/Invoice History via `billing_events`), with Add-ons/Resource-Consumption/License-derived views following once Milestone 5's schema lands — rather than blocking this entire module on Milestone 5 completing first.

### 5. Notification Preferences
Per-tenant toggle for which `retention_followups` channels (WhatsApp/SMS/Email) are active — ties directly into the already-built `retention_followups`/`notification_queue` tables and Milestone 3's Follow-up module.

### 6. System Preferences
Default language/direction (RTL/LTR — `master_tenants` already needs this column per `SECURITY_HOTFIX_MIGRATION.sql` Phase D discussion... actually confirm: does `master_tenants` have this today, or does it need adding?), timezone, currency — some overlap with #1, propose merging into Clinic Profile rather than a separate screen unless you want them kept apart.

---

## What's Needed Before `IMPLEMENTATION_PACKAGE_MILESTONE_2.md`

Milestone 3's implementation package was accurate because every path/table/permission-key in it was verified against the live repository first. The same rigor is owed here before Kimi receives Milestone 2's package. Two things remain, both mechanical, not open decisions:

1. **Repository verification pass** specific to Modules #1–#6 above — confirm exact existing file paths (e.g., does anything beyond the `settings/page.tsx` stub already exist for User Management or Subscription display?), and finalize the exact new-table DDL for `clinic_user_permission_overrides` (already specified in `IMPLEMENTATION_PACKAGE_MILESTONE_3.md` Package 3.0.1 — Module #3 here consumes it, doesn't redefine it), plus the `branches` table (ADR-004) and the `subscription_tier`/lifecycle-state split (ADR-003) this milestone's Subscription Center will read from.
2. **Sequencing decision already made above** (Module #4 ships against existing data now, Add-ons/License-derived views follow Milestone 5) — carried into the package as written, not re-asked.

This verification pass is the next piece of work, producing `IMPLEMENTATION_PACKAGE_MILESTONE_2.md` with the same path-exact, zero-ambiguity standard as Milestone 3's.
