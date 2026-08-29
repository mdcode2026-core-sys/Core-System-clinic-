# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

The current-cycle execution follows `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, the AJM implementation plan, the AJM/UX unified execution plan, and the PJ/AJM/UX reconciliation authority.

Execution principle:

`Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`

## Integrated candidate

The working release candidate is accumulated on AJM execution branch/PR #55 and contains the current AJM-3 through AJM-8 implementation slices plus required integrated validation fixes.

Current candidate head SHA: `e55f0e503138d8569eaca67c4aeaeed7a4845dcd`

PR #55 remains open and unmerged.

## Stage records

### AJM-3 — Workforce & Operations

Status: RELEASE-DEFERRED.

Implemented: staff records, positions, employment history, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped permissions/RLS, bilingual `/workforce` surface.

Hardening: cross-tenant composite foreign-key integrity covers tenant-owned references, including workforce employee/position/user/leave/payroll/commission/recruitment relationships and additional tenant-bound audit/user references.

### AJM-4 — Communications

Status: RELEASE-DEFERRED.

Implemented internal conversations, participants, messages/notes, operational communication requests and templates while reusing existing Patient Portal messaging/notification infrastructure. Communications does not own Agenda, Clinical, Financial, Workforce, Follow-up or coordination execution.

### AJM-5 — Journey Coordination

Status: RELEASE-DEFERRED.

Implemented one canonical `operational_work_items` model for task/request/handoff/next-action/escalation semantics, append-only work history, assignment and status transitions, and Work Center.

RLS hardening added explicit authenticated history insertion for authorized actors, matching the actual server action write path.

### AJM-6 — Insights

Status: RELEASE-DEFERRED.

Reused the existing KPI registry/engine and extended it with workforce, communications and coordination categories. No parallel analytics source of truth was introduced.

### AJM-7 — PJ & Cross-Domain Integration Hardening

Status: RELEASE-DEFERRED.

Implemented explicit source/context references between Communications and Coordination while preserving source-domain ownership. The work layer consumes domain context rather than recreating domain lifecycles.

### AJM-8 — Security, Privacy, Controls & Runtime Closure

Status: PARTIALLY CLOSED / BLOCKED at production gate.

Implemented RLS mutation-path hardening, assignee authorization, sensitive workforce read-policy narrowing, tenant-bound reference hardening and integrated static audit tooling.

## Validation and defect history

- Analytics category typing mismatch: diagnosed and fixed with the canonical `AnalyticsCategory` type.
- Stage 10 Sidebar audit: diagnosed as brittle formatting/source-parsing assertions; audit made formatting-robust without weakening semantic checks.
- Integrated AJM static audit: hardened against formatting assumptions and expanded for route uniqueness, server authorization, KPI consolidation and Communications ownership boundaries. The Workforce permission assertion was then corrected to match the actual mutation permission model without weakening server authorization requirements.
- Operational work history RLS: diagnosed missing INSERT policy against actual server-action behavior; explicit tenant/user/work-scoped INSERT policy added.
- Tenant integrity: additional same-tenant foreign keys added for Workforce audit/user references and Communications patient/user references.
- Integrated migration audit added and wired into the Stage 15 validation workflow.
- Candidate `e55f0e503138d8569eaca67c4aeaeed7a4845dcd` completed all 10 observed pull-request workflow runs successfully: I18N Verification, Stage 8, Stage 9, Stage 10, Stage 11, Stage 12, Stage 13 Runtime E2E, Stage 14 Legacy Cleanup, Stage 15 Documentation Closure, and UX Stages 0-8 CI.
- Stage 15 completed TypeScript, lint, I18N audit/parity, UX audits, mobile/security/legacy checks, AJM integrated static audit, AJM migration sequence audit, documentation audit, and Production build successfully.

## Integrated migration sequence

PR #55 contains this dependency-ordered sequence:

1. `20260829160000_ajm_3_workforce_foundation.sql`
2. `20260829160500_ajm_3_seed_workforce_leave_types.sql`
3. `20260829161500_ajm_3_workforce_tenant_integrity.sql`
4. `20260829170000_ajm_4_communications_foundation.sql`
5. `20260829173000_ajm_5_journey_coordination_foundation.sql`
6. `20260829180000_ajm_7_cross_domain_links.sql`
7. `20260829190000_ajm_8_security_runtime_hardening.sql`

A repository audit checks the exact sequence, timestamp ordering, non-destructive DDL, required RLS/security invariants and absence of unexpected AJM migrations in the integrated timestamp window.

Live Supabase was checked directly. None of the current-cycle Workforce/Communications/Operational Work tables are currently present, and none of the seven migration versions above are recorded in `supabase_migrations.schema_migrations`. No partial production migration has been applied.

## Integrated acceptance result before Production Gate

The candidate is now **INTEGRATED RELEASE-READY / PRODUCTION-DEFERRED** for the non-production acceptance gates: the full observed CI set is green and the integrated AJM static/migration audits pass. This status does not imply Production deployment or Production authorization/tenant-isolation acceptance.

The candidate has not been merged to `main` because the Master Prompt requires Production acceptance before final closure and the current Production Gate is not yet satisfiable.

## Production gate dependencies

1. Vercel build-rate limit remains a Production Gate dependency only; it does not block engineering or CI.
2. Approved authenticated Production E2E identity remains unavailable and is not invented.
3. Production DB migration must be applied as the complete integrated sequence, not piecemeal, followed by verification.

## Required final Production Gate sequence

`Integrated Candidate → final validation → complete migration sequence → one Production deployment where feasible → Production verification → authenticated E2E with approved identity → evidence/documentation → Final Production Closure`

## Current acceptance state

AJM-3 through AJM-7: `RELEASE-DEFERRED` pending the final Production Gate.

AJM-8: `PARTIALLY CLOSED / BLOCKED at Production Gate`.

Integrated candidate: `INTEGRATED RELEASE-READY / PRODUCTION-DEFERRED`.

No AJM Stage is marked `CLOSED`.

Closure requires implementation, AJM/UX/PJ reconciliation, DB/RLS/Auth/Entitlement validation, critical workflows, build, Production deployment, Production verification, authenticated E2E where required, documentation and complete evidence as required by the Master Prompt.
