# Documentation Status & Authority

**Status:** ACTIVE / CLEANUP COMPLETE
**Last reviewed:** 2026-08-24

This file is the repository documentation authority and freshness registry.

## 1. Authority Rule

When documentation and implementation disagree:

1. **Implemented repository + live Supabase state** = current implementation reality.
2. **Accepted architectural decisions** = governing intent, unless later superseded.
3. **PJ-MASTER-DOCS / approved PJ decisions** = governing Patient Journey scope and workflow.
4. **PROJECT_HANDOFF.md** = current operational summary.
5. **CHANGELOG.md** = historical change evidence.
6. Historical reports and old implementation packages are evidence only.

## 2. Current Canonical Documents

- `ENGINEERING_CONSTITUTION.md` — engineering governance.
- `ARCHITECTURE_DECISIONS.md` — chronological architecture decisions.
- `MASTER_ROADMAP.md` — current product roadmap.
- `PROJECT_HANDOFF.md` — current living implementation handoff.
- `CHANGELOG.md` — historical implementation changes.
- `DATABASE_SCHEMA.md` — current structural schema reference.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.
- `PJ_E2E_DEMO_DATASET.md` — persistent PJ E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — Stage 15 closure evidence.
- `DOCUMENTATION_STATUS.md` — this registry.
- `DOCUMENTATION_CONSOLIDATION_PLAN.md` — completed cleanup record.

## 3. PJ Current State

- Stages 0–10: closed.
- Stage 11: closed.
- Stage 12: phase-closed after manual verification; Patient Portal architecture remains governed by `ADR-012-PATIENT-PORTAL.md`.
- Stage 13: completed.
- Stage 14: completed; temporary Stage 14 seed removed.
- Stage 15: completed for current scope; persistent integrated E2E data retained for future administrative stages.

Do not infer PJ status from archived Milestone/Session documents.

## 4. Archived Documentation

Superseded root-level artifacts have been moved to `/archive/`, including old dated handoffs, analytics/queue progress logs, Kimi implementation packages, old security planning/audit documents, old roadmap/design snapshots and the obsolete Supabase data dump.

Archived documents are historical evidence only and must not be used as current implementation instructions.

## 5. E2E Data Contract

`PJ_E2E_DEMO_DATASET.md` is the persistent synthetic dataset contract covering patients, appointments, visits, procedures, multi-stage treatment plans, treatment-plan items, medical files, follow-ups and notifications.

Extend this labelled dataset for future scenarios instead of introducing random disposable fixtures.

## 6. Schema Freshness

`DATABASE_SCHEMA.md` was reconciled against live Supabase on 2026-08-24. It remains a structural reference and must be refreshed after schema-changing work.

Before schema-sensitive implementation, verify live Supabase and repository migrations together.

## 7. Maintenance Rule

Every completed PJ stage must update, as applicable:

- stage closure record;
- `CHANGELOG.md`;
- `PROJECT_HANDOFF.md` when current state changes materially;
- relevant ADRs when architecture changes;
- `PJ_E2E_DEMO_DATASET.md` when E2E coverage changes;
- `DATABASE_SCHEMA.md` when schema changes.

Do not create new dated handoff/progress documents in the root for routine work.

## 8. Cleanup Result

The repository root is now reserved for current/canonical documentation. Historical documentation is retained under `/archive/` and is no longer part of the active documentation surface.
