# CSAPI — Decision & Action Ledger

**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`
**Purpose:** durable record of what CSAPI discovered, proposed, approved, implemented, verified, deferred, or rejected.

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
| CSAPI-006 | Gate 01 | BASELINE | APPROVED | Known visit lifecycle baseline is Queue → Clinical Visit → Pending Close → Reception Workflow → Completed. |
| CSAPI-007 | Gate 01 | IMPLEMENTATION | REQUIRES-VERIFICATION | Current live/repository implementation must be reconciled against the Patient Flow baseline before implementation decisions are made. |
| CSAPI-008 | Gate 01 | EVIDENCE | OBSERVED | Current repository has a single explicit transition validator in `queueEngine`; reviewed UI boards do not replace the server-side transition authority. |
| CSAPI-009 | Gate 01 | EVIDENCE | OBSERVED | Clinical completion saves clinical documentation and then calls the canonical `transitionToPendingReception()` path. |
| CSAPI-010 | Gate 01 | EVIDENCE | OBSERVED | Live `clinic_visit_sessions` contains 138 completed sessions and 1 stale waiting session; no current `pending_close`, `in_consultation`, `cancelled`, or `no_show` records were observed. |
| CSAPI-011 | Gate 01 | EVIDENCE | OBSERVED | Live Agenda↔Visit linked-status reconciliation returned zero mismatches across 138 linked sessions; tested session cross-domain tenant relationships also returned zero mismatches. |
| CSAPI-012 | Gate 01 | GAP | REQUIRES-VERIFICATION | Existing-session `registerPatientArrival()` can write `session_status = waiting` without the transition validator; exact intended semantics must be established before changing it. |
| CSAPI-013 | Gate 01 | GAP | REQUIRES-VERIFICATION | `fn_set_session_buffer()` and `fn_set_auto_close()` establish buffer/auto-close semantics whose relationship to the application completion timestamps is not yet unambiguously defined. |
| CSAPI-014 | Gate 01 | GAP | REQUIRES-VERIFICATION | Audit trigger coverage exists for session updates, but semantic completeness of lifecycle transition auditing has not yet been established. |
| CSAPI-015 | Gate 01 | EVIDENCE | OBSERVED | Treatment Plan and Procedure remain separate visit-linked domains; live schema does not make Treatment Plan mandatory for a visit. |
| CSAPI-016 | Gate 01 | EVIDENCE | OBSERVED | Follow-up remains a downstream domain; live follow-ups can reference completed sessions and no reviewed trigger directly mutates Patient Flow session state from follow-up changes. |

## Current unresolved decision areas

These are investigation targets, not approved changes:

- exact boundaries between Queue, Clinical Visit, Pending Close, Reception Workflow and Completed;
- exact semantics of existing-session arrival/reset behavior;
- exact semantics of `buffer_window_expires_at` and `auto_close_at`;
- Procedure/Session relationship to the visit lifecycle;
- Treatment Plan relationship to Patient Flow without making it mandatory for every visit;
- Next Action and follow-up handoff boundaries;
- reception responsibility and completion semantics;
- patient context preservation across transitions;
- permissions/actor responsibilities for each transition;
- tenant/branch integrity at transition boundaries;
- audit requirements for state changes;
- runtime/manual verification of scheduled and walk-in flows;
- current UI/workspace representation versus product workflow semantics.

## Change log

### 2026-09-17 — Documentation hardening

Created the durable CSAPI Master State, Gate Plan, Historical Investigation Baseline, and Decision/Action Ledger on the canonical CSAPI branch so a future conversation can reconstruct the work from repository state rather than conversation memory.

### 2026-09-17 — Gate 01 evidence reconciliation started

Recorded the first repository/live-database evidence pass in `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-EVIDENCE-2026-09-17.md`. No Product Owner decision was proposed and no implementation change was made. Gate 01 remains UNDER REVIEW.

### Next required ledger entry

Continue Gate 01 evidence reconciliation. Only after the evidence pass is complete should explicit `PROPOSED` records be created for decisions that genuinely require Product Owner approval.
