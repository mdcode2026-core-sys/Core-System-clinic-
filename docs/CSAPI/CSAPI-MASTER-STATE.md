# CORE SYSTEM — CSAPI MASTER STATE

Status: ACTIVE — Decision-Gate Workstream
Last reconciled: 2026-09-21
Canonical implementation base: main; focused branches for changes
Current Gate: Gate 02 — Patient Journey
Previous Gate: Gate 01 — Patient Flow — CLOSED
Execution mode: Decision-first; no Gate 02 implementation before Product Owner approval

## 1. Purpose

CSAPI is the independent CORE SYSTEM architecture/product-integration decision path used to reconcile what the product is, what actually exists, what differs, what must be decided, and what should be implemented next.

CSAPI is not a continuation of PR #129/#136 or any earlier presentation-repair lineage. Historical findings may be used as evidence only.

## 2. Canonical work method

For every gate:

1. Study governing documentation and prior accepted decisions.
2. Verify current repository and, where applicable, live Supabase/runtime reality.
3. Classify findings: working, missing, drifted, duplicated, intentionally different, superseded, or future.
4. Produce a Product Decision Report when a decision is required.
5. Product Owner explicitly approves/rejects the proposed decision.
6. Record the approved decision.
7. Implement only the approved scope.
8. Build/test/runtime/data/security validate the implementation as applicable.
9. Reconcile evidence and documentation.
10. Close the gate.

Gate state machine:

OPEN → UNDER REVIEW → DECISION READY → APPROVED → IMPLEMENTED → VERIFIED → CLOSED

A gate can remain UNDER REVIEW or DECISION READY without implementation.

## 3. Gate 01 closure inherited by Gate 02

Gate 01 — Patient Flow is CLOSED.

The proven in-clinic lifecycle is:

Reception → Waiting → Clinical Pull → Clinical Work → Finish → Pending Close → Reception Completion → Completed

Waiting is waiting, not clinical-start and not role routing. Reception controls queue ordering/movement. Clinical work begins only when the responsible clinical actor pulls the patient. Reception owns final completion.

Gate 02 must preserve this authority and must not reopen or replace it.

## 4. Gate 01 evidence baseline

- D2 merged: 6013a9ffa4705738bc9e8de7c0d1403ff6a0858e
- D3 merged: c504897e01a1429e7729e27960e2f33cdb1b8f21
- Integrated Patient Flow evidence: Run #657 / 35539734311
- Production application candidate: 59d18b3b0ad8a097a01cff1bfd5f6ec1d7d9c90a
- Gate 01 production verification record: docs/CSAPI/GATES/GATE-01-FINAL-RELEASE-PRODUCTION-VERIFICATION-2026-09-21.md
- Gate 01 is closed; no Gate 01 implementation work remains open.

## 5. Current Gate 02 intent

The CSAPI documentation pack defines:

Gate 02 — Patient Journey
Scope: Longitudinal patient lifecycle over time; next actions and continuity.
Status: OPEN — DECISION READY.

Gate 02 is therefore not a rebuild of the historical PJ Stage 0–15 implementation. Current repository records already describe the Patient Journey as substantially implemented and closed at the PJ stage level.

Gate 02 exists to verify and decide the longitudinal continuity contract across the already-existing domains and to identify any real gaps between the approved Patient Journey model and current executable reality.

## 6. Gate 02 canonical cross-domain chain

The inherited historical reference chain remains:

First Contact → Patient Identity → Service/Procedure → Booking → Capacity Check → Confirmation → Arrival → Patient Flow/Visit → Clinical Decision → Treatment Plan → Next Action → Appointment → Procedure/Session → Financial Commitment → Payment/Insurance → Resource Consumption → Follow-up → Next Journey Action → Completion

This is an integration reference, not a new runtime engine.

Gate 02 must determine which transitions are synchronous or asynchronous, which domain owns each transition, what data/event/work object carries continuity, what is required versus optional, and which links are already runtime-verified versus only documented.

## 7. Canonical ownership boundaries

- Patient truth: Patient/PJ-owned.
- Appointment truth: Agenda-owned.
- In-clinic Visit lifecycle: Patient Flow-owned.
- Treatment Plan/progression: clinical/PJ-owned.
- Financial truth: Financial-owned.
- Workforce/resource truth: Workforce-owned.
- Inventory truth: Inventory-owned.
- Communications: Communications-owned.
- Follow-up/retention logic: Follow-up-owned.
- Operational work/coordination: Coordination-owned, without taking ownership of source-domain truth.
- Authorization/entitlement: existing Team & Access / permission architecture.
- No second Patient Journey, Queue, scheduling, permission, or workflow engine.

## 8. Gate 01 inherited cross-domain observation

The Gate 01 broad Production Runtime workflow reproduced an Agenda-only lifecycle failure after appointment booking and Patient Flow route access passed.

This is not retroactively a Gate 01 defect and must not be repaired inside Gate 01.

Because Gate 02 covers continuity and next actions, the Agenda observation must be examined during Gate 02 precheck only to determine dependency/impact. Any Agenda repair remains separately scoped unless Gate 02 evidence demonstrates an approved continuity dependency that requires a controlled change.

## 9. Gate 02 decision-first requirement

Before any code or database change, Gate 02 must answer:

- What does Patient Journey mean operationally after Gate 01?
- What is the canonical longitudinal unit of continuity: patient, plan, visit, next action, follow-up, or an explicit combination?
- How does a completed clinical interaction produce the next valid action?
- When is the next action an appointment versus operational work versus follow-up versus no action?
- How do Treatment Plan stages, Follow-up, Appointment, Visit and Completion relate without becoming competing state machines?
- Which continuity links already exist and are truthful in current DB/runtime?
- Which documented PJ capabilities are real, which are partial, and which are historical?
- Which gaps are Gate 02 scope versus later domain gates?

No implementation is authorized merely because a missing link is observed.

## 10. Required Gate 02 precheck

1. Read this file and GATES/GATE-02-PATIENT-JOURNEY.md.
2. Read the approved PJ source package / PJ master records (PJ-01…PJ-09 and approved implementation plan).
3. Read PJ_FINAL_IMPLEMENTATION_STATE.md and PJ_STAGE15_CLOSURE.md.
4. Inspect current main implementation and relevant tests.
5. Inspect current Supabase schema/data/RLS/functions relevant to longitudinal continuity.
6. Reconcile the 42-scenario chain against actual implementation.
7. Inspect Treatment Plan → Next Action → Appointment/Follow-up continuity.
8. Inspect completed Visit → Follow-up / next journey action behavior.
9. Classify the Gate 01 Agenda-only failure as an external dependency observation unless evidence proves otherwise.
10. Produce the Gate 02 decision/gap matrix before implementation.

## 11. Resume rule

A new conversation that starts with CSAPI must not reopen Gate 01. It resumes at Gate 02 — Patient Journey, PRECHECK, and begins from current repository/database/runtime evidence.

Do not trust old PR numbers or old status labels as current reality.

## 12. Change-control and quality rules

- Material scope changes are surfaced to the Product Owner before implementation.
- Real blockers are fixed at their correct layer; unrelated domain defects remain separately scoped.
- Inspect → Reuse → Extend → Create only when necessary.
- No UI-only acceptance.
- No production mutation during routine precheck/validation.
- No Vercel as a substitute for CI/local verification.
- Preserve tenant isolation, authorization, idempotency and data integrity.
- Documentation status must match evidence.
