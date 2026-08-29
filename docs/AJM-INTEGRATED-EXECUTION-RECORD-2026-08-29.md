# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

Authoritative sources: `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, AJM implementation plan, AJM/UX unified execution plan, and PJ/AJM/UX reconciliation authority.

Execution principle: `Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`.

## Integrated release

PR #55 — `feat(AJM): Integrated AJM-3 → AJM-8 Release Candidate` has been merged to `main` after the integrated non-production acceptance gates passed.

Merge SHA: `17345fac5bb41a8fa7c48cc0cdfd9c85e0fb690e`

The post-merge documentation reconciliation commit is the current documentation head; it contains documentation only and does not alter application/runtime code.

## Integrated stages

AJM-3: Workforce & Operations — staff, positions, employment, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped authorization/RLS, bilingual `/workforce`.

AJM-4: Communications — internal conversations, participants, messages/notes, operational communication requests and templates, reusing existing Patient Portal messaging/notification infrastructure.

AJM-5: Journey Coordination — one canonical `operational_work_items` model with history, assignment, status and Work Center; no second task/workflow engine.

AJM-6: Insights — existing KPI registry/engine extended with workforce, communications and coordination categories; no parallel analytics source of truth.

AJM-7: PJ/cross-domain integration — explicit Communications↔Coordination references while preserving Agenda, Clinical, Financial, Workforce, Follow-up and other source-domain ownership.

AJM-8: RLS/security hardening, authorization enforcement, tenant-bound references and integrated static/migration audits.

## Integrated validation

The final observed candidate validation set passed TypeScript, lint, I18N audit/parity, UX 0-8, Stage 8-15 checks, runtime E2E, legacy cleanup, AJM integrated static audit and AJM migration sequence audit.

Defects found during acceptance were diagnosed and corrected, including Analytics typing, brittle sidebar/static assertions, Workforce authorization assertions, work-history RLS, and missing tenant composite keys required by cross-tenant foreign keys.

## Production database

The complete dependency-ordered sequence was applied to the live Supabase project:

1. `20260829160000_ajm_3_workforce_foundation.sql`
2. `20260829160500_ajm_3_seed_workforce_leave_types.sql`
3. `20260829161500_ajm_3_workforce_tenant_integrity.sql`
4. `20260829170000_ajm_4_communications_foundation.sql`
5. `20260829173000_ajm_5_journey_coordination_foundation.sql`
6. `20260829180000_ajm_7_cross_domain_links.sql`
7. `20260829190000_ajm_8_security_runtime_hardening.sql`

The initial live rehearsal exposed required composite-key dependencies on existing `clinic_users` and `clinic_patients`; those dependencies were corrected in the candidate before the sequence was successfully applied.

Migration history was reconciled so the authoritative repository versions are recorded for the applied sequence. Live schema verification confirms all Workforce, Communications and Coordination tables exist with RLS enabled, with tenant-bound integrity constraints present.

## Production deployment gate

Vercel has READY preview deployments for the integrated candidate, but no verified Production deployment from the final accepted integrated release is recorded yet.

The Production Candidate Handoff workflow was also corrected to reference the actual `UX Stages 0-8 CI` workflow and to validate main pushes; production deployment remains delegated to the Vercel Git integration.

## Authenticated Production E2E

No credentials are invented. An approved authenticated Production E2E identity/session is still a required Production Verification Dependency for proving authorization and tenant isolation through real authenticated Production workflows.

## Current state

Integrated AJM release: `PRODUCTION-GATE READY / VERIFICATION DEFERRED`.

AJM-3 through AJM-8: implementation and non-production acceptance complete; final Production Gate pending.

Final Production Closure: `NOT CLOSED`.

## Required final Production sequence

`Final accepted main build → Production deployment → Production runtime verification → authenticated E2E with approved identity → evidence/documentation → Final Production Closure`.

No Stage or the overall AJM release is marked `CLOSED` until every required Production condition is actually evidenced.
