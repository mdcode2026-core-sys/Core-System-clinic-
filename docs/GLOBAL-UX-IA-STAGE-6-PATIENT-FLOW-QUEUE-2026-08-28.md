# CORE SYSTEM — Global UX / IA Stage 6 — Patient Flow / Queue Reconciliation

**Date:** 2026-08-28
**Stage:** Global UX / IA Stage 6
**Status:** IMPLEMENTED — RUNTIME DEPLOYMENT GATE PENDING
**Branch:** `ux-stage-6-patient-flow`
**PR:** #28

## 1. Governing authority

Implementation follows:

- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`
- `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`
- AJM-1 Team & Access foundation
- current repository Patient Flow / Queue implementation
- live Supabase schema, RLS and permission state

The later Global UX authority supersedes any older fixed-role Workspace interpretation.

## 2. Inspect

Inspected the live repository at the Stage 5 baseline commit and the linked production Supabase project.

Inspected implementation included:

- canonical Queue domain: `src/domain/queue/*`;
- persisted `clinic_visit_sessions` state and RLS;
- existing Operation Workspace;
- existing Clinical Workspace;
- existing Queue page and Queue Widget;
- navigation registry and Sidebar filtering;
- AJM workspace membership model;
- existing permission catalog/effective permission engine;
- Stage 6 historical migration and workspace/queue state;
- live session-status distribution.

Live database state contained all six canonical operational states: `waiting`, `in_consultation`, `pending_close`, `completed`, `cancelled`, and `no_show`.

## 3. Reuse

No second Queue engine, visit-session table, tenant model, permission engine or Patient Journey engine was created.

Reused:

- `clinic_visit_sessions` as the canonical patient movement state;
- `queueEngine.validateTransition()` as the transition authority;
- existing `getQueue()` query and tenant/RLS boundary;
- existing Queue subscription mechanism;
- existing server-side effective permission calculation;
- existing Operation/Clinical workspace transition logic;
- existing `clinic_user_workspaces` only as organizational/default-surface data, not authorization.

## 4. Reconcile

### Patient Flow visibility

Patient Flow is now an independent Sidebar system with three explicit permissions:

- `patient_flow:operations`
- `patient_flow:clinical`
- `patient_flow:administrative`

No automatic role grants were added. Live validation confirms **0 automatic role grants** for these permissions.

Therefore:

`Operations role ≠ Patient Flow`

and:

`Clinical role ≠ Patient Flow`

Clinic Admin must explicitly assign the desired Patient Flow permission through the existing Team & Access permission architecture.

### Workspace relationship

Existing `/operation` and `/clinical` working surfaces remain intact. Patient Flow is not a replacement for those Workspaces; it is the independent cross-workspace patient-movement surface required by the UX authority.

### Queue relationship

The existing Queue/session engine remains canonical. Patient Flow uses it instead of recreating Queue logic.

## 5. Implement

Implemented:

1. Explicit Patient Flow permission catalog entries.
2. Independent Sidebar Patient Flow parent item with Operations / Clinical / Administrative child views.
3. Patient Flow context selector.
4. Reusable Patient Flow board using the canonical Queue query/session data.
5. Operations view with persisted drag/drop and operational actions.
6. Clinical view with clinical handoff and return-to-reception behavior.
7. Administrative view with full visibility and authorized intervention.
8. Server-side Patient Flow authorization for every state-changing action.
9. Existing Queue Server Actions hardened so mutation entry points require `sessions:update` and patient lookup requires authenticated tenant-scoped `patients:read`.
10. Revalidation of Queue, Operation, Clinical and Patient Flow surfaces after mutations.

## 6. Canonical state flow

The implemented transition authority remains:

`waiting → in_consultation → pending_close → completed`

with `no_show` and `cancelled` as terminal outcomes.

The Patient Flow UI restricts drag/drop/action targets according to its assigned context while the server still validates every transition through the canonical Queue rules.

## 7. Security / authorization evidence

Live Supabase verification confirmed:

- Patient Flow permissions exist in the production permission catalog.
- No Patient Flow permission is automatically granted through `role_permissions`.
- `clinic_visit_sessions` SELECT RLS requires the existing session/visit read permissions and tenant isolation.
- `clinic_visit_sessions` UPDATE RLS requires the existing session/visit update permissions and tenant isolation.
- Patient Flow mutations additionally verify the explicit Patient Flow context permission server-side.

This preserves:

`Role ≠ Permission`

`Workspace ≠ Security Boundary`

`Widget ≠ Permission`

`Visibility ≠ Authorization`

## 8. AJM / PJ reconciliation

AJM-1 remains the authorization foundation. `clinic_user_workspaces` remains organizational/default-surface data and is not used as a second security boundary.

PJ remains the owner/reference for the Patient Journey. Patient Flow exposes the existing journey state without transferring Domain ownership to UX/IA.

## 9. Unchanged

The following were deliberately not rebuilt or duplicated:

- Queue engine;
- Queue persistence;
- Patient Journey state model;
- Operation Workspace;
- Clinical Workspace;
- tenant resolution;
- permission engine;
- RLS architecture;
- roles/role-permission architecture;
- workspace membership architecture;
- subscription/entitlement architecture.

## 10. Runtime validation gate

Repository/DB implementation validation completed. The GitHub PR was created to trigger the repository CI and Vercel preview validation.

The Vercel status for the Stage 6 commit currently reports a **build-rate-limit failure** on the Hobby project rather than a source/build error. No Stage 6 preview deployment was created. The existing production deployment for `main` remains `READY`.

Therefore runtime validation of the new Stage 6 UI on the deployed branch is intentionally **not claimed as complete** until the Vercel build-rate-limit gate permits a deployment.

## 11. Closure rule

Stage 6 implementation is code-complete and database-verified. Final Stage 6 closure requires:

- successful repository CI;
- successful Stage 6 preview deployment;
- runtime verification of all three Patient Flow views;
- drag/drop persistence verification;
- permission visibility regression;
- Arabic/English parity verification;
- final documentation closure update.

No contradictory Patient Flow architecture is introduced by this implementation.
