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
- Main protection verified after correction: deletion protection, non-fast-forward protection, pull-request requirement, zero required approvals, and last-push approval disabled.
- Reconciliation working branch: `reconciliation/decision-log-2026-09-08`.

## Phase 1 — `fix/workforce-closure`

### Functional extraction

- Source branch: `fix/workforce-closure`.
- Main comparison at start: `71` commits ahead, `0` behind; merge-base = `f1b42cef56d4ee4450e883b35efdc536455e2a02`.
- Extraction branch: `reconciliation/workforce-core-2026-09-08` at `682d0f0709f25bc30e7177cb8930e5ad4e786cab`, immediately before the four security privilege migrations.
- PR #72 opened against `main` with the pre-security core changes only.
- PR #72: 17 changed files, 1117 additions, 148 deletions.
- PR #72 was successfully merged to `main` as merge commit `1015337626b962216ac03b50a3ac0334062491f0`.

### Security privilege migrations

Four adjacent migrations were isolated from PR #72:

1. `4bd51972c1763168b78d5463749c948bf3cfaee2` — `20260907142000_security_revoke_anon_invoice_guard_trigger_execution.sql`.
2. `3615602d5878d9406f4b50974849aa7218800c60` — `20260907142500_security_revoke_anon_trigger_function_execution.sql`.
3. `052a265e4f6cd93680292ed06a0487e7b4796185` — `20260907143000_security_revoke_public_trigger_function_execution.sql`.
4. `aee1fa66c736cf34fef50ae56a5ee8b18f7033f5` — `20260907143500_security_revoke_authenticated_trigger_function_execution.sql`.

Production Supabase `qaslsjyxjwvdoiczmhgq` was inspected read-only. All six target functions exist; `EXECUTE` is already denied to `public`, `anon`, and `authenticated` for all six. Trigger bindings using these functions are present. The exact four migration version IDs are absent from the production migration ledger, so the live security state is effective even though the repository migration ledger does not record these exact versions.

Existing non-production Supabase `gobdznqbdaklkkqbkynx` was used for an isolated rollback-safe transaction. Representative trigger functions were created temporarily, all four revoke patterns were exercised, privilege assertions were checked, and the transaction was rolled back.

Decision: do not re-apply the four migrations to production as an operational security change because the intended privilege state is already effective. Preserve the four files as repository-history reconciliation items until migration lineage is formally reconciled. The separate workforce payroll RLS and payslip lifecycle migrations remain isolated for their own lineage review.

## Phase 2 — active branches

### `audit/i18n-fix-20260906`

- Main comparison: 19 ahead, 0 behind.
- Final tree differs only in `src/app/(dashboard)/workforce/payroll/page.tsx` and `src/core/navigation/navigationRegistry.ts`.
- Main already contains the canonical navigation surface; the branch is an older locale/wording variant.
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

- Current main comparison: 30 commits ahead of the branch and 170 commits behind it; merge-base `199f361865aaeb89b86ea8cd6a0a4ce3db26394a`.
- File-level verification found the financial workflow actions, payment actions, supplier actions, expense operations, payment center, inventory page, insurance page, payments page, and financial-resources root page already present on current main with identical blob content in the checked candidates.
- The branch's `navigationRegistry.ts` differs from current main: the branch removes the richer nested financial-resource navigation present on main and therefore must not be extracted.
- The two branch migrations remain in the migration queue and are not admitted to production automatically.
- Decision: **Superseded — No Extraction Needed**. No unique verified application code remains to extract from this branch.

## Phase 3 — verified historical closure branches

Previously verified no-pending branches include: `pj12-production-trigger`, `pj12-production-verify`, `pj12/final-production-trigger`, `pj12/security-fix-multiclinic-context`, and `stage12-final-ready`.

Decision for each: **No Pending Work**.

## Database / security validation state

Production advisor scan was re-run after the workforce merge. The intended trigger-function privilege end-state remains effective, but Supabase still reports existing security WARN findings for exposed `SECURITY DEFINER` RPCs and public-schema extensions (`pg_net`, `btree_gist`), plus leaked-password protection being disabled. These are existing platform/security findings and are not silently changed during reconciliation because several warned RPCs are application-facing and require contract-level review before privilege changes.

## Remaining reconciliation

Historical branches still require classification where their actual positive ahead content has not yet been individually evidenced in this log. No such branch may be merged merely because its name indicates closure/readiness. Extraction remains file/feature-level only.

## Final gate

`main` is currently at `1333c65c185b733109ac8ec003731c3538977fb1` after PR #72 and the reconciliation log update PR #73. Production closure is **not yet claimed**. Final closure requires completion of the remaining branch evidence pass, migration lineage reconciliation, full validation on current main, and only then Vercel production health verification.
