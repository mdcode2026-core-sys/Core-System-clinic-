# Documentation Status & Authority

**Status:** ACTIVE / CURRENT UX/IA STAGE 5 DOCUMENTED
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
- `docs/GLOBAL-UX-IA-EXECUTION-PLAN-STAGE-5-UPDATE-2026-08-28.md` — Stage 5 plan/update and workflow governance.
- `docs/GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md` — Stage 5 implementation record.
- `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` — findings requiring repair/reconciliation in their owning workstreams.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.
- `PJ_E2E_DEMO_DATASET.md` — persistent PJ E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — Stage 15 closure evidence.
- `DOCUMENTATION_STATUS.md` — this registry.
- `DOCUMENTATION_CONSOLIDATION_PLAN.md` — completed cleanup record.

## 3. Current Global UX/IA State

- Stage 0 — Baseline Lock: implemented/documented.
- Stage 1 — Navigation & IA Reconciliation: implemented/documented.
- Stage 2 — User Surface Model: implemented/documented; runtime validation remains governed by the applicable validation gate.
- Stage 3 — Workspace Foundation: implemented/documented; canonical Workspace engine/renderer/registry/persistence retained.
- Stage 4 — Workspace Personalization: implemented/documented; canonical Workspace persistence and personalization retained.
- Stage 5 — Widget Library & Classification: **IMPLEMENTED / CI VALIDATED / DOCUMENTED**. The seven currently registered Widgets have governed classification metadata and automated catalog validation. Stage 5 does not grant authorization, recreate Domains, or replace Patient Flow.

### Stage 5 validation model

The repository's `.github/workflows/ux-stages-0-4-ci.yml` is now the shared **UX Stages 0–5 Pre-deployment Validation** workflow. It performs immutable pre-deployment validation before Vercel is used for runtime evidence:

- lockfile synchronization check;
- `npm ci`;
- TypeScript;
- I18N audit;
- I18N parity;
- Stage 5 Widget Catalog audit;
- Stage 0–5 changed-surface ESLint;
- production build.

A successful CI run is required before deployment. Vercel is not used for small/early checks.

## 4. Findings Governance Rule

During any stage, every discovered warning, error, security/dependency issue, architectural inconsistency or documentation conflict must be investigated.

The executor must:

1. determine whether it is a real defect;
2. determine its owning workstream/domain;
3. repair it immediately when safe and authorized;
4. otherwise document it in a findings register with evidence, impact, owner and recommended disposition;
5. never suppress a real defect merely to make CI green;
6. return unresolved findings for explicit disposition when required.

Stage 5's unrelated findings are recorded in `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` and must not be silently forgotten.

## 5. PJ Current State

- Stages 0–10: closed.
- Stage 11: closed.
- Stage 12: phase-closed after manual verification; Patient Portal architecture remains governed by `ADR-012-PATIENT-PORTAL.md`.
- Stage 13: completed.
- Stage 14: completed; temporary Stage 14 seed removed.
- Stage 15: completed for current scope; persistent integrated E2E data retained for future administrative stages.

Do not infer PJ status from archived Milestone/Session documents.

## 6. AJM Current State

Current AJM status is governed by `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`.

Global UX/IA stages do not reopen or close AJM stages unless the stage explicitly changes an AJM implementation or status. AJM Domain ownership remains unchanged.

## 7. Archived Documentation

Superseded root-level artifacts have been moved to `/archive/`, including old dated handoffs, analytics/queue progress logs, Kimi implementation packages, old security planning/audit documents, old roadmap/design snapshots and the obsolete Supabase data dump.

Archived documents are historical evidence only and must not be used as current implementation instructions.

## 8. E2E Data Contract

`PJ_E2E_DEMO_DATASET.md` is the persistent synthetic dataset contract covering patients, appointments, visits, procedures, multi-stage treatment plans, treatment-plan items, medical files, follow-ups and notifications.

Extend this labelled dataset for future scenarios instead of introducing random disposable fixtures.

## 9. Schema Freshness

`DATABASE_SCHEMA.md` was reconciled against live Supabase on 2026-08-24. It remains a structural reference and must be refreshed after schema-changing work.

Stage 5 introduced no database schema change.

## 10. Maintenance Rule

Every completed PJ stage must update, as applicable:

- stage closure record;
- `CHANGELOG.md`;
- `PROJECT_HANDOFF.md` when current state changes materially;
- relevant ADRs when architecture changes;
- `PJ_E2E_DEMO_DATASET.md` when E2E coverage changes;
- `DATABASE_SCHEMA.md` when schema changes.

For Global UX/IA stages, update the applicable stage record, execution-plan update, `PROJECT_HANDOFF.md`, `CHANGELOG.md` and this registry when current implementation state changes materially.

Do not create new dated handoff/progress documents in the root for routine work.

## 11. Cleanup Result

The repository root is reserved for current/canonical documentation. Historical documentation is retained under `/archive/` and is no longer part of the active documentation surface.
