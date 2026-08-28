# Stage 6 — Patient Flow / Queue Production Readiness Record

**Date:** 2026-08-28
**Status:** GATE IN PROGRESS
**PR:** #28
**Head:** `63363d49d0b111b83f3b098a540b83a11c551d03`

## Scope

Stage 6 reconciles the existing Patient Flow / Queue surface with the current Global UX/IA authority without creating a parallel Queue, Patient Journey, Workspace, tenant, or permission architecture.

## Required gates

| Gate | Required | Evidence | Status |
|---|---|---|---|
| Repository inspection | Yes | Stage 0–5, AJM, PJ, UX/IA, current domain code | Complete |
| Supabase permission migration | Yes | Live migration history + permission queries | Complete |
| Automatic role grants = 0 | Yes | Live SQL verification | Complete |
| Canonical session states | Yes | Live `clinic_visit_sessions` query | Complete |
| GitHub lockfile/dependencies | Yes | Stage 6 CI | Pending |
| TypeScript | Yes | Stage 6 CI | Pending |
| I18N audit/parity | Yes | Stage 6 CI | Pending |
| Stage 5 audits | Yes | Stage 6 CI | Pending |
| Stage 6 audit | Yes | `npm run ux:patient-flow-stage6` | Pending |
| Changed-surface ESLint | Yes | Stage 6 CI | Pending |
| Production build | Yes | Stage 6 CI | Pending |
| Runtime UX verification | Yes where deployment is required | Candidate deployment | Pending |
| Production verification | Yes where deployment is required | Production deployment/runtime | Pending |
| Documentation closure | Yes | This record + Stage 6 implementation record | In progress |

## Pre-existing findings

The full-repository ESLint diagnostic previously recorded 12 React errors and several warnings outside the Stage 6 implementation surface. They remain explicitly documented in `docs/STAGE-5-UNRELATED-FINDINGS-REGISTER-2026-08-28.md` and are assigned to their owning domains. They are not silenced by Stage 6.

## Deployment rule

GitHub is the primary engineering gate. Vercel is used only after a successful GitHub candidate gate and only for required runtime verification. A Vercel build-rate-limit must not be represented as a source-code failure.

## Closure rule

This record must not be changed to `CLOSED / Production Ready` until all required gates above have evidence and the final repository/database/runtime re-check reports no Stage 6 blocker.
