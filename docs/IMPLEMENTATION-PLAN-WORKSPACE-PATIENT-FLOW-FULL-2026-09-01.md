# CORE SYSTEM — FULL WORKSPACE × PATIENT FLOW IMPLEMENTATION PLAN
## Complete implementation preparation — no partial implementation

**Date:** 2026-09-01  
**Status:** READY FOR FULL IMPLEMENTATION — RECONCILED 2026-09-11  
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Engineering authority:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Traceability:** `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md`  
**Global surfaces reconciliation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

---

## 0.1 CURRENT CANONICAL USER / SURFACE MODEL

This implementation plan must be interpreted according to the 2026-09-11 reconciliation:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace
```

is independent from:

```text
Effective Permissions
        ↓
Authorized Domains / Capabilities
        ├── Sidebar
        ├── Widgets
        └── My Workspace
```

Additional permissions do not redefine the user's Role, Primary Work Context or Role Workspace. My Workspace is the user's personal working arrangement, not a second Role Workspace. Home is an independent global starting/awareness surface. The Header is a persistent global access layer.

A Clinical primary user therefore remains in Clinical Workspace when granted additional financial, operational, administrative, reporting or other permissions; those capabilities may appear through authorized Domains, Sidebar entries, Widgets and My Workspace without changing the primary Role Workspace.

The current Clinical and Operational Workspaces are preserved as their established primary work environments. Administrative Workspace is outside this reconciliation's redesign scope.

---

## 0. EXECUTION PRINCIPLE

This is a full implementation plan for the 2026-09-01 architectural decisions plus the 2026-09-11 global-surface clarification.

It is **not** a request to implement only the visible Workspace page.

Every affected dependency must be inspected and repaired as a single system:

```text
Architecture
   ↓
Engineering contracts
   ↓
Global Header
   ↓
Home
   ↓
Sidebar
   ↓
Role Workspace
   ↓
My Workspace
   ↓
Permissions / Entitlements
   ↓
Patient Flow / Queue
   ↓
Visit / clinical context
   ↓
Agenda / rooms / procedures
   ↓
Modules / Domains
   ↓
Database / RLS / audit
   ↓
Runtime / UX / E2E evidence
```

---

## 1. PHASE W0 — BASELINE AND FREEZE

### Objective
Establish the exact current implementation before changing anything.

### Required work
- record current `main` commit;
- inventory Workspace-related files;
- inventory Patient Flow/Queue files;
- inventory navigation/sidebar files;
- inventory Header files;
- inventory Home files;
- inventory widget files;
- inventory permission files;
- inventory visit/clinical files;
- inventory Communications/Notifications/auth/i18n files;
- inventory relevant migrations and RLS;
- identify current routes and redirects;
- identify all references to `operation`, `clinical`, `administrative`, `workspace`, `my workspace`, `home`, `header`, `communications`, `chat`, `notifications`, `logout`, `queue`, `pending_close`;
- identify stale/duplicate implementations;
- compare archived historical implementation packages to current implementation only as evidence, not as authority;
- identify documentation using obsolete or ambiguous Workspace terminology.

### Exit gate
A complete baseline map exists and no implementation change has been made under this plan.

---

## 2. PHASE W1 — CANONICAL WORKSPACE CONTEXT

### Objective
Create one authoritative resolution path for the ordinary user's primary/default Role Workspace presentation.

### Required changes
- inspect and reuse existing workspace membership/default data;
- define the current presentation context contract;
- ensure the resolver does not equate Workspace with Role as authorization;
- ensure it does not grant permissions;
- ensure it can coexist with effective permissions outside the primary context;
- expose a stable server-side context to shell/Workspace/widget consumers;
- remove competing context derivations;
- keep Role Workspace stable when only additional permissions change.

### Required tests
- user with normal clinical context;
- user with operational context;
- user with cross-context Domain permissions;
- user whose extra permissions are added/removed without a primary-context change;
- user with no invalid workspace assignment;
- tenant isolation.

---

## 3. PHASE W2 — GLOBAL HEADER / HOME / SIDEBAR

### Objective
Make the global shell and navigation model match the architectural decision without breaking existing Domain routes.

### Required structure
```text
Header (persistent global access)
   ↓
Home (global starting / awareness surface)
   ↓
Workspace (primary professional work environment)
   ↓
My Workspace (personal work arrangement)
   ↓
Authorized Domains
   ↓
My Settings
```

### Header required boundary
The Header must remain a persistent global access layer.

It should provide the minimum stable global functions:

- system identity/branding;
- existing Global Search;
- Communications access;
- separate compact Chat access backed by Communications;
- Notifications access;
- Quick Actions with initial global actions such as Language and Logout.

The Header must not become a universal business-action dashboard, second Home, or second Workspace.

### Home required boundary
Home is independent from Role Workspace and My Workspace.

Home may provide global/lightweight information and utilities such as:

- user/clinic context;
- daily awareness;
- appointment/waiting/work summaries;
- attention summary;
- global Calendar utility and lightweight calendar/request actions;
- Weather/ambient external information;
- user-selected quick-access shortcuts;
- optional system-managed/partner content;
- summaries that route to the authoritative work destination.

Home must not own full clinical/operational workflows.

### Sidebar required boundary
```text
Home
Workspace
My Workspace
authorized Modules/Domains
My Settings
```

Primary classification must not suppress an authorized Domain. Additional permissions may expose Domains outside the user's primary context.

### Required changes
- remove any Role-like Workspace naming from ordinary-user UI;
- preserve internal classifications where required by engineering;
- make Sidebar Domain visibility authorization-driven;
- preserve full Domain routes;
- ensure Home is separate from Role Workspace and My Workspace;
- ensure Home content is not treated as proof that all current widgets belong there;
- preserve global search/header/i18n behavior;
- preserve mobile/responsive behavior;
- preserve My Settings in Sidebar.

### Regression focus
- RTL/LTR;
- language switching;
- logout/shared-workstation behavior;
- route guards;
- deep links;
- unauthorized route access;
- cross-context authorized Domain visibility;
- global Header persistence.

---

## 4. PHASE W3 — MY WORKSPACE / WIDGET SYSTEM

### Objective
Implement My Workspace as a personal work/presentation surface associated with the user's Role Workspace, not as a permission or workflow system.

### Required changes
- establish default widget catalogue;
- associate widget availability with effective authorization/capability;
- preserve personalization state by user + surface/context;
- support add/remove/hide/reorder where already required;
- prevent personalization from mutating authorization;
- prevent widget actions from bypassing server authorization;
- ensure Home is not treated as My Workspace;
- ensure cross-context permitted widgets may appear without changing Role Workspace;
- ensure Home preferences do not bleed into My Workspace and vice versa.

### Required tests
- default state;
- hide/reorder/add;
- read-only capability;
- write capability;
- unauthorized capability;
- authorized cross-context capability;
- primary Role Workspace remains unchanged when permissions change;
- mobile rendering.

---

## 5. PHASE W4 — PATIENT FLOW / QUEUE INTEGRATION

### Objective
Make Workspace consume the canonical Patient Flow state machine.

### Required changes
- preserve `queueEngine` as transition authority;
- preserve existing states and transition validation;
- audit all workspace actions;
- remove duplicated local state transitions;
- ensure clinical handoff reaches `pending_close`;
- ensure operational/reception workflow receives the handoff;
- ensure completed/no-show/cancelled paths remain valid;
- ensure locking and ownership remain server-enforced;
- ensure affected surfaces are revalidated after mutation.

### Existing code requiring focused audit
`src/domain/queue/workspace.actions.ts`.

The current implementation already uses effective permissions and `queueEngine.validateTransition`; this must be preserved. Its generic transition API must be checked for accidental overexposure.

---

## 6. PHASE W5 — CLINICAL WORKSPACE

### Objective
Preserve and validate the existing clinical primary work environment without making it responsible for cross-domain permission presentation.

### Required changes
- inspect clinical entry points;
- identify all assumptions that the clinical actor is always `doctor_id`;
- map clinical work to existing visit/session/assignment concepts;
- use effective capabilities/permissions to determine permitted actions;
- preserve patient chart context;
- preserve medical documents/photos/procedures as Domain-owned data;
- preserve future Visit/Room/Procedure workflow boundaries;
- keep the Workspace focused on the primary clinical work required by Patient Flow.

### Prohibited changes
- no new clinical Role architecture;
- no new clinical workflow engine;
- no embedding room/procedure business logic in Workspace;
- no deletion of existing visit workflow;
- no expansion merely because the user received cross-domain permissions; those belong to Sidebar/My Workspace/Widgets.

---

## 7. PHASE W6 — OPERATIONAL WORKSPACE

### Objective
Preserve and validate the existing operational primary work environment as the correct predecessor/successor in the patient handoff chain.

### Required changes
- waiting patient presentation;
- arrival/check-in integration;
- handoff to clinical work;
- pending-close reception work;
- completion/no-show/cancelled operations;
- ensure operational widgets/actions use existing Domain logic.

### Required tests
Full daily reception simulation from arrival to completion.

---

## 8. PHASE W7 — DOMAIN INTEGRATION

### Objective
Ensure Workspace does not create reduced duplicates of Modules/Domains and that cross-domain permissions do not mutate primary work context.

### Required integration audit
For every currently visible authorized Domain:

- route;
- read permissions;
- write permissions;
- edit permissions;
- domain service/action ownership;
- navigation registration;
- subscription/entitlement dependency;
- Workspace contextual entry points;
- patient/visit relationships;
- audit behavior;
- whether the Domain belongs in Sidebar only, My Workspace, a Widget, Home summary, or more than one surface for distinct purposes.

### Required behavior
A Domain shown in Sidebar remains the same Domain whether reached from Sidebar, My Workspace, Home, Header, or a contextual Workspace action.

---

## 9. PHASE W8 — VISIT / AGENDA / ROOM / PROCEDURE DEPENDENCIES

### Objective
Validate all dependencies without prematurely implementing future domain workflows.

### Required work
- map appointment → arrival → session;
- map session → visit;
- map room references;
- map clinical procedure references;
- map agenda event references;
- confirm each authoritative source;
- remove duplicate presentation-only copies where they cause divergence;
- define integration contracts for future detailed workflows.

### Boundary
This phase prepares the integration; it does not invent detailed Visit/Room/Procedure architecture not already approved.

---

## 10. PHASE W9 — PERMISSION / SECURITY / RLS

### Objective
Guarantee that the presentation model does not weaken authorization and that permission expansion does not mutate Role Workspace.

### Required audit
- Permission Engine;
- route guards;
- server actions;
- RLS;
- tenant scoping;
- Workspace membership access;
- widget action authorization;
- Domain route authorization;
- Sidebar authorization;
- Home data visibility;
- Header global-access authorization;
- Clinic Admin authority.

### Required invariant
```text
UI visibility ≠ authorization
Workspace ≠ authorization
Widget ≠ authorization
Role ≠ Workspace
Additional Permission ≠ Role Workspace change
Primary Classification ≠ Sidebar visibility filter
```

---

## 11. PHASE W10 — CLINIC ADMIN PRESERVATION

### Objective
Ensure ordinary-user work does not destroy or regress Clinic Admin.

### Required work
- audit current Clinic Admin route/shell;
- identify accidental reuse of ordinary-user Workspace assumptions;
- preserve user/Role/permission/module configuration;
- preserve tenant settings;
- preserve subscription/admin controls;
- ensure Clinic Admin can configure the system without becoming a normal Workspace user.

---

## 12. PHASE W11 — DATABASE / MIGRATIONS / RLS

### Objective
Apply only schema changes proven necessary by the preceding phases.

### Required process
1. inspect existing schema;
2. inspect live-vs-repo migration parity;
3. reuse existing tables/columns;
4. add only missing structures;
5. write migration;
6. add/update RLS;
7. validate tenant isolation;
8. validate existing data;
9. update generated types;
10. validate rollback/recovery path.

### No-go
No duplicate Workspace table, permission table, Role table, Patient Flow state table, widget ACL table, Chat database, Communications database, or visit table.

---

## 13. PHASE W12 — AUDIT / OBSERVABILITY / STATE CONSISTENCY

### Required evidence
Every significant workflow transition must be traceable.

At minimum validate:

- actor;
- tenant;
- patient/session;
- previous state;
- next state;
- timestamp;
- relevant context;
- authorization result where appropriate.

The UI must converge on the server state after transitions.

---

## 14. PHASE W13 — REAL CLINIC SCENARIOS

### Scenario 1 — Reception arrival

Appointment exists → patient arrives → reception identifies patient → patient enters waiting → clinical team sees appropriate work.

### Scenario 2 — Clinical work

Clinical team member opens assigned/available work → sees patient context → performs current clinical work → ends clinical work → session becomes pending close → reception continues.

### Scenario 3 — Cross-context Domain

Clinical primary user has authorized access to another Domain → Domain appears normally in Sidebar → Domain remains full Domain → My Workspace may expose permitted tools/widgets → Clinical Role Workspace remains unchanged.

### Scenario 4 — My Workspace

User changes widget arrangement → arrangement persists → no authorization changes → no Role Workspace change → Patient Flow unaffected.

### Scenario 5 — Home

Home displays global/daily information and lightweight utilities → user moves to the appropriate Workspace/Domain for execution. Home does not own the workflow.

### Scenario 6 — Header communications

User opens Communications from the Header for broader communication access or opens Chat for an immediate conversation. Both use the existing Communications authority.

### Scenario 7 — Header notifications

User opens Notifications from anywhere in the system and receives the same authoritative notification state.

### Scenario 8 — Shared workstation

User A performs work → Logout → User B authenticates → subsequent actions are attributable to User B. Logout must be easily accessible.

### Scenario 9 — Clinic Admin

Clinic Admin configures users/roles/permissions/workspaces/domains without losing administrative capabilities.

### Scenario 10 — Unauthorized mutation

User reaches a UI entry point but lacks the required permission. Server rejects the mutation.

---

## 15. PHASE W14 — FULL REGRESSION

Regression must include:

- authentication;
- tenant resolution;
- Header;
- Global Search;
- Communications;
- Chat compact surface;
- Notifications;
- Quick Actions;
- Home;
- Workspace;
- My Workspace;
- Sidebar;
- My Settings;
- Patients;
- Agenda;
- Queue/Patient Flow;
- Visit;
- clinical actions;
- permissions;
- Clinic Admin;
- subscription/entitlements;
- i18n;
- RTL/LTR;
- mobile;
- audit;
- production deployment.

---

## 16. PHASE W15 — CLOSURE

The implementation cannot be called complete when only the visible Workspace pages are working.

Closure requires:

- all traceability rows green;
- all required source changes merged;
- migrations applied and verified;
- runtime scenarios passed;
- no duplicate workflow/authorization/communications engines;
- Home/Header/Workspace/My Workspace/Sidebar semantics verified against the canonical reconciliation;
- documentation synchronized across active architecture/engineering documents;
- historical documentation clearly classified where terminology is obsolete;
- production evidence captured;
- unresolved conflicts explicitly escalated rather than silently changed.

---

## 17. IMPLEMENTATION ARTIFACTS REQUIRED

Before coding begins, implementation should produce/update:

1. Workspace context contract.
2. Global Header contract.
3. Home composition contract.
4. Navigation/sidebar contract.
5. Widget/presentation contract.
6. Patient Flow integration contract.
7. Clinical Workspace integration contract.
8. Operational Workspace integration contract.
9. Domain integration inventory.
10. Permission/RLS impact matrix.
11. Database migration plan where required.
12. Runtime/E2E scenario matrix.
13. Documentation reconciliation register.
14. Evidence/closure report.

These artifacts are subordinate to the approved architecture and canonical reconciliation and must not introduce new architectural decisions.

---

## 18. STOP CONDITIONS DURING IMPLEMENTATION

Implementation must stop and escalate if:

- a required behavior conflicts with a decision outside this scope;
- an existing table has incompatible semantics that cannot be reconciled;
- a new authorization engine appears necessary;
- Patient Flow requires a new state not covered by approved architecture;
- Clinic Admin behavior would need architectural redesign;
- an old document appears to contain a decision that directly conflicts with the approved decisions and cannot be reconciled without an explicit architectural decision;
- the only proposed solution is destructive deletion of existing documentation/code that contains unrelated valid functionality;
- engineering wants to change Role Workspace because of additional permissions rather than an intentional primary-context change.

---

## 19. FINAL EXECUTION RULE

The objective is not to make Workspace "look right".

The objective is to make the entire system behave as one coherent product under the approved architecture and the 2026-09-11 global-surface clarification:

```text
correct architecture
      +
correct surface boundaries
      +
correct engineering relationships
      +
correct implementation
      +
correct permissions
      +
correct data/state
      +
correct patient workflow
      +
correct user experience
      =
complete implementation
```
