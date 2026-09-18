# CSAPI Gate 01 — Patient Flow Implementation Decision Reconciliation

**Date:** 2026-09-17  
**Status:** IMPLEMENTATION DECISION RECONCILIATION / PROPOSED — EXPLICIT APPROVAL STILL REQUIRED  
**Branch:** `architecture/csapi-gate-01-patient-flow-implementation-reconciliation-2026-09-17`  
**Parent target architecture:** `architecture/csapi-gate-01-patient-flow-target-architecture-2026-09-17`  
**Parent target architecture commit:** `97ff436e32339ab52d3b3b1de968134eb1e7d8e7`  
**Canonical product term:** Patient Flow  
**Canonical user-facing clinical action:** **Finish**

> This document records the implementation-stage reconciliation performed against the current repository and live Supabase evidence. It converts target-architecture proposals into explicit implementation decisions, rejected approaches, unresolved approval points, and an implementation sequencing contract. It does **not** authorize code, SQL, permission changes, data mutation, deployment or production verification.

---

## 1. Purpose

The previous Gate 01 stages established:

```text
Historical documentation
        ↓
Approved product architecture clarification
        ↓
Repository + live Supabase evidence
        ↓
90-row Architecture Gap Matrix
        ↓
Target Architecture Specification
        ↓
THIS DOCUMENT
```

This stage answers a narrower question:

> Given the current implementation and live database, which target-architecture structures should be **reused**, which should be **extended**, and which should be **created**, and what must remain a proposal until explicit Product Owner approval?

The objective is to avoid two opposite failures:

1. rebuilding working CORE SYSTEM structures unnecessarily;
2. preserving an existing structure when it cannot safely represent the approved Patient Flow semantics.

---

## 2. Evidence snapshot for this stage

### 2.1 Live `clinic_visit_sessions` structure

The inspected live table contains one row with the current Visit/session identity and also carries:

- `patient_id`
- `doctor_id`
- `room_id`
- `agenda_event_id`
- `arrived_at`
- `session_started_at`
- `session_ended_at`
- `visit_closed_at`
- `lock_holder_id`
- `lock_timestamp`
- `initialized_by_receptionist`
- clinical documentation fields
- `session_status`
- `buffer_window_expires_at`
- `auto_close_at`
- operational timestamps

The table's current `session_status` constraint remains the six-value historical model:

```text
waiting
in_consultation
pending_close
completed
cancelled
no_show
```

This confirms that the table is a viable **parent Visit starting point**, but also confirms the existing row currently conflates parent Visit and a single work interval.

### 2.2 Live Visit/procedure relationship

`clinic_visit_procedures` remains Visit-linked through `visit_id` and has:

- `quantity`
- `notes`
- `performed_at`
- `created_by`
- unique `(visit_id, procedure_id)`

The current representation therefore supports Visit-level procedure ownership but does not provide first-class work-session provenance.

### 2.3 Live operational work structure

`operational_work_items` already contains:

- `kind`
- `status`
- `priority`
- requester
- assignee
- patient
- `source_type`
- `source_id`
- due time
- completion/outcome
- parent work item

`operational_work_history` records work-item history with actor, from/to status and note.

The repository implementation already uses the source fields as a generic domain-origin mechanism and has explicit assign/handoff operations. Therefore this is reusable infrastructure, but it is currently not a Visit lifecycle ledger and has no foreign-key guarantee that `source_id` really resolves to a Visit when `source_type = Visit`.

### 2.4 Live timing/configuration structure

The inspected public schema did not expose a tenant-level Patient Flow policy table/configuration structure. The only settings-like application table found was `clinic_user_settings`, which is user-scoped and therefore is not an appropriate home for tenant-wide Patient Flow policy.

Current database timing functions still contain hard-coded values:

- five minutes for `buffer_window_expires_at`;
- sixty minutes for `auto_close_at` under its current trigger condition.

Therefore a tenant-level policy/configuration representation is justified unless a later repository inspection identifies a canonical tenant settings structure not visible in the inspected live public schema.

### 2.5 Live authorization structure

Inspected current permission rows include:

```text
sessions:create
sessions:read
sessions:update
sessions:close
visits:read
visits:update
work:create
work:assign
work:manage
```

No live `patient_flow:*` permission keys were returned by the targeted query.

This is a direct repository/live authorization vocabulary mismatch because the application uses Patient Flow context/action concepts that are not represented as equivalent live permission keys.

### 2.6 Live RLS boundary

The live `clinic_visit_sessions` UPDATE policy allows an authenticated user to update a tenant row when the user has effective `sessions:update` or `visits:update`.

The policy does not itself validate whether the requested new lifecycle value is a valid transition from the old value.

This confirms that application transition helpers are not sufficient as the final lifecycle authority.

### 2.7 Live audit infrastructure

`audit_trail` contains actor, role, action, table, record, old/new values, reason and timestamp fields.

The live `fn_audit_changes()` implementation currently:

- handles UPDATE events only;
- resolves the actor from `auth.uid()` to `clinic_users.id`;
- allows unresolved actor identity to fall back to NULL;
- deliberately avoids blocking the underlying update when audit actor resolution fails.

This infrastructure is useful as technical row audit, but it is not a sufficient business lifecycle event ledger for Patient Flow.

---

## 3. Implementation decisions

The following decisions are **PROPOSED** implementation decisions. They are intentionally not marked `APPROVED` because the CSAPI ledger requires explicit Product Owner approval before implementation authorization.

### DEC-01 — Keep `clinic_visit_sessions` as the parent Visit record

**Decision:** REUSE + EXTEND.

Do not create a second top-level Visit table merely to correct terminology.

The existing table already provides the stable identity and Visit context used by procedures, inventory, invoices and other downstream relations.

The implementation should evolve the row so that:

- parent Visit identity remains stable;
- finality can be represented explicitly;
- current operational responsibility can be added without overwriting historical initializer semantics;
- compatibility fields can remain temporarily during migration;
- one row is no longer required to hold the entire chronology of every clinical work interval.

**Rejected approach:** create `visits` as a replacement top-level entity and migrate every downstream relation immediately.

**Reason rejected:** unnecessary duplication and excessive migration blast radius without evidence that the current parent row cannot remain the physical Visit record.

---

### DEC-02 — Create a first-class Clinical Work Session child representation

**Decision:** CREATE, subject to explicit approval.

A Visit needs a child representation capable of holding multiple distinct work intervals.

Minimum conceptual responsibility:

```text
Visit
  └── Clinical Work Sessions[]
```

The child must preserve tenant isolation and identify:

- Visit;
- sequence;
- status/outcome;
- actual actor;
- provider context where relevant;
- room/work context;
- start/end;
- hold/transfer reason where applicable;
- concurrency/version information.

**Migration rule:** do not fabricate historical Work Session chronology that does not exist in current data. Historical fields may be preserved as legacy Visit-level facts until new sessions are created prospectively.

**Rejected approach:** reuse `session_started_at` / `session_ended_at` repeatedly on the Visit row.

**Reason rejected:** overwriting destroys chronology and cannot reliably represent W1 → W2 → W3.

---

### DEC-03 — Do not create a single replacement Patient Flow state enum

**Decision:** REUSE current lifecycle concept, EXTEND through separate dimensions.

The implementation must not replace the six-value status with a giant enum containing Waiting, Active, Hold, Transfer, Operational Close, Admin Close, etc.

Separate questions require separate authorities:

```text
Visit finality
Clinical Work Session lifecycle
Queue/Waiting presence
Operational disposition
Administrative disposition
```

**Reason:** a single Visit can be open while its active Work Session is finished and its operational work is waiting for assignment. One enum cannot represent these independently without semantic overloading.

---

### DEC-04 — Introduce authoritative Queue Entry semantics

**Decision:** CREATE OR EXTEND after final schema inspection; preferred direction = CREATE additive Queue Entry representation.

The existing queue query has no persistent authoritative order and filters to today's `created_at`.

The target needs a persistent representation capable of storing multiple Waiting intervals for the same Visit.

Required capabilities:

- operating date;
- lane/routing context;
- priority;
- explicit position/order;
- entered/exited timestamps;
- entry/exit reason;
- tenant isolation;
- actor provenance.

**Rejected approach:** store queue position directly on the Visit as one mutable field without queue-entry history.

**Reason rejected:** one Visit may enter Waiting multiple times and cross operating dates.

---

### DEC-05 — Queue reorder must be a queue operation, not a lifecycle transition

**Decision:** EXTEND queue command boundary.

Reordering, changing priority, or moving to a waiting lane must never mean clinical start.

The authoritative queue command must update queue order while leaving Visit/Work Session lifecycle unchanged.

Emergency routing therefore remains:

```text
Waiting → different queue position/lane
```

not:

```text
Waiting → active clinical work
```

---

### DEC-06 — Clinical Start must create/activate a Work Session

**Decision:** EXTEND existing `callNextPatient` / clinical transition concept.

The current `waiting → in_consultation` behavior is conceptually reusable, but the implementation should move the source of truth from one Visit row state mutation toward:

```text
authorized Start command
   ↓
queue entry exits Waiting
   ↓
new/active Work Session created
   ↓
actor + room + concurrency recorded
```

The legacy Visit status may remain temporarily as a compatibility projection during controlled migration.

---

### DEC-07 — Finish is a single atomic clinical command

**Decision:** EXTEND + CENTRALIZE.

User-facing action:

> **Finish**

The implementation must preserve the current successful clinical documentation behavior while making the lifecycle consequence atomic.

Target transaction:

```text
lock Visit + active Work Session
        ↓
validate actor / capability / ownership
        ↓
persist clinical documentation
        ↓
finish Work Session
        ↓
record Finish business event
        ↓
create/update required operational work
        ↓
commit
```

Failure anywhere means rollback of the command as one unit.

**Rejected approach:** keep the current two-step `saveClinicalVisit()` then `transitionToPendingReception()` sequence as the authoritative implementation.

**Reason rejected:** it permits partial success.

---

### DEC-08 — Hold becomes first-class Work Session/Visit context

**Decision:** CREATE/EXTEND.

`holdVisit()` cannot remain a lock-clearing shortcut.

A Hold command must leave the Visit open and produce explicit history.

Preferred semantics:

```text
Active Work Session
    ↓ Hold
Work Session = held/ended with Hold outcome
    ↓
Visit remains OPEN
    ↓
clinical lock released
```

Return to work must not resurrect the same active interval.

---

### DEC-09 — Resume from Hold returns through Waiting when queue participation is required

**Decision:** CREATE command path.

Preferred sequence:

```text
Held Visit
   ↓ explicit Return/Resume command
Queue Entry
   ↓
Waiting
   ↓ Start
new Work Session
```

This ensures the patient can be reordered against current clinic conditions and prevents the previous work interval from becoming an artificially long active session.

---

### DEC-10 — Transfer is a business operation preserving Visit identity

**Decision:** CREATE/EXTEND.

A raw `doctor_id` or `room_id` update is not sufficient to represent Transfer.

Transfer must record:

- source context;
- destination context;
- actor authorizing the transfer;
- reason;
- Visit;
- current Work Session;
- resulting continuation mode.

The old Work Session becomes historical and the receiving context may create a new Work Session.

---

### DEC-11 — Reuse `operational_work_items` for operational handoff/reassignment

**Decision:** REUSE + BRIDGE.

The generic Work engine already supports assignment and handoff history and is therefore the correct reuse target.

The integration must establish one authoritative way to resolve:

```text
Visit → Visit-originated Work Item
```

Preferred order of investigation/implementation:

1. reuse `source_type/source_id` if the contract can be made explicit and query-safe;
2. add a governed Visit relation if generic source fields are insufficient;
3. optionally add Work Session provenance where reporting requires it.

Do not create a second operational assignment engine inside Patient Flow.

---

### DEC-12 — Receptionist initializer remains historical; current responsibility is separate

**Decision:** EXTEND.

`initialized_by_receptionist` remains historical.

Do not rewrite it when ownership changes.

Current operational responsibility belongs in a separate responsibility/handoff model, preferably the Visit-originated operational Work Item where the responsibility is operational work.

This preserves A's historical involvement while allowing B to continue without impersonation.

---

### DEC-13 — Tenant-level timing policy requires a new policy representation unless canonical structure is discovered

**Decision:** CREATE, subject to final settings inventory.

The inspected live schema exposes `clinic_user_settings`, which is user-scoped and therefore unsuitable as the authoritative tenant policy container.

The target policy must support values such as:

```text
reassignment_after_minutes
escalation_after_minutes
operational_close_after_minutes
hold_review_after_minutes (optional)
```

The exact storage shape should prefer an existing tenant settings architecture if one is found in the wider repository; otherwise create a dedicated tenant-level Patient Flow policy structure.

Hard-coded 5/60 minute literals must not remain product semantics.

---

### DEC-14 — Timing requires a worker/command, not timestamps alone

**Decision:** EXTEND existing trigger/timestamp concepts, CREATE the authoritative execution path.

`buffer_window_expires_at` and `auto_close_at` are deadlines, not actions.

The target sequence is:

```text
Policy
 ↓
Eligibility deadline
 ↓
Scheduled evaluation
 ↓
Authorized Patient Flow operation
 ↓
Business event
 ↓
Operational consequence
```

The exact scheduler mechanism remains an implementation concern. No new infrastructure should be introduced until existing project scheduling mechanisms are inventoried.

---

### DEC-15 — Operational Closure and Administrative Closure must be separate

**Decision:** CREATE/EXTEND.

Do not repurpose `completed` to mean both.

Operational Closure means removal from active daily workload while the Visit remains unresolved/open.

Administrative Closure means final clinic-authority disposition.

Only the final authoritative command may mark the Visit final.

---

### DEC-16 — Carry-forward is a first-class continuation operation

**Decision:** CREATE command + query semantics; storage may be represented through queue-entry operating date plus business event if that is sufficient.

The minimum invariant is:

```text
same Visit ID
new operating-date context
full audit history
```

A second Visit must not be created merely because the calendar date changed.

---

### DEC-17 — Follow-up remains downstream and must listen to authoritative completion

**Decision:** REUSE existing Follow-up domain + ADD lifecycle guard.

Follow-up creation must not depend on generic delays, operational queue removal, Hold, Transfer or carry-forward.

A completed Visit may produce Follow-up work according to the Follow-up domain.

---

### DEC-18 — Business lifecycle events are required in addition to technical row audit

**Decision:** CREATE append-only business event ledger.

Technical `audit_trail` remains useful for row-level forensics.

Patient Flow also requires business events such as:

```text
Arrival
Waiting entered
Start
Finish
Hold
Resume/Return
Transfer
Operational handoff
Reassignment
Carry-forward
Operational Closure
Administrative Closure
Reopen
Cancellation
No-show
```

Every sensitive event requires a resolvable actor.

---

### DEC-19 — Lifecycle authority must be database-enforceable

**Decision:** CREATE authoritative DB transaction/command boundary and restrict direct lifecycle mutation.

The current RLS model correctly contributes tenant/permission filtering but does not protect the state machine.

The final architecture must prevent generic UPDATE of lifecycle fields from bypassing:

- transition legality;
- actor capability;
- ownership/lock rules;
- tenant integrity;
- terminality;
- audit event creation.

The implementation must use the least-privilege Postgres function/security model consistent with the existing authorization architecture. Avoid introducing broad privileged access merely to simplify RLS.

---

### DEC-20 — Patient Flow permission vocabulary must be reconciled before implementation

**Decision:** EXTEND live authorization catalog.

The targeted live permission inventory contains sessions/visits/work permissions but no `patient_flow:*` permission keys.

The implementation decision is therefore:

- do not rely on workspace labels as authority;
- define explicit capability keys for Patient Flow commands where needed;
- map them to existing roles through the Team & Access model;
- keep read access and action authority distinct.

No permission should be added merely because a screen exists. Each capability must be tied to a concrete command and acceptance test.

---

### DEC-21 — Workspace remains presentation/context only

**Decision:** REUSE current workspace concept + REMOVE any authority coupling.

Clinical/Operational/Administration contexts may determine what is displayed and which command affordances are useful, but the backend must evaluate the actual capability and lifecycle preconditions independently.

---

### DEC-22 — Legacy compatibility fields are transitional, not canonical

**Decision:** EXTEND with explicit compatibility policy.

Existing fields such as:

- `session_status`
- `session_started_at`
- `session_ended_at`
- `lock_holder_id`
- `buffer_window_expires_at`
- `auto_close_at`

must not be deleted prematurely.

During migration they may serve as projections/adapters where needed.

The implementation must document which fields are authoritative, which are derived, and the planned retirement conditions for any legacy field.

---

## 4. Decisions explicitly rejected

The following approaches are rejected for this stage:

1. Create an entirely new Patient Flow system and abandon existing Queue/Visit/Work infrastructure.
2. Create a second top-level Visit entity merely to separate terminology.
3. Use `operational_work_items.status` as Patient Flow lifecycle state.
4. Make Agenda the Patient Flow state machine.
5. Treat every Work Session as a new Visit.
6. Treat Hold as Follow-up.
7. Treat Transfer as a new Visit.
8. Treat operational queue movement as clinical start.
9. Treat 5/60 minutes as immutable product constants.
10. Let generic `visits:update` remain an unrestricted lifecycle mutation path.
11. Make Administration a copy of the reception queue.
12. Use workspace membership/visibility as the security authority.
13. Fabricate historical Work Session records from incomplete legacy timestamps.
14. Use a single giant enum to represent every lifecycle/queue/administrative dimension.

---

## 5. Implementation sequencing contract

No implementation batch may skip this order without a recorded architectural reason.

### Phase I — Data/authority foundation

```text
1. Freeze legacy compatibility behavior
2. Create/extend authoritative Patient Flow command boundary
3. Establish business event ledger
4. Create Clinical Work Session representation
5. Establish tenant-safe RLS/transition protection
6. Reconcile permissions
```

### Phase II — Queue/continuation semantics

```text
7. Create/extend Queue Entry representation
8. Implement authoritative reorder
9. Separate Queue/Waiting from clinical start
10. Implement Hold
11. Implement Hold → Waiting continuation
12. Implement Transfer
13. Implement carry-forward
```

### Phase III — Operational control

```text
14. Bridge Visit-originated Work Items
15. Separate current responsibility from initializer
16. Introduce tenant timing policy
17. Implement scheduled timing consequences
18. Implement Operational Closure
19. Implement Administrative Closure readiness/finalization
```

### Phase IV — Domain integration

```text
20. Reconcile procedure provenance
21. Reconcile inventory provenance
22. Reconcile billing source-of-truth
23. Protect Follow-up downstream boundary
24. Reconcile notifications/realtime consumers
```

### Phase V — Surface migration

```text
25. Clinical Workspace
26. Operation Workspace
27. Administration control plane
28. Patient Flow shared surfaces
29. terminology/UI cleanup — primary clinical action = Finish
```

### Phase VI — Verification

```text
30. isolated DB tests
31. RLS/security tests
32. concurrency tests
33. authenticated scenario E2E
34. cross-domain continuity tests
35. carry-forward/cross-day tests
36. audit reconstruction tests
37. documentation reconciliation
38. Gate review / closure decision
```

---

## 6. Required implementation constraints

### Constraint C-01 — Additive migration bias

Prefer additive schema evolution. Preserve existing test data and relationships. Do not delete or rename production-facing fields until their replacement is verified and migration compatibility is proven.

### Constraint C-02 — Single lifecycle authority

There may be many server actions/adapters, but there must be one authoritative lifecycle mutation boundary.

### Constraint C-03 — No duplicate engines

Do not create a second queue engine, a second operational work engine, or a second Follow-up lifecycle engine when an existing structure can be safely extended.

### Constraint C-04 — Tenant integrity

Every new Patient Flow child structure must enforce tenant consistency with Visit and referenced actors/resources.

### Constraint C-05 — Audit non-nullability for sensitive business events

Business lifecycle operations must not silently create anonymous actor events.

### Constraint C-06 — No direct production mutation during design reconciliation

This phase remains documentation-only. No live schema/data modifications are part of this document.

### Constraint C-07 — No Vercel use in this phase

Repository and Supabase evidence only. Vercel is deferred until the final production stage after main promotion according to the established execution contract.

---

## 7. Decision dependencies that must be approved together

Some decisions cannot safely be approved independently:

### Dependency A — Work Session + Finish + Hold + Transfer

These four form one clinical work model. Approving one while rejecting the others would recreate the current ambiguity.

### Dependency B — Queue Entry + Start + Resume + Carry-forward

All four depend on the Queue/Waiting distinction and multi-interval waiting model.

### Dependency C — Operational Work + Timing + Operational Closure

Reassignment timing is meaningless without a Work Item responsibility target and an explicit operational disposition.

### Dependency D — Business Events + DB Authority + Permissions

A controlled command without audit is incomplete; audit without authorization is not sufficient; permissions without an authoritative command remain bypassable.

---

## 8. Final reconciliation outcome

The current repository/live database evidence supports the following implementation posture:

| Area | Reconciliation outcome |
|---|---|
| Visit parent | **REUSE + EXTEND** |
| Clinical Work Session | **CREATE** |
| Single giant lifecycle enum | **REJECT** |
| Queue entry history/order | **CREATE/EXTEND** |
| Waiting semantics | **EXTEND** |
| Clinical start | **EXTEND** |
| Finish | **CENTRALIZE + ATOMIC** |
| Hold | **CREATE/EXTEND** |
| Transfer | **CREATE/EXTEND** |
| Operational Work | **REUSE + BRIDGE** |
| Current operational responsibility | **EXTEND** |
| Timing policy | **CREATE unless existing tenant policy is found** |
| Operational Closure | **CREATE/EXTEND** |
| Administrative Closure | **CREATE/EXTEND** |
| Carry-forward | **CREATE command + query semantics** |
| Follow-up | **REUSE + GUARD** |
| Business lifecycle audit | **CREATE** |
| DB lifecycle authority | **CREATE/EXTEND** |
| Patient Flow permissions | **RECONCILE/EXTEND** |
| Workspace authority | **PRESENTATION ONLY** |
| Legacy compatibility fields | **PRESERVE TEMPORARILY** |

### Overall status

**Architecture:** sufficiently specified for implementation planning.  
**Implementation decisions:** substantially reconciled but still `PROPOSED` until explicit Product Owner approval.  
**Code authorization:** NOT GRANTED.  
**DB migration authorization:** NOT GRANTED.  
**Permission change authorization:** NOT GRANTED.  
**Production verification:** NOT IN THIS PHASE.

---

## 9. Required next stage

After explicit approval of the proposed implementation decisions, the next stage should be:

> **Implementation Design Packet**

That packet should contain the exact migration plan, authoritative RPC/command contracts, schema diff plan, permission matrix, compatibility projection rules, test fixtures/scenarios, rollback boundaries, and file-by-file code impact map.

It must still be produced before implementation begins.

**End of Implementation Decision Reconciliation.**