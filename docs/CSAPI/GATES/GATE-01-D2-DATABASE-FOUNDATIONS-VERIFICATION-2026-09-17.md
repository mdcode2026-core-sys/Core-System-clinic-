# CSAPI Gate 01 — D2 Database Foundations Verification

**Updated:** 2026-09-19  
**Stage:** D2 — Database Foundations  
**Status:** BLOCKED — MIGRATION-CHAIN REPLAY FAILURE  
**Canonical PR:** #168  
**Canonical branch:** `implementation/csapi-gate-01-d2-database-foundations-canonical-2026-09-18`  
**Current known head:** `2d331509e8a709e394dfe0dd819a7a6e5d1a5091`

## Verification method

No paid Supabase hosted Branching is used.

The verification target is the repository's local Supabase stack / CI database, using the migration chain and pgTAP checks.

## Implementation target

- Migration: `supabase/migrations/20260917192500_csapi_gate01_patient_flow_d2_foundations.sql`
- Tests: `supabase/tests/csapi_gate01_d2_database_foundations.sql`
- Runner: `tools/csapi-gate01-d2-database-verification.mjs`

## Latest evidence

GitHub Actions run **35384612530**:

| Check | Result |
|---|---|
| Build applicable lane plan | PASS |
| Engineering | CANCELLED after required D2 lane failure |
| D2 database | FAIL |
| Final gate | FAIL |

The first concrete database replay blocker was:

```
ERROR: insert or update on table "clinic_resources"
violates foreign key constraint "clinic_resources_tenant_id_fkey"
SQLSTATE 23503
```

Migration:

`supabase/migrations/20260830030534_ajm_reality_audit_clinical_resource_scheduling.sql`

Cause: a historical reality-audit fixture inserts resources for a hard-coded Zada tenant that is absent in the clean replay database.

## Interpretation

This failure occurs in the **pre-D2 migration chain**. It does not establish that the D2 Patient Flow tables, constraints, or RLS are incorrect.

The correct objective is to make the repository migration chain deterministically replayable without hiding failures.

## Replay-failure policy

1. A replay defect that prevents D2 verification from reaching the D2 migration may be fixed in the smallest safe, additive/non-breaking way.
2. A genuine unrelated domain defect must not be repaired as part of D2. Record it for its proper workstream/phase.
3. A D2 implementation defect must be repaired within D2 and fully reverified.
4. No workaround may suppress a real migration error solely to make CI green.
5. Workforce/Payroll, Financial, Inventory, Agenda, or other domain migrations encountered during replay are not automatically D2 scope. Their presence must be classified as replay/history reconciliation or deferred domain work.
6. Material scope expansion requires explicit user-facing change notice before implementation.

## Required checks for D2 closure

- repository migration reset/replay: PASS required;
- D2 pgTAP checks: PASS required;
- tenant-safe FK structure: PASS required;
- active Work Session uniqueness: PASS required;
- active Queue Entry uniqueness: PASS required;
- RLS structure/negative path: PASS required;
- TypeScript/lint/build engineering checks: PASS required;
- Final gate: PASS required;
- Production mutation: **NONE** during pre-merge D2 verification.

## Production boundary

The D2 migration `20260917192500` is not applied to Production at this handoff point.

No Vercel use is authorized for D2 before the final post-merge release stage.

## Closure rule

D2 may be marked VERIFIED only after the complete required evidence exists. A green D2 assertion run is not sufficient if the migration chain was made green by suppressing or bypassing a real error.

After merge to `main`, perform the authorized read-only Production verification for D2 schema/RLS/constraints and record exact evidence in the Handoff/Ledger.

**D2 verification status:** OPEN / BLOCKED.
