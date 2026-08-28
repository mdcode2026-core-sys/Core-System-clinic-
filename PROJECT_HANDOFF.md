# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Status:** ACTIVE DEVELOPMENT / Global UX/IA Stage Track
**Last Updated:** 2026-08-28

## Current Global UX/IA State

### Stage 5 — Widget Library & Classification

**Status:** IMPLEMENTED — CI VALIDATED — DOCUMENTED.

Stage 5 established governed classification metadata for the existing Widget Registry without creating a parallel registry, authorization system or Domain implementation.

Completed:

- All 7 currently registered Widgets are classified.
- Classification records Domain ownership, purpose, Arabic/English purpose, contexts, natural size, Quick Action status, Sidebar capability and rationale.
- Existing `widgetRegistry.ts` remains the canonical implementation registry.
- `src/core/workspace/widgetCatalog.ts` is presentation/governance metadata only and does not grant authorization.
- Existing Permission + Feature/Entitlement checks remain authoritative.
- Queue is explicitly a contextual surface of the existing Patient Flow capability and does not replace/recreate Patient Flow.
- AJM Domain ownership remains unchanged.
- PJ ownership and Patient Flow implementation remain unchanged.
- `tools/widget-catalog-audit.mjs` verifies one-to-one Registry → Catalog coverage and required metadata completeness.
- `.github/workflows/ux-stages-0-4-ci.yml` was extended to `UX Stages 0–5 Pre-deployment Validation`.
- The pre-deployment workflow is immutable: it verifies lockfile synchronization instead of committing generated changes during CI.
- GitHub is the primary pre-deployment engineering gate; Vercel is reserved for final runtime/deployment evidence.
- Final Stage 5 CI passed TypeScript, I18N audit/parity, Widget Catalog audit, Domain Surface audit, changed-surface ESLint and production build.

Canonical records:

- `docs/GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md`
- `docs/GLOBAL-UX-IA-EXECUTION-PLAN-STAGE-5-UPDATE-2026-08-28.md`
- `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md`

### Stage 0–4 continuity

Stages 0–4 remain governed by their existing records and the Global UX/IA Final Authority. Stage 5 did not reopen or replace them.

## Findings governance

During Stage 5, additional defects/warnings outside the immediate Widget Library scope were investigated rather than silently ignored. The resulting findings are recorded in `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` with ownership/disposition guidance. Future stages must follow the same rule: every discovered issue must be investigated; safe/authorized defects are fixed immediately, while cross-workstream architectural or ownership-dependent issues are documented and carried to their owning stage.

## Purpose

This is the single living operational handoff. It describes the current implementation state only. Historical progress reports, dated session plans and old implementation packages are archived and must not be used as current instructions.

## Authority

For implementation reality use, in order:

1. Implemented repository and live Supabase state.
2. Accepted architectural decisions and their later superseding decisions.
3. PJ-MASTER-DOCS and approved PJ decisions for Patient Journey scope.
4. This handoff for current operational status.
5. `CHANGELOG.md` for historical change evidence.

See `DOCUMENTATION_STATUS.md` for the documentation authority registry.

## Current PJ Status

| Stage | Status | Notes |
|---|---|---|
| PJ Stage 0–10 | CLOSED | Accepted prior stages. Do not reopen settled decisions. |
| PJ Stage 11 | CLOSED | Stage closure accepted. |
| PJ Stage 12 | PHASE-CLOSED | Patient Portal foundation manually verified. `ADR-012-PATIENT-PORTAL.md` is the architectural reference. |
| PJ Stage 13 | COMPLETED | Follow-on PJ implementation state retained in repository history. |
| PJ Stage 14 | COMPLETED | Temporary Stage 14 test seed removed. |
| PJ Stage 15 | COMPLETED FOR CURRENT SCOPE | Documentation consolidation and persistent E2E dataset established. Treatment-plan multi-stage scenarios and standalone Treatment Plans workspace are operational. |

## Patient Journey E2E Baseline

`PJ_E2E_DEMO_DATASET.md` is the persistent synthetic test-data contract.

The tenant associated with the designated clinic-admin verification account `xalkair@gmail.com` contains labelled synthetic scenarios covering patients, appointments, visit sessions, procedures, treatment plans, medical files, follow-ups, notifications and success/failure/exception paths.

Random disposable demo data should not replace this baseline. Extend the labelled E2E dataset when a new scenario is required.

## Architecture Decisions Currently Binding

- `clinic_owner` is retired from the active architecture and must not be reintroduced.
- Clinic Admin is the tenant administrator/highest clinic authority.
- Super Admin is the platform owner/lessor and does not operate clinic daily workflows.
- Patient Portal is subscription-controlled and has the approved two-layer public/paid model.
- Patient Journey implementation follows the approved PJ workflow; implementation reality supersedes stale documentation when the repository/database is the evidence.
- Global UX/IA authority is `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`.
- Workspace is a presentation/work surface and is not a security boundary.
- Patient Flow remains independent and continues to use the canonical Queue/patient-movement implementation.
- Widget metadata/classification does not grant access; authorization remains capability/permission based.

## Current Schema Reference

`DATABASE_SCHEMA.md` is a live-schema reference generated/reconciled against Supabase on 2026-08-24. It must be refreshed after schema-changing PJ or platform work.

The active tenant model is `master_tenants` + `clinic_users`.

## Current Documentation Set

Use:

- `DOCUMENTATION_STATUS.md` — authority/freshness registry.
- `ENGINEERING_CONSTITUTION.md` — engineering governance.
- `ARCHITECTURE_DECISIONS.md` — chronological architectural decisions.
- `MASTER_ROADMAP.md` — product roadmap.
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` — current UX/IA authority.
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md` — approved Global UX/IA execution plan.
- `docs/GLOBAL-UX-IA-EXECUTION-PLAN-STAGE-5-UPDATE-2026-08-28.md` — Stage 5 plan/governance update.
- `docs/GLOBAL-UX-IA-STAGE-5-WIDGET-LIBRARY-2026-08-28.md` — Stage 5 implementation record.
- `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` — unresolved cross-workstream findings.
- `.github/workflows/ux-stages-0-4-ci.yml` — shared UX 0–5 pre-deployment gate.
- `CHANGELOG.md` — historical implementation changes.
- `DATABASE_SCHEMA.md` — current structural database reference.
- `PJ_E2E_DEMO_DATASET.md` — persistent E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — PJ Stage 15 closure record.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.

## Historical Material

Dated handoffs, progress reports, Kimi packages, old security plans, old roadmap versions and other one-time implementation artifacts live under `/archive/`. Historical artifacts are evidence, not current requirements.

## Next Work

The next Global UX/IA stage must begin from the current repository and live database state. Read the complete Global UX/IA master execution document, the current final execution plan, the relevant AJM/PJ reconciliation documents and the current status registry before implementation. Do not rely on conversation memory.

### Mandatory stage execution rule

Once a stage begins, execution continues through its complete Definition of Done without returning intermediate status messages. Return to the owner only when the stage is complete, when an explicit approval is required by an existing governing document, or when a blocking external/system condition makes further execution impossible.

### Mandatory issue handling rule

No discovered error may be dismissed merely because it is outside the current stage. Investigate it, classify it, identify its owner, repair it when safe and authorized, or record it in the applicable findings register with evidence and recommended disposition. The final stage report must disclose all intentionally deferred findings.

### Deployment efficiency rule

Use local/repository validation and GitHub Actions for build/type/lint/static/integration checks before consuming Vercel deployments. Do not trigger Vercel for trivial inspection or intermediate fixes. Vercel is used when the applicable validation gate requires deployment/runtime evidence.

## Verification Rule

A document saying that something exists is not sufficient evidence that it works. For implementation closure, verify repository state, database state and runtime/manual behavior where applicable. A successful GitHub build is necessary but is not by itself runtime proof when runtime behavior is part of the Definition of Done.
