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
