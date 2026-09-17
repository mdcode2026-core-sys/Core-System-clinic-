# CSAPI Gate 01 — Patient Flow Implementation Design Stage Record

**Date:** 2026-09-17  
**Stage:** Implementation Design (D1–D12 planning)  
**Status:** COMPLETE / DESIGN ONLY  
**Branch:** `architecture/csapi-gate-01-patient-flow-implementation-design-2026-09-17`

## Purpose

This record closes the design stage that translated the Gate 01 target architecture and implementation-decision reconciliation into independently verifiable implementation units.

## Inputs

- Gate 01 Architecture Reconciliation — 2026-09-17
- Gate 01 Architecture Gap Matrix — 90 gaps/invariants
- Gate 01 Target Architecture — 2026-09-17
- Gate 01 Implementation Decision Reconciliation — 2026-09-17
- Fresh live Supabase schema, constraint, RLS, function, permission and configuration inspection

## Output

Implementation was decomposed into:

```text
D1 Canonical contracts
D2 Database foundations
D3 Lifecycle authority / RLS
D4 Clinical execution
D5 Queue execution
D6 Operational work integration
D7 Timing policy
D8 Closure / Administration
D9 Cross-domain reconciliation
D10 UI migration
D11 Legacy compatibility retirement
D12 Full verification
```

The design mandates additive evolution, one lifecycle authority, tenant-safe relations, atomic sensitive commands, business lifecycle events separate from technical row audit, preserved domain ownership, and explicit verification records for every implementation stage.

## Important decisions carried into implementation

- `clinic_visit_sessions` remains the parent Visit anchor.
- Clinical Work Session becomes the child work-unit representation; historical chronology must not be fabricated.
- Queue Entry is a separate waiting/order representation supporting repeated Waiting intervals.
- **Finish** is the user-facing clinical action and must execute atomically.
- Hold releases clinical ownership without completing the Visit; returning to the queue is a separate command.
- Transfer preserves Visit identity and records source/destination context.
- `operational_work_items` / `operational_work_history` are reused for generic operational responsibility and handoff, with governed Visit linkage.
- Timing policy is tenant-scoped; user-scoped `clinic_user_settings` is not the tenant policy store.
- Operational Closure and Administrative Closure are distinct.
- Carry-forward preserves the same Visit across operating dates.
- Follow-up remains downstream of authoritative completion.
- Lifecycle authority must be enforceable at the database boundary.
- UI follows backend command authority.

## Evidence performed

Repository and live database evidence were reconciled before writing this packet, including current Visit schema, Visit/procedure constraints, operational Work fields and policies, Visit RLS, technical audit functions, timing triggers, permission catalog, tenant configuration candidates and existing Journey Coordination actions.

## Changes in repository

Documentation only. No source code, SQL migration, permission data, production data or deployment configuration was changed.

## Verification status

Design-stage verification is complete at documentation level. No implementation runtime tests were executed because implementation has not started.

## Entry criteria for implementation

Before D1 implementation starts:

1. Product Owner approval of the technical implementation decisions marked `PROPOSED` in the CSAPI ledger.
2. Exact migration/schema contract recorded for D2.
3. Permission vocabulary reconciliation recorded for D3.
4. Test Execution Contract attached to each implementation PR.
5. Each implementation unit uses a dedicated purpose branch and remains off `main` until CI/review gates pass.

## Stage status

**Design stage:** CLOSED  
**Implementation stage:** NOT STARTED  
**Production stage:** NOT STARTED

**Next stage:** D1 — Canonical Contracts Implementation.
