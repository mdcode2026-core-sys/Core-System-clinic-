# Stage 6 — Patient Flow / Queue Production Readiness Record

**Date:** 2026-08-28
**Status:** BLOCKED — PRODUCTION DEPLOYMENT CREDENTIAL GATE
**PR:** #28 — merged
**Application commit:** `1e07bc5c36bf2f8a5b43d2535cecddf5dc103111`
**Current main documentation commit:** `6d2e4825f7a1e6d1e6d714b8c27ed7081038611b`

## Scope

Stage 6 reconciles the existing Patient Flow / Queue surface with the current Global UX/IA authority without creating a parallel Queue, Patient Journey, Workspace, tenant, or permission architecture.

## Required gates

| Gate | Required | Evidence | Status |
|---|---|---|---|
| Repository inspection | Yes | Stage 0–5, AJM, PJ, UX/IA, current domain code | Complete |
| Supabase permission migration | Yes | Live migration history + permission queries | Complete |
| Automatic role grants = 0 | Yes | Live SQL verification | Complete |
| Canonical session states | Yes | Live `clinic_visit_sessions` query | Complete |
| GitHub lockfile/dependencies | Yes | UX Stages 0–6 CI run #58 | PASS |
| TypeScript | Yes | UX Stages 0–6 CI run #58 | PASS |
| I18N audit/parity | Yes | UX Stages 0–6 CI run #58 | PASS |
| Stage 5 audits | Yes | UX Stages 0–6 CI run #58 | PASS |
| Stage 6 audit | Yes | UX Stages 0–6 CI run #58 | PASS |
| Changed-surface ESLint | Yes | UX Stages 0–6 CI run #58 | PASS |
| Production build | Yes | UX Stages 0–6 CI run #58 | PASS |
| Runtime candidate build | Yes | Vercel preview `dpl_Cje2MvCJ59qko4wUCwHTwkwK1fGa` | READY, but preview access is Vercel-protected and lacks preview Supabase environment values |
| Production deployment | Yes | Production Gated Deploy run #2 | BLOCKED: missing Vercel Actions credentials |
| Production runtime verification | Yes | Required after production deployment | NOT COMPLETED |
| Documentation closure | Yes | Stage 6 implementation + this record + unresolved register | Complete for blocker state |

## GitHub validation result

UX Stages 0–6 CI run **#58 / run ID `33202669141`** completed successfully. The blocking gates all passed: lockfile synchronization, dependencies, TypeScript, I18N audit/parity, Stage 5 audits, Stage 6 Patient Flow audit, changed-surface ESLint, and production build.

The full-repository ESLint diagnostic also completed and is intentionally retained as a diagnostic. Pre-existing unrelated findings remain documented rather than suppressed.

## Supabase production evidence

The live Supabase project was checked directly. The three Patient Flow permissions exist and currently have **0 automatic role grants**. Canonical `clinic_visit_sessions` contains the expected operational states.

The repository migration filename was reconciled to the latest already-applied Stage 6 migration history rather than creating another future migration version.

## Vercel evidence

A Vercel candidate deployment was successfully built and reached `READY` for the Stage 6 branch. Direct preview runtime access is protected by Vercel Authentication; the observed preview runtime error is an environment/configuration issue stating that the Supabase URL and key are missing in that preview environment. This is not evidence of a Patient Flow code failure.

A production deployment was then attempted only after the GitHub candidate gate. The new `Production Gated Deploy` workflow failed at `vercel pull` because `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are not available as GitHub Actions secrets. The failure is a credential/integration configuration blocker, not a Vercel Hobby build-rate-limit.

## Unresolved findings

See `docs/STAGE-6-UNRESOLVED-FINDINGS-REGISTER-2026-08-28.md`.

### S6-DEPLOY-001 — BLOCKER

Production deployment and therefore production runtime verification cannot be completed until the repository Actions environment has authorized Vercel deployment credentials.

### S6-SEC-001 — NON-STAGE SECURITY DEBT

The production dependency audit reports high-severity vulnerabilities. They pre-date Stage 6 and are assigned to the dependency/security workstream. They were not hidden or suppressed during Stage 6.

## Closure rule

Stage 6 **must not** be marked `CLOSED / Production Ready` yet.

Closure requires:

1. configure the required Vercel GitHub Actions credentials;
2. rerun `Production Gated Deploy` successfully;
3. confirm a production deployment for the Stage 6 application commit;
4. perform production runtime verification of Operations, Clinical and Administrative Patient Flow surfaces;
5. verify permission/authorization behavior and drag/drop state persistence in production;
6. perform final repository, Supabase and Vercel re-check;
7. only then change this record to `CLOSED / Production Ready`.
