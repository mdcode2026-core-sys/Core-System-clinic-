# CORE SYSTEM — WORKSPACE × PATIENT FLOW
## FINAL ENGINEERING READINESS REPORT — 2026-09-01

**Status:** ENGINEERING PACKAGE COMPLETE — READY FOR IMPLEMENTATION  
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Engineering specification:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Traceability matrix:** `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md`  
**Implementation plan:** `docs/IMPLEMENTATION-PLAN-WORKSPACE-PATIENT-FLOW-FULL-2026-09-01.md`  
**Current global-surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 reconciliation notice:** The original readiness report remains an engineering-readiness record. The following distinctions are now canonical when interpreting its generic “Workspace” wording: Role Workspace is the user's primary professional work environment; My Workspace is the personal working/presentation surface; Home is an independent global starting/awareness surface; Sidebar is authorization-driven; additional permissions do not redefine Role Workspace; Header is a persistent global access layer.

---

## 1. EXECUTIVE RESULT

The 2026-09-01 Workspace/Patient Flow decisions have been converted into a complete engineering package without replacing the rest of CORE SYSTEM architecture.

The package establishes a single implementation boundary:

```text
2026-09-01 architectural decisions
            ↓
2026-09-11 canonical surface clarification
            ↓
engineering relationships
            ↓
existing authoritative domains
            ↓
implementation changes
            ↓
cross-system validation
```

The package deliberately avoids declaring unrelated older architecture cancelled.

---

## 2. WHAT THE ENGINEERING PACKAGE DECIDES

It does not add unrelated product decisions. It defines how the approved decisions must be implemented.

### Role / Primary Work Context / Role Workspace

The primary relationship is:

```text
Primary Role
    ↓
Primary Work Context
    ↓
Role Workspace
```

The Role Workspace is the user's primary professional working environment. Additional permissions outside that context do not change it.

### Permissions

Effective permissions determine authorized actions/capabilities and may expand the user's Sidebar Domains, Widgets and My Workspace content. They do not redefine the user's primary Role Workspace.

### My Workspace

My Workspace is the personal presentation/customization layer associated with the user's Role Workspace. It does not create authorization or a second workflow.

### Home

Home is the global daily starting/awareness surface and remains separate from Role Workspace and My Workspace.

### Header

The authenticated Header is a persistent global access layer distinct from Home and Workspaces. It provides Global Search and the approved global access controls; the final implementation may expose Communications, compact Chat, Notifications and Quick Actions according to the current canonical surface contract.

### Sidebar

Sidebar Domain visibility is authorization-driven. An authorized Domain outside the user's primary work context remains visible as a normal Domain.

### Patient Flow

Patient Flow remains the canonical workflow/state owner. Workspace projects the relevant work onto the user surface.

### Clinical Workspace

Clinical Workspace remains the primary clinical work environment. This reconciliation does not authorize redesigning it because a user receives cross-domain permissions.

### Operational Workspace

Operational Workspace remains the primary operational work environment. This reconciliation does not authorize redesigning it because a user receives cross-domain permissions.

### Administration Workspace

Administration remains a distinct work context. Detailed redesign is outside this reconciliation.

### Handoff

Clinical work ends in the approved handoff state (`pending_close`) and returns responsibility to the operational/reception workflow. It does not silently close the entire visit.

### Clinic Admin

Clinic Admin remains a distinct administrative authority and is not reduced to the ordinary-user Workspace model.

---

## 3. WHAT MUST CHANGE IN IMPLEMENTATION

The full implementation must address all affected layers, not only visible screens.

### A. Shell and navigation
- preserve Home as an independent landing surface;
- ensure Role Workspace remains the primary professional work environment;
- preserve My Workspace as the personal work arrangement;
- make Domain visibility authorization-driven;
- preserve full Domain routes;
- preserve the persistent global Header;
- preserve My Settings in Sidebar.

### B. Workspace context
- establish one canonical primary Role Workspace context resolver;
- eliminate competing derivations;
- keep Role, Primary Work Context and permissions separate from Workspace presentation;
- keep permission expansion from mutating the primary Role Workspace.

### C. My Workspace
- preserve/default widget catalogue;
- persist personalization by user + presentation surface/context;
- keep personalization outside authorization;
- allow authorized cross-context tools/widgets where product rules support them.

### D. Patient Flow
- preserve queue engine as state authority;
- audit workspace actions;
- preserve status transitions and locking;
- preserve clinical → pending_close → operational handoff.

### E. Clinical
- preserve the existing Clinical primary work environment;
- remove doctor-only assumptions only where they contradict the approved clinical-team model;
- keep detailed clinical domain logic in authoritative modules.

### F. Operational
- preserve the existing Operational primary work environment;
- preserve arrival, waiting, handoff, pending-close reception work, completion, no-show and cancellation.

### G. Domain integration
- keep every Module/Domain complete;
- expose contextual entry points without duplicating Domain logic;
- preserve permissions and entitlements;
- keep cross-context authorized Domains visible independently of Role Workspace.

### H. Data/security
- reuse existing schema;
- add migrations only where required;
- preserve tenant isolation/RLS;
- keep server-side authorization authoritative.

### I. Header/global surfaces
- inspect existing Global Search rather than rebuilding it;
- implement/reconcile global Communications access only through the existing Communications Domain;
- implement/reconcile compact Chat only as a presentation layer over Communications;
- implement/reconcile Notifications through the existing Notifications authority;
- keep initial Global Header Quick Actions limited to Language and Logout;
- preserve Logout for shared-device accountability.

### J. Home
- treat Home as an independent global starting/awareness surface;
- classify current Home elements rather than assuming all belong there;
- keep full workflows in their authoritative surfaces;
- support approved global/lightweight utilities where retained by final product design.

---

## 4. WHAT MUST NOT CHANGE

The implementation must not use this work as a reason to:

- redesign unrelated modules;
- replace Permission Engine;
- create a second Queue/Patient Flow engine;
- create a second Role system;
- create duplicate patient/visit/workflow tables;
- create a parallel Communications/Chat database or permission system;
- turn authorized Domains into classification-specific copies;
- delete entire historical documents because one portion is superseded;
- remove Clinic Admin functionality;
- make additional permissions redefine Role Workspace;
- collapse Home into My Workspace;
- make Header into a second Workspace;
- prematurely implement detailed room/procedure/visit sub-workflows that belong to their own approved domain contracts.

---

## 5. CURRENT CODE EVIDENCE

The current repository contains a reusable Patient Flow authority in `src/domain/queue/workspace.actions.ts`.

The implementation currently:

- resolves the authenticated user and tenant;
- resolves effective permissions;
- supports operation/clinical contexts;
- validates allowed Patient Flow states;
- delegates transition validation to `queueEngine.validateTransition`;
- enforces clinical locking;
- transitions clinical work to `pending_close`;
- clears clinical lock on handoff;
- revalidates operation, clinical and queue surfaces.

This is the correct foundation to extend. A second workflow engine must not be created.

A focused audit is still required around generic transition entry points and around the distinction between internal context identifiers and user-facing labels.

The existing Workspace implementation should also be audited for the historical use of a shared `global` key where Home and My Workspace now have distinct product meanings.

---

## 6. EXTERNAL PRACTICE EVIDENCE

External evidence was used only to validate engineering patterns, not to override CORE SYSTEM decisions.

OpenEMR documents the clinical encounter as a sequence of events performed by different clinic staff, with role permissions controlling who can perform each task. This supports the separation of encounter workflow from a single job title. 

OpenEMR's patient flow documentation also demonstrates explicit arrival/check-in/status/room/check-out behavior, supporting a canonical stateful workflow rather than UI-only status changes. 

Medplum's workflow model uses Tasks associated with a patient/encounter and assignable to individuals or groups, supporting a scalable pattern for routing work to the responsible actor without redefining the encounter itself. 

These references reinforce the engineering direction already selected by CORE SYSTEM; they do not introduce new product requirements.

---

## 7. IMPLEMENTATION READINESS

### Architecture
**READY** — decisions are bounded and explicit.

### Engineering
**READY** — relationships, ownership boundaries, required changes and non-changes are documented.

### Execution
**READY FOR IMPLEMENTATION** — the full implementation sequence and acceptance gates are documented.

### Runtime
**NOT YET VERIFIED** — implementation and runtime evidence must be produced after coding.

This distinction is intentional: documentation readiness is not falsely reported as runtime completion.

---

## 8. REQUIRED IMPLEMENTATION EVIDENCE

The implementation must eventually provide evidence for:

1. ordinary-user login → Home;
2. Sidebar ordering and authorization;
3. Role Workspace behavior;
4. My Workspace personalization;
5. permission expansion without Role Workspace change;
6. cross-context authorized Domain visibility;
7. Header global access;
8. clinical work entry;
9. clinical handoff;
10. reception continuation;
11. visit/session consistency;
12. room/agenda/procedure integration points;
13. server-side authorization;
14. tenant isolation;
15. Clinic Admin preservation;
16. mobile and RTL/LTR behavior;
17. end-to-end daily clinic scenarios.

---

## 9. FINAL ENGINEERING POSITION

The correct implementation is not:

```text
Build one large Workspace page
```

It is:

```text
Preserve the approved Patient Journey
        ↓
Preserve canonical Patient Flow
        ↓
Keep primary Role Workspace stable
        ↓
Keep My Workspace personal
        ↓
Keep Domains complete and authorization-driven
        ↓
Keep Home independent and global
        ↓
Keep Header global and lightweight
        ↓
Integrate Visit/Agenda/Room/Procedure through their owners
        ↓
Preserve Clinic Admin
        ↓
Validate the entire clinic workflow
```

This is the engineering boundary for the 2026-09-01 decisions as clarified on 2026-09-11.
