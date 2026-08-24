# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Status:** ACTIVE DEVELOPMENT / PJ STAGE TRACK
**Last Updated:** 2026-08-24

## Purpose

This is the single living operational handoff. It describes the current implementation state only. Historical progress reports, dated session plans and old implementation packages are archived and must not be used as current instructions.

## Authority

For implementation reality use, in order:

1. Implemented repository and live Supabase state.
2. Accepted architectural decisions and their later superseding decisions.
3. PJ-MASTER-DOCS and approved PJ decisions for Patient Journey scope.
4. This handoff for current operational status.
5. `CHANGELOG.md` for historical change evidence.

See `DOCUMENTATION_STATUS.md` for the documentation authority registry.

## Current PJ Status

| Stage | Status | Notes |
|---|---|---|
| PJ Stage 0–10 | CLOSED | Accepted prior stages. Do not reopen settled decisions. |
| PJ Stage 11 | CLOSED | Stage closure accepted. |
| PJ Stage 12 | PHASE-CLOSED | Patient Portal foundation manually verified. `ADR-012-PATIENT-PORTAL.md` is the architectural reference. |
| PJ Stage 13 | COMPLETED | Follow-on PJ implementation state retained in repository history. |
| PJ Stage 14 | COMPLETED | Temporary Stage 14 test seed removed. |
| PJ Stage 15 | COMPLETED FOR CURRENT SCOPE | Documentation consolidation and persistent E2E dataset established. Treatment-plan multi-stage scenarios and standalone Treatment Plans workspace are operational. |

## Patient Journey E2E Baseline

`PJ_E2E_DEMO_DATASET.md` is the persistent synthetic test-data contract.

The tenant associated with the designated clinic-admin verification account `xalkair@gmail.com` contains labelled synthetic scenarios covering:

- patients and patient lifecycle states;
- appointments: scheduled, confirmed, arrived, in-session, completed, no-show, cancelled and rescheduled;
- visit sessions and clinical closure states;
- procedures;
- multi-stage treatment plans with historical and future stages;
- treatment-plan lifecycle states and item states;
- medical-file lifecycle states;
- follow-up lifecycle and delivery states;
- notification queue states;
- success, failure and exception paths.

Random disposable demo data should not replace this baseline. Extend the labelled E2E dataset when a new scenario is required.

## Treatment Plans

The standalone Treatment Plans workspace displays existing tenant treatment plans without requiring a patient context. Patient context remains required for patient-specific create/manage operations.

The persistent E2E data includes completed historical courses, active multi-session courses, on-hold plans, cancelled courses, future courses and mixed historical/future stage timelines.

## Architecture Decisions Currently Binding

- `clinic_owner` is retired from the active architecture and must not be reintroduced.
- Clinic Admin is the tenant administrator/highest clinic authority.
- Super Admin is the platform owner/lessor and does not operate clinic daily workflows.
- Patient Portal is subscription-controlled and has the approved two-layer public/paid model.
- Patient Journey implementation follows the approved PJ workflow; implementation reality supersedes stale documentation when the repository/database is the evidence.

## Current Schema Reference

`DATABASE_SCHEMA.md` is a live-schema reference generated/reconciled against Supabase on 2026-08-24. It must be refreshed after schema-changing PJ or platform work.

The active tenant model is `master_tenants` + `clinic_users`. Patient Journey schema includes, among others, `clinic_patients`, `master_agenda_events`, `clinic_visit_sessions`, `clinic_visit_procedures`, `clinic_treatment_plans`, `clinic_treatment_plan_items`, `clinic_treatment_plan_visits`, `medical_files`, `medical_file_storage_locations`, `medical_file_sync_events`, `retention_followups`, `notification_queue`, and Patient Portal tables.

## Current Documentation Set

Use:

- `DOCUMENTATION_STATUS.md` — authority/freshness registry.
- `ENGINEERING_CONSTITUTION.md` — engineering governance.
- `ARCHITECTURE_DECISIONS.md` — chronological architectural decisions.
- `MASTER_ROADMAP.md` — product roadmap reconciled to PJ execution.
- `CHANGELOG.md` — historical implementation changes.
- `DATABASE_SCHEMA.md` — current structural database reference.
- `PJ_E2E_DEMO_DATASET.md` — persistent E2E dataset contract.
- `PJ_STAGE15_CLOSURE.md` — Stage 15 closure record.
- `ADR-012-PATIENT-PORTAL.md` — Patient Portal architecture.

## Historical Material

Dated handoffs, progress reports, Kimi packages, old security plans, old roadmap versions and other one-time implementation artifacts live under `/archive/`. They are evidence of past work, not current requirements.

## Next Work

The next PJ/admin stage must begin from the current repository and live database state. Do not resume the old Milestone 3 / Session 11 sequence. Before implementation, reconcile the requested scope against the current PJ decisions and the E2E baseline.

## Verification Rule

A document saying that something exists is not sufficient evidence that it works. For implementation closure, verify repository state, database state and runtime/manual behavior where applicable. If Vercel production runtime is unavailable, use an equivalent repository/database/build/runtime verification path rather than stopping the workflow.
