# CORE SYSTEM — Global UX / Information Architecture Implementation Plan
## Post-Audit Execution Plan — 2026-08-28

**Status:** Approved planning baseline; implementation has not started.

## Governing rule

No implementation begins until the documentation baseline has been committed and the affected legacy documentation is explicitly reconciled.

The execution sequence is:

`Documentation Baseline → Navigation/Workspace Reconciliation → Patient Flow Reconciliation → Global Search → UX Consistency → Runtime Validation → Regression → Closure Documentation`

---

## Phase 0 — Documentation and Governance Baseline

### Objective
Make the documented architecture match the approved current model before changing product behavior.

### Actions

1. Record the final audit report.
2. Reconcile Stage 6 Workspace documentation.
3. Mark older Workspace wording as historical/superseded without losing architectural history.
4. Identify every document that still treats Dashboard as the Workspace or describes a single undifferentiated Workspace.
5. Update the relevant AJM/PJ references so terminology is consistent.
6. Record Patient Flow as an independent cross-workspace surface.
7. Record Global/Home, Operations, Clinical and Administration definitions.
8. Record the rejection of Workspace Membership as a second authorization layer.
9. Record Global Search as a required system capability.

### Gate
No UI or navigation implementation starts before this documentation baseline is complete.

---

## Phase 1 — Repository Reconciliation / Current-State Map

### Objective
Identify the canonical implementations before touching navigation.

### Inspect

- Navigation registry
- Workspace registry/engine
- Workspace shell
- Operation Workspace
- Clinical Workspace
- Administration surfaces
- Global/Home route
- Queue surfaces
- Patient Flow implementations
- Overview components
- Dashboard components
- Reports
- Analytics
- Settings
- legacy dashboard/workspace components
- feature flags affecting visibility
- permissions used by navigation

### Required output
A repository-level map of:

`Domain → Workspace → Surface → Route → Component → Permission → Feature`

### Gate
Every planned change must point to an existing canonical implementation or a proven gap.

---

## Phase 2 — Patient Flow / Queue Reconciliation

### Objective
Preserve the existing strength of CORE SYSTEM and eliminate duplicate implementations.

### Actions

1. Identify the canonical patient-flow state model.
2. Identify the canonical queue persistence/state transitions.
3. Map current Reception/Operations view.
4. Map current Clinical view.
5. Determine the correct Administrative monitoring/intervention view.
6. Compare `Queue`, `LiveQueueBoard`, `MyQueueView`, `OperationWorkspace` and related surfaces.
7. Remove only proven duplicate/legacy implementations after references are migrated.
8. Preserve persisted drag-and-drop workflow behavior.
9. Ensure each transition continues to use domain validation.
10. Ensure Patient Flow remains independent from Operations and Clinical navigation ownership.

### Gate
There must be one canonical Patient Flow domain/workflow implementation with multiple contextual views, not multiple competing workflows.

---

## Phase 3 — Workspace Surface Reconciliation

### Objective
Make Workspaces actual working environments.

### Operations
Ensure the Operations Workspace can present permitted operational actions/widgets such as:

- Quick Registration
- Quick Appointment
- Patient Search
- Patient Flow access
- operational requests/tasks
- other permitted operational capabilities

Financial permissions may surface financial capabilities to a user without changing the user's workspace identity.

### Clinical
Ensure clinical work appears through Clinical Workspace when the user has the relevant permissions.

### Administration
Keep tenant administration/configuration separate from daily operational work.

### Global/Home
Implement only after its final role is documented:

- orientation
- global search
- useful cross-system quick actions
- recent/attention items
- workspace entry points

Do not turn Global/Home into a duplicate dashboard.

---

## Phase 4 — Navigation / Information Architecture Reconciliation

### Objective
Move from route-driven Sidebar design to information-architecture-driven navigation.

### Rules

For every current Sidebar item ask:

1. Domain?
2. Sub-area?
3. Feature?
4. Setting?
5. Workflow surface?
6. Parent/child relationship?
7. Contextual action?
8. Does it genuinely need a top-level entry?

### Actions

- Reconcile duplicate navigation entries.
- Establish parent/child hierarchy.
- Keep Financial & Resources hierarchy as a reference pattern where appropriate.
- Remove only proven obsolete/duplicate entries.
- Do not create a top-level item merely because a route exists.
- Keep Patient Flow as an explicit independent surface.

---

## Phase 5 — Global Search

### Objective
Build a true system-wide search.

### Functional scope

Search must be capable of finding permitted records across relevant Domains, including as applicable:

- patients
- appointments
- staff
- invoices
- payments
- financial plans/installments
- insurance/claims
- services/procedures
- inventory
- suppliers/purchasing
- treatment plans
- tasks/requests
- communications
- other indexed tenant-scoped records

### UX

Results must show:

- result type
- useful context
- relevant identifying information
- direct navigation

The system should not force the user to know which Domain owns the record.

### Security

Global Search must use the existing authorization and tenant isolation model. It must not create a parallel search permission system.

### Arabic/English

Search labels, result types, empty states and navigation must have parity.

---

## Phase 6 — Overview / Dashboard Reconciliation

### Objective
Remove the conceptual overlap.

### Overview
Only:

- status
- summary
- attention
- contextual KPIs
- relevant quick context

### Dashboard
Only:

- management monitoring
- performance
- trends
- cross-system KPIs
- administrative attention

### Workspace
Actual work and actions.

No surface should become a second version of another surface.

---

## Phase 7 — Discoverability / Interaction Consistency

Audit and reconcile:

- primary actions
- secondary actions
- contextual actions
- tabs
- drawers
- modals
- filters
- sorting
- pagination
- bulk actions
- breadcrumbs
- back navigation
- cross-domain links
- empty states
- error states
- loading states

Use progressive disclosure rather than deleting capabilities.

---

## Phase 8 — Mobile

Validate and adapt:

- Sidebar
- Global Search
- Workspace switching
- Patient Flow
- patient context
- forms
- tables
- actions
- drawers/modals
- financial screens
- operational screens
- clinical screens

Mobile must preserve the same hierarchy and task logic.

---

## Phase 9 — Arabic / English

Validate:

- all navigation labels
- workspace names
- page titles
- actions
- search
- empty/error/loading states
- Patient Flow
- Overview
- Dashboard
- RTL/LTR direction
- Sidebar placement
- number/date formatting

No hard-coded second translation system may be introduced.

---

## Phase 10 — Permissions / Tenant / Data Integrity

No authorization redesign.

Validate that:

- Clinic Admin can configure roles and permissions as intended.
- Workspace visibility does not become a security boundary.
- Actions respect permissions.
- Tenant isolation remains intact.
- RLS remains intact.
- Existing auditability remains intact.
- Direct routes cannot bypass permissions.
- Search cannot expose unauthorized data.

---

## Phase 11 — Runtime Validation

Validate against the deployed system, not only source code.

Test representative users:

- Clinic Admin
- Reception
- Clinical user
- user with mixed permissions
- delegated administrative user

Validate:

- Global/Home
- Operations
- Clinical
- Patient Flow in all approved contexts
- Administration
- Dashboard
- Global Search
- navigation
- permissions
- data persistence
- errors
- mobile
- Arabic
- English

---

## Phase 12 — Regression and Cleanup

Search for and reconcile:

- duplicate routes
- duplicate components
- duplicate logic
- legacy dashboard components
- obsolete navigation registrations
- dead routes
- stale feature flags
- unused UI
- conflicting terminology
- old workspace assumptions

No removal without evidence that the implementation is duplicate, obsolete, broken, or superseded.

---

## Phase 13 — Final Closure Documentation

After runtime validation:

1. Update implementation status.
2. Record every changed route/navigation relationship.
3. Record every removed/reconciled implementation.
4. Record Global Search coverage.
5. Record Patient Flow reconciliation.
6. Record permission/tenant validation.
7. Record mobile validation.
8. Record Arabic/English validation.
9. Record remaining deferred items.
10. Update architecture and stage documents so the repository remains the source of truth.

---

## Implementation Safety Rules

- Inspect before modifying.
- Reuse canonical implementations.
- Extend incomplete implementations.
- Reconcile duplicates before creating anything.
- Create only for proven gaps.
- No visual hiding as a substitute for root-cause correction.
- No duplicate wrappers or parallel navigation registries.
- No parallel permission model.
- No Domain ownership changes for UX convenience.
- No Patient Journey redefinition.
- No feature removal merely to simplify navigation.
- No architectural decision beyond the approved model without explicit Product Owner approval.

## Final Success Criteria

The work is complete only when:

1. Users can find functions without knowing CORE's internal architecture.
2. Workspaces are real working environments.
3. Patient Flow is one coherent cross-workspace workflow.
4. Dashboard is not confused with administrative workspace.
5. Overview is contextual rather than a duplicate workspace.
6. Global Search works across permitted system data.
7. Sidebar reflects information architecture rather than route count.
8. Permissions remain independent from workspace presentation.
9. Clinic Admin retains the required configuration freedom.
10. No existing valid capability is lost.
11. Mobile is usable.
12. Arabic and English remain equivalent.
13. Runtime matches the documented architecture.
14. Documentation remains synchronized with the implementation.
