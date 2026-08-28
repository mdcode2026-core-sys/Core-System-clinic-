# CORE SYSTEM — Global UX / Information Architecture / Workspace Final Authority

**Date:** 2026-08-28
**Status:** FINAL — AUTHORITATIVE FOR UX/IA REORGANIZATION
**Scope:** Navigation, Sidebar, Workspaces, Widgets, Patient Flow, Queue, Dashboard, Overview, Search, contextual navigation, roles/permissions presentation, mobile and bilingual presentation.

> This document records the decisions explicitly established by the project owner during the Global UX / Information Architecture reconciliation. These are decisions, not recommendations. Older documents must not reinterpret them as optional guidance.

## 1. Product principle

CORE SYSTEM must provide a **Simple Surface + Deep Background Capability**. The system remains modular and powerful internally while presenting a clear, controlled and task-oriented user experience.

The governing implementation method remains:

**READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT**

and:

**Inspect → Reuse → Extend → Reconcile → Create**.

No new implementation is justified merely because another screen, route, table or component exists.

## 2. User model

A user is a member of the clinic team who is assigned a clinic-defined Role.

The Role is an organizational label and starting configuration. It does not determine what the person is allowed to do.

The Clinic Admin decides which permissions belong to that user/role, including permissions from clinical, administrative, financial, operational or other areas. CORE SYSTEM must not impose assumptions about what a role 'should' be allowed to do.

Clinic Admin may create, rename, modify, duplicate, retire and reuse roles and may create entirely new roles. Existing role templates are advisory starting points, not restrictions.

## 3. Role and Permission

**Role ≠ Permission.**

Permissions are the actual capabilities granted to the user.

A doctor may receive financial permissions. A receptionist may receive selected financial permissions. A user may receive clinical, operational and administrative permissions in any combination chosen by the Clinic Admin.

CORE SYSTEM does not decide that a permission is inappropriate merely because of the role name.

The authorization model itself is not changed by this UX work.

## 4. Sidebar

The Sidebar represents the user's accessible system capabilities and complete entry points. It is not a shortcut collection and it is not a security system.

A capability may appear in Sidebar when the user is authorized to use it.

The Sidebar must not become a storage place for every route. Parent/child relationships must be reflected in the information architecture. A child feature must not become a top-level item merely because it has a page or database table.

## 5. Workspace — final definition

A Workspace is the user's **working interface**, not merely an Overview page and not a complete copy of every capability in the Sidebar.

The Workspace is personalized to the user's work and may contain Widgets and quick actions that are useful for that user.

Workspace is not a security boundary.

The previous assumption that CORE must expose three fixed user Workspaces — Administrative, Operations and Clinical — as the mandatory surface model is superseded for the user-facing organization model by this decision.

The system must not force users into only two or three predetermined screens regardless of their permissions.

## 6. Workspace personalization

The user has a Workspace that can be customized within the capabilities granted to that user.

The user may add, remove and reorder available Widgets according to the supported customization model.

Widgets available to a user are derived from capabilities/permissions the user already has. A Widget never grants a new permission.

If a permission is removed, the corresponding capability/Widget must no longer provide access to that operation.

The Workspace must provide a sensible default arrangement so a new user does not start from an unnecessarily empty screen.

A reset/restore-default capability is required for safe customization.

## 7. Widgets — final definition

Widgets are not limited to Overview/summary cards.

A Widget may be:

1. **Information** — useful information during work.
2. **Action** — a frequently used action that can be performed quickly.
3. **Operational / Attention** — an item requiring attention, often leading directly to the relevant work.

Widgets must be justified by real work. Not every Domain requires a Widget.

For every Domain, the system must determine whether there are daily, repetitive, urgent or attention-requiring activities that genuinely benefit from a Widget. Some Domains may have many useful Widgets; some one; some none.

Widgets must not become miniature copies of Domains.

## 8. Widget Library

The system must treat the Widget Library as an independent catalog of available Widgets.

There is a distinction between:

- Widget exists in CORE SYSTEM.
- Widget is available to this user because of effective permissions/capabilities.
- Widget has been selected by the user.

The Widget Library is not an authorization engine.

Widget availability is permission-aware; Widget selection is user personalization.

## 9. Quick Actions

A Quick Action is allowed to exist independently from a full Widget. Not every fast action needs a large Widget surface.

Quick Actions and Widgets must still obey the same authorization rules.

## 10. Widget placement and screen behavior

Widgets retain their appropriate natural size. The system must not arbitrarily shrink or enlarge a Widget simply to force it into a fixed grid cell.

A maximum visible/placed count may be defined according to Widget size and screen capacity rather than by an arbitrary universal Widget count.

The Workspace is allowed to extend vertically and be navigated by scrolling, including on mobile devices.

Users can reorder Widgets by drag-and-drop, similar in principle to mobile home-screen organization.

The objective is not to hide available Widgets; it is to organize them according to personal use while keeping the interface manageable.

Responsive behavior must adapt presentation to device size without creating a different conceptual Workspace for each device.

## 11. Patient Flow — final decision

**Patient Flow is an independent system/module and remains a first-class Sidebar item when enabled and authorized.**

It is not abolished, converted into Widgets, or absorbed into a Workspace.

Patient Flow uses the existing Queue and related operational mechanisms and must continue to represent the real patient movement through the clinic.

Patient Flow has three distinct user-facing views:

- **Operations view** — operational/reception-facing patient movement.
- **Clinical view** — doctor/clinical-facing patient movement.
- **Administrative view** — management/oversight view of the full patient path and current location, with the ability to intervene/override the operational or clinical views as permitted.

These are three interfaces to one Patient Flow system, not three separate systems.

## 12. Patient Flow visibility

Patient Flow must **not** appear in Sidebar merely because a user has an Operations or Clinical role.

The Clinic Admin must explicitly enable/assign Patient Flow to the relevant user/role and select the intended Patient Flow workspace context.

Examples:

- A user whose Workspace is Operations but who is an accountant may have Operations capabilities without receiving Patient Flow.
- A receptionist may receive the Operations Patient Flow view.
- A doctor may receive the Clinical Patient Flow view.
- An administrative user may receive the Administrative Patient Flow view.

The role name alone never activates Patient Flow.

## 13. Queue

Queue remains part of Patient Flow and must not be removed or replaced merely because the user-facing architecture is being reorganized.

The existing drag-and-drop patient movement and queue behavior must be reused and reconciled with the new presentation rather than rebuilt as a parallel queue.

## 14. Patient Context and contextual navigation

When a user is working in the context of a patient, the system should provide direct contextual access to relevant authorized information and work, including where applicable:

- Visits.
- Treatment.
- Appointments.
- Financial information.
- Medical files.
- Follow-up.
- Communication.
- Portal-related context.

This does not transfer Domain ownership. It reduces unnecessary navigation between Domains.

## 15. Overview

Overview is not Workspace.

An Overview may summarize status, attention items, KPIs or relevant context. It must not become a second copy of the full Domain or a substitute for operational screens.

Widgets used in an Overview or Workspace are selected according to the purpose of that surface.

## 16. Dashboard

Dashboard is primarily an administrative/management and monitoring surface.

It must not be confused with an administrative Workspace.

Clinic Admin must retain broad visibility of system details across all relevant Workspaces. Delegated administrators may receive the appropriate administrative access.

Dashboard visibility does not automatically grant the actions represented by the Dashboard.

## 17. Global Search

CORE SYSTEM must provide a true Global Search available from a stable, obvious location.

It searches across authorized system information, not merely the current page or Domain.

Examples include patients, patient numbers, phone numbers, doctors, staff, invoices, payments, financial plans, installments, appointments, treatment plans, services, inventory, suppliers, purchase orders, tasks, requests, communications, records and events.

Results must identify the result type and context and allow direct navigation.

Global Search must respect tenant isolation, authorization, privacy and effective permissions. It must never become an alternate route around authorization.

Arabic and English queries/results must have equivalent meaning and behavior.

## 18. Roles, templates and user setup

Role Templates remain useful and are not removed.

They are advisory starting configurations that may define an initial role, permissions and sensible Workspace defaults.

Clinic Admin may modify everything necessary, create new roles, save custom roles for reuse and assign permissions freely from the available catalog.

There is no mandatory role hierarchy.

Workspace personalization must not turn templates into locked screens.

## 19. Workspace Membership

Workspace Membership is not a separate security model and must not become an additional mandatory access layer.

If an existing membership record is retained, its purpose must be limited to organizing a user's working surface/defaults and must not override effective permissions.

It must not be used to create a second authorization engine.

## 20. Authorization invariants

The UX reorganization must preserve:

- Role ≠ Permission.
- Workspace ≠ Security Boundary.
- Visibility ≠ Authorization.
- Tenant isolation.
- Server/data/action-level authorization.
- Existing auditability.
- Existing domain ownership.
- Clinic Admin authority within platform safety/security controls.

No UX shortcut, Widget, Search result, contextual action or Patient Flow surface may bypass authorization.

## 21. Domain ownership

Independent Modules + Integrated Platform remains the architectural principle.

UX reorganization must not:

- move Domain ownership;
- create duplicate Domain engines;
- merge unrelated Domains;
- embed PJ into authorization;
- turn Workspace into security;
- duplicate Queue/Patient Flow;
- create duplicate financial, clinical, communication, workforce or analytics logic.

## 22. Patient Journey relationship

PJ remains the reference for the patient journey.

Other Domains provide capabilities used by the journey but do not redefine PJ.

The user-facing system should expose integrated context where useful without forcing the user to understand the internal Domain structure.

## 23. Mobile and bilingual parity

Arabic and English must provide equivalent functionality, terminology and interaction behavior.

RTL/LTR behavior must remain correct.

The Workspace, Sidebar, Search, Patient Flow, tables, forms, dialogs, actions and contextual navigation must work on small screens.

Mobile is not a separate product surface; it is the same information architecture adapted to available space.

## 24. Implementation discipline

No implementation may begin from this document by assumption alone.

For each change:

**Inspect → Reuse → Extend → Reconcile → Create**.

Existing implementation, database records and routes are evidence to be validated, not automatic authority.

If a discrepancy requires a new architectural decision not covered by this document, implementation stops at that decision point and the issue is presented to the project owner.

## 25. Documentation rule

This document is the current UX/IA authority as of 2026-08-28.

Any older document that conflicts with it must be explicitly marked as superseded or amended. No later implementation document may silently restore an older conflicting definition.

Every implementation stage must record:

- what was inspected;
- what was reused;
- what was reconciled;
- what was extended;
- what was created;
- what was removed;
- what remained unchanged;
- runtime evidence;
- database evidence where relevant;
- final documentation update.

## 26. Final conceptual model

```text
Clinic-defined Role
        ↓
Effective Permissions
        ↓
┌──────────────────────────────────┐
│ Sidebar = complete authorized    │
│ system entry points               │
└──────────────────────────────────┘
        +
┌──────────────────────────────────┐
│ Workspace = user's working       │
│ interface                         │
└──────────────────────────────────┘
        ↓
Widgets / Quick Actions
        ↓
Personal organization

Patient Flow = independent system
  ├── Operations view
  ├── Clinical view
  └── Administrative view

Dashboard = management / monitoring

Global Search = authorized cross-system discovery
```

**This model is the controlling interpretation for the Global UX / IA reorganization.**
