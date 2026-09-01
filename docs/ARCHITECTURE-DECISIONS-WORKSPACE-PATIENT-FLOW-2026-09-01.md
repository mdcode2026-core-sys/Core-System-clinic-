# CORE SYSTEM — Approved Architecture Decisions
## Workspace, Patient Flow, Role, Permissions, Widgets & Navigation
### 2026-09-01

**Status: APPROVED / BINDING**

This document records the currently approved decisions for this subject. It supersedes any earlier documentation that conflicts with these decisions. It is the architectural reference for the later engineering specification and execution plan.

## 1. Patient Journey vs Patient Flow

- **Patient Journey** and **Patient Flow** are different concepts and must never be used interchangeably.
- **Patient Journey** is the complete journey of the patient with the clinic and is a system-wide concept with its two documented parts.
- **Patient Flow** is an internal workflow and is only one part of the complete Patient Journey.
- Patient Flow concerns what the clinic team must do with the patient from the patient's entry into the clinic onward; it does not begin with the patient's first contact or appointment booking.

## 2. Patient Flow

- Patient Flow remains a real workflow concept and is not deleted or redesigned.
- It organizes the internal relationship between the clinic's Clinical, Operational, and Administration work areas around the patient.
- Clinical, Operational, and Administration are **work classifications within Patient Flow**, not Roles and not permission sets.
- Patient Flow must not appear to ordinary clinic users as a standalone Module or Domain in the Sidebar.
- Patient Flow may remain available to Clinic Admin in the administrative/background context for configuration, oversight, and validation of the workflow.
- The classification selected for a user is used by the system to provide the appropriate default work environment and to understand the user's primary area of responsibility in the Patient Flow.

## 3. Role

- Role represents the user's job/function within the clinic team.
- Role is not the same thing as Clinical, Operational, or Administration.
- The system may provide predefined role/permission templates for common clinic team functions.
- These predefined permissions are default and advisory; they are not immutable final permissions.
- Clinic Admin can determine the user's actual permissions.
- Adding permissions outside the user's primary Patient Flow classification does not change the user's Role or primary classification and does not remove the user's responsibility in the primary area.

## 4. Clinic Admin

- Clinic Admin is not an ordinary clinic user with a larger permission set.
- Clinic Admin is the administrative authority for the clinic within the platform and is responsible for the clinic as a whole.
- Clinic Admin is above the Administration work classification in scope of authority, while remaining below Super Admin at the platform level.
- Clinic Admin can manage the clinic's users, Roles, permissions, Patient Flow classifications, Workspace configuration, Modules/Domains and other clinic-level administration capabilities allowed by the platform.
- The current test Clinic Admin account is intentionally an open test account and must be able to see and test the full currently available subscribed system while the product remains under implementation.

## 5. Workspace

- Workspace is a user's work environment, not a Role, not a permission set, and not Patient Flow itself.
- The system provides a default Workspace appropriate to the user's Patient Flow work classification.
- The three work environments are Clinical, Operational, and Administration in function, regardless of whether those names are explicitly displayed to the user.
- Workspaces must be genuinely different in their daily work, not merely differently named copies of the same dashboard.
- The purpose of Workspace is to place the user's relevant daily work in an understandable and usable environment.
- Workspace is a presentation/work surface; it does not redefine ownership of Patient Journey or Patient Flow.

## 6. My Workspace

- My Workspace is the user's personal working surface within the assigned/default Workspace.
- It begins with default widgets selected from the user's most important granted capabilities/permissions.
- The default emphasis is on **executive/action-oriented widgets**, because My Workspace is primarily for doing daily work rather than merely viewing information.
- Informational widgets are allowed when they are useful to daily work.
- The user may personalize My Workspace within the capabilities granted to that user, including ordering, showing, hiding, and otherwise arranging available widgets as supported by the product.
- Personalization must not grant access or permissions that the user does not have.

## 7. Widgets and Permissions

- A widget is an interface to a capability or useful information; it is not an authorization mechanism.
- Widget availability and behavior must respect the user's actual permissions.
- The widget's behavior must reflect the level/type of permission, not merely the existence of a related module.
- A read-only permission may produce an informational widget only; it must not expose actions the user cannot perform.
- A write/create permission may expose the corresponding writing/creation action without exposing modification or other higher-level actions that are not granted.
- Edit/modify and higher permissions may expose the corresponding additional actions.
- If the user has no relevant permission, the widget/action must normally be absent. A locked `🔐` presentation is acceptable where showing the unavailable capability is intentionally useful and does not imply access.
- Widgets may provide fast entry points into Patient Flow work, but a widget never replaces Patient Flow and never grants authorization.

## 8. Sidebar / Navigation

For ordinary subscribed clinic users, the primary navigation model is:

```text
LOGIN
  │
  ▼
HOME
  │
  ├── General information about daily clinic work
  │
  ▼
WORKSPACE
  │
  ▼
MY WORKSPACE
  │
  ├── Default executive/action widgets
  ├── Useful informational widgets
  └── User personalization
  │
  ▼
MODULES / DOMAINS
  │
  ├── Clinical
  ├── Operational
  └── Administration
  │
  ▼
MY SETTINGS
  │
  └── Personal account settings
```

- The Sidebar must not contain a `Patient Flow` item for ordinary users.
- Modules/Domains shown to a user are those relevant and authorized for that user.
- The Sidebar must not turn general Domains into artificial labels such as `My Financial` or `My Agenda`; they remain general Modules/Domains governed by authorization.
- `My Workspace` is not the same as `My Settings`.

## 9. My Settings

My Settings is reserved for the user's personal account/preferences, such as:

- Display name.
- Password change.
- Personal profile image.
- Other personal account preferences and user-level settings.

These do not belong in My Workspace.

## 10. Home

- Home is the landing page after login.
- Home is **not** the user's Workspace.
- Home provides general information useful at the start of the user's work, such as daily appointment counts, reminders, notifications, internal communications, Patient Portal information, Work Center information, and similar general daily context as ultimately approved during detailed design.
- The current contents of Home must not be treated as proof that every current widget belongs there.
- Operational actions such as Quick Registration and Quick Appointment must not be placed in Home merely because they are useful actions; their proper placement must follow the approved Workspace/Widget model.
- The exact final Home contents are a later design decision within this architectural boundary.

## 11. Global Search

- Global Search is a system-wide search capability, not a Home widget and not a Workspace.
- It is presented as a **search bar in the page header**.
- Search results are constrained by the user's authorization.
- Global Search may locate authorized records and navigate to their permitted context.
- Its detailed engineering behavior must be specified before implementation; it must not be invented ad hoc during coding.

## 12. Architectural Simplicity Principle

- The user-facing experience must remain simple.
- Architectural complexity belongs in the appropriate backend/domain layers and must not be exposed unnecessarily through the UI.
- Role, Patient Flow classification, permissions, capabilities, Workspace, Modules/Domains, and widget behavior are distinct concepts even when they cooperate to produce one simple user experience.
- No implementation may collapse these concepts merely because doing so appears simpler in code or documentation.

## 13. Implementation Governance

- These decisions are the current approved architectural baseline for this subject.
- Conflicting older architecture, UX/IA, implementation, or execution documents are superseded and must not be used as authority for implementation.
- No engineering specification or execution plan is implied by this document alone.
- Before implementation, the approved architecture must be translated into an explicit engineering specification and then into an implementation plan, both of which require approval before execution.
- No database, code, runtime, or production change is authorized merely by recording these decisions.

**End of Approved Architecture Decisions.**
