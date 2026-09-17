# CSAPI Gate 01 — D2 Database Foundations Implementation Record

**Date:** 2026-09-17  
**Stage:** D2 — Database Foundations  
**Status:** PREFLIGHT COMPLETE / ISOLATED DATABASE REQUIRED  
**Implementation branch:** `implementation/csapi-gate-01-d2-database-foundations-2026-09-17`  
**Starting candidate:** `b9470061da5c188adff40b0956ce03a540beccf8`  
**Parent design:** `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DESIGN-PACKET-2026-09-17.md`

## Objective

Implement the first additive database foundation for the canonical Patient Flow model without changing production lifecycle behavior before isolated verification.

## D2 preflight findings

Live Supabase project `core-system-clinic` is healthy at the project level, but its default `main` development branch record currently reports `MIGRATIONS_FAILED`. The live production database contains the existing Visit anchor and operational work structures, but no first-class `clinical_work_sessions`, `patient_flow_queue_entries`, or `patient_flow_events` tables were found.

The existing `clinic_visit_sessions` table remains the current Visit/session anchor. Its legacy six-state `session_status` remains in place. Existing Visit→Patient/Doctor/Room/Agenda tenant-scoped integrity and Visit→Procedure linkage were confirmed during preflight.

The production `schema_migrations` table contains migrations through `20260915151711`, including `optimize_clinic_patients_select_rls`, while the repository branch does not currently contain a matching migration file under `supabase/migrations`. This is migration-history drift and must be reconciled before D2 migration authorship is treated as canonical.

## Safety decision

No production DDL or lifecycle mutation has been performed in D2 preflight.

The D2 implementation must use a disposable Supabase development branch so schema iteration and verification are isolated from production data and behavior. The Supabase tool reports the current branch cost as **0.01344 per hour** for this organization. Creation requires explicit cost confirmation before the branch can be provisioned.

## Planned D2 foundations

Subject to isolated-schema review:

1. `clinical_work_sessions` — child execution units under a stable Visit.
2. `patient_flow_queue_entries` — historical waiting intervals and ordering.
3. `patient_flow_events` — append-only business lifecycle events.
4. Only genuinely aggregate-level additive Visit fields, if the finalized schema requires them.
5. Tenant-safe foreign keys, indexes, constraints and RLS consistent with the existing repository security model.

The implementation must preserve existing domain ownership and must not introduce a second lifecycle engine.

## Exit requirements

- Isolated Supabase branch provisioned and healthy.
- Migration drift understood/reconciled for the D2 working baseline.
- D2 migration iterated and verified against isolated schema.
- Tenant integrity and RLS verified.
- New structures do not alter production behavior.
- Canonical migration file committed to the D2 GitHub branch.
- D2 verification record updated with exact database evidence and CI evidence.

**Current decision:** D2 is ready for isolated database provisioning, but no SQL migration is authorized until the required Supabase branch cost confirmation is completed.
