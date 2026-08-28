# Documentation Status & Authority

**Status:** ACTIVE / Global UX/IA Stage 9 implementation merged; production closure pending final deployment verification
**Last reviewed:** 2026-08-29

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
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md` — approved UX/IA execution plan.
- `docs/GLOBAL-UX-IA-STAGE-9-EXECUTION-ADDENDUM-2026-08-29.md` — Stage 9 execution reconciliation against the approved plan.
- `docs/STAGE-9-IMPLEMENTATION-RECORD-2026-08-29.md` — Stage 9 implementation and validation record.
- `docs/STAGE-9-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md` — Stage 9 finding disposition.
- `docs/STAGE-9-CLOSURE-PRODUCTION-READINESS-2026-08-29.md` — final Stage 9 closure/readiness record.
- `docs/STAGE-8-IMPLEMENTATION-RECORD-2026-08-29.md` — Stage 8 implementation, validation and closure record.
- `docs/STAGE-8-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md` — Stage 8 finding disposition.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.
- `PJ_E2E_DEMO_DATASET.md` — persistent PJ E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — Stage 15 closure evidence.
- `DOCUMENTATION_STATUS.md` — this registry.
- `DOCUMENTATION_CONSOLIDATION_PLAN.md` — completed cleanup record.

## 3. Current Global UX/IA State

- Stage 0 — Baseline Lock: implemented/documented.
- Stage 1 — Navigation & IA Reconciliation: implemented/documented.
- Stage 2 — User Surface Model: implemented/documented.
- Stage 3 — Workspace Foundation: implemented/documented; canonical Workspace engine/renderer/registry/persistence retained.
- Stage 4 — Workspace Personalization: implemented/documented; canonical Workspace persistence and personalization retained.
- Stage 5 — Widget Library & Classification: implemented / CI validated / documented.
- Stage 6 — Patient Flow: implemented / CI validated / documented.
- Stage 7 — Patient Context: **CLOSED / PRODUCTION READY**.
- Stage 8 — Global Search: **CLOSED / PRODUCTION READY**.
- Stage 9 — Overview / Dashboard Reconciliation: **IMPLEMENTED / CI VALIDATED / MERGED; FINAL PRODUCTION CLOSURE PENDING**.

### Stage 9 validation model

Stage 9 uses a dedicated blocking validation workflow plus the existing Stage 0–8 validation lineage. The Stage 9 candidate passed lockfile verification, `npm ci`, TypeScript, i18n audit/parity, Stage 5–8 audits, Stage 9 audit, changed-surface ESLint and production build.

Stage 9 implementation evidence:

- Validated implementation SHA: `65988b160136546d3b7c04cce1606c436c3d0529`.
- Merged `main` SHA: `d85358577e84e6c6ed6a32fb13ca41751369d40d`.
- Vercel preview deployment for the implementation SHA: READY.
- No Stage 9 database migration was required.

## 4. Findings Governance Rule

During any stage, every discovered warning, error, security/dependency issue, architectural inconsistency or documentation conflict must be investigated.

The executor must:

1. determine whether it is a real defect;
2. determine its owning workstream/domain;
3. repair it immediately when safe and authorized;
4. otherwise document it in a findings register with evidence, impact, owner and recommended disposition;
5. never suppress a real defect merely to make CI green;
6. return unresolved findings for explicit disposition when required.

Stage 8 has no unresolved blocker. S8-F-001 is explicitly deferred to AJM / Tenant Administration and Medical Master Library as a future cross-workstream refinement. S8-F-002 is resolved.

Stage 9 has no unresolved Stage 9 blocker. S9-F-001 records pre-existing repository-wide ESLint debt as non-blocking cross-workstream work; S9-F-002 records historical runtime signatures not reproduced on the validated current deployment; S9-F-003 confirms no database change was required.

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

Superseded root-level artifacts have been moved to `/archive/`. Archived documents are historical evidence only and must not be used as current implementation instructions.

## 8. E2E Data Contract

`PJ_E2E_DEMO_DATASET.md` is the persistent synthetic dataset contract covering patients, appointments, visits, procedures, multi-stage treatment plans, treatment-plan items, medical files, follow-ups and notifications.

Extend this labelled dataset for future scenarios instead of introducing random disposable fixtures.

## 9. Schema Freshness

`DATABASE_SCHEMA.md` was reconciled against live Supabase on 2026-08-24. It remains a structural reference and must be refreshed after schema-changing work.

Stage 9 introduced no database schema change.

## 10. Maintenance Rule

Every completed Global UX/IA stage must update, as applicable:

- stage closure record;
- `CHANGELOG.md`;
- `PROJECT_HANDOFF.md` when current state changes materially;
- relevant ADRs when architecture changes;
- `DATABASE_SCHEMA.md` when schema changes.

Stage 9 implementation, finding disposition, and execution addendum are now recorded. Final closure/readiness is recorded only after the final production verification gate passes.

## 11. Cleanup Result

The repository root is reserved for current/canonical documentation. Historical documentation is retained under `/archive/` and is no longer part of the active documentation surface.
