# CORE SYSTEM — WORKSPACE × PATIENT FLOW ENGINEERING TRACEABILITY MATRIX
## Architecture → Engineering → Execution → Validation

**Date:** 2026-09-01  
**Status:** TRACEABILITY BASELINE — RECONCILED 2026-09-11  
**Authority:** `ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`  
**Canonical surface interpretation:** `CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

## 1. PURPOSE

This matrix prevents the 2026-09-01 decisions from being implemented in isolation.

Every decision is traced to the surrounding system layers. A decision is not considered implemented merely because its UI exists.

## 2. SCOPE RULE

Only decisions explicitly covered by the 2026-09-01 architecture decision document plus the 2026-09-11 owner-approved global-surface clarification are binding changes in this matrix. Unrelated architecture remains unchanged.

## 3. MASTER MATRIX

| Decision | Architectural meaning | Engineering relationship | Primary execution areas | Validation evidence |
|---|---|---|---|---|
| Primary Role → Primary Work Context → Role Workspace | Primary professional work environment is stable and distinct from permissions | Workspace resolver resolves primary context; permission changes do not redefine it | role/context resolver, workspace shell | user with mixed permissions retains same primary Role Workspace |
| Workspace ≠ Role | Work surface is distinct from function | Workspace resolver must not derive identity/authority from Role alone | workspace context, shell, permissions | user with same/different roles and valid workspace context |
| Workspace ≠ Permission | Workspace does not grant authorization | all actions use Permission Engine | server actions, route guards, widgets | denied action remains denied regardless of surface |
| Workspace ≠ Patient Flow | Workspace presents work; Flow owns state | Workspace calls Queue/Flow authority | queue, workspace actions, clinical UI | state transition is identical regardless of entry surface |
| Classification is internal work context | Clinical/Operational/Administration describe work | presentation labels are separated from internal context | workspace resolver, UI shell | ordinary user sees appropriate Workspace context without role/permission confusion |
| Additional permission does not change Role Workspace | Permissions expand authorized capability, not professional identity | Sidebar/widgets/My Workspace consume effective permissions independently of primary context | permission engine, navigation, widget registry | clinical primary user with additional financial/admin capability remains Clinical Workspace |
| Primary context does not filter authorized Domains | authorized Domains remain visible | Sidebar derives from effective authorization | navigation registry/sidebar | cross-classification authorized Domain appears |
| My Workspace is personal surface | personalization inside primary work context | widget state keyed to user/surface; no ACL semantics | widget registry, renderer, persistence | personalization cannot grant/revoke access |
| Home is separate | global starting/awareness surface | Home consumes data/utilities and links to authoritative work destinations | Home route/widgets | daily information updates without changing Flow or Role Workspace |
| Home is not Role-derived | Home is independent of primary work context | Home composition may adapt only by relevance/authorization, not by changing its identity | Home/UI | different users retain same Home concept while content is permission-aware |
| Global Header is persistent | global access layer | header stays available across authenticated surfaces | shell/header | same global controls from major surfaces |
| Communications access is global | full communication domain remains authoritative | header shortcut uses Communications | Communications/header | compact access reaches existing Communications domain |
| Chat is a compact Communications surface | immediate conversation interaction without a parallel domain | reuse Communications data/actions/permissions | chat surface/communications | messages persist in existing Communications model |
| Notifications are separate from Communications | notification/attention delivery remains its own capability | header access uses notification authority | notification/header | unread/attention behavior is consistent |
| Quick Actions are global interface/account actions | initial scope Language + Logout | compact global action menu | header/account controls | language/logout remain available without duplicating Settings |
| My Settings remains Sidebar | account/preferences destination | do not move it into Header | settings/sidebar | settings changes remain personal and do not affect authorization |
| Domain remains full Domain | Workspace is not a reduced module copy | link to existing domain route/services | Patients, Agenda, Visit, etc. | same Domain semantics from Sidebar and Workspace entry |
| Clinic Admin remains distinct | not ordinary user with all permissions | preserve tenant admin architecture | admin routes/services | clinic admin retains admin operations |
| Widgets do not authorize | presentation follows effective permission | widget registry checks effective capability | widgets | unauthorized action never appears/executes |

## 4. DEPENDENCY GRAPH

```text
AUTHENTICATED USER
       │
       ├───────────────────────────────┐
       ↓                               ↓
PRIMARY ROLE / JOB FUNCTION      EFFECTIVE PERMISSIONS
       │                               │
       ↓                               ├── Authorized Domains / Actions
PRIMARY WORK CONTEXT                   │       ├── Sidebar
       │                               │       └── Widgets / My Workspace
       ↓                               │
ROLE WORKSPACE                         │
       │                               │
       ↓                               │
MY WORKSPACE ←─────────────────────────┘
       │
       └── personal arrangement of permitted work/tools

HOME
  └── independent global starting / awareness surface

GLOBAL HEADER
  ├── Global Search
  ├── Communications
  ├── Chat → Communications authority
  ├── Notifications
  └── Quick Actions → Language / Logout

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
ROLE WORKSPACE PRESENTATION
       ↓
DOMAIN WORKFLOW
```

## 5. REQUIRED CROSS-LAYER RELATIONSHIPS

### 5.1 Role / Primary Context ↔ Role Workspace

The Role Workspace represents the user's primary professional work environment. Additional permissions must not change it.

### 5.2 Role Workspace ↔ Permissions

Workspace content/actions are permission-aware, but Workspace identity itself does not grant permissions.

### 5.3 My Workspace ↔ Permissions

My Workspace may expose authorized capabilities from outside the primary work context. This does not change Role Workspace.

### 5.4 Sidebar ↔ Permissions

Sidebar visibility is authorization/capability-driven. Primary context must not suppress an otherwise authorized Domain.

### 5.5 Home ↔ Role/Permissions

Home is independent from Role Workspace. Its content may be permission-aware, but its identity does not change with Role Workspace.

### 5.6 Header ↔ Global Domains

Header shortcuts provide global access to Search, Communications, Chat, Notifications and global interface/account actions. They do not own the underlying domains.

### 5.7 Communications ↔ Chat

Chat is a compact presentation layer over the Communications domain. There must be one communication authority, permission model and data source.

### 5.8 Notifications ↔ Communications

Notifications remain a separate attention/delivery capability. Internal Communications remains separate from patient notification/follow-up delivery.

### 5.9 Workspace ↔ Patient Flow

Workspace must consume Flow state and expose next relevant work. It must not maintain an alternative state machine.

### 5.10 Workspace ↔ Domains

Workspace may provide contextual entry into a Domain, but the Domain remains authoritative for its own business logic.

### 5.11 Workspace ↔ Visit

Clinical Workspace may open the current visit/session context. Visit owns visit semantics and clinical persistence.

### 5.12 Workspace ↔ Room

Room context may influence which work is shown, but Room owns room/resource semantics.

### 5.13 Workspace ↔ Agenda

Agenda provides appointment/schedule context. Workspace must not become a scheduling engine.

### 5.14 Workspace ↔ Clinic Admin

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

### R7 — Home becomes a duplicate Workspace

Risk: Home accumulates complete clinical/operational workflows or repeats My Workspace.

Required action: Home remains a global starting/awareness surface; full execution remains in authoritative work surfaces and Domains.

### R8 — Header becomes a second work/dashboard layer

Risk: business workflows are accumulated in the Header because they are convenient.

Required action: keep Header limited to genuinely global access; initial Quick Actions are Language + Logout.

### R9 — Duplicate communication systems

Risk: compact Chat introduces a parallel message store/permission system.

Required action: reuse Communications as the sole authority.

### R10 — Duplicate notification surface

Risk: Home/Communications create their own notification logic.

Required action: use the Notifications domain; Home may summarize, Header may access, neither becomes owner.

## 8. REQUIRED FILE-LEVEL INVESTIGATION MAP

The execution audit must inspect all matching files, not only the obvious Workspace files.

### Core/UI
- `src/app/(dashboard)/**`
- dashboard layout/shell
- navigation registry
- Sidebar components
- Home components
- Header components
- Workspace components
- My Workspace components
- widget registry/renderer/persistence

### Global services
- Global Search
- Communications
- compact Chat access/surface
- Notifications
- i18n/language controls
- authentication/session/logout
- Quick Actions/account controls

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
- terminology governance/reconciliation documents

## 9. EXECUTION ORDER

1. Freeze the 2026-09-01 architectural decisions plus 2026-09-11 global-surface clarification.
2. Inventory current documentation and implementation against this matrix.
3. Reconcile terminology and source-of-truth documents.
4. Build/confirm the canonical Workspace context resolver.
5. Repair shell/sidebar/Home/My Workspace relationships.
6. Repair Header global access relationships.
7. Repair Workspace ↔ Patient Flow integration without changing the Flow state machine.
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

User's primary context is clinical, but user is authorized to read another Domain. The Domain remains visible in Sidebar and behaves according to its own permissions while the primary Role Workspace remains Clinical.

### Scenario D — My Workspace personalization

User hides/reorders a widget, including a permitted cross-context widget where supported. Arrangement persists; Role Workspace, Role and authorization do not change.

### Scenario E — Home

Home displays daily/global information and lightweight utilities → user moves to the appropriate Workspace/Domain for execution. Home does not own the workflow.

### Scenario F — Header communications

User opens Communications from the Header for broader communication access or opens Chat for an immediate conversation. Both use the existing Communications authority.

### Scenario G — Header notifications

User opens Notifications from anywhere in the system and receives the same authoritative notification state.

### Scenario H — Shared workstation

User A performs work → Logout → User B authenticates → subsequent actions are attributable to User B. Logout must be easily accessible.

### Scenario I — Clinic Admin

Clinic Admin can perform existing tenant administration without being reduced to the ordinary-user Workspace model.

### Scenario J — Unauthorized mutation

User reaches a UI entry point but lacks the required permission. Server rejects the mutation.

## 11. COMPLETION GATE

No implementation should be considered complete until every row in Section 3 has evidence from:

- architecture;
- engineering contract;
- source implementation;
- database/policies where relevant;
- runtime/UX validation.

A green UI with a broken state transition is a failure. A correct backend with a misleading Workspace/Sidebar/Home/Header relationship is also a failure.
