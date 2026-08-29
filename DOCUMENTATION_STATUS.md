# Documentation Status & Authority

**Status:** ACTIVE / Global UX/IA Stage 11 CLOSED — PRODUCTION READY
**Last reviewed:** 2026-08-29

This file is the repository documentation authority and freshness registry.

## Authority

When documentation and implementation disagree, use:
1. Implemented repository + live Supabase state.
2. Accepted architectural decisions.
3. PJ-MASTER-DOCS / approved PJ decisions.
4. `PROJECT_HANDOFF.md`.
5. `CHANGELOG.md`.
6. Historical reports only as evidence.
7. `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` as current UX/IA authority.

## Canonical documents

- `ENGINEERING_CONSTITUTION.md`
- `ARCHITECTURE_DECISIONS.md`
- `MASTER_ROADMAP.md`
- `PROJECT_HANDOFF.md`
- `CHANGELOG.md`
- `DATABASE_SCHEMA.md`
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `docs/STAGE-11-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE-11-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md`
- `docs/STAGE-11-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `.github/workflows/stage11-validation.yml`
- `tools/mobile-responsive-stage11-audit.mjs`
- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`
- `PJ_E2E_DEMO_DATASET.md`
- `ADR-012-PATIENT-PORTAL.md`

## Global UX/IA state

- Stage 0 — Baseline Lock: implemented/documented.
- Stage 1 — Navigation & IA Reconciliation: implemented/documented.
- Stage 2 — User Surface Model: implemented/documented.
- Stage 3 — Workspace Foundation: implemented/documented.
- Stage 4 — Workspace Personalization: implemented/documented.
- Stage 5 — Widget Library & Classification: implemented / CI validated / documented.
- Stage 6 — Patient Flow: implemented / CI validated / documented.
- Stage 7 — Patient Context: **CLOSED / PRODUCTION READY**.
- Stage 8 — Global Search: **CLOSED / PRODUCTION READY**.
- Stage 9 — Overview / Dashboard Reconciliation: **CLOSED / PRODUCTION READY**.
- Stage 10 — Sidebar Finalization: **CLOSED / PRODUCTION READY**.
- Stage 11 — Mobile & Language Validation: **CLOSED / PRODUCTION READY**.

Stage 11 final main SHA: `72342418084722a503b55304ac273e1f19fa9c99`.

## Findings governance

Every warning, defect, security issue or architecture conflict must be investigated. Safe/authorized defects are fixed; cross-workstream items are documented with evidence, owner, severity and disposition. Real defects must not be hidden to make CI green.

Stage 11 has no blocker. `S11-F-001` records pre-existing repository-wide ESLint diagnostic debt as cross-workstream deferred work; the blocking Stage 11 changed-surface ESLint gate passed.

## PJ / AJM state

PJ status remains governed by the PJ-MASTER-DOCS and current implementation records. Stage 11 did not change PJ workflow ownership.

AJM status remains governed by `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`. Stage 11 did not change AJM Domain ownership.

## Schema freshness

`DATABASE_SCHEMA.md` remains the structural schema reference. Stage 11 introduced no database migration or Supabase schema/RLS/function/Auth change.

## Maintenance rule

Every completed Global UX/IA stage updates its implementation record, closure/readiness record, findings register, changelog and handoff when materially applicable. Architecture and schema documents are updated only when architecture/schema changes.

Historical documentation remains under `/archive/` and is not current implementation authority.
