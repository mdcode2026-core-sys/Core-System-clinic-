# CSAPI Gate 01 — Patient Flow Implementation Design Packet

**Date:** 2026-09-17  
**Status:** IMPLEMENTATION DESIGN / NO EXECUTION IN THIS STAGE  
**Branch:** `architecture/csapi-gate-01-patient-flow-implementation-design-2026-09-17`  
**Parent decision reconciliation:** `architecture/csapi-gate-01-patient-flow-implementation-reconciliation-2026-09-17`  
**Canonical product term:** Patient Flow  
**Canonical user-facing clinical action:** **Finish**

> This packet converts the approved product architecture and the implementation-decision reconciliation into an executable engineering design. It defines implementation units, boundaries, migration order, code ownership, compatibility strategy, tests, acceptance gates and documentation requirements. It does **not** execute code, SQL, permission changes, data mutation or deployment.

## 1. Implementation objective

The implementation must evolve the existing Patient Flow without rebuilding sound domains and without allowing two competing lifecycle authorities.

The implementation target is:

```text
Visit
  ↓ stable parent context
Clinical Work Sessions
  ↓ discrete clinical/procedural intervals
Queue Entries
  ↓ operational waiting intervals/order
Patient Flow Commands
  ↓ single lifecycle authority
Business Lifecycle Events
  ↓ auditable history
Operational Work
  ↓ reusable assignment/handoff mechanics
Administrative Control
  ↓ correction / carry-forward / final closure
```

The existing `clinic_visit_sessions` record remains the migration anchor for Visit identity. The current six-value `session_status` must be treated as a compatibility representation during the migration, not as the final architecture.

## 2. Implementation principles

1. **Additive first.** Preserve existing columns/relationships until replacement behavior has been verified.
2. **One authority.** No new command may introduce a parallel lifecycle engine.
3. **No speculative cleanup.** Retire legacy fields only after evidence proves they are no longer required.
4. **Tenant-safe by construction.** Every new table/relation uses tenant-scoped foreign-key integrity where the repository pattern supports it.
5. **Atomic sensitive operations.** Finish, Hold, Transfer, closure and other lifecycle commands must have one transaction boundary.
6. **Business events are history, not a second state machine.**
7. **Workspace is presentation/context, never lifecycle authority.**
8. **Existing domain ownership remains intact.** Procedure, Inventory, Billing, Treatment Plan, Medical Files, Communications and Follow-up remain their own authorities.
9. **User-facing terminology stays simple.** The clinical primary action is exactly **Finish**.
10. **Production is out of scope for this stage.** No Vercel inspection/build/deploy is part of implementation design.

## 3. Execution unit map

| Unit | Scope | Main artifacts | Depends on | Output gate |
|---|---|---|---|---|
| D1 | Canonical domain contracts | Patient Flow types, command/result contracts, compatibility mapping | This packet | Type/design review |
| D2 | Database foundations | Work Session, Queue Entry, business event, safe Visit extensions | D1 | isolated DB verification |
| D3 | Lifecycle authority | DB transaction/RPC/guard + RLS restrictions | D2 + auth capability contract | direct-mutation resistance |
| D4 | Clinical execution | Start / Finish / Hold / Transfer commands | D3 | authenticated scenario tests |
| D5 | Queue execution | Queue create/reorder/return/carry-forward queries | D3 | order/continuation tests |
| D6 | Operational handoff | Visit-originated Work Item integration | D3 + D5 | A→B handoff tests |
| D7 | Timing policy | tenant policy + due-time evaluation + worker/command adapter | D3 + existing scheduler decision | timing tests |
| D8 | Closure/admin | Operational close, carry-forward, Admin close/reopen | D3 + D6 + D7 | closure gate |
| D9 | Cross-domain reconciliation | Procedures, Inventory, Billing, Follow-up | D4/D6/D8 as relevant | source-of-truth regression |
| D10 | UI migration | Clinical / Operation / Admin / Patient Flow surfaces | D4-D8 | UX + E2E gate |
| D11 | Historical compatibility retirement | legacy state/trigger cleanup only after proof | all prior units | cleanup gate |
| D12 | Full verification | CI, DB, authenticated E2E, audit reconstruction | all required units | Gate 01 closure candidate |

## 4. D1 — Canonical contracts

### Required types

The domain layer should introduce explicit concepts equivalent to:

```ts
type VisitFinality = "open" | "completed" | "cancelled" | "no_show";

type WorkSessionStatus =
  | "active"
  | "finished"
  | "held"
  | "transferred"
  | "cancelled";

// Queue presence and operational disposition should remain separate
// from lifecycle state.
```

The exact enum names may differ if the repository's canonical naming requires it.

### Required command families

```text
arriveVisit
enterWaiting
reorderQueue
startClinicalWork
finishClinicalWork
holdVisit
resumeHeldVisit
transferVisit
handoffOperationalWork
reassignOperationalWork
carryForwardVisit
closeOperationalWork
closeVisitAdministratively
reopenVisitAdministratively
cancelVisit
markNoShow
```

The implementation must prefer adapters over the existing actions rather than creating duplicate action engines.

## 5. D2 — Database foundations

### 5.1 Clinical Work Session

Expected child table, subject to migration implementation review:

```text
clinical_work_sessions
```

Minimum conceptual contract:

- `id`
- `tenant_id`
- `visit_id`
- `sequence_no`
- `status`
- `performed_by_clinic_user_id`
- optional `clinical_provider_id`
- optional `room_id`
- `started_at`
- `ended_at`
- `outcome`
- optional hold/transfer reason fields
- `created_at`
- `updated_at`
- `version`

Required constraints:

- tenant matches Visit;
- sequence is unique per Visit;
- only one active Work Session per Visit unless the final policy explicitly permits concurrency;
- actor/room references remain same-tenant.

### 5.2 Queue Entry

Expected additive queue representation, conceptually:

```text
patient_flow_queue_entries
```

It must support multiple waiting intervals per Visit.

Minimum contract:

- `id`
- `tenant_id`
- `visit_id`
- `operating_date`
- `lane_key`
- `priority_class`
- `position`
- `entered_at`
- `exited_at`
- `entry_reason`
- `exit_reason`
- optional routing target
- `created_by`

Required invariant:

> One active queue entry per Visit at a time.

### 5.3 Business lifecycle events

Expected event ledger, conceptually:

```text
patient_flow_events
```

Minimum contract:

- `id`
- `tenant_id`
- `visit_id`
- optional `work_session_id`
- optional `queue_entry_id`
- `event_type`
- `actor_clinic_user_id`
- `actor_role/context`
- `occurred_at`
- source context
- destination context
- reason
- metadata
- `correlation_id`

Events are append-only.

### 5.4 Visit compatibility extensions

Possible additive fields on `clinic_visit_sessions` should be limited to values that are genuinely aggregate-level, for example:

- current finality/compatibility state;
- current operational responsibility only if not better represented by Work Item;
- `version` / concurrency value;
- continuation context only if required by the finalized schema.

Do not copy Work Session history into Visit columns.

## 6. D3 — Lifecycle authority and RLS

### Target authority

All lifecycle operations must converge on a controlled DB transaction boundary.

Preferred shape:

```text
Server action / API adapter
        ↓
authoritative database command
        ↓
BEGIN
  resolve authenticated actor
  resolve tenant
  validate capability
  lock aggregate / required child records
  validate preconditions
  mutate records
  append business event
  create/update downstream work when required
COMMIT
```

### Direct mutation restriction

The final design must prevent a normal `UPDATE clinic_visit_sessions` from changing lifecycle-controlled fields outside the authority.

This may require:

- column-level restriction strategy;
- RLS redesign;
- trigger guard;
- controlled RPC;
- or a combination.

Do not grant broad database bypass merely to make the server action work.

### Security requirements

- actor identity comes from authenticated context;
- tenant comes from authoritative tenant resolution;
- no lifecycle command trusts client-supplied tenant/user identity;
- sensitive commands fail rather than recording an anonymous business actor;
- any security-definer function, if ultimately unavoidable, must be minimal, tightly scoped and not exposed as an unrestricted public API.

Supabase's current security guidance confirms that exposed tables require RLS and that authentication alone is not authorization; policies must enforce actual row access. cite-note

## 7. D4 — Clinical execution

### Start

```text
Waiting queue entry
  ↓ authorize actor
  ↓ validate Visit OPEN
  ↓ validate no active Work Session
  ↓ validate clinical eligibility
  ↓ create Work Session
  ↓ acquire active-work ownership
  ↓ event: clinical_work_started
```

### Finish

Finish is atomic and must do all required writes in one transaction:

```text
lock Visit + active Work Session
validate actor ownership/capability
save documentation
end Work Session
emit Finish event
create/update operational consequence
commit
```

It must return a structured next disposition rather than pretending that clinical Finish equals final Visit completion.

### Hold

```text
ACTIVE Work Session
  ↓ Hold
end/suspend Work Session according to finalized model
emit hold event
release clinical ownership
Visit remains OPEN
```

If continuation requires waiting:

```text
Hold
 ↓
return-to-waiting command
 ↓
new Queue Entry
 ↓
Waiting
 ↓
new Work Session later
```

### Transfer

Transfer must preserve Visit identity and create historical source/destination context. The receiving clinical work should normally use a new Work Session.

## 8. D5 — Queue execution

### Arrival

New arrival creates a Visit and a Queue Entry unless an existing unresolved Visit has an explicit continuation reason.

### Reorder

Reorder must be an atomic queue-scope operation. Positions must not rely on `created_at`.

### Return to Waiting

Every return creates a new queue interval and leaves the previous interval in history.

### Carry-forward

Carry-forward changes the operating-date workload context, not Visit identity.

### Query rules

Operational queue queries must search unresolved Visits by active/eligible workload state rather than only Visit creation date.

Administrative queries must find unresolved Visits across operating dates.

## 9. D6 — Operational Work integration

Reuse `operational_work_items` and `operational_work_history`.

Before adding any explicit Visit FK, inspect whether `source_type='visit'` + `source_id=visit_id` can be made canonical and integrity-safe. If not, add an explicit same-tenant Visit relation.

Required invariant:

> Every Visit-originated operational Work Item resolves exactly to one Visit.

Do not use operational Work status as a substitute for Visit finality.

Reassignment remains:

```text
A → handoff/reassign command → B
```

and not:

```text
A account → B logs into A
```

## 10. D7 — Timing policy

The current five-minute and sixty-minute values must be migrated from hidden trigger constants into explicit tenant policy.

Policy selection must first reuse an existing canonical tenant-settings/configuration structure. `clinic_user_settings` is explicitly user-scoped and is therefore not sufficient for tenant-wide Patient Flow policy.

Potential policy values:

```text
reassignment_after_minutes
escalation_after_minutes
operational_close_after_minutes
hold_review_after_minutes
```

The scheduler/worker must call an authoritative command rather than directly editing lifecycle rows.

A timestamp without a reliable evaluator is not a complete timing feature.

## 11. D8 — Closure and Administration

### Operational Closure

Removes the Visit from the active daily workload while preserving:

- Visit identity;
- unresolved/open finality;
- history;
- downstream links;
- Admin visibility.

### Administrative Closure

Final authority evaluates policy readiness and explicitly closes the Visit.

Possible blockers are configured, not universally hard-coded:

- active Work Session;
- unresolved required Work Item;
- required documentation;
- required procedure/service reconciliation;
- financial prerequisites;
- inventory prerequisites;
- unresolved investigation/Hold conditions.

### Reopen

Reopen is admin-only and explicit. It must never be an ordinary lifecycle UPDATE.

## 12. D9 — Cross-domain integration

### Procedures

Keep `clinic_visit_procedures.visit_id` authoritative. Add Work Session provenance only where required.

### Inventory

Preserve Visit linkage. If Work Session provenance is needed, make it additive.

### Billing

Reconcile billable source data around authoritative Visit procedure/service records. Do not silently use Agenda as the complete billing source.

### Follow-up

Only authoritative completion may emit the normal Follow-up trigger.

Hold, Transfer, Carry-forward and Operational Closure must not emit Follow-up as a side effect merely because time passed.

## 13. D10 — UI migration contract

UI migration begins only after backend command contracts exist.

### Clinical Workspace

Must expose:

- Waiting eligible patients;
- active Work Session for current actor;
- **Finish** as the primary end-of-work action;
- Hold;
- Transfer where authorized;
- correct continuation feedback.

Do not expose internal enum names merely because they exist in the backend.

### Operation Workspace

Must expose operational responsibility/work, not a misleading clinical-active lane.

### Administration

Must expose explicit commands for:

- correction;
- reassignment;
- carry-forward;
- exception handling;
- administrative closure;
- permitted reopening.

### Patient Flow board

Must become a visualization/command surface over the authoritative lifecycle, not a separate transition engine.

## 14. D11 — Legacy compatibility and retirement

The following must remain until replacement is verified:

- current `session_status` column;
- legacy transition adapters;
- existing Agenda compatibility mapping;
- existing invoice/inventory Visit links;
- existing technical audit.

Potentially retire only after full verification:

- direct lifecycle UPDATE paths;
- hard-coded five-minute/sixty-minute triggers;
- obsolete pending-close assumptions;
- duplicated queue ordering logic;
- misleading UI vocabulary;
- legacy functions that become unused.

Historical rows must not be fabricated into detailed Work Session history unless the evidence genuinely supports the reconstruction.

## 15. Migration strategy

The migration must be backward-compatible in ordered phases.

### M1 — Introduce additive structures

Create and protect new tables/columns without changing current production semantics.

### M2 — Dual-write from authoritative commands

For newly executed flows, write both compatibility fields and new first-class records inside the same transaction where required.

### M3 — Read migration

Move queues/workspaces/queries to read the new authoritative representations while keeping legacy values populated for compatibility.

### M4 — Enforcement

Block unauthorized lifecycle mutations and make the new command boundary authoritative.

### M5 — Historical/fixture handling

Classify existing rows as reconstructable vs non-reconstructable. Do not invent Work Session chronology.

### M6 — Legacy retirement

Only after all verification and documented dependency checks, remove dead paths/fields/triggers.

## 16. Test architecture

Every implementation unit requires three verification layers.

### Layer A — Static/code

- TypeScript
- ESLint
- repository-specific audits
- i18n parity
- import/reference checks

### Layer B — Database

- constraints
- RLS
- direct lifecycle mutation resistance
- tenant isolation
- transaction atomicity
- concurrency/locking
- trigger/event behavior

### Layer C — Authenticated E2E

Minimum scenarios:

1. scheduled appointment → arrival → Waiting;
2. walk-in → Waiting;
3. receptionist reorder → clinical user sees same order;
4. Waiting → Start Work;
5. Work → Finish → operational handoff;
6. Work → Hold → return → Waiting → new Work Session;
7. Work → Transfer → same Visit → receiving Work Session;
8. multiple procedures → same Visit;
9. inventory/billing continuity across transfer;
10. A→B operational reassignment without impersonation;
11. short timing policy → reassignment eligibility;
12. longer timing policy → operational/admin escalation/closure behavior;
13. cross-day unresolved Visit → same Visit carry-forward;
14. unresolved Visit does not generate Follow-up;
15. completed Visit → normal Follow-up pathway where configured;
16. direct lifecycle UPDATE attempt → rejected;
17. completed Visit → ordinary reopen attempt rejected;
18. admin reopen → explicit audited success where policy allows;
19. tenant A cannot see/modify tenant B Visit/work/event;
20. business audit reconstructs who/what/from/to/why.

## 17. Acceptance gates

### Gate A — Schema readiness

New structures exist, tenant integrity holds, RLS exists, and no legacy behavior is broken.

### Gate B — Lifecycle authority

All sensitive lifecycle operations use the controlled command boundary and direct mutation bypass tests fail.

### Gate C — Clinical behavior

Finish/Hold/Transfer scenarios pass with multiple Work Sessions under one Visit.

### Gate D — Operational behavior

Queue ordering, handoff, reassignment, timing and carry-forward pass.

### Gate E — Closure

Operational and administrative closure are demonstrably separate.

### Gate F — Cross-domain

Procedure, Inventory, Billing, Follow-up and Agenda regression passes.

### Gate G — Runtime

Authenticated E2E and tenant isolation pass.

### Gate H — Cleanup

Only proven obsolete paths are removed.

### Gate I — Documentation

Every completed implementation stage has its own repository record linked to commit/PR/test evidence.

## 18. Documentation contract for every implementation stage

Every stage must update the repository with:

1. stage purpose and scope;
2. source branch and exact SHA;
3. files/migrations changed;
4. database objects changed;
5. tests executed and exact results;
6. known non-findings;
7. unresolved issues;
8. rollback/compatibility notes;
9. next-stage entry criteria;
10. close status.

Recommended records:

```text
docs/CSAPI/GATES/GATE-01-<STAGE>-IMPLEMENTATION-RECORD-2026-09-17.md
docs/CSAPI/GATES/GATE-01-<STAGE>-VERIFICATION-2026-09-17.md
```

Do not mark a stage `CLOSED` until its verification record exists.

## 19. Implementation order

```text
D1 Canonical contracts
   ↓
D2 DB foundations
   ↓
D3 Lifecycle authority / RLS
   ↓
D4 Clinical execution
   ↓
D5 Queue execution
   ↓
D6 Operational handoff
   ↓
D7 Timing policy
   ↓
D8 Closure / Administration
   ↓
D9 Cross-domain reconciliation
   ↓
D10 UI migration
   ↓
D11 Legacy retirement
   ↓
D12 Full verification
```

No later unit should silently bypass an earlier authority gate.

## 20. Explicit non-goals

This packet does not authorize:

- changing the production database;
- changing permissions in production;
- deploying to Vercel;
- deleting existing data;
- renaming `clinic_visit_sessions` blindly;
- replacing Patient Flow with Journey Coordination;
- turning every clinical action into a new Visit;
- creating a new Follow-up for every unresolved Visit;
- using workspace visibility as authorization;
- retaining direct lifecycle UPDATE as an intentional parallel authority.

## 21. Stage status

**Implementation design:** complete.  
**Code execution:** not started.  
**Migration execution:** not started.  
**Production mutation:** not started.  
**Vercel activity:** out of scope for this stage.  
**Gate 01 closure:** not authorized.

**End of Implementation Design Packet.**