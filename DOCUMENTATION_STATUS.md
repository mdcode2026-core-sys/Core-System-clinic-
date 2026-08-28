# Documentation Status & Authority

**Status:** ACTIVE / CURRENT UX/IA STAGE 3 DOCUMENTED
**Last reviewed:** 2026-08-28

This file is the repository documentation authority and freshness registry.

## 1. Authority Rule

When documentation and implementation disagree:

1. **Implemented repository + live Supabase state** = current implementation reality.
2. **Accepted architectural decisions** = governing intent, unless later superseded.
3. **PJ-MASTER-DOCS / approved PJ decisions** = governing Patient Journey scope and workflow.
4. **PROJECT_HANDOFF.md** = current operational summary.
5. **CHANGELOG.md** = historical change evidence.
6. Historical reports and old implementation packages are evidence only.
7. `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` = current UX/IA authority.

## 2. Current Canonical Documents

- `ENGINEERING_CONSTITUTION.md` — engineering governance.
- `ARCHITECTURE_DECISIONS.md` — chronological architecture decisions.
- `MASTER_ROADMAP.md` — current product roadmap.
- `PROJECT_HANDOFF.md` — current living implementation handoff.
- `CHANGELOG.md` — historical implementation changes.
- `DATABASE_SCHEMA.md` — current structural schema reference.
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` — current UX/IA authority.
- `GLOBAL_UX_IA_IMPLEMENTATION_PLAN_2026-08-28.md` — UX/IA implementation plan.
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md` — approved UX/IA execution plan.
- `docs/GLOBAL-UX-IA-STAGE-3-WORKSPACE-FOUNDATION-2026-08-28.md` — Stage 3 implementation record.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.
- `PJ_E2E_DEMO_DATASET.md` — persistent PJ E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — Stage 15 closure evidence.
- `DOCUMENTATION_STATUS.md` — this registry.
- `DOCUMENTATION_CONSOLIDATION_PLAN.md` — completed cleanup record.

## 3. Current Global UX/IA State

- Stage 0 — Baseline Lock: implemented/documented.
- Stage 1 — Navigation & IA Reconciliation: implemented/documented.
- Stage 2 — User Surface Model: implemented; runtime validation remains a separate recorded gate.
- Stage 3 — Workspace Foundation: implemented on branch `feat/global-ux-stage-3-workspace-foundation`; runtime validation remains the final closure gate until a READY deployment containing the final head is verified.

Stage 3 uses the existing Workspace engine/renderer/registry and does not create a parallel Workspace system.

## 4. PJ Current State

- Stages 0–10: closed.
- Stage 11: closed.
- Stage 12: phase-closed after manual verification; Patient Portal architecture remains governed by `ADR-012-PATIENT-PORTAL.md`.
- Stage 13: completed.
- Stage 14: completed; temporary Stage 14 seed removed.
- Stage 15: completed for current scope; persistent integrated E2E data retained for future administrative stages.

Do not infer PJ status from archived Milestone/Session documents.

## 5. AJM Current State

Current AJM status is governed by `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`.

Stage 3 does not reopen or close AJM stages and does not change AJM Domain ownership.

## 6. Archived Documentation

Superseded root-level artifacts have been moved to `/archive/`, including old dated handoffs, analytics/queue progress logs, Kimi implementation packages, old security planning/audit documents, old roadmap/design snapshots and the obsolete Supabase data dump.

Archived documents are historical evidence only and must not be used as current implementation instructions.

## 7. E2E Data Contract

`PJ_E2E_DEMO_DATASET.md` is the persistent synthetic dataset contract covering patients, appointments, visits, procedures, multi-stage treatment plans, treatment-plan items, medical files, follow-ups and notifications.

Extend this labelled dataset for future scenarios instead of introducing random disposable fixtures.

## 8. Schema Freshness

`DATABASE_SCHEMA.md` was reconciled against live Supabase on 2026-08-24. It remains a structural reference and must be refreshed after schema-changing work.

Stage 3 introduced no database schema change.

## 9. Maintenance Rule

Every completed PJ stage must update, as applicable:

- stage closure record;
- `CHANGELOG.md`;
- `PROJECT_HANDOFF.md` when current state changes materially;
- relevant ADRs when architecture changes;
- `PJ_E2E_DEMO_DATASET.md` when E2E coverage changes;
- `DATABASE_SCHEMA.md` when schema changes.

For Global UX/IA stages, update the applicable stage record, `PROJECT_HANDOFF.md`, `CHANGELOG.md` and this registry when current implementation state changes materially.

Do not create new dated handoff/progress documents in the root for routine work.

## 10. Cleanup Result

The repository root is reserved for current/canonical documentation. Historical documentation is retained under `/archive/` and is no longer part of the active documentation surface.
