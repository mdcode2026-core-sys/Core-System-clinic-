# CORE SYSTEM — COMPLETE EXECUTION PLAN
## Workspace × Patient Flow × Home × Search × Navigation × Widgets
### 2026-09-01

**Status:** PRE-CODE — COMPLETE SCOPE
**Authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Companion:** `docs/WORKSPACE-PATIENT-FLOW-COMPLETE-DECISION-COVERAGE-MATRIX-2026-09-01.md`

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

## 2. Pre-code truth map

Before modifying source, map all affected existing behavior:

- login and post-login destination;
- authenticated shell/header;
- Home and every existing Home widget/card/data source;
- global search and searchable records;
- Sidebar registry, route guards and Domain registry;
- Workspace resolution, memberships and routes;
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

## 3. Home — complete implementation workstream

Home is the post-login landing page for ordinary clinic users and is not Workspace.

The implementation must preserve the approved Home purpose: give the user useful general daily clinic context without becoming a second operational or clinical workflow controller.

Minimum approved content categories must not be dropped:

- today's appointments / counts;
- patients waiting / daily activity;
- reminders;
- notifications;
- internal messages/communications;
- Patient Portal information;
- Work Center information;
- other general daily clinic context;
- utility/ambient information such as clock/weather where retained by the approved product design.

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
- data freshness expectations.

No required Home category may be silently removed because it is "only a widget". No Home element may acquire ownership of a domain workflow merely because it is displayed on Home.

Quick Registration and Quick Appointment must be explicitly classified and placed according to the approved Workspace/Widget model; they must not be omitted or arbitrarily moved to Home merely for convenience.

**Acceptance:** ordinary users land on Home after login and can understand the relevant daily clinic context without Home replacing Workspace or Patient Flow.

## 4. Header and Global Search — complete implementation workstream

The authenticated header must preserve the approved global shell behavior, including where applicable:

- global Search bar;
- language control;
- user display name/identity presentation;
- system branding/logo;
- other already-approved shell controls.

Global Search is a system-wide capability, not a Home widget and not Workspace.

Engineering must provide one coherent authorization-aware search contract over authorized searchable data, reusing existing infrastructure where possible.

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

These are engineering specifications of the approved Global Search decision, not new product decisions. No linguistic search capability may be promised unless supported by the selected implementation.

**Acceptance:** from authenticated system surfaces the user can locate an authorized record without needing to know its owning Domain, while unauthorized records cannot be inferred through any search output or behavior.

## 5. Sidebar and navigation — complete implementation workstream

For ordinary users the conceptual order is:

`Home → Workspace → My Workspace → authorized Modules/Domains → My Settings`.

The implementation must preserve all authorized Domains, including Domains outside the user's primary Patient Flow classification.

Primary classification must not suppress an authorized Domain.

Domains retain their normal names; no artificial `My Financial`, `My Agenda`, or equivalent copies are created.

Patient Flow remains hidden from ordinary users as a standalone Sidebar Domain while remaining available to Clinic Admin in its approved administrative/background context.

Sidebar visibility does not replace route-level authorization.

Existing navigation entries must not be deleted merely because Workspace changed. Remove/reconcile only proven duplicates or obsolete registrations after establishing their actual ownership and usage.

**Acceptance:** a user with mixed authorized Domains sees every authorized Domain normally while unauthorized Domains remain unavailable through both navigation and direct routes.

## 6. Workspace — complete implementation workstream

Workspace is a user's work environment. It is not Role, permission, Patient Flow, or a security boundary.

Engineering must:

- retain one canonical Workspace system;
- resolve a deterministic default/assigned work context;
- keep internal Clinical/Operational/Administration classification available to the system;
- avoid forcing a classification label into ordinary-user identity/presentation;
- make daily work meaningfully different by context;
- consume current work from canonical Patient Flow and Domains;
- avoid duplicating Domain business logic;
- avoid deriving authorization from Workspace.

Workspace is the evolved replacement for the earlier role-specific provider/doctor/reception work boards; this evolution must not erase the underlying workflows that made those surfaces operationally useful.

**Acceptance:** the user experiences one understandable Workspace work environment, while the system internally applies the appropriate work context without confusing Workspace with Role or authorization.

## 7. My Workspace and complete Widget system

My Workspace is the user's personal working surface within the assigned/default Workspace.

It must support the approved behavior:

- system-selected default Widgets based on important granted capabilities/permissions;
- action/executive daily emphasis;
- useful informational Widgets where appropriate;
- add;
- remove;
- show/hide;
- reorder;
- drag-and-drop ordering;
- continuous vertical scrolling;
- intended Widget sizes;
- reset/restore defaults;
- persistence across reload/session as designed;
- correct user/surface/context scoping;
- no authorization changes through personalization.

Every Widget must be mapped to:

- capability/domain;
- effective permission(s);
- entitlement/feature dependency where applicable;
- type;
- supported context;
- default status;
- size;
- action;
- destination;
- patient/visit dependency where applicable;
- AR/EN labels/content;
- loading/empty/error behavior;
- unauthorized behavior.

Widget classes include Information, Action, Operational, Contextual, Quick Action, Full-page capability, and No-Widget capability.

Permission behavior remains:

`Read → information/read actions only`

`Create/Write → corresponding create action only`

`Edit/Modify → corresponding additional modification actions`

`No relevant permission → normally absent`

A locked presentation is permitted only where intentionally useful and never implies authorization.

**Acceptance:** personalization changes presentation only; it cannot grant, remove, or elevate permissions.

## 8. My Settings — complete implementation workstream

My Settings is separate from My Workspace.

It must support, where allowed by the existing account architecture:

- display-name modification, not immutable user ID modification;
- secure password change;
- personal profile image add/change;
- other personal user-level preferences already supported.

Changes must affect personal account presentation/preferences only and must not modify Workspace assignment, Patient Flow classification, permissions or Domain access.

## 9. Patient Flow and Queue — canonical workflow workstream

Patient Journey remains the system-wide concept; Patient Flow remains the internal workflow.

The canonical workflow must remain authoritative:

`Arrival → Waiting → Clinical handoff → Clinical work → Pending Close → Operational/Reception → Completed`.

Where already authoritative, preserve `cancelled` and `no_show` paths.

Workspace actions must invoke canonical transition authority. No Workspace-local state machine and no client-only workflow mutation may be introduced.

Preserve and validate:

- transition validation;
- permissions;
- clinical locking;
- handoff;
- revalidation;
- invalidation/refetch;
- audit records;
- visit/session references;
- current state consistency.

**Acceptance:** the full patient chain remains coherent when operated through the new Workspace surfaces.

## 10. Clinical Workspace — complete implementation workstream

Clinical Workspace is the evolution from the previous doctor/provider board to a clinical-team work surface.

When relevant and authorized it must expose the working context required by the clinical task, including:

- patient information;
- current visit/session;
- required procedures/work;
- reports;
- medical images/files;
- permitted medical-record context;
- permitted clinical actions;
- completion/handoff.

Resolution follows:

`Patient Flow state + Visit/session + required work + Room/Procedure context + effective permission → clinical work surface`.

Workspace integrates with Visit, Room, Procedure, Service Catalog, Treatment Plan, Medical Photos, Follow-up and other domains; it does not duplicate their business logic.

The physician must not remain a hard-coded universal owner where the approved architecture has moved clinical work to the clinical team.

## 11. Operational Workspace — complete implementation workstream

Operational Workspace must expose actual reception/operational work from canonical Queue/Patient Flow and the relevant operational Domains.

It must support the approved handoffs:

- operational/reception → clinical;
- clinical → `pending_close` → operational/reception;
- completion.

It must not become a collection of duplicate Patients/Agenda/Billing/Queue mini-applications.

## 12. Patient Context and Domain integration

Patient Context is a presentation/orchestration mechanism, not a new Domain.

Where authorized it must preserve useful contextual navigation among the existing patient-related Domains, including where applicable:

- Patient;
- Visit;
- Appointment;
- Treatment Plan;
- Financial Plan;
- Payments/Installments;
- Follow-up;
- Communications;
- medical records/files/photos;
- Portal information;
- resources/consumption owned by existing Domains.

Domain ownership remains intact. Route/action authorization and tenant isolation remain mandatory. Patient/visit context should be preserved when navigating where the existing product model supports it.

## 13. Role, permissions and tenant security

Role remains job/function. Clinical/Operational/Administration remain Patient Flow work classifications. Workspace remains a work surface. Permissions remain authorization.

Effective permissions are authoritative.

Mixed permissions must work: an ordinary user may have permissions outside primary classification without changing Workspace or Role/classification.

Validate authorization independently at:

- Sidebar;
- Workspace Widgets;
- Widget actions;
- Search;
- contextual navigation;
- Patient Flow mutations;
- Domain routes/actions;
- Clinic Admin actions.

Validate RLS and tenant isolation independently from UI visibility.

No second authorization engine may be introduced.

## 14. Clinic Admin — separate complete workstream

Clinic Admin is not an ordinary user with a larger permission set.

The implementation must preserve the clinic administration center and its clinic-wide authority over:

- users;
- Roles;
- permissions;
- Patient Flow classifications;
- Workspace configuration;
- Modules/Domains;
- clinic-level administration;
- oversight/testing of the subscribed system as approved.

Ordinary-user Home/Workspace/My Workspace behavior must not replace, simplify, or erase Clinic Admin administration.

The current intentional open test Clinic Admin account must remain capable of testing the currently available subscribed system during implementation.

## 15. Database, persistence and API

Inspect actual live schema against repository migrations before changing schema.

Reuse valid existing Workspace, Widget, Patient Flow, Queue, permission and account structures.

Only create schema/API objects when the approved requirements cannot be implemented safely with the existing canonical model.

Every persistence change must have repository migration evidence and must preserve tenant/RLS/security semantics.

Widget personalization persistence must remain presentation-only and correctly scoped.

Search infrastructure must not introduce an unauthorized cross-tenant index or data cache.

## 16. i18n, RTL/LTR, responsive and accessibility

Every affected visible element is part of the implementation contract, including small controls and states.

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

No post-render translation workaround may be introduced.

## 17. Historical/legacy reconciliation

When older implementation or documentation conflicts with the 2026-09-01 decisions:

1. identify the exact conflict;
2. verify that it is within this decision scope;
3. preserve every non-conflicting behavior and artifact;
4. modify only the conflicting portion;
5. retain useful historical implementation patterns where they satisfy the new decisions;
6. remove code/documentation only when it is proven duplicate, obsolete, or directly contradictory;
7. document the reconciliation.

**No wholesale deletion is allowed because one portion conflicts.**

## 18. End-to-end scenarios

### Clinical team member
`Login → Home → Header/Search → Sidebar → Workspace → patient available → clinical work → patient/visit/report/image context → permitted procedure/work → finish clinical work → Pending Close → operational handoff`.

### Operational/reception member
`Login → Home → Workspace → waiting/queue → prepare/route patient → clinical handoff → return to operational work → completion`.

### Mixed permissions
`Primary work remains unchanged → authorized outside-classification Domain appears normally in Sidebar → only actual permitted actions are available`.

### My Workspace
`Default widgets → personalize → add/remove/show/hide/reorder/drag-drop → reload → reset → no authorization change`.

### Search
`Header search → authorized query → result type/context → permitted destination → no unauthorized inference`.

### Clinic Admin
`Administrative surface remains distinct → administer users/Roles/permissions/Workspace/Domains → test subscribed system → ordinary-user behavior remains separate`.

## 19. Final closure gates

No completion claim is valid until evidence exists for every applicable architecture decision and every coverage-matrix row, including:

- Home;
- every required Home information/widget category;
- Header;
- Global Search;
- Sidebar;
- Workspace;
- My Workspace;
- every Widget behavior and personalization function;
- My Settings;
- Clinical Workspace;
- Operational Workspace;
- Patient Flow;
- Queue;
- handoffs/Pending Close;
- Patient Context;
- affected Domain integrations;
- Role/permission separation;
- effective authorization;
- tenant isolation/RLS;
- Clinic Admin separation;
- database/persistence/API;
- AR/EN;
- RTL/LTR;
- mobile/responsive;
- loading/empty/error states;
- runtime regression.

Evidence must include source diff, build/type/test, DB/migration, authorization/RLS, runtime browser, ordinary-user scenarios, Clinic Admin scenarios, responsive/i18n evidence, and documentation/index/handoff updates.

## 20. Final architecture-to-execution integrity rule

Before code modification begins, the implementation package must satisfy both directions:

**Forward traceability:** every approved architectural decision has one or more explicit implementation tasks and acceptance tests.

**Reverse traceability:** every implementation task is justified by an approved architectural decision, an explicit user clarification that concretizes that decision, or a necessary technical mechanism required to realize it without changing its meaning.

Anything that cannot satisfy either direction is not silently implemented.

**No important approved item is deferred. No architectural decision is invented by engineering. No unrelated architecture is redesigned. No partial implementation may be reported as complete.**

**End of Complete Execution Plan.**
