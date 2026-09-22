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


### CSAPI-2026-09-22-021
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Verification / Canonical Continuity Links
- Source(s): Current repository source inspection; live Supabase schema/row evidence; approved P1–P7 boundaries
- Statement: Canonical continuity links were rechecked without introducing a universal Patient Journey engine. Patient is the longitudinal identity; Visit is the current interaction record; Agenda owns booking and links to Visit through agenda_event_id; Treatment Plan links to Patient and source Visit plus the explicit Plan↔Visit link table; Follow-up links to Patient and optionally Visit through session_id; Coordination Work links to Patient and carries source_type/source_id rather than owning upstream domain state.
- Evidence: Live Supabase rows: 391 patients, 139 visit sessions, 8 treatment plans, 4 treatment plan items, 3 treatment-plan/visit links, 813 follow-ups, 337 agenda events, 17 operational work items, and 0 patient_history rows. Relevant tables have RLS enabled. Composite tenant-aware foreign keys exist for Patient↔Visit, Visit↔Agenda, Treatment Plan↔Patient/Visit, Treatment Plan Visit links, Agenda↔Patient, and Work↔Patient.
- Finding: Treatment Plan completion currently materializes kind=next_action Operational Work through ensureNextAction(), and Follow-up retains next_action fields/legacy bridge paths. These are boundary findings already assigned to later owning gates; they are not reimplemented inside Gate 02.
- Product Owner decision: Preserve P1–P7. Gate 02 implementation remains limited to longitudinal traceability/read-model correction; downstream domain ownership stays unchanged.
- Implementation consequence: Continue with focused automated tests and runtime evidence; no production DB mutation and no Vercel deployment.
- Verification evidence: Live Supabase schema inspection plus current source inspection of Visit, Agenda, Treatment Plan, Follow-up and Coordination paths.
- Status: CANONICAL LINKS VERIFIED / DOWNSTREAM DRIFT DEFERRED


### CSAPI-2026-09-22-022
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Test Finding / Documentation Correction
- Source(s): Gate 02 structural verification against the committed audit contract
- Statement: The first execution-equivalent structural verification failed on the Gate 02 documentation contract because the current Gate 02 record did not contain the exact approved-boundary phrases required by the audit for P6, Agenda non-repair, and Gate 11 separation.
- Evidence: Verification failed at the P6 assertion before later assertions were evaluated. The underlying architectural decisions are already approved; this is documentation/test-contract drift, not a new product decision.
- Product Owner decision: Preserve P1–P7 and the existing gate boundaries. Reconcile the current Gate 02 record to the approved decision language, then rerun the same verification.
- Implementation consequence: Documentation-only correction; no application/database behavior change.
- Verification evidence: First execution-equivalent structural verification returned P6 assertion failure.
- Status: CORRECTIVE DOCUMENTATION WORK / RERUN REQUIRED


### CSAPI-2026-09-22-023
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Verification
- Source(s): Committed Gate 02 continuity audit contract; current branch source/docs
- Statement: After reconciling the documentation contract to the already-approved P1/P6, Agenda and Gate 11 boundaries, the full execution-equivalent structural verification passed.
- Evidence: Canonical Visit source/query, Patient Context consumption, removal of legacy Visit summary usage, no parallel Patient Journey engine markers, P6 terminal-state boundary, Agenda non-repair boundary, Gate 11 separation, package script and audit PASS contract all verified.
- Product Owner decision: No new decision required; continue to runtime verification.
- Implementation consequence: Gate 02 structural/static test lane is green. No database or production mutation.
- Verification evidence: Gate 02 structural verification: PASS.
- Status: VERIFIED / RUNTIME NEXT


### CSAPI-2026-09-22-024
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Runtime Verification
- Source(s): Live Supabase project `core-system-clinic`; read-only SQL continuity integrity queries; live schema/RLS inspection
- Statement: Runtime continuity integrity verification passed for the canonical links in scope. No orphan or cross-patient/cross-tenant mismatch was found across Patient→Visit, Visit→Agenda, Treatment Plan→source Visit, Treatment Plan↔Visit, or Follow-up→Patient/Visit relationships in the current dataset.
- Evidence: 391 patients; 139 visits; 8 treatment plans; 4 treatment-plan items; 3 plan↔visit links; 813 follow-ups; 337 agenda events; 17 operational work items; 0 patient_history rows. Integrity query results: visit_patient_orphans=0; visit_agenda_mismatches=0; treatment_source_visit_orphans=0; plan_visit_patient_mismatches=0; followup_patient_orphans=0; followup_visit_orphans=0; followups_with_next_action_type=0; next_action_work_items=4. Relevant tables are RLS-enabled and composite tenant-aware FKs are present for the inspected core links.
- Finding: The four existing `next_action` Work Items remain historical/runtime data and do not prove that the current implementation satisfies P3; the source-path boundary remains deferred to owning gates. No currently populated Follow-up next_action_type exercised the legacy bridge path.
- Product Owner decision: Runtime continuity evidence is sufficient for the approved Gate 02 implementation scope; do not repair downstream boundary drift here.
- Implementation consequence: No production mutation. Proceed to final repository/PR verification and Gate 02 closure documentation; Vercel remains out of scope until the later final production verification rule.
- Verification evidence: Live Supabase read-only verification passed.
- Status: RUNTIME VERIFIED / CLOSURE PREPARATION


### CSAPI-2026-09-22-025
- Date: 2026-09-22
- Gate: Gate 02 — Patient Journey
- Type: Verification / Production Runtime
- Source(s): GitHub PR #182 merge; main SHA 101034d30fc4f1f30516f470a1d024847d65225c; Vercel production deployment; production URL response; Vercel runtime error aggregation
- Statement: The approved Gate 02 implementation is now on main and the corresponding production deployment completed successfully. Production returned HTTP 200 at the canonical application URL, and no runtime error clusters were reported in the selected 30-minute verification window.
- Evidence: PR #182 merged successfully as main SHA 101034d30fc4f1f30516f470a1d024847d65225c. Vercel production deployment dpl_Gua6zUjSLohUaptAhoKnAPtFZn7V reached READY and is tied to that exact main SHA. Production URL `https://core-system-clinic.vercel.app/` returned 200. Vercel runtime errors for the project in the selected 30-minute window returned no runtime errors.
- Product Owner decision: Production verification is sufficient for the Gate 02 implementation scope; no further application/database mutation is required.
- Implementation consequence: Gate 02 may proceed to synchronized closure documentation. The separate Agenda observation and downstream Treatment Plan/Follow-up boundary drifts remain deferred to their owning gates.
- Verification evidence: Exact main SHA → exact production deployment SHA → HTTP 200 → no runtime error clusters.
- Status: VERIFIED / CLOSURE READY
