# CORE SYSTEM — Design / UX / Architecture Constitution
## Version 1.0 — 2026-09-14

**Status:** DRAFT — requires explicit Product Owner approval before implementation.
**Authority:** Governing semantic/product/UX/architecture constitution derived from the closed 2026-09-14 investigation and reconciled against current PJ/AJM/UX/repository evidence.

> This document defines governing meaning. It does not claim runtime or production closure.

## 1. Product Identity
CORE SYSTEM is a **Clinic Operating System + Medical CRM + Business Intelligence** platform. It is not booking-only, a sales CRM, or the former Clinic Evaluator product.

Initial focus: aesthetic, dermatology, laser, skin/beauty/cosmetic medical clinics. The architecture must remain extensible to broader medical centers and Arabic/international scale.

Core architecture: **Independent Modules + Integrated Platform**. Each domain has clear ownership; integration occurs through explicit relationships, events, requests and shared authoritative records where justified.

## 2. Constitutional Principles
1. Semantic ownership before implementation.
2. Simple user-facing surfaces; complexity belongs behind the appropriate domain.
3. Role, permission, entitlement, workspace and skill are distinct concepts.
4. Inspect → Reuse → Extend → Create only when required.
5. No duplicate domain, database, workflow, authorization or engine.
6. Administrative mutations require server authorization and auditability.
7. Runtime/live state outranks assumptions where current-state claims matter.
8. Extensibility must solve a demonstrated need; no speculative architecture.
9. Closure requires evidence appropriate to the claim.
10. Documentation must distinguish planned, implemented, runtime-verified and production-verified states.

## 3. Evidence Classes
- **PROVEN:** directly verified by the appropriate source.
- **STRONG EVIDENCE:** supported by multiple independent sources.
- **PROBABLE:** strong interpretation requiring confirmation.
- **UNVERIFIED:** insufficient evidence.
- **NOT A PROBLEM:** investigated with no sufficient defect evidence.
- **DOCUMENTATION-ONLY:** documented but not runtime-proven.

Never convert documentation into runtime proof, screenshots into backend proof, code paths into production proof, or assumptions into product decisions.

## 4. Core Invariants
```text
Role ≠ Permission
Permission ≠ Entitlement
Workspace ≠ Security Boundary
Widget ≠ Permission
Visibility ≠ Authorization
Home ≠ Workspace
My Workspace ≠ Role Workspace
Calendar ≠ Agenda
Patient ≠ Patient Journey
Appointment ≠ Agenda
Chat ≠ Separate Communications Engine
Clinic Admin ≠ Super Admin
Administrative Intervention ≠ Invisible Mutation
```

## 5. User Surface Hierarchy
Conceptual ordinary-user hierarchy:
```text
LOGIN → HOME → WORKSPACE / ROLE WORKSPACE ENTRY → MY WORKSPACE → MODULES / DOMAINS → MY SETTINGS
```
`/workspace` is a resolver/entry route, not an additional workspace category. Header is persistent global access and is distinct from Home and Workspaces.

## 6. Role / Permission / Workspace / Entitlement
**Role:** organizational/professional identity.
**Permission:** authorization to perform an action/capability.
**Primary Work Context:** principal professional working classification.
**Role Workspace:** primary professional environment associated with that context.
**My Workspace:** personal work/presentation surface.
**Entitlement:** tenant-level capability availability.

Additional permissions must not silently redefine Primary Role, Primary Work Context or Role Workspace. Authorized additional capabilities may appear through Sidebar, Widgets, My Workspace or permitted actions.

## 7. Home
Home is an independent **personal-context + global-awareness** surface. It is not the primary professional work engine.

May contain current context, daily awareness, selected Calendar information, lightweight utilities, selected shortcuts/actions, user-selected permitted widgets and governed platform content.

Must not become the full Clinical/Operational Workspace, Queue, Agenda, Communications, Notifications center, Work Center or a second analytics/workflow engine.

Home can say what needs attention or route the user; the authoritative Domain/Workspace performs the actual work.

Customization is controlled, not unlimited.

## 8. My Workspace
My Workspace is the user's personal working surface. It is account-level, distinct from Home and Role Workspace, exists even without a Role Workspace, has default work-relevant widgets, is extensible and customizable within product rules.

Personalization changes presentation only; it never grants authorization. It may surface authorized capabilities outside the primary work classification.

## 9. Role Workspace
Role Workspace is the primary professional work environment when the role requires one. Examples include Clinical, Operational and Administration-oriented workspaces.

Not every role requires one. It is not authentication, authorization, a replacement for Modules, or a replacement for My Workspace.

Stability rule:
```text
Primary Role → Primary Work Context → Role Workspace

Effective Permissions → Authorized Capabilities → Sidebar / Widgets / My Workspace
```

## 10. Administrative Workspace
Administrative Workspace is an intentional exception: **Management + Oversight + Intervention Control Center**. It is not merely another Role Workspace and not merely a widget dashboard.

Clinic Admin may oversee active/working clinic accounts where appropriate. For users with Role Workspaces, oversight may include close-to-real-time visibility for relevant Clinical/Operational work. For users without Role Workspaces, do not invent a fake workspace; expose relevant results, tasks, outcomes, pending/overdue work, requests and performance/operational outputs where appropriate.

Administrative intervention is allowed only where authority permits and must be auditable: actor, action, affected record/work, time, previous state, new state, and reason/context where required.

## 11. Super Admin / Platform Boundary
Super Admin operates at platform level, not as a clinic operator. Clinic Admin operates within a tenant.

The architecture must anticipate a future Super Admin Panel/Workspace and platform-owned content such as announcements, media, banners, platform information, partner/pharmaceutical/insurance opportunities and entitlement-aware targeting.

The final official name, targeting model and implementation of platform-owned content remain OPEN decisions and must not be invented here.

## 12. Patient / Patient Journey / Patient Flow
**Patient** identifies the person. It does not own scheduling, availability, queue state, visit lifecycle, treatment-plan execution or follow-up execution.

**Patient Journey** describes what happens to the patient through time and remains broader than the live internal visit flow.

Approved operational flow remains:
```text
Scheduled / Walk-in → Arrived → Waiting → With Doctor → Pending Close → Reception → Completed
```

Additional states require real workflow justification.

Clinical work belongs to the actual Visit. Doctor flow: Examine → Decision → Finish Examination → Reception Workflow. Reception owns operational drag/drop and completion continuation.

Treatment Plan is optional; a Visit remains valid without one. Photos are non-blocking where applicable. Automated Follow-up is a CORE capability. Patient Portal remains entitlement-controlled/future-gated according to current PJ authority.

## 13. Navigation
Sidebar represents authorized Domain/Module entry, not security. Primary work context must not hide an otherwise authorized Domain merely because it belongs to another functional area.

Do not create artificial classification duplicates such as `My Financial` or `My Agenda` merely to represent cross-domain permissions.

## 14. Communications / Chat / Notifications
**Communications** is general internal clinic-wide communication across authorized clinic accounts: Clinical, Operational, Administration, accounting, follow-up, reception, nursing, assistants and other applicable functions. It is not doctor-only.

**Chat** is a compact interaction surface over the authoritative Communications domain. It must not create a parallel database, conversation engine, participant engine, permission model or messaging system.

**Notifications** remains distinct from Communications and Follow-up. Header Notifications is the global access point to the user's notification feed/unread state. Home may summarize actionable notifications but never becomes the notification store.

## 15. Agenda / Calendar / Appointment
Agenda is the authoritative planning/availability domain. It may include appointments, provider availability, leave, vacations, conferences, blocked/unavailable periods, resources and planning events affecting availability.

Appointment is a scheduled booking within its domain. Calendar is a visual/operational representation consuming authoritative planning data.

Calendar must not become a second scheduling engine. Quick Appointment, Quick Patient File and personal administrative requests are entry surfaces into authoritative domains.

A user may request leave/departure; the user must not approve their own request. Approval belongs to the appropriate administrative authority.

## 16. Dashboard / Overview / Analytics
Do not automatically merge these surfaces.
- **Workspace:** everyday work.
- **Overview:** contextual summary.
- **Dashboard:** management/monitoring.
- **Analytics:** deeper analysis/intelligence.

The exact UI boundary remains an OPEN item until verified in the product UX stage.

## 17. Financial & Resources / Inventory
Inventory belongs under Financial & Resources. Canonical direction: `/financial-resources/inventory`. A temporary compatibility route may remain where required. Do not create a second Inventory domain.

## 18. Visual / Experience Governance
CORE SYSTEM has a UI foundation: shared Header/Sidebar, primitives, semantic color tokens and i18n RTL/LTR. The gap is product-wide governance, not absence of a Design System.

Future visual work must govern semantic typography, spacing, radii, elevation, surfaces, colors, page widths, states and responsive behavior consistently. Local styling decisions must not silently redefine product language.

A screenshot regression system has not been proven; treat visual-regression governance as a product-wide governance gap until verified.

Accessibility is a constitutional requirement: keyboard access, focus visibility, semantic controls, readable hierarchy, contrast, RTL/LTR correctness, responsive behavior and non-color-only meaning must be considered in applicable work.

## 19. Authorization / Auditability
UI visibility is never authorization. Server-side authorization remains authoritative. Widgets and workspaces never grant permissions.

Administrative intervention must satisfy:
```text
Administrative authority + Server authorization + Audit trail
```

Tenant isolation must be preserved for all tenant-owned records and cross-domain relationships.

## 20. Extensibility / Anti-Duplication
Before creating anything:
```text
Inspect → Reuse → Extend → Create
```

No parallel engines for Chat, Agenda, Calendar, Patient Journey, Follow-up, Treatment Plan, permissions, authorization or Inventory.

Dead/legacy code is not deleted blindly. Prove unused → assess references/docs → controlled cleanup.

## 21. Live Database Rule
Repository migrations alone cannot prove production schema. DB work requires live Supabase inspection when the claim concerns current production state; reconciliation with repository migrations; canonical-schema identification; migration only when required; migration-application verification; and runtime verification.

## 22. Conflict Resolution
Authority order for future work:
1. Explicit current Product Owner decision.
2. Approved Constitution/Contract.
3. Current authoritative PJ/AJM/UX documents.
4. Verified current repository implementation.
5. Live runtime/database evidence for runtime claims.
6. Historical documentation.

A genuine product/architecture contradiction must STOP implementation and be presented as a clear decision request. Do not silently resolve it.

## 23. Open Decisions — Not Product Decisions Yet
- Administrative Workspace information architecture and exact role representations.
- Outcome/result model for users without Role Workspaces.
- Final platform-content name, targeting and entitlement implementation.
- Exact Home ordering/visual hierarchy.
- Dashboard vs Analytics UI boundary.
- Work Center vs My Workspace boundary.
- Final visual token taxonomy and semantic mapping.
- Visual regression tooling.
- Super Admin Workspace scope/modules.

## 24. Non-Supported Directions
No full rebuild; no Home/My Workspace collapse; no My Workspace/Role Workspace collapse; no Role Workspace for every role; no conversion of Administrative Workspace into a normal Role Workspace; no Calendar scheduling engine; no doctor-only Communications; no independent Chat engine; no permission/workspace coupling; no mandatory Treatment Plan; no giant Patient Journey domain; no revival of dead permission systems.

## 25. Constitutional Status
This Constitution becomes governing only after explicit Product Owner approval. Approval authorizes governance, not implementation of every open item.

**End of Constitution.**
