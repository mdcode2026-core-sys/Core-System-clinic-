# CORE SYSTEM — Workspace Architecture Specification

**Status:** CURRENT — RECONCILED 2026-08-28 — AMENDED
**Authority:** `GLOBAL_UX_IA_FINAL_DECISIONS_AMENDMENT_2026-08-28.md` and `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`
**Historical note:** Earlier Workspace specifications remain in Git history for architectural history. Conflicting earlier wording is superseded by the current decisions recorded above.

## 1. Purpose

CORE SYSTEM uses Workspaces as working environments. A Workspace is not merely an Overview, not a management Dashboard, not a fixed role screen, and not a security boundary.

The target experience is:

`Simple Surface + Deep Background Capability + Independent Domains + Explicit Integration`

The user should be able to work without needing to understand the internal architecture of CORE SYSTEM.

## 2. Authoritative distinctions

`Role ≠ Permission ≠ Workspace ≠ Capability`

- **Role:** a clinic-defined organizational starting template.
- **Permission:** authorization to access or perform an action.
- **Workspace:** the user's working environment.
- **Capability:** a feature/action provided by the platform.
- **Widget:** a user-selectable presentation or workflow tool for an already authorized capability.

Clinic Admin controls roles and permissions according to the clinic's actual operating model. Profession-based assumptions must not restrict what Clinic Admin may assign within the existing authorization model.

## 3. Role and template model

Existing role models/templates are retained as aids, not mandatory screens or permission boundaries.

Clinic Admin may use, modify, create, save and reuse roles/templates. Future templates may include suggested initial Workspace arrangements and Widgets. All such starting configurations remain editable.

## 4. Workspace contexts

### Operations Workspace

A working environment for permitted operational work. It may contain appropriate operational capabilities, including where justified:

- Quick Registration
- Quick Appointment
- Patient Search
- operational tasks/requests
- permitted financial capabilities configured for that user
- Patient Flow entry/actions only when Patient Flow is explicitly enabled for that user in Operations context

A financial capability shown in Operations remains owned by the Financial Domain.

### Clinical Workspace

A working environment for permitted clinical work. It is not a hard-coded Doctor screen. Clinical capabilities are surfaced here when the user has the relevant permissions and the approved clinical context.

### Administration Workspace

A working environment for tenant administration and configuration. It is distinct from management Dashboard surfaces.

### Global/Home Workspace

The system-wide orientation and entry surface. It provides Global Search, useful permitted cross-system Quick Actions, recent/relevant work, attention items and controlled entry to available workspaces.

For Clinic Admin it is intentionally administration-heavy and cross-system while preserving complete system visibility. For other users it is personalized to permitted work.

Global/Home is not a business Domain and is not a duplicate Dashboard.

## 5. Workspace personalization

Workspace is customizable by the user within the capabilities granted by Clinic Admin.

The user may add/remove permitted Widgets, reorder them by drag and drop, place frequent tools earlier, move through additional selected Widgets beyond the immediate viewport and restore an appropriate default configuration.

The system must provide useful defaults. Users are not required to design a Workspace from an empty screen.

## 6. Widget architecture

Widgets are reusable presentation/workflow units. They are not permissions.

Availability follows:

`Capability → Permission check → Widget available → User adds to Workspace`

Removing the permission must not leave the Widget as an unauthorized access path.

Widgets must reuse canonical Domain logic and must not duplicate business rules.

### Widget types

Widgets may be:

- Information
- Action
- Attention/Operational
- Context/Summary
- combinations where useful

Not every Domain requires a Widget. Widget creation is justified only where a real daily, frequent, urgent, attention-oriented or high-value workflow benefits from it.

### Widget categories

Categories organize discovery and do not grant access. Candidate categories include Patients, Appointments, Clinical, Financial, Operations, Communication, Tasks, Inventory/Resources, Analytics/Information and System. The final inventory must follow actual Domain inspection.

### Widget size and movement

Widgets retain usable sizes. The system must not squeeze Widgets merely to fit more into one viewport.

The Workspace is a movable/scrollable working surface. Additional selected Widgets remain accessible beyond the immediately visible area. Users can reorder them through drag and drop.

The visible count is naturally constrained by Widget dimensions and device space, but additional selected Widgets are not deleted or disabled because they do not fit in the initial viewport.

### Sidebar Widget quick access

Widgets may also be exposed in a clearly separated optional quick-access area in the user's Sidebar. This is convenience only. It does not replace the complete Domain/Feature hierarchy, turn Widgets into Sidebar features, or create another authorization model.

## 7. Quick Actions

Not every fast action must be a full Widget. Compact actions such as New Patient, New Appointment or Create Invoice may be presented where appropriate.

The decision between Widget and Quick Action is based on the real workflow.

## 8. Patient Flow

Patient Flow is an independent Sidebar surface and one coherent workflow system.

It is not a child of Operations or Clinical and must not be replaced by generic Queue functionality.

Patient Flow has three contextual interfaces for the same underlying system:

1. Operations — reception/operational movement, routing, return and completion.
2. Clinical — clinician-facing movement and clinical handoff/work.
3. Administrative — complete operational visibility and intervention for authorized administrators.

Patient Flow must not appear merely because a user's Role is named Operations, Reception, Doctor or another role.

Clinic Admin explicitly enables Patient Flow for a user and selects the applicable context. An Operations user may therefore have Operations Workspace without Patient Flow.

The existing drag-and-drop movement is a real workflow action and must remain validated and persisted.

The existing patient journey remains continuous, including:

`Operations → Clinical → Operations`

There must be one canonical Patient Flow/Queue workflow implementation with contextual views, not competing workflows.

## 9. Overview, Workspace and Dashboard

**Workspace:** where the user works.

**Overview:** contextual understanding of the current working context — status, summary, attention, contextual KPIs and supporting information. It must not duplicate the complete Workspace.

**Dashboard:** management/monitoring — performance, trends, cross-system KPIs, status and management attention. It is not an administrative Workspace and not an operational workspace.

Clinic Admin retains complete system visibility/access under the established authorization model. Delegated administrators see what their permissions allow.

## 10. Navigation

Navigation follows:

`Global/Home → Workspaces → logical sub-areas → contextual features → operational actions`

A route, database table or component does not automatically become a top-level Sidebar item.

Every Sidebar item must be classified as Domain, sub-area, feature, workflow surface, setting, report/analytics surface, contextual action or child of another feature.

Patient Flow remains an independent explicit surface.

## 11. Patient Context

When working in a patient context, relevant cross-Domain information/actions should be reachable without unnecessary return to the global Sidebar, where authorized.

Examples include visits, treatment plans, appointments, financial information, medical files/photos, follow-up, communication and Patient Portal.

This is contextual navigation, not Domain ownership transfer.

## 12. Global Search

Global Search is a true system-wide capability. It must search permitted tenant-scoped records/features, identify result type/context, navigate directly to the correct destination, work in Arabic and English and respect authorization, privacy and tenant isolation.

It does not replace contextual search where that is faster.

## 13. Workspace Membership

A separate user-facing Workspace Membership authorization layer is rejected.

Workspace availability is derived from existing user/role/permission configuration and approved workspace context. Account lifecycle remains a user/account administration concern.

## 14. Mobile

The same Information Architecture must work on small screens. Workspace Widgets preserve usable dimensions; additional selected Widgets remain accessible by scrolling; touch drag/reordering must be supported.

Explicit validation is required for navigation, Global Search, Workspace, Widget configuration, Patient Flow, patient context, forms, tables and actions.

## 15. Arabic / English

Arabic and English must have equivalent meaning and behavior across navigation, Workspace, Widgets, Global Search, Patient Flow, Overview, Dashboard, actions, states, terminology, RTL/LTR and formatting.

The unified render-time i18n architecture remains the single presentation translation mechanism.

## 16. Authorization and data integrity

No new authorization model is approved.

Workspace and Widgets are presentation mechanisms. They must never bypass server-side authorization, tenant isolation, RLS or auditability.

Existing users, roles, permissions, workspaces and Patient Flow/Queue data structures must be inspected and reused before creating new data structures.

## 17. Domain-by-Domain Widget assessment

Before implementation, every Domain must be assessed for whether a Widget genuinely improves daily/frequent/urgent/attention-oriented work. Some Domains will have several Widgets; some one; some none.

For each candidate Widget record:

- purpose;
- type;
- category;
- required permission;
- source Domain;
- user action/destination;
- whether an existing implementation can be reused;
- mobile behavior;
- Arabic/English behavior.

## 18. Documentation and implementation gate

The authoritative execution sequence is:

`Documentation → Repository Reconciliation → Patient Flow/Queue Reconciliation → Workspace/Widget Reconciliation → Navigation → Global Search → UX Consistency → Mobile/I18N → Runtime → Regression → Closure Documentation`

Every implementation stage must document decisions, canonical implementations, changed routes/components, data changes, permissions affected, reconciled legacy implementations, runtime validation and deferred items.

No approved decision may later be rewritten as an optional recommendation.

Use:

`Inspect → Reuse → Extend → Reconcile → Create`

Create only for proven gaps.

## 19. Explicit non-goals

Do not make Role a fixed screen; make profession a permission boundary; use Workspace as security; make Patient Flow appear automatically from Role; create three Patient Flow systems; make every Domain a Sidebar item or Widget; make every Widget an Overview card; turn Dashboard into Workspace; use Widgets to grant permissions; create a second authorization model; transfer Domain ownership for UX convenience; or remove valid capability solely to simplify the interface.

## 20. Authority

The 2026-08-28 final UX/IA decision amendment is authoritative for Workspace, Widget, Patient Flow, Sidebar and presentation behavior. Any future change to those decisions requires explicit Product Owner approval before implementation.
