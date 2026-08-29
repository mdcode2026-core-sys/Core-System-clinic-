# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

The current-cycle execution follows `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, the AJM implementation plan, the AJM/UX unified execution plan, and the PJ/AJM/UX reconciliation authority.

Execution principle:

`Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`

## Integrated candidate

The working release candidate is accumulated on the AJM execution branch/PR #55 and contains the current AJM-3 through AJM-8 implementation slices.

Current candidate head SHA: `eaf565d4952d4d429e18db68b5965da9b48cb3af`

Current PR merge-test SHA observed before the latest head update: `4aeff289ab8b93bc66939f665ad7fa257eeddbde`.

## Stage records

### AJM-3 — Workforce & Operations

Status: RELEASE-DEFERRED.

Implemented: staff records, positions, employment history, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped permissions/RLS, bilingual `/workforce` surface.

Hardening: cross-tenant composite foreign-key integrity was added so tenant context cannot be bypassed by supplying a foreign tenant-owned referenced ID.

Validation: TypeScript passed after fixing the analytics category typing exposed by the integrated CI. I18N audit/parity and multiple UX gates passed in the latest observed run. Changed-surface validation continues on the latest candidate.

Production DB: workforce tables are not yet applied to the live database in this acceptance cycle; therefore production runtime acceptance is deferred to the integrated release gate.

### AJM-4 — Communications

Status: RELEASE-DEFERRED.

Reuse decision: existing `patient_portal_messages`, `notification_queue`, and tenant notification preferences remain the patient-facing/system notification foundation. No second patient messaging system was introduced.

Implemented additions: internal conversations, participants, internal messages/notes, operational communication requests, templates, tenant-scoped RLS and permission vocabulary; canonical `/communications` surface.

Boundary: Communications does not own Agenda, Clinical, Financial, Workforce, Follow-up, or coordination execution.

### AJM-5 — Journey Coordination

Status: RELEASE-DEFERRED.

Implemented: one general `operational_work_items` model covering task/request/handoff/next-action/escalation semantics, append-only work history, My Work/Work Center, assignment and status transitions.

Boundary: Coordination is not a second Agenda, Clinical workflow, Treatment Plan, Follow-up, Communications, Workforce, or Analytics engine.

### AJM-6 — Insights

Status: RELEASE-DEFERRED.

Reused the existing KPI registry/engine and extended it with workforce, communications, and coordination categories rather than creating a separate analytics source of truth.

### AJM-7 — PJ & Cross-Domain Integration Hardening

Status: RELEASE-DEFERRED.

Implemented explicit source/context references between Communications and Coordination. Domain ownership remains with the source domain. The work layer consumes context instead of recreating source records.

Required integrated paths remain part of final runtime verification, including Agenda→Coordination, Agenda→Workforce, Treatment Plan→Financial, Treatment Plan→Coordination, Follow-up→Coordination, Communications↔Coordination, Portal↔Communications, Portal↔Financial, Portal↔Treatment Plan and Portal↔Coordination.

### AJM-8 — Security, Privacy, Controls & Runtime Closure

Status: PARTIALLY CLOSED / BLOCKED at production gate.

Implemented: RLS mutation-path hardening, assignee authorization for work transitions, sensitive workforce read-policy narrowing, integrated static audit tooling.

The integrated static audit checks required governance files, canonical surfaces and prohibited Communications ownership of Agenda/Treatment Plan creation.

## Latest validation findings and fixes

- The first integrated CI pass exposed a TypeScript mismatch: `AnalyticsCategory` had been expanded with AJM categories while `getKpiDataByCategory` still accepted only legacy categories. Fixed by using the canonical `AnalyticsCategory` type in the analytics engine.
- The next Stage 10 validation exposed a brittle Stage 9 audit assertion that depended on whitespace formatting in `navigationRegistry.ts`. The audit was corrected to validate the semantic dashboard route/permission pair rather than source formatting.
- Latest observed I18N Verification completed successfully.
- Latest observed UX 0–8 validation reached TypeScript, I18N audit/parity, Widget Catalog, Domain Surface, Patient Flow, Patient Context and Global Search successfully before its production-build step completed.
- Additional workflow runs are still in progress on the latest candidate; no final all-green CI claim is made until every required run has completed.

## Supabase migration state

The current-cycle AJM-3+ migration files are present in PR #55 in dependency order:

1. `20260829160000_ajm_3_workforce_foundation.sql`
2. `20260829160500_ajm_3_seed_workforce_leave_types.sql`
3. `20260829161500_ajm_3_workforce_tenant_integrity.sql`
4. `20260829170000_ajm_4_communications_foundation.sql`
5. `20260829173000_ajm_5_journey_coordination_foundation.sql`
6. `20260829180000_ajm_7_cross_domain_links.sql`
7. `20260829190000_ajm_8_security_runtime_hardening.sql`

Live Supabase was explicitly checked: none of the current-cycle `workforce_%`, `communication_%`, or `operational_work_%` tables are currently present, and none of the migration versions above are recorded in `supabase_migrations.schema_migrations`. Therefore these migrations have NOT been applied to production and must not be treated as live implementation.

No partial/unsafe production migration was applied during this acceptance cycle.

## Current production-gate dependencies

1. Vercel build-rate limit: Production deployment is deferred; this does not block engineering execution.
2. Approved authenticated production E2E identity: not invented; authenticated production E2E remains a release-gate dependency.
3. Live Supabase schema does not yet contain the current-cycle AJM-3+ tables. These additive migrations must be applied as part of the integrated release, followed by production verification.

## No false closure

No AJM stage in this record is marked CLOSED solely because historical documents say CLOSED. A stage becomes CLOSED only after implementation, DB/RLS/auth/entitlement validation, tests, build, runtime, UX/PJ reconciliation, production deployment, production verification and evidence satisfy the governing contract.