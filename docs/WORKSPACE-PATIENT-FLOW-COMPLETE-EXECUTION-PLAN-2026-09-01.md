# CORE SYSTEM — COMPLETE EXECUTION PLAN
## Workspace × Patient Flow × Home × Search × Navigation × Widgets
### 2026-09-01 — RECONCILED 2026-09-11

**Status:** PRE-CODE — COMPLETE SCOPE — CANONICAL INTERPRETATION UPDATED  
**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Companion:** `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-DECISION-COVERAGE-MATRIX-2026-09-01.md`  
**Current surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 canonical clarification:** The word “Workspace” in this historical plan must be interpreted at the correct layer. The product model distinguishes **Role Workspace** (primary professional work environment), **My Workspace** (personal working/presentation surface), **Home** (independent global starting/awareness surface), and **Sidebar** (authorization-driven navigation). Additional permissions do not redefine Role Workspace; they may expand Sidebar Domains, Widgets and My Workspace content. Header is a persistent global access layer. This clarification supersedes only ambiguous terminology; it does not remove or redesign unrelated approved work.

## 0. Scope and authority

This plan executes **every approved architectural decision in the 2026-09-01 architecture document and the explicit user clarifications that define its intended behavior**. No important item is deleted, deferred, silently narrowed, or converted into an optional enhancement.

This plan does not redesign unrelated CORE SYSTEM architecture. Existing architecture outside the 2026-09-01 decision set remains preserved unless a concrete dependency makes a change necessary. Any such dependency must be documented as an implementation dependency, not silently converted into a new architectural decision.

### Decision-boundary rule

The architecture document defines **what the product must mean and what the user/system must achieve**. Engineering defines **how the approved meaning is implemented**. Engineering may choose implementation mechanisms, data retrieval strategies, component boundaries, indexing, caching, APIs, persistence details, tests, and other technical means only when those choices do not alter an approved architectural behavior.

A missing technical detail is **not** permission to change or omit an architectural requirement. Conversely, an engineering choice is not an architectural decision unless it changes the meaning, responsibility, user-visible behavior, authority, or relationship established by the architecture.

If implementation discovers a genuine architectural ambiguity that cannot be reconciled from the approved document and existing authoritative documentation, execution stops at that exact boundary and the unresolved decision is returned to the project owner. No unilateral architectural choice is permitted.

## 1. Complete architecture-to-execution coverage

Every section of the architecture decision document must have an explicit execution workstream and acceptance evidence:

1. Patient Journey vs Patient Flow.
2. Patient Flow.
3. Role.
4. Clinic Admin.
5. Workspace.
6. My Workspace.
7. Widgets and permissions.
8. Sidebar/navigation.
9. My Settings.
10. Home.
11. Header and Global Search.
12. Architectural simplicity principle.
13. Implementation governance.

No section is documentation-only. Each section is traced to affected UI, workflow, domain ownership, authorization, data, persistence/API, integration, responsive/i18n behavior and acceptance testing where applicable.

## 2. Canonical surface model

The execution plan MUST use the following model:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
ROLE WORKSPACE

Effective Permissions
        ↓
Authorized Domains / Capabilities / Actions
        ├── Sidebar
        ├── Widgets
        └── MY WORKSPACE

HOME = independent global starting / awareness surface
HEADER = persistent global access layer
MY SETTINGS = personal account/preferences destination
```

The following invariants are mandatory:

- Role Workspace is the primary professional work environment.
- Additional permissions do not redefine Primary Role, Primary Work Context or Role Workspace.
- My Workspace is personal presentation/work arrangement associated with Role Workspace.
- Sidebar is complete authorized navigation and is not a mirror of Role Workspace.
- Home is independent of Role Workspace and My Workspace.
- Header is independent global access.
- Technical `global` identifiers are implementation details and must not collapse Home and My Workspace.

## 3. Pre-code truth map

Before modifying source, map all affected existing behavior:

- login and post-login destination;
- authenticated shell/header;
- Home and every existing Home widget/card/data source;
- global search and searchable records;
- Sidebar registry, route guards and Domain registry;
- Primary Work Context / Role Workspace resolution, memberships and routes;
- My Workspace widgets, registry, defaults, persistence and personalization;
- My Settings;
- Role and effective-permission resolution;
- Patient Flow/Queue state machine, transitions, locks and audit;
- Visit/session/clinical actions;
- Room/Procedure/Agenda integration points;
- Patient Context/contextual navigation;
- Clinic Admin routes and administration center;
- database tables/functions/RLS/migrations actually present in the target environment;
- translations, RTL/LTR and responsive behavior;
- historical implementations where they contain previously correct behavior that has regressed.

Output must be a file-by-file and data-path truth map identifying **KEEP / MODIFY / ADD / REMOVE ONLY IF PROVEN DUPLICATE OR OBSOLETE**.

## 4. Home — complete implementation workstream

Home is the post-login landing page for ordinary clinic users and is not Workspace.

Home is an independent global starting/awareness surface. It may contain general daily context, global/lightweight utilities, calendar/date utility, weather/ambient information, user-selected shortcuts, optional system-managed content, and summarized actionable information that routes to authoritative work destinations.

Home must not become a second Role Workspace, My Workspace, Work Center, full Communications surface, full Notification Center, or full Domain workflow.

For **every Home information surface/widget/card**, engineering must identify:

- authoritative source;
- owning Domain/service;
- required permission;
- tenant scope;
- refresh/invalidation mechanism;
- informational vs actionable nature;
- destination for an action;
- whether the action belongs in Workspace/Domain instead;
- loading state;
- empty state;
- error/stale state;
- AR/EN behavior;
- RTL/LTR;
- mobile/responsive behavior;
- accessibility;
- Patient Flow dependency, if any;
- data freshness expectations;
- entitlement behavior where applicable.

The existence of a Home category does not transfer workflow ownership from its authoritative Domain.

Quick Registration and Quick Appointment are subject to the Widget/Workspace surface classification. They must not be moved to Home merely for convenience.

**Acceptance:** ordinary users land on Home after login and can understand useful global/daily context without Home replacing Role Workspace, My Workspace, or Patient Flow.

## 5. Header and Global Search — complete implementation workstream

The authenticated header is persistent and global.

It must preserve or provide the approved global shell functions:

- system branding/identity;
- existing Global Search;
- Communications access;
- separate compact Chat access backed by Communications;
- Notifications access;
- Quick Actions for global interface/account actions such as Language and Logout.

Global Search is a system-wide capability, not a Home widget and not Workspace.

The search workstream must cover, where corresponding domains/data exist:

- patients/identifiers;
- doctors/staff;
- appointments;
- invoices/payments;
- financial plans/installments;
- treatment plans;
- services/procedures;
- inventory;
- suppliers/purchase orders;
- tasks/requests;
- communications;
- events;
- other authorized searchable records.

Search must specify and test:

- query contract;
- result typing;
- context identification;
- authorization filtering at data/query layer;
- tenant isolation;
- autocomplete behavior;
- counts/snippets/metadata leakage prevention;
- ranking strategy;
- direct authorized navigation;
- recent-search behavior if present;
- loading/no-result/empty/error/partial states;
- AR/EN behavior;
- RTL/LTR;
- mobile/header responsiveness.

Global Search is already part of the existing system and must be reused rather than replaced.

## 6. Sidebar and navigation — complete implementation workstream

For ordinary users the conceptual order is:

`Home → Workspace → My Workspace → authorized Modules/Domains → My Settings`.

Sidebar is authorization-driven navigation.

Primary Work Context must not suppress an otherwise authorized Domain.

Domains retain their normal names; no artificial `My Financial`, `My Agenda`, or equivalent copies are created merely to reflect cross-context permission.

Patient Flow remains hidden from ordinary users as a standalone Sidebar Domain while remaining available to Clinic Admin in its approved administrative/background context.

Sidebar visibility does not replace route-level or server-side authorization.

Existing navigation entries must not be deleted merely because Workspace changed. Remove/reconcile only proven duplicates or obsolete registrations after establishing actual ownership and usage.

**Acceptance:** a user with mixed authorized Domains sees every authorized Domain normally while unauthorized Domains remain unavailable through navigation and direct routes.

## 7. Role Workspace — complete implementation workstream

Role Workspace is the user's primary professional work environment associated with the user's Primary Role / Primary Work Context.

It is not:

- the user's complete permission set;
- the complete Sidebar;
- Home;
- My Workspace;
- a security boundary.

### Stability requirement

The Role Workspace remains unchanged when additional permissions are granted or removed, provided the Primary Role / Primary Work Context remains unchanged.

A Clinical primary user with additional Financial, Operational, Administrative, Reporting or other permissions remains a Clinical Role Workspace user.

An intentional change to the user's Primary Role / Primary Work Context may change the Role Workspace. A permission override alone may not.

### Existing Workspaces

Clinical and Operational Workspaces are established primary work environments and are preserved by this plan. This execution plan does not authorize broadening either merely because a user gains cross-domain permissions.

Administration Workspace remains a separate work area and is outside this plan's redesign scope.

## 8. My Workspace — complete implementation workstream

My Workspace is the user's personal working/presentation surface associated with the primary Role Workspace.

It must support:

- system-selected defaults based on granted capabilities/permissions and work context;
- action-oriented daily work emphasis;
- useful informational Widgets;
- add/remove/show/hide/reorder where supported;
- drag-and-drop ordering where supported;
- continuous vertical scrolling;
- reset/restore defaults;
- correct user/surface/context persistence;
- authorized cross-context tools/widgets without changing Role Workspace.

Personalization MUST NOT:

- grant authorization;
- revoke authorization;
- change Role;
- change Primary Work Context;
- change Role Workspace merely because a Widget or permission changed;
- become Home;
- become a duplicate of a full Domain.

### Critical implementation rule

Home and My Workspace may reuse rendering infrastructure only as an implementation detail. Their product semantics, data composition, persistence scope and user-facing identity must remain distinct.

## 9. Widgets and permissions

Widget availability and behavior remain governed by effective authorization and feature/entitlement state.

A Widget may expose a capability; it never becomes the authority for that capability.

Permission behavior:

`Read → information/read actions only`

`Create/Write → corresponding create action`

`Edit/Modify → corresponding additional modification actions`

`No relevant permission → normally absent`

No Widget may bypass server-side authorization.

## 10. My Settings — complete implementation workstream

My Settings is separate from Home, Role Workspace, and My Workspace.

It remains a Sidebar destination for personal account/preferences.

Supported functions remain according to the existing account architecture, including display name, password, personal profile image and other user-level preferences.

Changes must not modify Role Workspace, Primary Work Context, permissions or Domain access.

## 11. Patient Flow and Queue — canonical workflow workstream

Patient Journey remains the system-wide concept; Patient Flow remains the internal workflow/state authority.

Workspace actions must invoke canonical transition authority. No Workspace-local state machine and no Home-local workflow controller may be introduced.

The canonical sequence remains:

`Arrival → Waiting → Clinical handoff → Clinical work → Pending Close → Operational/Reception → Completed`

where supported by the approved workflow, with preserved cancellation/no-show history behavior.

## 12. Clinical Workspace — existing primary work environment

Clinical Workspace is preserved as the established clinical primary work environment.

It must remain focused on the clinical portion of the Patient Journey and must not become a generic cross-domain permission dashboard.

Additional user permissions are surfaced through Sidebar/My Workspace/Widgets/full Domains rather than by changing Clinical Workspace identity.

No broad clinical redesign is authorized by this document.

## 13. Operational Workspace — existing primary work environment

Operational Workspace is preserved as the established operational/reception primary work environment.

Additional permissions must not turn it into a generic permission dashboard.

It remains responsible for the operational side of Patient Flow, including arrival, queue, routing, pending close and completion as already implemented.

## 14. Domain integration

Every Module/Domain remains a complete authoritative capability.

Workspace/Home/Header/My Workspace provide presentation, awareness or entry points only. They do not duplicate Domain business logic.

A full Domain reached from Sidebar must have the same business semantics whether entered from Home, My Workspace, Role Workspace, Header or contextual navigation.

## 15. Permission / tenant / security

Effective permissions are authoritative.

Workspace identity and personalization are not security mechanisms.

Validate authorization independently at:

- Sidebar;
- Widgets;
- Widget actions;
- Search;
- Patient Context;
- Patient Flow transitions;
- Domain routes/actions;
- Clinic Admin operations.

Validate RLS and tenant isolation independently of UI visibility.

## 16. Clinic Admin

Clinic Admin is not an ordinary user with every permission.

Preserve the tenant administration center and its clinic-wide authority. Do not force Clinic Admin into the ordinary-user mental model or silently redesign its administration surface.

## 17. Database, persistence and API

Before any migration, inspect actual live schema against repository migrations.

Reuse existing structures where suitable.

Create new schema/API structures only when the approved requirements cannot be safely implemented through the existing canonical model.

No duplicate Role, Permission, Workspace authorization, Patient Flow, Communications or Chat authority may be introduced.

Presentation persistence must remain distinct from authorization/policy state.

## 18. i18n / responsive / accessibility

Every affected visible element, including small controls and states, is part of the implementation contract.

Validate:

- Arabic;
- English;
- RTL;
- LTR;
- desktop;
- tablet;
- mobile;
- loading;
- empty;
- error/stale;
- accessibility.

## 19. Historical reconciliation

When older documentation or implementation uses ambiguous terminology:

1. identify the exact meaning intended in its historical context;
2. compare it with the canonical 2026-09-11 model;
3. preserve historical facts where they are useful evidence;
4. clarify or annotate the historical record rather than rewriting history silently;
5. update current/active authority documents to the canonical meaning;
6. retain unrelated valid content;
7. remove duplicate/obsolete content only after proof.

No blind find/replace of “Workspace” is allowed.

## 20. Required end-to-end scenarios

### Clinical user with additional permissions

`Doctor / Clinical → Clinical Role Workspace → additional Financial/Operational/Admin/Reports permissions → Sidebar expands as authorized → My Workspace may expand → Role Workspace remains Clinical.`

### Home

`Login → Home → global/daily awareness + utilities → authorized destination for work.`

### My Workspace

`Workspace → My Workspace → personalize permitted tools/widgets → persistence → no authorization/Role Workspace change.`

### Header

`Authenticated surface → Global Search / Communications / Chat / Notifications / Quick Actions → remain accessible globally.`

### Shared workstation

`User A → Logout → User B Login → subsequent actions attributable to User B.`

### Patient Journey

`Arrival → Waiting → Clinical → Pending Close → Reception/Operational → Completed`.

## 21. Final closure gates

No completion claim is valid until evidence exists for every applicable architecture decision and coverage row, including:

- Home;
- Header;
- Global Search;
- Sidebar;
- Role Workspace;
- My Workspace;
- Widget behavior and personalization;
- My Settings;
- Clinical Workspace preservation;
- Operational Workspace preservation;
- Patient Flow / Queue;
- Patient Context;
- Domain integrations;
- Role/permission separation;
- mixed-permission stability;
- authorization/RLS/tenant isolation;
- Clinic Admin separation;
- database/persistence/API;
- Arabic/English;
- RTL/LTR;
- mobile/responsive;
- loading/empty/error states;
- runtime regression evidence.

A build passing while the surface relationships are wrong is not a pass. A visually correct shell with incorrect authorization is not a pass.

## 22. Final integrity rule

The execution plan must satisfy both directions:

**Forward:** every approved architectural decision has implementation tasks and acceptance evidence.

**Reverse:** every implementation task is justified by an approved decision, an explicit clarification that concretizes it, or a necessary technical mechanism required to realize the approved meaning.

Anything outside both directions is not silently implemented.

**End of Complete Execution Plan.**
