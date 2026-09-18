# CORE SYSTEM — EXECUTION HANDOFF

**Updated:** 2026-09-19
**Workstream:** CSAPI — Gate 01 — Patient Flow
**Current Stage:** D2 — Database Foundations
**Canonical D2 PR:** #168
**Canonical D2 Branch:** `implementation/csapi-gate-01-d2-database-foundations-canonical-2026-09-18`
**Canonical D2 Head:** `2d331509e8a709e394dfe0dd819a7a6e5d1a5091`
**Documentation branch:** `docs/csapi-gate01-d2-handoff-reconciliation-2026-09-19`
**D2 Status:** OPEN — VERIFICATION BLOCKED BY MIGRATION-CHAIN REPLAY FAILURE
**Production Supabase:** NOT TOUCHED FOR D2
**Vercel:** NOT TOUCHED FOR D2

## 1. Purpose of this handoff

This is the conversation-independent resume point for the current CSAPI execution.

The next conversation must begin from this exact state when the user sends **CSAPI**. Do not reconstruct the work from memory, old PRs, or an older handoff.

The governing execution sequence remains:

```
VERIFY
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
BUILD
  ↓
VERIFY
  ↓
REVIEW
  ↓
DOCUMENT
  ↓
CLOSE
```

No phase may be skipped or silently combined with a later phase.

## 2. User control / change-control rule

The user explicitly requires that **any material change outside the already-approved scope of the current phase be explained and surfaced before it is made**.

Therefore:

- Do not silently expand D2 into D3 or another CSAPI phase.
- Do not silently repair unrelated Workforce, Payroll, Financial, Inventory, Agenda, or other domain functionality merely because a verification reset encounters it.
- Do not silently change architecture, canonical execution paths, permissions, lifecycle ownership, or migration authority.
- If a new issue is discovered, first classify it as:
  1. D2-required prerequisite,
  2. verification/replay defect,
  3. genuine unrelated domain defect,
  4. future-phase work.
- Only category 1 or a narrowly-scoped verification/replay correction may be executed inside the current D2 gate, and only when it is necessary to obtain valid D2 evidence and is additive/non-breaking.
- Category 3 and category 4 findings must be documented and kept outside D2 unless the user explicitly approves a scope change.
- Never use a workaround that hides a real migration or schema error merely to make D2 pass.

This rule exists specifically to prevent the previous drift where Patient Flow verification exposed other domains and the work began moving into those domains without an explicit scope decision.

## 3. What D2 actually is

D2 is **Patient Flow database foundations**.

The approved D2 implementation introduces, additively:

- `clinical_work_sessions`
- `patient_flow_queue_entries`
- `patient_flow_events`
- tenant-safe composite foreign-key integrity;
- one-active-Work-Session-per-Visit invariant;
- one-active-Queue-Entry-per-Visit invariant;
- supporting indexes;
- tenant-scoped read RLS.

D2 does **not** implement Patient Flow lifecycle commands.

D3 is the later phase responsible for controlled lifecycle write authority/commands. Do not implement D3 while closing D2.

Patient Flow semantics remain:

- Reception opens the operational visit workflow.
- The patient enters a **Waiting** queue; this is not the start of the clinical encounter.
- Waiting can represent appointments, walk-ins, emergency cases, post-consultation lab/radiology, multiple procedures, and other approved waiting scenarios.
- Reception controls queue ordering/movement.
- The responsible clinical user/room sees the waiting queue in the reception-defined order and pulls the patient when work actually starts.
- Moving a patient in the waiting queue does not itself start examination/procedure.

The approved wording is **Finish**, not “Finish Clinical Work”.

## 4. Current D2 verification reality

The latest known D2 verification run was GitHub Actions run **#35384612530**.

The exact candidate checked by the D2 database lane was:

`763ff6fd75b6b9b408883a9202319d3db871da59`

That run did not complete D2 verification.

Observed lane result:

- Build applicable lane plan: PASS
- Engineering lane: completed its execution steps successfully but the workflow job was ultimately marked CANCELLED because the required D2 lane failed.
- D2 database lane: FAIL
- Final gate: FAIL

The D2 database failure was not a Patient Flow D2 assertion failure.

The first concrete migration-chain failure reached during local reset was:

```
ERROR: insert or update on table "clinic_resources"
violates foreign key constraint "clinic_resources_tenant_id_fkey"
(SQLSTATE 23503)
```

The failing migration was:

`supabase/migrations/20260830030534_ajm_reality_audit_clinical_resource_scheduling.sql`

The migration attempted to insert reality-audit resource fixture rows for a hard-coded Zada tenant while the replay database did not contain that tenant.

This means the current blocker is **migration-chain replay integrity before D2 is reached**, not evidence that the D2 schema itself is wrong.

Earlier replay blockers on this same canonical D2 line were also encountered and corrected, including:

- invalid `CREATE POLICY IF NOT EXISTS` PostgreSQL syntax in `20260803_sync_inventory.sql`;
- legacy role-policy recreation conflicts;
- unsupported explicit conflict target in the role seed migration;
- stale Patient Journey Stage 7 policy name;
- duplicate migration numeric versions during local replay;
- optional Zada fixture handling in another reality-audit migration.

These corrections are verification/replay concerns. They must not be interpreted as D2 product scope.

## 5. Critical scope finding: Workforce / Payroll / Financial migrations

The current PR #168 diff contains several historical migration-replay restoration/hardening files in addition to the D2 migration.

In particular, the PR currently contains:

`supabase/migrations/20260906104000_restore_missing_workforce_payroll_core_objects.sql`

and also a Financial/Inventory remediation migration.

**These are not D2 Patient Flow functionality.**

They appeared because the canonical D2 branch was rebuilt against current `main` and the local migration chain exposed missing historical migration-lineage objects required to replay the repository database state.

Therefore:

- Workforce/Payroll has no architectural or functional role in Gate 01 D2.
- Financial/Inventory has no architectural or functional role in Gate 01 D2.
- Their presence in the current PR must be treated as **migration-history/replay prerequisites under reconciliation**, not as new D2 features.
- They must not trigger a Workforce, Payroll, Financial, or Inventory implementation phase.
- Before D2 is closed, the canonical PR contents must be reviewed to ensure each such file is genuinely required for deterministic migration replay and is not an unrelated functional change.
- If a file is required only because repository migration history is incomplete, it must be classified explicitly as replay reconciliation. If it is unrelated to deterministic D2 verification, it must not be allowed to silently enlarge the D2 scope.

## 6. How migration errors must be handled

Do **not** leave a real migration-chain error as an invisible “future phase” defect merely so D2 can pass.

The rule is:

### If the error prevents the repository from reaching D2 verification

Fix or isolate the **migration/replay defect itself**, in the smallest additive/non-breaking way, so the verification environment can deterministically replay the canonical migration chain.

Examples include:

- a PostgreSQL-invalid migration statement;
- a migration that recreates an existing policy without being replay-safe;
- a missing historical migration object required by later migrations;
- a hard-coded optional fixture that assumes a tenant that is absent from a clean reset;
- duplicate migration-version filenames that make deterministic replay impossible.

### If the error is a genuine product/domain defect unrelated to D2

Do not repair that domain during D2.

Record it as a finding and assign it to the correct future workstream/phase.

### If the error is a D2 implementation defect

Repair the D2 implementation, then rerun the full D2 gate.

The objective is a **truthful D2 PASS**, not a green check produced by hiding upstream migration failures.

## 7. Current migration rule

D2 migration:

`supabase/migrations/20260917192500_csapi_gate01_patient_flow_d2_foundations.sql`

Target database state is local/CI only until D2 is formally closed.

Production migration version `20260917192500` is **not applied to Production** at this handoff point.

No production data migration is authorized as part of D2.

No Vercel verification is authorized before the D2 merge/final-release stage.

## 8. D2 verification contract

Binding contract:

`docs/testing/workstream-contracts/csapi-gate01-d2.execution.json`

Required D2 database command:

`node tools/csapi-gate01-d2-database-verification.mjs`

Required proof:

1. full repository migration chain replays cleanly;
2. D2 migration applies;
3. all three D2 tables exist;
4. required indexes/constraints exist;
5. tenant-safe composite FKs reject cross-tenant references;
6. duplicate active Work Sessions are rejected;
7. duplicate active Queue Entries are rejected;
8. RLS prevents cross-tenant reads;
9. engineering checks pass;
10. no production database mutation occurs.

The verification runner is local/CI only. Its temporary normalization of duplicate migration filenames is a verification mechanism, not a production migration-history rewrite.

## 9. What must NOT happen now

Do not:

- implement D3 lifecycle commands;
- add D2 write-authority RPCs owned by D3;
- redesign Patient Flow UI;
- modify Reception/Clinical Workspace behavior unless a D2 database contract explicitly requires it;
- repair Workforce/Payroll because it appeared in the migration chain;
- repair Financial/Inventory because it appeared in the migration chain;
- use Vercel;
- mutate Production Supabase;
- merge #168 before the D2 verification gate is truthful and green;
- revive old D2 PR #145 as the execution base;
- use obsolete Unified Test Execution Engine evidence as current D2 proof.

## 10. Exact next execution

When the next conversation starts with **CSAPI**, execute immediately from this handoff:

1. Re-verify PR #168, its exact head, branch, and current GitHub Actions state.
2. Inspect the latest D2 database failure and identify the first actual replay blocker.
3. Fix only the smallest migration/replay defect required to make the canonical migration chain deterministic, unless it is proven to be unrelated future-domain work.
4. Re-run the D2 verification lane.
5. Repeat until the first real blocker is cleared and the D2 lane reaches the actual D2 assertions.
6. If D2 assertions fail, repair only the D2 implementation/contract.
7. Re-run Engineering + D2 + Final Gate on the exact new head.
8. Only after all required pre-merge gates pass, review #168 for scope purity and merge-readiness.
9. Merge #168 to `main).
10. Only after merge, perform the authorized Production Supabase read-only verification for the D2 migration/schema/RLS/constraints.
11. Update this Handoff and the Ledger with exact final SHA, migration version, CI evidence, merge evidence, and production verification evidence.
12. Close D2 only when all required closure evidence exists.
13. Then identify the canonical D3 plan/contract/branch from repository evidence and continue to D3 — without pulling D3 work backward into D2.

## 11. Canonical source priority

Use this order when sources conflict:

1. current `main) and current canonical PR/head;
2. current CSAPI Gate 01 contracts/design packets;
3. current repository implementation and migrations;
4. current live Supabase evidence, read-only until the authorized post-merge D2 verification;
5. historical branches/PRs as provenance only.

Never let an old branch or old handoff silently become the execution base.

**Resume command:** `CSAPI`

**End of Live Execution Handoff.**
