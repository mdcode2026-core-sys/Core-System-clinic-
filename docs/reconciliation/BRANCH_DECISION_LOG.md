# CORE SYSTEM — Branch Reconciliation Decision Log

**Reconciliation start:** 2026-09-08  
**Baseline tag:** `pre-reconciliation-2026-09-07`  
**Baseline main SHA:** `f1b42cef56d4ee4450e883b35efdc536455e2a02`  
**Current main SHA:** `eeee00c48e06b9b4fcac01d73dc4fb3da671ce47`

## Governance

- No merge or deletion without evidence.
- Architecture decisions are checked against authoritative repository documentation and current canonical code.
- Security/database migrations require isolated validation and lineage verification.
- Vercel is reserved for production deployment and post-deployment health checks.

## Completed reconciliation

- Protection tag and main ruleset verified.
- PR #72 merged validated workforce core as `1015337626b962216ac03b50a3ac0334062491f0`.
- PR #75 merged retryable appointment-slot E2E handling.
- PR #76 merged deterministic future-date appointment selection.
- Duplicate/stale PRs #14, #21, #24, #25, #27, #59, #60, #61, #64, #68 and #77 were closed after verification.
- Architecture branch audit was added in `docs/reconciliation/ARCHITECTURE_BRANCH_AUDIT_2026-09-08.md` and merged through PR #79 as `eeee00c48e06b9b4fcac01d73dc4fb3da671ce47`.

## Architecture reconciliation rule

The final branch-vs-main decisions were checked against `ARCHITECTURE_DECISIONS.md`, `MASTER_ROADMAP.md`, current handoff/index documents, `PJ-MASTER-DOCS`, current canonical source, and production database reality where migrations were involved.

Critical decisions applied:

1. `master_tenants` / `clinic_users` remain the current tenant/user source of truth.
2. The existing canonical permission engine and role/permission schema are reused; legacy competing role-resolution engines are rejected.
3. Workspace remains a working-surface/presentation layer and is not the Patient Journey or tenant administration.
4. Modules remain independent and reuse canonical permission/navigation/feature-entitlement layers.
5. Approved Patient Journey workflow remains authoritative.
6. Procedure and Service remain distinct medical concepts.
7. Duplicate or already-effective production migrations are not reapplied.

High-risk historical branches were explicitly reconciled at file/feature level, including the AJM team-access/financial/workforce/communications/journey/insights/integration branches, workspace UX branches, I18N branches, Patient Journey branches, treatment-plan branch, global-search branch, and historical closure branches. Their decisions are recorded in the architecture audit document.

## Security migration state

The four workforce privilege migrations were isolated. Production read-only inspection confirmed the targeted trigger functions exist and `EXECUTE` is denied to `public`, `anon`, and `authenticated`. Production migration history contains equivalent recorded security intent, so no duplicate security migration was applied.

## Validation

GitHub Actions run `34173353092` completed SUCCESS for the complete Local/Codespaces Reality Validation job against `b806a1ecde1837636616b12542e85c8fe0264657`.

A direct compare confirms current `main` (`eeee00c48e06b9b4fcac01d73dc4fb3da671ce47`) differs from that validated application commit only in reconciliation documentation; there is no application-code delta. This is recorded explicitly and is not misrepresented as a new CI run on `main`.

## Production

The production deployment for `main` at `7dfe5717043d37d70fc9122106f4793bb1802474` is READY, serves `/login` with HTTP 200 and expected security headers, and the runtime-error check found no runtime errors in the selected verification window. The subsequent main change `eeee00c48e06b9b4fcac01d73dc4fb3da671ce47` is documentation-only and does not change the deployed application tree.

## Branch archival

The connected GitHub integration exposes branch inspection and PR lifecycle operations but no physical branch-delete operation. Therefore branch deletion is not claimed where the tool cannot perform it. Verified historical refs are instead classified as Merged, Superseded — No Extraction Needed, or No Pending Work in the architecture audit.

## Final state

The architectural reconciliation requested as part of the final audit is now recorded and incorporated into the repository evidence. No unreviewed application work was admitted from the historical branches. No duplicate production security migration was applied.

**Final closure classification remains dependent only on the repository's physical branch-ref cleanup capability; the connected tool cannot perform that deletion.**
