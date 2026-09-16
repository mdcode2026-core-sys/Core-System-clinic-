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

## Current unresolved decision areas

These are investigation targets, not approved changes:

- exact boundaries between Queue, Clinical Visit, Pending Close, Reception Workflow and Completed;
- Procedure/Session relationship to the visit lifecycle;
- Treatment Plan relationship to Patient Flow without making it mandatory for every visit;
- Next Action and follow-up handoff boundaries;
- reception responsibility and completion semantics;
- patient context preservation across transitions;
- permissions/actor responsibilities for each transition;
- tenant/branch integrity at transition boundaries;
- audit requirements for state changes;
- current UI/workspace representation versus product workflow semantics.

## Change log

### 2026-09-17 — Documentation hardening

Created the durable CSAPI Master State, Gate Plan, Historical Investigation Baseline, and Decision/Action Ledger on the canonical CSAPI branch so a future conversation can reconstruct the work from repository state rather than conversation memory.

### Next required ledger entry

After Gate 01 verification is performed, replace `CSAPI-007` with the verified findings and create explicit `PROPOSED` records only for decisions that require Product Owner approval.
