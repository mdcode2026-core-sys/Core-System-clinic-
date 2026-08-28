# CORE SYSTEM — Global UX / Information Architecture Stage 6 — Patient Flow / Queue Reconciliation

**Date:** 2026-08-28
**Stage:** Global UX / IA Stage 6
**Status:** IMPLEMENTED — GITHUB VALIDATION IN PROGRESS
**Branch:** `ux-stage-6-patient-flow`
**PR:** #28

## Governing authority

Implementation follows the repository's current UX/IA authority and execution plan, `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`, `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`, AJM Team & Access foundation, PJ Patient Journey references, the current Queue/Workspace implementation, and the live Supabase authorization/RLS state.

The current Global UX authority supersedes older fixed-role Workspace interpretations.

## Inspect / Reuse / Reconcile

Inspected the current repository baseline, Stage 0–5 records, AJM workspace membership/permission architecture, PJ Patient Journey references, canonical Queue/session implementation, navigation registry, Sidebar filtering, effective permission engine, and live Supabase state.

No second Queue engine, visit-session table, tenant model, permission engine, or Patient Journey engine was created.

Patient Flow reuses:

- `clinic_visit_sessions` as the canonical patient movement state;
- `queueEngine.validateTransition()` as transition authority;
- existing `getQueue()` and tenant/RLS boundary;
- existing Queue subscription behavior;
- existing server-side effective permission calculation;
- existing Operation/Clinical transition logic;
- `clinic_user_workspaces` only as organizational/default-surface data, never as a second authorization boundary.

## Implemented

1. Explicit Patient Flow permissions:
   - `patient_flow:operations`
   - `patient_flow:clinical`
   - `patient_flow:administrative`
2. Independent Sidebar Patient Flow surface with Operations / Clinical / Administrative views.
3. Patient Flow context selector and reusable board backed by the canonical Queue/session state.
4. Operations, Clinical and Administrative movement/action surfaces.
5. Server-side authorization for every Patient Flow state-changing action.
6. Existing Queue mutation entry points hardened with tenant-scoped authorization.
7. Revalidation of Queue, Operation, Clinical and Patient Flow surfaces after mutations.

## Authorization decision

Patient Flow is **not** automatically granted by role, workspace membership, or professional category.

The migration intentionally creates **zero automatic role grants**. Live Supabase validation currently reports 0 `role_permissions` grants for all three Patient Flow permissions.

The governing model is:

`Role ≠ Permission`

`Workspace ≠ Security Boundary`

`Widget ≠ Permission`

`Visibility ≠ Authorization`

Clinic Admin explicitly assigns the required Patient Flow permission through the existing Team & Access permission architecture.

## Canonical flow

The existing Queue authority remains:

`waiting → in_consultation → pending_close → completed`

with `no_show` and `cancelled` terminal outcomes.

The UI restricts available targets by context, while the server validates every transition through the canonical Queue engine.

## AJM / PJ reconciliation

AJM remains the authorization and administrative foundation. PJ remains the Patient Journey reference/owner. Patient Flow exposes and operates the established journey state without transferring Domain ownership to UX/IA and without creating a second Journey/Queue model.

Existing `/operation` and `/clinical` working surfaces remain intact. Patient Flow is an independent cross-workspace patient-movement surface, not a replacement for those Workspaces.

## Database / migration reconciliation

The live database already contained two historical Stage 6-named migration records not represented by repository migration filenames. The implementation migration was therefore reconciled to the latest applied Stage 6 history instead of introducing another future migration version.

The repository now carries:

`supabase/migrations/20260828185953_pj_stage6_patient_flow_permissions.sql`

and live migration history contains version `20260828185953` with the same migration name. The migration is idempotent and intentionally creates no role grants.

## Validation gates

GitHub is the primary engineering validation gate. The Stage 6 workflow now performs, in order:

1. lockfile synchronization;
2. dependency installation;
3. TypeScript;
4. I18N audit;
5. I18N parity;
6. Stage 5 Widget Catalog audit;
7. Stage 5 Domain Surface audit;
8. Stage 6 Patient Flow repository audit;
9. full-repository ESLint diagnostic as a reported diagnostic;
10. blocking Stage 6 changed-surface ESLint gate;
11. production build.

The full-repository ESLint findings that pre-date Stage 6 remain recorded in the existing Stage 5 Unrelated Findings Register and are not silenced. They are outside the Stage 6 implementation surface and remain assigned to their owning workstreams.

## Live Supabase evidence

Verified in the production Supabase project:

- all three Patient Flow permissions exist;
- all three currently have 0 automatic role grants;
- canonical `clinic_visit_sessions` contains all six operational states: `waiting`, `in_consultation`, `pending_close`, `completed`, `cancelled`, `no_show`.

## Runtime gate

No Stage 6 production-readiness claim is made until GitHub validation completes successfully and the required runtime verification is performed.

Vercel is deliberately deferred until the GitHub candidate gate passes. If Vercel's build-rate limit blocks the candidate deployment, the limitation will be recorded as an infrastructure/deployment gate rather than misreported as a source or Stage 6 failure.

## Closure Definition

Stage 6 may be marked **CLOSED / Production Ready** only after:

- GitHub Stage 6 workflow passes;
- TypeScript, I18N, Stage 5 audits, Stage 6 audit, changed-surface ESLint and production build pass;
- runtime verification covers all three Patient Flow views;
- drag/drop and state persistence are verified;
- permission visibility and authorization regression are verified;
- Arabic/English parity is verified;
- production deployment is verified when the UX/IA DoD requires it;
- documentation and handoff status are updated;
- final repository and live database re-check finds no unresolved Stage 6 blocker.
