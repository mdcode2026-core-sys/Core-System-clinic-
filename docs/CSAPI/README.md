# CORE SYSTEM — CSAPI

Status: CURRENT — Gate 02 pre-stage ready
Current Gate: Gate 02 — Patient Journey
Previous Gate: Gate 01 — Patient Flow — CLOSED

## Start here

1. CSAPI-MASTER-STATE.md
2. CSAPI-GATES-PLAN.md
3. GATES/GATE-02-PATIENT-JOURNEY.md
4. CSAPI-CURRENT-EXECUTION-HANDOFF-2026-09-21.md

## Canonical CSAPI records

- CSAPI-MASTER-STATE.md — current CSAPI state and resume rules
- CSAPI-GATES-PLAN.md — full sequential decision-gate map
- CSAPI-HISTORICAL-BASELINE.md — historical findings and cross-domain baseline
- CSAPI-DECISION-AND-ACTION-LEDGER.md — append-only decisions/evidence/closure record
- CSAPI-CURRENT-EXECUTION-HANDOFF-2026-09-21.md — conversation-independent current handoff
- GATES/GATE-01-CSAPI-MASTER-EXECUTION-ROADMAP-2026-09-19.md — closed Gate 01 roadmap and evidence
- GATES/GATE-01-INTEGRATED-PATIENT-FLOW-VERIFICATION-2026-09-21.md — closed integrated Patient Flow verification
- GATES/GATE-01-FINAL-RELEASE-PRODUCTION-VERIFICATION-2026-09-21.md — closed Gate 01 production verification
- GATES/GATE-02-PATIENT-JOURNEY.md — current Gate 02 scope and precheck contract

## Governing rule

CSAPI is a decision-gate workstream. Existing Patient Journey implementation is evidence to inspect and reuse; Gate 02 does not authorize rebuilding Patient Journey or creating a second journey engine.

Every gate follows:

Study → Verify → Reconcile → Decision Report → Product Owner Approval → Implement → Validate → Document → Close

No implementation begins from an unapproved proposal.
