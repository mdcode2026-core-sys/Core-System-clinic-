# Documentation Status & Authority

**Status:** ACTIVE — implementation remediation in progress; 42-scenario closure BLOCKED by documented implementation gaps  
**Last reviewed:** 2026-08-30

This file remains the repository-wide documentation status/freshness authority. `docs/CORE_SYSTEM_INDEX.md` is the canonical navigation index for the current remediation bundle.

## Authority

When documentation and implementation disagree, use:
1. Implemented repository + live Supabase state for implementation/runtime facts.
2. Accepted architectural/product decisions.
3. PJ-MASTER-DOCS / approved PJ decisions.
4. `PROJECT_HANDOFF.md`.
5. `CHANGELOG.md`.
6. Historical reports only as evidence.
7. `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` as current UX/IA authority.
8. For implementation-document remediation requirements, `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md` and its linked matrices are the current contract authority.
9. For current 42-scenario reality state, `docs/IDEAL-SCENARIO-REALITY-VALIDATION-2026-08-30.md` and `docs/IDEAL-SCENARIO-IMPLEMENTATION-GAP-MATRIX-2026-08-30.md` are the evidence records.

## Current remediation bundle

- `docs/CORE_SYSTEM_INDEX.md`
- `docs/IDEAL-OPERATIONAL-ARCHITECTURE-AUDIT-2026-08-30.md`
- `docs/IDEAL-OPERATIONAL-SCENARIOS-2026-08-30.md`
- `docs/IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md`
- `docs/CORE-SYSTEM-SCENARIO-REGISTER-2026-08-30.md`
- `docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-PLAN-2026-08-30.md`
- `docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-RUNBOOK-2026-08-30.md`
- `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`
- `docs/IMPLEMENTATION-DOCUMENT-REMEDIATION-MASTER-MATRIX-2026-08-30.md`
- `docs/FINAL-IMPLEMENTATION-DOCUMENTATION-REMEDIATION-REPORT-2026-08-30.md`
- `docs/IDEAL-SCENARIO-IMPLEMENTATION-GAP-MATRIX-2026-08-30.md`
- `docs/IDEAL-SCENARIO-REALITY-VALIDATION-2026-08-30.md`
- `docs/FINAL-IDEAL-SCENARIO-CLOSURE-REPORT-2026-08-30.md`
- `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`

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
- Ideal scenarios: 42/42 documentary traceability closed; 0/42 runtime-validated; 17 currently blocked.
- Difficult scenarios: 60 preserved and deferred.

## Current production-readiness gate

`Production SHA = final main SHA` remains mandatory for Production Readiness. Deployment success or a READY deployment does not prove scenario validation.

The 2026-08-30 AJM Final Production Closure remains a separate production blocker record and is retained as such.

## Findings governance

Every warning, defect, security issue or architecture conflict must be investigated. Safe/authorized defects are fixed; cross-workstream items are documented with evidence, owner, severity and disposition. Real defects must not be hidden to make CI green.

## PJ / AJM state

PJ status remains governed by PJ-MASTER-DOCS and current implementation records. AJM status remains governed by current AJM status/acceptance records. This phase may implement repairs covered by existing contracts but must not claim scenario/runtime closure without evidence.

## Schema freshness

`DATABASE_SCHEMA.md` remains the structural schema reference. The implementation phase added Service/Package/Offer, skill/qualification, operating-expense and supplier-obligation/payment schema extensions; `DATABASE_SCHEMA.md` must be reconciled before final 42-scenario closure.

## Maintenance rule

Every new remediation document is linked from `docs/CORE_SYSTEM_INDEX.md`. Historical documentation remains preserved and does not regain authority without an explicit current decision/evidence chain.
