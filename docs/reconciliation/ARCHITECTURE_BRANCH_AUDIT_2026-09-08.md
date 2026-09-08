# CORE SYSTEM — Architecture Branch Audit — 2026-09-08

This audit is part of branch reconciliation. Branch-vs-main decisions are based on commit/file evidence plus the authoritative architecture, not Ahead/Behind alone.

## Authorities applied

- `ARCHITECTURE_DECISIONS.md`: current tenant/user model (`master_tenants` / `clinic_users`), canonical permission architecture, subscription/license layers, medical master-library/service distinction, and module principle.
- `MASTER_ROADMAP.md` / current handoff/index: sequencing and current implementation state.
- `PJ-MASTER-DOCS`: authoritative Patient Journey decisions.
- Current `main` source: canonical executable implementation.
- Production Supabase state: authority for already-effective database/security behavior.

## Architectural tests

1. No revival of legacy `tenants` / `users` signup architecture.
2. No competing permission engine or legacy role-resolution path.
3. Workspace remains a presentation/working-surface layer and is not conflated with Patient Journey or tenant administration.
4. Modules remain independent and reuse the canonical navigation, permission and feature/entitlement layers.
5. Approved Patient Journey workflow remains authoritative.
6. Medical Procedure and Service remain distinct concepts.
7. Migrations are admitted only after lineage/dependency/runtime verification; already-effective production security changes are not duplicated.

## Decisions

| Branch | Evidence against current main | Architectural result |
|---|---|---|
| `audit/i18n-fix-20260906` | Older locale/navigation variants; current canonical analytics/navigation already present | Superseded — No Extraction Needed |
| `fix/settings-reconciliation-build` | Reintroduces inline role-template key construction instead of canonical helper | Superseded — No Extraction Needed |
| `fix/pj-stage6-clinic-admin-workspaces` | Reintroduces legacy `clinic_users.role` / `role_template_id` resolution instead of canonical `role_id` | Superseded — No Extraction Needed |
| `ux-financial-resources-final` | Historical financial UI/navigation variants; checked current financial implementation already present | Superseded — No Extraction Needed |
| `ajm/ajm-0-baseline-readiness` | Documentation-only historical readiness artifact | Superseded — No Extraction Needed |
| `ajm/ajm-2-closure-hardening` | Old financial/KPI variants plus historical feature-flag RLS migration | Superseded — No Extraction Needed |
| `ajm/ajm-2-e2e-reconciliation` | Old financial/inventory/invoice routing and old migrations; conflicts with current integrated surface | Superseded — No Extraction Needed |
| `ajm/ajm-2-financial-resources-foundation` | Historical foundation; current main has evolved canonical financial implementation | Superseded — No Extraction Needed |
| `ajm/ajm-2-financial-resources-surface` | Historical entitlement/workspace/navigation variant; current main has evolved canonical implementation | Superseded — No Extraction Needed |
| `ajm/ajm-3-workforce-foundation-2026-08-29` | Historical workforce/communications/analytics base; current main contains later validated workforce closure | Superseded — No Extraction Needed |
| `ajm/ajm-4-communications-foundation-2026-08-29` | Historical communications/workforce base; current main already has canonical communications + work-item integration | Superseded — No Extraction Needed |
| `ajm/ajm-5-journey-coordination-2026-08-29` | Historical coordination base; current main already contains canonical work-item integration | Superseded — No Extraction Needed |
| `ajm/ajm-6-insights-2026-08-29` | Historical analytics/KPI/navigation variants | Superseded — No Extraction Needed |
| `ajm/ajm-7-integration-hardening-2026-08-29` | Historical integration/security variants superseded by later validated closure | Superseded — No Extraction Needed |
| `feat/global-ux-stage-3-workspace-foundation` | Older workspace hook/registry/renderer generation | Superseded — No Extraction Needed |
| `feat/global-ux-stage-4-workspace-personalization` | Personalization already implemented in current canonical Workspace path | Superseded — No Extraction Needed |
| `fix/workspace-sidebar-and-assignment*` | Older reduced widget/navigation/workspace-surface variants | Superseded — No Extraction Needed |
| `architecture/workspace-patient-flow-linkage-2026-09-01` | Documentation-only linkage matrix; executable separation/linkage already present in main | Superseded — No Extraction Needed |
| `pj-stage5-room-resource` | `ahead_by=0`, no changed files | No Pending Work |
| `pj-stage7-doctor-visit` | `ahead_by=0`, no changed files | No Pending Work |
| `pj-stage8-treatment-plan` | Original Stage 8 package is superseded by later treatment-plan implementation/fixes already in main | Superseded — No Extraction Needed |
| `i18n-completion-2026-08-24` | Large historical/destructive UI changes; later render-time I18N architecture is current | Superseded — No Extraction Needed |
| `stage-8-global-search` | Current main already contains canonical global search integration | Superseded — No Extraction Needed |
| `stage12-final-ready-5` | `ahead_by=0`, no changed files | No Pending Work |
| `stage13-runtime-e2e-validation` | `ahead_by=0`, no changed files | No Pending Work |
| `stage14-legacy-cleanup` | `ahead_by=0`, no changed files | No Pending Work |
| `stage15-cleanup-temp` | `ahead_by=0`, no changed files | No Pending Work |
| `audit/lint-report-20260906` | `ahead_by=0`, no changed files | No Pending Work |

## Important evidence

`ajm/ajm-3-workforce-foundation-2026-08-29`, `ajm/ajm-4-communications-foundation-2026-08-29`, and `ajm/ajm-5-journey-coordination-2026-08-29` were not discarded merely because they were old: current main was checked and contains the corresponding later canonical implementation. For example, current `src/domain/workforce/workforce.actions.ts` and `src/domain/communications/communications.actions.ts` use the current permission engine and tenant context, and communications requests integrate with the existing journey-coordination work-item model.

For Workspace, current `src/features/workspace/WorkspaceRenderer.tsx` already exposes customization, widget availability, persistence, reordering and workspace surfaces; historical stage-3/stage-4 implementations therefore do not need wholesale extraction.

For Treatment Plan, repository commit history shows later Stage 8 fixes and Stage 13/15 integration fixes after the historical `pj-stage8-treatment-plan` branch, establishing that the branch is not the final canonical implementation.

## Security/migration rule

The four workforce security privilege migrations were isolated. Production read-only inspection confirmed the target trigger functions exist and `EXECUTE` is denied to `public`, `anon`, and `authenticated`. Production migration history also contains equivalent recorded security intent, so the historical branch migrations were not duplicated in production.

## Validation relationship

The latest complete local/Codespaces reality validation run (`34173353092`) succeeded against `b806a1ecde1837636616b12542e85c8fe0264657`. Current `main` (`7dfe5717043d37d70fc9122106f4793bb1802474`) differs from that validated application commit only in reconciliation documentation; no application-code delta exists in the compare.

This document records the architectural reconciliation as an integral part of the final audit rather than as a separate review exercise.
