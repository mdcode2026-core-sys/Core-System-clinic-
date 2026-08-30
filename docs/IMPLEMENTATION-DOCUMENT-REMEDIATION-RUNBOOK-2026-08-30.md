# CORE SYSTEM — Implementation Documentation Remediation Runbook

**Date:** 2026-08-30  
**Status:** READY FOR EXECUTION  
**Repository reference:** `main`  
**Origin:** `docs/ideal-operational-architecture-audit-2026-08-30` (merged into `main`)  
**Purpose:** Turn the remediation baseline into an exact, ordered, non-ambiguous execution procedure.

## 0. Boundary

This Runbook repairs and completes **implementation documentation and cross-domain contracts**. It does not perform or claim source-code, live-schema, runtime, browser, Production, performance, or penetration validation.

The later implementation/Reality phase must consume the resulting contracts as its specification.

## 1. Governing chain

Always use:

`Architectural decision → implementation contract → planned work → implementation evidence → validation evidence → accepted state → closure`

Never use:

`feature exists → therefore complete`

or:

`document says CLOSED → therefore complete`.

Historical material remains evidence and is classified rather than silently deleted.

## 2. Global execution procedure

Every remediation item R01–R12 must follow these steps.

### Step A — Establish authority
1. Identify the current architectural authority.
2. Identify domain-specific authority.
3. Identify current terminology authority.
4. Identify relevant PJ/UX authority.
5. List historical documents that describe the same capability.
6. Classify each historical document: `CURRENT / RECONCILED / HISTORICAL / SUPERSEDED / INVALID-CONTRADICTORY`.

### Step B — Establish the operational scenario
1. State the clinic event that starts the process.
2. Identify the actors.
3. State the expected normal outcome.
4. State the next required action.
5. State the final expected patient/clinic outcome.

### Step C — Establish ownership
For every fact/action explicitly name:
- owning Domain;
- source of truth;
- non-owner consumers;
- authorized actor;
- authorization source.

### Step D — Define the handoff
Document:
- trigger/event;
- information passed;
- destination Domain;
- destination actor/work item;
- expected state;
- return/result path.

No handoff may be implicit.

### Step E — Define the user path
Document the intended canonical UX/work surface without turning UX visibility into authorization.

### Step F — Define data responsibilities
Record what is created, updated, referenced, or derived and which Domain owns it.

### Step G — Define control behavior
Document permissions, entitlements, tenant isolation expectations, audit requirements, separation of duties, and prohibited bypasses.

### Step H — Define completion evidence
For each contract specify the future evidence needed to prove:
- persistence;
- ownership;
- authorization;
- cross-domain continuation;
- correct final state;
- regression safety.

### Step I — Reconcile linked documents
Update references, terminology and status links. Never silently rewrite historical decisions.

### Step J — Mark documentation complete
A remediation item may become `DOCUMENTATION COMPLETE` only when all sections above are present and no unresolved ownership/semantic ambiguity remains.

## 3. Ordered execution plan

### R12 — Documentation authority and closure

**Goal:** prevent future status contradictions.

1. Define one current status authority for the AJM/reconciliation program.
2. Define allowed lifecycle states: `UNEXECUTED / PRECHECK / RECONCILED / IMPLEMENTING / VALIDATED / PRODUCTION VERIFIED / DOCUMENTATION CLOSED / CLOSED`.
3. Define what evidence each state requires.
4. Require every closure record to identify the exact repository candidate, deployment state, database state, validation evidence and acceptance decision where applicable.
5. Link historical closure records as historical evidence rather than allowing them to override current acceptance.
6. Define supersession language for documents.
7. Create the master status/traceability index.
8. Mark R12 documentation complete.

**Do not do:** delete historical closure records; merge conflicting histories without preserving provenance.

### R01 — Procedure / Service / Package / Treatment Plan

**Goal:** establish one unambiguous clinical-commercial identity chain.

1. Define Medical Specialty ownership.
2. Define Procedure Master ownership.
3. Define Clinic Procedure/customization.
4. Define Service as the clinic-delivered commercial service representation.
5. Define Package/Offer as a commercial grouping.
6. Define Treatment Plan as the clinical plan/commitment.
7. Define the permissible links between these objects.
8. Define which objects can be selected during booking.
9. Define which object is preserved in clinical history.
10. Define how a multi-procedure Service is represented.
11. Define how Package components map to Treatment Plan stages without making Package the clinical owner.
12. Reconcile historical Medical Master/Procedure decisions.
13. Update implementation contracts and references.
14. Mark R01 documentation complete.

**Required invariant:** Procedure, Service, Package, Treatment Plan, Financial Plan and Appointment remain distinct concepts.

### R02 — Treatment Plan → Next Action → Appointment

**Goal:** make continuation from clinical decision to future work explicit.

1. Define Treatment Plan stage structure.
2. Define what constitutes a Next Action.
3. Define when Next Action is patient-facing continuity versus internal operational work.
4. Define when operational work is created.
5. Define the authorized actor for booking/action.
6. Define the Booking Requirement handoff.
7. Define Agenda as the only appointment authority.
8. Define how the booked appointment references the relevant treatment stage/plan context.
9. Define how completed Visit/Session advances the plan.
10. Define how the next stage becomes due.
11. Define what Follow-up owns versus what Coordination owns.
12. Reconcile historical PJ, Treatment Plan and Agenda descriptions.
13. Mark R02 documentation complete.

**Required invariant:** Treatment Plan does not become an appointment scheduler; Coordination does not become a clinical engine.

### R03 — Package / Financial Plan / Installments / Sessions

**Goal:** connect commercial commitment, financial commitment and actual treatment without collapsing them.

1. Define Package commercial state.
2. Define Financial Plan financial obligation.
3. Define Installment schedule and due-state.
4. Define payment allocation/reconciliation.
5. Define session/visit consumption against a package where applicable.
6. Define partial payment behavior as a financial state, not a completed obligation.
7. Define remaining balance.
8. Define patient-facing financial visibility where enabled.
9. Define how package status affects future sessions without changing clinical truth.
10. Reconcile historic package/payment/treatment terminology.
11. Mark R03 documentation complete.

**Required invariant:** Package ≠ Financial Plan; Treatment Plan ≠ financial ledger; session completion does not silently equal payment completion.

### R04 — Workforce → Availability → Agenda

**Goal:** make staff reality affect operational availability without creating a second scheduler.

1. Define working patterns.
2. Define attendance/absence inputs.
3. Define leave, illness, conference/seminar and official-holiday effects.
4. Define capacity input.
5. Define when staff constraints affect operational availability.
6. Define how Agenda consumes those constraints.
7. Define effects on existing appointments when future availability changes.
8. Define the resulting communication/work requirement.
9. Reconcile Workforce and Agenda implementation descriptions.
10. Mark R04 documentation complete.

**Required invariant:** Workforce describes work reality; Agenda owns appointments.

### R05 — Staff + Room + Device + Procedure feasibility

**Goal:** describe real appointment feasibility for device/resource-dependent services.

1. Define procedure resource requirements.
2. Define required room/resource/device.
3. Define authorized performer.
4. Define competence/qualification input where applicable.
5. Define simultaneous satisfiability for person + resource + time.
6. Define how the result affects appointment availability.
7. Define what resource usage is recorded after execution.
8. Reconcile existing room/resource and Agenda decisions.
9. Mark R05 documentation complete.

**Required invariant:** Provider availability alone does not prove service feasibility.

### R06 — Insurance lifecycle

**Goal:** provide the Core minimum insurance flow while keeping external payer integration optional/advanced.

1. Define Payer/Insurance Company.
2. Define patient coverage context.
3. Define financial responsibility.
4. Define service applicability.
5. Define claim-ready information.
6. Define claim lifecycle at the Core minimum level.
7. Define reconciliation.
8. Define remaining patient responsibility.
9. Define optional external payer integrations separately as Advanced.
10. Reconcile prior insurance decisions.
11. Mark R06 documentation complete.

**Required invariant:** internal insurance operation cannot depend on electronic payer integration.

### R07 — Procurement lifecycle

**Goal:** make clinic purchasing coherent with inventory and supplier financial truth.

1. Define need/request.
2. Define purchase request/order at Core level.
3. Define supplier linkage.
4. Define receiving.
5. Define inventory effect.
6. Define supplier obligation/financial context.
7. Define payment linkage.
8. Separate Advanced approval/comparison/reorder functions.
9. Reconcile historical purchasing/inventory descriptions.
10. Mark R07 documentation complete.

**Required invariant:** Purchasing extends inventory/resource truth and does not create a second stock engine.

### R08 — Revenue → Commission → Payroll

**Goal:** define auditable attribution and compensation flow.

1. Define procedure/service attribution.
2. Define invoice amount.
3. Define collected revenue.
4. Define eligible revenue.
5. Define commission basis.
6. Define commission rule.
7. Define commission result.
8. Define payroll handoff.
9. Define adjustments and effective dates.
10. Reconcile historical commission/payroll decisions.
11. Mark R08 documentation complete.

**Required invariant:** invoice value does not automatically equal collected revenue or commission basis.

### R09 — Communication → Request → Work

**Goal:** prevent messaging from becoming an accidental second workflow engine.

1. Define normal conversation.
2. Define explicit operational request.
3. Define patient-context reference when relevant.
4. Define recipient/routing.
5. Define authorization requirement for execution.
6. Define conversion from request to Coordination work where necessary.
7. Define completion response/notification.
8. Define audit/history requirements.
9. Reconcile Communications and Coordination wording.
10. Mark R09 documentation complete.

**Required invariant:** message ≠ task; request does not grant missing permission.

### R10 — Domain Event → Coordination → Authorized Actor → Completion

**Goal:** close the central operational-fabric contract.

1. Define canonical event input.
2. Define the work requirement produced by the event.
3. Define eligible/authorized actor logic.
4. Define Assignment vs Request vs Handoff.
5. Define execution and completion.
6. Define monitoring.
7. Define escalation.
8. Define return/result to originating domain.
9. Define audit trail.
10. Define structured historical data for Insights.
11. Define examples for Agenda, Treatment Plan, Follow-up, Financial, Inventory, Portal and Communications events.
12. Reconcile all older task/work/handoff proposals.
13. Mark R10 documentation complete.

**Required invariant:** Coordination owns work state, not originating business truth.

### R11 — Skill / Qualification / Permission

**Goal:** remove all semantic ambiguity that could corrupt authorization or routing.

1. Standardize Role.
2. Standardize Permission.
3. Standardize Capability.
4. Standardize Skill.
5. Standardize Qualification.
6. Identify every implementation document that conflates them.
7. Correct current documents where the wording changes current meaning.
8. Mark historical wording as historical/reconciled where appropriate.
9. Define how Skills/Qualifications can influence eligibility without granting permission.
10. Mark R11 documentation complete.

**Required invariant:** authorization comes from permissions/entitlements; competence comes from skill/qualification.

## 4. Final re-trace procedure

After R01–R11 are documentation-complete:

1. Re-run all 42 ideal scenarios against the completed contracts.
2. For each scenario confirm one owner per fact.
3. Confirm one source of truth per owned fact.
4. Confirm actor and authorization.
5. Confirm every handoff.
6. Confirm next state.
7. Confirm financial/resource effect where applicable.
8. Confirm follow-up/continuity effect where applicable.
9. Confirm communications/work effect where applicable.
10. Record remaining gaps.
11. No scenario is accepted as documentation-complete while an upstream contract remains ambiguous.

## 5. Implementation handoff gate

Only after the final re-trace passes may the package be handed to the implementation/Reality phase.

The implementation agent must consume:

- this Runbook;
- the Implementation Documentation Remediation Plan;
- the Cross-Domain Implementation Contracts;
- the Ideal Operational Scenarios Baseline;
- the Ideal Scenario Traceability Matrix;
- current Architecture/PJ/UX/Terminology authorities.

The implementation agent must not infer missing requirements from chat history.

## 6. Prohibited behavior during implementation

- No silent scope reduction.
- No skipping a listed contract.
- No new duplicate source of truth.
- No reinterpretation of ownership without an explicit decision.
- No feature-level fix used to hide a cross-domain contract defect.
- No declaring a contract complete because a screen/table/API exists.
- No deletion of historical evidence.
