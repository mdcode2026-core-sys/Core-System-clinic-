# CORE SYSTEM — CSAPI Gate 01 — D3 Lifecycle Write Authority Plan

**Updated:** 2026-09-19
**Stage:** D3 — Lifecycle Write Authority / Commands
**Status:** PLAN FROZEN BEFORE CODE
**Parent:** D2 Patient Flow database foundations — merged to `main`
**Main baseline:** `af50b24fe4b86a559db508fa7a44f5c3633e103d`
**D2 merge SHA:** `6013a9ffa4705738bc9e8de7c0d1403ff6a0858e`
**D3 branch:** `implementation/csapi-gate01-d3-lifecycle-authority-2026-09-19`

## 1. Purpose

D3 provides the authoritative write layer for Patient Flow over the D2 database foundations.

Authorization boundary clarification: `patient_flow:operations` / `patient_flow:clinical` / `patient_flow:administrative` remain Patient Flow surface/workspace access signals. Lifecycle write authority uses the existing canonical session permissions (`sessions:update`, `sessions:close`) together with state, subject-ownership and administrative-override rules already used by current Queue/Workspace actions.

D3 does not redesign Patient Flow, create a second Queue engine, replace Agenda, replace Patient Journey, or redesign the UI.

The execution sequence for D3 is binding:

```
VERIFY
  ↓
PLAN / CONTRACT
  ↓
PLAN REVIEW
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

After every completed implementation step, the Handoff and Ledger must be updated with:
- exact files changed;
- reason for the change;
- verification evidence;
- result;
- next approved step.

The next step may not be inferred from an old document after the current step changes repository state. The current plan and current repository head are rechecked before continuing.

## 2. Verified current baseline

The repository already contains:
- canonical Queue transition validation in `src/domain/queue/queue.engine.ts`;
- existing Visit/Queue write actions in `src/domain/queue/queue.actions.ts` and `src/domain/queue/workspace.actions.ts`;
- existing Clinical and Operation Workspace consumers;
- Stage 6 Patient Flow permissions;
- D2 tables for Work Session, Queue Entry and Event.

The current write paths are not yet D3-complete because they directly mutate `clinic_visit_sessions` and do not atomically project the same transition into the D2 Work Session / Queue Entry / Event records.

The existing broad `moveFromPatientFlow` action is specifically identified as a generic mutation surface that must not remain the canonical D3 authority.

## 3. D3 behavioral contract

The canonical Visit lifecycle remains:

```
Waiting
   ↓
Clinical Start
   ↓
Clinical Work
   ↓
Pending Close
   ↓
Reception Completion
   ↓
Completed
```

Terminal alternatives remain:
- Waiting → No-show
- Waiting → Cancelled
- Clinical Work → Cancelled
- Pending Close → Cancelled

The following are non-negotiable:
- Waiting is a queue state, not clinical-start.
- Reception owns waiting order/movement and operational completion.
- The responsible clinical user/room pulls a waiting patient when work actually starts.
- Clinical completion returns the visit to Pending Close.
- Reception then completes the visit.
- The user-facing completion term is **Finish**.
- Pending Close is Visit-only and is not an Agenda state.
- Existing Agenda/Visit state compatibility remains intact.

## 4. Canonical D3 commands

The D3 command layer will expose domain-specific commands rather than a generic target-status mutation API.

### Command A — Enter Waiting

Purpose:
- establish the Visit waiting state;
- create/update the active Queue Entry;
- emit the authoritative waiting event.

Owner:
- authorized Reception/Operations actor.

### Command B — Reorder Waiting

Purpose:
- change persisted Queue Entry ordering/routing only for valid waiting cases;
- preserve Reception-defined order;
- never start clinical work.

Owner:
- authorized Reception/Operations actor.

This command covers persisted queue ordering/movement required by the approved Patient Flow behavior.

### Command C — Start Clinical Work

Purpose:
- atomically claim the waiting case for the responsible clinical actor;
- close the waiting Queue Entry;
- create the active Work Session;
- move the Visit to `in_consultation`;
- record the clinical-start Event.

Owner:
- authorized clinical actor.

The command must respect the assigned provider/room context already present in the canonical Visit/Agenda relationships. It must not invent a new room-assignment architecture.

### Command D — Finish Clinical Work

Purpose:
- atomically finish the active Work Session with outcome `finish`;
- release clinical ownership;
- move the Visit to `pending_close`;
- create the reception handoff Queue Entry;
- emit the clinical-finished / pending-close event.

Owner:
- the active clinical actor for that Work Session, subject to the existing administrative override boundary.

### Command E — Complete Reception

Purpose:
- atomically complete the Pending Close workflow;
- close the active reception Queue Entry;
- move the Visit to `completed`;
- emit the completion event.

Owner:
- authorized Reception/Operations actor.

### Command F — Cancel Patient Flow

Purpose:
- cancel a non-terminal waiting, active clinical, or pending-close workflow according to the existing legal transition rules;
- close relevant active Queue Entry / Work Session state as required;
- emit the cancellation event.

Owner:
- actor authorized for the current context and transition.

### Command G — Mark No-show

Purpose:
- move a waiting Visit to terminal `no_show`;
- close the active Queue Entry;
- emit the no-show event.

Owner:
- authorized Reception/Operations actor.

## 5. Work Session semantics

D2 already defines Work Session statuses `active`, `finished`, `held`, `transferred`, and `cancelled`.

For D3 core lifecycle:
- `active` represents the current clinical work segment;
- `finished` with outcome `finish` represents normal clinical completion;
- `cancelled` is used when an active Work Session is cancelled;
- `held` / `transferred` are not new Visit lifecycle states and are not expanded as additional Visit states by D3.

Existing legacy Hold/Resume behavior must be audited as part of implementation so it cannot become an untracked lock-release bypass.

## 6. Atomicity rule

A lifecycle command may update multiple representations of the same business transition.

Those updates must succeed or fail together.

Therefore the canonical D3 write path will be a transactionally atomic database command boundary, called from thin server-side actions.

The database command boundary must:
- resolve the authenticated actor;
- resolve the tenant from the canonical tenant mechanism;
- verify effective permission;
- verify the current state;
- enforce the legal transition;
- lock/re-read the authoritative Visit row where needed;
- update D2 projections and the legacy Visit compatibility state together;
- emit the corresponding Patient Flow Event;
- return a deterministic result/error;
- make duplicate retries safe where the command contract defines idempotency.

This is an engineering implementation mechanism, not a new product architecture.

## 7. Legacy compatibility

D3 does not abruptly delete existing Queue/Visit code.

Instead:
1. establish the D3 canonical command boundary;
2. route current UI/server entry points through it;
3. prove equivalent behavior;
4. prove D2 projections are populated consistently;
5. remove/restrict obsolete generic mutation paths only after their callers are migrated and verified.

No blind deletion is permitted.

## 8. Tests — phase suitability review

### Existing Stage 6 audit

`tools/patient-flow-stage6-audit.mjs` remains a regression/static architecture check.

It verifies:
- explicit Patient Flow permissions;
- routes;
- server permission checks;
- Queue engine reuse;
- transition map;
- tenant scoping.

It is **not** sufficient as D3 evidence because it does not prove transactional D2 writes, command authorization, event creation, concurrency or idempotency.

### Existing D2 database test

`supabase/tests/csapi_gate01_d2_database_foundations.sql` remains D2 evidence.

It intentionally proves that D2 tables have no lifecycle write policies. It must remain unchanged by D3 except for any separately-proven regression need.

### Required new D3 verification

D3 must add a dedicated database/command verification lane covering at minimum:
1. Enter Waiting creates the expected Queue Entry + Visit state + Event.
2. Reorder Waiting changes order/routing without starting clinical work.
3. Start Clinical Work closes waiting queue state, creates exactly one active Work Session, changes Visit state and emits Event.
4. Finish Clinical Work finishes the Work Session, moves Visit to Pending Close, creates reception handoff state and Event.
5. Complete Reception reaches Completed and closes active queue state.
6. No-show and Cancel follow only legal transitions.
7. Unauthorized actors cannot execute commands.
8. Cross-tenant identifiers are rejected.
9. Duplicate active Work Sessions remain impossible.
10. Duplicate active Queue Entries remain impossible.
11. Concurrent competing starts cannot create two active Work Sessions.
12. Retry behavior is deterministic for commands that use correlation/idempotency semantics.
13. Event actor/tenant/visit/session/queue relationships remain consistent.
14. No direct legacy mutation path remains authoritative after migration of its callers.

### Integrated runtime verification

A dedicated D3 runtime scenario must prove the real business path:

```
Reception opens Visit
   ↓
Waiting
   ↓
Reception reorder (when applicable)
   ↓
Clinical user pulls patient
   ↓
Clinical Work
   ↓
Finish
   ↓
Pending Close
   ↓
Reception Completion
   ↓
Completed
```

The runtime test must use a controlled local/CI environment and must not call Vercel or Production Supabase.

## 9. Step gates

### Step 0 — Plan Freeze
Output:
- this D3 plan;
- D3 verification plan;
- D3 workstream contract;
- Handoff/Ledger update.

Gate:
- all scope and test boundaries are explicit.

### Step 1 — Command/data contract
Define exact database command signatures, returned outcomes, error codes, transition rules and event types.

Gate:
- every command has one owner, one transition purpose and one audit result.

### Step 2 — D3 database mutation boundary
Implement the atomic command functions and required write grants/RLS/security controls.

Gate:
- database command tests pass locally/CI.

### Step 3 — Server action integration
Replace current D3-owned direct mutation call sites with thin wrappers over the canonical commands.

Gate:
- Stage 6 remains green;
- no generic mutation bypass remains in active D3 entry points.

### Step 4 — Integrated runtime
Prove Reception → Waiting → Clinical → Finish → Pending Close → Reception → Completed.

Gate:
- runtime test passes with authorization and tenant negative paths.

### Step 5 — Final review
Review:
- architecture boundaries;
- migration chain;
- RLS/grants;
- callers;
- test scope;
- regression;
- exact diff.

Gate:
- no unresolved D3 implementation defect.

### Step 6 — Documentation / Closure
Record:
- exact branch/head;
- migrations;
- command list;
- CI runs;
- runtime results;
- deferred findings;
- final decision.

D3 is not closed until all required evidence exists.

## 10. Explicit non-scope

D3 will not:
- redesign Patient Flow UI;
- redesign Clinical Workspace;
- redesign Reception Workspace;
- change Agenda ownership;
- change Patient Journey ownership;
- introduce a second Queue engine;
- introduce a second permission engine;
- add unrelated Workforce/Payroll/Financial/Inventory work;
- move Patient Flow into the ordinary-user Sidebar;
- deploy D3 to Production during implementation;
- use Vercel for D3 verification.

## 11. Step-by-step review rule

After every successful step:
1. verify the exact repository head;
2. verify the documented files;
3. verify the expected tests for that step;
4. update Handoff/Ledger;
5. re-read this plan;
6. confirm the next step is still compatible;
7. only then continue.

A failed executable step is handled by inspecting the first concrete cause and fixing the smallest necessary defect. Execution stops only for an unresolved architectural decision requiring the owner.

**Status:** D3 IMPLEMENTATION IN PROGRESS — STEP 4 RUNTIME REMEDIATION PENDING


## Current D3 Implementation State — 2026-09-19

Steps 0, 1, 2A, 2B and 3 are complete at their respective gates.

Step 4 — Integrated Runtime is **OPEN / NOT PASSED**.

Latest verified implementation candidate:
`381302a2c34542502e2c58d1d39804d7e6152336`

Latest CI:
Run #576 (`35449505099`)

- Build plan: PASS
- Engineering: PASS
- D3 database/command: PASS
- Patient Flow Stage 6 regression: PASS
- D3 integrated runtime: FAIL
- Final gate: FAIL

The runtime failure is currently split into two facts:

1. The authenticated runtime can resolve the expected technical permissions and read the seeded waiting Visit/Patient.
2. The Reception arrival path produces a real FK error on `clinic_visit_sessions.initialized_by_receptionist`, while the current runtime harness incorrectly treats the UI click as a PASS and continues.

Therefore the runtime test evidence is not yet sufficient to establish lifecycle success.

**Next approved action:** harden the runtime verifier to fail fast, inspect the exact FK target/identity semantics, correct the smallest proven defect, and rerun the complete D3 runtime. Do not begin Step 5 until the runtime evidence is trustworthy and green.
