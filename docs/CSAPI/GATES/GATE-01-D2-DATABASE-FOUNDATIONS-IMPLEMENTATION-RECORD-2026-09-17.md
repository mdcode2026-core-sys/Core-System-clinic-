# CSAPI Gate 01 — D2 Database Foundations Implementation Record

**Updated:** 2026-09-19  
**Stage:** D2 — Database Foundations  
**Status:** IMPLEMENTED / VERIFICATION BLOCKED BY MIGRATION-CHAIN REPLAY  
**Canonical implementation PR:** #168  
**Canonical implementation branch:** `implementation/csapi-gate-01-d2-database-foundations-canonical-2026-09-18`  
**Current known head:** `2d331509e8a709e394dfe0dd819a7a6e5d1a5091`  
**D1 verified source:** `b9470061da5c188adff40b0956ce03a540beccf8`  
**Parent design:** `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DESIGN-PACKET-2026-09-17.md`

## Cost / environment decision

The approved D2 verification path is local Supabase development through the repository migration chain and CI-compatible local tooling. No paid hosted Supabase branch is part of D2.

## D2 implementation scope

Migration:

- `supabase/migrations/20260917192500_csapi_gate01_patient_flow_d2_foundations.sql`

Introduced additively:

- `clinical_work_sessions`
- `patient_flow_queue_entries`
- `patient_flow_events`
- tenant-scoped composite foreign-key integrity
- one-active-Work-Session-per-Visit invariant
- one-active-Queue-Entry-per-Visit invariant
- supporting indexes
- tenant-scoped read RLS

## Explicit non-scope

D2 does not:

- replace `clinic_visit_sessions.session_status`;
- implement lifecycle commands;
- create lifecycle RPCs;
- alter existing lifecycle triggers;
- change application permissions;
- migrate existing production rows;
- modify the production Supabase database;
- create a paid Supabase hosted branch;
- use Vercel;
- implement Workforce/Payroll;
- implement Financial/Inventory;
- redesign Patient Flow UI.

D3 owns lifecycle write authority/commands and must remain separate from D2.

## Migration-chain replay reconciliation

The canonical D2 PR currently also contains several historical migration restorations/hardening changes that are **not D2 features**. They were introduced while reconstructing a deterministic repository migration chain from current `main).

Examples include:

- `20260906104000_restore_missing_workforce_payroll_core_objects.sql`;
- Financial/Inventory remediation migration(s);
- replay prerequisites and legacy migration hardening.

These files must be classified as migration-history/replay prerequisites, not as D2 domain work.

Before D2 merge, each non-D2 migration must satisfy one of these conditions:

1. it is required for deterministic replay of the repository migration chain and is narrowly additive/non-breaking; or
2. it is removed from the D2 execution scope and assigned to its correct independent workstream.

No Workforce/Payroll or Financial/Inventory implementation work may be started merely because one of their migrations appears in the D2 replay chain.

## Current verification blocker

Latest known D2 run: GitHub Actions `35384612530`.

The D2 database lane reached:

```
20260830030534_ajm_reality_audit_clinical_resource_scheduling.sql
```

and failed with:

```
ERROR: insert or update on table "clinic_resources"
violates foreign key constraint "clinic_resources_tenant_id_fkey"
SQLSTATE 23503
```

Cause: the historical reality-audit migration attempted to insert hard-coded Zada tenant resource fixtures while the clean replay database did not contain that tenant.

This is a **migration-chain replay defect** encountered before the D2 migration is reached. It is not evidence of a D2 Patient Flow schema failure.

## Required response to replay failures

Do not hide replay failures to obtain a green D2 result.

- If the failure is a repository migration/replay defect that prevents reaching D2, repair the migration/replay behavior in the smallest safe way.
- If the failure is a genuine unrelated domain defect, document it and defer it to its own workstream.
- If the failure is in D2 itself, repair D2 and rerun the full gate.

Any material scope expansion requires explicit user-facing change notice before implementation.

## Safety boundary

Write policies for the new Patient Flow tables remain intentionally absent. D3 owns controlled lifecycle write authority.

## Closure

D2 remains **OPEN** until local/CI migration replay, D2 pgTAP, Engineering/Final Gate, merge to `main), and authorized post-merge Production verification are complete.

**D2 implementation status:** OPEN.
