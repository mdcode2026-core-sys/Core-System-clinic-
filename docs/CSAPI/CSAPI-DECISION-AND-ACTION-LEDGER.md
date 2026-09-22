# CORE SYSTEM — CSAPI DECISION & ACTION LEDGER

Purpose: Append-only operational record so a future conversation can determine exactly what happened without reconstructing it from chat history.

## Entry format

### CSAPI-[DATE]-[SEQ]
- Date:
- Gate:
- Type: Decision / Proposal / Finding / Rejected / Approval / Implementation / Verification / Closure
- Source(s):
- Statement:
- Evidence:
- Product Owner decision:
- Implementation consequence:
- Verification evidence:
- Status:

## Current baseline — reconciled 2026-09-21

### CSAPI-2026-09-21-001
- Date: 2026-09-21
- Gate: Gate 01 — Patient Flow
- Type: Closure
- Source(s): Gate 01 roadmap; integrated verification record; final production verification record
- Statement: D2, D3, Integrated Patient Flow Verification and Final Gate 01 Release / Production Verification are closed.
- Evidence: Run #657 (35539734311), production verification workflow evidence, production Supabase D2/D3 verification, production deployment/build identity.
- Product Owner decision: Gate 01 is closed for subsequent CSAPI work.
- Implementation consequence: Do not reopen D2/D3 or add Gate 01 lifecycle work.
- Verification evidence: Gate 01 final release record.
- Status: CLOSED

### CSAPI-2026-09-21-002
- Date: 2026-09-21
- Gate: CSAPI repository hygiene
- Type: Closure
- Source(s): GitHub PR inspection
- Statement: No CSAPI Pull Requests remain open.
- Evidence: Current GitHub open-PR query returned zero open PRs.
- Product Owner decision: Historical CSAPI work must not remain as pending implementation.
- Implementation consequence: Future work starts from a new focused Gate 02 branch/PR rather than reviving historical PRs.
- Verification evidence: GitHub open PR state = 0.
- Status: CLOSED

### CSAPI-2026-09-21-003
- Date: 2026-09-21
- Gate: CSAPI repository hygiene
- Type: Finding / Clarification
- Source(s): GitHub branch inspection
- Statement: Historical CSAPI branch refs remain present even though their associated work is merged, superseded or closed; they are historical refs, not pending implementation.
- Evidence: CSAPI branch search plus zero-open-PR state.
- Product Owner decision: Do not redirect/delete refs through unsafe ref mutation; no historical branch is treated as active execution authority.
- Implementation consequence: Current execution starts from main; branch deletion remains a repository maintenance operation when an appropriate deletion capability is available.
- Verification evidence: No open PR depends on those historical refs.
- Status: HISTORICAL / NO PENDING WORK

### CSAPI-2026-09-21-004
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Decision / Transition
- Source(s): CSAPI-DOCUMENTATION-PACK-2026-09-17.zip; current PJ implementation records; Gate 01 closure evidence
- Statement: Gate 02 is the next CSAPI gate and its scope is longitudinal patient lifecycle over time, next actions and continuity.
- Evidence: Supplied CSAPI gate plan plus current PJ Stage 15 implementation state and Gate 01 closure.
- Product Owner decision: Gate 02 is opened for precheck; implementation is not yet approved.
- Implementation consequence: Begin with documentation, architecture, repository, database and runtime reconciliation. Do not rebuild PJ.
- Verification evidence: Gate 02 pre-stage contract/handoff.
- Status: OPEN — PRECHECK READY

### CSAPI-2026-09-21-005
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Scope boundary
- Source(s): PJ-01…PJ-09; PJ_FINAL_IMPLEMENTATION_STATE.md; CSAPI-HISTORICAL-BASELINE.md
- Statement: Gate 02 must preserve existing domain ownership and examine longitudinal continuity rather than introduce a second Patient Journey engine.
- Evidence: Approved PJ plan sequence, current PJ implementation record and cross-domain contracts.
- Product Owner decision: Pending evidence review where a material architectural choice is discovered.
- Implementation consequence: Inspect → Reuse → Extend → Create only when necessary.
- Verification evidence: To be produced during Gate 02 precheck.
- Status: BINDING SCOPE PRINCIPLE

### CSAPI-2026-09-21-006
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Finding
- Source(s): Gate 01 final production verification
- Statement: The broad Clinic Admin Production Runtime workflow retains an Agenda-only lifecycle failure, outside Gate 01.
- Evidence: Production workflow Run #33 attempt 2; Patient Flow route access and appointment booking passed before Agenda lifecycle timeout.
- Product Owner decision: Do not repair or suppress this finding inside Gate 01. Gate 02 must inspect whether it affects longitudinal continuity dependencies.
- Implementation consequence: Treat as an external Agenda observation unless Gate 02 evidence establishes a direct approved continuity dependency.
- Verification evidence: Gate 01 final release record.
- Status: DEFERRED / EXTERNAL DOMAIN OBSERVATION

## Ledger rule

This file is append-only for material CSAPI events. Historical entries remain evidence. Current status is determined by the latest applicable gate records and exact evidence chain.


### CSAPI-2026-09-21-007
- Date: 2026-09-21
- Gate: CSAPI Gate 02 transition
- Type: Closure / Documentation
- Source(s): PR #178; GitHub merge result; Run #666
- Statement: Gate 01 → Gate 02 documentation reconciliation was merged to main. The current CSAPI documentation authority is now present on main.
- Evidence: PR #178 merged successfully as acaab351cab0f17542bcca0f28d020cad10f0b0d; Run #666 passed all required verification lanes before merge.
- Product Owner decision: Begin the next conversation from Gate 02 PRECHECK.
- Implementation consequence: No application/database change was introduced; Gate 02 remains unimplemented pending precheck and decision approval.
- Verification evidence: Open PR count returned 0 after merge; main is at acaab351cab0f17542bcca0f28d020cad10f0b0d.
- Status: CLOSED / TRANSITION COMPLETE


### CSAPI-2026-09-21-008
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Documentation / Finding / Boundary Reconciliation
- Source(s): Current Gate 02 working discussion; approved PJ records; Gate 02 gate plan; current Follow-up implementation review; CSAPI gate map
- Statement: Gate 02 cannot be treated as architecturally independent from Gate 11 — Follow-up & Retention. Follow-up is an independent CORE Module, while Patient Journey is the longitudinal continuity layer. Their ownership, dependency, and execution ordering must be reconciled before Gate 02 implementation planning is finalized.
- Evidence: Gate 11 is a dedicated CSAPI gate; Follow-up has its own current implementation/data/automation/permissions; Gate 02 explicitly covers continuity and next actions.
- Product Owner decision: No gate reorder, merge, new gate, or Gate 11-first execution has been approved yet. Perform dependency/boundary reconciliation first.
- Implementation consequence: No Gate 02 or Gate 11 implementation is authorized from this finding alone. Do not create a second Follow-up/PJ engine. Do not assume the current linear Gate 11 wording is final.
- Verification evidence: Working-context reconciliation record created on the dedicated Gate 02 documentation branch.
- Status: PRECHECK / DECISION PENDING

### CSAPI-2026-09-21-009
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Architectural/Product Context
- Source(s): Current working discussion and approved Patient Flow/PJ boundaries
- Statement: Longitudinal continuity is fan-out. A completed clinical interaction may produce zero, one, or many downstream consequences; Next Action is not a universal scalar and is not automatically Operational Work.
- Evidence: Clinical Recommendations + patient decision model; Appointment, Follow-up, Treatment Plan, Review, Communication and Operational Work ownership boundaries.
- Product Owner decision: Preserve domain ownership and patient agency; no universal workflow/state engine.
- Implementation consequence: Continuity design must support branching consequences and historical patient decisions without forcing fake appointments or work items.
- Verification evidence: To be established during Gate 02 precheck.
- Status: BINDING WORKING PRINCIPLE

### CSAPI-2026-09-21-010
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Architectural/Product Context
- Source(s): Current working discussion; Gate 01 closure semantics; PJ continuity review
- Statement: Patient Journey is continuous and has no universal Completed/Closed terminal state. Patient Flow Completed only closes the current operational visit cycle.
- Evidence: Gate 01 canonical lifecycle and longitudinal continuity model.
- Product Owner decision: Preserve this distinction.
- Implementation consequence: Never model Patient Flow completion as Patient Journey termination; continuity may remain with no immediate next action.
- Verification evidence: To be established during Gate 02 precheck.
- Status: BINDING WORKING PRINCIPLE

### CSAPI-2026-09-21-011
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Product Context
- Source(s): Current working discussion
- Statement: Clinical Recommendations may contain multiple recommendations. Each recommendation carries its own patient decision: Accepted, Declined or Deferred, followed by execution where applicable. Patient decision history remains traceable; reuse/reopen is allowed only when the same decision context remains valid, otherwise a new decision is created.
- Evidence: Treatment recommendation/acceptance examples and decision-context rules established in the current work.
- Product Owner decision: Preserve patient agency and medical-documentary integrity.
- Implementation consequence: Full medical recommendation remains documented even when only part is accepted or the entire plan is declined.
- Verification evidence: To be mapped during Gate 02/Treatment Planning reconciliation.
- Status: BINDING WORKING PRINCIPLE


### CSAPI-2026-09-21-012
- Date: 2026-09-21
- Gate: Gate 02 ↔ Gate 11
- Type: Decision / Boundary Reconciliation
- Source(s): Gate 02 record; Gate 11 current map; ADR-014; Journey Coordination blueprint; current Follow-up implementation; current Supabase state
- Statement: Gate 02 remains the longitudinal continuity decision/integration gate. Gate 11 remains an independent Follow-up & Retention implementation gate. They are coupled by an explicit contract but must not be merged.
- Evidence: Follow-up has its own table, permissions, automation and UI; Gate 02 owns longitudinal continuity; Communications, Agenda and Coordination retain independent source-of-truth ownership.
- Product Owner decision: Adopt this execution boundary for CSAPI.
- Implementation consequence: Gate 02 proceeds without absorbing Gate 11 implementation. Gate 11 later implements/validates Follow-up-specific behavior against the Gate 02 contract.
- Verification evidence: Reconciliation artifact `docs/CSAPI/CSAPI-GATE02-GATE11-DEPENDENCY-BOUNDARY-RECONCILIATION-2026-09-21.md`.
- Status: ADOPTED / PREIMPLEMENTATION

### CSAPI-2026-09-21-013
- Date: 2026-09-21
- Gate: Gate 11 — Follow-up & Retention
- Type: Finding / Architectural Drift
- Source(s): Supabase read-only verification; `20260904214323_route_followup_notifications_through_communications.sql`; `20260904214347_route_followup_notifications_through_communications_v2.sql`; ADR-014
- Statement: The live Follow-up automation path still reaches `notification_queue` through `enqueue_followup_notification()`, which directly inserts delivery rows. This is implementation evidence of residual business-level coupling even though the migration was intended as a Communications-boundary remediation.
- Evidence: Live function definition; `run_followup_automation()` calls `enqueue_followup_notification()`; current notification queue has 812 rows, with 623 tagged `communication_source=followup` and 744 carrying a Follow-up identifier.
- Product Owner decision: Preserve as a later owning-gate remediation finding; do not mutate production during Gate 02 precheck.
- Implementation consequence: Gate 11/Communications integration must move the business responsibility to the canonical Communications boundary without creating a second delivery engine or deleting historical Follow-up data.
- Verification evidence: 2026-09-21 read-only Supabase query set recorded in the reconciliation artifact.
- Status: DEFERRED TO OWNING GATE

### CSAPI-2026-09-21-014
- Date: 2026-09-21
- Gate: Gate 11 ↔ Gate 13
- Type: Finding / Boundary Drift
- Source(s): Supabase read-only verification; `20260830206000_ideal_scenario_followup_next_action_bridge.sql`; Journey Coordination blueprint; ADR-014
- Statement: A live `retention_followups` trigger can create an `operational_work_items` row from a completed Follow-up whenever next-action metadata is present, without independently proving that an actual operational action/request/handoff/escalation is required.
- Evidence: Trigger `trg_bridge_completed_followup_next_action` and function `bridge_completed_followup_to_next_action()` are active in Supabase. The function inserts kind=`next_action`, source_type=`retention_followup`. Current live Follow-up rows contain no populated `next_action_type`, so the trigger was not exercised by the currently inspected Follow-up dataset.
- Product Owner decision: Preserve as a later boundary correction; do not repair inside Gate 02 precheck.
- Implementation consequence: Follow-up should emit an explicit operational requirement only when such work is actually needed; Coordination remains the sole owner of Work Items.
- Verification evidence: Live trigger/function definition and current data distribution.
- Status: DEFERRED TO GATE 11 / GATE 13

### CSAPI-2026-09-21-015
- Date: 2026-09-21
- Gate: CSAPI gate map
- Type: Decision / Scope Clarification
- Source(s): CSAPI-GATES-PLAN.md; Gate 02 ↔ Gate 11 reconciliation; ADR-014; Journey Coordination blueprint
- Statement: The 20-gate CSAPI map remains unchanged. Gate 11 wording is clarified to describe Follow-up lifecycle/retention plus controlled integrations; it does not own Communications, Agenda, Notification delivery, or Coordination Work Items.
- Evidence: No dependency requires Gate 11 to execute before Gate 02, and no architectural benefit was found in merging independently owned modules into one gate. Gate 12 and Gate 13 already provide dedicated ownership for Communications and Notifications/Operational Work.
- Product Owner decision: Adopt current gate ordering; do not reorder, merge, split or add gates based on the present evidence.
- Implementation consequence: Continue with Gate 02 PRECHECK, then proceed to owning gates according to their clarified contracts.
- Verification evidence: Updated CSAPI gate plan and reconciliation artifact.
- Status: ADOPTED / MAP STABLE


### CSAPI-2026-09-21-016
- Date: 2026-09-21
- Gate: Gate 02 / Gate 06 / Gate 13
- Type: Finding / Boundary Drift
- Source(s): `src/domain/treatment-plan/treatment-plan.actions.ts`; R02 cross-domain implementation contract; current CSAPI continuity decisions
- Statement: Treatment Plan completion currently calls `ensureNextAction()`, which materializes an `operational_work_items` record of kind `next_action` for the next Treatment Plan item. The current helper also infers a booking requirement from the planned date. This is a valid historical implementation path but is broader than the current CSAPI rule that Next Action is not automatically Operational Work.
- Evidence: Current main implementation creates Work Item from `clinic_treatment_plan_items` after item completion; current live data contain 4 plan items and 3 completed items. Current CSAPI ledger entry 009 establishes conditional fan-out and explicit operational-work threshold.
- Product Owner decision: Treat the current helper as a later boundary-reconciliation target, not as the universal Gate 02 model. Do not repair it during Gate 02 precheck.
- Implementation consequence: Future correction must preserve Treatment Plan clinical ownership, Agenda appointment ownership, Follow-up ownership and Coordination Work ownership without introducing a second continuation engine.
- Verification evidence: Current source inspection + live data inspection.
- Status: DEFERRED TO OWNING GATES


### CSAPI-2026-09-21-017
- Date: 2026-09-21
- Gate: Gate 02 — Patient Journey
- Type: Decision Gate Transition
- Source(s): Gate 02 current-state matrix; Gate 02 ↔ Gate 11 reconciliation; Product Decision Report; current repository/database evidence
- Statement: Gate 02 precheck evidence is complete enough to move the gate to DECISION READY. The 20-gate map remains unchanged and Gate 11 remains independent.
- Evidence: Longitudinal entity/ownership map, live relationship/integrity checks, Follow-up/Treatment boundary findings, 42-scenario traceability, duplicate-engine audit, and Product Decision Report are recorded.
- Product Owner decision: Explicit approval is required before any implementation begins.
- Implementation consequence: No code/database implementation may start until the Product Decision Report is explicitly approved.
- Verification evidence: `docs/CSAPI/GATES/GATE-02-PRODUCT-DECISION-REPORT-2026-09-21.md`.
- Status: DECISION READY / APPROVAL PENDING

### CSAPI-2026-09-22-018
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Approval / Decision
- Source(s): Gate 02 Product Decision Report; Product Owner approval in CSAPI execution conversation
- Statement: Product Owner approved binding decisions P1–P7 and approved keeping the existing 20-gate map unchanged.
- Evidence: Explicit Product Owner approval of all seven decisions and clarification that the map is sequential; the unchanged map does not authorize skipping Gate 03–10 to Gate 11.
- Product Owner decision: Approved. Gate 02 may proceed to focused implementation within the documented boundaries.
- Implementation consequence: Implement longitudinal continuity/traceability only; preserve domain ownership; do not create duplicate Patient Journey, Follow-up, Agenda, Communications, Notification or Work engines. Gate 11/12/13 remain downstream gates/dependencies.
- Verification evidence: Gate 02 verification contract remains binding and must be satisfied before closure.
- Status: APPROVED FOR IMPLEMENTATION


### CSAPI-2026-09-22-019
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Implementation Start / Scope Correction
- Source(s): Approved Gate 02 Product Decision Report; current implementation inspection; Gate 02 continuity boundary audit
- Statement: Gate 02 implementation begins with a narrow longitudinal-continuity correction: Patient Context must read Visit continuity from the canonical `clinic_visit_sessions` records rather than the legacy/summary `patient_history` record. No new Patient Journey state engine or cross-domain owner is introduced.
- Evidence: Current Patient Context consumed `patient_history` for visit count/last visit while live/current evidence shows the canonical Visit/session records contain the actual longitudinal interaction history.
- Product Owner decision: This implementation is within the already approved Gate 02 scope of continuity/traceability; downstream Treatment Plan, Follow-up, Agenda, Communications, Notification and Coordination findings remain deferred to their owning gates.
- Implementation consequence: Added a canonical Visit continuity read query and switched the existing Patient Context Visit summary to that source; added a focused Gate 02 structural audit. No database or production mutation.
- Verification evidence: Static repository inspection completed; automated audit is added and will be executed with the engineering verification cycle.
- Status: IMPLEMENTATION IN PROGRESS
