# CORE SYSTEM — CSAPI

Status: CURRENT — Gate 03 decision ready
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

## Governing rule

CSAPI is a decision-gate workstream. Existing Patient Journey implementation is evidence to inspect and reuse; Gate 02 is closed. Gate 03 is the current decision-ready gate and does not authorize implementation until its approved baseline is applied through the normal execution sequence.

Every gate follows:

Study → Verify → Reconcile → Decision Report → Product Owner Approval → Implement → Validate → Document → Close

No implementation begins from an unapproved proposal.
