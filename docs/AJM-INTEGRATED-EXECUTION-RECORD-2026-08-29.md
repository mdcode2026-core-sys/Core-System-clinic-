# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

Authoritative sources: `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, AJM implementation plan, AJM/UX unified execution plan, and PJ/AJM/UX reconciliation authority.

Execution principle: `Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`.

## Integrated release

PR #55 — `feat(AJM): Integrated AJM-3 → AJM-8 Release Candidate` was merged to `main` only after the integrated non-production acceptance gates passed.

Integrated merge SHA: `17345fac5bb41a8fa7c48cc0cdfd9c85e0fb690e`

Current tested/documented main release SHA: `9d20c6a0f039966f6ea5f13ede1ac3bcc9bf1563`

The current release SHA contains the integrated application plus the final documentation/gate reconciliation commit. No application/runtime code is introduced by the documentation-only reconciliation commit.

## Integrated stages

AJM-3: Workforce & Operations — staff, positions, employment, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped authorization/RLS, bilingual `/workforce`.

AJM-4: Communications — internal conversations, participants, messages/notes, operational communication requests and templates, reusing existing Patient Portal messaging/notification infrastructure.

AJM-5: Journey Coordination — one canonical `operational_work_items` model with history, assignment, status and Work Center; no second task/workflow engine.

AJM-6: Insights — existing KPI registry/engine extended with workforce, communications and coordination categories; no parallel analytics source of truth.

AJM-7: PJ/cross-domain integration — explicit Communications↔Coordination references while preserving Agenda, Clinical, Financial, Workforce, Follow-up and other source-domain ownership.

AJM-8: RLS/security hardening, authorization enforcement, tenant-bound references and integrated static/migration audits.

## Integrated validation

The final observed non-production candidate validation set passed TypeScript, lint, I18N audit/parity, UX 0-8, Stage 8-15 checks, runtime E2E, legacy cleanup, AJM integrated static audit and AJM migration sequence audit.

Defects found during acceptance were diagnosed and corrected, including Analytics typing, brittle sidebar/static assertions, Workforce authorization assertions, work-history RLS, and missing tenant composite keys required by cross-tenant foreign keys.

The latest main status has no application/test failure. The remaining GitHub status failure is the Vercel deployment-rate-limit status only; the Production Candidate Handoff workflow itself completed successfully.

## Production database readiness

The complete dependency-ordered AJM migration sequence was validated as one unit and applied to the live Supabase project:

1. `20260829160000_ajm_3_workforce_foundation.sql`
2. `20260829160500_ajm_3_seed_workforce_leave_types.sql`
3. `20260829161500_ajm_3_workforce_tenant_integrity.sql`
4. `20260829170000_ajm_4_communications_foundation.sql`
5. `20260829173000_ajm_5_journey_coordination_foundation.sql`
6. `20260829180000_ajm_7_cross_domain_links.sql`
7. `20260829190000_ajm_8_security_runtime_hardening.sql`

The initial live rehearsal exposed required composite-key dependencies on existing `clinic_users` and `clinic_patients`; those dependencies were corrected before the sequence was successfully applied.

The integrated migration audit enforces presence, ordering, non-destructive DDL, required AJM structures, and absence of unexpected AJM migrations in the integrated timestamp window.

Live verification confirms the resulting Workforce, Communications and Coordination schema exists with RLS enabled and tenant-bound integrity constraints present.

## Pre-Vercel release readiness

The integrated release has completed the engineering/non-production gates required before a Vercel Production deployment.

Production Candidate state: `INTEGRATED RELEASE-READY / PRODUCTION-DEFERRED`.

The candidate is not marked CLOSED because Production deployment and Production verification have not yet occurred.

## Production gate dependencies

1. Vercel Production deployment is currently blocked by the platform build/deployment rate limit. The GitHub status explicitly reports: `Deployment rate limited — retry in 24 hours.` No additional Production deployment is attempted while this blocker remains.
2. Authenticated Production E2E requires an approved test identity/session. No credentials are invented. This remains a Production Verification Dependency for proving authenticated authorization and tenant isolation through real Production workflows.

The Production Candidate Handoff workflow is configured against the actual `UX Stages 0-8 CI` workflow and main-push validation; it completed successfully for the current main release SHA. Production deployment remains delegated to the Vercel Git integration.

## Final pre-Vercel checklist

- [x] AJM-0→AJM-8 implementation integrated
- [x] AJM↔UX/PJ reconciliation completed for the integrated candidate
- [x] terminology governance reconciled
- [x] authorization/effective permissions checked
- [x] entitlements/visibility boundaries checked
- [x] RLS and tenant-bound integrity checked
- [x] canonical data ownership and duplicate workflow/source-of-truth audit completed
- [x] Navigation/visibility checked
- [x] Arabic/English/i18n validation passed
- [x] responsive/mobile validation passed
- [x] non-production runtime validation passed
- [x] integrated migration sequence audited and applied coherently
- [x] GitHub non-production validation completed
- [x] rollback/release evidence recorded
- [x] exact release SHA recorded
- [ ] Vercel Production deployment
- [ ] Production runtime verification
- [ ] Authenticated Production E2E with approved identity
- [ ] Final Production Closure

## Required final Production sequence

`Final accepted main build → Production deployment → Production runtime verification → authenticated E2E with approved identity → evidence/documentation → Final Production Closure`.

No Stage or the overall AJM release is marked `CLOSED` until every required Production condition is actually evidenced.
