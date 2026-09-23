# CORE SYSTEM — CSAPI MASTER STATE

Status: ACTIVE — Decision-Gate Workstream
Last reconciled: 2026-09-22
Canonical implementation base: main; focused branches for changes
Current Gate: Gate 03 — Patient & Identity — CLOSED / VERIFIED / PRODUCTION VERIFIED
Previous Gate: Gate 02 — Patient Journey — CLOSED / VERIFIED / PRODUCTION VERIFIED
Execution mode: Decision-first; Gate 02 is CLOSED; Gate 03 implementation verified through engineering, DB and live Supabase checks; final production deployment/runtime verification pending

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

## 5. Gate 02 closure state

Gate 02 — Patient Journey is CLOSED. P1–P7 were approved and the focused longitudinal continuity implementation was verified through structural checks, live Supabase continuity integrity queries, main merge and production runtime verification. No second Patient Journey engine was introduced.

Deferred findings remain assigned to their owning downstream gates. The next gate is Gate 03 — Patient & Identity.

## 6. Current Gate 03 intent

The CSAPI documentation pack defines:

Gate 02 — Patient Journey
Scope: Longitudinal patient lifecycle over time; next actions and continuity.

Gate 02 is therefore not a rebuild of the historical PJ Stage 0–15 implementation. Current repository records already describe the Patient Journey as substantially implemented and closed at the PJ stage level.

Gate 02 exists to verify and decide the longitudinal continuity contract across the already-existing domains and to identify any real gaps between the approved Patient Journey model and current executable reality.

## 7. Gate 02 canonical cross-domain chain

The inherited historical reference chain remains:

First Contact → Patient Identity → Service/Procedure → Booking → Capacity Check → Confirmation → Arrival → Patient Flow/Visit → Clinical Decision → Treatment Plan → Next Action → Appointment → Procedure/Session → Financial Commitment → Payment/Insurance → Resource Consumption → Follow-up → Next Journey Action → Completion

This is an integration reference, not a new runtime engine.

Gate 02 must determine which transitions are synchronous or asynchronous, which domain owns each transition, what data/event/work object carries continuity, what is required versus optional, and which links are already runtime-verified versus only documented.

## 8. Canonical ownership boundaries

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

## 9. Gate 01 inherited cross-domain observation

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


## 11. Historical Gate 03 authority record — superseded by later verification evidence — 2026-09-22

The sections above that describe Gate 02 precheck questions and decision-first implementation are retained as historical/current-gate evidence for the now-closed Gate 02 record. They are not instructions to reopen Gate 02.

Current execution state is:

- Gate 01 — Patient Flow: CLOSED.
- Gate 02 — Patient Journey: CLOSED / VERIFIED / PRODUCTION VERIFIED.
- Current Gate: Gate 03 — Patient & Identity.
- Next execution sequence: READ → INSPECT → VERIFY → RECONCILE → DECISION REPORT → PRODUCT OWNER APPROVAL → IMPLEMENT → TEST → RUNTIME VERIFY → DOCUMENT → CLOSE.
- Do not reopen Gate 02 unless a new explicit CSAPI decision supersedes its closure.
- The 20-gate map remains unchanged.


## 12. Gate 03 reconciliation state — 2026-09-22

Gate 03 — Patient & Identity has an **APPROVED architectural baseline** and **COMPLETE Implementation Design**; execution approval is pending.

The full reconciliation is recorded in:
- docs/CSAPI/GATES/GATE-03-PATIENT-IDENTITY-RECONCILIATION-REPORT-2026-09-22.md
- docs/CSAPI/GATES/GATE-03-PATIENT-IDENTITY-ARCHITECTURAL-DECISION-REQUIREMENTS-2026-09-22.md

The Product Owner-approved baseline is recorded and reconciled against current repository, live Supabase and runtime/deployment evidence.

No Gate 03 implementation or production mutation has been performed.

Implementation Design has now been completed and reconciled in:
- docs/CSAPI/GATES/GATE-03-PATIENT-IDENTITY-IMPLEMENTATION-DESIGN-REVISED-2026-09-22.md

Current next state:
APPROVED ARCHITECTURAL BASELINE → IMPLEMENTATION DESIGN COMPLETE → EXPLICIT EXECUTION APPROVAL → IMPLEMENT → TEST → RUNTIME VERIFY → DOCUMENT → CLOSE

Do not reopen Gate 01 or Gate 02.


## 13. Gate 03 pre-Implementation Design reconciliation decision — 2026-09-22

A final authority check was performed before Implementation Design against the governing CSAPI plan, Master State, current handoff, Gate 03 architectural contract, reconciliation report, historical baseline and decision ledger.

The audit found documentation-state drift, not a product-architecture contradiction affecting the Gate 03 path:

- the Gate Plan still labeled Gate 03 as **NEXT**;
- the Gate 03 contract still contained stale **UNDER REVIEW / ARCHITECTURAL CONTRACT DRAFT** and pre-reconciliation wording;
- the Gate 03 contract described the approved directions as **five** although seven owner-approved directions are recorded;
- the decision ledger had no Gate 03 approval/reconciliation entries even though the current Gate 03 baseline had been approved and reconciled.

These are documentation-authority issues and have been reconciled. No application code, migration, production database or production deployment is authorized by these corrections.

### Decision

Gate 03 is now classified as:

**APPROVED — ARCHITECTURAL BASELINE / IMPLEMENTATION DESIGN PENDING**

Here, APPROVED means the architectural/product baseline is approved. It does not authorize migrations or code changes until the Implementation Design is complete and execution is explicitly authorized under the normal CSAPI sequence.

The next step is Implementation Design. Do not begin implementation until that design is complete and approved.


## Gate 03 Design Completion — 2026-09-22

The Implementation Design Review Resolution is complete. DR-01 through DR-12 are resolved in the revised design. Gate 03 is execution-design complete but remains unimplemented pending explicit Product Owner execution approval.

No migration, application code, production mutation, or deployment was performed.


## Gate 03 authority correction — 2026-09-22

Final CSAPI authority reconciliation corrected documentation-state drift across the Gate Plan, Handoff and Gate 03 records. The 20-gate map and Gate 01/Gate 02 closures are unchanged.

Canonical Gate 03 state: architectural/product baseline APPROVED; Implementation Design COMPLETE; authoritative design `docs/CSAPI/GATES/GATE-03-PATIENT-IDENTITY-IMPLEMENTATION-DESIGN-REVISED-2026-09-22.md`; execution approval PENDING; implementation/migrations NOT STARTED; no production DB mutation.

The pre-review Implementation Design document is historical/superseded and is not execution authority.


## Gate 03 execution approval — 2026-09-22

Product Owner execution approval received. Gate 03 may proceed from completed Implementation Design into Pre-Implementation Verification and then approved implementation. No scope expansion is authorized.


## Gate 03 implementation execution reconciliation — 2026-09-22

The approved implementation has been applied to the live Supabase environment and is now under final verification.

Implemented: canonical System Patient Identity foundation, multi-attribute patient matching policy `patient-match-v2`, human REVIEW_REQUIRED resolution, identity-preserving demographic updates, authoritative Patient Module search, separate Portal Identity/auth binding, tenant relationship integrity, direct identity-internal access denial, existing patient identity seeding, and binding Gate 03 verification contract.

Live Supabase migration history records the applied Gate 03 migrations as versions `20260922130830`, `20260922130928`, `20260922131239`, `20260922131621`, and `20260922131803`.

Production deployment remains pending until engineering verification, main integration, and post-main production verification are complete.


## 20. Current Gate 03 verification authority — 2026-09-22

The previous Gate 03 closure records are superseded where they state CLOSED / VERIFIED / PRODUCTION VERIFIED without accounting for the failed required GitHub Actions E2E evidence.

Current authoritative state:
- Gate 01 — CLOSED.
- Gate 02 — CLOSED / VERIFIED / PRODUCTION VERIFIED.
- Gate 03 — IMPLEMENTATION COMPLETE / VERIFICATION BLOCKED.
- Current blocker: required E2E evidence is not fully passing.
- Production deployment success is necessary but not sufficient for Gate 03 closure.
- Live Supabase structural/security verification is evidence of database correctness only; it does not override a failed application E2E.

Required continuation:
READ current verification evidence → inspect failed Actions E2E → determine root cause → fix at owning layer if required → rerun exact required E2E → verify engineering/build/DB/runtime again as affected → final documentation reconciliation → CLOSE only after all required evidence passes.

The failed E2E must not be weakened, skipped, deleted, or relabeled to obtain closure. Gate 04 must not start until Gate 03 is actually closed.


## Gate 03 full execution reconciliation correction — 2026-09-22

A full implementation reconciliation was performed after the required E2E failure exposed execution drift. The reconciliation found that the repository/live implementation did not fully realize several already-approved Gate 03 decisions. This is now being corrected on a controlled Gate 03 branch.

Corrective branch: `csapi/gate03-deployment-sequencing-fix-2026-09-22`.

Corrective changes now committed include canonical Patient/Identity authorization enforcement, patient-match-v2 Path A/Path B execution, conflict/uniqueness handling, identity provenance/verification metadata, Patient search permission enforcement, update continuity, human-review authorization, and legacy backfill provenance reconciliation.

The corrective changes are not yet verified by clean DB, Live Supabase, runtime or E2E evidence. The Live database still contains the pre-correction `register_patient_identity` definition. Therefore Gate 03 remains OPEN.

A live-only migration-history entry `20260922165018` remains a migration-parity reconciliation item; no guessed replacement is allowed.

Canonical state:
**Gate 03 — IMPLEMENTATION CORRECTION IN PROGRESS / VERIFICATION BLOCKED UNTIL CORRECTIVE CANDIDATE PASSES.**

Gate 01 and Gate 02 remain CLOSED and must not be reopened.
