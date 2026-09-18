# CSAPI Gate 01 — Implementation Design Stage Record

**Date:** 2026-09-17  
**Stage:** Implementation Design (D1–D12 planning)  
**Status:** COMPLETE / DESIGN ONLY  
**Branch:** `architecture/csapi-gate-01-patient-flow-implementation-design-2026-09-17`  
**Parent:** `architecture/csapi-gate-01-patient-flow-implementation-reconciliation-2026-09-17`

## Purpose

Record the completed design stage that translates the Gate 01 target architecture and implementation-decision reconciliation into independently verifiable implementation units.

## Source evidence

- Gate 01 Architecture Reconciliation — 2026-09-17
- Gate 01 Architecture Gap Matrix — 90 gaps/invariants
- Gate 01 Target Architecture — 2026-09-17
- Gate 01 Implementation Decision Reconciliation — 2026-09-17
- Fresh live Supabase schema/constraints/RLS/function/permission/configuration inspection

## Design outputs

The implementation was decomposed into twelve units:

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

The design explicitly requires additive migration, one lifecycle authority, tenant-safe relations, atomic sensitive commands, business event history separate from row audit, preservation of domain ownership, and documented verification at every stage.

## Key implementation decisions locked for design

1. `clinic_visit_sessions` remains the parent Visit anchor.
2. Clinical Work Session is a separate child concept; historical chronology must not be fabricated.
3. Queue Entry is a separate operational waiting concept capable of repeated waiting intervals and authoritative order.
4. Finish is an atomic command and user-facing label is exactly **Finish**.
5. Hold releases clinical ownership without completing the Visit; return-to-Waiting creates a new queue interval and later Work Session.
6. Transfer preserves Visit identity and records source/destination context.
7. Existing Journey Coordination Work Item assignment/handoff is reused, with governed Visit linkage.
8. Timing policy is tenant-scoped; `clinic_user_settings` is not the tenant policy store.
9. Operational Closure and Administrative Closure remain separate.
10. Carry-forward preserves Visit identity across operating dates.
11. Follow-up is downstream of authoritative completion, not unresolved continuation.
12. Lifecycle authority must be enforceable at the database boundary and direct lifecycle mutation must not remain a parallel authority.
13. Business lifecycle events complement technical row audit and require reliable authenticated actor context.
14. UI migration follows backend authority, not the reverse.

## Repository changes in this stage

- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DESIGN-PACKET-2026-09-17.md`
- this stage record

No source code, SQL migration, permission data, production data or deployment configuration was changed.

## Database changes

None.

## Tests / verification

Design-stage verification performed:

- fresh live Supabase schema inspection;
- live constraint inspection for Visit/procedure/work relations;
- live RLS policy inspection for Visit and operational work;
- live function inspection for buffer/auto-close/audit/tenant/permission helpers;
- live permission inventory inspection;
- repository inspection of existing Journey Coordination Work Item mechanics;
- GitHub branch/compare verification.

No runtime implementation tests were executed because implementation has not started.

## Known non-findings

- No new top-level Visit table is required by this design.
- Journey Coordination is not made the Patient Flow lifecycle authority.
- Agenda is not converted into a Visit state machine.
- Existing Visit-linked Procedure/Inventory/Billing relationships are not replaced.
- Five-minute and sixty-minute values are not accepted as product constants.
- No production mutation was performed.

## Compatibility / rollback

The design requires keeping the current six-state `session_status`, existing technical audit and existing cross-domain Visit links until replacement behavior is proven. Legacy cleanup is a later gated stage.

## Entry criteria for the next stage

Before D1 implementation begins:

1. Product Owner approval of the technical implementation decisions recorded as proposed in the CSAPI ledger.
2. Exact schema and migration naming approved in the implementation branch.
3. Capability/permission vocabulary reconciled between repository and live database.
4. A Test Execution Contract is attached to each implementation PR.
5. Implementation is split by purpose and remains off `main` until CI and review gates pass.

## Stage close

**Design stage:** CLOSED  
**Implementation stage:** NOT STARTED  
**Production stage:** NOT STARTED

**Next documented stage:** D1 — Canonical Contracts Implementation.
