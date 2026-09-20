# CORE SYSTEM — CSAPI Gate 01 Master Execution Roadmap

**Updated:** 2026-09-21
**Current position:** **Gate 01 CLOSED** after Integrated Patient Flow Verification and Final Gate 01 Release / Production Verification.
**Current main SHA:** `e087243204c1f8308be323bc4eea24b18252dfee`
**D3 merge SHA:** `c504897e01a1429e7729e27960e2f33cdb1b8f21`
**Final release documentation reconciliation:** pending merge of this final Gate 01 closure record

## 1. Sequence

```text
D1 — application / contract foundation
        ↓
D2 — database foundations [CLOSED]
        ↓
D3 — lifecycle write authority / commands [CLOSED]
        ↓
Integrated Patient Flow verification [CLOSED]
        ↓
Final Gate 01 release / production verification [CLOSED]
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

Production state after final release:
- Repository D2 migration SQL was applied to hosted Production Supabase.
- Repository D3 migration SQL was applied to hosted Production Supabase.
- Remote migration history records generated application versions `20260920220417` and `20260920220432`; their SQL content matches the repository D2/D3 migration files and the discrepancy is explicitly recorded in the final release record.
- The three D2 tables are present with RLS enabled.

Therefore D2 implementation and its Production rollout are complete.

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

## 5. Gate 01 final status

### 5.1 Integrated Patient Flow Verification — CLOSED

Record:
`docs/CSAPI/GATES/GATE-01-INTEGRATED-PATIENT-FLOW-VERIFICATION-2026-09-21.md`

Evidence:
- Run #657 (`35539734311`) fully green on implementation head `3676d5b0006cd3ea6083c3171873197cf8874e92`.
- Current-main equivalence showed no application/runtime/migration/test implementation drift after that green candidate.

### 5.2 Final Gate 01 Release / Production Verification — CLOSED

Binding contract:
`docs/testing/workstream-contracts/csapi-gate01-final-release.execution.json`

Final record:
`docs/CSAPI/GATES/GATE-01-FINAL-RELEASE-PRODUCTION-VERIFICATION-2026-09-21.md`

Evidence:
- Hosted Production Supabase D2/D3 rollout completed from repository migration SQL.
- Production Vercel deployment `dpl_Cw1AutDTYQfahkTKMAP8FhGSSVdU` is READY and targets `main`.
- Live `/api/build-info` exposes exact promoted SHA `e087243204c1f8308be323bc4eea24b18252dfee`.
- Production authenticated runtime workflow Run #32 (`35540492196`) completed SUCCESS.

### 5.3 Gate 01 closure

**CSAPI Gate 01 — Patient Flow is CLOSED.**

No further implementation, migration, Vercel, or Production Supabase work belongs to Gate 01. Any subsequent work starts as a new explicitly-scoped CSAPI workstream and must not reopen Gate 01 implicitly.

## 6. Hard boundaries

- No direct changes to `main`.
- No D3 implementation inside the D2 branch.
- No second Patient Flow engine.
- No unrelated Workforce/Payroll/Financial/Inventory/Agenda/Communications repairs inside CSAPI merely because their migrations are encountered.
- No Vercel verification until the final Gate 01 release stage, after Integrated Patient Flow Verification closes.
- Every material scope change is surfaced to the user before it is made.