# CORE SYSTEM — WORKSPACE × PATIENT FLOW
## PRE-CODE BASELINE + IMPACT MAP + DEPENDENCY / EXECUTION ORDER
### 2026-09-01

**Status:** PRE-CODE — NO CODE EXECUTION AUTHORIZED
**Baseline commit:** `e1c119a290d34c16a7678e44d2361cefb213bacc`
**Architecture authority:** `docs/ARCHITECTURE-DECISIONS-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Engineering authority:** `docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md`
**Execution plan:** `docs/IMPLEMENTATION-PLAN-WORKSPACE-PATIENT-FLOW-FULL-2026-09-01.md`

## 1. Purpose

This document is the pre-code baseline. It records what is demonstrably present in `main`, what is historically evidenced, what must be inspected/reconciled, and the dependency order that must be followed before any official source-code modification.

It does not authorize implementation and does not declare any existing behavior obsolete merely because it is not yet mapped.

## 2. Baseline truth

### 2.1 Repository state

The inspected `main` commit is:

`e1c119a290d34c16a7678e44d2361cefb213bacc`.

The repository contains dedicated feature areas including dashboard, doctor, patient-flow, patient-context, patients, reception, agenda, followup, inventory, invoicing, medical-files, patient-portal and other Domains. These are evidence that Workspace work must be reconciled with existing feature/domain boundaries rather than implemented as a standalone page.

### 2.2 Queue / Patient Flow — verified existing implementation

The Queue domain currently contains:

- `src/domain/queue/queue.actions.ts`
- `src/domain/queue/queue.engine.ts`
- `src/domain/queue/queue.hooks.ts`
- `src/domain/queue/queue.queries.ts`
- `src/domain/queue/queue.types.ts`
- `src/domain/queue/workspace.actions.ts`

`workspace.actions.ts` is server-side and currently resolves tenant/user context, obtains effective permissions, calls `queueEngine.validateTransition`, updates `clinic_visit_sessions`, and revalidates Workspace/Queue paths. It contains explicit operation/clinical workspace contexts and Patient Flow contexts. This is an existing canonical dependency and must be preserved/reconciled, not replaced by a new workflow engine.

### 2.3 Patient Flow board — verified existing implementation

`src/features/patient-flow/PatientFlowBoard.tsx` currently:

- consumes Queue queries/subscription;
- uses `moveFromPatientFlow` for transitions;
- models `operations`, `clinical`, and `administrative` contexts;
- contains Waiting / In Consultation / Pending Close / Completed lanes;
- contains drag state and native drag/drop handlers;
- validates allowed target states before calling the server transition action;
- displays context-specific descriptions and permissions/read-only states;
- supports Arabic/English and RTL/LTR behavior.

This is direct evidence that drag-and-drop is an existing Patient Flow interaction, not a newly invented requirement.

The current board must therefore be treated as **REUSE / RECONCILE**, with the exact future Workspace presentation determined by the approved architecture and the existing workflow contracts.

### 2.4 Existing clinical/operational distinction

The current execution contains explicit `operation` and `clinical` workspace contexts in server actions and explicit `operations` and `clinical` Patient Flow contexts in the board. This is internal workflow context and must not be confused with the ordinary user's visible Workspace name or with Role.

### 2.5 Existing doctor-centric dependency

The current Queue workspace actions still contain `doctor_id` checks and require a provider assignment before transition to `in_consultation`. This is a concrete implementation dependency that must be audited against the approved clinical-team model. It is not evidence that the architectural model should revert to doctor-as-owner.

### 2.6 Existing navigation/domain surface

The repository contains separate feature areas for multiple full Domains. The implementation must therefore preserve Domain ownership and route identity while changing ordinary-user presentation. The existence of these features is not permission to hide them by primary classification.

## 3. Baseline classification

| Area | Current evidence | Baseline disposition |
|---|---|---|
| Queue engine | `src/domain/queue/queue.engine.ts` exists and is called by workspace actions | KEEP / AUDIT |
| Queue actions | Existing server actions | KEEP / AUDIT |
| Workspace queue actions | `src/domain/queue/workspace.actions.ts` | KEEP / RECONCILE |
| Patient Flow board | Existing operations/clinical/admin contexts and lanes | KEEP / RECONCILE |
| Drag & Drop | Existing Patient Flow board behavior | PRESERVE / RECONCILE |
| Clinical handoff | `in_consultation → pending_close` exists | KEEP / VALIDATE |
| Operational completion | `pending_close → completed` exists | KEEP / VALIDATE |
| Locks | Clinical lock checks exist | KEEP / AUDIT |
| Effective permissions | Existing server-side permission resolution | KEEP / AUDIT |
| Tenant scoping | Existing tenant filters in workspace actions | KEEP / AUDIT |
| Home | Existing dashboard/home area must be mapped completely | INSPECT / RECONCILE |
| Header/Search | Existing shell/search must be mapped completely | INSPECT / RECONCILE |
| Sidebar | Existing navigation registry/renderer must be mapped completely | INSPECT / RECONCILE |
| Workspace presentation | Existing operation/clinical paths must be mapped | INSPECT / RECONCILE |
| My Workspace | Existing widget architecture must be mapped | INSPECT / RECONCILE |
| My Settings | Existing user settings must be mapped | INSPECT / RECONCILE |
| Clinic Admin | Existing administration center must be mapped separately | PRESERVE / AUDIT |
| Domain routes | Multiple feature areas exist | PRESERVE / AUTHORIZATION AUDIT |
| Visit/room/procedure | Existing/future domain dependencies | MAP / DO NOT DUPLICATE |

## 4. Critical findings before code

### Finding B-01 — Drag & Drop is existing behavior

The current Patient Flow board implements native drag/drop and calls the canonical server transition path. Therefore the implementation plan must preserve this behavior when reconciling Clinical and Operational Workspace presentation. It must not be treated as a new feature request.

### Finding B-02 — Workspace transition actions already cross architectural boundaries

`workspace.actions.ts` currently combines Workspace context, effective permissions, Patient Flow context, Queue validation, locks, tenant scoping and database mutation. This is a critical integration point. It must be audited as one chain before changing the UI.

### Finding B-03 — Doctor-centric implementation remains

`doctor_id` is still used in current transition validation. The approved architecture changes the clinical work surface from doctor-centric to clinical-team capable. The implementation must therefore reconcile this dependency without deleting or inventing visit/provider architecture.

### Finding B-04 — Existing Patient Flow UI exposes classification labels

The current Patient Flow board explicitly renders Operations / Clinical / Administrative. This does not establish that ordinary-user Workspace must display those classifications. It is evidence of existing internal/admin/workflow presentation that must be reconciled with the new ordinary-user Workspace semantics.

### Finding B-05 — Current execution plan had Drag & Drop explicitly under My Workspace

The execution plan contains Drag & Drop under My Workspace widget personalization. That is separate from the verified Patient Flow drag/drop behavior. The two must not be conflated.

## 5. Impact Map

### I-01 Shell / navigation

**Affected:** dashboard shell, header, Home, Sidebar, Search, route guards, i18n/responsive.

**Depends on:** authentication, tenant resolution, effective permissions, Domain registry.

**Can break:** all ordinary-user navigation, deep links, language/RTL, unauthorized access.

**Must preserve:** existing Domain routes and shell architecture.

### I-02 Workspace context

**Affected:** workspace registry/resolution, operation/clinical paths, ordinary-user landing behavior.

**Depends on:** user membership/default context, effective permissions, Patient Flow state.

**Can break:** role/context confusion, cross-context authorized Domains, clinical/operational work routing.

**Must preserve:** one canonical Workspace model and existing useful workflow surfaces.

### I-03 My Workspace / Widgets

**Affected:** widget registry, renderer, persistence, defaults, personalization.

**Depends on:** effective capabilities and Workspace surface.

**Can break:** authorization leakage, widget persistence, Home/Workspace separation.

**Must preserve:** personalization as presentation only.

### I-04 Patient Flow / Queue

**Affected:** Queue engine, queue actions, workspace actions, PatientFlowBoard, subscriptions, locks, revalidation.

**Depends on:** session data, tenant, permissions, visit/provider context.

**Can break:** patient movement, handoff, clinical lock, completion, real-time refresh.

**Must preserve:** canonical transition authority and existing valid states.

### I-05 Clinical Workspace

**Affected:** clinical surface, provider assumptions, patient context, visit integration.

**Depends on:** Patient Flow, visit/session, clinical permissions, future room/procedure contracts.

**Can break:** clinical handoff and medical context.

**Must preserve:** existing clinical workflow semantics while removing unjustified doctor-only presentation assumptions.

### I-06 Operational Workspace

**Affected:** reception/operation surface, waiting, clinical handoff, pending close, completion.

**Depends on:** Queue/Patient Flow and operational Domain actions.

**Can break:** arrival-to-completion workflow.

**Must preserve:** existing operational drag/drop and transition semantics where valid.

### I-07 Domain integration

**Affected:** Patients, Agenda, Visit, Medical Files/Photos, Treatment Plan, Follow-up, Financial/Inventory and other authorized Domains.

**Depends on:** route registry, permissions, patient/visit context, entitlements.

**Can break:** full-domain access or cross-domain context.

**Must preserve:** Domains as full independent surfaces with their own business logic.

### I-08 Security

**Affected:** Permission Engine, server actions, route guards, RLS, tenant filters.

**Depends on:** user/tenant identity and Domain authorization.

**Can break:** tenant isolation or unauthorized mutation/access.

**Must preserve:** one authorization system and server-side enforcement.

### I-09 Clinic Admin

**Affected:** administration shell/routes/configuration.

**Depends on:** tenant administration architecture.

**Can break:** clinic configuration and administrative oversight.

**Must preserve:** separate Clinic Admin model; never force it through ordinary-user Workspace behavior.

### I-10 Data / persistence

**Affected:** workspace membership/default data, sessions, widget state, audit, migrations/RLS.

**Depends on:** existing live schema and migration history.

**Can break:** existing data, RLS, tenant integrity.

**Must preserve:** reuse-first principle and no duplicate core tables.

## 6. Dependency graph

```text
Authentication / Tenant
        ↓
Effective Permissions
        ↓
Existing Domain + User Context
        ↓
Canonical Patient Flow / Queue
        ↓
Visit / Session / Provider / Room / Procedure context
        ↓
Workspace Context Resolution
        ↓
┌─────────────────────────────────────┐
│                                     │
├── Global Shell / Home / Sidebar     │
├── Clinical Workspace                │
├── Operational Workspace             │
└── My Workspace / Widgets            │
        ↓
Domain contextual navigation/actions
        ↓
Server mutation / RLS / audit
        ↓
Revalidation / subscriptions
        ↓
Runtime / E2E evidence
```

**Important:** Home and Sidebar depend on authorization and authoritative data, but they must not become Patient Flow owners. Clinical and Operational Workspace depend on Patient Flow rather than replacing it.

## 7. Dependency / execution order

### W0 — Freeze and evidence capture

Record the baseline commit, inventory affected code/docs/data, and capture current behavior. No source modification.

### W1 — Canonical context and authorization audit

Resolve and document Workspace context, Role separation, effective permissions and existing route guards before changing presentation.

### W2 — Queue / Patient Flow contract verification

Verify transitions, locks, handoff, drag/drop, subscriptions, revalidation and server authorization. This is the foundation for both Clinical and Operational Workspace.

### W3 — Clinical and Operational Workspace reconciliation

Reconcile existing operation/clinical surfaces with the single Workspace concept. Preserve existing drag/drop behavior. Remove only conflicting presentation/ownership assumptions. Do not redesign future Room/Procedure workflows.

### W4 — Patient/Visit context integration

Ensure clinical/operational work surfaces consume canonical patient/session/visit data and preserve context across authorized Domain navigation.

### W5 — Shell / Home / Sidebar / Search

Implement the ordinary-user shell against the already-established Workspace and authorization contracts. Ensure Home remains informational and Sidebar remains authorization-driven.

### W6 — My Workspace / Widgets

Connect default and personalized widgets to the established Workspace and permission model. Keep widget drag/drop distinct from Patient Flow drag/drop.

### W7 — Domain integration and regression

Validate every authorized Domain, route, action and contextual entry point against the unchanged Domain ownership model.

### W8 — Database/RLS only where proven necessary

After the application dependency map is stable, make only schema changes that are demonstrably required. Validate live/repo migration parity before applying anything.

### W9 — Runtime / E2E validation

Run clinical, operational, mixed-permission, search, Home, My Workspace, Domain and Clinic Admin scenarios end-to-end.

### W10 — Production closure

Only after all evidence is green may implementation be declared complete.

## 8. Required evidence before each code phase

### Before W1

- complete Workspace/Role/permission inventory;
- complete ordinary-user route inventory;
- Clinic Admin route inventory.

### Before W2

- Queue engine/actions/types/queries inventory;
- PatientFlowBoard behavior inventory;
- drag/drop transition matrix;
- lock/ownership matrix.

### Before W3

- historical clinical/operational implementation comparison;
- current route/surface map;
- list of preserved behaviors and exact conflicting behaviors.

### Before W5

- Home widget/data-source inventory;
- Header/Search inventory;
- Sidebar registry inventory;
- i18n/RTL/mobile baseline.

### Before W6

- Widget registry and persistence inventory;
- default widget source;
- permission/capability mapping.

### Before W8

- live-vs-repo migration comparison;
- affected table/RLS map;
- proof that existing schema cannot safely satisfy the requirement.

## 9. No-code-change status

This baseline and impact analysis introduces no source-code modification. The only repository change in this step is this pre-code documentation artifact.

No implementation phase W1–W10 is authorized by this document alone.

## 10. Exit criteria for PRE-CODE

The next step may be authorized only when:

- baseline evidence is accepted;
- affected files are fully mapped;
- impact paths are understood;
- dependency order is accepted;
- no critical dependency is being guessed;
- historical valid behavior is protected;
- implementation scope remains limited to the approved 2026-09-01 architectural decisions and their necessary engineering realization.

**End of PRE-CODE Baseline / Impact / Order.**
