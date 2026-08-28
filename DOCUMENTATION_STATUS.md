# Documentation Status & Authority

**Status:** ACTIVE / Global UX/IA Stage 8 CLOSED — PRODUCTION READY
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
- `GLOBAL_UX_IA_IMPLEMENTATION_PLAN_2026-08-28.md` — UX/IA implementation plan.
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md` — approved UX/IA execution plan.
- `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` — Stage 5 findings requiring owning-workstream repair/reconciliation.
- `docs/STAGE-7-IMPLEMENTATION-RECORD-2026-08-28.md` — Stage 7 implementation and production-readiness record.
- `docs/STAGE-7-UNRESOLVED-FINDINGS-REGISTER-2026-08-28.md` — Stage 7 finding disposition.
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

### Stage 8 validation model

Stage 8 uses the shared UX validation workflow plus a dedicated Stage 8 validation workflow. Required Stage 5–8 audits, TypeScript, i18n audits/parity, changed-surface ESLint and production build passed for the validated application lineage. Vercel Git integration is the production deployment authority for `main`; no `VERCEL_TOKEN` repository secret is required.

Final Stage 8 production evidence:

- Production candidate SHA: `88559c4db32f32e2a074ad735ea97538e62171bf`.
- Vercel production deployment `dpl_Hh9uJkAywQHn1Xe9gDd1SbdoLzVh`: READY.
- Production `/`: HTTP 200 and unauthenticated access resolves to `/login`.
- No runtime logs/errors were reported for the final deployment verification window.

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

Stage 8 introduced no database schema change.

## 10. Maintenance Rule

Every completed Global UX/IA stage must update, as applicable:

- stage closure record;
- `CHANGELOG.md`;
- `PROJECT_HANDOFF.md` when current state changes materially;
- relevant ADRs when architecture changes;
- `DATABASE_SCHEMA.md` when schema changes.

Stage 8 implementation, finding disposition, project handoff and production evidence are now recorded as closed/current.

## 11. Cleanup Result

The repository root is reserved for current/canonical documentation. Historical documentation is retained under `/archive/` and is no longer part of the active documentation surface.
