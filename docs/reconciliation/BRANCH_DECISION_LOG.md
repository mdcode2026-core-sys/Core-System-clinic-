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

## Phase 1 — `fix/workforce-closure`

### Functional extraction

- Source branch: `fix/workforce-closure`.
- Main comparison: `71` commits ahead, `0` behind; merge-base = `f1b42cef56d4ee4450e883b35efdc536455e2a02`.
- Extraction branch: `reconciliation/workforce-core-2026-09-08` at `682d0f0709f25bc30e7177cb8930e5ad4e786cab`, immediately before the four security privilege migrations.
- PR #72 opened against `main` with the pre-security core changes only.
- PR #72: 17 changed files, 1117 additions, 148 deletions.
- Candidate validations that completed successfully: I18N, Stage 8, Stage 9, Stage 10, Stage 11, Stage 12, Stage 13 runtime, Stage 14 legacy cleanup, Stage 15 documentation closure, Ideal Scenario Static Validation, UX Stages 0-8 CI, Deployment Governance Gate. The local reality-audit run had passed TypeScript, lint, I18N, UX/IA, AJM audits, and production build; runtime E2E was still executing at last poll.

### Security privilege migrations

Four adjacent migrations were isolated from PR #72:

1. `4bd51972c1763168b78d5463749c948bf3cfaee2` — `20260907142000_security_revoke_anon_invoice_guard_trigger_execution.sql`.
2. `3615602d5878d9406f4b50974849aa7218800c60` — `20260907142500_security_revoke_anon_trigger_function_execution.sql`.
3. `052a265e4f6cd93680292ed06a0487e7b4796185` — `20260907143000_security_revoke_public_trigger_function_execution.sql`.
4. `aee1fa66c736cf34fef50ae56a5ee8b18f7033f5` — `20260907143500_security_revoke_authenticated_trigger_function_execution.sql`.

Production Supabase `qaslsjyxjwvdoiczmhgq` was inspected read-only. All six target functions exist; `EXECUTE` is already denied to `public`, `anon`, and `authenticated` for all six. Trigger bindings using these functions are present. The exact four migration version IDs are absent from the production migration ledger, so the live security state is effective even though the repository migration ledger does not record these exact versions.

Existing non-production Supabase `gobdznqbdaklkkqbkynx` was used for an isolated rollback-safe transaction. Representative trigger functions were created temporarily, all four revoke patterns were executed, and privilege assertions for `public`/`anon`/`authenticated` were false for all six functions. The transaction was rolled back, leaving no persistent test objects/data.

Decision: the security state is already effective in production; do not re-apply the four migrations to production as an operational security change. Preserve the four files as repository-history reconciliation items until they can be admitted to main through the protected PR path. The separate workforce payroll RLS and payslip lifecycle migrations remain isolated for their own lineage review.

## Phase 2 — active branches

### `audit/i18n-fix-20260906`

- Main comparison: 19 ahead, 0 behind.
- Final tree differs only in `src/app/(dashboard)/workforce/payroll/page.tsx` and `src/core/navigation/navigationRegistry.ts`.
- Main already contains the canonical navigation surface; the branch is an older locale/wording variant and does not supersede current main.
- Decision: **Superseded — No Extraction Needed**.

### `fix/settings-reconciliation-build`

- Main comparison: 1 ahead, 954 behind; one file: `src/features/settings/templates/RoleTemplatesManager.tsx`.
- Branch removes the canonical `buildRoleKey()` helper and returns to inline key creation already corrected on main.
- Decision: **Superseded — No Extraction Needed**.

### `fix/pj-stage6-clinic-admin-workspaces`

- Main comparison: 1 ahead, 1423 behind; one file: `src/core/permissions/permissionEngine.ts`.
- Branch reintroduces legacy `clinic_users.role` / `role_template_id` resolution and drops the canonical `role_id` source-of-truth in main.
- Decision: **Superseded — No Extraction Needed**; extraction would regress RBAC architecture.

### `ux-financial-resources-final`

- Main comparison: 30 ahead, 104 behind; merge-base `199f361865aaeb89b86ea8cd6a0a4ce3db26394a`.
- The final diff is confined to the financial-resources surface and two financial-resource migration files. Current main already has the newer navigation registry and canonical permission engine, so those historical files must not be overwritten wholesale.
- Additional financial-resource action/components are absent from main and are valid file-level extraction candidates after dependency/contract checks. The two migrations remain in the separate migration queue.
- Decision: **Feature extraction required — file-level only**.

## Phase 3 — verified historical closure branches

The following branches compare `0` commits ahead of current main and therefore contain no pending source changes: `pj12-production-trigger`, `pj12-production-verify`, `pj12/final-production-trigger`, `pj12/security-fix-multiclinic-context`, and `stage12-final-ready`.

Decision for each: **No Pending Work**.

## Evidence rule for remaining historical branches

For every remaining historical branch, `ahead_by=0` is sufficient evidence for **No Pending Work** because the branch contributes no content not already reachable from main. For branches with positive ahead counts, only the actual file/commit diff is eligible for extraction; old branch age, naming, closure markers, or prior readiness claims are not evidence of completion.

## Integration gate

PR #72 remains open and mergeable at the Git level. The active `Main` ruleset requires at least one approving review after the last push. PR #72 currently has zero reviews. A protected merge has therefore not been performed and must not be bypassed by force-updating `main` or disabling the approval requirement.
