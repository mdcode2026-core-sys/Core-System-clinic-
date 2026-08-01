# MASTER_ROADMAP.md

> CORE SYSTEM — ClinicSaaS™ Multi-Tenant Platform
>
> **This document supersedes `PRODUCT_COMPLETION_ROADMAP_V2.md` (archived).** Content is preserved; this version adds a reconciled progress record and documents the Section 8–16 gap explicitly rather than leaving it unmarked.
>
> Status: APPROVED (architecture) · Milestone 3 confirmed as current (ADR-002)
> Version: 3.0 (supersedes v2.0)
> Last Updated: 2026-07-31

---

## Progress to Date (reconciled from `CORE_SYSTEM_INDEX.md` Phase history + this audit)

The prior Phase-numbered tracking in `CORE_SYSTEM_INDEX.md` and the Milestone-numbered roadmap below describe the same project on two different axes. This section is the single reconciled status going forward:

| Roadmap Item | Prior "Phase" name | Status |
|---|---|---|
| Milestone 1 — Core Foundation | Phase 1 — Core Platform | ✅ Closed |
| *(within Milestone 1 scope)* | Phase 2 — Patients | ✅ Closed |
| *(within Milestone 1 scope)* | Phase 5 — Invoicing | ✅ Closed |
| *(within Milestone 1 scope)* | Phase 1A — Analytics Engine | ✅ Closed (2026-07-30) |
| *(within Milestone 3 scope, not a separate milestone)* | Phase 3 — Agenda | 🟡 ~85% |
| *(within Milestone 3 scope, not a separate milestone)* | Phase 4 — Queue | 🟡 ~85% (verification pending — see `PROJECT_HANDOFF.md` Open Item #1) |
| Milestone 2 — Tenant Administration Center | Phase 6 — Settings Dashboard | ❌ Not started — content gap, see below |
| Milestone 3 — Unified Workspace | *(new grouping, not previously tracked as one phase)* | Planned — **current milestone (ADR-002)** |

**Documented gap (EN-001):** Sections 8–16 of this roadmap — which by numbering and by the "Tenant Administration Center — Next Milestone" status previously recorded should specify Milestone 2 in full (Objective, Architecture, Modules, Acceptance Criteria, matching the structure Milestone 3 uses below) — are not present in the canonical copy of this document. This is recorded as an open gap, not silently omitted. When available, Milestone 2 will be inserted here in full, in the same structure as Milestone 3.

---

# 1. Purpose

This document defines the official roadmap for completing the CORE SYSTEM platform after the successful completion of the Foundation and Analytics phases.

This roadmap replaces previous implementation sequencing where necessary and establishes the official development direction for the remaining product.

The objective is to provide a scalable, maintainable, permission-driven SaaS platform that can support clinics of different sizes without requiring architectural redesign.

---

# 2. Product Philosophy

CORE SYSTEM is **not** built around fixed employee roles.

Instead, it is built around:

- Tenant Ownership
- Permission Engine
- Configurable Workspaces
- Dynamic User Experience

Every clinic has complete control over configuring its own operational environment while remaining isolated from all other tenants.

**Current implementation status of this principle (added by this audit):** the live application is currently role-based (4 hardcoded roles, both in application code and in the `clinic_users.role` database constraint). ADR-001 documents the approved path to reconcile this with the principle above — extending the existing but unused `roles`/`permissions`/`role_permissions` schema rather than a full rewrite. See `ARCHITECTURE_DECISIONS.md`.

---

# 3. Architectural Principles

The following principles are mandatory.

## 3.1 Single Tenant Ownership

Each clinic represents one Tenant. Each Tenant owns: Users, Configuration, Business Rules, Operational Settings, Clinic Data. No Tenant may access another Tenant's data.

## 3.2 Platform Ownership

The platform itself is owned exclusively by Super Admin. Super Admin controls: Platform, Subscriptions, Plans, Tenants, Global Monitoring, Platform Configuration. Super Admin never participates in clinic daily operations.

## 3.3 Clinic Ownership

Each Tenant has exactly one Clinic Owner (Clinic Admin), responsible for managing users, configuring the clinic, defining permissions, managing templates and operational settings. Clinic Admin represents the highest authority inside the clinic.

## 3.4 Permission Driven Architecture

The system shall never depend on hardcoded employee roles. Every screen, menu, button and operation must be driven by permissions. Permissions become the single source of truth for the UI.

## 3.5 Dynamic Workspace

The application shall expose one unified workspace. The visible interface is dynamically generated according to the authenticated user's permissions. Different users may see different interfaces while sharing the same application.

## 3.6 Template Based Configuration

User Templates exist only as productivity accelerators — starting points, never mandatory. Every template can be modified by the Clinic Admin.

---

# 4. User Model

## 4.1 Super Admin
Platform Owner: Platform Administration, Tenant Management, Subscription Management, Global Monitoring, System Configuration.

## 4.2 Clinic Admin
Clinic Owner: Clinic Configuration, User Management, Permission Management, Workspace Management, Operational Administration. Complete authority inside the tenant boundary.

---

# 5. Standard Users

All remaining accounts are simply Users. The system does not require fixed business roles — every user receives permissions assigned by the Clinic Admin. Optional templates may be used during account creation.

Default templates include: Doctor, Reception, Accounting (including Inventory).

The Clinic Admin may also create, duplicate, modify, remove custom templates, and assign templates as defaults. Templates never restrict future customization.

---

# 6. Milestone Status

See "Progress to Date" at the top of this document for the reconciled, current status table.

---

# 7. Milestone 1 — Core Foundation

**Status: COMPLETED**

Completed Scope: Authentication, Multi-Tenant Infrastructure, Dashboard Foundation, Analytics Engine, KPI Engine, Shared UI Components, Responsive Foundation, RTL Support, Build Stabilization, TypeScript Stabilization, Lint Stabilization.

This milestone is officially closed and considered the foundation for all remaining development.

---

# [GAP — Milestone 2: Tenant Administration Center]

**Sections 8–16 are not present in this document.** Per EN-001, this content — objective, architecture, modules, UX principles, design requirements, and acceptance criteria for Milestone 2 — is pending. Do not plan or execute Milestone 2 work from assumptions; wait for this section to be supplied and inserted here in full.

---

# 17. Milestone 3 — Unified Workspace

**Status: PLANNED — Confirmed as current milestone (ADR-002)**

## 17.1 Objective

The Unified Workspace is the operational environment used by all clinic users. Unlike traditional systems, CORE SYSTEM does not create separate applications for Reception, Doctor, Accounting or future departments. Instead, every authenticated user enters the same workspace, dynamically generated according to the permissions assigned by the Clinic Admin. This architecture eliminates duplicated development while providing complete flexibility for every clinic.

**Engineering note (added by this audit):** as documented in "Progress to Date" above, several of the modules below already exist in substantial form (Patients, Agenda, Invoicing, Analytics — closed or ~85%). Milestone 3 execution is therefore largely a **migration and consolidation** of these existing modules into the new permission-driven shell, not a from-scratch build of all nine modules. See the Software Engineering Execution Plan for Milestone 3.

# 18. Workspace Architecture

The Unified Workspace is composed of reusable application modules. Each module is permission-driven. Visibility, navigation and available actions are determined exclusively by the Permission Engine. No module shall depend on hardcoded employee roles.

# 19. Workspace Modules

**Dashboard** — personalized overview (Daily Summary, Assigned Tasks, Notifications, Personal Statistics, Quick Actions), dynamically generated widgets.

**Patients** — Search, Registration, Profile, Medical History, Attachments; operations depend on permissions. *(Already built — see Progress to Date.)*

**Appointments** — Daily Schedule, Calendar, Booking, Rescheduling, Cancellation. *(Already ~85% built as "Agenda" — see Progress to Date.)*

**Queue** — Waiting Queue, Check-in, Check-out, Queue Status, Queue Actions. *(Already ~85% built — see Progress to Date and `PROJECT_HANDOFF.md` Open Item #1.)*

**Billing** — Invoice Creation, Payments, Refunds, Receipts; financial privileges controlled by the Permission Engine. *(Already built as "Invoicing" — see Progress to Date; note no dedicated refund table exists, see `DATABASE_SCHEMA.md`.)*

**Inventory** — Stock Overview, Consumption, Product Availability; configurable permissions. *(Only a consumption ledger exists — see `DATABASE_SCHEMA.md`; stock/catalog model is net-new work.)*

**Reports** — operational reports based on assigned permissions, dynamic visibility. *(Not started — report catalog undefined, needs confirmation before execution.)*

**Analytics** — KPI dashboards per user authorization. *(Already built — extend, don't rebuild, per the Milestone 3 execution plan.)*

**Follow-up** — post-visit patient follow-up: Follow-up List, Scheduled Follow-ups, Follow-up Status (initial scope only; may expand later without architectural redesign). *(Database already fully modeled — see `DATABASE_SCHEMA.md`; no domain layer or UI yet.)*

# 20. User Experience Principles

**Single Workspace** — all users access the same application, adapting per permissions.
**Dynamic Navigation** — menus generated dynamically; unauthorized modules never accessible.
**Consistent User Experience** — identical interface patterns; only available capabilities differ.
**Responsive Design** — Desktop, Tablet, Mobile all mandatory.
**RTL / LTR** — full support for Arabic (RTL) and English (LTR); configurable through tenant settings.

# 21. Design Requirements

Every module must implement: Loading States, Empty States, Error States, Form Validation, Responsive Layout, Accessibility Standards, Audit Logging (where applicable — use the existing `audit_trail` table, see `DATABASE_SCHEMA.md`).

# 22. Milestone Acceptance Criteria

Milestone 3 is complete only when: Unified Workspace is operational; Navigation is dynamically generated; Permission Engine controls all modules; Templates correctly generate user workspaces; all operational modules function correctly; Responsive support is complete; RTL/LTR support is complete; Build passes with zero TypeScript/Lint errors; Documentation and Handoff are updated.

**Note (added by this audit):** "Templates correctly generate user workspaces" can only be verified via direct seed-data assignment until Milestone 2 (Tenant Administration Center / Settings Dashboard) delivers the actual admin UI for assigning templates — see ADR-001 and the Milestone 3 Execution Plan.

# 23. Remaining Product Roadmap

**Milestone 4 — Clinical & Business Modules:** Medical Workflow Completion, Accounting Enhancements, Reporting Expansion, Follow-up Enhancements.

**Milestone 5 — Super Admin Platform:** Platform Administration, Tenant Management, Subscription Management, Global Analytics, Feature Flags, Monitoring, System Health. *(Underlying tables `subscription_plans`, `feature_flags`, `billing_events`, `tenant_devices` already exist — see `DATABASE_SCHEMA.md`.)*

**Milestone 6 — System Integration:** Full Permission Integration, Navigation Integration, Cross-module Communication, Audit Trail, Notifications, Realtime Integration, Error Handling. *(Underlying `notification_queue` table already exists.)*

**Milestone 7 — Production Readiness:** Performance Optimization, Security Review, Unit/Integration/E2E Testing, Final QA, Release Candidate, Production Deployment. *(Note: no testing framework is currently configured anywhere in the repository — see Milestone 3 Execution Plan Repository First Policy findings.)*

# 24. Milestone Transition Policy

No milestone may begin until the current milestone is officially closed. A milestone is closed only when: Successful Production Build; Zero Lint Errors; Zero TypeScript Errors; Acceptance Criteria Fully Met; API Integration Completed; Permission Model Applied; Documentation Updated; Architecture Documents Updated; Project Tree Updated (if affected); Handoff Report Completed; Final Engineering Review Approved.

# 25. Final Statement

This roadmap represents the official product completion strategy for CORE SYSTEM. All future implementation, architectural decisions, software engineering tasks and development planning shall follow this roadmap unless an officially approved architectural revision supersedes it. Any implementation that conflicts with this roadmap requires explicit architectural approval before execution — recorded as an ADR in `ARCHITECTURE_DECISIONS.md`.
