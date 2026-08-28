# CORE SYSTEM — Global UX / Information Architecture Implementation Plan
## Post-Audit Execution Plan — 2026-08-28 — AMENDED

**Status:** Documentation baseline updated. Product implementation has NOT started.
**Authority:** `GLOBAL_UX_IA_FINAL_DECISIONS_AMENDMENT_2026-08-28.md`

## Governing rule

No product implementation begins until the documentation baseline and affected legacy documentation have been reconciled.

Execution sequence:

`Documentation Baseline → Repository/Data Reconciliation → Patient Flow/Queue Reconciliation → Workspace/Widget Reconciliation → Navigation → Global Search → UX Consistency → Mobile/I18N → Runtime → Regression → Closure Documentation`

Use:

`Inspect → Reuse → Extend → Reconcile → Create`

## Phase 0 — Documentation and Governance Baseline

### Required records

1. Final Global UX/IA audit.
2. Final UX/IA decisions amendment.
3. Current Workspace specification.
4. Stage 6 historical reconciliation.
5. AJM/PJ references affected by Workspace, Patient Flow, Queue, navigation or terminology.
6. Any document that incorrectly treats Dashboard as Workspace, Workspace as a fixed Role screen, or Patient Flow as a child of Operations/Clinical.

### Mandatory decisions recorded

- Role is an organizational starting template, not a fixed screen.
- Permissions determine actual capabilities and may cross conventional professional boundaries according to Clinic Admin configuration.
- Workspace is a working environment.
- Operations and Clinical remain meaningful working contexts without being hard-coded profession screens.
- Administration is an administrative/configuration working context.
- Global/Home is system-wide orientation/entry.
- Patient Flow is one independent system with Operations, Clinical and Administrative interfaces.
- Patient Flow requires explicit enablement/context and is not automatic from Role name.
- Workspace is not a security boundary.
- Widgets are permission-dependent user-selected working tools, not permissions.
- Widgets may be operational/action-oriented, not only informational.
- Not every Domain requires a Widget.
- Widgets preserve usable sizes and may extend beyond one viewport through a movable/scrollable Workspace.
- Widgets may also have a separated optional Sidebar quick-access area.
- Dashboard, Overview and Workspace are distinct.
- Workspace Membership is not a second authorization layer.
- Global Search is system-wide.
- Patient Context is contextual navigation over independent Domains.

### Gate
No UI/navigation/Workspace/Widget product behavior changes before this documentation baseline is complete.

## Phase 1 — Repository + Database Reconciliation

### Objective
Identify canonical implementations and determine whether current data structures support the approved model.

### Inspect

- navigation registry/registries;
- Workspace registry/engine/shell;
- Operations Workspace;
- Clinical Workspace;
- Administration surfaces;
- Global/Home;
- Widget registry/definitions/components;
- existing user Workspace configuration;
- role templates;
- permission bundles and role permissions;
- Queue surfaces;
- Patient Flow implementations;
- Overview components;
- Dashboard components;
- Reports/Analytics;
- Settings;
- legacy implementations;
- feature flags;
- permissions used for visibility/actions;
- relevant Supabase tables, relationships, RLS and server actions.

### Required output

`Domain → Workspace → Surface → Route → Component → Permission → Widget → Data`

plus:

`Role/Template → Permission set → Default Workspace → Suggested Widgets`

### Gate
Every planned change must point to an existing canonical implementation or a proven gap. No new table/registry may be introduced without evidence.

## Phase 2 — Patient Flow / Queue Reconciliation

### Objective
Preserve CORE SYSTEM's existing patient movement capability and eliminate competing implementations.

### Required

1. Identify canonical persisted patient-flow state.
2. Identify valid transitions.
3. Identify the existing drag-and-drop behavior and preserve its real workflow meaning.
4. Map Operations interface.
5. Map Clinical interface.
6. Map Administrative interface.
7. Reconcile Queue, LiveQueueBoard, MyQueueView, OperationWorkspace and related surfaces.
8. Remove only proven duplicates/legacy after reference migration.
9. Ensure Patient Flow remains an independent Sidebar surface.
10. Ensure Patient Flow visibility requires explicit configured access/context and is not inferred from Role name.

### Gate
One canonical Patient Flow/Queue workflow with three contextual interfaces. No duplicate workflow.

## Phase 3 — Workspace Reconciliation

### Operations
Make Operations a real working environment. Candidate operational tools include Quick Registration, Quick Appointment, Patient Search, operational tasks/requests and Patient Flow entry/actions where explicitly enabled.

A financial capability may appear in an Operations user's working environment when Clinic Admin granted the permission; this does not transfer Financial Domain ownership.

### Clinical
Make Clinical a real working environment for permitted clinical work, not a hard-coded Doctor screen.

### Administration
Keep tenant administration/configuration separate from daily operational work and from Dashboard monitoring.

### Global/Home
Provide orientation, Global Search, permitted cross-system Quick Actions, recent/relevant work, attention items and controlled workspace entry. Do not turn it into a duplicate Dashboard.

## Phase 4 — Widget Reconciliation and Library

### Objective
Make Widgets real working tools, not decorative Dashboard cards.

### Mandatory Domain-by-Domain assessment

For every Domain:

- identify frequent work;
- identify urgent/attention work;
- identify actions that benefit from acceleration;
- identify useful information needed during work;
- determine whether Widget is justified;
- determine whether Quick Action is better;
- determine whether no Widget is correct;
- identify reusable existing implementation;
- record required permission;
- record destination/action;
- record category and type;
- record mobile behavior;
- record Arabic/English behavior.

### Widget rules

- Widgets never grant permission.
- Widget availability follows existing permissions.
- Removing permission removes usable access through the Widget.
- Widgets reuse canonical Domain logic.
- Categories organize discovery only.
- Not every Domain receives a Widget.
- Operational/action/attention Widgets are valid.
- Widget size remains usable.
- Workspace may scroll/move through additional selected Widgets.
- User may reorder selected Widgets by drag and drop.
- User may restore defaults.
- Optional separated Sidebar Widget quick access may be provided without replacing the full navigation hierarchy.

## Phase 5 — Role Templates and Workspace Defaults

Existing role templates remain organizational aids.

For each useful template, the eventual model may provide:

`Role template → initial Permissions → initial Workspace arrangement → suggested Widgets`

Clinic Admin may modify everything and may create/save/reuse custom roles/templates.

Templates do not impose professional permission limits.

## Phase 6 — Navigation / Information Architecture Reconciliation

For every Sidebar item determine:

1. Domain?
2. Sub-area?
3. Feature?
4. Setting?
5. Workflow surface?
6. Report/Analytics?
7. Contextual action?
8. Parent/child?
9. Does it genuinely need top-level placement?

Rules:

- A route/table/component is not sufficient reason for top-level Sidebar placement.
- Preserve independent Domain ownership.
- Keep Patient Flow as an explicit independent surface.
- Do not use Widgets as a substitute for full features.
- Reconcile duplicate navigation registrations at the source.

## Phase 7 — Patient Context / Cross-Domain Navigation

Audit patient-centered contexts and provide authorized contextual access to related work such as visits, treatment plans, appointments, financial information, medical files/photos, follow-up, communication and Patient Portal.

Do not transfer Domain ownership.

## Phase 8 — Global Search

Build/complete true system-wide search across permitted tenant-scoped records and relevant features.

Search examples include patient, staff, appointment, invoice, payment, financial plan/installment, insurance/claims, service/procedure, inventory, supplier/purchase order, treatment plan, task/request, communication and other relevant records.

Results must identify type/context and navigate directly.

Respect existing authorization, tenant isolation, privacy and RLS. No parallel search permission model.

Arabic and English parity is required.

## Phase 9 — Overview / Dashboard / Workspace Reconciliation

### Workspace
Actual work.

### Overview
Contextual status, summary, attention, contextual KPIs and supporting information.

### Dashboard
Management/monitoring: performance, trends, cross-system KPIs, status and management attention.

No surface becomes a duplicate of another.

## Phase 10 — Interaction / Discoverability

Audit primary/secondary/contextual actions, tabs, drawers, modals, filters, sorting, pagination, bulk actions, breadcrumbs, back navigation, cross-domain links and empty/error/loading states.

Use progressive disclosure. Do not hide valid capability as a visual shortcut.

## Phase 11 — Mobile

Validate Sidebar, Global Search, Workspace, Widget selection/reordering, Patient Flow, patient context, forms, tables, actions, drawers/modals and financial/operational/clinical screens.

Widgets retain usable sizes and selected Widgets remain accessible beyond the initial viewport.

## Phase 12 — Arabic / English

Validate navigation, Workspace, Widgets, Widget categories, Search, Patient Flow, Overview, Dashboard, actions, states, terminology, RTL/LTR, ordering and formatting.

No second translation mechanism.

## Phase 13 — Permissions / Tenant / Data Integrity

Do not redesign authorization.

Validate:

- Clinic Admin can configure users/roles/permissions as intended;
- Role remains distinct from Permission;
- Workspace remains distinct from authorization;
- Widget access follows permissions;
- Patient Flow requires explicit configured access/context;
- direct routes cannot bypass permissions;
- Search cannot expose unauthorized data;
- tenant isolation/RLS remain intact;
- auditability remains intact.

## Phase 14 — Runtime Validation

Validate deployed runtime using representative configurations:

- Clinic Admin;
- Operations user without Patient Flow;
- Operations user with Patient Flow Operations context;
- Clinical user with Patient Flow Clinical context;
- authorized administrative Patient Flow user;
- mixed-permission user, including cross-domain permissions;
- delegated administrator.

Validate Workspace personalization, Widget add/remove/reorder, Sidebar Widget quick access, Patient Flow transitions, Search, navigation, permissions, data persistence, Arabic, English and mobile.

## Phase 15 — Regression / Legacy Cleanup

Search for:

- duplicate routes;
- duplicate components;
- duplicate business logic;
- duplicate navigation registrations;
- legacy Workspace/Dashboard assumptions;
- dead routes;
- stale feature flags;
- unused UI;
- conflicting terminology;
- old Queue/Patient Flow implementations.

Remove only proven duplicate, obsolete, broken or superseded implementations after references are migrated.

## Phase 16 — Closure Documentation

Record:

1. every final decision implemented;
2. every canonical implementation selected;
3. every changed route/navigation relationship;
4. every Widget added/reconciled;
5. every Widget permission mapping;
6. Patient Flow reconciliation;
7. role/template relationship;
8. database/data changes, if any;
9. permission/tenant validation;
10. mobile validation;
11. Arabic/English validation;
12. runtime evidence;
13. removed/reconciled legacy implementations;
14. deferred items.

Update all affected architecture, AJM, PJ and UX documentation so the repository remains synchronized with the implemented system.

## Safety Rules

- Inspect before modifying.
- Reuse canonical implementations.
- Extend incomplete implementations.
- Reconcile duplicates before creating.
- Create only for proven gaps.
- No visual hiding as a substitute for root-cause correction.
- No duplicate wrappers or parallel registries.
- No parallel authorization model.
- No Domain ownership changes for UX convenience.
- No Patient Journey redefinition.
- No feature removal merely to simplify navigation.
- No Workspace Membership authorization layer.
- No automatic Patient Flow access from Role name.
- No Widget-based permission bypass.
- No implementation of an architectural change requiring new Product Owner approval.

## Final Success Criteria

The work is complete only when:

1. Users can find functions without knowing CORE's internal architecture.
2. Workspace is a genuine working environment.
3. Users can personalize Workspace within granted capabilities.
4. Widgets accelerate real work and are not forced onto every Domain.
5. Widget sizes remain usable and additional selected Widgets remain accessible.
6. Sidebar remains the complete accessible system map.
7. Optional Sidebar Widget quick access does not replace full navigation.
8. Patient Flow is one coherent independent system with three contextual interfaces.
9. Patient Flow does not appear merely from Role name.
10. Dashboard is not confused with Workspace or Administration.
11. Overview remains contextual.
12. Global Search works across permitted system data.
13. Permissions remain independent from presentation.
14. Clinic Admin retains configuration freedom.
15. Mobile is usable.
16. Arabic and English remain equivalent.
17. Runtime matches the documented architecture.
18. Documentation remains synchronized and authoritative.
