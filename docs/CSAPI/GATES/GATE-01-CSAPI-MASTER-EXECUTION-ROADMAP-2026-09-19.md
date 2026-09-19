# CORE SYSTEM — CSAPI Gate 01 Master Execution Roadmap

**Updated:** 2026-09-19
**Current position:** D2 implementation merged and CI-verified; D3 is next.
**Main merge SHA:** `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`

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

## 4. D3 — NEXT

D3 is the lifecycle write-authority layer over the D2 foundations. It must implement the approved Patient Flow lifecycle without creating a parallel engine.

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

Exact D3 command names are not assumed here; they must be taken from approved D3 contract evidence before code changes.

## 5. Remaining work for CSAPI Gate 01

1. Finish the post-merge documentation reconciliation.
2. Freeze the D3 contract.
3. Create a dedicated D3 branch and PR from current `main`.
4. Implement D3 lifecycle write authority/commands only.
5. Run D3-specific verification and required engineering checks.
6. Run integrated Patient Flow end-to-end verification: Reception → Waiting → Clinical Start → Work → Finish.
7. Complete the final release/production verification stage under the approved release boundary.
8. Reconcile all evidence and formally close Gate 01.

## 6. Hard boundaries

- No direct changes to `main`.
- No D3 implementation inside the D2 branch.
- No second Patient Flow engine.
- No unrelated Workforce/Payroll/Financial/Inventory/Agenda/Communications repairs inside CSAPI merely because their migrations are encountered.
- No Vercel verification until the final release stage.
- Every material scope change is surfaced to the user before it is made.