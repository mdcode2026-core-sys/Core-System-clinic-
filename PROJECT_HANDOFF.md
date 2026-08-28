# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Status:** ACTIVE DEVELOPMENT / Global UX/IA Stage Track
**Last Updated:** 2026-08-29

## Current Global UX/IA State

### Stage 7 — Patient Context

**Status: CLOSED — PRODUCTION READY.**

Stage 7 established a canonical patient-context presentation surface on the existing Patient Detail surface. It reuses the existing AJM/PJ/domain implementations and does not create a parallel patient registry, journey, queue, authorization, entitlement or workspace architecture.

Completed and verified:

- Patient Context is embedded in the canonical Patient Detail surface.
- Existing Patient History, Agenda, Treatment Plans, Invoices, Follow-up and Patient Portal capabilities are reused.
- Patient-scoped context is preserved into Agenda and Invoices, while existing Follow-up and Treatment Plan surfaces receive the patient context through their supported query paths.
- UI visibility is permission-derived and existing server-side domain authorization remains authoritative.
- Arabic/English catalog parity and RTL/LTR behavior remain under the canonical i18n system.
- No Stage 7 database migration was introduced.
- Stage 5, Stage 6 and Stage 7 audits, TypeScript, ESLint changed-surface gate and production build passed.
- Final GitHub UX Stages 0-7 CI run #84 passed for SHA `832d49d888d343018c36fb51454ea6caa0306e80`.
- Final Production Candidate Handoff run #24 passed for the same SHA.
- Vercel production deployment `dpl_2fqPkrb34SUtuAntbFNBqmQAaJxg` for the validated SHA reached READY.
- Production `/login` returned HTTP 200 after the final validated deployment; no runtime errors were reported in the verification window.

Canonical records:

- `docs/STAGE-7-IMPLEMENTATION-RECORD-2026-08-28.md`
- `docs/STAGE-7-UNRESOLVED-FINDINGS-REGISTER-2026-08-28.md`
- `.github/workflows/production-gated-deploy.yml`

### Stage 6 — Patient Flow / Queue

**Status: CLOSED — PRODUCTION READY (STAGE SCOPE).**

Stage 6 reconciled the existing Patient Flow / Queue surface with the Global UX/IA authority without creating a parallel Queue, Patient Journey, Workspace, tenant, or permission architecture.

### Stage 5 — Widget Library & Classification

**Status: IMPLEMENTED — CI VALIDATED — DOCUMENTED.**

### Stage 0–4 continuity

Stages 0–4 remain governed by their existing records and the Global UX/IA Final Authority. Stage 5, Stage 6 and Stage 7 did not reopen or replace them.

## Findings governance

Every discovered issue must be investigated; safe/authorized defects are fixed immediately, while cross-workstream architectural or ownership-dependent issues are documented and carried to their owning workstream. Stage 7 blocker `S7-BLOCKER-001` is now CLOSED and remains documented for historical evidence.

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
- Patient Context is a presentation/orchestration surface and does not own domain data or authorization.

## Current Schema Reference

`DATABASE_SCHEMA.md` is the live-schema reference. It must be refreshed after schema-changing PJ or platform work.

The active tenant model is `master_tenants` + `clinic_users`.

## Current Documentation Set

Use:

- `DOCUMENTATION_STATUS.md` — authority/freshness registry.
- `ENGINEERING_CONSTITUTION.md` — engineering governance.
- `ARCHITECTURE_DECISIONS.md` — chronological architectural decisions.
- `MASTER_ROADMAP.md` — product roadmap.
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` — current UX/IA authority.
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md` — approved Global UX/IA execution plan.
- `docs/STAGE-7-IMPLEMENTATION-RECORD-2026-08-28.md` — Stage 7 implementation/readiness record.
- `docs/STAGE-7-UNRESOLVED-FINDINGS-REGISTER-2026-08-28.md` — Stage 7 finding disposition.
- `docs/STAGE-6-PRODUCTION-READINESS-RECORD-2026-08-28.md` — Stage 6 closure/readiness record.
- `.github/workflows/production-gated-deploy.yml` — validated production candidate handoff.
- `CHANGELOG.md` — historical implementation changes.
- `DATABASE_SCHEMA.md` — current structural database reference.
- `PJ_E2E_DEMO_DATASET.md` — persistent E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — PJ Stage 15 closure record.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.

## Historical Material

Dated handoffs, progress reports, Kimi packages, old security plans, old roadmap versions and other one-time implementation artifacts live under `/archive/`. Historical artifacts are evidence, not current requirements.

## Next Work

Stage 7 is closed. Future work proceeds from the next approved roadmap/workstream item. The Patient communication surface remains a documented future/cross-workstream item and was not introduced as a parallel system during Stage 7.

### Mandatory stage execution rule

Once a stage begins, execution continues through its complete Definition of Done without returning intermediate status messages. Return to the owner only when the stage is complete, when an explicit approval is required by an existing governing document, or when a blocking external/system condition makes further execution impossible.

### Mandatory issue handling rule

No discovered error may be dismissed merely because it is outside the current stage. Investigate it, classify it, identify its owner, repair it when safe and authorized, or record it in the applicable findings register with evidence and recommended disposition. The final stage report must disclose all intentionally deferred findings.

### Deployment efficiency rule

Use local/repository validation and GitHub Actions for build/type/lint/static/integration checks before consuming Vercel deployments. Do not trigger Vercel for trivial inspection or intermediate fixes. Vercel is used when the applicable validation gate requires deployment/runtime evidence.

## Verification Rule

A document saying that something exists is not sufficient evidence that it works. For implementation closure, verify repository state, database state and runtime/manual behavior where applicable. A successful GitHub build is necessary but is not by itself runtime proof when runtime behavior is part of the Definition of Done.
