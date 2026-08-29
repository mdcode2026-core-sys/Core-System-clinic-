# Documentation Status & Authority

**Status:** ACTIVE / Stages 12–15 implementation and validation reconciled; final Production SHA gate PENDING
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
- `docs/STAGE12-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE12-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `docs/STAGE13-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE13-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `docs/STAGE14-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE14-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `docs/STAGE15-DOCUMENTATION-CLOSURE-2026-08-29.md`
- `docs/STAGES12-15-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md`
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
- Stage 7 — Patient Context: CLOSED at scope level; final global production gate remains governed by the current final SHA rule.
- Stage 8 — Global Search: CLOSED at scope level; final global production gate remains governed by the current final SHA rule.
- Stage 9 — Overview / Dashboard Reconciliation: CLOSED at scope level; final global production gate remains governed by the current final SHA rule.
- Stage 10 — Sidebar Finalization: CLOSED at scope level; final global production gate remains governed by the current final SHA rule.
- Stage 11 — Mobile & Language Validation: implementation/CI CLOSED; production deployment had been blocked by Vercel rate-limit state.
- Stage 12 — Security / Permission Regression: implementation/CI PASS; final Production SHA gate PENDING.
- Stage 13 — Runtime / E2E Validation: CI and runtime smoke PASS; final Production SHA gate PENDING.
- Stage 14 — Legacy Cleanup: CI and legacy audit PASS; no unsafe speculative removals made.
- Stage 15 — Documentation Closure: reconciliation candidate in progress; final closure follows the final delivery gate.

## Current production-readiness gate

`Production SHA = final main SHA` is mandatory. Documentation, CI, PR merge or Preview READY status alone cannot produce `Production Ready = YES`.

## Findings governance

Every warning, defect, security issue or architecture conflict must be investigated. Safe/authorized defects are fixed; cross-workstream items are documented with evidence, owner, severity and disposition. Real defects must not be hidden to make CI green.

Stages 12–15 current register: `docs/STAGES12-15-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md`.

## PJ / AJM state

PJ status remains governed by the PJ-MASTER-DOCS and current implementation records. Stages 12–15 did not create duplicate Patient Journey, Treatment Plan, Medical File, Medical Photo, Follow-up or Patient Portal architecture.

AJM status remains governed by `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`. Stages 12–15 did not change AJM domain ownership.

## Schema freshness

`DATABASE_SCHEMA.md` remains the structural schema reference. Stages 12–15 introduced no new database architecture or tenant model.

## Maintenance rule

Every completed Global UX/IA stage updates its implementation record, closure/readiness record, findings register, changelog and handoff when materially applicable. Architecture and schema documents are updated only when architecture/schema changes.

Historical documentation remains under `/archive/` and is not current implementation authority.
