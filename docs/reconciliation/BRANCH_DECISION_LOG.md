# CORE SYSTEM — Branch Reconciliation Decision Log

**Reconciliation start:** 2026-09-08
**Baseline tag:** `pre-reconciliation-2026-09-07`
**Baseline main SHA:** `f1b42cef56d4ee4450e883b35efdc536455e2a02`

## Governance

- No branch is merged or deleted without documented verification.
- Security/database migrations are handled separately and require isolated validation before production.
- Vercel is reserved for final production deployment and post-deployment health checks.
- Ambiguity or conflicting intent is a stop condition requiring human decision.

## Phase 0

- Protection tag verified before reconciliation.
- Repository ruleset `Main` verified active and targeting `refs/heads/main` only.
- Main protection rules remain active: deletion protection, non-fast-forward protection, and pull-request requirement.
- Reconciliation working branch: `reconciliation/decision-log-2026-09-08`.

## Branch inventory / decisions

Detailed branch-by-branch decisions will be appended as each branch is inspected.
