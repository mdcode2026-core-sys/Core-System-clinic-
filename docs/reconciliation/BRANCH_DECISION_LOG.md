# CORE SYSTEM — Branch Reconciliation Decision Log

**Reconciliation start:** 2026-09-08  
**Baseline tag:** `pre-reconciliation-2026-09-07`  
**Baseline main SHA:** `f1b42cef56d4ee4450e883b35efdc536455e2a02`

## Governance

- No branch is merged or deleted without documented verification.
- Security/database migrations are handled separately; no reconciliation security migration is applied directly to production without isolated validation.
- Vercel is reserved for final production deployment and post-deployment health checks.
- Ambiguity or conflicting intent is a stop condition; no guessing.

## Phase 0 — protection and baseline

- Protection tag verified before reconciliation.
- `Main` ruleset verified active for `refs/heads/main`.
- Main protection verified: deletion protection ON; non-fast-forward ON; pull request required; required approvals 0; last-push approval OFF; code-owner approval OFF; bypass actors empty.
- Reconciliation working branches were used instead of direct pushes to `main`.

## Phase 1 — `fix/workforce-closure`

### Functional extraction

- Source branch started 71 commits ahead / 0 behind baseline; merge-base = baseline SHA.
- Functional extraction stopped immediately before the four adjacent privilege migrations.
- PR #72 contained 17 changed files, +1117/-148, and was merged to `main` as `1015337626b962216ac03b50a3ac0334062491f0`.

### Four isolated security privilege migrations

1. `4bd51972c1763168b78d5463749c948bf3cfaee2` — `20260907142000_security_revoke_anon_invoice_guard_trigger_execution.sql`
2. `3615602d5878d9406f4b50974849aa7218800c60` — `20260907142500_security_revoke_anon_trigger_function_execution.sql`
3. `052a265e4f6cd93680292ed06a0487e7b4796185` — `20260907143000_security_revoke_public_trigger_function_execution.sql`
4. `aee1fa66c736cf34fef50ae56a5ee8b18f7033f5` — `20260907143500_security_revoke_authenticated_trigger_function_execution.sql`

Production Supabase `qaslsjyxjwvdoiczmhgq` was inspected read-only. All six target functions and their trigger bindings exist, and `EXECUTE` is denied to `public`, `anon`, and `authenticated` for the targeted trigger functions. A production migration-ledger query then confirmed that the same security intent is already represented by production migrations under these versions/names:

- `20260907141824` — `security_revoke_anon_invoice_guard_trigger_execution`
- `20260907142008` — `security_revoke_anon_trigger_function_execution`
- `20260907142058` — `security_revoke_public_trigger_function_execution`
- `20260907142413` — `security_revoke_authenticated_trigger_function_execution`
- plus `20260907143958` — `security_revoke_authenticated_trigger_functions_complete`

Therefore the earlier apparent ledger gap is resolved: the production database has an equivalent recorded migration lineage. No duplicate security migration was applied during reconciliation.

## Phase 2 — active branches

### `audit/i18n-fix-20260906`

Verified against current main. Its remaining differences are older locale/navigation variants; current main already contains the canonical navigation/analytics wiring.  
**Decision: Superseded — No Extraction Needed.**

### `fix/settings-reconciliation-build`

One commit changing `RoleTemplatesManager.tsx`; it removes the canonical `buildRoleKey()` helper and regresses the current role-template architecture.  
**Decision: Superseded — No Extraction Needed.**

### `fix/pj-stage6-clinic-admin-workspaces`

One commit changing `permissionEngine.ts`; it reintroduces legacy `clinic_users.role` / `role_template_id` resolution instead of the current canonical `role_id` source of truth.  
**Decision: Superseded — No Extraction Needed.**

### `ux-financial-resources-final`

File-level comparison against current main confirms the checked financial-resource workflow/UI files are already present on main. Its navigation variant is older/regressive and must not replace current navigation. Its migration files are not admitted to production by branch reconciliation.  
**Decision: Superseded — No Extraction Needed.**

## Phase 3 — historical feature branches

The following historical branches were explicitly checked at feature/file level where relevant and are superseded by the current architecture rather than merged wholesale:

- `ajm/ajm-1-team-access-foundation`
- `ajm/ajm-2-financial-resources-foundation`
- `ajm/ajm-3-workforce-foundation-2026-08-29`
- `stage-8-global-search`
- `ux-global-ia-audit`
- `ux-stage-6-patient-flow`
- `ux-stage-7-patient-context`
- `stage9/overview-dashboard-reconciliation-final`
- `stage-11-medical-files`
- `i18n-completion-2026-08-24`
- `recovery/pre-2026-08-30-current-state`
- `fix/workspace-sidebar-and-assignment`
- `fix/workspace-sidebar-and-assignment-v2`

For `stage-8-global-search`, current main already contains the canonical `src/core/search/GlobalSearch.tsx` integration, so the historical implementation is not extracted.

### Verified closure/no-pending branches

Previously verified no-pending branches include:

- `pj12-production-trigger`
- `pj12-production-verify`
- `pj12/final-production-trigger`
- `pj12/security-fix-multiclinic-context`
- `stage12-final-ready`
- closure branches under the previously audited `stage12-*`, `stage13-*`, `stage14-*`, and `stage15-*` groups where their final state was already represented on main.

**Decision for verified members: No Pending Work.**

## Open PR reconciliation

The previously open stale PR set was rechecked against current main. PRs #14, #21, #24, #25, #27, #59, #60, #61, #64, and #68 were closed after verification that their work was already present, superseded, redundant, or no longer safe to extract. No code was merged from these PRs.

PR #72 (workforce functional extraction), PR #75 (retryable appointment-slot E2E conflict handling), and PR #76 (fresh appointment date / wider deterministic slot selection) were the validated merge path into main.

## Validation

Latest main validation run: **GitHub Actions run `34173353092`**. The complete `Local/Codespaces Reality Validation` job finished **SUCCESS**, including:

- TypeScript
- Lint
- I18N
- UX/IA audits
- AJM audits
- production build without Vercel
- Playwright installation
- local production server
- authenticated route E2E
- real-world clinic journey E2E
- server shutdown / complete job

## Supabase final read-only advisor state

Security advisor still reports WARN findings for several application-facing `SECURITY DEFINER` RPCs, `pg_net`/`btree_gist` in `public`, and leaked-password protection. These were not changed blindly because their contracts and intended exposure must be reviewed before privilege/schema changes.

Performance advisor reports existing INFO/WARN findings including unindexed foreign keys, RLS init-plan patterns, multiple permissive policies, unused indexes, and duplicate indexes. These are recorded as technical debt findings; no destructive index/policy changes are made as part of branch reconciliation without dependency and runtime verification.

## Branch deletion / archival capability

The connected GitHub integration provides branch inspection and PR lifecycle operations but does not expose a branch-delete operation. Therefore physical deletion is not claimed where the connector cannot perform it. A branch may only be treated as archived/no-pending when its state is explicitly recorded here or in the corresponding reconciliation evidence.

## Final gate

Current functional validation is green. Production security state is effective and its equivalent migration lineage is recorded. Remaining closure work is limited to completing the evidence inventory for every remaining historical branch/ref and then performing the final Vercel production deployment/health check. **PRODUCTION CLOSED is not claimed until that final gate is completed.**
