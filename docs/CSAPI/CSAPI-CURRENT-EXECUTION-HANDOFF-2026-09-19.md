# CORE SYSTEM — CSAPI CURRENT EXECUTION HANDOFF

**Updated:** 2026-09-19 20:28 +03  
**Resume token:** `CSAPI`  
**Workstream:** CSAPI — Gate 01 — Patient Flow  
**Current execution stage:** D3 — Step 4 — Integrated Runtime  
**Current state:** **OPEN / NOT CLOSED**  
**Current canonical D3 branch:** `implementation/csapi-gate01-d3-lifecycle-authority-2026-09-19`  
**Current PR:** #172 — open, draft, base `main`, mergeable  
**Current PR Head:** `381302a2c34542502e2c58d1d39804d7e6152336`  
**Current PR size:** 85 commits, 19 changed files, 3,957 additions, 134 deletions  
**D2 merged Main baseline:** `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`  
**Vercel:** prohibited for current D3 verification  
**Hosted Production Supabase:** not to be mutated during D3 implementation verification

---

## 1. PURPOSE

This file is the **authoritative conversation-independent resume point for CSAPI** after the 2026-09-19 execution conversation.

When a new conversation starts and the user sends:

```
CSAPI
```

the assistant must:

1. read this file first;
2. verify the current PR #172 head against GitHub;
3. verify the current CI result before making any new implementation change;
4. continue from **D3 Step 4**, not restart architectural discovery;
5. not reopen D2, D1, Patient Journey, Global Experience, Header, Communications, or other already-settled work;
6. not infer that D3 Step 4 passed merely because D3 database tests pass;
7. not use historical handoffs as a newer authority than this file and the current repository head.

The current unresolved task is narrowly defined below.

---

# 2. CSAPI EXECUTION MODEL

The approved execution sequence remains:

```
VERIFY
  ↓
PLAN / CONTRACT
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

Execution-control rules:

- Main is never modified directly.
- D3 work remains on the dedicated branch and PR.
- Database changes use migrations.
- Production Supabase is not mutated during D3 implementation verification.
- Vercel is not used for D3 verification.
- No UI redesign may be pulled into D3.
- No second Queue engine.
- No second permission engine.
- No unrelated Workforce/Payroll/Financial/Inventory implementation.
- Every material change is explained to the user before it is made.
- Ordinary blockers are handled without opening unrelated phases.
- Stop only for a genuine architectural decision, a required CI wait, or a completed/closed phase.

---

# 3. PATIENT FLOW BUSINESS CONTRACT — DO NOT CHANGE

The business path currently governing Patient Flow is:

```
Reception opens Visit / operational workflow
        ↓
Waiting queue
        ↓
Reception may reorder / route waiting cases
        ↓
Responsible clinical user / room pulls the patient
        ↓
Clinical Work
        ↓
Finish
        ↓
Pending Close
        ↓
Reception
        ↓
Completed
```

Critical semantics:

- **Waiting means waiting.**
- Waiting is not an examination start.
- Waiting is not role routing.
- Reception controls queue order/movement.
- Reception must not start clinical procedures merely by moving a patient.
- Clinical start happens only when the responsible clinical user/room actually pulls the waiting case.
- Clinical completion produces **Pending Close**.
- Reception owns the final completion transition.
- The approved UI wording is **Finish**.
- Pending Close is Visit lifecycle state, not an Agenda state.
- Work Session `held` / `transferred` are Work Session semantics, not new Visit lifecycle states.

D3 must preserve this behavior.

---

# 4. D2 BASELINE — CLOSED FOR IMPLEMENTATION PURPOSES

D2 Patient Flow database foundations are merged to main:

**Main SHA:**
`6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`

D2 introduced:

- `clinical_work_sessions`
- `patient_flow_queue_entries`
- `patient_flow_events`
- tenant-safe composite FK integrity;
- one-active-Work-Session-per-Visit invariant;
- one-active-Queue-Entry-per-Visit invariant;
- supporting indexes;
- tenant-scoped read isolation.

D2 was verified by its dedicated CI gates and merged through PR #168.

D2 is **not** the current implementation task.

Do not reopen D2 unless a new, independently proven regression is discovered.

---

# 5. D3 PLAN AND CONTRACT — FROZEN

Authoritative files:

- `docs/CSAPI/GATES/GATE-01-D3-LIFECYCLE-WRITE-AUTHORITY-PLAN-2026-09-19.md`
- `docs/CSAPI/GATES/GATE-01-D3-LIFECYCLE-WRITE-AUTHORITY-VERIFICATION-PLAN-2026-09-19.md`
- `docs/CSAPI/GATES/GATE-01-D3-COMMAND-DATA-EVENT-CONTRACT-2026-09-19.md`
- `docs/testing/workstream-contracts/csapi-gate01-d3.execution.json`

D3 owns lifecycle write authority over the D2 foundations.

Canonical lifecycle:

```
waiting
  ↓
in_consultation
  ↓
pending_close
  ↓
completed
```

Terminal alternatives:

```
waiting → no_show
waiting → cancelled
in_consultation → cancelled
pending_close → cancelled
```

Seven canonical D3 commands:

1. `csapi_d3_enter_waiting`
2. `csapi_d3_reorder_waiting`
3. `csapi_d3_start_clinical_work`
4. `csapi_d3_finish_clinical_work`
5. `csapi_d3_complete_reception`
6. `csapi_d3_cancel_patient_flow`
7. `csapi_d3_mark_no_show`

Canonical mutation path:

```
UI / existing server action
        ↓
thin D3 server adapter
        ↓
canonical D3 PostgreSQL command
        ↓
atomic Visit + D2 projections + Event
```

Authorization rule:

- `patient_flow:operations`
- `patient_flow:clinical`
- `patient_flow:administrative`

remain Patient Flow surface/workspace access signals.

They are **not** the canonical lifecycle-write permission model.

D3 uses the existing session authorities:

- `sessions:update`
- `sessions:close`

plus current state, actor/ownership and administrative override rules.

Do not create a new permission engine or a final commercial subscription matrix during D3.

---

# 6. D3 TEST / AUTHORIZATION DIRECTION APPROVED BY USER

The user explicitly approved broader technical test assumptions where they improve accuracy and expose future authorization/subscription requirements.

The agreed interpretation is:

- technical permissions are valid for D3 lifecycle testing;
- tests may broaden negative cases to reveal capability gaps;
- role mappings used by fixtures are not final product design;
- subscription fixture is a full-capability baseline for deterministic tests;
- `enterprise` appearing inside a local fixture does **not** define a final commercial plan;
- Patient Flow capabilities should be discovered first, then Roles/Entitlements/Subscriptions can map to them later;
- future capability/entitlement findings should be documented as future authorization requirements instead of prematurely designing final tiers.

Useful negative cases remain expected for D3:

- Clinical authority without reception-close authority cannot complete reception closure.
- Reception authority cannot start clinical work merely because it can access operations.
- Surface access alone cannot bypass lifecycle-write authority.
- Cross-tenant identifiers must fail.
- Another clinical actor cannot take ownership of an active Work Session merely by having general `sessions:update`.
- Duplicate/concurrent lifecycle commands must not create duplicate projections.
- Terminal states must not become re-enterable.

---

# 7. D3 STEPS — WHAT IS ACTUALLY CLOSED

## Step 0 — Plan Freeze

**Status: CLOSED**

Plan, verification plan and workstream contract were created and frozen before implementation.

## Step 1 — Command / Data / Event Contract

**Status: CLOSED**

Seven D3 commands, transition rules, queue/work-session/event projection semantics, atomicity, idempotency, concurrency and authorization boundaries were documented.

## Step 2A — Verification Harness

**Status: CLOSED**

Dedicated D3 database/command verification artifacts and CI lane were established.

## Step 2B — Database Mutation Boundary

**Status: CLOSED at CI level**

Migration:

`supabase/migrations/20260919090000_csapi_gate01_d3_lifecycle_authority.sql`

The migration establishes:

- D3 lifecycle write commands;
- atomic Visit + Queue Entry + Work Session + Event projection boundary;
- correlation/idempotency support;
- authenticated RPC ACL;
- tenant/actor/state checks;
- Visit/work-session locking;
- D3 lifecycle security boundary.

Verified at CI through Run #540:

- D3 DB PASS
- Stage 6 PASS
- Engineering PASS
- Final gate PASS

## Step 3 — Server Action Integration

**Status: CLOSED at CI level**

Verified exact Step 3 head:

`c57e35b791593175343c893d57368c582129fa24`

Run #548 (`35441891645`) passed:

- Build applicable lane plan
- Engineering
- D3 database/command
- Patient Flow Stage 6 regression
- Final gate

Implemented integration:

- `src/domain/queue/d3.actions.ts`
  - authenticated thin server adapter layer;
  - calls canonical D3 RPCs;
  - supports optional correlation IDs;
  - reloads tenant-scoped session projection.

- `src/domain/queue/queue.actions.ts`
  - lifecycle callers route through D3;
  - `callNextPatient` → D3 clinical start;
  - no-show/cancel → D3 commands;
  - final Visit completion remains reception-owned;
  - Hold/Resume remain separate Work Session operations, not automatic D3 Visit states.

- `src/domain/queue/workspace.actions.ts`
  - clinical start → D3;
  - clinical finish → D3;
  - reception completion → D3;
  - cancel/no-show → D3;
  - generic `moveFromOperation` / `moveFromPatientFlow` now dispatch only explicit legal D3 commands and no longer act as generic direct lifecycle mutation authority.

- `src/infrastructure/supabase/database.types.ts`
  - D3 RPC signatures added.

- `tools/patient-flow-stage6-audit.mjs`
  - updated so Stage 6 regression validates the new D3 adapter boundary instead of obsolete pre-D3 helper structure.

---

# 8. CURRENT D3 STEP 4 — INTEGRATED RUNTIME

**Status: OPEN / NOT PASSED / NOT CLOSED**

Required runtime:

```
Reception
 → Waiting
 → Reorder when applicable
 → Clinical Pull / Start
 → Clinical Work
 → Finish
 → Pending Close
 → Reception Complete
 → Completed
```

Runtime must also verify:

- authorization boundaries;
- tenant isolation;
- no clinical completion of the reception-owned final transition;
- expected D2 projections;
- expected event sequence;
- no false success caused by UI/test harness behavior.

## Current runtime lane

Binding workstream contract:

`docs/testing/workstream-contracts/csapi-gate01-d3.execution.json`

Current executable selected by the verification lane:

`tools/csapi-gate01-d3-runtime-v2.mjs`

The lane is provisioned by:

`tools/workstream-verification-lane.mjs`

The lane creates a disposable local Supabase environment and local Next production server. It must not call Vercel or hosted Production Supabase.

---

# 9. LATEST VERIFIED CI STATE

## Run #576

GitHub Actions:

- Run number: **#576**
- Run ID: `35449505099`
- Candidate PR head: `381302a2c34542502e2c58d1d39804d7e6152336`

Results:

| Lane | Result |
|---|---|
| Build applicable lane plan | PASS |
| Patient Flow Stage 6 regression | PASS |
| Engineering | PASS |
| D3 database/command | PASS |
| D3 integrated runtime | **FAIL** |
| Final gate | **FAIL** |

Therefore:

**D3 Step 4 is not complete.**

The passing D3 database lane proves the database command boundary remains green. It does not prove the integrated UI/runtime path.

---

# 10. LATEST RUNTIME FAILURE — EXACT FACTS

Run #576 runtime log showed that the runtime harness reached the local environment and authenticated successfully.

Diagnostic evidence:

### Local runtime environment

- Local Supabase reset completed.
- Local Next server reached ready state.
- Runtime used a temporary local authentication fixture copy.
- No hosted Production Supabase mutation occurred.
- Vercel was not used.

### Authorization diagnostic

The authenticated Reception runtime actor resolved effective permissions including:

- `patient_flow:operations`
- `patients:read`
- `sessions:close`
- `sessions:read`
- `sessions:update`
- `work:create`
- `work:read`
- `workspace:operation`

This is useful evidence that the latest failure was **not simply absence of Reception lifecycle permissions**.

### Database diagnostic

The authenticated runtime client could see:

- the seeded waiting Visit:
  `00000000-0000-0000-0000-00000000d3ba`
- the seeded Patient:
  `00000000-0000-0000-0000-00000000d3b9`

The Visit was in:

`session_status = waiting`

### First actual application error

When Reception attempted arrival, the application logged:

```
Arrival failed: insert or update on table "clinic_visit_sessions"
violates foreign key constraint
"clinic_visit_sessions_initialized_by_receptionist_fkey"
```

This is a real application/data-integrity failure.

It means the test fixture's `clinic_users.id` and the application field `initialized_by_receptionist` currently do not share the same identity domain expected by the FK.

### Runtime harness false-positive

Immediately after the application threw the arrival error, the runtime harness still printed:

```
PASS|Reception enters Waiting through D3
```

This is invalid evidence.

The harness clicked the UI control successfully but did not fail when the underlying server action failed.

The test therefore continued after a real failed lifecycle operation.

### Consequence

The next clinical step encountered:

```
ACTIVE_WAITING_QUEUE_ENTRY_REQUIRED
```

because the expected active Queue Entry had not actually been established.

The harness again printed:

```
PASS|Clinical Pull
```

and then timed out waiting for the clinical documentation `textarea` fields.

Therefore:

**Run #576 does not prove any clinical runtime success.**

It proves that the runtime environment can authenticate and expose the seeded data, but the current UI/runtime test harness is not yet fail-fast and the Reception arrival path currently reveals an identity/FK mismatch.

---

# 11. EARLIER RUNTIME DEBUGGING — IMPORTANT HISTORY

Several runtime iterations occurred before Run #576. The history must not be lost because it explains why the current verifier contains temporary diagnostics.

1. The first runtime attempt failed before useful execution because the local Supabase environment lacked `supabase/config.toml`.
   - The lane was updated to initialize a disposable local Supabase project when needed.
   - This was local verification infrastructure only.

2. An early runtime attempt failed at login even though an auth cookie existed.
   - The test was too dependent on simplistic cookie/redirect assumptions.
   - Later iterations used more deterministic local auth handling.

3. After login was corrected, the runtime actor authenticated but initially could not see the Patient Flow case.
   - Route and permission assumptions were audited.
   - The operation and clinical route contracts were found to require `patient_flow:operations` / `patient_flow:clinical` and `sessions:read`.
   - Local fixture mappings were added for deterministic test execution.
   - This does not change the product's final role model.

4. The latest diagnostic run proved that authenticated Reception can now resolve the expected permissions and directly read the seeded waiting Visit/Patient.
   - This narrowed the remaining runtime failure to the arrival/lifecycle path and test harness behavior.

The runtime lane currently contains diagnostics added specifically to discover these facts. They must be cleaned/reconciled only after the root cause is understood and the final runtime verifier is made trustworthy.

---

# 12. CURRENT REPOSITORY CHANGES THAT MATTER TO D3

The D3 branch currently includes these canonical implementation areas:

### Database

`supabase/migrations/20260919090000_csapi_gate01_d3_lifecycle_authority.sql`

### D3 database tests

`supabase/tests/csapi_gate01_d3_lifecycle_authority.sql`

### Server adapter

`src/domain/queue/d3.actions.ts`

### Queue integration

`src/domain/queue/queue.actions.ts`

### Workspace integration

`src/domain/queue/workspace.actions.ts`

### Existing clinical orchestration

`src/domain/visit/visit.actions.ts`

`finishClinicalVisit()` still owns the clinical-note saving operation, then hands lifecycle completion to D3. D3 does not absorb clinical documentation writes without an architectural decision.

### Generated Supabase types

`src/infrastructure/supabase/database.types.ts`

### Regression audit

`tools/patient-flow-stage6-audit.mjs`

### Runtime verifier

`tools/csapi-gate01-d3-runtime-v2.mjs`

### Workstream verification infrastructure

`tools/workstream-verification-lane.mjs`

`tools/workstream-verification-plan.mjs`

`docs/testing/workstream-contracts/csapi-gate01-d3.execution.json`

---

# 13. LATEST BRANCH MOVEMENT AFTER STEP 3

Step 3 had been verified at:

`c57e35b791593175343c893d57368c582129fa24`

The branch then gained additional runtime-verification commits.

A comparison from:

`2cf9b95c817523d561c4e344f3bbc1023e0669c3`

to current:

`381302a2c34542502e2c58d1d39804d7e6152336`

shows 9 additional commits whose file-level scope was limited to:

- `src/domain/queue/workspace.actions.ts`
- `tools/workstream-verification-lane.mjs`

The current runtime lane is therefore not the same repository state as the Step 3 verified head and must be judged from the current PR head.

---

# 14. CURRENT PR STATE

PR #172:

- Open
- Draft
- Base: `main`
- Mergeable: true
- Not merged
- Current head: `381302a2c34542502e2c58d1d39804d7e6152336`

The PR title/body still contains the **original plan-freeze wording** saying that no D3 implementation code is included.

That PR body is now stale and must not be treated as scope truth.

Do not merge PR #172 while D3 Step 4 remains unverified.

PR body reconciliation belongs to Step 5/6 after runtime is actually proven.

---

# 15. EXACT NEXT WORK — DO THIS, AND NOTHING BROADER

The new conversation must begin here.

## Step 4A — Make the runtime verifier truthful

Before testing product behavior again:

1. Make every UI action fail the runtime immediately when its underlying server action returns/throws an error.
2. Do not print PASS merely because a button click succeeded.
3. Capture the actual application error returned from Server Actions.
4. Remove any false-positive acceptance after:
   - Reception arrival;
   - Clinical pull;
   - Finish;
   - Reception completion.
5. Keep the existing local diagnostic permissions/data checks temporarily until root cause is proven.

## Step 4B — Resolve the first real application defect

The first concrete product/runtime defect is:

```
clinic_visit_sessions_initialized_by_receptionist_fkey
```

Determine the actual FK target and identity domain.

Important:
- `initialized_by_receptionist` currently expects the identity type enforced by its FK.
- The runtime fixture currently uses a `clinic_users.id` value for that field.
- Do not blindly change the schema.
- Inspect the current FK definition, current application semantics and historical caller behavior.
- If this is merely a fixture identity mismatch, fix the fixture.
- If the application's current write path is semantically wrong, fix the smallest D3-compatible application path.
- If fixing it requires an architectural decision, stop and ask the user.

## Step 4C — Re-run runtime

Only after the first concrete defect is fixed:

1. Run the local/CI D3 runtime.
2. Confirm:
   Reception → Waiting
   → Clinical Pull
   → Clinical Work
   → Finish
   → Pending Close
   → Reception Complete
   → Completed
3. Verify D2 Queue Entry / Work Session / Event projections.
4. Verify at least one negative authority case.
5. Verify tenant isolation.
6. Verify no duplicate/concurrent lifecycle result.
7. Confirm the runtime verifier itself is fail-fast and trustworthy.

## Step 4D — Do not overreach

Do not:
- redesign Patient Flow;
- redesign Clinical Workspace;
- redesign Reception Workspace;
- change final roles;
- design commercial subscription tiers;
- create new permissions unless a concrete D3 capability gap proves one is required;
- repair unrelated domains;
- use Vercel;
- mutate hosted Production Supabase.

---

# 16. WHAT IS NOT AN ARCHITECTURAL DECISION YET

The latest runtime findings do **not** yet justify changing:

- D3 command architecture;
- Queue architecture;
- Work Session architecture;
- Patient Flow ownership model;
- Role/Entitlement/Subscription architecture.

The next conversation should first inspect the concrete FK and runtime caller path.

Do not escalate to architecture merely because the runtime failed.

---

# 17. PRODUCTION / DEPLOYMENT BOUNDARY

Current D3 stage is implementation + local/CI verification.

No Production Supabase migration has been authorized for D3.

No Production Supabase mutation may be used to make the runtime test pass.

Vercel is forbidden for D3 verification.

The final Vercel/Production stage is later, after D3 is proven, reviewed, merged to `main`, and the approved release boundary is reached.

---

# 18. DOCUMENTATION RULE FOR THE NEXT CONVERSATION

After each material runtime correction:

- update this Handoff;
- update `CORE_SYSTEM_EXECUTION_HANDOFF.md`;
- update `CORE_SYSTEM_EXECUTION_LEDGER.md`;
- record exact head;
- record exact CI Run ID/number;
- record first concrete failure and correction;
- state whether the failure was:
  - verifier defect,
  - fixture/replay defect,
  - genuine application defect,
  - architecture decision,
  - future-phase finding.

Never write “PASS” for a runtime step unless the actual lifecycle transition succeeded and the evidence was independently checked.

---

# 19. FINAL RESUME STATEMENT

**Resume from:**

```
CSAPI
  ↓
D3 Step 4 — Integrated Runtime
  ↓
Fix/verify truthful runtime harness
  ↓
Resolve initialized_by_receptionist FK mismatch
  ↓
Re-run full integrated lifecycle
  ↓
Only after PASS → Step 5 Final Review
  ↓
Step 6 Documentation / Closure
```

**D3 Step 4 is currently OPEN.**

**The current D3 database authority is green.**

**The integrated runtime is not yet proven.**

**The most recent real runtime defect is the Reception arrival FK error.**

**The verifier is currently capable of false-positive PASS messages and must be hardened before trusting a new runtime result.**

**Do not merge PR #172 yet.**

**Do not use Vercel.**

**Do not touch Production Supabase.**

**Resume token: `CSAPI`**
