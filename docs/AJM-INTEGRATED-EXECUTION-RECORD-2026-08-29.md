# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

The current-cycle execution follows `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, the AJM implementation plan, the AJM/UX unified execution plan, and the PJ/AJM/UX reconciliation authority.

Execution principle:

`Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`

## Integrated candidate

The working release candidate is accumulated on the AJM execution branch/PR and contains the current AJM-3 through AJM-8 implementation slices.

## Stage records

### AJM-3 — Workforce & Operations

Status: RELEASE-DEFERRED.

Implemented: staff records, positions, employment history, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped permissions/RLS, bilingual `/workforce` surface.

Hardening: cross-tenant composite foreign-key integrity was added so tenant context cannot be bypassed by supplying a foreign tenant-owned referenced ID.

Validation: TypeScript and changed-surface lint passed in the observed CI run; the initial I18N audit failure caused by a hardcoded email placeholder was fixed and CI was re-triggered.

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

## Current production-gate dependencies

1. Vercel build-rate limit: Production deployment is deferred; this does not block engineering execution.
2. Approved authenticated production E2E identity: not invented; authenticated production E2E remains a release-gate dependency.
3. Live Supabase schema does not yet contain the current-cycle AJM-3+ tables. These additive migrations must be applied as part of the integrated release, followed by production verification.

## No false closure

No AJM stage in this record is marked CLOSED solely because historical documents say CLOSED. A stage becomes CLOSED only after implementation, DB/RLS/auth/entitlement validation, tests, build, runtime, UX/PJ reconciliation, production deployment, production verification and evidence satisfy the governing contract.
