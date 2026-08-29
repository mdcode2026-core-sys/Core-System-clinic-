# CORE SYSTEM — AJM Integrated Execution Record

Date: 2026-08-29
Acceptance mode: current-cycle acceptance; historical CLOSED labels are not accepted as current evidence.

## Governing execution

Authoritative sources: `docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md`, AJM implementation plan, AJM/UX unified execution plan, and PJ/AJM/UX reconciliation authority.

Execution principle: `Inspect → Reuse → Reconcile → Extend → Create only when genuinely required`

## Integrated candidate

PR #55 — `feat(AJM): Integrated AJM-3 → AJM-8 Release Candidate`

Current candidate branch: `ajm/ajm-3-workforce-foundation-2026-08-29`
Current candidate head at record update: `f606c2cf199aa14070a22234e87cc793f8b13983`
PR remains open and unmerged.

## Integrated stages

AJM-3: Workforce & Operations — staff, positions, employment, schedules/capacity inputs, attendance, leave, payroll foundation, benefits, commissions, recruitment foundation, tenant-scoped authorization/RLS, bilingual `/workforce`.

AJM-4: Communications — internal conversations, participants, messages/notes, operational communication requests and templates; existing Patient Portal messaging/notification infrastructure is reused.

AJM-5: Journey Coordination — one canonical `operational_work_items` model with history, assignment, status and Work Center; no second task/workflow engine.

AJM-6: Insights — existing KPI registry/engine extended with workforce, communications and coordination categories.

AJM-7: PJ/cross-domain integration — explicit Communications↔Coordination references while preserving Agenda, Clinical, Financial, Workforce, Follow-up and other source-domain ownership.

AJM-8: RLS/security hardening, authorization enforcement, tenant-bound references and integrated static/migration audits.

No stage is CLOSED until the complete Production Gate is satisfied.

## Defects corrected during integrated acceptance

- Analytics category typing mismatch fixed using canonical `AnalyticsCategory`.
- Stage 10 sidebar audit made semantic/formatting-robust without weakening checks.
- Integrated AJM static audit corrected to validate governed Workforce mutation permissions.
- Operational work history INSERT RLS aligned with actual server-action behavior.
- Tenant-bound composite foreign keys added for Workforce, Communications, Coordination and related user/patient references.
- AJM migration sequence audit added to Stage 15 CI.
- Production migration dependency failure discovered during live rehearsal: composite FK references required existing tenant composite keys on `clinic_users` and `clinic_patients`. The migration sequence was corrected before continuing.

## CI evidence

For candidate `e55f0e503138d8569eaca67c4aeaeed7a4845dcd`, all 10 observed pull-request workflows completed successfully, including I18N, UX 0-8, Stage 8-15, and Stage 13 Runtime E2E.

After the migration fixes, a new CI cycle was triggered for `f606c2cf199aa14070a22234e87cc793f8b13983`. I18N completed successfully; the remaining PR workflows are being evaluated against this latest head before merge eligibility.

## Integrated Production DB migration sequence

The seven dependency-ordered migrations are:

1. `20260829160000_ajm_3_workforce_foundation.sql`
2. `20260829160500_ajm_3_seed_workforce_leave_types.sql`
3. `20260829161500_ajm_3_workforce_tenant_integrity.sql`
4. `20260829170000_ajm_4_communications_foundation.sql`
5. `20260829173000_ajm_5_journey_coordination_foundation.sql`
6. `20260829180000_ajm_7_cross_domain_links.sql`
7. `20260829190000_ajm_8_security_runtime_hardening.sql`

The complete sequence has now been applied to the live Supabase project in dependency order. The Supabase migration history was reconciled after the connector recorded generated execution timestamps, restoring the repository migration versions as the authoritative migration versions.

Live schema verification confirms all Workforce, Communications and Coordination tables exist with RLS enabled. Tenant-integrity verification currently reports 38 same-tenant foreign-key constraints and 11 tenant composite keys across the governed schema.

No partial AJM migration remains unapplied from this integrated sequence.

## Production deployment state

Vercel currently has successful READY deployments for the PR branch, including the latest candidate-related commits. Production deployment has not yet been performed from this final accepted head.

Production deployment remains gated until the latest-head CI/acceptance checks are complete and the final deployment is made from the accepted integrated candidate.

## Authenticated Production E2E dependency

No production credentials are invented. If an approved authenticated production test identity is unavailable, authenticated Production E2E remains explicitly `Production Verification Dependency`; this prevents false authorization/tenant-isolation claims.

## Current acceptance state

Integrated candidate: `RELEASE-READY / PRODUCTION-DEFERRED` while latest-head CI and final Production Gate remain pending.

AJM-3 through AJM-7: `RELEASE-DEFERRED` pending final Production Gate.

AJM-8: `PARTIALLY CLOSED / BLOCKED at Production Gate` until final Production verification is complete.

Final Production Closure: `NOT CLOSED`.

## Required final sequence

`Latest-head CI → Integrated Acceptance Audit → final migration/schema verification → accepted-head Production deployment → Production runtime verification → authenticated E2E with approved identity → evidence/documentation → Final Production Closure`.
