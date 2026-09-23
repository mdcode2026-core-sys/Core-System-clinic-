# CSAPI — Gate 01/02 Comprehensive Repair & Architecture-to-Reality Reconciliation Plan
**Date:** 2026-09-23
**Status:** OPEN — BASELINE REASSESSMENT IN PROGRESS
**Branch:** `csapi/gate01-02-comprehensive-repair-reconciliation-2026-09-23`
**Base main:** `babcb6f915e6549a72c31167986e2e974e3bc30f`

## 1. Purpose

This work supersedes a narrow "closure/evidence adjustment" approach.

The objective is to re-evaluate the actual Gate 01 and Gate 02 implementation against the approved architectural sources, then repair any proven architectural, ownership, data, runtime, authorization, migration, or documentation mismatch at its root.

A CLOSED label is not treated as proof of correctness. A missing evidence item is also not treated as proof that the implementation is missing.

The governing rule is:

**Approved architecture → documented domain contract → repository implementation → live database/migrations → runtime behavior → production evidence → synchronized documentation.**

A disagreement at any layer must be classified before any change is made.

## 2. Authority hierarchy

1. Explicit final Product Owner architectural decisions.
2. CORE SYSTEM Master Blueprint / cross-domain architecture.
3. Relevant domain Engineering Blueprint.
4. Approved Patient Journey master/decision records and implementation plan.
5. CSAPI gate contracts and execution records.
6. Current repository implementation, live Supabase schema/data/functions/RLS, and verified runtime behavior as implementation reality.
7. Historical records only as evidence of how the current state was reached.

Historical documentation must not silently override current reality; current reality must not silently override an approved architecture decision.

## 3. Initial proven findings

### Gate 01 — Patient Flow

**Current classification: KEEP / VERIFY INTEGRATION, not rebuild.**

The current implementation has direct alignment with the approved Patient Flow architecture:

- canonical Visit state machine: waiting → in_consultation → pending_close → completed;
- clinical authority ends at pending_close;
- Reception owns pending_close → completed;
- canonical clinical Work Session exists;
- D3 command adapters are the lifecycle write authority;
- generic lifecycle completion was intentionally removed from the clinical path;
- authenticated runtime evidence exists for the core Reception → Clinical → Finish → Reception completion sequence.

No Gate 01 rebuild is authorized from the present evidence.

However, Gate 01's closure evidence is a Patient Flow proof, not a proof of the later longitudinal Patient Journey. The Agenda-only broad-runtime observation must remain a dependency for Gate 02 reconciliation.

### Gate 02 — Patient Journey

**Current classification: RECONCILE / EXTEND — not "missing implementation" by default.**

The earlier Gate 02 deep audit correctly found that the historical closure evidence did not prove the complete longitudinal contract. However, repository inspection now proves that more implementation exists than the narrow Gate 02 continuity audit checks.

Direct evidence includes:

- `clinic_treatment_plans`, `clinic_treatment_plan_items`, and `clinic_treatment_plan_visits`;
- Treatment Plan workspace with create/add-item/activate/complete/link-visit behavior;
- Treatment Plan action logic that identifies the next planned item and creates an `operational_work_items.kind = next_action` record;
- idempotency protection for Treatment Plan stage → Next Action;
- Follow-up → Next Action bridge into the same `operational_work_items` coordination record;
- Agenda remains the appointment authority;
- cross-domain contract explicitly defines Treatment Plan → Next Action → work/booking requirement → Agenda → completed Visit → next stage.

Therefore the current problem is not established as "Gate 02 functionality does not exist". The proven problem is that the existing implementation, architecture documents, scenario claims, tests, and closure evidence have not yet been reconciled into one verified end-to-end contract.

## 4. Critical reconciliation contradiction discovered

The repository contains conflicting historical claims about scenarios 20/21:

- `docs/IDEAL-SCENARIO-IMPLEMENTATION-GAP-MATRIX-2026-08-30.md` classifies 20 and 21 as IMPLEMENTED.
- `docs/FINAL-IDEAL-SCENARIO-CLOSURE-REPORT-2026-08-30.md` still lists Treatment Next Action → Booking Requirement → Agenda as a remaining blocker.
- `docs/CSAPI/GATES/GATE-02-PATIENT-JOURNEY.md` and the previous narrow continuity audit do not directly exercise this implementation.
- Current source and migrations prove a Treatment Plan → operational work Next Action path exists.

This is exactly the type of contradiction this repair pass must resolve. It cannot be closed by editing a status label. The actual trigger, state transition, authorization, persistence, Agenda handoff, completion result, and repeated-visit behavior must be tested.

## 5. Current live database evidence

Live Supabase project `core-system-clinic` / ref `qaslsjyxjwvdoiczmhgq` was inspected on 2026-09-23.

Observed counts:

| Canonical object | Live rows |
|---|---:|
| Clinic patients | 396 |
| Visit sessions | 139 |
| Treatment plans | 8 |
| Treatment plan items | 4 |
| Treatment plan ↔ Visit links | 3 |
| Agenda events | 342 |
| Operational work items | 17 |
| Retention follow-ups | 825 |
| Legacy patient_history | 0 |

Relevant live structures exist for:
- Visit continuity;
- Treatment Plans and stages;
- Treatment Plan ↔ Visit linkage;
- Agenda;
- Operational Work;
- Follow-up;
- patient-centered longitudinal identity.

The live schema must still be reconciled against repository migration history before any schema modification is considered.

## 6. Next Action ownership must be reconciled

There are at least three legitimate producers/paths:

1. Treatment Plan stage → operational Work Item `next_action`.
2. Completed Follow-up with explicit next action → operational Work Item `next_action`.
3. Authorized manual Journey Coordination creation of a `next_action` Work Item.

This does not automatically mean there are three engines.

The repair audit must prove:

- `operational_work_items` is the coordination execution record;
- Treatment Plan remains owner of treatment-stage truth;
- Follow-up remains owner of follow-up truth;
- Agenda remains owner of appointments;
- no producer silently changes another domain's source-of-truth state;
- repeated triggers are idempotent;
- source references are preserved;
- completion/result returns to the correct owning domain;
- no hidden Patient Journey state machine exists in parallel.

## 7. Comprehensive execution phases

### Phase A — Architecture source reconciliation
Read and reconcile:
- ARCHITECTURE_DECISIONS.md;
- CORE SYSTEM Master Blueprint;
- Journey Coordination Engineering Blueprint;
- approved PJ records and implementation state/closure records;
- Gate 01 and Gate 02 contracts;
- cross-domain implementation contracts;
- ideal scenario/traceability/reality-validation records.

Output:
- authoritative architecture matrix;
- superseded-vs-current terminology map;
- explicit ownership matrix;
- contradiction register.

### Phase B — Gate 01 implementation audit
Inspect:
- queue/Patient Flow state machine;
- D3 command/data/event contracts;
- Work Session lifecycle;
- Reception/Clinical workspace boundaries;
- tenant/permission enforcement;
- event/audit trail;
- Agenda ↔ Visit linkage;
- production/runtime evidence.

Output:
- KEEP / RECONCILE / EXTEND / REMOVE classification per component;
- no rebuild unless a root architectural mismatch is proven.

### Phase C — Gate 02 implementation audit
Inspect the complete longitudinal path:

Patient
→ Visit
→ Clinical result
→ Treatment Plan
→ Treatment stage
→ Next Action
→ Operational Work / Appointment / Follow-up
→ next Visit
→ Treatment Plan advancement
→ continuation/completion.

Also inspect:
- repeated visits;
- source Visit identity;
- Plan ↔ Visit linkage;
- Agenda ↔ Visit linkage;
- Follow-up ↔ Visit linkage;
- operational work source references;
- Portal and Medical Photos boundaries;
- tenant isolation and authorization.

### Phase D — Duplicate-engine and ownership audit
Search the entire repository, migrations, SQL functions, triggers and runtime paths for:
- Patient Journey state;
- Next Action creation;
- Follow-up automation;
- Appointment creation from journey state;
- Visit continuation;
- Treatment Plan progression;
- operational work generation.

Every producer is classified as:
**canonical integration / valid domain producer / duplicate engine / legacy residue / dead code.**

### Phase E — Database and migration reconciliation
Compare:
- repository migrations;
- live migration history;
- live schema;
- functions/triggers;
- RLS;
- indexes/constraints;
- generated types.

No migration will be created merely to make repository history look clean.

Any live-only migration/function must be identified and semantically reconciled first.

### Phase F — Runtime proof
Build or repair authenticated runtime scenarios for the proven contract, prioritizing:

2 Existing patient recognition
4 Pre-booked arrival/check-in
6 Service/procedure selection → next action
18 Clinical decision → Treatment Plan
19 Multi-stage Treatment Plan
20 Treatment stage → Next Action
21 Next Action → future Appointment
22 Completed procedure → Treatment Plan advancement
23 Treatment Plan planned completion
41 Domain event → operational work → authorized completion
42 Completed Visit → Follow-up / next journey action

The 42-scenario matrix remains traceability; runtime proof must be executable evidence.

### Phase G — Root-cause implementation repair
Only after Phases A–F identify concrete defects:
- repair canonical implementation;
- preserve domain ownership;
- avoid parallel engines;
- use additive/non-breaking migrations where appropriate;
- preserve existing data;
- update tests at the same root;
- remove only proven conflicting/obsolete implementation.

### Phase H — Full verification and closure
Run:
Engineering Tests
→ Clean DB Migration Verification
→ Live Supabase Verification
→ Runtime Verification
→ Production Deployment + Verification
→ authenticated Production E2E
→ Final Reconciliation & Documentation.

Gate closure is prohibited until the architecture, implementation, DB, runtime and evidence all agree.

## 8. Explicit non-goals

This repair pass does not authorize:
- rebuilding Patient Journey from scratch;
- rebuilding Gate 01 Patient Flow without evidence;
- creating a universal workflow engine;
- replacing Agenda;
- replacing Follow-up;
- replacing Journey Coordination;
- absorbing downstream Gate 03 work;
- unrelated workforce/finance changes;
- documentation-only closure.

## 9. Current decision

**Gate 01:** retain CLOSED provisionally while performing integration/dependency audit; no Gate 01 rebuild is currently justified.

**Gate 02:** historical closure remains superseded. The correct working state is:

**OPEN — COMPREHENSIVE ARCHITECTURE / IMPLEMENTATION / RUNTIME RECONCILIATION REQUIRED.**

**Gate 03:** remains blocked. Its independent E2E failure is not mixed into this repair pass until Gate 01/02 baseline is re-established.

## 10. Exit condition for this repair baseline

The baseline phase is complete only when there is one reconciled matrix showing, for every critical Patient Journey behavior:

**Architecture requirement → owning domain → canonical source → repository path → DB object/function → authorization boundary → runtime scenario → production evidence → documentation status.**

Only then can implementation repairs be sequenced safely.

## 11. Direct PJ architectural constraints confirmed from the approved source package

The approved PJ source package adds non-negotiable constraints that must govern this repair:

- one canonical domain per business responsibility;
- one canonical source of truth per major business entity;
- inspect and reuse existing domains before creating new ones;
- duplicate systems are prohibited;
- integration must be explicit;
- optional modules must not become unnecessary hard dependencies;
- Visit must not require Treatment Plan;
- Follow-up must not become Notification;
- Patient must not become the owner of the entire journey;
- tenant isolation applies to every tenant-scoped domain;
- permissions must be enforced at the appropriate security boundary;
- historical findings must be revalidated before correction;
- runtime workflow must be validated before declaring completion;
- architectural conflicts must be escalated rather than guessed.

The PJ Stage 14/15 closure contract is especially important: complete closure requires end-to-end validation, UI/data/tenant/permission/workflow/integration/independence/failure/persistence/regression validation, database = repository migration model = application expectations = documentation, and recorded final Git/deployment state.

The current repository does not contain a file named PJ_STAGE15_CLOSURE.md despite several current documents naming it as an authority. The approved source package contains the Stage 15 closure requirements in PJ-08 and the broader implementation plan. This is therefore a documentation-authority reconciliation item, not a reason to invent or restore a missing file blindly.
