# Global UX/IA Execution Plan — Stage 5 Update

**Date:** 2026-08-28  
**Stage:** 5 — Widget Library & Classification  
**Status:** IMPLEMENTED / CI VALIDATED / DOCUMENTED

## 1. Purpose

This addendum records the execution-plan state after completing Stage 5. It is subordinate to `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` and `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`, and exists so future stages can start from the actual repository state without relying on conversation history.

## 2. Stage 5 delivery

Stage 5 governed the existing Widget Library rather than creating a second Widget system.

Delivered:

- complete inventory/classification of the current 7 registered Widgets;
- explicit Domain ownership, purpose, bilingual purpose, contexts and natural size;
- Quick Action vs Widget distinction;
- Sidebar capability distinction;
- classification rationale;
- one-to-one Registry/Catalog audit;
- preservation of the existing authorization model;
- preservation of AJM/PJ Domain ownership;
- explicit protection of Patient Flow as an independent capability;
- production build validation through GitHub Actions.

Implementation:

- `src/core/workspace/widgetCatalog.ts`
- `tools/widget-catalog-audit.mjs`
- `.github/workflows/ux-stages-0-4-ci.yml` (now UX Stages 0–5 CI)

## 3. Validation gate adopted

The pre-deployment workflow is now the default engineering gate for Global UX/IA stages.

Required order:

```text
Local/repository inspection
→ GitHub static validation
→ GitHub production build
→ functional/runtime validation when required
→ Vercel deployment only for final runtime evidence
```

The GitHub gate performs:

1. lockfile synchronization check;
2. `npm ci`;
3. TypeScript;
4. I18N audit;
5. I18N parity;
6. Widget Catalog audit;
7. Domain Surface audit where present in the validation surface;
8. changed-surface ESLint;
9. production build.

The workflow is immutable and must not commit generated changes during validation. `permissions: contents: read` is intentional.

`concurrency` cancels superseded runs so stale candidates do not consume CI resources.

## 4. Vercel usage rule

Do not consume a Vercel Hobby deployment for small inspection, type-checking, linting, static analysis or intermediate fixes that GitHub Actions/local validation can perform.

Vercel remains part of the final runtime evidence path when the stage Definition of Done requires deployed runtime verification.

A successful GitHub build is necessary but does not falsely claim runtime verification.

## 5. Mandatory issue-investigation rule

A discovered issue is never ignored solely because it is outside the current stage.

For every issue:

- investigate whether it is a real defect;
- determine severity and impact;
- identify the owning Domain/workstream;
- repair immediately when the fix is safe and already authorized;
- if repair requires a new architectural decision, do not invent one;
- document the issue in a findings register with evidence and recommended disposition;
- disclose all deferred findings in the final stage report.

Stage 5 created `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` for issues discovered during the stage that belong to other workstreams or require separate architectural/ownership decisions.

## 6. Stage completion record

Canonical completion record:

`docs/GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md`

Documentation authority was synchronized through:

- `DOCUMENTATION_STATUS.md`
- `PROJECT_HANDOFF.md`
- `CHANGELOG.md` (historical evidence remains maintained separately)

## 7. Future-stage execution contract

For every subsequent Global UX/IA stage:

```text
READ
→ INSPECT CURRENT REPO
→ RECONCILE AJM
→ RECONCILE PJ
→ IMPLEMENT COMPLETE STAGE
→ INVESTIGATE ALL DISCOVERED ISSUES
→ GITHUB PRE-DEPLOYMENT GATE
→ RUNTIME/UX VALIDATION
→ DOCUMENT
→ CLOSE
```

The executor must not return intermediate progress messages merely because a subtask or CI run is pending. Continue automatically until the stage is complete. Return only for an explicit approval point defined by governing documentation or a genuine external blocker.

## 8. Source of truth

At the start of a future execution conversation, use the repository itself as the source of truth:

- root Global UX/IA authority;
- final execution plan;
- this Stage 5 update;
- current stage records;
- `DOCUMENTATION_STATUS.md`;
- `PROJECT_HANDOFF.md`;
- current AJM status matrix;
- relevant PJ reconciliation/PJ-MASTER-DOCS;
- current repository implementation and live database state where relevant.

Conversation memory must not be used as a substitute for repository inspection.
