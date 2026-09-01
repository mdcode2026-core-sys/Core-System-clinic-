# CORE SYSTEM — WORKSPACE × PATIENT FLOW
## FINAL ENGINEERING READINESS REPORT — 2026-09-01

**Status:** ENGINEERING PACKAGE COMPLETE — READY FOR IMPLEMENTATION  
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Engineering specification:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Traceability matrix:** `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md`  
**Implementation plan:** `docs/IMPLEMENTATION-PLAN-WORKSPACE-PATIENT-FLOW-FULL-2026-09-01.md`

---

## 1. EXECUTIVE RESULT

The 2026-09-01 Workspace/Patient Flow decisions have been converted into a complete engineering package without replacing the rest of CORE SYSTEM architecture.

The package establishes a single implementation boundary:

```text
2026-09-01 architectural decisions
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

It does not add new product decisions. It defines how the approved decisions must be implemented.

### Workspace
Workspace is the ordinary user's work surface. It is not a Role, permission set, or Patient Flow owner.

### Work classifications
Clinical, Operational, and Administration remain useful internal work classifications. They are not forced to become user-facing Workspace names for ordinary users.

### My Workspace
My Workspace is the personal presentation/customization layer within the user's Workspace. It does not create authorization or a second workflow.

### Home
Home is the clinic-system daily landing surface and remains separate from Workspace and My Workspace.

### Sidebar
Sidebar Domain visibility is authorization-driven. An authorized Domain outside the user's primary work context remains visible as a normal Domain.

### Patient Flow
Patient Flow remains the canonical workflow/state owner. Workspace projects the relevant work onto the user surface.

### Clinical Workspace
Clinical Workspace evolves the former provider/doctor board into a clinical-team work surface. It must use current visit/session/work requirements and effective capability rather than assume every clinical worker is a doctor.

### Handoff
Clinical work ends in the approved handoff state (`pending_close`) and returns responsibility to the operational/reception workflow. It does not silently close the entire visit.

### Clinic Admin
Clinic Admin remains a distinct administrative authority and is not reduced to the ordinary-user Workspace model.

---

## 3. WHAT MUST CHANGE IN IMPLEMENTATION

The full implementation must address all affected layers, not only visible screens.

### A. Shell and navigation
- unify ordinary-user shell semantics;
- ensure Workspace is a first-class navigation item;
- preserve Home and My Settings;
- make Domain visibility authorization-driven;
- preserve full Domain routes.

### B. Workspace context
- establish one canonical current/default Workspace context resolver;
- eliminate competing derivations;
- keep Role and permissions separate from Workspace presentation.

### C. My Workspace
- preserve/default widget catalogue;
- persist personalization by user + surface;
- keep personalization outside authorization.

### D. Patient Flow
- preserve queue engine as state authority;
- audit workspace actions;
- preserve status transitions and locking;
- preserve clinical → pending_close → operational handoff.

### E. Clinical
- remove doctor-only presentation assumptions where they conflict with the approved team-based model;
- use existing visit/session/capability context;
- keep detailed clinical domain logic in its authoritative modules.

### F. Operational
- preserve arrival, waiting, handoff, pending-close reception work, completion, no-show and cancellation.

### G. Domain integration
- keep every Module/Domain complete;
- expose contextual entry points without duplicating Domain logic;
- preserve permissions and entitlements.

### H. Data/security
- reuse existing schema;
- add migrations only where required;
- preserve tenant isolation/RLS;
- keep server-side authorization authoritative.

### I. Clinic Admin
- audit and preserve all existing administrative capabilities;
- prevent ordinary-user Workspace assumptions from leaking into Admin.

---

## 4. WHAT MUST NOT CHANGE

The implementation must not use this work as a reason to:

- redesign unrelated modules;
- replace Permission Engine;
- create a second Queue/Patient Flow engine;
- create a second Role system;
- create duplicate patient/visit/workflow tables;
- turn authorized Domains into classification-specific copies;
- delete entire historical documents because one portion is superseded;
- remove Clinic Admin functionality;
- prematurely implement detailed room/procedure/visit sub-workflows that belong to their own approved domain contracts.

---

## 5. CURRENT CODE EVIDENCE

The current repository already contains a reusable Patient Flow authority in `src/domain/queue/workspace.actions.ts`.

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

---

## 6. EXTERNAL PRACTICE EVIDENCE

External evidence was used only to validate engineering patterns, not to override CORE SYSTEM decisions.

OpenEMR documents the clinical encounter as a sequence of events performed by different clinic staff, with role permissions controlling who can perform each task. This supports the separation of encounter workflow from a single job title. citeturn0search1

OpenEMR's patient flow documentation also demonstrates explicit arrival/check-in/status/room/check-out behavior, supporting a canonical stateful workflow rather than UI-only status changes. citeturn0search9turn0search8

Medplum's workflow model uses Tasks associated with a patient/encounter and assignable to individuals or groups, supporting a scalable pattern for routing work to the responsible actor without redefining the encounter itself. citeturn0search0

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
3. Workspace behavior;
4. My Workspace personalization;
5. cross-context authorized Domain visibility;
6. clinical work entry;
7. clinical handoff;
8. reception continuation;
9. visit/session consistency;
10. room/agenda/procedure integration points;
11. server-side authorization;
12. tenant isolation;
13. Clinic Admin preservation;
14. mobile and RTL/LTR behavior;
15. end-to-end daily clinic scenarios.

---

## 9. FINAL ENGINEERING POSITION

The correct implementation is not:

```text
Build Workspace page
```

It is:

```text
Preserve the approved Patient Journey
        ↓
Preserve canonical Patient Flow
        ↓
Make Workspace the correct presentation surface
        ↓
Keep My Workspace personal
        ↓
Keep Domains complete and authorization-driven
        ↓
Keep Role/permissions independent
        ↓
Integrate Visit/Agenda/Room/Procedure through their owners
        ↓
Preserve Clinic Admin
        ↓
Validate the entire clinic workflow
```

This is the engineering boundary for the 2026-09-01 decisions.
