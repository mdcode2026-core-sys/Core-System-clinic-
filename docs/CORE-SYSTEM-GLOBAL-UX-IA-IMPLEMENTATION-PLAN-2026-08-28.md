# CORE SYSTEM — Global UX / Information Architecture Reorganization
## Approved Implementation Plan — 2026-08-28

**Status:** APPROVED EXECUTION PLAN — PRE-IMPLEMENTATION

This plan governs the implementation of the approved Global UX / IA decisions. It is not a redesign from zero and it does not authorize removal of capabilities merely for simplification.

## 1. Governing principles

**READ → INSPECT → MAP → RECONCILE → IMPLEMENT → RUNTIME VALIDATE → DOCUMENT → CLOSE**

Always use:

**Inspect → Reuse → Extend → Reconcile → Create**

Create nothing new when an existing correct implementation can be reused or extended. Do not use visual hiding, duplicate wrappers, temporary redirects, conditional hacks, or other patches instead of correcting the root cause.

The governing product principle remains:

**Independent Modules + Integrated Platform**

UX changes must not transfer Domain ownership, create duplicate Domains or business logic, weaken authorization, tenant isolation or auditability, or redefine Patient Journey ownership.

## 2. Approved user model

A user is a member of the clinic team assigned a role for organizational purposes and granted permissions according to Clinic Admin's view of the clinic's actual work.

**Role ≠ Permission.** Clinic Admin may grant any available permission to a user regardless of whether that permission is conventionally associated with the user's role. Clinic Admin controls user and role configuration within the available system permissions and non-bypassable security rules.

Role Templates are advisory starting points. They are editable, reusable and do not restrict Clinic Admin from creating new roles.

## 3. Approved user surfaces

### Sidebar

The Sidebar exposes the user's authorized capabilities and remains the complete navigation surface. It is not merely a collection of Workspace shortcuts.

A route does not automatically become a top-level Sidebar item. Navigation hierarchy follows user mental model, Domain ownership and workflow.

### Workspace

Workspace is the user's primary working surface. It is not merely an Overview, is not a Dashboard, is not a security boundary and is not a fixed Clinical/Operations/Administrative classification for the whole application.

The user has a Workspace tailored to their authorized capabilities and can personalize it.

The previous model of three fixed global user Workspaces is superseded by this decision. This does not remove the three approved Patient Flow interfaces.

### Workspace personalization

The user can add, remove, reorder and drag/drop Widgets that are available to them through their permissions. The user can arrange the Workspace according to personal working frequency and restore the default Workspace.

The system provides a useful default Workspace rather than an unexplained blank screen.

### Widgets

Widgets are reusable capabilities/surfaces independent from any one Workspace. They may be informational, actionable, operational or contextual. They are not restricted to Overview information.

Each Domain must be assessed individually. Some Domains need executable Widgets; some need informational Widgets; some may not need Widgets at all.

A Widget never grants permission. The binding relationship is:

**Permission → Widget availability → User chooses Widget → Widget appears in Workspace**

Removing a permission removes the user's ability to use the protected capability even if the Widget had previously been configured.

Widgets may also be exposed in the user's Sidebar where that improves discoverability or direct access. This does not make Widgets a replacement for the full capability/page.

### Quick Actions

Simple frequent actions may be represented as Quick Actions instead of large Widgets. Quick Actions are also permission-dependent and cannot create authorization.

## 4. Patient Flow and Queue

Patient Flow remains an independent system and remains a named Sidebar item **Patient Flow** when explicitly enabled and authorized.

Patient Flow is not absorbed into Workspace, is not replaced by Widgets and is not removed. The existing Queue, drag-and-drop movement and visit flow must be inspected and reused/reconciled rather than rebuilt without evidence.

Patient Flow has exactly three approved interface variants:

1. **Operations** — operational/reception-facing patient movement.
2. **Clinical** — clinical-facing patient movement.
3. **Administrative** — full patient-flow visibility and operational control for authorized administrative users.

Patient Flow must not appear merely because a user's role or Workspace is Operations or Clinical.

For Patient Flow to appear, Clinic Admin must explicitly enable it for the relevant user/role, the user must have the required permission, and the appropriate interface context must be selected.

Therefore an Operations-oriented user may have no Patient Flow. Example: an accountant can have an Operations Workspace and financial permissions while Patient Flow remains absent.

Queue remains part of Patient Flow. Queue Widgets may surface authorized information/actions but never replace the full Patient Flow system.

## 5. Dashboard and Overview

**Dashboard ≠ Workspace.**

Dashboard is an administrative/management monitoring surface. It is available to Clinic Admin and users delegated the relevant authority through the existing permission model. Clinic Admin retains visibility into the full system according to the approved authorization model.

Overview is a contextual summary surface for Status, Summary, Attention and KPI information appropriate to its Domain. It must not become a second copy of the Workspace or the entire Domain.

## 6. Patient Context

CORE SYSTEM should reduce unnecessary navigation through contextual navigation around the patient and related records while preserving Domain ownership and permissions.

Where authorized, patient context may provide direct access to Visits, Appointments, Treatment, Financial, Follow-up, Communication, Medical records/files and Patient Portal.

Patient Context is not a new Domain.

## 7. Global Search

CORE SYSTEM must provide true Global Search from a consistent location. It searches authorized data across the system rather than only the current page or Domain.

It must support, where available and authorized, patient name/number/phone, doctor/staff, invoice/payment, financial plan/installment, appointment, treatment plan, service/procedure, inventory item, supplier/purchase order, task/request/communication and relevant records/events.

Results must identify type and context and allow direct navigation.

Global Search must preserve tenant isolation, permissions, privacy and authorization and must work in Arabic and English.

## 8. Execution stages

### Stage 0 — Baseline and implementation lock

Inspect repository, database, runtime, navigation, Workspaces, Widgets, Patient Flow/Queue, Dashboard/Overview, roles, permissions, feature flags and legacy implementations. Produce the current-state and conflict/duplication maps. Do not delete anything solely because it looks old.

### Stage 1 — Navigation and Information Architecture reconciliation

Map every relevant Sidebar item, route and page as Domain, sub-area, feature, configuration, operation, contextual feature, Patient Flow or Workspace capability. Reconcile duplicate and inappropriate navigation without deleting legitimate capabilities.

### Stage 2 — Permission-to-user-surface reconciliation

Make effective permissions the authoritative input to visible capabilities. Verify mixed permission combinations, including non-conventional combinations such as reception + financial and clinical + administrative. Do not change the authorization model.

### Stage 3 — Workspace foundation

Inspect and reuse the existing Workspace implementation and persistence where correct. Establish default and personalized Workspace behavior without creating a second Workspace system.

### Stage 4 — Widget foundation and personalization

Inspect all current Widgets. Classify them as information, action, operational, contextual or unsuitable as Widgets. Define required permissions and contexts. Implement selection, removal, ordering, drag/drop, persistence and reset-to-default using existing infrastructure where possible.

### Stage 5 — Domain-by-Domain Widget classification

For each Domain inspect daily workflows, frequent/urgent actions, information requiring quick visibility, contextual actions and full-page functions. Build Widgets only where they materially improve work. Do not force every Domain to have Widgets.

### Stage 6 — Patient Flow and Queue reconciliation

Inspect the existing Patient Flow, Queue, drag/drop behavior, arrival/start/end visit path, reception/clinical/administrative interfaces, saved states, permissions and mobile behavior. Preserve the existing system and reconcile it with the approved three-interface model.

### Stage 7 — Patient Flow and Workspace integration

Surface relevant authorized Patient Flow information/actions in Workspace through Widgets or Quick Actions where useful. Workspace surfaces must never grant Patient Flow access.

### Stage 8 — Patient Context and contextual navigation

Implement/reconcile contextual links and actions around patient, visit and related records. Every action remains permission-filtered.

### Stage 9 — Global Search

Inspect existing search and reuse where correct. Establish one consistent Global Search entry point, multi-entity results and direct navigation while enforcing tenant isolation, authorization and privacy.

### Stage 10 — Dashboard and Overview reconciliation

Audit every Dashboard and Overview. Separate management/monitoring from contextual summary and from operational work/data entry. Move only demonstrably misplaced functions using authoritative existing implementations.

### Stage 11 — Final Sidebar reconciliation

After Workspace, Widgets and contextual navigation are established, reconcile Sidebar entries. Remove proven duplicates, legacy registrations and inappropriate top-level items while retaining full capabilities. Patient Flow remains independent.

### Stage 12 — Responsive/mobile validation

Validate Sidebar, Workspace scrolling, Widget sizing, drag/drop, Search, Patient Flow, tables, forms, modals/drawers, patient context and financial surfaces on desktop, tablet and mobile. Do not create a separate conceptual IA for mobile.

### Stage 13 — Arabic/English reconciliation

Validate navigation, Workspace, Widgets, Patient Flow, Search, Dashboard/Overview, actions, states, terminology, RTL/LTR, ordering and formatting. Do not allow competing hard-coded translation systems.

### Stage 14 — Authorization, tenant and regression validation

Verify Workspace customization and Widgets cannot grant access; Sidebar visibility follows effective authorization; Patient Flow requires explicit enablement + permission + context; tenant isolation and auditability remain intact.

### Stage 15 — Runtime validation

Validate the complete deployed path: Login → user surface → Sidebar → Workspace → Widget selection → reorder → capability → patient context → Patient Flow → Global Search → save → reload. Validate both languages and device sizes. Build success alone is insufficient.

### Stage 16 — Legacy cleanup

Only after the authoritative replacement is validated, remove proven duplicate routes/components/navigation registries/obsolete Workspace or Dashboard implementations/old translation paths/contradictory flags/deprecated wrappers/unused UI.

### Stage 17 — Documentation closure

Documentation is part of implementation. After every stage:

**Implementation → Validation → Documentation update → Commit**

Record what was inspected, reused, reconciled, extended, created, removed, validated and documented. Superseded decisions must be explicitly marked as superseded.

## 9. Required validation scenarios

At minimum validate:

1. Reception user with patient/appointment permissions.
2. Reception user with additional financial permissions.
3. Clinical user with clinical permissions.
4. Clinical user with additional financial/administrative permissions.
5. Administrative user with appropriate management permissions.
6. Operations-oriented Workspace with Patient Flow disabled.
7. Patient Flow Operations interface.
8. Patient Flow Clinical interface.
9. Patient Flow Administrative interface.
10. Clinic Admin full authorized visibility.
11. Widget add/remove/reorder.
12. Permission removed after Widget configuration.
13. Global patient search.
14. Global invoice/identifier search.
15. Patient contextual navigation.
16. Arabic/English parity.
17. Mobile Workspace scrolling and Widget interaction.
18. Tenant isolation and unauthorized access attempts.

## 10. Definition of Done

The work is complete only when:

- Sidebar is coherent and reflects authorized capabilities;
- Workspace is the primary working surface;
- Workspace personalization is permission-safe;
- Widgets are reusable and permission-dependent;
- executable Widgets exist where materially useful;
- unsuitable Domains are not forced into Widget form;
- Widgets may also be surfaced in Sidebar where appropriate;
- Patient Flow remains independent and Queue remains part of it;
- the three Patient Flow interfaces remain distinct;
- Patient Flow does not appear merely because a Workspace/role is Operations or Clinical;
- Dashboard and Workspace are no longer conflated;
- Overview is not a duplicate operational surface;
- Global Search works across authorized data;
- Patient Context reduces unnecessary navigation;
- Role Templates remain flexible and advisory;
- authorization and tenant isolation remain intact;
- Arabic/English parity is preserved;
- mobile behavior is validated;
- duplicates/legacy implementations are removed only after proof;
- runtime matches approved behavior;
- documentation matches implementation.

## 11. Change-control rule

No new architectural decision may be silently introduced during execution. If an implementation exposes a conflict not resolved by these binding decisions, stop at that decision point and document the approved decision, the newly discovered conflict, repository/database/runtime evidence, relevant external comparison, possible resolutions and the exact decision required. Do not turn an implementation preference into an architectural decision without approval.
