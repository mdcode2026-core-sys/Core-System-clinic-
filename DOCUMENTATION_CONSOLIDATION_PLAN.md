# DOCUMENTATION_CONSOLIDATION_PLAN.md

## Status: COMPLETED

**Completed:** 2026-08-24

This document is retained as the historical record of the documentation-consolidation effort. The planned cleanup has been executed and this file is no longer an active work plan.

## Completed Actions

1. Established `DOCUMENTATION_STATUS.md` as the repository documentation authority/freshness registry.
2. Refreshed `PROJECT_HANDOFF.md` into the current living handoff for the PJ stage-based workflow.
3. Reconciled `MASTER_ROADMAP.md` so the historical Milestone/Session sequence is no longer presented as the active implementation queue.
4. Reconciled `DATABASE_SCHEMA.md` against live Supabase structure on 2026-08-24 and explicitly documented its live-schema authority rule.
5. Retained `ARCHITECTURE_DECISIONS.md` as chronological decision history; historical ADRs are not silently rewritten.
6. Retained `CHANGELOG.md` as the historical change record.
7. Confirmed `PJ_E2E_DEMO_DATASET.md` as the persistent synthetic Patient Journey dataset contract.
8. Moved superseded root-level progress reports, old Kimi packages, old security plans and old roadmap/design snapshots into `/archive/`.
9. Removed the stale root-level copies so engineers are not presented with obsolete implementation instructions in the repository root.
10. Updated the documentation authority registry to distinguish current documents from historical evidence.

## Archived Root Documents

The following historical artifacts are now under `/archive/`:

- `Handoff_Daily_Report_2026-07-29.md`
- `ANALYTICS_BUILD_PROGRESS.md`
- `QUEUE_DEBUG_PROGRESS.md ` (including the original trailing-space filename)
- `QUEUE_FIX_PROGRESS.md`
- `KIMI_IMPLEMENTATION_CONTRACT.md`
- `KIMI_IMPLEMENTATION_PACKAGE.md`
- `KIMI_SESSION_PLAN_MILESTONE_3.md`
- `IMPLEMENTATION_PACKAGE_MILESTONE_3.md`
- `MILESTONE_2_SCOPE_PROPOSAL.md`
- `SECURITY_HOTFIX_PLAN.md`
- `SECURITY_AUDIT_REPORT.md`
- `PRODUCT_COMPLETION_ROADMAP_V2.md`
- `REVISED_DESIGN_DOCUMENT_v2.md`
- `supabase Data info.md`

## Ongoing Maintenance Rule

Do not create dated progress/handoff files in the repository root for routine implementation.

Use:

- `PROJECT_HANDOFF.md` for current state;
- `CHANGELOG.md` for historical changes;
- `ARCHITECTURE_DECISIONS.md` for decisions;
- `DOCUMENTATION_STATUS.md` for authority/freshness;
- stage-specific PJ closure records for stage evidence;
- `PJ_E2E_DEMO_DATASET.md` for persistent E2E test-data coverage;
- `/archive/` for historical artifacts that must be retained but must not guide current implementation.

If a future document conflicts with implementation reality, reconcile it against the repository and live Supabase before using it as an implementation reference.
