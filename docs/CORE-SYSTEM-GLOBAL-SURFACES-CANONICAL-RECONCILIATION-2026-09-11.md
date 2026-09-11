# CORE SYSTEM — Global Surfaces Canonical Reconciliation
## Home × Header × Role Workspace × My Workspace × Sidebar
### 2026-09-11

**Status:** CANONICAL RECONCILIATION BASELINE — OWNER APPROVED FOR DOCUMENTATION SYNC
**Scope:** All current architecture and engineering documentation that defines, references, or depends on Home, Header, Workspace, Role, Primary Work Context, My Workspace, Sidebar, Widgets, Permissions, Communications, Notifications, My Settings, or their relationships.

> This document does not create a new product architecture. It makes the current approved meaning explicit and removes ambiguity that previously appeared because the same terms were used at different abstraction levels.

## 1. Canonical User Model

```text
USER
│
├── Primary Role / Job Function
│      │
│      └── Primary Work Context / Classification
│              │
│              └── ROLE WORKSPACE
│
├── Actual Effective Permissions
│      │
│      └── Authorized Capabilities / Domains / Actions
│              ├── Sidebar entries
│              ├── available Widgets
│              └── additional tools in My Workspace
│
├── MY WORKSPACE
│      └── personal arrangement of permitted work/tools
│
├── MY SETTINGS
│      └── personal account/preferences
│
└── HOME
       └── global starting / awareness surface
```

## 2. Role Workspace Rule

Role Workspace is the user's primary professional working environment.

It is derived from the user's primary work role/context, not from the total set of permissions the user happens to have.

Examples:

- Doctor / Clinical → Clinical Workspace.
- Reception / Operational → Operational Workspace.
- Administration-oriented primary work → Administration Workspace.

The current Clinical Workspace and Operational Workspace are complete primary work environments for their respective work. This reconciliation does not authorize redesigning or enlarging them merely because a user receives additional permissions.

## 3. Permission Expansion Rule

Additional permissions MUST NOT redefine:

- the user's Primary Role;
- the user's Primary Work Context;
- the user's Role Workspace.

Instead, additional effective permissions may expand what the user can access through:

- authorized Sidebar Domains/entries;
- available Widgets;
- My Workspace content and arrangement;
- permitted actions inside existing Domains;
- other authorized navigation or capability surfaces.

Example:

```text
Doctor
Primary Context = Clinical
Role Workspace = Clinical

Additional permissions:
Financial Read
Reports Read
Operational capability
Administration capability

RESULT:
Clinical Workspace remains Clinical.
Sidebar may expose authorized Financial / Reports / other Domains.
My Workspace may expose permitted widgets/tools from those capabilities.
The user's Role does not change merely because permissions expanded.
```

## 4. Permission Does Not Redefine Identity

```text
Permission expansion ≠ Role change
Permission expansion ≠ Work Context change
Permission expansion ≠ Role Workspace change
```

A Role may itself be edited by Clinic Admin because roles are configurable starting templates. That is a separate intentional role-management operation and must not be confused with an individual permission override or capability grant.

## 5. My Workspace Rule

My Workspace is the user's personal working surface associated with the user's assigned/default work context.

It is:

- personal;
- configurable;
- permission-aware;
- action-oriented by default;
- capable of containing useful informational widgets;
- able to surface capabilities from outside the primary work classification when the user is authorized.

It is NOT:

- a replacement for Role Workspace;
- a second role;
- a second authorization system;
- a second Patient Flow engine;
- a full duplicate of a Module/Domain;
- Home.

Personalization changes presentation only. It never grants access.

## 6. Sidebar Rule

Sidebar navigation is not the user's Role Workspace.

Sidebar visibility for Domains/Modules is driven by effective authorization and product capability/entitlement rules.

Primary Work Context MUST NOT hide an otherwise authorized Domain merely because it belongs to another functional area.

Therefore a Clinical primary user may legitimately see authorized financial, operational, administration, reporting, or other Domain entries without changing their Role Workspace.

`My Financial`, `My Agenda`, and similar artificial classification-based duplicates must not be introduced merely to represent cross-domain permissions.

## 7. Home Rule

Home is an independent global starting and awareness surface.

Home is not:

- Role Workspace;
- My Workspace;
- a substitute for clinical/operational execution;
- a Module directory;
- the Work Center;
- a full Notifications center;
- the full Communications system.

Home may present a broad set of global and lightweight information/utilities, provided each element earns its place by being useful at entry, lightweight, understandable, or a fast path to an appropriate work destination.

The Home concept is intentionally broader than a traditional KPI dashboard and may include:

- personal/current context;
- daily awareness;
- calendar/utility information;
- weather or other ambient information supplied by an external service;
- user-selected shortcuts;
- lightweight system information;
- optional system-managed content/partner presentation under explicit platform governance;
- summarized actionable information that routes to the authoritative work surface.

Home may provide lightweight actions such as creating an event/reminder or initiating an appropriate request, but the authoritative workflow remains owned by its Domain.

## 8. Home ↔ Work Boundary

Home can tell the user what is happening or provide a fast route to work.

The relevant Workspace/Domain performs the actual work.

Examples:

```text
Home: 2 patients waiting → Clinical Workspace
Home: today's schedule → Agenda
Home: 2 work items need attention → Work Center / authoritative domain
Home: portal item requiring attention → authorized Portal/context
```

Home must not duplicate the complete queue, agenda, billing, clinical visit, communication, analytics, inventory, or workforce workflow.

## 9. Global Header Rule

The Header is a persistent global access layer.

It is independent of Home and remains available across authenticated system surfaces.

The Header should contain the smallest stable set of truly global controls.

The current agreed conceptual set is:

- system identity/logo;
- existing Global Search;
- Communications access;
- separate Chat access;
- Notifications access;
- Quick Actions / global interface-account actions.

The Header must not become a second Home or a universal business-action launcher.

## 10. Communications vs Chat

Communications is the full authoritative communication domain.

Chat is a compact interaction surface derived from that same Communications domain.

Chat MUST NOT create a parallel:

- database;
- conversation engine;
- permission model;
- communication domain.

Chat may provide:

- direct user-to-user messaging;
- compact conversation list;
- unread state;
- rapid message send/receive;
- links/files/context supported by the existing Communications architecture;
- group conversations when supported by the domain.

The full Communications experience remains the authoritative place for complete communication management and future operational communication complexity.

The Communications icon and Chat icon are intentionally distinct because they represent different user intents:

- Communications = access the broader communications domain/activity.
- Chat = start or continue an immediate conversation.

Internal clinic communication remains distinct from patient notification/follow-up communication.

## 11. Notifications

Notifications are a separate system capability from Communications and from operational Follow-up.

The global Header notification control is the cross-system access point.

A Home summary may surface an actionable notification when useful, but Home must not become the notification system and must not require a duplicate notification store.

## 12. Quick Actions

Quick Actions are a compact global access surface, not a catch-all launcher.

Initial agreed scope:

- Language;
- Logout.

Logout is deliberately global because CORE SYSTEM must support shared clinic workstations. Each user's work must remain attributable to the authenticated user who performed it.

Additional global actions may be added only after demonstrating a genuine cross-system need.

Business actions are not automatically Quick Actions merely because they are convenient.

## 13. My Settings

My Settings remains in the Sidebar.

It owns personal/account preferences and does not move into the Header merely to reduce visual density.

Quick Actions may expose a specific global interface action such as Language without replacing My Settings.

## 14. Subscription / Entitlement Rule

Subscription/entitlement determines which capabilities a tenant can use.

Permission determines what a particular user may do within an available capability.

Higher subscription level may expose additional capabilities, Domains, Widgets, or Home content where entitled and authorized.

Higher subscription must NOT change the fundamental Home/Workspace architecture or force all tenants to see all advanced elements.

Basic/core experiences must remain understandable without showing unavailable capabilities merely to advertise them.

## 15. Workspace Stability Rule

```text
Primary Role
   ↓
Primary Work Context
   ↓
Role Workspace
```

is independent from:

```text
Effective Permissions
   ↓
Authorized Capabilities
   ↓
Sidebar / Widgets / My Workspace
```

A Role Workspace changes only when the user's primary work context/assignment intentionally changes. It does not change as a side effect of granting unrelated additional permissions.

## 16. Implementation Naming Rule

The technical term `global` MUST NOT be used in documentation as an automatic synonym for both Home and My Workspace.

Where code has historically used `global` as a shared rendering/context key, that is an implementation detail requiring reconciliation. It does not redefine the product concepts.

The canonical product concepts are:

- Home = global starting/awareness surface.
- Role Workspace = primary professional work environment.
- My Workspace = personal working surface associated with the user's work context.

## 17. Historical Documentation Rule

Older documents may contain broader or earlier use of `Workspace`, `Dashboard`, `Global`, `Home`, or `My Workspace`.

Such language must be classified as:

- current and correct;
- clarified by this reconciliation;
- superseded where an explicit later decision changed the concept;
- historical evidence when it records the state of a previous implementation.

Historical documents must not be silently treated as current authority when their wording conflicts with this canonical model.

## 18. Mandatory Future Documentation Rule

Every new or revised document touching these concepts must state or preserve the following boundaries:

1. Role Workspace is primary professional work context, not a permission set.
2. Additional permissions expand authorized capabilities without changing Role Workspace.
3. My Workspace is personal working presentation/configuration.
4. Sidebar shows authorized Domains independently of primary classification.
5. Home is independent of Role Workspace and My Workspace.
6. Home can contain global utilities/information and lightweight entry actions without owning specialist workflows.
7. Header is global access, not Home or universal work execution.
8. Communications and Chat share the Communications authority but are different interaction surfaces.
9. Notifications remain separate from Communications and Follow-up.
10. My Settings remains a personal account/settings destination.
11. Subscription/entitlement controls capability availability without redefining the user's professional identity or primary Workspace.

## 19. Scope

This reconciliation does not redesign Clinical Workspace, Operational Workspace, or Patient Flow. Those existing work environments remain authoritative unless a separate approved decision changes them.

Administrative Workspace remains a separate future/ongoing product work item and is not silently redesigned by this document.

No database or runtime change is authorized merely by this documentation reconciliation.

**End of Canonical Reconciliation.**
