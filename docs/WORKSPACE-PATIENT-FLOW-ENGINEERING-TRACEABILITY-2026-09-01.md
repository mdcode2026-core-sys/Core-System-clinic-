# CORE SYSTEM — WORKSPACE × PATIENT FLOW ENGINEERING TRACEABILITY MATRIX
## Architecture → Engineering → Execution → Validation

**Date:** 2026-09-01  
**Status:** TRACEABILITY BASELINE — READY FOR IMPLEMENTATION  
**Authority:** `ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  

## 1. PURPOSE

This matrix prevents the 2026-09-01 decisions from being implemented in isolation.

Every decision is traced to the surrounding system layers. A decision is not considered implemented merely because its UI exists.

## 2. SCOPE RULE

Only decisions explicitly covered by the 2026-09-01 architecture decision document are binding changes in this matrix. Unrelated architecture remains unchanged.

## 3. MASTER MATRIX

| Decision | Architectural meaning | Engineering relationship | Primary execution areas | Validation evidence |
|---|---|---|---|---|
| Workspace ≠ Role | Work surface is distinct from function | Workspace resolver must not derive identity/authority from Role alone | workspace context, shell, permissions | user with same/different roles and valid workspace context |
| Workspace ≠ Permission | Workspace does not grant authorization | all actions use Permission Engine | server actions, route guards, widgets | denied action remains denied regardless of surface |
| Workspace ≠ Patient Flow | Workspace presents work; Flow owns state | Workspace calls Queue/Flow authority | queue, workspace actions, clinical UI | state transition is identical regardless of entry surface |
| Classification is internal work context | Clinical/Operational/Administration describe work | presentation labels are separated from internal context | workspace resolver, UI shell | ordinary user sees Workspace, not misleading role label |
| Primary context does not filter authorized Domains | authorized Domains remain visible | Sidebar derives from effective authorization | navigation registry/sidebar | cross-classification authorized Domain appears |
| My Workspace is personal surface | personalization inside Workspace | widget state keyed to user/surface; no ACL semantics | widget registry, renderer, persistence | personalization cannot grant/revoke access |
| Home is separate | clinic-wide daily landing surface | Home consumes data; does not own workflow | Home route/widgets | daily information updates without changing Flow |
| Clinical Workspace evolves Doctor Board | team-oriented clinical work | derive current work from patient/session/context/capability | clinical route, queue, visit | nurse/technician/clinician with valid capability can see relevant work |
| Clinical handoff ends clinical work, not necessarily visit | `pending_close` is handoff state | queue engine remains state authority | workspace.actions, queue engine, reception | clinical close produces pending_close and next operational work |
| Domain remains full Domain | Workspace is not a reduced module copy | link to existing domain route/services | Patients, Agenda, Visit, etc. | same Domain semantics from Sidebar and Workspace entry |
| Clinic Admin remains distinct | not ordinary user with all permissions | preserve tenant admin architecture | admin routes/services | clinic admin retains admin operations |
| Widgets do not authorize | presentation follows effective permission | widget registry checks effective capability | widgets | unauthorized action never appears/executes |

## 4. DEPENDENCY GRAPH

```text
AUTHENTICATED USER
       │
       ├───────────────┐
       ↓               ↓
      ROLE       EFFECTIVE PERMISSIONS
       │               │
       └───────┬───────┘
               ↓
        WORK CONTEXT RESOLUTION
               │
               ├───────────────┐
               ↓               ↓
          WORKSPACE       SIDEBAR DOMAINS
               │               │
               ↓               ↓
       MY WORKSPACE       AUTHORIZED ROUTES
               │
               ↓
            WIDGETS

PATIENT JOURNEY
       ↓
PATIENT FLOW / QUEUE ENGINE
       ↓
VISIT SESSION STATE
       ├── waiting
       ├── in_consultation
       ├── pending_close
       ├── completed
       ├── cancelled
       └── no_show
       ↓
WORK ASSIGNMENT / HANDOFF
       ↓
WORKSPACE PRESENTATION
       ↓
DOMAIN WORKFLOW
```

## 5. REQUIRED CROSS-LAYER RELATIONSHIPS

### 5.1 Workspace ↔ Patient Flow

Workspace must consume Flow state and expose next relevant work. It must not maintain an alternative state machine.

### 5.2 Workspace ↔ Permissions

Workspace content/actions are permission-aware. Workspace identity itself does not grant permissions.

### 5.3 Workspace ↔ Domains

Workspace may provide contextual entry into a Domain, but the Domain remains authoritative for its own business logic.

### 5.4 Workspace ↔ Visit

Clinical Workspace may open the current visit/session context. Visit owns visit semantics and clinical persistence.

### 5.5 Workspace ↔ Room

Room context may influence which work is shown, but Room owns room/resource semantics.

### 5.6 Workspace ↔ Agenda

Agenda provides appointment/schedule context. Workspace must not become a scheduling engine.

### 5.7 Workspace ↔ Widgets

Widgets are presentation components. Their data and actions come from authoritative domains.

### 5.8 Workspace ↔ Clinic Admin

Clinic Admin configures/controls the tenant-level system but is not forced through the ordinary-user mental model.

## 6. CURRENT IMPLEMENTATION FINDINGS TO CARRY INTO EXECUTION

The current repository already contains a useful Patient Flow transition authority in `src/domain/queue/workspace.actions.ts`:

- it resolves the authenticated tenant/user;
- resolves effective permissions;
- supports operation and clinical contexts;
- validates allowed session statuses;
- uses `queueEngine.validateTransition`;
- enforces clinical locking for clinical transitions;
- records `pending_close` and releases the clinical lock;
- revalidates operation/clinical/queue surfaces. 

This is an asset to reuse, not a reason to create another workflow engine.

The current code also contains a broad `moveFromPatientFlow` API. During implementation it must be audited so that UI entry points do not accidentally expose transitions beyond the approved work context merely because the generic function can accept them.

## 7. CURRENT IMPLEMENTATION RISKS

### R1 — Context names may leak into user-facing navigation

Risk: internal `operation` / `clinical` concepts become user-facing role-like labels.

Required action: separate internal context identifiers from user-facing Workspace label.

### R2 — Permission checks are coupled to Workspace context

Risk: a user may be denied/allowed based on workspace naming instead of effective authorization.

Required action: preserve Permission Engine as authorization authority; Workspace only scopes presentation and workflow entry.

### R3 — Generic Patient Flow mutation API

Risk: generic transition functions can become bypasses for intended UI/workflow boundaries.

Required action: keep domain authority centralized and expose only validated transition commands through domain-specific services/actions.

### R4 — Doctor-centric assumptions

Risk: clinical UI or data queries assume `doctor_id` is the sole clinical actor.

Required action: audit clinical work ownership/assignment semantics and introduce broader clinical capability/team handling only where the existing architecture already supports it. Do not invent a new role model in this contract.

### R5 — My Workspace becomes a second authorization surface

Risk: hiding/removing a widget is incorrectly interpreted as removing Domain access.

Required action: personalization only affects presentation.

### R6 — Sidebar filtered by classification

Risk: authorized non-primary Domains disappear.

Required action: derive Domain visibility from effective permissions/subscription entitlement according to the existing navigation architecture.

### R7 — Duplicate workflow state

Risk: Workspace UI maintains local state that disagrees with `clinic_visit_sessions`/queue engine.

Required action: server/domain state remains canonical; UI is a projection.

## 8. REQUIRED FILE-LEVEL INVESTIGATION MAP

The execution audit must inspect all matching files, not only the obvious Workspace files.

### Core/UI
- `src/app/(dashboard)/**`
- dashboard layout/shell
- navigation registry
- Sidebar components
- Home components
- Workspace components
- My Workspace components
- widget registry/renderer/persistence

### Queue/Patient Flow
- `src/domain/queue/**`
- Patient Flow pages/components
- transition actions
- queue engine/types
- audit/revalidation helpers

### Visit/clinical
- `src/domain/visit/**`
- clinical pages/components
- patient chart entry points
- procedure actions

### Authorization
- `src/core/permissions/**`
- route guards
- server actions
- role/permission resolution

### Data
- all workspace/user/role/permission/session/visit migrations
- RLS policies
- audit tables
- generated database types

### Documentation
- root architecture documents
- PJ documents
- UX/IA documents
- implementation contracts
- stage validation documents
- handoffs/changelogs
- archived implementation packages where they contain still-valid evidence

## 9. EXECUTION ORDER

1. Freeze the 2026-09-01 architectural decisions.
2. Inventory current implementation against this matrix.
3. Build/confirm the canonical Workspace context resolver.
4. Repair shell/sidebar/Home/My Workspace relationships.
5. Repair Workspace ↔ Patient Flow integration without changing the Flow state machine.
6. Repair clinical team work entry without introducing doctor-only assumptions.
7. Verify visit/room/agenda/procedure integration points.
8. Verify permission enforcement across every mutation.
9. Verify Clinic Admin isolation/preservation.
10. Run cross-domain regression.
11. Run real clinic daily scenarios.
12. Produce evidence and update closure documentation.

## 10. ACCEPTANCE SCENARIOS

### Scenario A — Ordinary clinical team member

Login → Home → Workspace → patient made available → clinical work → pending_close → operational handoff.

### Scenario B — Ordinary operational user

Login → Home → Workspace → waiting/operational work → clinical handoff → subsequent reception work.

### Scenario C — Authorized cross-context Domain

User's primary context is clinical, but user is authorized to read another Domain. The Domain remains visible in Sidebar and behaves according to its own permissions.

### Scenario D — My Workspace personalization

User hides/reorders a widget. Authorization and Domain visibility do not change.

### Scenario E — Clinic Admin

Clinic Admin can perform existing tenant administration without being reduced to the ordinary-user Workspace model.

### Scenario F — Unauthorized mutation

User reaches a UI entry point but lacks the required permission. Server rejects the mutation.

## 11. COMPLETION GATE

No implementation should be considered complete until every row in Section 3 has evidence from:

- architecture;
- engineering contract;
- source implementation;
- database/policies where relevant;
- runtime/UX validation.

A green UI with a broken state transition is a failure. A correct backend with a misleading Workspace/Sidebar is also a failure.
