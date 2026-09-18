# CSAPI Gate 01 — D2 Database Foundations Implementation Record

**Date:** 2026-09-17  
**Stage:** D2 — Database Foundations  
**Status:** IMPLEMENTED / VERIFICATION PENDING  
**Implementation branch:** `implementation/csapi-gate-01-d2-database-foundations-canonical-2026-09-18`  
**D1 verified source:** `b9470061da5c188adff40b0956ce03a540beccf8`  
**Parent design:** `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DESIGN-PACKET-2026-09-17.md`

## Cost / environment decision

The earlier D2 plan proposed a hosted Supabase development Branch. That path is **rejected** for CORE SYSTEM because Supabase Branching is not included in the Free plan. No paid hosted branch will be created for this work.

The approved D2 verification path is local Supabase development through the repository migration chain and CI-compatible local tooling. Supabase documents local development as cost-effective and quota-free; the CLI runs the local Postgres/Auth/Storage stack through a Docker-compatible runtime. cite-note

## Implemented scope

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
- use Vercel.

## Safety boundary

Write policies for the new Patient Flow tables are intentionally absent. D3 owns lifecycle write authority and must introduce controlled commands before these structures become writable by application actors.

## Verification required

The migration must be tested against a local/CI Supabase environment before D2 is marked VERIFIED. Verification must prove:

1. migration applies cleanly;
2. all three tables and required indexes/constraints exist;
3. tenant-scoped foreign keys reject cross-tenant references;
4. duplicate active Work Sessions are rejected;
5. duplicate active Queue Entries are rejected;
6. RLS prevents cross-tenant reads;
7. no production database was mutated.

**D2 implementation status:** OPEN — awaiting local/CI database verification.
