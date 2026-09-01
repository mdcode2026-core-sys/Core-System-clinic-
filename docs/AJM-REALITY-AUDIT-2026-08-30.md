# CORE SYSTEM — AJM Full Clinic Operational Reality Audit

Date: 2026-08-30

## Current decision

**NOT CLOSED — VALIDATION IN PROGRESS**

The audit remains open until the repaired candidate is verified through the governed Production E2E path.

## Evidence-driven findings

### 1. Production E2E failure reproduced against the actual previous Production deployment

The authenticated Production gate previously executed against the then-current Production deployment and reproduced:

- Patient creation — patient not visible after registration.
- Appointment booking — patient not found.
- Agenda reschedule lifecycle — patient not found.
- Arabic parity — RTL direction missing.

The downstream appointment failures were dependent failures from the patient failure.

### 2. Root cause identified in Repository + Database

The patient registration form exposed optional/allowed values that were inconsistent with the live patient constraints. Empty optional fields were also serialized incorrectly, and the client patient query was not invalidated after successful mutation.

Repairs applied:

- normalize empty optional patient fields;
- reconcile patient constraints with the canonical patient UI values;
- invalidate patient queries after successful create/update;
- prioritize the explicit locale cookie over stale localStorage.

### 3. Database reconciliation

The corrected patient constraints were applied to the live Supabase project through the reality-audit migration. The repository migration history was then reconciled so the applied migration is represented by its live migration version, with the duplicate migration file removed.

### 4. CI/Production gate architecture defect discovered and repaired

The previous production-gated workflow ran authenticated Production E2E **before** confirming that Production was serving the candidate SHA. That could validate the previous deployment rather than the candidate.

The workflow was corrected to:

`main push → local/CI/static gates → wait for exact candidate SHA on Production → authenticated Production E2E`

A non-secret `/api/build-info` endpoint exposes only Vercel's deployment SHA/ref/environment so the gate can verify exact candidate identity without exposing credentials.

### 5. Exact repaired Production deployments

Vercel successfully deployed the repaired application to Production. The latest validated deployment at the time of this record is:

`dpl_5Fwxe9nBYDmWBwf9BVdacCXA5tUV`

SHA:

`f3a2cb5b76d8c151eb4739961848f4ccbce39de0`

Status: **READY**

Production `/api/build-info` currently reports this exact SHA.

## Validation state

A production-gate run is executing the real authenticated scenario. Its static/build gates have passed and it is currently executing the Production E2E portion.

A separate historical rerun was also started against the now-repaired Production deployment to obtain direct runtime evidence while the new exact-SHA gate proceeds. That rerun is not treated as the final candidate acceptance gate.

No Production Closure is claimed yet.

## Required final sequence

1. Complete the exact-SHA Production gate.
2. Verify patient persistence and downstream Agenda persistence directly in Supabase.
3. Execute role-specific scenarios for Clinic Admin, Receptionist, Doctor, Accountant, and Skin Specialist.
4. Execute the final connected cross-domain clinic journey.
5. Verify Production runtime errors/logs after the scenario.
6. Reconcile final AJM-0 → AJM-8 state.
7. Only if every Definition of Done gate passes may the final decision become `PRODUCTION CLOSED`.

No `CLOSED` or `PRODUCTION CLOSED` claim is made by this document.
