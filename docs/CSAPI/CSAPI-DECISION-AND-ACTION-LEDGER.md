# CSAPI — Decision & Action Ledger

**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`  
**Current Gate 01 reconciliation branch:** `architecture/csapi-gate-01-patient-flow-architecture-reconciliation-2026-09-17`  
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

## Current unresolved engineering verification areas

These are not product decisions; they are investigation targets:

- how the existing `clinic_visit_sessions` model represents Visit versus Clinical Work Session;
- whether current procedure/session relationships already provide the required separation;
- how Queue ordering and room routing are currently represented;
- how Hold is represented or must be represented;
- how Transfer and multi-session continuation are represented;
- how operational work ownership/reassignment is represented;
- how operational closure and administrative closure are represented;
- how end-of-day carry-forward is represented;
- exact trigger/timestamp semantics for buffer and auto-close fields;
- full transition/actor/permission matrix;
- RLS protection against direct lifecycle bypass;
- audit reconstruction across state changes, handoffs, reassignment and administrative actions;
- scheduled, walk-in, urgent, multi-procedure, Hold, return, transfer and cross-day runtime flows.

## Current authoritative reconciliation document

`docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`

This document is the current Gate 01 interpretation layer for the expanded Patient Flow architecture until a later explicit Product Owner decision supersedes it.

## Change log

### 2026-09-17 — Patient Flow architecture reconciliation

The Product Owner clarified the real-world Patient Flow model. The clarification was recorded as approved architecture in CSAPI records CSAPI-017 through CSAPI-028. A dedicated reconciliation document was created. Historical documentation was classified rather than blindly rewritten.

## Implementation boundary

No code, migration, permission change, cleanup or production change is authorized merely by these records. Gate 01 remains under investigation until repository/live evidence is reconciled against the approved architecture.

**End of Ledger.**
