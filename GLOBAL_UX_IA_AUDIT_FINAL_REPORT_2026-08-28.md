# CORE SYSTEM — Global UX / Information Architecture / Interaction Audit
## Final Reconciliation Report — 2026-08-28

**Status:** FINAL / APPROVED FOR IMPLEMENTATION PLANNING
**Scope:** Global UX, Information Architecture, Navigation, Workspace model, Patient Flow, Dashboard/Overview distinction, Global Search, discoverability, duplication, terminology, mobile, Arabic/English parity, permissions/visibility, runtime alignment.
**Implementation status:** NO PRODUCT/UX CODE IMPLEMENTATION PERFORMED AS PART OF THIS AUDIT.

---

## 1. Executive Decision

The audit confirms that CORE SYSTEM does not need a redesign from zero. It needs reconciliation of several presentation models that were developed at different stages.

The target model is:

`Global/Home → Workspaces → logical sub-areas → contextual features → operational actions`

while preserving:

`Independent Domains + Integrated Platform`

The system must remain powerful in the background while presenting a controlled and understandable surface to users.

---

## 2. Authoritative Decisions

### 2.1 Workspace

A Workspace is the user's working environment. It is not merely an Overview and it is not a container for every feature the user can access.

The authoritative contexts are:

- Operations Workspace
- Clinical Workspace
- Administration Workspace
- Global/Home Workspace

Workspace does not replace roles or permissions.

`Workspace != Role != Permission != Capability`

Clinic Admin remains free to define roles and permissions according to the clinic's real operating model. A user may therefore have permissions that cross conventional professional boundaries.

### 2.2 Patient Flow — APPROVED

Patient Flow is an independent Sidebar surface.

It is not a child of Operations or Clinical because the same patient journey crosses both environments.

Patient Flow has three presentation contexts:

- Operations — reception/operational patient movement.
- Clinical — clinician-facing patient movement and handoff.
- Administrative — complete operational visibility and intervention for authorised administrators.

The Clinic Admin may make Patient Flow available to any user according to the clinic's configuration. Existing permissions remain authoritative.

The existing drag-and-drop patient movement is a real workflow interaction, not cosmetic reordering.

### 2.3 Operations Workspace — APPROVED DIRECTION

Operations is a working surface.

It may contain widgets such as:

- Quick Registration
- Quick Appointment
- Patient Search
- Patient Flow entry/actions
- Operational requests/tasks
- Other permitted capabilities

A capability granted by permission does not automatically change its domain ownership.

Example:

A receptionist with invoice permissions may see the permitted invoice function in the Operations working environment. If the same user receives clinical permissions, the clinical capability is surfaced through Clinical Workspace rather than being mixed into Operations.

### 2.4 Clinical Workspace — APPROVED DIRECTION

Clinical is a working environment for permitted clinical work.

It is not a hard-coded "doctor screen". Clinic Admin determines the actual role and permission configuration.

Clinical Overview widgets are contextual support and must not become a duplicate of the complete clinical workspace.

### 2.5 Dashboard vs Workspace vs Overview — APPROVED

These concepts are distinct:

**Workspace:** where the user works.

**Overview:** what the user needs to understand about the current workspace at a glance: status, summary, attention, KPIs where appropriate.

**Dashboard:** management/monitoring view for authorised management users, focused on performance, status, KPIs, trends and attention across the system.

Dashboard must not become an alternative operational workspace.

Clinic Admin must retain complete visibility across the system according to the existing permission model. Delegated administrators receive only what their permissions allow.

### 2.6 Global/Home Workspace — FINAL DECISION

The Global/Home Workspace is the system-wide entry and orientation surface.

It is not a fourth business domain and is not a duplicate of Administration Workspace.

Its purposes are:

- orient the user;
- provide Global Search;
- expose useful cross-system quick actions allowed to the user;
- show relevant recent/attention work;
- provide controlled entry into available workspaces.

For Clinic Admin, Global/Home is intentionally administration-heavy and cross-system in nature. For other users, it is personalized to their permitted work without creating a separate hard-coded screen for each role.

This is the selected model because it combines the strongest observed patterns without importing the weaknesses of any single reference product.

### 2.7 Workspace Membership — REJECTED AS A SEPARATE USER-FACING LAYER

A separate Workspace Membership concept is unnecessary as an authorization mechanism.

Workspace availability should derive from the existing permission architecture and user configuration. Creating another membership layer would risk duplicating permissions and creating a second access model.

User lifecycle remains separate:

- invited
- activated
- active
- suspended/deactivated
- removed/disabled according to the existing account model

These are account/user administration states, not Workspace Membership.

---

## 3. Why the Global/Home Decision Was Selected

### Jane

Jane demonstrates a strong task-oriented model: the Schedule is a primary working surface, and its Day Sheet brings scheduling, charting and payment into one work context. Patient search can be used directly from the scheduling workflow. This supports CORE's principle that a Workspace should help users perform work, not merely read metrics.

### Pabau

Pabau's current Home page is a personalized starting point with widgets, recent activity, today's schedule, tasks and quick access. It also separates broader company KPI visibility from ordinary staff use through permissions. This supports the idea of a useful Global/Home surface without making it identical to a business Dashboard.

### ERPNext

ERPNext treats Workspaces as module-oriented working environments and supports dashboards, shortcuts and links inside them. Its global search also distinguishes navigation/search from broader record search and respects permissions. This supports CORE's distinction between Workspace navigation and true Global Search.

### Final CORE conclusion

CORE should not copy any one of these models.

The best combined pattern is:

`Global/Home = orientation + global access + controlled quick actions`

`Workspace = actual work`

`Overview = contextual understanding`

`Dashboard = management/monitoring`

This preserves the flexibility already established for CORE while avoiding the common problem of turning the Home page into another giant dashboard.

---

## 4. Patient Flow — Strategic Finding

Patient Flow is one of CORE SYSTEM's strongest differentiating workflow surfaces.

It should not be reduced to a generic calendar, generic queue list, or role-specific page.

The underlying journey remains:

`Scheduled / Walk-in → Arrived → Waiting → With Provider → Pending Reception → Completed`

The operational handoff remains:

`Operations → Clinical → Operations`

Patient Flow makes this journey visible and actionable across the clinic while preserving each user's appropriate view.

The existing persisted drag-and-drop behavior must be retained and reconciled rather than replaced.

---

## 5. Navigation / Information Architecture Findings

The current repository contains a mixture of:

- Workspaces
- Domains
- Features
- Workflow surfaces
- Reports
- Analytics
- Settings

at comparable Sidebar levels.

This is the primary IA problem.

The Financial & Resources hierarchy is already a strong example of the desired parent/child model:

`Financial & Resources → Financial Plans → Installments`

`Financial & Resources → Insurance → Claims`

`Financial & Resources → Purchasing → Suppliers / Receiving`

The same principle must be applied globally after each relationship is validated.

A route or database table is not sufficient reason to create a top-level Sidebar item.

---

## 6. Queue / Patient Flow Reconciliation

The repository contains multiple Queue-related surfaces/implementations. These must be reconciled before implementation.

No duplicate Queue system is to be created.

The final implementation must identify:

- canonical patient movement domain logic;
- canonical persisted queue state;
- valid transitions;
- current operational view;
- current clinical view;
- administrative monitoring view;
- legacy/duplicate UI implementations.

Only after this reconciliation may obsolete wrappers/components be removed.

---

## 7. Global Search — FINAL REQUIREMENT

CORE SYSTEM requires a real system-wide search.

Definition of Done:

1. Accessible from every major surface.
2. Searches across permitted tenant-scoped record types.
3. Supports names, identifiers, phone numbers and other meaningful fields.
4. Clearly identifies result type and context.
5. Opens the correct destination directly.
6. Does not require the user to know which Domain owns the data.
7. Respects role/permission rules.
8. Respects tenant isolation and privacy.
9. Works in Arabic and English.
10. Does not become a replacement for contextual search where contextual search is faster.

The technical search mechanism is intentionally not prescribed by this report.

---

## 8. Permissions / Visibility

No new authorization model is approved.

The existing principle remains:

- Role is not the same as permission.
- Workspace is not a security boundary.
- Clinic Admin controls the clinic's user/role/permission configuration.
- Server-side authorization remains authoritative.
- Tenant isolation remains mandatory.

Navigation should simplify what a user sees, but hiding an item must never be mistaken for securing the underlying data.

---

## 9. Mobile

Mobile must be treated as a first-class surface, particularly for:

- Operations
- Patient Flow
- Clinical
- Global Search
- patient context
- tables/forms
- actions and drawers

The mobile solution must preserve the same information hierarchy rather than simply shrinking the desktop layout.

---

## 10. Arabic / English

The unified render-time i18n architecture remains the basis.

The UX audit must enforce parity for:

- Workspace names
- Sidebar
- Page titles
- Search
- Actions
- Empty/error/loading states
- Patient Flow
- Overview widgets
- Dashboard
- terminology
- RTL/LTR behavior

No second translation mechanism is to be introduced.

---

## 11. Documentation Reconciliation Finding

The older `WORKSPACE_ARCHITECTURE_SPECIFICATION.md` describes a single undifferentiated Workspace and treats Dashboard as legacy terminology.

The later Stage 6 amendment established multiple workspace contexts and explicitly superseded conflicting earlier wording.

The 2026-08-28 final audit further clarifies:

- Operations as a working environment;
- Clinical as a working environment;
- Administration as administrative work;
- Patient Flow as an independent cross-workspace surface;
- Global/Home as the system-wide entry/orientation surface;
- Dashboard as management/monitoring;
- Overview as contextual summary.

The Stage 6 amendment has been reconciled in GitHub first, before any product implementation.

The legacy specification must remain treated as historical material until the repository documentation cleanup is completed without losing architectural history.

---

## 12. Final Architecture Surface Map

`CORE SYSTEM`

`├── Global/Home Workspace`

`│   ├── Global Search`

`│   ├── Cross-system quick actions`

`│   ├── Recent / attention work`

`│   └── Entry to available Workspaces`

`│`

`├── Operations Workspace`

`│   ├── Operational widgets`

`│   ├── Quick actions`

`│   └── Patient-flow-related operational work`

`│`

`├── Clinical Workspace`

`│   ├── Clinical widgets`

`│   └── Medical work`

`│`

`├── Patient Flow`

`│   ├── Operations view`

`│   ├── Clinical view`

`│   └── Administrative view`

`│`

`├── Administration Workspace`

`│   └── Tenant administration / configuration`

`│`

`├── Domains / logical sub-areas`

`│   └── Contextual features and actions`

`│`

`└── Management surfaces`

`    ├── Dashboard`

`    ├── Reports`

`    └── Analytics`

This is an IA target map, not a permission map and not a claim that every branch must become a Sidebar item.

---

## 13. Non-Goals

This audit does not authorize:

- deleting features because a competitor does not have them;
- changing Domain ownership for navigation convenience;
- creating a new authorization model;
- using Workspace as a security boundary;
- removing capabilities to make the UI look simpler;
- rewriting working domain logic unnecessarily;
- creating duplicate Patient Flow/Queue implementations;
- forcing every role into one fixed screen;
- forcing every feature into the Sidebar.

---

## 14. Approval State

The following decisions are now treated as approved direction for implementation:

- Patient Flow as an independent Sidebar surface.
- Operations and Clinical as working environments.
- Clinic Admin freedom to define roles and permissions.
- Dashboard distinct from Workspace.
- Overview distinct from Dashboard and Workspace.
- Global/Home as a controlled system-wide entry/orientation surface, administration-heavy for Clinic Admin.
- Workspace Membership not used as a second authorization layer.
- Global Search as a true system-wide capability.
- Preserve and reconcile existing Patient Flow/Queue logic rather than replacing it.
- Documentation must be updated before product implementation.

Implementation remains gated by the execution plan below.
