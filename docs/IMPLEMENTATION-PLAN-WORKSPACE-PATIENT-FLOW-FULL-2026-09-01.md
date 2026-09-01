# CORE SYSTEM — FULL WORKSPACE × PATIENT FLOW IMPLEMENTATION PLAN
## Complete implementation preparation — no partial implementation

**Date:** 2026-09-01  
**Status:** READY FOR FULL IMPLEMENTATION  
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Engineering authority:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Traceability:** `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md`

---

## 0. EXECUTION PRINCIPLE

This is a full implementation plan for the 2026-09-01 architectural decisions.

It is **not** a request to implement only the visible Workspace page.

Every affected dependency must be inspected and repaired as a single system:

```text
Architecture
   ↓
Engineering contracts
   ↓
Navigation / shell
   ↓
Workspace / My Workspace / Home
   ↓
Permissions
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
- inventory widget files;
- inventory permission files;
- inventory visit/clinical files;
- inventory relevant migrations and RLS;
- identify current routes and redirects;
- identify all references to `operation`, `clinical`, `administrative`, `workspace`, `my workspace`, `doctor`, `queue`, `pending_close`;
- identify stale/duplicate implementations;
- compare archived historical implementation packages to current implementation only as evidence, not as authority.

### Exit gate
A complete baseline map exists and no implementation change has been made under this plan.

---

## 2. PHASE W1 — CANONICAL WORKSPACE CONTEXT

### Objective
Create one authoritative resolution path for the ordinary user's current/default Workspace presentation.

### Required changes
- inspect and reuse existing workspace membership/default data;
- define the current presentation context contract;
- ensure the resolver does not equate Workspace with Role;
- ensure it does not grant permissions;
- ensure it can coexist with effective permissions outside the primary context;
- expose a stable server-side context to shell/Workspace/widget consumers;
- remove competing context derivations.

### Required tests
- user with normal clinical context;
- user with operational context;
- user with cross-context Domain permissions;
- user with no invalid workspace assignment;
- tenant isolation.

---

## 3. PHASE W2 — GLOBAL SHELL / HOME / SIDEBAR

### Objective
Make the ordinary-user navigation model match the architectural decision without breaking existing Domain routes.

### Required structure
```text
Home
Workspace
My Workspace
Authorized Domains
My Settings
```

### Required changes
- remove any Role-like Workspace naming from ordinary-user UI;
- preserve internal classifications where required by engineering;
- make Sidebar Domain visibility authorization-driven;
- preserve full Domain routes;
- ensure Home is separate from Workspace;
- preserve global search/header/i18n behavior;
- preserve mobile/responsive behavior.

### Regression focus
- RTL/LTR;
- language switching;
- route guards;
- deep links;
- unauthorized route access;
- cross-context authorized Domain visibility.

---

## 4. PHASE W3 — MY WORKSPACE / WIDGET SYSTEM

### Objective
Implement My Workspace as a personalization surface, not a permission or workflow system.

### Required changes
- establish default widget catalogue;
- associate widget availability with effective authorization/capability;
- preserve personalization state by user + surface;
- support add/remove/hide/reorder where already required;
- prevent personalization from mutating authorization;
- prevent widget actions from bypassing server authorization;
- ensure Home preferences do not bleed into My Workspace and vice versa.

### Required tests
- default state;
- hide/reorder/add;
- read-only capability;
- write capability;
- unauthorized capability;
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
Replace doctor-centric assumptions with the approved clinical-team work surface while preserving the existing clinical workflow.

### Required changes
- inspect clinical entry points;
- identify all assumptions that the clinical actor is always `doctor_id`;
- map clinical work to existing visit/session/assignment concepts;
- use effective capabilities/permissions to determine permitted actions;
- preserve patient chart context;
- preserve medical documents/photos/procedures as Domain-owned data;
- preserve future Visit/Room/Procedure workflow boundaries;
- keep the Workspace focused on presenting the work required now.

### Prohibited changes
- no new clinical Role architecture;
- no new clinical workflow engine;
- no embedding room/procedure business logic in Workspace;
- no deletion of existing visit workflow.

---

## 7. PHASE W6 — OPERATIONAL WORKSPACE

### Objective
Ensure the operational surface is the correct predecessor/successor in the patient handoff chain.

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
Ensure Workspace does not create reduced duplicates of Modules/Domains.

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
- audit behavior.

### Required behavior
A Domain shown in Sidebar remains the same Domain whether reached from Sidebar or a contextual Workspace action.

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
Guarantee that the new presentation model does not weaken authorization.

### Required audit
- Permission Engine;
- route guards;
- server actions;
- RLS;
- tenant scoping;
- Workspace membership access;
- widget action authorization;
- Domain route authorization;
- Clinic Admin authority.

### Required invariant
```text
UI visibility ≠ authorization
Workspace ≠ authorization
Widget ≠ authorization
Role ≠ Workspace
```

---

## 11. PHASE W10 — CLINIC ADMIN PRESERVATION

### Objective
Ensure ordinary-user Workspace work does not destroy or regress Clinic Admin.

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
No duplicate Workspace table, permission table, Role table, Patient Flow state table, widget ACL table, or visit table.

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

Clinical primary user has authorized access to another Domain → Domain appears normally in Sidebar → Domain remains full Domain → actions respect its permissions.

### Scenario 4 — My Workspace

User changes widget arrangement → arrangement persists → no authorization changes → Patient Flow unaffected.

### Scenario 5 — Home

Home displays daily information → user moves to Workspace → workflow starts from authoritative current state.

### Scenario 6 — Clinic Admin

Clinic Admin configures users/roles/permissions/workspaces/domains without losing administrative capabilities.

### Scenario 7 — Unauthorized action

User can see a relevant record but cannot perform an unauthorized mutation → server rejects it.

### Scenario 8 — Concurrent clinical work

Two authorized clinical users encounter the same work → lock/ownership prevents unsafe simultaneous transition according to existing Queue rules.

---

## 15. PHASE W14 — FULL REGRESSION

Regression must include:

- authentication;
- tenant resolution;
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
- no duplicate workflow/authorization engines;
- documentation synchronized;
- production evidence captured;
- unresolved conflicts explicitly escalated rather than silently changed.

---

## 17. IMPLEMENTATION ARTIFACTS REQUIRED

Before coding begins, implementation should produce/update:

1. Workspace context contract.
2. Navigation/sidebar contract.
3. Widget/presentation contract.
4. Patient Flow integration contract.
5. Clinical Workspace integration contract.
6. Operational Workspace integration contract.
7. Domain integration inventory.
8. Permission/RLS impact matrix.
9. Database migration plan where required.
10. Runtime/E2E scenario matrix.
11. Evidence/closure report.

These artifacts are subordinate to the 2026-09-01 architecture decision and must not introduce new architectural decisions.

---

## 18. STOP CONDITIONS DURING IMPLEMENTATION

Implementation must stop and escalate if:

- a required behavior conflicts with a decision outside this scope;
- an existing table has incompatible semantics that cannot be reconciled;
- a new authorization engine appears necessary;
- Patient Flow requires a new state not covered by approved architecture;
- Clinic Admin behavior would need architectural redesign;
- an old document appears to contain a decision that directly conflicts with the 2026-09-01 decisions and cannot be reconciled without an explicit architectural decision;
- the only proposed solution is destructive deletion of existing documentation/code that contains unrelated valid functionality.

---

## 19. FINAL EXECUTION RULE

The objective is not to make Workspace "look right".

The objective is to make the entire system behave as one coherent product under the 2026-09-01 decisions:

```text
correct architecture
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
