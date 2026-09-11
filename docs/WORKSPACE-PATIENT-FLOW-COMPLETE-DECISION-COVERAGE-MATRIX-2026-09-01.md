# CORE SYSTEM — COMPLETE DECISION COVERAGE MATRIX
## Workspace × Patient Flow × Role × Permissions × Widgets × Navigation × Home × Search × Header
### 2026-09-01 — Reconciled 2026-09-11

**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Canonical surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`
**Purpose:** Prove that every approved architectural decision is carried into engineering and execution without dropping small UI, workflow, integration, data, security, or operational details.
**Scope:** The 2026-09-01 decision set plus the 2026-09-11 owner-approved clarification of Global Header/Home/Role Workspace/My Workspace/Sidebar boundaries. Unrelated architecture is not redesigned.

---

## 0. MASTER RULE

A decision is not implementation-ready until all of these are identified:

`Decision → visible behavior → actor → trigger → source → domain owner → workflow/state → permission → persistence/API → integration → loading/empty/error → responsive/i18n → acceptance test → regression impact`.

No item may be downgraded to "later" merely because it is visually small.

Examples in the approved discussion that establish baseline behavior are treated as minimum acceptance requirements. Engineering may add necessary supporting behavior but may not remove or reinterpret the baseline.

---

# 1. PATIENT JOURNEY / PATIENT FLOW

### Approved decision
Patient Journey is the complete clinic journey. Patient Flow is an internal workflow beginning with patient entry into the clinic. Clinical, Operational and Administration are work classifications within Patient Flow.

### Engineering obligations
- Preserve existing PJ ownership.
- Preserve canonical Patient Flow/Queue state authority.
- Identify every state transition used by Workspace surfaces.
- Identify every handoff and responsible area.
- Do not create a Workspace state machine.
- Do not make Patient Flow an ordinary-user Sidebar Domain.
- Keep Patient Flow available to Clinic Admin in the administrative/background context required by the architecture.

### Execution impact
Audit Queue engine, Patient Flow UI, transition actions, locks, visit/session references, invalidation/revalidation, audit records, and all Workspace entry/exit actions.

### Acceptance
A patient can move through the existing operational/clinical chain without Workspace creating a competing workflow.

---

# 2. ROLE

### Approved decision
Role represents job/function. Role is not Clinical/Operational/Administration, not Workspace, and not permission. Permissions can extend outside primary classification without changing Role/classification.

### Engineering obligations
- Role may provide defaults/templates only.
- Effective permissions are the actual authorization source.
- Primary Role / Primary Work Context determines the primary Role Workspace.
- Workspace resolution must not be `Role = Workspace` as an authorization rule.
- An additional permission/override is not a Role change.
- Sidebar Domain visibility must not be filtered by primary classification.
- Mixed-domain permissions must remain usable.

### Acceptance
A clinical user with financial permission still has the same primary Clinical Workspace and sees the authorized Financial Domain normally in Sidebar.

---

# 3. CLINIC ADMIN

### Approved decision
Clinic Admin is a distinct tenant administrative authority, not an ordinary user with a larger permission set.

### Engineering obligations
- Keep Clinic Admin administration center intact.
- Do not force Clinic Admin through ordinary-user Workspace behavior.
- Preserve user/Role/permission/Workspace/Domain administration.
- Preserve clinic-wide oversight and configuration.
- Preserve the open test Clinic Admin account's ability to test the subscribed system during implementation.

### Acceptance
Ordinary-user changes cannot accidentally remove Clinic Admin administration capability, and Clinic Admin is not reduced to an ordinary user's Workspace surface.

---

# 4. ROLE WORKSPACE / WORKSPACE

### Approved decision
Workspace is a user's work environment. It is not Role, permission set, Patient Flow, or a security boundary.

The primary relation is:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace
```

### Stability rule
The Role Workspace is the user's stable primary professional work environment. Expanding permissions does not redefine it.

```text
Doctor
Primary Context = Clinical
Role Workspace = Clinical

+ Financial Read
+ Operational capability
+ Administration capability
+ Reports Read

→ Role Workspace remains Clinical.
```

### Engineering obligations
- Maintain one canonical Workspace system.
- Resolve a deterministic primary/default work context and Role Workspace.
- Keep additional permissions on a separate authorization axis.
- Do not recalculate the primary Role Workspace because permissions changed.
- Do not make Workspace an authorization boundary.
- Make daily work genuinely different by work context.
- Do not duplicate Domain logic in Workspace.
- Preserve existing Clinical and Operational Workspace behavior; this reconciliation does not authorize redesigning those workspaces.

### Acceptance
A user may gain authorized capabilities from other functional areas without their primary Role Workspace changing.

---

# 5. MY WORKSPACE

### Approved decision
My Workspace is the user's personal working surface associated with the assigned/default primary Role Workspace. It is not a second Role Workspace.

### Engineering obligations
- Provide system-selected default Widgets based on important granted capabilities/permissions and the user's work context.
- Defaults emphasize action/executive daily work.
- Permit useful informational Widgets.
- Support add/remove/show/hide/reorder as supported.
- Support drag-and-drop ordering.
- Support continuous vertical scrolling.
- Preserve intended Widget sizes.
- Provide reset/restore defaults.
- Scope presentation persistence correctly by user/surface/context.
- Allow authorized cross-classification capabilities to appear where the product permits, without changing Role Workspace.
- Never change authorization through personalization.

### Acceptance
A user can customize their working surface, including permitted cross-domain tools, while their Role Workspace and authorization remain unchanged.

---

# 6. WIDGETS

### Approved decision
Widget = interface to a capability/useful information. Widget is not authorization.

### Engineering obligations
Every Widget record must map to:

- capability/domain;
- effective permission(s);
- entitlement/feature dependency if applicable;
- type;
- supported context;
- default status;
- size;
- action;
- destination;
- patient/visit context dependency if any;
- AR/EN labels;
- loading/empty/error states;
- unauthorized behavior.

Required classes:

- Information;
- Action;
- Operational;
- Contextual;
- Quick Action;
- Full-page capability;
- No-Widget capability.

### Permission matrix

`Read → information/read actions only`

`Create/Write → corresponding create action`

`Edit/Modify → corresponding additional modification actions`

`No relevant permission → normally absent`

Locked presentation is allowed only when useful and must not imply access.

### Acceptance
No Widget can perform an action that the underlying capability and effective permission do not allow.

---

# 7. HOME

### Approved decision
Home is the post-login landing page. It is independent from Role Workspace and My Workspace.

### Home identity
Home is a global starting and awareness surface, not a work-execution workspace and not a Module directory.

It may be broader than a traditional KPI dashboard and may include global/lightweight information and utilities.

### Approved/owner-directed Home concept
Home may contain, where retained in final product composition:

- personal/current context at entry;
- daily awareness and current date/time context;
- today's appointment context or counts;
- waiting/work/activity awareness summaries where useful;
- a focused attention summary;
- global Calendar utility;
- lightweight Calendar actions such as event/reminder creation and appropriate requests;
- Weather or other ambient external information;
- user-selected Quick Access shortcuts;
- lightweight system information;
- optional system-managed/platform-level content or partner presentation under explicit platform governance;
- summarized actionable information that routes to the authoritative work destination.

### Home boundaries
Home must not become:

- Clinical Workspace;
- Operational Workspace;
- Administration Workspace;
- My Workspace;
- Work Center;
- full Communications;
- full Notification Center;
- full Agenda;
- full analytics/billing/inventory/workforce module.

### Engineering obligations
For every Home element define:

1. authoritative data source;
2. owning Domain/service;
3. required permission;
4. tenant scope;
5. refresh/invalidation trigger;
6. informational vs actionable type;
7. destination if actionable;
8. whether the action belongs in another authoritative surface;
9. loading state;
10. empty state;
11. stale/error state;
12. AR/EN behavior;
13. mobile behavior;
14. accessibility;
15. subscription/entitlement behavior when applicable.

### Acceptance
After login, the user understands current context and useful global information without Home owning or duplicating specialist workflow execution.

---

# 8. HEADER / GLOBAL ACCESS LAYER

### Approved decision
The authenticated Header is persistent and global. It is independent of Home and all Workspace surfaces.

### Core conceptual functions
- system identity/logo;
- existing Global Search;
- Communications access;
- separate compact Chat access backed by Communications;
- Notifications access;
- Quick Actions for global interface/account actions such as Language and Logout.

### Boundary
Header is not a second Home, Work Center, My Workspace, or universal business-action launcher.

---

# 9. COMMUNICATIONS / CHAT / NOTIFICATIONS

### Communications
Communications is the authoritative full communication Domain.

### Chat
Chat is a compact Messenger-style surface over the same Communications authority.

It may support:

- direct conversations;
- compact conversation list;
- unread state;
- sending/receiving messages;
- supported links/files/context;
- group conversations where supported by Communications.

It must not create a second:

- communication database;
- conversation engine;
- permission system;
- authorization model.

### Distinct intents

`Communications icon → broader communication/domain access`

`Chat icon → immediate conversation`

### Notifications
Notifications are a separate attention/delivery capability from Communications and Follow-up.

### Acceptance
All three surfaces reuse their existing authoritative domains and never create parallel stores merely to support a compact Header surface.

---

# 10. QUICK ACTIONS

### Approved initial scope
Quick Actions are a compact global interface/account action surface.

Initial actions:

- Language;
- Logout.

### Logout
Logout is a first-class global action because CORE SYSTEM must support shared clinic workstations. Each person must work under their own authenticated identity for accountability and audit attribution.

### Boundary
Business actions are not automatically Quick Actions merely because they are convenient. A future addition requires a demonstrated cross-system need.

---

# 11. SIDEBAR / NAVIGATION

### Approved order for ordinary users

`Home → Workspace → My Workspace → authorized Modules/Domains → My Settings`

### Engineering obligations
- Sidebar is authorized navigation, not Role Workspace.
- Primary classification does not suppress authorized Domains.
- Additional permissions may add Domains outside the primary context.
- Authorized external Domains retain their normal names.
- Do not create `My Financial`, `My Agenda`, etc. as artificial duplicates.
- Patient Flow is not a standalone ordinary-user Sidebar item.
- Sidebar is not itself the security boundary; route/data authorization remains mandatory.
- My Settings remains the personal account/preferences destination.

### Acceptance
A Clinical primary user with authorized Patients + Agenda + Billing + Reports sees all authorized Domains normally, while the primary Workspace remains Clinical.

---

# 12. MY SETTINGS

### Approved decision
My Settings is personal account/preferences, not My Workspace and not Header account management.

### Required behavior
- Edit display name, not immutable user ID.
- Change password through the existing secure authentication flow.
- Add/change personal profile image using existing storage/security architecture.
- Other user-level preferences already supported by the platform.

### Acceptance
Changes affect the user's personal account presentation/settings and do not modify Workspace authorization or Domain access.

---

# 13. CLINICAL WORKSPACE

### Approved decision
Clinical Workspace is the primary professional work environment for Clinical users and already represents the clinical work required by the current Patient Journey implementation.

### Boundary for this reconciliation
No additional feature set is authorized here merely because other permissions exist. Cross-domain capabilities are surfaced through Sidebar/My Workspace/Widgets according to effective permission; Clinical Workspace remains focused on clinical work.

### Acceptance
Clinical users receive the existing clinical working surface and Patient Flow/Visit integration without the surface becoming a mixed administrative dashboard.

---

# 14. OPERATIONAL WORKSPACE

### Approved decision
Operational Workspace is the primary professional work environment for operational/reception work and already represents the operational workflow required by current Patient Journey implementation.

### Boundary for this reconciliation
No additional feature set is authorized here merely because other permissions exist.

### Acceptance
Operational users continue to execute operational work without the workspace becoming a mixed-domain permissions dashboard.

---

# 15. ADMINISTRATION WORKSPACE

### Approved decision
Administration is a distinct work context and Workspace category.

### Scope boundary
The Administration Workspace itself is not redesigned by this reconciliation because its detailed product readiness is a separate work item.

---

# 16. PATIENT CONTEXT / CROSS-DOMAIN INTEGRATION

### Approved decision
Patient Context is a presentation/orchestration mechanism, not a Domain.

### Required contextual destinations where authorized
- Patient;
- Visit;
- Appointment;
- Treatment Plan;
- Financial Plan;
- Payments/Installments;
- Follow-up;
- Communication;
- Medical records/files/photos;
- Portal-related information;
- resources/consumption where owned by a Domain.

### Engineering obligations
- Preserve Domain ownership.
- Preserve route/action authorization.
- Preserve tenant isolation.
- Maintain patient/visit context when navigating where appropriate.
- Avoid unnecessary return-to-list navigation.
- Do not create a second patient-data store.

---

# 17. INTEGRATION RELATIONSHIP MATRIX

| Element | Depends on | Must not own | Must update/reflect |
|---|---|---|---|
| Home | daily authoritative data, permissions | workflow state machine | current daily/global context |
| Header | global system services/domains | business workflow | globally accessible status/actions |
| Global Search | authorized searchable domain data | domain business logic | current authorized results |
| Sidebar | effective authorization + navigation registry | security itself | available Domains |
| Role Workspace | primary work context + workflow context | authorization | primary work |
| My Workspace | Role Workspace + Widget catalogue + user presentation state | authorization | personal arrangement |
| Clinical Workspace | Patient Flow + Visit/session + clinical capability | Visit/Procedure business logic | clinical work/handoff |
| Operational Workspace | Patient Flow + operational domains | Queue state machine | operational work |
| Widget | capability + permission | authorization | capability state |
| Communications | communication domain data | patient notification/follow-up ownership | communication activity |
| Chat | Communications | independent chat database/domain | immediate conversations |
| Notifications | notification domain | Follow-up logic | attention state |
| My Settings | user account | Workspace authorization | personal account data |

---

# 18. IMPLEMENTATION ORDER

1. Freeze this coverage matrix as the completeness checklist.
2. Inspect current shell, Header, routes and navigation.
3. Inspect current Role/primary-context/Workspace resolution and membership.
4. Inspect Widget registry, persistence and renderer.
5. Inspect Home and current Home widgets/data sources.
6. Inspect Global Search infrastructure and all searchable Domain sources.
7. Inspect Sidebar authorization and Domain registry.
8. Inspect My Settings.
9. Inspect Communications Domain and compact access surfaces.
10. Inspect Notifications domain and current in-app access.
11. Inspect Queue/Patient Flow transition authority.
12. Inspect Visit/session/clinical/room/procedure integration points.
13. Inspect Clinic Admin routes and permissions.
14. Inspect subscription/entitlement gates relevant to these surfaces.
15. Inspect database/RLS/migrations for all affected surfaces.
16. Produce file-by-file change list.
17. Implement only approved changes.
18. Validate every matrix row end-to-end.
19. Validate ordinary users, mixed permissions and Clinic Admin separately.
20. Validate Arabic/English and responsive behavior.
21. Validate production/runtime behavior.
22. Only after successful validation remove proven obsolete duplicates.
23. Update documentation and close.

---

# 19. COMPLETENESS GATE

The work is BLOCKED from closure if any of the following is unverified:

- Home;
- Home daily information/widgets;
- Header;
- Global Search;
- Communications access;
- compact Chat surface;
- Notifications access;
- Quick Actions;
- Sidebar;
- Role Workspace resolution;
- My Workspace;
- Widgets and personalization;
- My Settings;
- Clinical Workspace;
- Operational Workspace;
- Patient Flow;
- Queue/handoff;
- Patient Context;
- Domain integrations;
- permissions;
- tenant isolation;
- Clinic Admin separation;
- database/persistence;
- i18n/RTL/LTR;
- mobile/responsive behavior;
- loading/empty/error states;
- runtime regression.

**No partial implementation may be reported as complete.**

---

# 20. SCOPE LOCK

This matrix does not authorize redesign of unrelated CORE SYSTEM architecture. Existing architecture outside the approved decision set remains unchanged unless an actual dependency is discovered. Such dependency must be documented rather than silently changed.

**End of Complete Decision Coverage Matrix.**
