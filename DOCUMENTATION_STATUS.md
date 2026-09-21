# Documentation Status & Authority

Status: ACTIVE — current architecture/runtime closure and CSAPI transition state are governed by their applicable evidence gates
Last reviewed: 2026-09-21

This file remains the repository-wide documentation status/freshness authority. CORE_SYSTEM_INDEX.md is the canonical navigation index for the current remediation and decision-gate bundle.

## 2026-09-21 CSAPI transition

CSAPI Gate 01 — Patient Flow is CLOSED.

CSAPI Gate 02 — Patient Journey is OPEN — PRECHECK READY.

Current CSAPI authority:
- docs/CSAPI/CSAPI-MASTER-STATE.md
- docs/CSAPI/CSAPI-GATES-PLAN.md
- docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md
- docs/CSAPI/CSAPI-CURRENT-EXECUTION-HANDOFF-2026-09-21.md
- docs/CSAPI/GATES/GATE-02-PATIENT-JOURNEY.md
- docs/testing/workstream-contracts/csapi-gate02-patient-journey.execution.json

Gate 02 scope is longitudinal patient lifecycle over time; next actions and continuity. It does not rebuild Patient Journey Stage 0–15 and does not reopen Gate 01 Patient Flow authority.

The Gate 01 Agenda-only production observation remains explicitly classified as an external Agenda-domain observation and is not silently converted into CSAPI Gate 02 implementation work.

## Global Surfaces Documentation Reconciliation

The 2026-09-11 canonical interpretation remains authoritative for Header, Home, Role Workspace, My Workspace, Sidebar, Role/Primary Work Context, Permissions, Widgets, Communications/Chat/Notifications and My Settings.

Additional permissions do not redefine the user's Primary Role, Primary Work Context or Role Workspace.

Home is independent from the primary Role Workspace and My Workspace.

## Authority

When documentation and implementation disagree, use:
1. Implemented repository + live Supabase state for implementation/runtime facts.
2. Accepted architectural/product decisions.
3. Current PJ master/approved PJ decisions.
4. PROJECT_HANDOFF.md.
5. CHANGELOG.md.
6. Current CSAPI gate records and evidence.
7. Historical reports only as evidence.

## Current remediation bundle

The existing remediation bundle remains active. Cross-domain documentation does not authorize unrelated implementation changes.

## Documentation remediation state

- R12 — Documentation authority / closure: DOCUMENTATION CLOSED.
- R01 — Procedure / Service / Package / Treatment Plan: DOCUMENTATION CLOSED; implementation remediation active.
- R02 — Treatment Plan → Next Action → Appointment: DOCUMENTATION CLOSED; implementation blocker recorded.
- R03 — Package / Financial Plan / Installments / Sessions: DOCUMENTATION CLOSED; implementation blocker recorded.
- R04 — Workforce → Availability → Agenda: DOCUMENTATION CLOSED; implementation repair applied.
- R05 — Staff + Room + Device + Procedure: DOCUMENTATION CLOSED; skill/qualification foundation and eligibility repair applied.
- R06 — Insurance lifecycle: DOCUMENTATION CLOSED; reconciliation blocker recorded.
- R07 — Procurement lifecycle: DOCUMENTATION CLOSED; supplier obligation/payment foundation added; integration blocker remains.
- R08 — Revenue → Commission → Payroll: DOCUMENTATION CLOSED; collected-payment commission path added; validation pending.
- R09 — Communication → Request → Work: DOCUMENTATION CLOSED; implementation exists; validation pending.
- R10 — Domain Event → Coordination → Authorized Actor → Completion: DOCUMENTATION CLOSED; permission repair applied; universal event handoff blocker remains.
- R11 — Skill / Qualification / Permission: DOCUMENTATION CLOSED; implementation foundation added; seeded/E2E validation pending.

## PJ / AJM status

PJ workflow ownership remains governed by the approved PJ source documents and current implementation state. AJM remains governed by its current status/acceptance records.

PJ Stage 0–15 history must not be reopened merely because CSAPI Gate 02 is named Patient Journey.

## Production-readiness rule

Production readiness requires the exact promoted application SHA, applicable CI evidence, deployment state and runtime evidence to agree. Deployment success alone is not acceptance.

## Schema freshness

DATABASE_SCHEMA.md remains the structural schema reference and must be reconciled against live schema for schema-sensitive work.

## Maintenance rule

Every new reconciliation/authority document must be linked from CORE_SYSTEM_INDEX.md. Historical documentation remains preserved and does not regain current authority without an explicit current decision/evidence chain.
