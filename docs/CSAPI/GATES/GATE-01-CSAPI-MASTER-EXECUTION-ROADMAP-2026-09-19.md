# CORE SYSTEM — CSAPI Gate 01 Master Execution Roadmap

**Updated:** 2026-09-21
**Current position:** **Integrated Patient Flow Verification — OPEN** after D3 implementation/verification closure and post-merge documentation reconciliation.
**Current main SHA:** `5a92232bc5ffbababf6f8139b1b9654be6112ae7`
**D3 merge SHA:** `c504897e01a1429e7729e27960e2f33cdb1b8f21`
**Post-merge documentation reconciliation:** PR #173 → `5a92232bc5ffbababf6f8139b1b9654be6112ae7`

## 1. Sequence

```text
D1 — application / contract foundation
        ↓
D2 — database foundations
        ↓
D3 — lifecycle write authority / commands
        ↓
Integrated Patient Flow verification
        ↓
Final Gate 01 release / production verification
        ↓
Gate 01 CLOSED
```

## 2. D1

D1 is the application-side foundation for the Patient Flow API path. Historical evidence describes the implementation as additive TypeScript work. D1 is a prerequisite and must not be rebuilt inside D2 or D3.

## 3. D2 — COMPLETE AS IMPLEMENTATION

D2 introduced `clinical_work_sessions`, `patient_flow_queue_entries`, `patient_flow_events`, tenant-safe composite foreign keys, active-record invariants, indexes, and tenant-scoped read RLS.

Evidence:
- Run #499 (`35431678991`) passed the D2 candidate.
- Run #500 (`35431848948`) passed the final documented pre-merge head.
- PR #168 merged to `main` as `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`.

Production state:
- Production Supabase was checked read-only after merge.
- Migration `20260917192500` is not deployed.
- The three D2 tables are not present in Production.

Therefore D2 implementation is complete and merged, while Production rollout remains pending.

## 4. D3 — CLOSED

D3 was the lifecycle write-authority layer over the D2 foundations and is now **CLOSED** after full implementation, integrated runtime verification, database/command verification, Stage 6 regression, final review, and merge.

Required behavioral preservation:
- Reception opens the operational visit workflow.
- The patient enters Waiting; Waiting is not the clinical encounter start.
- Reception can order and move Waiting cases.
- The responsible clinical user/room pulls the patient when work actually starts.
- Completion uses the approved term `Finish`.

Before D3 implementation, its contract must explicitly lock:
- legal lifecycle states/transitions;
- authoritative write boundaries and command ownership;
- actor/role authorization and tenant isolation;
- event/audit semantics;
- idempotency and concurrency handling;
- integration with existing Visit/Agenda/Patient Journey structures;
- exact verification gates.

Canonical D3 commands are frozen in the D3 command/data/event contract and remain the sole lifecycle write authority.

## 5. Remaining work for CSAPI Gate 01

### 5.1 Integrated Patient Flow Verification — CURRENT

Binding record:
`docs/CSAPI/GATES/GATE-01-INTEGRATED-PATIENT-FLOW-VERIFICATION-2026-09-21.md`

Binding workstream contract:
`docs/testing/workstream-contracts/csapi-gate01-integrated-patient-flow.execution.json`

Required verification:
- exact merged-main candidate;
- Engineering: typecheck, lint, build;
- integrated Patient Flow runtime;
- Patient Flow Stage 6 regression;
- evidence reconciliation against the frozen D3 authority contract.

This stage is verification-only and does not create new Patient Flow authority.

### 5.2 Final Gate 01 Release / Production Verification — AFTER 5.1

Only after Integrated Patient Flow Verification is PASS/CLOSED:
- roll out the approved Gate 01 D2/D3 database migrations to hosted Production Supabase using the repository migration lineage;
- verify Production migration history/schema;
- verify the exact merged-main release through Vercel;
- verify authenticated Production Patient Flow behavior and post-deploy runtime identity/state;
- reconcile final release evidence.

### 5.3 Gate 01 Closure

Only after the final release/production stage passes:
- reconcile roadmap, Handoff, Ledger, D2/D3 evidence and integrated verification record;
- formally mark **CSAPI Gate 01 — Patient Flow CLOSED**.

No later CSAPI workstream may be pulled backward into Gate 01.

## 6. Hard boundaries

- No direct changes to `main`.
- No D3 implementation inside the D2 branch.
- No second Patient Flow engine.
- No unrelated Workforce/Payroll/Financial/Inventory/Agenda/Communications repairs inside CSAPI merely because their migrations are encountered.
- No Vercel verification until the final Gate 01 release stage, after Integrated Patient Flow Verification closes.
- Every material scope change is surfaced to the user before it is made.