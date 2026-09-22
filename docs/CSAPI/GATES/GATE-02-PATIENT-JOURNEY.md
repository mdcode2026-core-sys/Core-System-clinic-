# CORE SYSTEM — CSAPI Gate 02 — Patient Journey

Date: 2026-09-21
Gate: CSAPI Gate 02 — Patient Journey
Status: OPEN — IMPLEMENTATION / VERIFICATION
Previous Gate: Gate 01 — Patient Flow — CLOSED
Execution mode: Decision-first; Product Owner approval P1–P7 recorded; implementation limited to approved longitudinal continuity boundary

## 1. Official scope

The CSAPI documentation pack defines Gate 02 as:

Longitudinal patient lifecycle over time; next actions and continuity.

This wording is authoritative for Gate 02 scope.

## 2. What Gate 02 is — and is not

Gate 02 is a longitudinal continuity and integration decision gate.

It is not a request to rebuild the already-implemented Patient Journey Stage 0–15 work.

Current PJ records describe an implemented Patient Journey spanning patient identity, service/procedure, scheduling, arrival, queue, clinical visit, treatment planning, follow-up, automation, medical photos, portal capability, integration and E2E validation. Those records are the starting evidence; current repository/database/runtime reality must still be verified.

Gate 02 must determine whether the implemented system expresses a truthful longitudinal continuity model after the in-clinic Patient Flow lifecycle is complete.

## 3. Relationship to Gate 01

Gate 01 established and closed the authoritative in-clinic flow:

Reception → Waiting → Clinical Pull → Clinical Work → Finish → Pending Close → Reception Completion → Completed

Gate 02 begins where longitudinal continuity becomes the question:

Completed clinical interaction → Result → Next Action / No Next Action → Future Appointment / Follow-up / Operational Work → Next Interaction → Continuation

Gate 02 must not:
- reopen Patient Flow lifecycle authority;
- change Waiting semantics;
- create a second Queue engine;
- create a second Visit lifecycle;
- create a second Patient Journey/state engine;
- replace existing domain ownership.

## 4. Canonical longitudinal chain to reconcile

The inherited 42-scenario cross-domain reference is:

First Contact → Patient Identity → Service/Procedure → Booking → Capacity Check → Confirmation → Arrival → Patient Flow/Visit → Clinical Decision → Treatment Plan → Next Action → Appointment → Procedure/Session → Financial Commitment → Payment/Insurance → Resource Consumption → Follow-up → Next Journey Action → Completion

Gate 02 must translate this conceptual chain into explicit current system evidence.

For each transition, determine:
- owning domain;
- canonical entity/reference;
- triggering event or action;
- persisted state;
- next required action;
- whether continuity is synchronous/asynchronous;
- authorization boundary;
- failure/retry behavior;
- runtime evidence;
- whether the relationship is Core, optional, advanced, parallel/non-blocking, future, or outside Gate 02.

## 5. Key Gate 02 questions

### A. What is the unit of continuity?

Determine how the system relates:
- Patient;
- Visit/Session;
- Treatment Plan;
- Treatment Plan Stage;
- Next Action;
- Appointment;
- Follow-up;
- Operational Work;
- Completion/Continuation.

Do not assume any one record is the universal owner until verified.

### B. How is the next action produced?

Verify whether a clinical result, completed stage, completed visit or follow-up event creates:
- a next Treatment Plan stage;
- an explicit Next Action;
- an Appointment requirement;
- a Follow-up;
- Coordination/Operational Work;
- no action.

Identify the canonical path in each case and any duplicate/competing paths.

### C. How does continuity return to the patient?

The system must preserve longitudinal patient context without duplicating patient identity or domain ownership.

Verify that a future interaction can be traced back to the correct patient and preceding clinical/operational context.

### D. How are optional paths handled?

Patient Portal is subscription-controlled and must not be a prerequisite for the internal journey.

Medical Photos are parallel/non-blocking and must not block the internal journey.

Treatment Plan is applicable only where clinically required; not every visit requires a plan.

Follow-up may be applicable after an interaction; it must not become mandatory when not clinically/operationally indicated.

## 6. Existing architecture to preserve

- Patient truth remains Patient/PJ-owned.
- Appointment truth remains Agenda-owned.
- Patient Flow remains the in-clinic workflow authority.
- Treatment Plan remains clinical/PJ-owned.
- Follow-up/Retention remains its own bounded domain.
- Operational work remains Coordination-owned.
- Financial truth remains Financial-owned.
- Workforce/resource truth remains Workforce-owned.
- Communications remains Communications-owned.
- Existing permission/entitlement architecture remains authoritative.
- No domain should mutate another domain's source-of-truth merely to close a continuity action.

## 7. Gate 01 observation that enters Gate 02 precheck

Gate 01 production verification recorded an Agenda-only failure in the broad Clinic Admin runtime workflow:
- appointment booking succeeded;
- authenticated /patient-flow route access succeeded;
- the subsequent Agenda lifecycle subscenario timed out while locating the created patient/appointment.

This is preserved as an external Agenda-domain observation, not a hidden Gate 01 defect.

Because Gate 02 concerns next actions and continuity, the precheck must determine whether Agenda behavior is merely a separate domain issue or a direct dependency of the longitudinal contract under review.

No Agenda repair is authorized from this record alone.

## 8. Required precheck sources

### CSAPI
- docs/CSAPI/CSAPI-MASTER-STATE.md
- docs/CSAPI/CSAPI-GATES-PLAN.md
- docs/CSAPI/CSAPI-HISTORICAL-BASELINE.md
- docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md
- this Gate 02 record
- Gate 01 closure records

### Patient Journey
- approved PJ-01 through PJ-09
- approved Patient Journey Implementation Plan
- PJ_FINAL_IMPLEMENTATION_STATE.md
- PJ_STAGE15_CLOSURE.md
- current PJ decision/UX reconciliation records

### Cross-domain
- docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md
- current Treatment Plan records
- current Agenda records
- current Follow-up/Retention records
- current Journey Coordination records
- current Communications/Portal boundaries

### Implementation truth
- current main
- relevant source/actions/services
- current Supabase schema, migrations, RLS, functions and relevant data
- applicable CI/runtime test definitions

## 9. Required precheck outputs

Before implementation, Gate 02 must produce:
1. Current-state longitudinal map — conceptual journey mapped to real entities/actions/events.
2. Ownership matrix — every continuity transition mapped to its canonical domain owner.
3. Reality matrix — working / partial / missing / contradictory / historical / intentionally optional.
4. Gap matrix — genuine Gate 02 gaps separated from later-gate domain defects.
5. Decision register — decisions requiring Product Owner approval.
6. Implementation boundary — exactly what may change after approval and what is explicitly out of scope.
7. Verification contract — exact automated/runtime/data/security evidence needed for closure.

## 10. Decision gate

The gate state becomes DECISION READY only after the precheck evidence is complete.

A Product Decision Report must state:
- current architecture;
- current runtime behavior;
- current database truth;
- documented expectation;
- exact conflicts/gaps;
- alternatives only where a genuine choice exists;
- proposed product decision;
- scope and non-scope;
- dependencies;
- implementation/verification consequences.

Implementation begins only after explicit Product Owner approval.

## 11. Acceptance direction

Gate 02 should ultimately prove that the system can:

retain patient identity → preserve prior context → record current interaction → determine next action → create/coordinate the correct continuation → preserve traceability → support the next interaction

without:
- duplicate patient/journey state;
- duplicate scheduling;
- duplicate workflow/queue engines;
- hidden permission escalation;
- cross-tenant leakage;
- UI-only state claims.

## 12. Closure criteria

Gate 02 cannot be CLOSED until the approved decision is implemented and, where applicable, the resulting continuity is proven through:
- repository/build checks;
- database/schema integrity;
- tenant isolation;
- authorization;
- persistence;
- cross-domain references;
- next-action behavior;
- runtime workflow;
- regression coverage;
- production verification where applicable;
- synchronized documentation.

Documentation alone is never closure evidence.

## 13. Immediate next action

Start with Gate 02 PRECHECK from current main.

Do not implement a fix before the longitudinal current-state/reality/ownership/gap reconciliation is complete.


## 14. Approved implementation boundaries and verification contract

### P6 — Continuous Patient Journey

Patient Journey has no universal terminal state. Patient Flow Completed closes only the current operational visit cycle; it does not complete or close the longitudinal Patient Journey.

### Appointment ownership

Agenda remains the sole owner of Appointment lifecycle and scheduling. No Agenda repair is authorized from Gate 02 continuity work unless a separately approved Agenda decision requires it.

### Follow-up ownership

Follow-up remains an independent CORE Module and Gate 11 remains a separate gate. Gate 02 may reference Follow-up as a continuity consequence, but does not absorb Follow-up lifecycle implementation.

### Gate 02 implementation already applied

The approved narrow implementation replaces the Patient Context Visit summary source from legacy/summary `patient_history` to canonical `clinic_visit_sessions`. No universal Patient Journey state engine, database migration, production Supabase mutation, or Vercel deployment was introduced.

### Verification state

Canonical continuity links have been inspected against current repository source and live Supabase schema/data evidence. Treatment Plan → Operational Work and Follow-up → Notification/Operational Work boundary drifts remain deferred to their owning downstream gates. Automated structural verification and runtime verification remain required before closure.
