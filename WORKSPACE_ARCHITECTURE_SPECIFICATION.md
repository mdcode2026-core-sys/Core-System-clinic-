# CORE SYSTEM — Workspace Architecture Specification

**Status:** Current — Reconciled 2026-08-28
**Historical note:** The previous 2026-08-08 single-Workspace specification is preserved in Git history. This file is now the current Workspace specification and supersedes conflicting wording from the earlier version.
**Related authority:** `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md` and `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`.

## 1. Purpose

CORE SYSTEM uses Workspaces as working environments. A Workspace is not merely an Overview, not a traditional KPI dashboard, not a role-specific hard-coded screen, and not a security boundary.

The target experience is:

`Simple Surface + Deep Capability + Independent Domains + Explicit Integration`

The user should be able to work without needing to understand the internal architecture of CORE SYSTEM.

## 2. Authoritative distinctions

`Workspace != Role != Permission != Capability`

- **Workspace:** the working environment in which capabilities are presented.
- **Role:** a clinic-defined way of grouping/assigning permissions.
- **Permission:** authorization to access or perform an action.
- **Capability:** a feature or action exposed by the platform.

Clinic Admin controls the clinic's role and permission configuration. CORE SYSTEM does not impose profession-based permission restrictions.

## 3. Workspace contexts

CORE SYSTEM has four presentation contexts:

### Operations Workspace

The operational/reception working environment.

It may contain permitted capabilities such as:

- Quick Registration
- Quick Appointment
- Patient Search
- Patient Flow entry/actions
- Operational requests/tasks
- Other permitted operational or cross-domain capabilities

A permission granted to an Operations user may surface the permitted capability in Operations without changing Domain ownership.

### Clinical Workspace

The medical working environment for users with the relevant permissions.

It is not a hard-coded doctor screen. Clinic Admin may configure roles and permissions according to the clinic's actual workflow.

### Administration Workspace

The tenant administration and configuration working environment.

It is distinct from operational work and from management Dashboard surfaces.

### Global/Home Workspace

The system-wide entry and orientation surface.

It provides:

- Global Search
- useful cross-system quick actions
- recent/relevant work
- attention items
- controlled entry to available Workspaces

For Clinic Admin it is intentionally administration-heavy and cross-system. For other users it is personalized to their permitted work.

Global/Home is not a fourth business Domain and must not become a duplicate Dashboard.

## 4. Patient Flow

Patient Flow is an independent navigation surface.

It is not a child of Operations or Clinical because the patient journey crosses both.

Patient Flow supports three presentation contexts:

1. **Operations** — reception/operational patient movement.
2. **Clinical** — clinician-facing patient movement and handoff.
3. **Administrative** — complete operational visibility and intervention for authorised administrators.

The underlying patient journey remains one tenant-scoped journey:

`Scheduled / Walk-in → Arrived → Waiting → With Provider → Pending Reception → Completed`

Operational continuity remains:

`Operations → Clinical → Operations`

The existing persisted drag-and-drop workflow is an operational action. It changes real workflow state and must continue to pass domain validation.

There must be one canonical Patient Flow/queue domain implementation with contextual views, not competing workflow implementations.

## 5. Workspace vs Overview vs Dashboard

### Workspace

Where the user works.

### Overview

Contextual understanding of the current Workspace:

- status
- summary
- attention
- contextual KPIs
- useful supporting information

Overview must not become a duplicate of all Workspace operations.

### Dashboard

Management/monitoring surface for authorised management users:

- performance
- trends
- cross-system KPIs
- status
- management attention

Dashboard must not replace Workspace or become a duplicate operational interface.

Clinic Admin retains full system visibility according to the existing authorization model. Delegated administrators see what their permissions allow.

## 6. Widget architecture

Widgets remain the reusable units used inside Workspace surfaces.

A Widget should have:

- component
- registry definition
- permission requirement
- feature requirement where applicable
- metadata
- category
- display/interaction behavior

Widgets must reuse Domain logic. They must not duplicate business rules.

Widget categories may include:

- Informational
- Interactive
- Workflow
- Communication
- System
- Analytics
- Reports

Interactive Widgets must perform real work. Informational Widgets provide context.

## 7. Permission and feature integration

Workspace presentation reuses the existing permission engine and feature/entitlement architecture.

Visibility must not be based on hard-coded professions such as Doctor, Receptionist or Accountant.

Actions may require more specific permissions than the visibility of the containing surface.

Workspace presentation is not a security boundary.

Server-side authorization, tenant isolation and RLS remain authoritative.

## 8. Workspace Membership

There is no separate user-facing Workspace Membership authorization layer.

Workspace availability is derived from the existing user/role/permission configuration.

User lifecycle is separate and includes account states such as invitation, activation, active status, suspension/deactivation and removal according to the existing user administration model.

No second permission or membership security system may be introduced.

## 9. Navigation architecture

Navigation follows:

`Global/Home → Workspaces → logical sub-areas → contextual features → operational actions`

A route, database table or component does not automatically become a top-level Sidebar item.

For every navigation item, determine whether it is:

- Domain
- Subdomain/sub-area
- Feature
- Workflow surface
- Setting
- Report/Analytics surface
- Contextual action
- Child of another feature

Parent/child relationships must follow domain ownership, user mental model and workflow.

## 10. Global Search

Global Search is a true system-wide capability.

It must:

1. be accessible from major system surfaces;
2. search across permitted tenant-scoped records and relevant features;
3. support meaningful identifiers and natural queries;
4. clearly identify result type/context;
5. navigate directly to the correct destination;
6. avoid requiring knowledge of Domain ownership;
7. respect permissions and tenant isolation;
8. support Arabic and English.

Global Search does not replace contextual search where contextual search is faster.

The technical implementation is not prescribed by this specification.

## 11. Progressive disclosure

The system simplifies the surface, not the capability.

Basic actions should be obvious. Advanced capabilities remain available through contextual entry points, detail views, menus and appropriate sub-areas.

Settings must not unnecessarily contaminate daily operational workflows.

## 12. Mobile

The same information architecture must work on small screens.

Mobile implementations must explicitly validate:

- navigation
- Global Search
- Workspace switching
- Patient Flow
- patient context
- forms
- tables
- actions
- drawers/modals

Mobile is not merely a scaled desktop layout.

## 13. Arabic / English

Arabic and English must have parity across:

- Workspace names
- navigation
- page titles
- actions
- search
- empty/error/loading states
- Patient Flow
- Overview
- Dashboard
- terminology
- RTL/LTR behavior

The unified render-time i18n architecture is the single presentation translation mechanism.

## 14. Architecture preservation

UX changes must not:

- transfer Domain ownership for convenience;
- create duplicate Domains;
- create duplicate permission systems;
- use Workspace as a security boundary;
- bypass tenant isolation;
- duplicate business logic;
- redefine Patient Journey ownership;
- remove valid capabilities merely to simplify navigation.

Use:

`Inspect → Reuse → Extend → Reconcile → Create`

Create only when a real gap has been proven.

## 15. Legacy reconciliation

Legacy Dashboard/Workspace components may remain until their references have been reconciled.

No legacy implementation is removed merely because a newer surface exists. Removal requires proof that it is duplicate, obsolete, broken, or superseded.

The 2026-08-28 Global UX/IA audit is the governing record for the current reconciliation and implementation sequence.

## 16. Implementation gate

The architecture is documented before product implementation.

The approved execution plan is:

`Documentation → Repository Reconciliation → Patient Flow/Queue Reconciliation → Workspace Reconciliation → Navigation → Global Search → UX Consistency → Mobile/I18N → Runtime → Regression → Closure Documentation`

No major architectural decision beyond this approved model may be implemented without explicit Product Owner approval.
