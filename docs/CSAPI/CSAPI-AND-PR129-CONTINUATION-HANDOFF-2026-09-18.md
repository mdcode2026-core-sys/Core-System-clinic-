# CORE SYSTEM — CONTINUATION HANDOFF
## CSAPI Gate 01 + PR #129 + Verification Architecture
**Date:** 2026-09-18  
**Purpose:** Conversation-independent handoff for the next conversation.  
**Status:** OPEN — verification architecture corrected; CSAPI implementation and PR #129 remain in progress.

---

## 1. EXECUTIVE STATE

The current work uncovered a recurring execution problem in CORE SYSTEM's automated testing path.

The former **Unified Test Execution Engine** was found to be unsuitable as the canonical execution model for the current stage of work. The problem was not insufficient test coverage; it was the execution architecture:

- unrelated suites were executed through one long-lived runner/process;
- runtime suites could share mutable server/process state;
- different logical requirements could map to the same underlying command;
- contract declarations were not guaranteed to map one-to-one to executed checks;
- previous runs produced confusing overlapping CI evidence;
- failures in infrastructure/setup could be mistaken for failures in the product under test;
- PR #129 exhibited the same class of problem, confirming this is systemic rather than D2-specific.

The corrective architecture is now **Workstream Verification Lanes**.

The key rule is:

> Each meaningful workstream verification runs in an isolated GitHub Actions job/process. A final gate aggregates results but does not execute tests.

This is intended to preserve, not reduce, verification quality.

---

## 2. CURRENT REPOSITORY / EXECUTION RULES

Repository:
`mdcode2026-core-sys/Core-System-clinic-`

Authoritative execution sequence:
`VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE`

Standing constraints:
- no direct implementation work on `main`;
- purpose-specific branches;
- DB changes through migrations;
- preserve test data;
- additive/non-breaking unless explicitly authorized;
- Inspect → Reuse → Extend → Create;
- no duplicate engines;
- Vercel is not used during this verification phase;
- final production/Vercel verification is reserved for the final release stage;
- free/local disposable Supabase/Postgres verification is preferred;
- do not treat CI green status as product closure without the applicable business/runtime evidence.

---

## 3. VERIFICATION ARCHITECTURE DECISION

### Retired canonical model

The previous model was:

`SETUP → one Unified Runner → many suites → one report`

This is no longer the canonical execution model.

PR #160, which attempted to consolidate D2 into the Unified Test Engine, is **closed and not merged**.

### New canonical model

The repository now contains the Workstream Verification architecture:

- `.github/workflows/test-execution-contract.yml`
- `tools/workstream-verification-plan.mjs`
- `tools/workstream-verification-lane.mjs`
- `docs/testing/WORKSTREAM-VERIFICATION-ARCHITECTURE.md`
- `docs/TEST-EXECUTION-ENGINE.md`

PR #164:
- title: `ci: replace unified test execution with isolated workstream verification lanes`
- merged: **2026-09-18**
- merge commit: `e2b63b7bb9e1c0bb271f386c84325b8d02cae8bf`
- base before merge: `afb6afbfaaaab8bb50269bcc4233d96f76870cd0`
- head: `3628280ca85c48cebb72aa4fbaa15b6ae2d2ec74`

**Important:** PR #164 was merged into `main`. Therefore the verification architecture is now part of the repository baseline and must be treated as current infrastructure, not as an experimental branch.

---

## 4. NEW WORKSTREAM VERIFICATION MODEL

### Planner

`tools/workstream-verification-plan.mjs`

Responsibilities:
- compare exact candidate against exact baseline;
- identify applicable workstream contracts;
- resolve each required suite/check to an explicit verification lane;
- fail closed on unsupported suites/checks;
- output the exact lane matrix.

Unknown required suites/checks are errors.

### Lane runner

`tools/workstream-verification-lane.mjs`

Responsibilities:
- execute exactly one lane;
- install dependencies independently when required;
- create its own runtime server when required;
- run its explicit command;
- stop on the first failed check in that lane;
- emit a lane evidence JSON file;
- return a non-zero exit code on failure.

### Final gate

The workflow's final gate:
- does not execute tests;
- does not reinterpret failures;
- only passes if planning succeeded and all applicable lane jobs succeeded.

### Isolation

Runtime lanes do not share one long-lived Next.js server.

Database lanes use disposable/local infrastructure and do not modify hosted production Supabase.

---

## 5. CURRENT CI STATUS OF THE NEW MODEL

The first clean Workstream Verification run reached:

- planner: **SUCCESS**
- engineering lane: **IN PROGRESS**

The earlier verification run was cancelled when a newer candidate superseded it.

This is important:

> The new architecture has been installed and the planner has successfully executed. It has not yet been fully proven green across all applicable lanes.

Therefore **do not claim the new verification architecture is fully validated yet**.

The next conversation must complete this validation on a clean candidate and inspect each lane result individually.

---

# 6. CSAPI GATE 01 — CURRENT STATE

## Architectural work completed

### PR #139
**CSAPI Gate 01 — Patient Flow architecture reconciliation**
- open
- not merged

Documents:
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-HISTORICAL-DOCUMENTATION-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ENGINEERING-RECONCILIATION-2026-09-17.md`

### PR #140
**CSAPI Gate 01 — Patient Flow architecture gap matrix**
- open
- draft
- 90 granular gap/invariant rows
- no implementation authorized by the matrix itself.

### PR #141
**CSAPI Gate 01 — Patient Flow target architecture specification**
- open
- draft
- target architecture only
- no production implementation authorized by that document.

Core decision: Patient Flow is not one giant enum. The conceptual dimensions are:

- Visit Finality: open / completed / cancelled / no_show
- Clinical Work Session: active / finished / held / transferred / cancelled
- Queue / Waiting Presence: no_active_entry / waiting
- Operational Disposition: active / reassignment_eligible / escalated / closed_for_operation
- Administrative Disposition: open / closed

### PR #142
**CSAPI Gate 01 — Patient Flow implementation decision reconciliation**
- open
- draft
- proposed implementation decisions requiring Product Owner authorization where marked.

### PR #143
**CSAPI Gate 01 — D1 canonical Patient Flow contracts**
- open
- draft
- D1 implementation exists in:
  `src/domain/patient-flow/patient-flow.contracts.ts`
- verified candidate SHA:
  `b9470061da5c188adff40b0956ce03a540beccf8`
- CI verification run ID: `35242133608`
- result: **SUCCESS**
- exact candidate SHA tested: `b9470061da5c188adff40b0956ce03a540beccf8`

D1 is additive and currently has no production consumers.

---

# 7. CSAPI D2 — DATABASE FOUNDATIONS

PR #145:
**CSAPI Gate 01 — D2 Patient Flow database foundations**
- open
- draft
- not merged
- must remain unclosed until the corrected implementation is validated through the new verification path.

D2 creates three foundational tables:

### `clinical_work_sessions`
Child clinical work unit inside a Visit.

### `patient_flow_queue_entries`
Operational Waiting/queue representation.

### `patient_flow_events`
Append-only business lifecycle event representation.

Additional foundation:
- tenant-safe composite foreign keys;
- tenant-scoped indexes;
- RLS enabled;
- authenticated SELECT;
- no lifecycle write policies in D2;
- duplicate active Work Session prevention;
- duplicate active Queue Entry prevention.

---

## 8. D2 VERIFIED TEST CONTRACT

File:
`supabase/tests/csapi_gate01_d2_database_foundations.sql`

Expected plan:
**35 tests**

The verified test covers:
- table existence;
- active Work Session uniqueness;
- active Queue Entry uniqueness;
- tenant-safe Visit FKs;
- RLS;
- authenticated SELECT;
- absence of authenticated INSERT;
- absence of lifecycle write policies;
- two tenant fixtures;
- duplicate active Work Session rejection;
- duplicate active Queue Entry rejection;
- cross-tenant FK rejection;
- cross-tenant Event relationships;
- tenant isolation for Work Session/Queue/Event;
- rollback behavior.

A corrected disposable local PostgreSQL workflow previously produced:
- database verification: **PASS**
- application regression: **PASS**
on verification run `35273104936`.

However, that run validated a verification candidate rather than the final D2 implementation branch head. Therefore it is evidence of the corrected D2 test design, not closure of PR #145.

---

## 9. D2 CORRECTIONS ALREADY PROVEN

The D2 migration required composite tenant keys for referenced entities.

Added/verified:
- `clinic_users(tenant_id,id)`
- `clinic_rooms(tenant_id,id)`
- `clinic_visit_sessions(tenant_id,id)`

D2 migration latest known implementation commit:
`432be88b4fb3f978901797b931c006dafcb33c95`

D2 test fixture correction:
`9d2cf8b6647d6382a6f800cff9188a5b54488975`

The disposable verification environment also required:
- `pg_net` in PostgreSQL preload;
- elevated role for canonical baseline application;
- test-only `auth.jwt()` / `auth.uid()` boundary after baseline;
- canonical-schema-compatible fixtures.

These are verification-environment details, not production schema decisions.

---

# 10. D2 FAILURE HISTORY — DO NOT REUSE AS CLOSURE EVIDENCE

During the failed Unified-Test consolidation:
- Unified and standalone D2 workflows both ran against the same candidate;
- multiple Unified runs overlapped;
- the standalone D2 workflow failed at the auth/pgTAP boundary;
- later runs were cancelled/superseded.

The important conclusion is:

> Those failures do not establish that the D2 database design is wrong.

They exposed a fragile verification architecture and setup-boundary problem.

Do not reopen D2 design decisions solely because of those CI failures.

---

# 11. PR #129 — GLOBAL EXPERIENCE

PR #129:
**repair: consolidate global experience branches 122-128 into 129**
- open
- draft
- not merged

Current head at the time of this handoff:
`48be923c1d99d465bebdfdb2f8f5a000b34ce734`

Base:
`main`
Current main base in PR #129 metadata:
`d85a5de23051919fb347e1482bc28f5fe70c0e14`

PR #129 remains the canonical execution path for the Global Experience consolidation.

Historical recovery already integrated includes PRs:
- #130
- #131
- #132
- #133
- #134

The detailed existing PR #129 handoff remains the authoritative product/UX recovery record.

---

# 12. PR #129 + VERIFICATION ARCHITECTURE

The same isolated Workstream Verification architecture was propagated into PR #129.

Confirmed on the current #129 branch:
- `.github/workflows/test-execution-contract.yml`
- `tools/workstream-verification-plan.mjs`
- `tools/workstream-verification-lane.mjs`
- `docs/testing/WORKSTREAM-VERIFICATION-ARCHITECTURE.md`

Current file SHAs on #129:
- workflow: `e11c7928d014afa6782b6096e5d83cda94a79157`
- planner: `89395b7c675a1918adf08f69218b2b7e361da74b`
- lane runner: `4fbe47a1c98b9ee3c31574296028a13114550a55`
- architecture doc: `41458c8fb3df3e041706d15e8763500a615d24f1`

Therefore the next conversation should not recreate a second test architecture for #129.

---

# 13. IMPORTANT PR #129 VERIFICATION LESSON

The repeated failures in #129 are part of the reason the Unified Runner was retired.

The next verification must distinguish:

1. planner failure;
2. dependency/setup failure;
3. static check failure;
4. build failure;
5. runtime-server startup failure;
6. authenticated E2E failure;
7. actual product/business assertion failure.

A red CI result must never be reported simply as "the product test failed" until the failing lane proves that.

---

# 14. PATIENT FLOW TARGET — BUSINESS MODEL TO PRESERVE

The next conversation must preserve the approved Patient Flow semantics.

### Arrival / Waiting
Reception opens/creates the Visit.

Waiting can represent:
- scheduled appointment;
- walk-in without chart;
- existing patient walk-in;
- emergency/urgent;
- return from radiology/labs;
- multiple procedures;
- other daily operating cases.

Reception may reorder or route the queue.

**Queue movement is not clinical start.**

### Clinical
Clinical actor sees the Waiting queue in Clinical Workspace and pulls the patient to begin work.

The visible action should be:

**Finish**

Not "Finish Clinical Work" as a user-facing label.

Finish ends the current Work Session. It does not automatically mean the Visit is administratively completed.

### Hold
Hold leaves the Visit unresolved.

On return, reception can move it back into Waiting.

### Transfer
Transfer preserves the same Visit.

It may create a new Work Session and changes operational responsibility without changing Visit identity.

### Multiple work sessions
One Visit may contain multiple clinical/procedural Work Sessions.

### Operational closure
Operational closure is not the same as administrative closure.

### Carry-forward
An unresolved Visit may continue across operating dates without changing Visit identity.

### Follow-up
Follow-up is downstream of Completed Visit and must not be accidentally created from Hold/Transfer/unresolved states.

---

# 15. LIVE EVIDENCE ALREADY ESTABLISHED FOR GATE 01

Previous live audit evidence:
- 138 completed sessions;
- 1 stale Waiting session;
- zero active consultation/pending-close/cancelled/no-show in inspected snapshot;
- Agenda↔Visit reconciliation: zero mismatches across 138 linked sessions;
- tenant integrity tested: zero mismatches in inspected snapshot;
- `fn_set_session_buffer()`: pending_close + 5-minute buffer behavior;
- `fn_set_auto_close()`: +60-minute auto-close behavior when visit_closed_at changes under current trigger semantics;
- update audit trigger exists but actor can be NULL;
- no INSERT audit trigger found;
- follow-ups observed downstream of completed sessions;
- no Patient Flow permission namespace found in the inspected permission catalog.

The above is evidence, not approval to preserve every existing behavior. Target architecture supersedes ambiguous semantics where explicitly decided.

---

# 16. CURRENT OPEN ARCHITECTURAL / IMPLEMENTATION QUESTIONS

These remain to be resolved before CSAPI implementation closure:

1. Authoritative lifecycle command/RPC design.
2. Central transition enforcement versus arbitrary direct UPDATE.
3. Actor/capability matrix for every transition.
4. Clinical Finish atomicity.
5. Hold command and Hold→Waiting command.
6. Transfer command and Work Session continuation model.
7. Queue-entry ordering and realtime authority.
8. Operational timing policy storage at tenant level.
9. Pending-close / buffer / auto-close semantics.
10. Business lifecycle event schema and audit relationship.
11. Cross-day unresolved Visit query model.
12. Permission vocabulary and role matrix.
13. Reopen behavior.
14. Closure prerequisites.
15. Non-doctor clinical actors.
16. External investigation return-to-queue semantics.
17. Runtime authenticated E2E boundary.

No implementation should invent answers to unresolved items.

---

# 17. WHAT MUST HAPPEN NEXT

### First
Validate the new Workstream Verification architecture on a clean candidate.

Do not start by changing Patient Flow code.

### Second
Run a focused D2 verification lane on the corrected D2 candidate.

Required evidence:
- exact candidate SHA;
- disposable DB creation;
- canonical baseline application;
- D2 migration;
- 35/35 pgTAP;
- RLS/tenant isolation;
- application regression where required.

### Third
Only after D2 lane is independently green:
- use the same architecture for D2 + subsequent CSAPI stages;
- do not recreate standalone competing workflows.

### Fourth
Run PR #129 through the same lane model.

Review each lane independently and classify failures.

### Fifth
Only after verification infrastructure is stable, continue CSAPI implementation.

---

# 18. DO NOT DO

- Do not revive the Unified Runner.
- Do not add another monolithic test orchestrator.
- Do not create a new test framework for each PR.
- Do not merge PR #145 merely because an older verification candidate passed.
- Do not close PR #129 based on CI/build alone.
- Do not treat cancelled/overlapping runs as evidence.
- Do not use Vercel during this phase.
- Do not use hosted Supabase Branching.
- Do not weaken tests to make CI green.
- Do not infer a product defect from an unisolated CI/setup failure.

---

# 19. HANDOFF AUTHORITY

For next conversation:

**Current verification architecture authority**
`docs/testing/WORKSTREAM-VERIFICATION-ARCHITECTURE.md`

**Current PR #129 product/UX handoff**
`CORE_SYSTEM_EXECUTION_HANDOFF.md` on PR #129 branch.

**CSAPI Gate 01 architecture**
`docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-TARGET-ARCHITECTURE-2026-09-17.md`

**CSAPI implementation reconciliation**
`docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-IMPLEMENTATION-DECISION-RECONCILIATION-2026-09-17.md`

**D2 implementation**
PR #145 and its migration/test artifacts.

**Verification architecture merge**
PR #164, merge commit `e2b63b7bb9e1c0bb271f386c84325b8d02cae8bf`.

---

# 20. CLOSURE STATE

## CSAPI Gate 01
**NOT CLOSED**

Architecture and D1 foundations are substantially documented. D2 database foundation implementation exists but is not merged or closed.

## D2
**NOT CLOSED**

Corrected implementation and test design exist. Final validation must be performed through the new isolated lane architecture on the exact final candidate.

## PR #129
**NOT CLOSED**

Canonical Global Experience branch remains active. Verification must be rerun through isolated workstream lanes.

## Verification Architecture
**IMPLEMENTED IN MAIN — VALIDATION STILL REQUIRED**

PR #164 merged the new architecture into main, but a complete green proof of all applicable lanes has not yet been established.

---

## 21. NEXT CONVERSATION START POINT

Start by reading this file and then inspect:

1. `.github/workflows/test-execution-contract.yml`
2. `tools/workstream-verification-plan.mjs`
3. `tools/workstream-verification-lane.mjs`
4. `docs/testing/WORKSTREAM-VERIFICATION-ARCHITECTURE.md`
5. PR #145
6. PR #129

Then run one clean verification cycle and diagnose each lane independently.

Do not reconstruct the previous Unified-Test investigation.

**END OF HANDOFF**
