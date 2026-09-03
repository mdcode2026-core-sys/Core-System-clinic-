# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Status:** ACTIVE / Stages 12–15 validated through documentation candidate; final Production SHA gate PENDING
**Last Updated:** 2026-09-03

## Current Global UX/IA State

Stages 0–11 remain governed by their existing records and the Global UX/IA Final Authority. Stages 12–15 extend the same architecture and do not replace AJM, PJ, Agenda, Patient Flow, authorization, entitlement or Workspace ownership.

### Stage 12 — Security / Permission Regression

**Implementation/CI: PASS.**

Validated authentication/session boundaries, effective permissions, server-side authorization, capability/entitlement gates, Workspace/Widget security boundaries, tenant isolation, RLS and direct invocation resistance. Stage 12 CI Run `33246665276` passed all blocking checks and was merged into `main`.

Canonical records:
- `docs/STAGE12-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE12-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `.github/workflows/stage12-validation.yml`
- `tools/security-permission-stage12-audit.mjs`

### Stage 13 — Runtime / E2E Validation

**Implementation/CI/runtime smoke: PASS.**

Stage 13 Run `33248640485` passed npm install, TypeScript, ESLint, I18N audit/parity, Stage 12 security regression, Stage 5–11 audits, production build and production runtime smoke for the configured production URL surface. The validated candidate was merged to `main`.

Canonical records:
- `docs/STAGE13-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE13-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `.github/workflows/stage13-runtime-e2e-validation.yml`
- `tools/stage13-runtime-e2e-audit.mjs`

### Stage 14 — Legacy Cleanup

**Implementation/CI/legacy audit: PASS.**

No active source-surface legacy identifier met the evidence threshold for safe deletion. No speculative architectural removal was performed. Stage 14 CI Run `33248738282` passed TypeScript, ESLint, I18N, security, legacy audit, prior regression audits and production build.

Canonical records:
- `docs/STAGE14-IMPLEMENTATION-RECORD-2026-08-29.md`
- `docs/STAGE14-CLOSURE-PRODUCTION-READINESS-2026-08-29.md`
- `.github/workflows/stage14-legacy-cleanup.yml`
- `tools/stage14-legacy-audit.mjs`

### Stage 15 — Documentation Closure

Documentation is reconciled on the final Stage 15 candidate branch. It must not declare Production Ready until the final `main` SHA is deployed to Vercel Production and runtime-verified.

Canonical records:
- `docs/STAGE15-DOCUMENTATION-CLOSURE-2026-08-29.md`
- `docs/STAGES12-15-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md`

## Findings governance

Every discovered issue is investigated. Safe/authorized defects are fixed. Cross-workstream findings are documented with evidence, owner, severity and recommendation. No real defect is suppressed to make CI green.

Current Stages 12–15 register: `docs/STAGES12-15-UNRESOLVED-FINDINGS-REGISTER-2026-08-29.md`.

## Architecture decisions currently binding

- `clinic_owner` is retired and must not be reintroduced.
- Clinic Admin is the clinic administrator/highest clinic authority.
- Super Admin is the platform owner/lessor.
- Patient Portal remains subscription-controlled under `ADR-012-PATIENT-PORTAL.md`.
- Workspace is a presentation/work surface, not a security boundary.
- Patient Flow remains independent and owns canonical patient movement/Queue behavior.
- Widget metadata/classification does not grant access.
- Patient Context and Global Search are presentation/orchestration surfaces.
- Dashboard is a management/monitoring surface and does not replace Workspace or contextual Domain Overview surfaces.
- Sidebar is an authorized entry-point surface, not a security boundary.
- Global UX/IA authority is `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`.

## PJ / AJM

PJ workflow ownership remains governed by PJ-MASTER-DOCS and current implementation state. Stages 12–15 introduced no duplicate Patient Journey, Treatment Plan, Medical File, Medical Photo, Follow-up or Patient Portal architecture.

AJM status remains governed by `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`. Stages 12–15 changed no AJM domain ownership.

## Database / Supabase

The canonical tenant model remains `master_tenants` + `clinic_users`. Stages 12–15 introduced no new tenant model or database architecture.

## Agenda ↔ Visit Integration Contract (D1)

Agenda and Visit remain separate bounded contexts with an explicit state compatibility map:

| Agenda | Visit | Rule |
|---|---|---|
| `arrived` | `waiting` | Arrival establishes the waiting Visit state. |
| `in_session` | `in_consultation` | Clinical handoff maps the active appointment to the clinical Visit. |
| `completed` | `completed` | Both contexts are closed only after their owning workflow completes. |
| `cancelled` | `cancelled` | Cancellation is mirrored as a terminal Visit state. |
| `no_show` | `no_show` | No-show is mirrored as a terminal Visit state. |

`pending_close` is intentionally a **Visit-only** state. Agenda has no equivalent state because clinical completion and reception closure are separate ownership steps.

## Deployment / verification rule

Production deployment follows GitHub `main` → Vercel Git Integration. Do not use manual Vercel build/API calls to bypass build-rate limits. Production Ready requires repository SHA, CI, Production deployment SHA/status and runtime verification to agree.

## Final handoff rule

The Stage 15 candidate is the documentation freeze point. After final CI and diff review, merge once to `main`; then verify Vercel Production against the exact final SHA and complete the final runtime gate. No post-candidate documentation commit is permitted.
