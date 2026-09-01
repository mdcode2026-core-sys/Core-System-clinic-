# CORE SYSTEM — WORKSPACE × PATIENT FLOW
## PRE-CODE EXECUTION CONTRACT — EXACT CURRENT GAP → TARGET BEHAVIOR

**Date:** 2026-09-01
**Status:** PRE-CODE GATE — READY TO REQUEST CODE MODIFICATION APPROVAL
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Engineering authority:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Traceability:** `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-TRACEABILITY-2026-09-01.md`
**Implementation plan:** `docs/IMPLEMENTATION-PLAN-WORKSPACE-PATIENT-FLOW-FULL-2026-09-01.md`

---

## 0. PURPOSE

This document is the final gate before modifying source code.

It records what the current repository actually does in the affected areas, what the complete implementation must change, and what the user must see after the full implementation.

It does not introduce architectural decisions. It only translates the approved 2026-09-01 decisions into implementation targets.

No source-code modification is authorized by this document alone.

---

## 1. VERIFIED CURRENT IMPLEMENTATION GAPS

### G1 — Login currently lands directly in assigned Workspace

`src/app/(dashboard)/page.tsx` currently resolves `getAssignedWorkspace()` and redirects directly to `/operation`, `/clinical`, or `/administration`.

This conflicts with the approved ordinary-user entry sequence where Home is the landing surface and Workspace is a separate navigation destination.

**Required target:** successful ordinary-user login lands on Home; Workspace is reached explicitly from the Sidebar or approved contextual entry.

### G2 — Sidebar does not currently implement the approved conceptual order

`src/core/navigation/navigationRegistry.ts` currently starts with Workspace and contains many Domains, while Home and My Workspace are not represented as the required ordinary-user Sidebar items.

It also contains Patient Flow contextual entries separately, which must remain contextual rather than becoming an ordinary-user primary Domain.

**Required target:** Sidebar conceptual order is Home → Workspace → My Workspace → authorized Domains → My Settings. Patient Flow remains contextual according to the approved architecture.

### G3 — Workspace currently exposes internal classification labels as surface labels

`src/core/workspace/workspaceSurfaces.ts` defines user-facing labels such as Operations, Clinical and Administration, and `WorkspaceRenderer.tsx` renders the surface label as the page heading.

The new architecture requires the ordinary-user visible concept to remain simply **Workspace**. Internal work classification may remain in engineering data and routing where required.

**Required target:** ordinary-user Workspace presentation must not turn internal classification into a role-like Workspace title.

### G4 — Current Workspace renderer is a generic widget dashboard, not yet the complete work surface

`src/features/workspace/WorkspaceRenderer.tsx` renders widget layers and customization controls. It does not itself represent the complete clinical/operational work required by the approved Patient Flow integration.

The existing specialized Clinical Workspace remains the authoritative implementation asset for clinical workflow and must be integrated rather than discarded.

**Required target:** Workspace becomes the presentation entry surface while the appropriate work surface consumes canonical Patient Flow/visit state and Domain-owned actions.

### G5 — Clinical Workspace is still provider-centric in parts of its data/transition contract

`src/features/workspaces/ClinicalWorkspace.tsx` displays `doctor_name`, and the current transition path requires `doctor_id` before moving a session to `in_consultation`.

The approved decision changes the clinical surface from a doctor-only board to a clinical-team work surface. It does not authorize a new role model or a new assignment model.

**Required target:** preserve existing assignment/visit semantics where valid, but remove presentation and routing assumptions that make the job title Doctor the sole owner of clinical work. Any deeper assignment change must use an already authoritative Visit/Agenda/Room/clinical domain contract; it must not be invented in Workspace.

### G6 — Patient Flow transition authority exists and must be reused

`src/domain/queue/workspace.actions.ts` already delegates state validation to `queueEngine.validateTransition`, enforces tenant/user context, checks effective permissions, manages clinical locks, and implements `pending_close` handoff.

**Required target:** retain this canonical authority. Audit and narrow generic entry points where necessary; do not create another state machine.

### G7 — Generic Patient Flow mutation surface requires boundary audit

`moveFromPatientFlow()` accepts a target state plus a context and can perform multiple transitions after permission validation.

**Required target:** every exposed command must remain constrained by the approved Patient Flow and work-context rules. Generic capability must not become an accidental bypass of the intended workflow.

### G8 — Workspace assignment currently has a legacy Role fallback

`src/core/workspace/currentWorkspace.ts` first reads `clinic_user_workspaces`, but if no default membership exists it falls back to `roles.workspace` and then maps `clinic_admin` to administration.

**Required target:** the authoritative Workspace assignment must remain the user Workspace membership/default mechanism. Any compatibility fallback must be audited, bounded, and must not make Role the definition of Workspace.

### G9 — Role type currently contains a `workspace` field

`src/domain/roles/roles.types.ts` includes `Role.workspace`.

The 2026-09-01 decision does not cancel the existing Role architecture. Therefore this field is not to be deleted merely because Workspace and Role are distinct.

**Required target:** audit every consumer. Where it is used as a classification/defaulting hint, ensure it does not become the authoritative definition of the user's Workspace or authorization.

### G10 — Existing workspace permissions are part of the old architecture

The Stage 6 migration defines `workspace:operation`, `workspace:clinical`, and `workspace:administration` permissions and assigns them to historical roles.

**Required target:** do not delete these permissions blindly. Determine their current meaning and preserve them where they represent access/capability. Their existence must not make Role or permission equal to Workspace.

### G11 — My Workspace personalization infrastructure already exists in the canonical Workspace engine

The repository contains a Widget registry, renderer, Workspace engine, and presentation-state model. Existing Stage 3/4 documentation records reuse of this infrastructure and state isolation by user + Workspace surface.

**Required target:** reuse this system for My Workspace; do not create a second personalization subsystem.

### G12 — Domain navigation is already permission-filtered, but its registry needs the new shell contract

`WorkspaceShell.tsx` filters navigation items using effective permissions through `usePermissions()`. The navigation registry contains full Domain routes and contextual Patient Flow routes.

**Required target:** preserve permission-driven Domain visibility while inserting Home / Workspace / My Workspace / My Settings according to the approved shell model. Classification must not suppress an otherwise authorized Domain.

---

## 2. EXACT TARGET ORDINARY-USER EXPERIENCE AFTER FULL IMPLEMENTATION

### 2.1 First login

The user receives credentials from the Clinic Admin.

After successful login the user sees:

**Header:**
- system/clinic branding as already defined;
- global Search;
- language control;
- the user's presentation name;
- existing header behavior preserved.

**Main surface:**
- Home.

Home is the clinic-system daily landing surface. It may show authoritative daily information such as today's appointments, current waiting count where available, reminders/notifications, and other approved daily information. It is not the user's clinical or operational execution board.

### 2.2 Sidebar

Opening the Sidebar shows, conceptually and in this order:

1. Home
2. Workspace
3. My Workspace
4. Authorized Domains — full Domains, not classification-specific copies
5. My Settings

If the user has an authorized Domain outside the user's primary work context, it remains visible normally.

Example:

Clinical primary work context + authorized read access to Billing:

Home
Workspace
My Workspace
Patients
Agenda
Billing
...
My Settings

Billing does not become "My Billing" and does not disappear merely because the user's primary work is clinical.

### 2.3 Workspace

The user selects **Workspace**.

The visible page remains a Workspace experience; it does not force the user to understand whether the internal context is Clinical or Operational.

The system uses the user's assigned/default work context, current Patient Flow state, effective permissions/capabilities, and relevant Domain context to determine the work presented.

### 2.4 My Workspace

The user selects **My Workspace**.

The user sees the system's default set of useful widgets for their work.

The user can personalize supported widgets by adding/removing/hiding/reordering them according to the existing personalization architecture.

This changes presentation only. It does not change permissions, Role, Patient Flow, or Sidebar Domain access.

### 2.5 Full Domains

Selecting Patients, Agenda, Billing, Reports, or another authorized Domain opens the complete Domain surface.

The Domain does not become a reduced Workspace widget and does not duplicate its business logic inside Workspace.

---

## 3. EXACT CLINICAL DAILY EXPERIENCE

A clinical team member enters the system and sees Home first.

From Sidebar they open Workspace.

When a patient has been made available for clinical work by the operational workflow, the clinical work surface presents that work.

The user can see the relevant patient/visit context, subject to authorization and the authoritative Visit/Patient/Domain data, including where applicable:

- patient identity and file context;
- current visit/session context;
- required work;
- relevant reports/documents;
- medical photos where the existing Medical Files/Photos domain provides them;
- treatment-plan context where authorized;
- procedure context where the authoritative procedure domain provides it;
- room/appointment context where those domains provide it.

The user performs the current clinical work.

When clinical work is finished, the user does **not** silently close the whole visit merely because the clinical part is finished.

The canonical flow is:

```text
waiting
   ↓
in_consultation
   ↓
pending_close
   ↓
operational/reception continuation
   ↓
completed
```

The existing Queue/Patient Flow engine remains the authority for the state transition.

---

## 4. EXACT OPERATIONAL DAILY EXPERIENCE

The operational user enters Home first.

From Workspace the user sees the operational work relevant to the current clinic state.

For a patient arriving for an appointment:

```text
arrival/check-in
   ↓
waiting
   ↓
patient made available to clinical work
   ↓
clinical handoff
   ↓
pending_close after clinical work
   ↓
operational/reception continuation
   ↓
completed / other approved terminal state
```

The operational user does not need to understand internal state-machine terminology merely to perform the work.

The UI presents the next actionable work; the backend/domain layer preserves the exact state and audit trail.

---

## 5. EXACT CLINIC-ADMIN EXPERIENCE

Clinic Admin is deliberately outside the ordinary-user presentation contract.

The implementation must preserve the existing administrative capabilities and must not force Clinic Admin into the ordinary-user mental model merely to simplify the Workspace implementation.

Clinic Admin must retain the ability, according to existing approved permissions/architecture, to manage:

- clinic users;
- Roles;
- permissions;
- Workspace assignments/configuration;
- Modules/Domains;
- clinic settings;
- subscription/entitlement administration;
- audit/activity and other existing tenant-administration capabilities.

The implementation must not delete or hide administrative functionality merely because ordinary users now use a simpler Workspace presentation.

---

## 6. BACKGROUND BEHAVIOR THAT MUST PRODUCE THE ABOVE EXPERIENCE

### 6.1 Authorization

All mutation authorization remains server-side through the existing Permission Engine.

### 6.2 Patient Flow

All workflow transitions remain centralized in the Queue/Patient Flow domain.

### 6.3 Workspace

Workspace resolves presentation context and consumes authoritative state; it does not own Patient Flow state.

### 6.4 Domains

Domains own their business logic, data, routes, and persistence.

### 6.5 Personalization

My Workspace stores presentation preferences only.

### 6.6 Data

No duplicate Patient, Visit, Queue, Role, Permission, Workspace, or Domain state store is introduced unless a schema gap is proven.

### 6.7 Revalidation

After a workflow mutation, affected Workspace, Queue, Home, and Domain surfaces must converge on the new authoritative server state.

---

## 7. PRE-CODE FILE CHANGE MAP

### Expected modifications — confirmed candidates

- `src/app/(dashboard)/page.tsx`
- `src/core/workspace/currentWorkspace.ts`
- `src/core/workspace/workspaceSurfaces.ts`
- `src/core/navigation/navigationRegistry.ts`
- `src/features/workspace/WorkspaceShell.tsx`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/features/workspaces/ClinicalWorkspace.tsx`
- `src/domain/queue/workspace.actions.ts`
- relevant `src/domain/visit/*` integration points
- relevant widget registry/engine/persistence files
- affected i18n message definitions
- affected tests/audit scripts

### Required investigation before changing each candidate

Every file must be searched for imports/consumers and cross-domain effects before modification.

### Potential modifications — only if evidence proves necessary

- `src/domain/roles/roles.types.ts`
- workspace-related database migrations
- RLS policies
- generated database types
- route guards
- Clinic Admin navigation/entry points
- audit/event infrastructure

No file is to be deleted solely because it contains an old or superseded portion.

---

## 8. DATABASE TARGET

Before any migration, inspect the current live/repository schema relationship for:

- `clinic_user_workspaces`;
- `clinic_users`;
- `roles`;
- `permissions`;
- `role_permissions`;
- `clinic_visit_sessions`;
- `clinic_rooms`;
- `master_agenda_events`;
- widget/presentation persistence;
- audit tables;
- RLS policies.

The expected implementation principle is:

```text
Reuse → Extend → Create only when genuinely required
```

No duplicate authorization or workflow state model is permitted.

---

## 9. FINAL PRE-CODE ACCEPTANCE GATE

Code modification may begin only when the implementation owner can demonstrate that:

- the exact files above have been inspected;
- each modification has a traced reason;
- each new object has a proven necessity;
- no unrelated architecture is being changed;
- ordinary-user Home → Workspace → My Workspace → Domains → My Settings behavior is mapped;
- Clinical and Operational handoff is mapped;
- Clinic Admin is mapped separately;
- permissions and RLS are mapped;
- the final expected user-visible result is understood;
- rollback/recovery impact is understood.

At that point the work is **READY TO START CODE MODIFICATION**.
