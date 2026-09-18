# CSAPI — Decision & Action Ledger

**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`  
**Current Gate 01 reconciliation branch:** `architecture/csapi-gate-01-patient-flow-architecture-reconciliation-2026-09-17`  
**Current Gate 01 target architecture branch:** `architecture/csapi-gate-01-patient-flow-target-architecture-2026-09-17`  
**Current Gate 01 implementation reconciliation branch:** `architecture/csapi-gate-01-patient-flow-implementation-reconciliation-2026-09-17`  
**Purpose:** durable record of what CSAPI discovered, approved, implemented, verified, deferred, rejected, or identified as documentation drift.

## Rules

- A conversation statement is not automatically an approved decision.
- A proposal becomes an approved decision only after explicit Product Owner approval and repository recording.
- Implementation must reference the approved decision that authorized it.
- Verification must identify evidence and reviewed commit/state.
- A Gate cannot be closed silently.
- Historical evidence must be labeled historical.
- Documentation drift must be recorded instead of silently overwritten.

## Status vocabulary

- `OBSERVED` — evidence seen, no decision made.
- `PROPOSED` — candidate decision awaiting approval.
- `APPROVED` — Product Owner explicitly approved.
- `IMPLEMENTED` — approved decision has been implemented.
- `VERIFIED` — implementation evidence checked.
- `CLOSED` — Gate/decision is fully closed.
- `DEFERRED` — intentionally postponed.
- `REJECTED` — proposal/approach not approved.
- `DRIFT` — documentation conflicts with verified reality.
- `REQUIRES-VERIFICATION` — claim exists but current evidence is insufficient.

## Initial CSAPI records

| ID | Gate | Type | Status | Record |
|---|---|---|---|---|
| CSAPI-001 | Global | FOUNDATIONAL | APPROVED | CSAPI is an independent architecture/product-integration decision path. |
| CSAPI-002 | Global | LINEAGE | APPROVED | Canonical branch is `architecture/csapi-decision-gates-2026-09-16`, based independently on `main`. |
| CSAPI-003 | Global | SEPARATION | APPROVED | PR #129/#136 and descendants are historical/parallel work, not CSAPI execution lineage. |
| CSAPI-004 | Global | PROCESS | APPROVED | Decision Gates use Study → Verify → Decision → Approval → Implement → Verify → Close. |
| CSAPI-005 | Gate 01 | TERMINOLOGY | APPROVED | Official product/domain term is **Patient Flow**. `Canonical Clinic Flow` is not a competing product term. |
| CSAPI-006 | Gate 01 | BASELINE | RECONCILED | The earlier Queue → Clinical Visit → Pending Close → Reception Workflow → Completed model remains useful historical evidence but is not sufficient as the full current Patient Flow architecture. |
| CSAPI-007 | Gate 01 | IMPLEMENTATION | REQUIRES-VERIFICATION | Current live/repository implementation must be reconciled against the expanded Patient Flow architecture before implementation decisions are made. |
| CSAPI-008 | Gate 01 | EVIDENCE | OBSERVED | Repository contains a canonical queue/transition path; reviewed UI surfaces do not replace server-side transition authority. |
| CSAPI-009 | Gate 01 | EVIDENCE | OBSERVED | Clinical completion currently saves clinical documentation and calls the canonical pending-reception path. |
| CSAPI-010 | Gate 01 | EVIDENCE | OBSERVED | Live `clinic_visit_sessions` evidence previously showed 138 completed sessions and one stale waiting session; no current pending-close/in-consultation/cancelled/no-show records were observed in that snapshot. |
| CSAPI-011 | Gate 01 | EVIDENCE | OBSERVED | Live Agenda↔Visit linked-status reconciliation previously returned zero mismatches across 138 linked sessions; tested session cross-domain tenant relationships returned zero mismatches. |
| CSAPI-012 | Gate 01 | GAP | REQUIRES-VERIFICATION | Existing-session arrival can write `session_status = waiting` without the transition validator; intended arrival semantics must be reconciled with the expanded model. |
| CSAPI-013 | Gate 01 | GAP | REQUIRES-VERIFICATION | Existing buffer/auto-close trigger semantics do not yet map cleanly to the clarified distinction between operational closure and administrative closure. |
| CSAPI-014 | Gate 01 | GAP | REQUIRES-VERIFICATION | Audit trigger coverage exists, but semantic completeness for lifecycle, handoff, reassignment and administrative actions is not established. |
| CSAPI-015 | Gate 01 | EVIDENCE | OBSERVED | Treatment Plan and Procedure remain separate visit-linked domains; Treatment Plan is not mandatory for every Visit. |
| CSAPI-016 | Gate 01 | EVIDENCE | OBSERVED | Follow-up remains a downstream domain; it must not be confused with continuation of an unresolved Visit. |
| CSAPI-017 | Gate 01 | ARCHITECTURE | APPROVED | **Visit is the container for the patient's actual clinic journey/work episode until administrative closure.** It is not synonymous with one clinical work interaction. |
| CSAPI-018 | Gate 01 | ARCHITECTURE | APPROVED | A **Clinical Work Session** is one discrete unit of clinical/procedural work inside an existing Visit. A Visit may contain multiple Clinical Work Sessions. |
| CSAPI-019 | Gate 01 | ARCHITECTURE | APPROVED | Waiting is an operational queue condition. Queue movement does not start clinical work. |
| CSAPI-020 | Gate 01 | ARCHITECTURE | APPROVED | Hold is a first-class unresolved Visit condition. Hold must not complete the Visit and must allow the clinical actor to work on another eligible patient. |
| CSAPI-021 | Gate 01 | ARCHITECTURE | APPROVED | Transfer preserves the parent Visit and may create/continue another Clinical Work Session with another actor/room/procedure context. |
| CSAPI-022 | Gate 01 | ARCHITECTURE | APPROVED | Clinical users finish **Clinical Work**, not automatically the entire Visit. The user-facing action should remain simple. |
| CSAPI-023 | Gate 01 | ARCHITECTURE | APPROVED | Operational work must be transferable between authorized reception users without account impersonation; reassignment/handoff must preserve audit history. |
| CSAPI-024 | Gate 01 | ARCHITECTURE | APPROVED | Operational closure and Administrative final closure are separate concepts. Automatic operational closure may be policy-driven and is not equivalent to final administrative closure. |
| CSAPI-025 | Gate 01 | ARCHITECTURE | APPROVED | Unresolved Visits may be administratively carried forward to a later operating date and resumed as the same Visit. This is not automatically a new Follow-up or Appointment. |
| CSAPI-026 | Gate 01 | ARCHITECTURE | APPROVED | Follow-up automation normally begins after authoritative Visit completion. Hold, Transfer and continuation of the same unresolved Visit are not Follow-up. |
| CSAPI-027 | Gate 01 | ARCHITECTURE | APPROVED | Operational timing policies (including example short reassignment and longer administrative-escalation windows) are tenant-configurable controls, not immutable lifecycle states. |
| CSAPI-028 | Gate 01 | ARCHITECTURE | APPROVED | Administration is the clinic control plane for authorized correction, reassignment, carry-forward, exception handling and final closure; administrative flexibility must remain authenticated, authorized, tenant-scoped and auditable. |
| CSAPI-029 | Gate 01 | DOCUMENTATION | DRIFT | The historical Patient Flow engineering specification's explicit state list is narrower than the approved current architecture and must be reconciled before implementation. |
| CSAPI-030 | Gate 01 | DOCUMENTATION | RECONCILE | The terminology definition of Visit must distinguish the Visit container from Clinical Work Session; `Encounter` remains the interoperability mapping term. |
| CSAPI-031 | Gate 01 | DOCUMENTATION | HISTORICAL | The 2026-09-01 final execution closure remains historical evidence and is not to be treated as the current full Patient Flow architecture. |
| CSAPI-032 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Patient Flow target architecture separates Visit finality, Clinical Work Session state, Queue/Waiting presence, Operational disposition and Administrative disposition instead of using one giant lifecycle enum. |
| CSAPI-033 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | `clinic_visit_sessions` remains the physical starting point/parent Visit record; no second top-level Visit table is proposed merely for terminology. |
| CSAPI-034 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | A first-class child Clinical Work Session representation is the expected smallest safe extension, subject to final schema verification; historical work-session events must not be fabricated during migration. |
| CSAPI-035 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Authoritative Queue representation must support multiple Waiting intervals, persistent order, priority/routing metadata and cross-day continuation without equating queue movement with clinical start. |
| CSAPI-036 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Finish is one atomic Patient Flow command that ends the active Clinical Work Session and creates the required operational consequence without inherently completing the Visit. |
| CSAPI-037 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Hold ends/suspends active clinical work while keeping the Visit open; return to Waiting is an explicit continuation operation rather than re-locking the old work interval. |
| CSAPI-038 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Transfer preserves Visit identity and records source/destination actor/room/context; a new Work Session may represent the receiving work. |
| CSAPI-039 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Existing Journey Coordination Work Items and history should be reused for operational handoff/reassignment, with an explicit or proven source link to the originating Visit. |
| CSAPI-040 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Operational Closure removes unresolved work from active daily workload without making the Visit final; Administrative Closure remains the authoritative final disposition. |
| CSAPI-041 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Carry-forward preserves the same Visit ID and records the later operating-date context; it is not automatically Follow-up or a new Appointment. |
| CSAPI-042 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Patient Flow lifecycle mutations should converge on one enforceable database transaction/command boundary, preferably SECURITY INVOKER where feasible, with direct lifecycle UPDATE bypass removed. |
| CSAPI-043 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Business lifecycle events must complement technical row audit and reliably record actor, Visit, Work Session/Queue context, event, source/destination and reason where applicable. |
| CSAPI-044 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Authorization must be evaluated from tenant + capability + context + ownership/eligibility, not from workspace visibility or generic `visits:update` alone. |
| CSAPI-045 | Gate 01 | TARGET-ARCHITECTURE | PROPOSED | Existing five-minute/sixty-minute trigger values are policy examples only; timing must be tenant-configurable and executed by explicit policy-driven operations rather than hidden lifecycle constants. |
| CSAPI-046 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | `clinic_visit_sessions` remains the parent Visit; no replacement top-level Visit table is justified by current evidence. |
| CSAPI-047 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | A first-class Clinical Work Session child is required to represent multiple work intervals without overwriting Visit-level chronology. |
| CSAPI-048 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Queue Entry history/order is required because current queue ordering is computed from `created_at` and does not preserve multiple Waiting intervals. |
| CSAPI-049 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Existing Journey Coordination Work Items should be reused for Visit-originated operational work, with governed source linkage rather than a duplicate work engine. |
| CSAPI-050 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | `clinic_user_settings` is user-scoped and is not a valid canonical tenant-level Patient Flow timing policy container; a tenant policy structure is therefore required unless a canonical tenant settings model is found in further inventory. |
| CSAPI-051 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Existing 5/60-minute triggers are compatibility evidence only; timing behavior must be converted to policy-driven eligibility plus explicit execution. |
| CSAPI-052 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Operational Closure and Administrative Closure must be represented separately; neither should be overloaded into the old `completed` meaning. |
| CSAPI-053 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Carry-forward is a same-Visit continuation command with a new operating-date context and business audit record. |
| CSAPI-054 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Follow-up remains downstream of authoritative completion and receives an explicit lifecycle guard against unresolved continuation states. |
| CSAPI-055 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Patient Flow lifecycle authority must move below application helper level into an enforceable DB transaction/command boundary; current RLS is permission/tenant enforcement, not transition enforcement. |
| CSAPI-056 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Current live permission vocabulary requires reconciliation because no `patient_flow:*` keys were returned while repository logic uses Patient Flow contexts/actions. |
| CSAPI-057 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Business lifecycle events are required in addition to `audit_trail`; sensitive events must not silently record a NULL actor. |
| CSAPI-058 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Existing initializer fields remain historical; current operational responsibility should use the operational Work Item responsibility path where possible. |
| CSAPI-059 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Existing Visit-level procedure/inventory/invoice links remain authoritative parent context; Work Session linkage is additive provenance, not domain ownership transfer. |
| CSAPI-060 | Gate 01 | IMPLEMENTATION-RECONCILIATION | PROPOSED | Existing compatibility lifecycle fields must be preserved during migration and classified as authoritative/derived/legacy before retirement. |

## Current implementation-decision reconciliation document

`docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DECISION-RECONCILIATION-2026-09-17.md`

This document records the evidence-backed reuse/extend/create decisions and the explicit rejected approaches for the implementation stage. All technical decisions in CSAPI-032 through CSAPI-060 remain `PROPOSED` until explicit Product Owner approval.

## Current unresolved engineering verification areas

The following remain implementation-stage proof targets after approval:

- exact final schema for Clinical Work Session and Queue Entry;
- exact tenant policy storage location/name;
- exact Patient Flow permission keys and role mappings;
- exact RPC/command transaction boundary and grants;
- compatibility projection/migration rules for legacy six-state fields;
- business-event append-only storage and RLS;
- scheduler/worker mechanism for timing policies;
- billing source-of-truth reconciliation;
- authenticated runtime scenarios;
- concurrency/race-condition tests;
- audit reconstruction tests;
- cross-day/carry-forward scenario proof.

## Current authoritative reconciliation documents

1. `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`
2. `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-GAP-MATRIX-2026-09-17.md`
3. `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-TARGET-ARCHITECTURE-2026-09-17.md`
4. `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DECISION-RECONCILIATION-2026-09-17.md`

## Change log

### 2026-09-17 — Patient Flow architecture reconciliation

The Product Owner clarified the real-world Patient Flow model. The clarification was recorded as approved architecture in CSAPI records CSAPI-017 through CSAPI-028. A dedicated reconciliation document was created. Historical documentation was classified rather than blindly rewritten.

### 2026-09-17 — Patient Flow target architecture specification

The Gate 01 Gap Matrix was converted into a concrete target architecture covering Visit, Clinical Work Session, Queue, Finish, Hold, Transfer, operational handoff, timing policy, operational/admin closure, carry-forward, Follow-up boundary, cross-domain continuity, business audit and database authority. These target technical decisions are recorded as `PROPOSED` pending implementation-stage evidence reconciliation.

### 2026-09-17 — Patient Flow implementation decision reconciliation

The target architecture was reconciled against fresh live Supabase schema, constraint, RLS, function, permission, configuration and repository Work Item evidence. The resulting implementation decisions favor preserving `clinic_visit_sessions`, creating a first-class Work Session and Queue Entry representation, reusing operational Work, introducing tenant-level policy configuration, separating operational/final closure, preserving same-Visit carry-forward, adding business lifecycle events, and enforcing lifecycle authority at the database command boundary. No implementation is authorized by this stage.

## Implementation boundary

No code, migration, permission change, cleanup or production change is authorized merely by these records. Gate 01 remains under investigation until the proposed implementation decisions are explicitly approved and then implemented and verified through the CSAPI process.

**End of Ledger.**
