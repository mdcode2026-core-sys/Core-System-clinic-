# WORKSPACE_ARCHITECTURE_SPECIFICATION.md

**Status:** Foundational Architecture (Architecture Freeze)

**Implementation status (2026-08-08):** Implemented — Session 11 delivered this architecture; Session 11 Recovery (2026-08-08) fixed build/integration defects without altering the design described below. See `CHANGELOG.md` 2026-08-08 and `PROJECT_HANDOFF.md` Open Item #9. §9's example moduleKey list (`patients, agenda, queue, billing, inventory, followup, reports, analytics`) is now fully seeded in `feature_flags` — the last two (`reports`, `analytics`) were missing until this recovery; see `supabase/migrations/20260808_seed_analytics_reports_feature_flags.sql`.

**Authority:** Equal to `MASTER_ROADMAP.md`, `ARCHITECTURE_DECISIONS.md` and `ENGINEERING_CONSTITUTION.md`.

This document defines the permanent architecture of the CORE SYSTEM Workspace.

It is **not** tied to any Milestone, Session or Implementation Package.

Every future implementation must conform to this specification.

---

# 1. Purpose

CORE SYSTEM does **not** use a traditional Dashboard.

From this document onward, the official concept is:

> **Workspace**

The Workspace is the operational environment in which every authenticated user performs daily work.

Unlike a classic Dashboard that only displays information, the Workspace is designed to become the user's primary working environment.

Every future capability must integrate into the Workspace through reusable Widgets instead of creating standalone pages or isolated dashboard panels.

---

# 2. Dashboard Terminology

To prevent future confusion:

| Old Name | New Official Name |
|------------|-------------------|
| Dashboard | Workspace |

The term **Dashboard** remains only for backward compatibility with existing source code until the migration defined in Session 11.

No future architectural document shall use the Dashboard term except when referring to legacy files.

---

# 3. Core Philosophy

The Workspace follows six permanent principles.

## 3.1 Workspace First

The first screen after authentication is the Workspace.

The Workspace is where users perform work.

It is **not** merely a landing page.

---

## 3.2 Widget First

Everything inside the Workspace is a Widget.

There are no special dashboard panels.

There are no one-off components.

Every capability must exist as a Widget.

---

## 3.3 Action First

Widgets should prioritize allowing users to perform work rather than simply displaying information.

Examples:

✓ Register Patient

✓ Quick Appointment

✓ Queue Management

✓ Room Status

✓ Internal Requests

instead of only displaying numbers.

---

## 3.4 Modular Architecture

Each Widget is completely isolated.

Every Widget owns:

- UI
- Loading
- Error handling
- Data retrieval
- Permission validation
- Feature validation

No Widget may depend on another Widget.

---

## 3.5 Permission Driven

Visibility is never controlled by roles.

Visibility is determined only through the Permission Engine.

No Widget may check:

- role name
- employee type
- clinic_owner
- doctor
- receptionist

Only permission keys.

---

## 3.6 Feature Driven

Workspace contents depend on enabled subscription features.

A Billing Widget cannot appear when Billing is not enabled.

An Inventory Widget cannot appear when Inventory is disabled.

Every Widget must pass through the Feature Registry.

---

# 4. Workspace Architecture

The Workspace is divided into three permanent layers.

---

## Layer 1

### Global Header

Always visible.

Never configurable.

Never removable.

Contains:

- CORE SYSTEM logo
- System name
- Clinic/Tenant name
- Current user
- Current workspace title
- Date
- Time
- Global Search
- Notifications
- User Menu

This is **not** a Widget.

---

## Layer 2

### Primary Interactive Workspace

Highest visual priority.

Contains interactive Widgets.

Purpose:

Perform work.

Examples:

- Queue
- Quick Registration
- Quick Appointment
- Internal Requests
- Room Status
- Follow-up
- Future Interactive Modules

These Widgets occupy the largest available area.

---

## Layer 3

### Secondary Information Workspace

Contains supporting Widgets.

Purpose:

Provide context.

Examples:

- KPIs
- Statistics
- Daily Summary
- Reports Summary
- Analytics
- Recent Activity

These Widgets have lower visual priority.

---

# 5. Widget Architecture

A Widget is the smallest reusable Workspace unit.

Every Widget must include:

- Component
- Registry Definition
- Permission
- Feature Flag
- Metadata
- Size
- Layer
- Category

A Widget without a Registry entry does not officially exist.

---

## Widget Lifecycle

Every Widget follows:

Registered

↓

Permission Check

↓

Feature Check

↓

Loading

↓

Ready

↓

Visible

or

Hidden

or

Collapsed

or

Disabled

or

Error

---

No Widget may bypass this lifecycle.

---

# 6. Widget Categories

Every Widget belongs to one category only.

### Informational

Read-only information.

Examples:

Daily totals

Statistics

KPIs

---

### Interactive

Allows direct user action.

Examples:

Quick Registration

Quick Appointment

---

### Workflow

Represents an operational process.

Examples:

Queue

Internal Requests

---

### Communication

Communication between users.

Examples:

Follow-up

Future Messaging

---

### System

Represents system state.

Examples:

Room Status

Session Status

Device Status

---

### Analytics

Displays calculated KPIs.

Uses only the Analytics Engine.

Never implements independent calculations.

---

### Reports

Displays report summaries.

Uses only the Reports Engine.

Never generates reports independently.

---

# 7. Widget Registry

Every Widget must be registered inside:

```

src/core/workspace/widgetRegistry.ts

```

No exceptions.

Each Widget definition contains:

- key
- label
- labelAr
- category
- interactionType
- layer
- defaultSize
- requiredPermission
- moduleKey
- component

Adding a Widget must require only:

1. Create the component.
2. Register it.

Nothing else.

No Workspace code modification.

No Shell modification.

No Layout modification.

This rule guarantees unlimited future extensibility.

# 8. Permission Integration

The Workspace does not implement its own permission system.

It fully reuses the CORE SYSTEM Permission Engine.

Every visibility decision must use:

- `usePermissions()`
- `hasPermission()`

No Widget may:

- Check role names.
- Check employee type.
- Check tenant ownership.
- Check hardcoded permissions.

Visibility is determined only by permission keys.

Example:

```
patients.read
queue.manage
billing.create
inventory.update
reports.view
analytics.read
```

If a Widget contains multiple actions, each action performs its own permission check independently.

Example:

A Billing Widget may be visible because of:

```
billing.read
```

while the "Create Invoice" button requires:

```
billing.create
```

Visibility and actions are intentionally separated.

---

# 9. Feature Registry Integration

Workspace visibility also depends on subscription features.

Every Widget contains one permanent moduleKey.

Examples:

```
patients
agenda
queue
billing
inventory
followup
reports
analytics
```

Visibility formula:

```
Visible

=

Permission Granted

AND

Feature Enabled

AND

User has not hidden the Widget
```

Every Widget must call:

```
isFeatureEnabled()
```

No Widget may query:

```
feature_flags
```

directly.

The Feature Registry is the single source of truth.

---

# 10. Workspace Templates

Templates define the initial Workspace.

Templates are starting points only.

Users may customize their own Workspace afterwards.

Default templates include:

## Clinic Administrator

Largest default Workspace.

Contains:

- Operational Widgets
- Administrative Widgets
- Analytics
- Reports

subject to permissions and subscription.

---

## Doctor

Focused on patient care.

Typical Widgets:

- Queue
- Room Status
- Quick Appointment
- Follow-up
- Internal Requests

---

## Reception

Focused on patient flow.

Typical Widgets:

- Queue
- Quick Registration
- Quick Appointment
- Room Status
- Internal Requests

---

## Accounting

Focused on finance.

Typical Widgets:

- Billing
- Payments
- Revenue KPIs
- Reports

---

Templates never grant permissions.

Templates only define the initial layout.

---

# 11. Workspace Customization

Every user owns an individual Workspace.

Users may:

✓ Add Widgets.

✓ Remove Widgets.

✓ Collapse Widgets.

✓ Pin Widgets.

✓ Reorder Widgets.

✓ Save Layout.

Users may only add Widgets they are allowed to access.

A Widget hidden because of permissions or subscription cannot be added.

Future custom Templates may be created by the Clinic Administrator.

Those Templates remain constrained by the Permission Engine.

---

# 12. Widget States

Every Widget exists in one state.

Visible

Default operational state.

---

Hidden

Hidden by the user.

Not rendered.

---

Collapsed

Rendered as a minimized Widget.

Expandable.

---

Pinned

Always displayed before normal Widgets.

---

Disabled

Visible but actions unavailable.

Useful when:

- Read permission exists.

- Edit permission does not.

---

Loading

Fetching data.

Must display loading UI.

---

Error

Data retrieval failed.

Must provide Retry.

Silent failure is prohibited.

---

# 13. Interactive Widgets

Interactive Widgets form the operational core of the Workspace.

These Widgets prioritize actions rather than information.

Current foundational Widgets include:

- Queue
- Quick Registration
- Quick Appointment
- Room Status
- Follow-up
- Internal Requests

Future modules follow exactly the same architecture.

Interactive Widgets are expected to communicate with existing domain logic.

No business logic duplication is permitted.

---

# 14. Internal Requests

Internal Requests are not notifications.

They are operational tasks.

Lifecycle:

```
Requested

↓

Acknowledged

↓

In Progress

↓

Resolved

or

Declined
```

Examples:

Doctor requests assistant.

Reception requests doctor approval.

Doctor requests inventory supplies.

Treatment room requests cleaning.

Each request may contain:

- Priority
- Category
- Target User
- Notes

The recipient receives:

- Notification Badge

- Sound Alert

- Pending Counter

Opening the Widget marks the request as acknowledged.

Future implementation will include filters and history.

---

# 15. Patient Workflow Widget

One of the primary interactive Widgets.

Purpose:

Move patients through the clinic workflow.

Example stages:

Waiting

↓

Reception

↓

Room

↓

Consultation

↓

Procedure

↓

Billing

↓

Completed

The Widget supports Drag & Drop only inside the workflow itself.

Moving a patient updates the underlying workflow state.

It does not merely change UI order.

All transitions must pass validation rules defined by the Workflow Engine.

The Workspace only provides the interaction surface.

Business logic remains inside the domain layer.

---

# 16. Drag & Drop Rules

Drag & Drop exists for two independent purposes.

## A.

Workspace Layout

Users may reorder Widgets inside the same layer.

Users cannot move Widgets between Layer 2 and Layer 3.

The Global Header cannot be moved.

---

## B.

Workflow Interaction

Modules such as Queue and Patient Workflow may use Drag & Drop as an operational tool.

Examples:

Move patient to consultation.

Move patient to procedure.

Move patient to billing.

These actions change real workflow state.

They are not cosmetic operations.

Future modules may implement Drag & Drop when operationally justified.

# 17. Workspace Persistence

Workspace customization is stored per user.

The system stores:

- Widget visibility
- Widget order
- Widget size
- Pinned Widgets
- Collapsed Widgets

The Workspace never stores permissions.

Permissions are always resolved dynamically through the Permission Engine.

If a user's permissions change, the Workspace automatically reflects those changes without modifying the saved layout.

---

# 18. Future Compatibility

The Workspace must be capable of accepting unlimited future Widgets without architectural modification.

Adding a new Widget must always follow the same process:

1. Build the Widget component.
2. Register it in `widgetRegistry.ts`.
3. Assign:
   - Permission
   - Feature Module
   - Category
   - Layer
4. Done.

No modification to:

- Workspace Shell
- Workspace Engine
- Layout Engine
- Permission Engine
- Feature Registry

should ever be required.

This guarantees long-term scalability.

---

# 19. Dashboard Migration Rules

To eliminate confusion between legacy Dashboard code and the new Workspace architecture, the following rules are mandatory.

## Legacy Name

The term **Dashboard** is considered legacy terminology.

All future documentation uses **Workspace**.

---

## Legacy Files

Existing Dashboard files remain temporarily in place until the migration session.

Example:

```
src/features/dashboard/
```

These files continue to operate during transition.

---

## Migration Session

The migration is executed during Session 11.

Its responsibilities include:

- Renaming Dashboard components to Workspace equivalents.
- Removing duplicate Dashboard logic.
- Introducing the Widget Registry.
- Introducing the Workspace Engine.
- Keeping all existing business logic intact.

No business functionality may be rewritten during migration.

Only architecture and organization are changed.

---

## Compatibility Rule

During migration, existing imports may remain functional until every reference has been updated.

Breaking imports are prohibited.

The migration must remain backward-compatible throughout the implementation session.

---

# 20. Recommended Folder Structure

```
src/
 ├── core/
 │    └── workspace/
 │         ├── workspaceEngine.ts
 │         ├── widgetRegistry.ts
 │         ├── workspace.types.ts
 │         ├── workspace.constants.ts
 │         └── hooks/
 │
 ├── features/
 │    └── workspace/
 │         ├── WorkspaceShell.tsx
 │         ├── WorkspaceRenderer.tsx
 │         ├── WidgetContainer.tsx
 │         ├── WidgetToolbar.tsx
 │         └── widgets/
 │              ├── queue/
 │              ├── patients/
 │              ├── billing/
 │              ├── analytics/
 │              ├── reports/
 │              ├── followup/
 │              ├── rooms/
 │              └── internal-requests/
 │
 └── app/
      └── (dashboard)/
           └── page.tsx
```

This structure is the long-term architectural target.

Minor implementation details may evolve without changing the overall architecture.

---

# 21. Engineering Rules

The following rules are mandatory.

## Rule 1

No Widget may exist outside the Widget Registry.

---

## Rule 2

No Widget may bypass the Permission Engine.

---

## Rule 3

No Widget may bypass the Feature Registry.

---

## Rule 4

No Widget may contain business logic belonging to another module.

Widgets orchestrate.

Domain modules execute.

---

## Rule 5

Widgets must communicate only through public domain APIs.

They never access another Widget directly.

---

## Rule 6

Widgets must remain reusable.

Nothing inside a Widget may assume:

- Doctor
- Receptionist
- Clinic Administrator
- Accountant

Widgets depend only on permissions and enabled features.

---

## Rule 7

Interactive Widgets must perform real work.

Pure display Widgets belong to the Information layer.

---

## Rule 8

Reports and Analytics are separate architectural concepts.

Reports generate structured business output.

Analytics calculate KPIs and operational indicators.

Neither may replace the other.

---

## Rule 9

Workspace customization is personal.

A user's layout must never affect another user's Workspace.

---

## Rule 10

Every future Workspace capability must be implemented as a Widget unless an Architecture Decision Record (ADR) explicitly states otherwise.

---

# 22. Reserved Architecture

The following Workspace extensions are intentionally reserved for future milestones.

They are not authorized for implementation until dedicated architectural decisions are published.

- AI Widgets
- Marketplace Widgets
- Third-party Widgets
- Plugin Widgets
- IoT Widgets
- Telemedicine Widgets
- Patient Self-Service Widgets
- Executive Management Widgets

Their reservation prevents future restructuring of the Workspace architecture.

---

# 23. Architecture Freeze

This document establishes the permanent Workspace architecture for CORE SYSTEM.

From the date of approval:

- The Workspace replaces the Dashboard as the official concept.
- Every Workspace implementation must comply with this specification.
- Future milestones extend this architecture; they do not redefine it.
- Any change to this document requires a formal Architecture Decision Record (ADR).

This document serves as the single architectural reference for all Workspace-related development throughout the lifecycle of CORE SYSTEM.
