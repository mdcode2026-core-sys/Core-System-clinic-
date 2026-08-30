# Documentation Status & Authority

**Status:** ACTIVE — implementation documentation remediation CLOSED; final Production SHA gate remains PENDING  
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
- `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`

## Documentation remediation state

- R12 — Documentation authority / closure: DOCUMENTATION CLOSED.
- R01 — Procedure / Service / Package / Treatment Plan: DOCUMENTATION CLOSED.
- R02 — Treatment Plan → Next Action → Appointment: DOCUMENTATION CLOSED.
- R03 — Package / Financial Plan / Installments / Sessions: DOCUMENTATION CLOSED.
- R04 — Workforce → Availability → Agenda: DOCUMENTATION CLOSED.
- R05 — Staff + Room + Device + Procedure: DOCUMENTATION CLOSED.
- R06 — Insurance lifecycle: DOCUMENTATION CLOSED.
- R07 — Procurement lifecycle: DOCUMENTATION CLOSED.
- R08 — Revenue → Commission → Payroll: DOCUMENTATION CLOSED.
- R09 — Communication → Request → Work: DOCUMENTATION CLOSED.
- R10 — Domain Event → Coordination → Authorized Actor → Completion: DOCUMENTATION CLOSED.
- R11 — Skill / Qualification / Permission: DOCUMENTATION CLOSED.
- Ideal scenarios: 42/42 documentary traceability closed.
- Difficult scenarios: 60 preserved and deferred.

## Global UX/IA and implementation state

The existing Stage/AJM implementation records remain historical/current implementation evidence according to their own acceptance policies. Their `Implemented`, `Validated`, or `Closed` claims are not altered by this documentation phase and are not used as substitutes for the contract evidence defined here.

## Current production-readiness gate

`Production SHA = final main SHA` remains mandatory for Production Readiness. Documentation closure, CI, PR merge or Preview READY status cannot produce `Production Ready = YES`.

The 2026-08-30 AJM Final Production Closure remains a Production blocker record and is retained as such.

## Findings governance

Every warning, defect, security issue or architecture conflict must be investigated. Safe/authorized defects are fixed; cross-workstream items are documented with evidence, owner, severity and disposition. Real defects must not be hidden to make CI green.

## PJ / AJM state

PJ status remains governed by PJ-MASTER-DOCS and current implementation records. AJM status remains governed by current AJM status/acceptance records. This remediation phase does not claim code/runtime closure.

## Schema freshness

`DATABASE_SCHEMA.md` remains the structural schema reference. This documentation phase introduced no database architecture.

## Maintenance rule

Every new remediation document is linked from `docs/CORE_SYSTEM_INDEX.md`. Historical documentation remains preserved and does not regain authority without an explicit current decision/evidence chain.
