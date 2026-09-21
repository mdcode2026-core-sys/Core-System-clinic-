# CORE SYSTEM — CSAPI HISTORICAL INVESTIGATION BASELINE

Purpose: Preserve useful knowledge from earlier investigations while keeping historical branches, PRs and status claims separate from current CSAPI execution.

## 1. Historical source relationship

Earlier post-129 investigation work produced broad system reconciliation/build findings. CSAPI inherits relevant questions and evidence only. It does not inherit old branch lineage or treat old PR numbers as execution state.

## 2. Important historical conclusions carried into CSAPI

- CORE SYSTEM is intended as an integrated clinic operating platform with independent but connected domains.
- Agenda is a scheduling authority and must remain so.
- Patient mutations have historically crossed more than one boundary and require explicit ownership reconciliation.
- Financial, analytics, follow-up, communications, workforce, inventory and medical-file implementations already contain substantial functionality.
- Workflow behavior is distributed across application actions/services, PostgreSQL functions/triggers/cron, queues, operational work and RLS; no universal workflow engine should be assumed.
- API architecture has historical inconsistencies and must be inspected rather than normalized blindly.
- Permission architecture contains roles, permissions, overrides, effective-permission functions and subscription boundaries; current authority must be verified.
- Live schema, migration history, repository and documentation have historically drifted; current reality is authoritative.
- Historical advisor findings are investigation inputs, not automatic exploit/blocker proof.
- Patient Flow is an internal workflow; Agenda is scheduling authority; Communications owns communications; Chat is a surface over Communications.

## 3. Cross-domain longitudinal reference

First Contact → Patient Identity → Service/Procedure → Booking → Capacity Check → Confirmation → Arrival → Patient Flow/Visit → Clinical Decision → Treatment Plan → Next Action → Appointment → Procedure/Session → Financial Commitment → Payment/Insurance → Resource Consumption → Follow-up → Next Journey Action → Completion

This chain is an integration reference. It is not a second runtime engine.

## 4. Patient Journey historical implementation context

The approved PJ documentation package defines a 0–15 implementation sequence:

0 Reality/Documentation → 1 Foundation → 2 Patient/Registration → 3 Medical Master/Service Catalog → 4 Agenda → 5 Room/Resource → 6 Queue/Reception → 7 Doctor Visit → 8 Treatment Plan → 9 Follow-up → 10 Automated Follow-up → 11 Medical Photos (parallel/non-blocking) → 12 Patient Portal → 13 Full Integration → 14 E2E Validation → 15 Documentation/Closure

Current repository PJ records state that these stages were implemented/reconciled at the PJ workstream level. Therefore CSAPI Gate 02 must not interpret Patient Journey as a request to rebuild those stages.

## 5. Current Gate 01 result

Gate 01 — Patient Flow is CLOSED.

Its final canonical in-clinic path is:

Reception → Waiting → Clinical Pull → Clinical Work → Finish → Pending Close → Reception Completion → Completed

This closes the lifecycle write-authority problem for the in-clinic flow. Longitudinal continuation after that flow is intentionally a separate question.

## 6. Gate 01 inherited observations for future work

- Run #657 proved the D3 lifecycle, state/projection/event consistency, tenant isolation, authorization boundaries, concurrency and idempotency on the final implementation lineage.
- Production Gate 01 verification proved the deployed Patient Flow route and production D2/D3 state.
- A broad Clinic Admin Production Runtime workflow retained an Agenda-only lifecycle failure. It is documented as outside Gate 01 and must not be hidden or converted into a fake Patient Flow defect.
- Open PRs were reduced to zero during this conversation. Historical branch refs may remain, but no CSAPI implementation is pending in an open PR.

## 7. Gate 02 relevance

Gate 02 is the next sequential CSAPI gate because the supplied plan defines it as:

Longitudinal patient lifecycle over time; next actions and continuity.

The important question is now not whether a patient can move through one in-clinic Visit, but whether the system can maintain a truthful, auditable continuity chain across repeated interactions without duplicating ownership.

## 8. Documentation rule

Historical reports may remain preserved. They do not regain authority merely because they carry CLOSED, FINAL or newer-looking wording. Current repository/database/runtime evidence plus current accepted decisions determine present reality.
