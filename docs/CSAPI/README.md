# CORE SYSTEM — CSAPI

Status: CURRENT — Gate 03 implementation complete; verification blocked by failed required E2E
Current Gate: Gate 03 — Patient & Identity
Previous Gate: Gate 02 — Patient Journey — CLOSED / VERIFIED / PRODUCTION VERIFIED

## Start here

1. CSAPI-MASTER-STATE.md
2. CSAPI-GATES-PLAN.md
3. GATES/GATE-03-PATIENT-IDENTITY-ARCHITECTURAL-DECISION-REQUIREMENTS-2026-09-22.md
4. GATES/GATE-03-PATIENT-IDENTITY-RECONCILIATION-REPORT-2026-09-22.md
5. CSAPI-CURRENT-EXECUTION-HANDOFF-2026-09-21.md

## Canonical CSAPI records

- CSAPI-MASTER-STATE.md — current CSAPI state and resume rules
- CSAPI-GATES-PLAN.md — full sequential decision-gate map
- CSAPI-HISTORICAL-BASELINE.md — historical findings and cross-domain baseline
- CSAPI-DECISION-AND-ACTION-LEDGER.md — append-only decisions/evidence/closure record
- CSAPI-CURRENT-EXECUTION-HANDOFF-2026-09-21.md — conversation-independent current handoff
- GATES/GATE-01-CSAPI-MASTER-EXECUTION-ROADMAP-2026-09-19.md — closed Gate 01 roadmap and evidence
- GATES/GATE-01-INTEGRATED-PATIENT-FLOW-VERIFICATION-2026-09-21.md — closed integrated Patient Flow verification
- GATES/GATE-01-FINAL-RELEASE-PRODUCTION-VERIFICATION-2026-09-21.md — closed Gate 01 production verification
- GATES/GATE-02-PATIENT-JOURNEY.md — closed Gate 02 scope and closure record
- GATES/GATE-03-PATIENT-IDENTITY-ARCHITECTURAL-DECISION-REQUIREMENTS-2026-09-22.md — approved Gate 03 architectural baseline
- GATES/GATE-03-PATIENT-IDENTITY-RECONCILIATION-REPORT-2026-09-22.md — full Gate 03 repository/database/runtime reconciliation

## Current resume rule

If a new conversation begins with CSAPI, resume Gate 03 from the active verification blocker. Do not restart Gate 03 architecture, do not begin Gate 04, and do not assume any CLOSED label is authoritative without checking current GitHub Actions, main SHA, Production and Supabase evidence.

Immediate objective: investigate and resolve the required E2E failure, rerun the exact required verification, then reconcile and close Gate 03 only when the full closure rule is satisfied.

## Governing rule

CSAPI is a decision-gate workstream. Existing Patient Journey implementation is evidence to inspect and reuse; Gate 02 is closed. Gate 03 is the current approved architectural baseline; Implementation Design is pending and implementation remains unauthorized until that design is complete and execution is explicitly approved.

Every gate follows:

Study → Verify → Reconcile → Decision Report → Product Owner Approval → Implement → Validate → Document → Close

No implementation begins from an unapproved proposal.


 
## Active continuation — Gate 04

**Current authority:** Gate 04 — Agenda & Scheduling is OPEN and not closed. Older Gate 03 status text above is historical and must not govern current execution.

Before resuming, read `CSAPI-GATE-04-CONTINUATION-HANDOFF-2026-10-11.md`, then `CSAPI-MASTER-STATE.md`, `CSAPI-GATES-PLAN.md`, the AI Engineering Master Prompt, the binding Gate 04 execution contract, Verification Plan, descriptor, progress/evidence records, and execution handoff/ledger.

Current branch: `csapi/gate04-agenda-implementation-2026-10-10`; PR #242 remains Draft and unmerged. Latest candidate recorded in the handoff: `fe4f4d2b34b546540236102cd469946dcab4a59d`; Workstream Verification #984 failed. Continue from the exact failure and next action in the handoff, not from stale status summaries.

The Product Owner has approved minimum Follow-up appointment-request → Agenda handoff as required Gate 04 scope. Do not ask for this decision again. Gate 11 remains separate and its lifecycle is out of scope.

