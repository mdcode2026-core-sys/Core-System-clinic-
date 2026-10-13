# CORE SYSTEM — CSAPI MASTER STATE

Status: ACTIVE — Decision-Gate Workstream
Last reconciled: 2026-09-29
Canonical implementation base: main; focused branches for changes
Current Gate: Gate 04 — Agenda & Scheduling — OPEN / IMPLEMENTATION-READY / IMPLEMENTATION NOT STARTED
Previous Gate: Gate 03 — Patient & Identity — CLOSED / VERIFIED / PRODUCTION VERIFIED
Execution mode: Gate 04 planning is complete and frozen; implementation is transferred as a controlled workstream. Gates 01–03 remain CLOSED / VERIFIED / PRODUCTION VERIFIED.

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

## Gate 03 final authority reconciliation — 2026-09-29

Current authoritative state after Run #1351 production verification:

- Gate 01 — CLOSED.
- Gate 02 — CLOSED / VERIFIED / PRODUCTION VERIFIED.
- Gate 03 — CLOSED / VERIFIED / PRODUCTION VERIFIED.
- Gate 04 — OPEN.
- Gate 11 — OPEN; Follow-up/Retention owns the deferred Follow-up next-action continuity issue.

Run #1351 passed the Gate 03-specific pre-production and Production identity verification path. Its later Follow-up failure is outside Gate 03 ownership and does not reopen Gate 03, Gate 02, or Gate 01.

Treatment Plan → explicit Update → Next Action → patient-specific Agenda handoff → Stage Advance → Plan Completion also passed in Production; no Treatment Plan or Gate 02 reopening is required.

Authoritative Gate 03 closure record: `docs/CSAPI/GATES/GATE-03-FINAL-CLOSURE-RECONCILIATION-2026-09-29.md`.

Next CSAPI execution may proceed to Gate 04 only according to the approved 20-gate sequence. Gate 11 Follow-up work remains deferred until its owning gate.
## Gate 04 current state — 2026-09-29

Gate 04 — Agenda & Scheduling is the active CSAPI gate.

The four Product Owner-approved Gate 04 decisions are:
1. Resource concurrency/capacity is policy-driven; default exclusivity applies where no explicit sharing/capacity policy exists.
2. Service/Procedure owns operational requirements; Agenda consumes them to determine appointment feasibility; provider/doctor is conditional by service.
3. Appointment create, update, status, cancellation and reschedule operations require full audit traceability.
4. Gate 04 consumes canonical Workforce availability/eligibility/schedule/leave information; legacy fallback cleanup remains with the Workforce owning gate.

No implementation has been authorized outside these boundaries. No finding currently reopens Gates 01–03 or transfers Follow-up/Gate 11 or Treatment Plan ownership into Agenda.

## 21. Gate 04 Implementation-Ready closure — 2026-09-29

Gate 04 has reached IMPLEMENTATION-READY.

Completed and frozen:
- Module/Domain architecture reconciliation.
- Canonical ownership/source-of-truth reconciliation.
- Four Product Owner-approved Gate 04 decisions.
- Agenda execution contract.
- Implementation design.
- Work-package implementation plan.
- Verification plan.
- Protected DB mutation-authority design.
- Cross-domain ownership boundaries with Gates 01–03 and Gate 11.

Not completed:
- Application implementation.
- Database migration implementation.
- Automated Gate 04 verification.
- Runtime/production verification.
- Final Gate 04 closure.

Therefore Gate 04 remains OPEN, intentionally, but is now ready for implementation handoff.

### Cross-gate binding
Gate 04 implementation must integrate exactly with the verified outputs of Gates 01–03. It must not modify their ownership or create duplicate Patient Flow, Patient Identity, Patient Journey, Queue, Treatment Plan, Follow-up, Inventory, Workforce or scheduler engines.

### Sequential progression
Gate 05 may now begin its own decision/design/planning work. Gate 05 implementation is not authorized before Gate 04 closure unless a specific documented dependency makes earlier implementation necessary. Planning a later gate does not constitute implementation or closure of that gate.

### Transfer rule
The implementation owner may execute Gate 04 from the frozen artifacts. Any discovered contradiction must be classified as: Gate 04 implementation defect; later-gate issue; regression of a closed gate; or genuine architecture/product decision requiring escalation. No silent reinterpretation of frozen decisions is permitted.


 
## Current operational continuation — Gate 04 / 2026-10-12

**This section supersedes older current-gate labels earlier in this file where they conflict with the active Gate 04 evidence.** Historical entries remain historical.

- Active gate: Gate 04 — Agenda & Scheduling — **OPEN / implementation in progress / not closed**.
- Operational handoff: `docs/CSAPI/CSAPI-GATE-04-CONTINUATION-HANDOFF-2026-10-11.md`.
- Active branch: `csapi/gate04-agenda-implementation-2026-10-10`.
- PR #242: OPEN / DRAFT / NOT MERGED.
- Latest verified candidate at this checkpoint: `fe4f4d2b34b546540236102cd469946dcab4a59d`.
- Latest Engineering Governance #244: PASS.
- Latest Workstream Verification #984: FAIL. Engineering, Gate 04 static, Gate 04 local DB, authenticated route E2E, Gate 03 identity and identity E2E, cross-domain read-only runtime, changed-source i18n/catalogue parity, and global presentation static passed. The patient-journey lane failed by redirecting to login from `/patients`; global presentation runtime failed with a Playwright TimeoutError. Final gate therefore correctly failed.
- Product Owner decision, 2026-10-11: the minimum Follow-up appointment-request → Agenda handoff is REQUIRED for Gate 04 closure. This is approved and must not be re-asked. Gate 11 remains separate; no Follow-up lifecycle redesign.
- Immediate next action: fix the narrow workstream-planner/descriptor classification that inadvertently invokes the closed Gate 02 mutation-capable E2E when Gate 04 changes `src/features/followup/`. Keep Gate 02 closed and preserve Gate 04's own static/authenticated E2E evidence. Then rerun exact-head CI and investigate the independent global presentation runtime timeout.
- WP-7 OPEN. WP-8 BLOCKED by unreconciled repository/hosted migration lineage.
- No merge, hosted Supabase schema/data/history changes, or Vercel promotion.
- On a new conversation beginning with `CSAPI`, read the operational handoff above and verify the current PR/head/Actions before work. Continue from the stated next action; do not restart design or repeat owner decisions.



## Current Gate 04 verification override — 2026-10-12

- Last verified candidate before this documentation update: `60940355af233c9023e4e06ea0ca4e5192226c79`.
- Workstream Verification #996: PASS, all 12 jobs; Engineering Governance #256: PASS on the same SHA.
- Follow-up → Agenda handoff static assertions and authenticated E2E passed; the global presentation runtime lane passed on this candidate. The closed Gate 02 legacy patient-journey lane was not selected; Gate 02 remains closed.
- Gate 04 is still **OPEN / implementation verification and independent review in progress**. WP-8 remains blocked by migration-lineage reconciliation. PR #242 remains OPEN/DRAFT/unmerged.
- Next: independent diff/contract review, evidence-based WP1–WP8 reconciliation, then exact-head CI after this documentation update. No merge, hosted Supabase schema/data/history changes, or Vercel promotion.

## Current Gate 04 exact-head override — 2026-10-12 / Workstream #997

- Candidate `534474015383716e6517a7b0d26cc205864a493f`: Workstream Verification #997 PASS (12/12 jobs); Engineering Governance #257 PASS.
- Direct evidence: Gate 04 static 59/59; isolated local DB replay/ACL/RLS and create/status/cancel/rebook audit probes pass; authenticated route E2E 3/3 including Follow-up → Agenda patient/request context; all other lanes and final gate pass.
- Preliminary source review: server-derived actor/tenant, service-role-only command client, DB permission/tenant/reference/state checks, and no ordinary client write path.
- Closure remains blocked pending explicit scenario-level reconciliation for provider-required/optional, conflict/time/workforce, concurrency, lifecycle and cross-domain Verification Plan cases. WP7 OPEN; WP8 BLOCKED by unreconciled migration lineage.
- PR #242 remains OPEN/DRAFT/unmerged. No hosted DB/history changes or Vercel promotion. This documentation checkpoint needs fresh exact-head CI.


## WP-8 read-only migration-lineage inventory — 2026-10-13

Snapshot artifact: `docs/CSAPI/GATES/GATE-04-WP8-MIGRATION-LINEAGE-SNAPSHOT-2026-10-13.json` captured against repository SHA `1ef5f0e86810c07e4de09989c140d13369d0b872` and hosted project `core-system-clinic` (ref `qaslsjyxjwvdoiczmhgq`). This is a read-only version-key inventory from the repository Git tree and Supabase migration-history listing; no hosted SQL, schema, data, or migration history was modified.

Fresh counts:
- Repository SQL migration files: **238** total; **233** with 14-digit migration versions and **5** shorter legacy-prefix files.
- Hosted migration-history rows: **292**.
- Shared exact 14-digit version keys: **121**.
- Repository-only version keys: **112**.
- Hosted-only version keys: **171**.
- Shared version keys with different names: **12**.

These counts supersede the older WP-8 headline counts in prior notes because the current snapshot is from the current branch head and explicitly separates 14-digit version keys from five shorter legacy filenames. They are **not semantic migration equivalence counts**: a version-key difference can reflect a rename/re-version/replay or an actually unrepresented change; only content/schema evidence can classify it. Matching version keys also do not prove file contents match what was applied. Therefore WP-8 remains **BLOCKED**.

Next: group candidates by normalized intent and compare repository SQL bodies, hosted history names, and current schema/catalog evidence in read-only mode; classify each discrepancy as equivalent/renamed, repo-only not applied, hosted-only untracked, name-only mismatch, or unresolved. Produce an approved remediation plan before any hosted change. Do not bulk-apply migrations, edit hosted history, or infer a safe order from names alone.


## Gate 04 current checkpoint — 2026-10-13

- Current verified candidate: `548f050c2f6e18122b9350e655e74ea5ab54090e`; Workstream #1000 PASS (12/12) and Governance #260 PASS.
- Gate 04 remains OPEN: scenario-level coverage is incomplete; see `docs/CSAPI/GATES/GATE-04-WP7-SCENARIO-EVIDENCE-MATRIX-2026-10-13.md`.
- WP-8 remains BLOCKED: repository-vs-hosted migration lineage is unresolved. Read-only schema checks do not authorize hosted changes.
- PR #242 stays Draft/unmerged; no production promotion or hosted Supabase mutation.


## Gate 04 finding — completed appointment conflict policy (2026-10-13)

Read-only source/schema comparison confirmed an inconsistency between the application conflict filter and hosted exclusion predicates for completed appointments (doctor/patient/room vs. resource). Repository migration definitions also do not fully match the live constraint set. This is a Gate 04 scenario-15 blocker and WP-8 lineage finding. No hosted change was made; a forward-only branch migration plus local active/completed conflict probes and read-only release preflight are required. Gate 04 remains open.


## Exact-head verification checkpoint — 2026-10-13 (#1004 / #264)

- Candidate SHA: `a24f6e70c659d3996c4e9bb5f0352220f2dc5dbc`.
- [Workstream Verification #1004](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38380111698): **PASS**; all required jobs completed successfully, including engineering, Gate 04 static, isolated local Gate 04 database, authenticated E2E, cross-domain runtime, Gate 03 regression lanes, i18n, presentation static/runtime, and final gate.
- [Engineering Governance #264](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38380111547): **PASS** on the same candidate.
- The local database lane cleanly replayed the branch migrations and passed the new lifecycle probe: scheduled → confirmed → arrived → in_session → completed; a same-patient overlapping appointment was then accepted; a further overlapping active appointment was rejected. The test also checks that all four doctor/patient/room/resource exclusion predicates mention completed, cancelled and no_show.
- This is direct evidence for the completed-appointment patient-conflict path and predicate consistency in the local schema. It does **not** yet independently prove completed-vs-active behavior for each doctor, room and resource dimension, nor does it close the other WP-7 scenarios.
- WP-7 remains **OPEN**. The scenario matrix remains authoritative for the unproven provider, room/resource, workforce, tenant-local time/buffer, concurrency, permissions, audit-disclosure, and cross-domain scenarios. Do not infer coverage from green aggregate CI.
- WP-8 remains **BLOCKED** pending evidence-backed repository/hosted migration-lineage reconciliation. The migration is branch-only; hosted Supabase schema/data/history are unchanged.
- PR #242 remains OPEN / DRAFT / UNMERGED. No merge, hosted database mutation/history edit, or production promotion.
- Next action: continue WP-7 scenario evidence work within the frozen Verification Plan, prioritizing direct, deterministic local database probes for the missing conflict/resource/provider/permission cases, while separately classifying WP-8 lineage discrepancies read-only. Do not add another broad implementation change until the next concrete gap and its root cause are established.
