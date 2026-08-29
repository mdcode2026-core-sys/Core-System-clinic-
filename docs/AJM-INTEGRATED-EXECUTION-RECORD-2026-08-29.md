# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

The current-cycle execution follows `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, the AJM implementation plan, the AJM/UX unified execution plan, and the PJ/AJM/UX reconciliation authority.

Execution principle:

`Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`

## Integrated candidate

The working release candidate is accumulated on AJM execution branch/PR #55 and contains the current AJM-3 through AJM-8 implementation slices plus required integrated validation fixes.

Current candidate head SHA: `7065c52a9d5ba02d6107c85138051baa569b1f81`

PR #55 remains open and unmerged.

## Stage records

### AJM-3 — Workforce & Operations

Status: RELEASE-DEFERRED.

Implemented: staff records, positions, employment history, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped permissions/RLS, bilingual `/workforce` surface.

Hardening: cross-tenant composite foreign-key integrity covers tenant-owned references, including workforce employee/position/user/leave/payroll/commission/recruitment relationships and additional tenant-bound audit/user references.

Validation: TypeScript, I18N, UX domain audits and changed-surface validation have passed in observed CI runs; integrated CI remains in progress on the latest candidate.

Production DB: workforce tables are not yet applied to the live database in this acceptance cycle; production runtime acceptance is deferred to the integrated release gate.

### AJM-4 — Communications

Status: RELEASE-DEFERRED.

Reuse decision: existing `patient_portal_messages`, `notification_queue`, and tenant notification preferences remain the patient-facing/system notification foundation. No second patient messaging system was introduced.

Implemented additions: internal conversations, participants, internal messages/notes, operational communication requests, templates, tenant-scoped RLS and permission vocabulary; canonical `/communications` surface.

Boundary: Communications does not own Agenda, Clinical, Financial, Workforce, Follow-up, or coordination execution.

### AJM-5 — Journey Coordination

Status: RELEASE-DEFERRED.

Implemented: one general `operational_work_items` model covering task/request/handoff/next-action/escalation semantics, append-only work history, My Work/Work Center, assignment and status transitions.

Hardening: operational work history now has an explicit authenticated insert policy so the server actions' append-only audit writes are actually permitted under RLS.

Boundary: Coordination is not a second Agenda, Clinical workflow, Treatment Plan, Follow-up, Communications, Workforce, or Analytics engine.

### AJM-6 — Insights

Status: RELEASE-DEFERRED.

Reused the existing KPI registry/engine and extended it with workforce, communications and coordination categories rather than creating a separate analytics source of truth.

### AJM-7 — PJ & Cross-Domain Integration Hardening

Status: RELEASE-DEFERRED.

Implemented explicit source/context references between Communications and Coordination. Domain ownership remains with the source domain. The work layer consumes context instead of recreating source records.

Required integrated paths remain part of final runtime verification, including Agenda→Coordination, Agenda→Workforce, Treatment Plan→Financial, Treatment Plan→Coordination, Follow-up→Coordination, Communications↔Coordination, Portal↔Communications, Portal↔Financial, Portal↔Treatment Plan and Portal↔Coordination.

### AJM-8 — Security, Privacy, Controls & Runtime Closure

Status: PARTIALLY CLOSED / BLOCKED at production gate.

Implemented: RLS mutation-path hardening, assignee authorization for work transitions, sensitive workforce read-policy narrowing, tenant-bound reference hardening, integrated static audit tooling.

The integrated static audit checks required governance files, canonical surfaces, server authorization and prohibited Communications ownership of Agenda/Treatment Plan creation.

## Latest validation findings and fixes

- TypeScript mismatch in the analytics category expansion was fixed by using the canonical `AnalyticsCategory` type.
- Stage 10 audit failure was traced to brittle source-format assumptions (`href: ` versus compact `href:` and route parsing). The audit was made formatting-robust without weakening the semantic checks.
- Integrated static audit was likewise hardened against formatting assumptions and expanded to verify AJM route uniqueness, server permission checks, KPI category consolidation and Communications ownership boundaries.
- Coordination runtime code was inspected against its RLS. The original migration had no INSERT policy on `operational_work_history` even though server actions append history. An explicit tenant/user/work-scoped insert policy was added before production migration.
- Additional tenant-integrity constraints were added for workforce audit/user references and communication patient/user references so globally unique UUIDs cannot create cross-tenant relationships.
- Latest observed I18N Verification completed successfully.
- Latest observed Stage 10 validation reached TypeScript, I18N, UX audits, Stage 10 Sidebar and changed-surface ESLint successfully; production build was still running at the last job inspection.
- Latest Stage 12 validation reached all security/I18N/UX/mobile gates successfully; production build was still running at the last inspection.
- All required workflow runs for the current candidate have not yet completed, so no all-green CI claim is made.

## Supabase migration state

The current-cycle AJM-3+ migration files are present in PR #55 in dependency order:

1. `20260829160000_ajm_3_workforce_foundation.sql`
2. `20260829160500_ajm_3_seed_workforce_leave_types.sql`
3. `20260829161500_ajm_3_workforce_tenant_integrity.sql`
4. `20260829170000_ajm_4_communications_foundation.sql`
5. `20260829173000_ajm_5_journey_coordination_foundation.sql`
6. `20260829180000_ajm_7_cross_domain_links.sql`
7. `20260829190000_ajm_8_security_runtime_hardening.sql`

The sequence is additive and ordered by dependency: Workforce foundation → seed → Workforce tenant integrity → Communications → Coordination → cross-domain links → security hardening.

Live Supabase was explicitly checked: none of the current-cycle `workforce_%`, `communication_%`, or `operational_work_%` tables are currently present, and none of the migration versions above are recorded in `supabase_migrations.schema_migrations`. Therefore these migrations have NOT been applied to production and must not be treated as live implementation.

No partial/unsafe production migration was applied during this acceptance cycle.

## Current production-gate dependencies

1. Vercel build-rate limit: Production deployment is deferred; this does not block engineering execution.
2. Approved authenticated production E2E identity: not invented; authenticated production E2E remains a release-gate dependency.
3. Live Supabase schema does not yet contain the current-cycle AJM-3+ tables. The complete migration sequence must be applied as one integrated release operation, followed by production verification.

## No false closure

No AJM stage in this record is marked CLOSED solely because historical documents say CLOSED. A stage becomes CLOSED only after implementation, DB/RLS/auth/entitlement validation, tests, build, runtime, UX/PJ reconciliation, production deployment, production verification and evidence satisfy the governing contract.
