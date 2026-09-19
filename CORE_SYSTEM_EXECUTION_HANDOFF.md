# CORE SYSTEM — EXECUTION HANDOFF

**Updated:** 2026-09-19
**Workstream:** CSAPI — Gate 01 — Patient Flow
**Current Stage:** D3 — Plan Freeze / Contract Definition
**Canonical D2 PR:** #168
**Canonical D2 Branch:** `implementation/csapi-gate-01-d2-database-foundations-canonical-2026-09-18`
**Merged D2 Main SHA:** `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`
**Post-merge documentation branch:** `docs/csapi-d2-post-merge-verification-2026-09-19`
**D2 Status:** MERGED — PRODUCTION ROLLOUT / FINAL VERIFICATION PENDING
**D3 Branch:** `implementation/csapi-gate01-d3-lifecycle-authority-2026-09-19`
**D3 Status:** STEP 2B IMPLEMENTED — DATABASE MUTATION BOUNDARY ADDED; CI VERIFICATION PENDING
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

### Latest verification — 2026-09-19

GitHub Actions run **#499** (`35431678991`) verified exact candidate `c5cd0aef6dcecde96a477585985c1344f8924b62`.

- Build applicable lane plan: PASS
- D2 database lane: PASS
- Engineering lane: PASS
- Final gate: PASS

The D2 database lane therefore reached and passed the contracted D2 assertions, including migration replay, schema/constraint checks, cross-tenant composite-FK rejection, active-record invariants, and tenant-scoped read isolation.

The immediately preceding replay/test-fixture correction was limited to the D2 test fixture: it now supplies the canonical `role_id` for its doctor test users. No production database was changed and no Vercel verification was used.

PR #168 is merged to `main` as `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`. Production Supabase has not been modified.

### Historical pre-fix verification evidence

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
- mutate Production Supabase during implementation or documentation reconciliation;
- reopen or modify the merged #168 D2 implementation unless a new defect is proven;
- revive old D2 PR #145 as the execution base;
- use obsolete Unified Test Execution Engine evidence as current D2 proof.

## 10. Exact next execution

1. Treat D2 implementation as merged and CI-verified.
2. Keep Production Supabase unchanged; its post-merge read-only check confirmed that D2 migration `20260917192500` is not deployed.
3. Do not start D3 implementation until its contract is derived and frozen from repository evidence.
4. Create a dedicated D3 branch/PR from current `main`.
5. Implement only D3 lifecycle write authority/commands over the D2 foundations.
6. Verify D3 through its own engineering/database/runtime gates.
7. Run integrated Patient Flow verification: Reception → Waiting → Clinical Start → Work → Finish.
8. Complete the final Gate 01 release/production stage under the approved release boundary.
9. Update Handoff/Ledger with exact evidence and formally close Gate 01.
10. Only after Gate 01 closure continue to the next approved CSAPI workstream; never pull later-phase work backward into D2.

## 10A. Post-merge transition — 2026-09-19

- PR #168 merged to `main` with SHA `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`.
- GitHub Actions #499 and #500 passed the D2 verification sequence.
- Production Supabase was checked read-only after merge.
- Migration `20260917192500` is not deployed to Production, and the three D2 tables are not present there.
- D2 implementation is therefore merged and CI-verified; Gate 01 is still open.
- D3 is the next implementation stage and must use its own contract, branch, PR, verification, and closure evidence.

### CSAPI Gate 01 master sequence

D1 — application/contract foundation
→ D2 — database foundations [MERGED + CI VERIFIED]
→ D3 — lifecycle write authority / commands [NEXT]
→ integrated Patient Flow verification
→ final release/production stage
→ Gate 01 CLOSED

### D3 boundary

D3 translates the approved Patient Flow lifecycle into authoritative, tenant-safe, actor-authorized state-changing operations over the D2 tables. It must preserve Waiting as a queue state, keep Reception ordering separate from clinical start, let the responsible clinical user/room pull the patient when work begins, and use the approved completion term `Finish`.

The exact D3 command names and transition matrix are not yet frozen in this handoff and must be derived from the D3 contract/repository evidence before any D3 code change.

## 11. Canonical source priority

Use this order when sources conflict:

1. current `main` and current canonical PR/head;
2. current CSAPI Gate 01 contracts/design packets;
3. current repository implementation and migrations;
4. current live Supabase evidence, read-only until the authorized post-merge D2 verification;
5. historical branches/PRs as provenance only.

Never let an old branch or old handoff silently become the execution base.

**Resume command:** `CSAPI`

**Current main documentation merge SHA:** `c23d0c8ca09c2dc944ed4422b18b72b4e4968b96`

**End of Live Execution Handoff.**


## D3 Plan Freeze — 2026-09-19

D3 has entered controlled pre-implementation execution.

Authoritative D3 planning artifacts on the D3 branch:
- `docs/CSAPI/GATES/GATE-01-D3-LIFECYCLE-WRITE-AUTHORITY-PLAN-2026-09-19.md`
- `docs/CSAPI/GATES/GATE-01-D3-LIFECYCLE-WRITE-AUTHORITY-VERIFICATION-PLAN-2026-09-19.md`
- `docs/testing/workstream-contracts/csapi-gate01-d3.execution.json`

The plan explicitly separates:
- D2 database foundations from D3 lifecycle writes;
- existing Stage 6 regression evidence from new D3 lifecycle evidence;
- database/command verification from integrated runtime verification.

Current implementation finding:
- Existing Queue/Visit server actions mutate `clinic_visit_sessions` directly.
- They do not atomically project the same lifecycle transition into D2 Work Session / Queue Entry / Event records.
- The existing broad `moveFromPatientFlow` mutation surface is not accepted as the canonical D3 command authority.

Test suitability finding:
- `tools/patient-flow-stage6-audit.mjs` remains a regression/static architecture check.
- `supabase/tests/csapi_gate01_d2_database_foundations.sql` remains D2-only integrity evidence and must not be repurposed as D3 lifecycle proof.
- D3 therefore requires dedicated database/command and runtime verification lanes.

Step 0 evidence:
- D3 plan created: `cd0056ee3164c6b6ecd335f226a0945fa6fbcbc3`
- D3 verification plan created: `f9d82aad220d58a0b95200507f12de1f64c9b5fd`
- D3 planned contract created: `1aec7ec51105d053853ac61d5daf2107bf20b892`

No D3 production migration or application code has been changed at this point.

**Current D3 next action:** verify the frozen plan branch through the applicable CI engineering gate. If it passes, proceed to Step 1: exact command/data/event contract. If it fails, fix only the concrete execution defect and re-verify before advancing.


## D3 Step 1 — Command / Data / Event Contract

**Result:** PASS / FROZEN BEFORE DATABASE IMPLEMENTATION.

Authoritative contract:
`docs/CSAPI/GATES/GATE-01-D3-COMMAND-DATA-EVENT-CONTRACT-2026-09-19.md`

The contract fixes:
- lifecycle transitions;
- seven D3 domain commands;
- owner/permission boundaries;
- Queue Entry semantics and position normalization;
- Work Session projection semantics;
- Event taxonomy;
- atomic transaction boundary;
- concurrency and correlation/idempotency behavior;
- legacy adapter rule;
- D3-specific acceptance matrix.

Verified repository evidence confirms the existing Queue Engine remains the transition-rule source and existing Queue/Visit actions are the legacy mutation callers to be migrated.

**Step 1 evidence commit:** `cbfc04831e2ab6ec3a12276a59b12b90283b523e`

**Next:** re-verify this exact branch/head through CI, then proceed to Step 2 — D3 database mutation boundary.

## D3 Step 2A — Verification Harness

**Result:** PASS.

Dedicated D3 verification artifacts are now present:
- `supabase/tests/csapi_gate01_d3_lifecycle_authority.sql`
- `tools/csapi-gate01-d3-database-verification.mjs`
- D3 database lane mapping in `tools/workstream-verification-lane.mjs`
- D3 planner mappings in `tools/workstream-verification-plan.mjs`

GitHub Actions run **#508** (`35433430969`) passed on exact D3 head `7b71fdfc57e20c04c9af0684ba191612ed127bf9`.

The existing D2 and Stage 6 checks remain separate and were not reinterpreted as D3 proof.

**Next approved step:** Step 2B — implement the D3 database mutation boundary and activate the binding D3 database contract. No Production mutation and no Vercel verification are permitted.

## D3 Step 2B — Database Mutation Boundary

**Implementation:** COMPLETE / VERIFICATION PENDING.

Added:
- `supabase/migrations/20260919090000_csapi_gate01_d3_lifecycle_authority.sql`
- D3 lifecycle functions for Waiting, Reorder, Clinical Start, Clinical Finish, Reception Completion, Cancel and No-show.
- Correlation idempotency index.
- Authenticated-only RPC ACL.
- Atomic Visit + D2 Queue/Work Session/Event projection boundary.
- Controlled tenant/actor/permission validation and visit/work-session locking.

Verification contract activated:
- D3 database lane.
- Patient Flow Stage 6 regression lane.
- Engineering lane.

The D3 runtime lane remains planned and is not yet active.

**Exact implementation commits:**
- Migration: `cafd46654b5d3d10281cef5b4481f555ce5c4468`
- Migration correction: `5ea6b2f7da28846f84b7fcbfa26f090c32c62d12`
- Test fixture correction: `59189c04f832991e4bd42845e810c24096405f2b`
- Binding contract: `a6772bd9b3b0d5892d94a0ab5c83036876697afc`

**Current next action:** run the exact D3 database and regression lanes. No D3 implementation may advance to server adapters until those lanes pass.


## D3 Step 2B Closure — 2026-09-19

Exact verified head: `3c9606775c09e5eb3f7fe70d820541f49a1bd452`

GitHub Actions Run #539 (`35439186653`) PASS:
- D3 database lifecycle authority: PASS
- Patient Flow Stage 6 regression: PASS
- Engineering: PASS
- Final gate: PASS

Step 2B database mutation boundary is therefore verified and closed at CI level. No Production Supabase mutation and no Vercel verification were used.

**Next:** Step 3 — Server action integration. Migrate active D3-owned direct mutation callers to thin wrappers over the canonical D3 commands. Do not redesign Queue/Workspace/Visit UI or introduce a second engine.
