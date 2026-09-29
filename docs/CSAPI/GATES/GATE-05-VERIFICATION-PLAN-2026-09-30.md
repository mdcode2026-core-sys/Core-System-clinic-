# CORE SYSTEM — CSAPI Gate 05 — Clinical Verification Plan
## Version 1 — 2026-09-30

**Status:** FROZEN — VERIFICATION CONTRACT FOR FUTURE IMPLEMENTATION  
**Gate:** 05 — Clinical Care  
**Implementation:** NOT STARTED

## 1. Verification principle

Gate 05 cannot close on documentation, code presence or successful build alone.

Closure requires evidence appropriate to the affected layer:
repository → migration → database/security → application → E2E → runtime/production → final reconciliation.

A failed required lane blocks closure until the root cause is fixed at its owning layer.

## 2. Lane V05-A — Repository / structural verification

Must prove:
- all intended files are present;
- all new tables/actions/query services are referenced consistently;
- no duplicate Clinical engine was introduced;
- no direct client write bypass exists for canonical Clinical mutations;
- no accidental second Medical Record store exists;
- no duplicate scheduler/Treatment Plan/Follow-up engine exists;
- generated database types match the applied schema.

Pass condition: repository structure and source ownership are internally coherent.

## 3. Lane V05-B — Clean migration verification

Must prove on a fresh database:
- all Gate 05 migrations apply in order;
- migration versions are unique;
- no duplicate migration version is introduced;
- all PK/FK/check/index constraints apply successfully;
- RLS policies apply successfully;
- permission seed/mapping applies successfully;
- historical backfill is deterministic and non-destructive.

Pass condition: clean replay succeeds with no migration-history collision or integrity failure.

## 4. Lane V05-C — Live Supabase structural/security verification

Must verify after controlled migration application:
- all expected tables/columns/constraints exist;
- all intended tables have RLS enabled;
- tenant isolation is effective;
- direct unsupported table writes are denied;
- intended server-side command path succeeds;
- exact permission keys exist and are connected to the existing permission engine;
- finalization/attestation cannot be bypassed;
- performer/capability checks behave correctly;
- Medical Files/Agenda/Workforce policies remain coherent.

This lane does not override application E2E evidence.

## 5. Lane V05-D — Unit / integration lifecycle verification

Required scenarios include:
- Observation create/edit lifecycle;
- Assessment finalize lifecycle;
- Problem activate/resolve/supersede behavior;
- Decision draft/final/supersede behavior;
- Recommendation presentation and patient response;
- accepted/declined/deferred/undecided/partially-accepted Patient Decision history;
- Procedure Execution repeated-event sequence;
- not-performed / partially-performed / stopped execution states;
- Document draft/final/attested/amended versioning;
- Template draft/publish/retire with published-version immutability;
- Clinical completion evaluator;
- longitudinal Clinical Record composition.

Invalid transitions must fail deterministically.

## 6. Lane V05-E — Authorization / negative security verification

At minimum prove:
- unauthenticated read/write denied;
- authenticated user without `clinical:read` cannot read canonical Clinical entities;
- authenticated user without the required write permission cannot mutate them;
- finalize requires `clinical:finalize`;
- attest requires `clinical:attest`;
- template management requires `clinical:manage_templates`;
- problem administration requires `clinical:manage_problems`;
- recommendation administration requires `clinical:manage_recommendations`;
- procedure execution requires `clinical:execute_procedures`;
- patient decision capture requires `clinical:record_patient_decision`;
- cross-tenant access is denied;
- direct table writes are denied where the protected mutation boundary requires it;
- Workforce capability is not bypassed by granting a generic Clinical permission.

## 7. Lane V05-F — Authenticated application E2E

Primary real-world scenario:
1. enter a patient Visit from Patient Flow;
2. inspect relevant history without leaving the current Visit context;
3. complete required examination/observations;
4. create/update assessment/problem/decision;
5. create a recommendation;
6. record an explicit patient decision;
7. create or update a Procedure Execution when applicable;
8. attach or view a Medical File without blocking clinical work;
9. satisfy the applicable template requirements;
10. finalize/attest where required;
11. run Clinical completion validation;
12. hand the Visit back to Patient Flow pending-close;
13. confirm no Treatment Plan, Agenda or Follow-up lifecycle was silently taken over by Clinical.

Negative scenarios must include unauthorized access and cross-tenant attempts.

## 8. Lane V05-G — Cross-domain integration verification

Verify only the required boundaries:
- Gate 01 owns Visit lifecycle transitions;
- Gate 03 patient identity remains intact;
- Gate 04 owns appointments and receives appointment requirements;
- Gate 06 can consume Clinical source references without Clinical becoming Plan owner;
- Gate 11 can consume Follow-up requirements without Clinical becoming Follow-up owner;
- Gate 07 remains Procedure Definition/Catalog owner;
- Medical Files remains media owner;
- Workforce remains capability owner.

A downstream failure is classified against the invariant and owner before any repair.

## 9. Lane V05-H — Build / runtime verification

Must include:
- TypeScript/type generation where applicable;
- lint;
- production build;
- local production runtime;
- authenticated application checks against the exact candidate.

No production deployment occurs before the candidate is green on the required pre-production lanes.

## 10. Lane V05-I — Production verification

When Gate 05 changes production runtime:
- exact main SHA must be deployed;
- build-info/runtime identity must match that SHA;
- authenticated critical Clinical workflow must pass;
- tenant isolation must pass;
- required database/runtime health evidence must pass;
- no unrelated runtime regression may be ignored merely because the Clinical path passes.

Production verification must be attached to the exact final main candidate.

## 11. Lane V05-J — Final reconciliation / closure

Before closure:
- compare approved architecture to implementation;
- compare implementation to migration history;
- compare migration state to Live DB;
- compare Live DB to application behavior;
- review all required GitHub Actions evidence;
- classify deferred later-gate issues;
- update Gate Plan;
- update Master State;
- update Handoff;
- update Decision & Action Ledger;
- create the final Gate 05 closure record.

Only then may Gate 05 become CLOSED.

## 12. Failure protocol

A failed lane triggers:
1. evidence capture;
2. root-cause classification;
3. ownership assignment;
4. smallest root-cause correction;
5. rerun of the failed and affected dependent lanes;
6. reconciliation before progression.

Never:
- weaken a test;
- delete a scenario;
- change expected behavior merely to pass;
- hide a failure in a workaround;
- create a parallel system.

## 13. Gate closure condition

Gate 05 closure state requires:
**IMPLEMENTED + VERIFIED + RUNTIME VERIFIED + PRODUCTION VERIFIED (when applicable) + RECONCILED + DOCUMENTED.**

Until all required evidence exists:
**Gate 05 remains OPEN.**

This plan is frozen and does not authorize current implementation.
