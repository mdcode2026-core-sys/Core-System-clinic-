# Stage 9 — Unresolved Findings Register

**Stage:** 9 — Overview / Dashboard Reconciliation  
**Date:** 2026-08-29

## S9-F-001 — Repository-wide ESLint diagnostic debt

- **Class:** D — Future / cross-workstream engineering cleanup
- **Status:** DEFERRED — NON-BLOCKING FOR STAGE 9
- **Evidence:** The repository-wide ESLint diagnostic on the Stage 9 commit reported 12 existing errors across follow-up, Patient Portal, reports, role templates, user settings, treatment plans and Workspace shell, plus warnings. The dedicated Stage 9 changed-surface ESLint gate passed.
- **Root cause:** Pre-existing React/ESLint rule violations outside the Stage 9 changed surface.
- **Impact:** Global `npx eslint .` is not currently green, but Stage 9 source files and the production build pass the required blocking validation path.
- **Severity:** Medium engineering debt; not a Stage 9 production blocker.
- **Owner:** Engineering / owning domains of the affected files.
- **Owning stage:** Future cross-workstream cleanup; do not reopen Stage 9 solely for unrelated lint debt.
- **Recommendation:** Repair affected domains incrementally and make the repository-wide diagnostic a blocking gate only after the existing violations are resolved.
- **Reason for deferral:** Fixing unrelated domain behavior during Stage 9 would violate the stage scope and risk regressions.
- **Production-readiness impact:** No Stage 9 blocker; production build and changed-surface validation are PASS.

## S9-F-002 — Historical runtime errors on superseded deployments

- **Class:** D — Historical / resolved runtime evidence
- **Status:** RESOLVED / NON-BLOCKING
- **Evidence:** Vercel runtime error aggregation contains errors last seen on superseded deployments, while the current Stage 9 preview deployment reported no error/fatal logs during verification. The current production deployment before Stage 9 also reported no error/fatal logs in its verification window.
- **Root cause:** Historical deployment/runtime conditions; no current Stage 9 reproduction.
- **Impact:** None established on the current validated deployment.
- **Severity:** Historical.
- **Owner:** Engineering if any historical signature is reproduced.
- **Owning stage:** N/A unless reproduced.
- **Recommendation:** Continue monitoring current production runtime; do not alter unrelated code without a current reproduction.
- **Reason for deferral:** No current deployment evidence reproduces the historical signatures.
- **Production-readiness impact:** None for the validated Stage 9 candidate.

## S9-F-003 — No Stage 9 database migration

- **Class:** D — Informational finding
- **Status:** CLOSED
- **Evidence:** Dashboard reuses existing analytics tables/functions/permission model; no schema gap was identified.
- **Impact:** None.
- **Owner:** N/A.
- **Reason:** No database change was required.

## Stage 9 blocker register

**No unresolved Stage 9 blocker remains.**
