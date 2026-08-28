# CORE SYSTEM — Global UX / Information Architecture / Interaction Audit
## Final Reconciliation Report — 2026-08-28

**Status:** FINAL / AUTHORITATIVE — AMENDED AFTER PRODUCT OWNER DECISIONS
**Scope:** Global UX, Information Architecture, Navigation, Sidebar, Workspace model, Widget model, Patient Flow, Dashboard/Overview distinction, Global Search, discoverability, duplication, terminology, mobile, Arabic/English parity, permissions/visibility, runtime alignment.
**Implementation status:** NO PRODUCT/UX CODE IMPLEMENTATION PERFORMED AS PART OF THIS AUDIT OR ITS AMENDMENT.

---

## 1. Executive Decision

CORE SYSTEM does not need a redesign from zero. It needs reconciliation of presentation models developed at different stages.

The target experience is:

`Global/Home → Workspaces → logical sub-areas → contextual features → operational actions`

while preserving:

`Independent Domains + Integrated Platform`

The system remains powerful in the background while presenting a controlled, understandable and personalized working surface to each user.

The governing execution discipline is:

`Inspect → Reuse → Extend → Reconcile → Create`

Create only when a real gap is proven.

---

## 2. Authoritative User Model

The user is a member of the clinic team whose access is configured by Clinic Admin.

`Role ≠ Permission ≠ Workspace ≠ Capability`

Role is an organizational starting template. It is not a fixed screen and does not determine professional limits.

Permissions determine actual capabilities. Clinic Admin may assign any available permission to any user when that reflects the clinic's own operating model, including capabilities that cross conventional medical, operational and financial boundaries.

Workspace is the user's working environment. It is not a security boundary.

Capability is what the system can provide; its availability to a user remains permission-controlled.

Clinic Admin remains responsible for adding, editing, configuring and removing users and for defining/reusing/modifying roles and their permissions within the existing authorization model.

---

## 3. Role Templates

Existing role templates/models remain valid as aids for faster user setup.

They are not mandatory role definitions.

Clinic Admin may:

- use a template;
- change its permissions;
- create a new role from scratch;
- save a custom role/template for reuse;
- change an individual user's configuration after assignment.

Future templates may also provide an initial Workspace arrangement and suggested Widgets. They remain starting configurations, not restrictions.

---

## 4. Workspace — Authoritative Decision

A Workspace is the user's working environment, not merely an Overview and not a management Dashboard.

Operations and Clinical remain meaningful working contexts in the CORE SYSTEM presentation model, but neither is a hard-coded profession screen. Administration remains the administrative/configuration working context. Global/Home is the system-wide orientation/entry surface and is not a business Domain.

The capabilities visible in a Workspace are determined by the permissions configured for that user. A capability may be surfaced in the working environment without changing the Domain that owns it.

Example: a user working in Operations may receive selected financial permissions. The permitted financial function may therefore be accessible from that user's working surface while Financial remains an independently owned Domain. If the user has clinical permissions, the corresponding clinical capability is presented through the Clinical working context.

Workspace does not replace the full system navigation.

---

## 5. Workspace Customization — Final Decision

The Workspace is a personal working surface that the user may customize within the capabilities granted to them.

The user may:

- add permitted Widgets;
- remove Widgets from the Workspace;
- reorder Widgets by drag and drop;
- place frequently used tools earlier;
- move/scroll through additional selected Widgets beyond the immediately visible viewport;
- restore an appropriate default configuration.

The system must provide useful defaults rather than requiring a blank-screen setup.

The Workspace must not force all selected Widgets into one viewport.

Widgets retain usable natural sizes. The system must not solve density by shrinking Widgets until their content becomes difficult to use. Additional selected Widgets remain accessible through the movable/scrollable Workspace surface.

The exact maximum visible count is determined by Widget dimensions and available device space; it is not a rule that removes or disables additional selected Widgets.

Mobile/touch interaction must support this model through appropriate drag, scrolling and reordering behavior.

---

## 6. Widget Model — Final Decision

Widgets are not limited to Overview cards.

They may be:

- Information;
- Action;
- Attention/Operational;
- Context/Summary;
- combinations of the above where genuinely useful.

A Widget must accelerate or clarify real work. It must not exist merely because a Domain has data.

Every Domain must be assessed individually. Some Domains may have several useful Widgets; some may have one; some may correctly have none.

A Widget must reuse canonical Domain logic and must never grant a permission.

Availability follows:

`Capability exists → user has required permission → Widget is available → user may add it`

If the underlying permission is removed, the Widget cannot remain a route around authorization.

Widget categories are for discovery and organization, not authorization. Candidate categories include Patients, Appointments, Clinical, Financial, Operations, Communication, Tasks, Inventory/Resources, Analytics/Information and System. The final inventory must be based on actual Domain/workflow inspection rather than artificial symmetry.

---

## 7. Widgets and Sidebar

Widgets may also be offered as a clearly separated quick-access area within the user's Sidebar when useful.

This is an additional convenience only. It does not turn Widgets into Sidebar features, does not replace the full Domain/Feature hierarchy, and does not create a second authorization mechanism.

The user's Workspace selection and ordering remain personal configuration.

---

## 8. Quick Actions

Not every fast action must be a full Widget.

Simple high-frequency actions may be compact Quick Actions within Workspace or other suitable surfaces, such as New Patient, New Appointment or Create Invoice.

The choice between Widget and Quick Action must be driven by the actual workflow.

---

## 9. Patient Flow — Independent and Authoritative

Patient Flow is an independent Sidebar surface and one coherent workflow system.

It is not a child of Operations or Clinical, and it is not to be replaced by generic Queue functionality.

Patient Flow has three interfaces for the same underlying system:

1. Operations — reception/operational movement, routing, return and completion.
2. Clinical — clinician-facing movement and clinical handoff/work.
3. Administrative — complete operational visibility and intervention for authorized administrators.

These are not three separate Patient Flow systems.

Patient Flow must not appear merely because a user's Role is named Operations, Reception, Doctor or another profession/role.

Clinic Admin must explicitly make Patient Flow available to the user through the existing authorization/configuration model and select the applicable context: Operations, Clinical or Administrative.

Therefore an Operations user may have Operations Workspace without Patient Flow. If Patient Flow is enabled with Operations context, the user receives the Operations presentation. If enabled with Clinical context, the user receives the Clinical presentation. Administrative context provides the administrative presentation for an authorized user.

The existing drag-and-drop Patient Flow interaction is a real workflow action that changes operational state. It must be retained and validated.

The existing patient journey remains one continuous tenant-scoped workflow, including the Operations → Clinical → Operations handoff.

---

## 10. Queue Reconciliation

The repository contains multiple Queue-related surfaces/implementations. These must be reconciled before implementation.

No duplicate Queue system may be created.

The implementation must identify:

- canonical patient movement logic;
- canonical persisted state;
- valid transitions;
- Operations presentation;
- Clinical presentation;
- Administrative presentation;
- legacy/duplicate UI.

Only proven obsolete/duplicate implementations may be removed after references are migrated.

---

## 11. Overview vs Workspace vs Dashboard — Final Decision

**Workspace:** where the user works.

**Overview:** contextual understanding of the current working context: status, summary, attention, contextual KPIs and useful supporting information. Overview must not become a duplicate of the complete Workspace.

**Dashboard:** management/monitoring surface focused on performance, trends, cross-system KPIs, status and management attention.

Dashboard is not an administrative Workspace.

Clinic Admin retains complete system visibility and access according to the existing authorization model. Delegated administrators see what their permissions allow.

---

## 12. Global/Home — Final Decision

Global/Home is the system-wide entry and orientation surface.

It provides:

- orientation;
- Global Search;
- permitted cross-system Quick Actions;
- recent/relevant work;
- attention items;
- controlled entry into available Workspaces.

For Clinic Admin it is intentionally administration-heavy and cross-system. For other users it is personalized to their permitted work.

It is not a fourth business Domain and must not become a duplicate Dashboard or operational Workspace.

---

## 13. Sidebar / Information Architecture

The Sidebar is the user's complete map of accessible capabilities, organized according to Information Architecture.

It is not a list of every route, database table or component.

For every current Sidebar item determine whether it is a Domain, sub-area, feature, workflow surface, setting, report/analytics surface, contextual action or child of another feature.

A route or table alone is never sufficient reason for a top-level Sidebar entry.

Parent/child relationships follow Domain ownership, user mental model, workflow and actual use.

Patient Flow remains an explicit independent surface.

---

## 14. Patient Context / Contextual Navigation

When the user is working in a patient context, relevant cross-Domain patient-related information and actions should be reachable without repeatedly returning to the global Sidebar, where authorized.

Possible contextual destinations include visits, treatment plans, appointments, financial information, medical files/photos, follow-up, communication and Patient Portal.

This does not transfer Domain ownership; it is contextual navigation over independently owned Domains.

---

## 15. Global Search — Final Requirement

Global Search is a true system-wide capability.

It must be reachable from major surfaces, search across permitted tenant-scoped records, identify result type/context, navigate directly to the correct destination, and not require knowledge of Domain ownership.

It must respect existing permissions, tenant isolation and privacy, work in Arabic and English, and coexist with contextual searches where those are faster.

No parallel search authorization model is permitted.

---

## 16. Workspace Membership — Rejected

A separate user-facing Workspace Membership authorization layer is not part of the model.

Workspace availability is derived from the existing user/role/permission configuration and approved workspace context.

Account lifecycle states remain user/account administration concerns.

---

## 17. Mobile

Mobile is a first-class working surface. The same information hierarchy must remain understandable on small screens.

Workspace Widgets retain usable sizes and the Workspace can scroll through additional selected Widgets. Touch drag/reordering must be supported appropriately.

Explicit validation is required for Sidebar, Global Search, Workspace, Widget selection/reordering, Patient Flow, patient context, tables, forms, drawers/modals and operational/clinical actions.

---

## 18. Arabic / English

Arabic and English must have equivalent meaning and behavior across Sidebar, Workspace, Widgets, Global Search, Patient Flow, Overview, Dashboard, actions, errors, empty/loading states, terminology, RTL/LTR behavior and formatting.

The unified render-time i18n architecture remains the single presentation translation mechanism.

---

## 19. Data / Backend Preservation

The UX work must reuse existing canonical data and business logic. Existing structures for users, roles, permissions, workspaces and Patient Flow/Queue must be inspected before introducing any new data structure.

No database change is justified solely because the UI needs to look different.

If an existing structure conflicts with the approved model, the root cause must be identified before changing it.

---

## 20. Documentation Governance

This report, together with `GLOBAL_UX_IA_FINAL_DECISIONS_AMENDMENT_2026-08-28.md`, is the authoritative record of the final decisions reached in this audit.

Every implementation stage must record decisions, canonical implementations, changed files/routes, data changes, permissions affected, reconciled legacy implementations, runtime verification and deferred items.

No later wording may silently convert an authoritative decision into an optional recommendation.

---

## 21. Non-Goals

Do not:

- equate Role with a fixed screen;
- equate profession with permission;
- use Workspace as a security boundary;
- make Patient Flow appear automatically from a Role name;
- create three independent Patient Flow systems;
- make every Domain a Sidebar item;
- make every Domain a Widget;
- make every Widget an Overview card;
- make Dashboard a Workspace;
- make Workspace a Dashboard;
- use Widgets to grant permissions;
- create a second authorization model;
- delete valid capabilities to simplify navigation;
- hide duplicate code without reconciling its source;
- create duplicate navigation registries;
- transfer Domain ownership for UX convenience.

## 22. Final Approval Boundary

The following are authoritative for subsequent implementation planning/execution:

- Workspace is a working environment, not merely an Overview.
- Role is an organizational starting template, not a fixed screen.
- Permissions define actual capabilities and may cross conventional professional boundaries according to Clinic Admin configuration.
- Users may personalize Workspace through permitted Widgets and Quick Actions.
- Widgets may be operational/action-oriented, not only informational.
- Widget size must remain usable; additional Widgets remain accessible through a movable/scrollable Workspace.
- Widgets may have an optional separated Sidebar quick-access area.
- Patient Flow is one independent system with Operations, Clinical and Administrative interfaces.
- Patient Flow requires explicit enablement/context and does not appear merely from a Role name.
- Dashboard, Overview and Workspace remain distinct.
- Global/Home is system-wide orientation and access, administration-heavy for Clinic Admin.
- Workspace Membership is not a second authorization layer.
- Global Search is a real system-wide capability.
- Patient Context is a contextual navigation layer over independent Domains.
- Domain-by-Domain Widget assessment is mandatory.
- Documentation must remain synchronized and must preserve decisions exactly.

Any future change to these decisions requires explicit Product Owner approval before implementation.
