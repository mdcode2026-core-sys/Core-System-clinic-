# CORE SYSTEM — CSAPI Gate 01 + Gate 02 Deep Evidence Audit

Date: 2026-09-23
Branch: csapi/gate01-02-deep-evidence-reconciliation-2026-09-23
Scope: Gate 01 evidence integrity, Gate 02 closure integrity, and cross-gate dependency/ownership reconciliation
Status: AUDIT COMPLETE — Gate 01 remains CLOSED; Gate 02 requires RECONCILIATION before Gate 03 can be resumed

## 1. Executive finding

The current evidence does **not** justify reopening Gate 01.

Gate 01 has a direct, executable lifecycle proof on its final implementation lineage: Run #657 passed the dedicated D3 runtime and Stage 6 Patient Flow regression. The dedicated Gate 01 closure contract explicitly separates the broad Agenda-only smoke failure from Gate 01 acceptance. The Patient Flow lifecycle authority itself is therefore sufficiently evidenced to remain closed.

Gate 02 is different.

The binding Gate 02 contract requires a precheck covering:
- current longitudinal map;
- canonical ownership matrix;
- repeated-visit identity continuity;
- Treatment Plan → Next Action;
- Next Action → Appointment / Follow-up / Operational Work;
- Visit completion → continuation;
- Follow-up linkage/next-action behavior;
- Portal/Medical Photos boundaries;
- authorization/tenant isolation;
- duplicate-engine audit;
- Gate 01 dependency impact;
- the complete 42-scenario chain.

The merged Gate 02 implementation and verification evidence does not prove that complete contract.

The actual Gate 02 implementation was intentionally narrow: Patient Context switched its visit-continuity source from legacy `patient_history` to canonical `clinic_visit_sessions`. The dedicated Gate 02 structural audit verifies this source substitution and a few boundary statements. The CI runtime lane used during closure was the broad `cross-domain-runtime` reconciliation, which checks tenant-safe foreign-key/reference integrity across domains, but it is not a Gate 02 longitudinal journey runtime and does not execute the required 42-scenario continuity chain.

Therefore the correct state is:

- Gate 01 — CLOSED / evidence remains valid.
- Gate 02 — CLOSED record is **superseded by this evidence reconciliation**; Gate 02 must return to **OPEN — DEEP EVIDENCE RECONCILIATION REQUIRED**.
- Gate 03 — remains OPEN / verification blocked and must not advance.

## 2. Gate 01 deep evidence result

### 2.1 Dedicated lifecycle proof

Run #657 (35539734311) ran on implementation head `3676d5b0006cd3ea6083c3171873197cf8874e92` and passed the applicable Gate 01 lanes.

The D3 runtime:
- creates authenticated Doctor and Reception fixtures;
- establishes Patient/Visit/Room fixtures;
- exercises Reception → Waiting;
- verifies Reception cannot expose clinical-start authority;
- authenticates a Doctor and performs Clinical Pull;
- verifies exactly one active Work Session;
- exercises Finish;
- verifies Pending Close and Reception handoff;
- verifies Doctor cannot invoke Reception completion directly;
- authenticates Reception and completes the visit;
- verifies the required Patient Flow events and final completed state;
- cleans its fixtures.

Stage 6 regression additionally verifies canonical Patient Flow routes, server-side effective permissions, tenant resolution, canonical D3 command adapters, absence of legacy generic lifecycle transition authority, explicit transition map, and migration invariants.

This is sufficient direct evidence for Gate 01's stated lifecycle authority.

### 2.2 Agenda observation

Gate 01 production verification recorded an Agenda-only failure after appointment booking while `/patient-flow` access passed.

The Gate 01 final-release contract explicitly classifies this as supplementary/non-Gate01 evidence. That classification is consistent with the Gate 01 scope: Agenda owns scheduling, while Gate 01 owns the in-clinic Patient Flow lifecycle.

The observation must nevertheless be inherited by Gate 02 because Gate 02 explicitly requires determining whether Agenda behavior is a direct dependency of longitudinal continuity.

**Decision:** do not reopen Gate 01. Carry the Agenda observation into Gate 02 dependency reconciliation.

## 3. Gate 02 deep evidence result

### 3.1 Contract-vs-evidence gap

The binding Gate 02 contract requires a full precheck and states that closure requires applicable engineering, database/security, integration and runtime evidence.

The actual closure evidence currently recorded consists of:
- narrow Patient Context structural verification;
- broad cross-domain runtime integrity verification;
- live relational integrity counts/checks;
- production deployment/build/HTTP evidence;
- synchronized documentation.

The broad cross-domain runtime run proves useful referential integrity, tenant visibility and non-negative analytics, but it does not prove:
- a completed visit producing a correct continuation;
- Treatment Plan stage completion producing the intended canonical next action;
- Next Action mapping to Appointment vs Follow-up vs Operational Work;
- repeated interaction traceability as a longitudinal journey;
- absence of competing continuation engines across those paths;
- the 42-scenario chain;
- actual runtime behavior of the Gate 02 continuity boundary.

### 3.2 Structural audit limitation

`tools/csapi-gate02-continuity-audit.mjs` currently verifies:
- `clinic_visit_sessions` is used by Patient Context;
- the visit query exists;
- expected visit fields are selected;
- Patient Context consumes the query;
- legacy `patient_history` summary fields are not used there;
- no obvious `PatientJourneyEngine` / `patient_journey_state` symbol is present;
- approved P6/Agenda/Follow-up boundary text exists.

That is a valid narrow guard, but it is not equivalent to the Gate 02 contract's required longitudinal evidence.

### 3.3 Implementation scope versus closure scope

PR #182 changed the Patient Context read model and related documentation/package wiring. It did not implement a universal Patient Journey engine, which is correct.

The problem is therefore **not** that Gate 02 needed a larger implementation.

The problem is that the closure evidence was narrower than the binding Gate 02 acceptance contract.

This must be fixed at the verification/closure layer first, not by adding unrelated application code.

## 4. Cross-gate dependency / ownership reconciliation

| Concern | Canonical owner | Gate 01 | Gate 02 | Current classification |
|---|---|---|---|---|
| In-clinic Queue/Visit lifecycle | Patient Flow | CLOSED | inherited dependency | Proven |
| Appointment lifecycle | Agenda | outside Gate 01 | dependency to reconcile | Open dependency |
| Patient longitudinal identity | Patient/PJ + Gate 03 identity boundary | not owner | required continuity input | Gate 03 dependency |
| Treatment Plan progression | Treatment Planning / clinical-PJ | boundary only | continuity dependency | downstream owner |
| Next Action / Operational Work | Coordination + source domain | outside Gate 01 | required mapping | insufficiently verified |
| Follow-up lifecycle | Follow-up | boundary only | continuity consequence | downstream Gate 11 |
| Communications/Notifications | owning downstream domains | outside | continuity consequence | downstream |
| Patient Context visit history | Patient Context/read model | not lifecycle authority | Gate 02 implementation | verified narrow change |

No evidence found requires a second Queue, Visit, Patient Journey, scheduling or permission engine.

## 5. Gate-state decision

### Gate 01

**REMAINS CLOSED.**

No retroactive Gate 01 implementation repair is authorized by this audit.

### Gate 02

**REOPEN / SUPERSEDE CLOSURE: OPEN — DEEP EVIDENCE RECONCILIATION REQUIRED.**

Reason: the current closure evidence does not satisfy the Gate 02 contract's own required precheck and continuity-runtime evidence. This is an evidence/verification closure defect, not yet a finding that the Patient Journey application architecture itself is wrong.

Required Gate 02 work:
1. reconstruct the 42-scenario chain against current main;
2. produce the actual ownership/current-state/reality/gap matrices;
3. execute continuity runtime scenarios for completed Visit → result → next action;
4. verify Treatment Plan → Next Action semantics without assuming downstream ownership;
5. verify Next Action → Appointment / Follow-up / Operational Work mappings;
6. verify repeated-visit traceability;
7. explicitly test the Gate 01 Agenda observation for continuity dependency;
8. verify Portal optionality and Medical Photos non-blocking behavior where relevant;
9. verify authorization/tenant isolation for the continuity paths;
10. only then decide whether any implementation defect exists.

### Gate 03

**REMAINS OPEN — DO NOT ADVANCE.**

Gate 03's current E2E failure remains independently valid. It is not being attributed to Gate 02 without evidence.

## 6. Required contract correction

The Gate 02 execution contract must be strengthened so a future green structural audit cannot substitute for the missing longitudinal runtime evidence.

The revised contract must require at least:
- a dedicated Gate 02 continuity runtime suite;
- a 42-scenario reconciliation artifact;
- repeated-visit traceability evidence;
- explicit next-action mapping evidence;
- Agenda dependency classification;
- Treatment Plan / Follow-up / Operational Work boundary evidence;
- authorization and tenant-isolation evidence for those paths.

No application fix is authorized by this audit.

## 7. Resume order

Gate 02 Deep Evidence Reconciliation
↓
Cross-Gate Dependency / Ownership Reconciliation
↓
Gate 02 verification contract correction
↓
Dedicated continuity runtime verification
↓
Reassess Gate 02 closure
↓
Return to Gate 03 failed-E2E investigation

Gate 04 remains prohibited.

## 8. Evidence principle

A historical CLOSED label, a production HTTP 200, a Vercel READY deployment, or broad referential-integrity checks cannot substitute for a missing gate-specific acceptance lane.

This audit therefore preserves valid Gate 01 evidence, corrects the Gate 02 closure classification, and avoids both false closure and unnecessary reopening of Patient Flow.
