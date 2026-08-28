# CORE SYSTEM — Global UX / Information Architecture
## Final Decisions Amendment — Workspace, Widgets, Roles, Patient Flow and Navigation

**Date:** 2026-08-28
**Status:** AUTHORITATIVE PRODUCT/UX DECISION RECORD — PRE-IMPLEMENTATION
**Scope:** Global presentation, Information Architecture, Sidebar, Workspaces, Widgets, Roles, Permissions, Patient Flow, Queue, Dashboard, Overview, Global Search, contextual navigation, mobile and bilingual presentation.

> This document records the decisions reached after the Global UX/IA audit and the subsequent Product Owner discussion. It is intended to prevent later reinterpretation, dilution, or accidental conversion of decisions into optional recommendations.

## 1. Governing principle

CORE SYSTEM must present a simple, controlled and understandable surface while retaining deep capability in the background.

The governing design principle is:

`Simple Surface + Deep Background Capability + Independent Domains + Explicit Integration`

The information architecture must be based on the nature of the user's work, domain ownership and user mental model, not on the number of routes, database tables or components in the repository.

The governing execution discipline is:

`Inspect → Reuse → Extend → Reconcile → Create`

Create only when a real gap is proven.

No UX simplification may remove a valid capability merely to make the interface look simpler.

## 2. User model — authoritative

The CORE SYSTEM user is a member of the clinic team whose access is configured by the Clinic Admin.

The user is not defined by a fixed profession-based screen.

The relationship is:

`Role → organizational starting template`

`Permissions → actual capabilities`

`Workspace → working environment`

`Widgets → user-selected working tools`

A Role is not a security boundary and is not a hard-coded screen.

A Permission is not restricted by professional convention. Clinic Admin may grant any available permission to any user when that matches the clinic's own operating model. A doctor may therefore have selected financial permissions, and a receptionist may have selected capabilities outside conventional reception work.

CORE SYSTEM, as platform owner, does not impose its own professional interpretation of which permissions a clinic may assign, subject to the existing authorization and security model.

## 3. Role templates — authoritative

The existing role models/templates are retained as organizational aids.

They are not mandatory role definitions.

Clinic Admin may:

- use an existing role/template;
- modify its permissions;
- create a completely new role;
- save and reuse a custom role/template;
- modify an individual user's configuration after assignment.

Future ready-made role templates may also define a useful starting Workspace configuration and suggested Widgets, but they remain starting points, not restrictions.

The system must provide good defaults so a newly configured user is productive without having to design everything from an empty screen.

## 4. Permission model — authoritative

`Role ≠ Permission`

`Workspace ≠ Security Boundary`

Permissions determine what the user may access or perform.

The Sidebar, Workspace capabilities, Widgets, Quick Actions, Patient Flow access and direct actions must never grant capabilities beyond the permissions already assigned to the user.

A Widget is never a new permission. It is only a presentation or shortcut for an already authorized capability.

Server-side authorization, tenant isolation, RLS and existing auditability remain authoritative.

No parallel authorization model may be introduced as part of this UX work.

## 5. Workspace — authoritative definition

A Workspace is the user's working environment.

It is:

- not merely an Overview;
- not a management Dashboard;
- not a container for every feature the user can access;
- not a fixed role screen;
- not a security boundary.

The Workspace exists to help the user perform their work efficiently.

Operations and Clinical are retained as meaningful working contexts in the existing CORE architecture, but they must not become rigid profession-based screens. The actual capabilities presented to a user are determined by the permissions configured by Clinic Admin.

Administration remains a separate administrative/configuration working context.

Global/Home remains the system-wide orientation and entry surface and is not a business Domain.

## 6. Workspace presentation and cross-domain permissions

A user's working experience is permission-driven, not profession-driven.

Example:

A user working primarily in Operations may be granted selected financial permissions by Clinic Admin. Those permitted financial capabilities may be surfaced in that user's Operations working environment without moving financial Domain ownership to Operations.

If the user is also granted clinical permissions, clinical capabilities are surfaced through the Clinical working context rather than being incorrectly treated as Operations functions.

This is presentation behavior only. Domain ownership does not move because a capability is presented in a user's Workspace.

The same principle applies to every Domain.

## 7. Workspace customization — authoritative

The Workspace is customizable by the user within the capabilities granted to that user.

The user may select useful Widgets and Quick Actions from the capabilities available to them.

The user may:

- add permitted Widgets;
- remove Widgets from the working surface;
- reorder Widgets by drag and drop;
- place frequently used tools earlier;
- move through additional Workspace content vertically or across the available responsive surface;
- restore the appropriate default Workspace configuration when needed.

The user must not be required to build a Workspace from an empty screen.

Ready-made templates may provide a useful initial arrangement.

## 8. Widget availability and permissions — authoritative

Widgets are independent reusable presentation units, but they do not create or grant permissions.

The availability chain is:

`Capability exists`

`→ user has required permission`

`→ Widget becomes available to that user`

`→ user may add it to Workspace`

If the permission is removed, the user must not retain usable access to the underlying capability merely because its Widget was previously added.

Widgets must reuse canonical Domain logic and must not duplicate business rules.

## 9. Widget categories — authoritative

The Widget Library must classify Widgets to make discovery manageable.

Classification is for organization and discovery, not authorization.

Categories may include, where actually useful:

- Patients
- Appointments
- Clinical
- Financial
- Operations
- Communication
- Tasks
- Inventory/Resources
- Analytics/Information
- System

The exact final category list must follow the actual Widget inventory after Domain-by-Domain inspection; categories must not be created merely for symmetry.

## 10. Widget types — authoritative

CORE SYSTEM Widgets are not limited to Overview/summary cards.

During Domain-by-Domain inspection, a Widget may be classified as:

### Information
Provides useful information needed during work.

### Action
Accelerates a frequent operation, such as Quick Registration or Quick Appointment.

### Attention / Operational
Highlights something that requires action or immediate attention.

### Context / Summary
Provides useful contextual status or summary information.

The same Widget may combine information and action when that produces a genuinely useful workflow.

Not every Domain requires a Widget.

A Domain must receive a Widget only when there is a real daily, frequent, urgent, attention-oriented or high-value workflow that benefits from one.

Configuration-heavy or infrequently used Domains may correctly have no Widget.

## 11. Widget size and Workspace surface — authoritative

Widgets must retain usable, appropriate sizes.

The system must not solve screen density by continuously shrinking Widgets until their content becomes difficult to use.

The Workspace should instead use the available screen as a movable working surface.

The intended behavior is similar in principle to a mobile home screen:

- a Widget has an appropriate natural size;
- the Workspace has a finite visible area;
- additional Widgets remain available below/within the movable surface;
- the user can scroll/move through the Workspace;
- the user can reorder Widgets through drag and drop.

A maximum practical number of Widgets visible in a given viewport may be determined by the natural size of the Widgets and device dimensions. This is not a rule that deletes or disables additional available Widgets.

The objective is to preserve usability and Widget integrity, not to force every selected Widget into one viewport.

## 12. Widget placement in Sidebar — approved direction

Widgets may also be exposed as an optional, clearly separated quick-access area within the user's Sidebar when that improves navigation and does not duplicate or replace the full feature hierarchy.

This does not turn Widgets into Sidebar features and does not make the Sidebar a Widget library.

The full Domain/Feature hierarchy remains available through normal navigation.

The user's Widget selection remains personal Workspace configuration.

The Sidebar Widget area is an additional access convenience, not a second authorization system and not a replacement for the Workspace.

## 13. Quick Actions — authoritative distinction

A Quick Action is not required to be a full Widget.

Simple, high-frequency actions may be presented as compact actions within Workspace or other appropriate surfaces when a large Widget would add unnecessary visual weight.

Examples include:

- New Patient
- New Appointment
- Create Invoice

The choice between Widget and Quick Action must be based on the actual workflow, not on a requirement that every shortcut become a card.

## 14. Overview — authoritative

Overview is not the Workspace.

Overview provides contextual understanding such as:

- status;
- summary;
- attention;
- useful contextual KPIs;
- supporting information.

Overview must not become a second copy of the complete working environment.

Overview Widgets may be expanded where justified, including operational Widgets, but the distinction between Overview and actual Workspace work must remain clear.

## 15. Dashboard — authoritative

Dashboard is a management/monitoring surface.

It is not an administrative Workspace and is not an operational Workspace.

Dashboard is intended for authorized management users and focuses on matters such as:

- performance;
- trends;
- cross-system KPIs;
- status;
- management attention.

Clinic Admin must continue to have full visibility and access across the system according to the established authorization model. Delegated administrators see what their permissions allow.

The prior confusion between Dashboard and administrative working surfaces must not be reintroduced.

## 16. Global/Home — authoritative

Global/Home is the system-wide entry and orientation surface.

It is not a fourth business Domain.

It provides:

- orientation;
- Global Search;
- useful permitted cross-system Quick Actions;
- recent/relevant work;
- attention items;
- controlled entry into available workspaces.

For Clinic Admin, Global/Home is intentionally administration-heavy and cross-system in nature while preserving complete system visibility.

For other users it is personalized to their permitted work.

Global/Home must not become a duplicate Dashboard or duplicate operational Workspace.

## 17. Patient Flow — authoritative and independent

Patient Flow is an independent Sidebar surface and an independent system-level workflow surface.

It is not a child of Operations or Clinical.

Patient Flow remains the existing clinic patient-movement system and must not be replaced by generic queue functionality or reduced to a collection of Widgets.

It contains three contextual presentations of the same underlying system:

1. **Operations view** — reception/operational movement, routing, return and completion.
2. **Clinical view** — clinician-facing movement and clinical handoff/work relevant to the clinician.
3. **Administrative view** — full operational visibility and intervention for authorized administrators.

These are three interfaces for one Patient Flow system, not three separate Patient Flow systems.

## 18. Patient Flow activation and context — authoritative

Patient Flow must not appear in the user's Sidebar merely because the user's Role is Operations, Clinical, Reception, Doctor or another role name.

Clinic Admin must explicitly make Patient Flow available to the user through the existing authorization/configuration model and must select the applicable context for that user:

- Operations;
- Clinical;
- Administrative.

Therefore:

`Operations role ≠ automatic Patient Flow Operations access.`

A user may have an Operations Workspace without Patient Flow.

A user with Operations context and Patient Flow enabled receives the Operations presentation.

A user with Clinical context and Patient Flow enabled receives the Clinical presentation.

An authorized administrative user with Administrative context receives the administrative presentation.

Patient Flow context must never be inferred solely from the user's role name.

## 19. Patient Flow / Queue workflow continuity — authoritative

The existing Patient Flow and Queue workflow must be preserved and reconciled.

The underlying journey remains one continuous tenant-scoped workflow, including the existing arrival, waiting, provider and completion stages.

The existing drag-and-drop behavior is a real operational action that changes workflow state. It is not decorative reordering.

The operational handoff remains:

`Operations → Clinical → Operations`

The system must maintain one canonical Patient Flow/Queue workflow implementation with contextual views.

Duplicate or legacy Queue surfaces must be reconciled before replacement/removal.

## 20. Patient Context and contextual navigation — authoritative direction

When the user is working in a patient context, the system should expose relevant cross-domain patient-related actions and information without requiring repeated navigation through the global Sidebar.

Examples may include, where authorized:

- visits;
- treatment plans;
- appointments;
- financial information;
- medical files/photos;
- follow-up;
- communication;
- Patient Portal.

This does not transfer Domain ownership. It is contextual navigation over independently owned Domains.

## 21. Sidebar — authoritative direction

The Sidebar is the user's complete map of accessible system capabilities, organized according to Information Architecture.

It is not:

- a list of every route;
- a list of every database entity;
- a duplicate Workspace;
- a replacement for Global Search;
- a collection of shortcuts only.

A top-level Sidebar item must be justified by its Domain/surface role. A route or database table alone is insufficient.

Parent/child relationships must follow:

- Domain ownership;
- user mental model;
- workflow;
- actual operational use.

Examples such as Financial Plans → Installments, Insurance → Claims, and Purchasing → Suppliers/Receiving must be validated against the actual implementation before becoming final global rules.

## 22. Global Search — authoritative

Global Search is a real system-wide capability.

It must allow the user to search across permitted tenant-scoped information without knowing which Domain owns it.

It must support meaningful queries such as:

- patient name;
- patient number;
- phone;
- doctor/staff member;
- invoice number;
- payment;
- financial plan/installment;
- appointment;
- treatment plan;
- service/procedure;
- inventory item;
- supplier/purchase order;
- task/request;
- communication;
- other relevant permitted records.

Results must clearly show type and context and allow direct navigation.

Global Search must respect permissions, tenant isolation, privacy and existing authorization. It must not create a parallel search permission system.

Search must work in Arabic and English and must coexist with faster contextual searches.

## 23. Discoverability and interaction rules

Every major user path must answer:

- Where am I?
- What can I do here?
- What should I do next?
- Where can I find what I need?

The system must reduce unnecessary steps without hiding valid capabilities.

Use progressive disclosure:

`Essential first → advanced when needed`

Settings and infrequent configuration should not contaminate daily work.

No visual hiding may be used as a substitute for root-cause reconciliation.

## 24. Mobile — authoritative direction

Mobile is a first-class working surface.

The same Information Architecture must remain understandable on small screens.

Workspace Widgets must preserve their usable dimensions rather than being squeezed into unusable cards.

The Workspace can scroll through additional selected Widgets.

Drag-and-drop reordering must be adapted to touch interaction.

The following require explicit validation:

- Sidebar;
- Global Search;
- Workspace;
- Widget selection/reordering;
- Patient Flow;
- patient context;
- tables;
- forms;
- drawers/modals;
- operational and clinical actions.

## 25. Arabic / English — authoritative

Arabic and English must have equivalent meaning and behavior.

This includes:

- Sidebar;
- Workspace names;
- Widgets;
- Widget categories;
- Global Search;
- Patient Flow;
- Overview;
- Dashboard;
- actions;
- errors;
- empty states;
- loading states;
- terminology;
- RTL/LTR behavior;
- ordering and placement;
- date/number formatting.

The unified render-time i18n architecture remains the single presentation translation mechanism.

## 26. Workspace Membership — rejected

A separate user-facing Workspace Membership layer is not part of the model.

Workspace availability and presentation are derived from the existing user/role/permission configuration and approved workspace context.

Account lifecycle states such as invitation, activation, suspension/deactivation and removal remain user/account administration concerns.

No second access-control layer may be introduced.

## 27. Domain-by-Domain Widget audit — mandatory

Before implementation, every Domain must be inspected individually.

For each Domain, determine:

1. What work is performed there?
2. Which actions are frequent?
3. Which actions are urgent?
4. Which information requires attention?
5. Which actions can genuinely be accelerated by a Widget?
6. Which information is better accessed through the full feature?
7. Should the Domain have no Widget?
8. If a Widget exists, what exact action or destination does it produce?
9. What permission is required?
10. Is there already an existing component that can be reused?

No Widget is to be created merely because a Domain exists.

## 28. Template-to-Workspace relationship — authoritative direction

Ready-made role templates may eventually provide:

`Role + initial Permissions + initial Workspace arrangement + suggested Widgets`

The resulting configuration remains editable.

A custom Role may be saved and reused.

This preserves the earlier role/permission work while enabling faster onboarding and consistent starting points without imposing fixed screens.

## 29. Technical/data preservation rules

The UX reorganization must reuse existing canonical data and business logic whenever possible.

The current database contains structures relevant to user/workspace configuration, roles, permissions and Patient Flow. These must be inspected and reconciled before any new data structure is introduced.

Do not create new tables, duplicate registries or parallel authorization systems merely to implement the UX model.

If an existing data structure conflicts with the approved model, identify the root cause first and change only what is necessary.

## 30. Documentation rule — mandatory

Every implementation stage must record:

- the decision being implemented;
- the canonical implementation selected;
- files/routes/components changed;
- data structures changed, if any;
- permissions affected, if any;
- legacy/duplicate implementations reconciled;
- runtime verification;
- remaining deferred items.

A decision must never be silently reworded later so that an approved requirement becomes an optional interpretation.

Documentation must be updated before major product implementation and again after runtime closure.

## 31. Non-negotiable non-goals

Do not:

- make Role equal to a fixed screen;
- make profession equal to permission;
- use Workspace as a security boundary;
- make Patient Flow automatically appear from role name;
- create three independent Patient Flow systems;
- replace the existing Patient Flow/Queue workflow with generic queue functionality;
- make every Domain a Sidebar item;
- make every Domain a Widget;
- make every Widget an Overview card;
- make Dashboard a Workspace;
- make Workspace a Dashboard;
- use Widgets to grant permissions;
- create a second authorization model;
- delete a valid feature because it is not used by a competitor;
- hide duplicate code without reconciling its source;
- create duplicate navigation registries;
- transfer Domain ownership for UX convenience;
- introduce technical architecture changes without the required product decision.

## 32. Final target experience

The user should experience CORE SYSTEM as one coherent system:

`Global/Home`

`↓`

`Workspace`

`↓`

`Personal working surface`

`↓`

`Widgets + Quick Actions`

`↓`

`Contextual actions / full Domain features`

with:

`Sidebar = complete accessible system map`

`Global Search = direct access across permitted data`

`Patient Flow = independent cross-workspace operational system`

`Dashboard = management/monitoring`

`Overview = contextual understanding`

`Role = organizational starting template`

`Permissions = actual capabilities`

The target is not fewer capabilities. It is fewer unnecessary decisions and fewer unnecessary navigation steps for the user.

## 33. Approval boundary

These decisions are authoritative for the subsequent implementation planning and execution.

Any future proposal that changes one of the following requires explicit Product Owner decision before implementation:

- Role/Permission relationship;
- Workspace model;
- Widget permission relationship;
- Patient Flow independence or its three presentation contexts;
- Dashboard/Workspace distinction;
- Global/Home role;
- Workspace Membership rejection;
- Sidebar information architecture principle.

Implementation must remain evidence-driven and must begin from repository/database/runtime reconciliation, not assumption.
