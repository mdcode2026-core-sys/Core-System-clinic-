# CSAPI Gate 01 — D2 Database Foundations Implementation Record

**Updated:** 2026-09-19  
**Stage:** D2 — Database Foundations  
**Status:** IMPLEMENTED / CI VERIFIED / MERGED; PRODUCTION ROLLOUT PENDING
**Canonical implementation PR:** #168  
**Canonical implementation branch:** `implementation/csapi-gate-01-d2-database-foundations-canonical-2026-09-18`  
**Merged main SHA:** `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`  
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

## Final verification evidence

GitHub Actions run #499 (`35431678991`) passed the D2 database lane on exact code candidate `c5cd0aef6dcecde96a477585985c1344f8924b62`.
After documentation-only commits, run #500 (`35431848948`) also passed on the final documented pre-merge head `fd717722994e0945765acd300c3640b8aac7edfa`.
PR #168 was merged to `main` with merge SHA `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`.
Post-merge Production Supabase verification was read-only and confirmed that migration `20260917192500` and the three D2 tables are not yet deployed in Production.

The replay failures recorded below are historical evidence of blockers corrected before the final green gate.

## Required response to replay failures

Do not hide replay failures to obtain a green D2 result.

- If the failure is a repository migration/replay defect that prevents reaching D2, repair the migration/replay behavior in the smallest safe way.
- If the failure is a genuine unrelated domain defect, document it and defer it to its own workstream.
- If the failure is in D2 itself, repair D2 and rerun the full gate.

Any material scope expansion requires explicit user-facing change notice before implementation.

## Safety boundary

Write policies for the new Patient Flow tables remain intentionally absent. D3 owns controlled lifecycle write authority.

## Closure

D2 implementation is **MERGED and CI VERIFIED**.

D2 Production rollout is **PENDING** because migration `20260917192500` has not been applied to Production. No Production schema mutation was performed during this documentation reconciliation.

D3 owns lifecycle write authority/commands and must remain separate from D2.

**D2 implementation status:** MERGED / VERIFIED — Production rollout pending.
