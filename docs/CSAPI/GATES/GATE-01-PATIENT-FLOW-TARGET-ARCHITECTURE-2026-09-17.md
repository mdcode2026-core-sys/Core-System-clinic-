# CSAPI Gate 01 — Patient Flow Target Architecture

**Date:** 2026-09-17  
**Status:** TARGET ARCHITECTURE SPECIFICATION / NO IMPLEMENTATION AUTHORIZED BY THIS DOCUMENT  
**Branch:** `architecture/csapi-gate-01-patient-flow-target-architecture-2026-09-17`  
**Parent evidence branch:** `architecture/csapi-gate-01-patient-flow-gap-matrix-2026-09-17`  
**Parent evidence commit:** `984a35e3c6c1055583f77f0199a0181120578254`  
**Canonical product term:** Patient Flow  
**Canonical user-facing clinical action:** **Finish**

> This document converts the Gate 01 Gap Matrix into a concrete target architecture. It defines ownership, data responsibilities, commands, state dimensions, security boundaries, audit behavior, queue semantics, timing policy and acceptance criteria. It is an architecture contract, not an implementation ticket and does not authorize code, SQL migration, permission changes, production deployment or cleanup.

---

## 1. Source of truth and design objective

The immediate source of truth for this specification is the 2026-09-17 Gate 01 evidence reconciliation and its 90-row Architecture Gap Matrix.

Primary inputs:

- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-HISTORICAL-DOCUMENTATION-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-GAP-MATRIX-2026-09-17.md`
- `docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md`
- inspected repository Patient Flow / Queue / Visit / Journey Coordination code
- inspected live Supabase schema, constraints, RLS, triggers/functions, permissions and current data snapshot

The target architecture must achieve five things simultaneously:

1. Keep **Visit** as the stable parent context for one unresolved clinic work episode.
2. Represent each discrete clinical/procedural work interval without creating a new Visit.
3. Make one authoritative Patient Flow command boundary enforceable at the database boundary, not only in TypeScript helpers.
4. Keep queue movement, clinical work, operational responsibility and administrative finality as distinct concepts.
5. Preserve existing domain ownership and existing useful structures wherever they are sound.

---

## 2. Non-negotiable architectural invariants

The following invariants are mandatory for implementation and verification.

### PF-ARCH-INV-01 — Visit identity

One Visit remains the same Visit while the unresolved episode continues, even when:

- the actor changes;
- the room changes;
- the procedure changes;
- several procedures are performed;
- the patient is placed on Hold;
- the patient returns to Waiting;
- operational responsibility changes;
- the clinic day ends;
- the patient returns on a later operating date.

A new Visit is not created merely because a Work Session, actor, room, queue position or operating date changes.

### PF-ARCH-INV-02 — Clinical Work Session is a child concept

A **Clinical Work Session** is one discrete unit of clinical/procedural work inside a Visit.

Examples:

```text
Visit V100
  Work Session W1 — Doctor consultation
  Hold — waiting for external imaging
  Waiting
  Work Session W2 — Laser room procedure
  Work Session W3 — Doctor review
```

A Visit may contain zero, one or many Work Sessions. The child does not become a replacement Visit.

### PF-ARCH-INV-03 — Waiting is operational

Waiting means the patient is present/available for the next authorized step. Waiting does not mean clinical work has started.

### PF-ARCH-INV-04 — Queue movement is not clinical initiation

Changing queue position, priority, routing lane or waiting room does not create a clinical start event and must not acquire a clinical lock.

### PF-ARCH-INV-05 — Finish is not Visit completion

The user-facing clinical action is **Finish**.

Finish ends the current Clinical Work Session. It does not automatically:

- complete the Visit;
- administratively close the Visit;
- create a Follow-up;
- create a new Appointment;
- create a new Visit.

The authoritative Patient Flow operation decides the next operational state.

### PF-ARCH-INV-06 — Hold is unresolved

Hold temporarily suspends the current clinical work. It does not complete, cancel or no-show the Visit.

When continuation requires the patient to wait, the Visit returns to Waiting through an explicit authorized path.

### PF-ARCH-INV-07 — Transfer preserves identity

Transfer is continuation of the same Visit through another actor, room, service context or clinical/procedural responsibility.

### PF-ARCH-INV-08 — Operational ownership is mutable; initializer is historical

The receptionist who initially opened the Visit is historical context only. The current operational responsibility may move to another authorized user or work target without impersonation.

### PF-ARCH-INV-09 — Operational and administrative closure are different

Operational closure removes unresolved work from active daily operational workload according to configured policy. Administrative closure is final clinic-authority disposition.

Automatic operational closure must never silently mean final Visit completion.

### PF-ARCH-INV-10 — Carry-forward preserves Visit identity

Cross-day unresolved continuation is a continuation of the same Visit. It is not automatically a Follow-up and not automatically a new Appointment.

### PF-ARCH-INV-11 — Follow-up is downstream

Follow-up remains its own domain. A normal automated Follow-up trigger is downstream of authoritative Visit completion. Hold, Transfer and Carry-forward do not themselves create Follow-up.

### PF-ARCH-INV-12 — Domain ownership remains separated

Procedures, services, inventory, billing, payments, treatment plans, medical files, communications and follow-up retain their own domain authority. Patient Flow supplies the Visit context and lifecycle events; it does not become their internal state machine.

### PF-ARCH-INV-13 — Workspace is not authorization

Clinical, Operational and Administration are work contexts/classifications. Authorization comes from Team & Access capabilities and the Patient Flow command policy. A page being visible must never itself grant an action.

### PF-ARCH-INV-14 — One enforceable lifecycle authority

Application helpers may remain as orchestration adapters, but all authoritative Visit lifecycle changes must pass through one controlled Patient Flow command path with database enforcement and audit.

---

## 3. Critical design decision: Patient Flow is not one state enum

The current implementation compresses multiple dimensions into `session_status`. The target architecture explicitly rejects replacing that with another single giant enum.

The following dimensions are separate:

```text
VISIT FINALITY
    open | completed | cancelled | no_show

CLINICAL WORK SESSION
    active | finished | held | transferred | cancelled

QUEUE / WAITING PRESENCE
    no_active_entry | waiting

OPERATIONAL DISPOSITION
    active | reassignment_eligible | escalated | closed_for_operation

ADMINISTRATIVE DISPOSITION
    open | closed
```

These are conceptual dimensions. Exact physical columns/enums must be reconciled with the final migration design.

### Why the dimensions are separated

One unresolved Visit can simultaneously be:

```text
Visit finality          = open
Work Session            = finished
Queue presence          = no_active_entry
Operational disposition = reassignment_eligible
Administrative          = open
```

Another can be:

```text
Visit finality          = open
Work Session            = held
Queue presence          = no_active_entry
Operational disposition = active
Administrative          = open
```

Another can be:

```text
Visit finality          = open
Work Session            = none active
Queue presence          = waiting
Operational disposition = active
Administrative          = open
```

A completed Visit is fundamentally different:

```text
Visit finality          = completed
Administrative          = closed
```

No single status field should be required to answer every one of these questions.

---

## 4. Target aggregate model

### 4.1 Visit aggregate

The current `public.clinic_visit_sessions` row remains the **physical starting point / parent Visit record**, subject to additive evolution and terminology correction.

Target responsibility of the Visit aggregate:

- stable Visit ID;
- tenant ID;
- patient ID;
- clinical provider context where already meaningful;
- appointment/Agenda reference when applicable;
- current high-level Visit finality;
- final closure timestamps;
- historical initializer reference;
- current operational responsibility reference, if held directly by Visit;
- current operating-date/continuation context only if required by the finalized storage design;
- optimistic concurrency/version information;
- timestamps required for audit and synchronization.

The Visit aggregate does **not** become the place to store every Work Session's start/end/lock/room history.

### 4.2 Clinical Work Session child

A new first-class child representation is expected to be the smallest safe extension unless an additional repository/database inspection proves an existing structure already provides the required semantics.

Conceptual minimum fields:

| Field | Meaning |
|---|---|
| `id` | Work Session identity |
| `tenant_id` | Tenant isolation |
| `visit_id` | Parent Visit FK |
| `sequence_no` | Chronological order within Visit |
| `status` | Active / Finished / Held / Transferred / Cancelled |
| `performed_by_clinic_user_id` | Actual authenticated clinical actor when applicable |
| `clinical_provider_id` | Medical provider identity when clinically relevant; not used to fake every actor as a Doctor |
| `room_id` | Physical room/work context |
| `started_at` | Work start timestamp |
| `ended_at` | Work end timestamp |
| `outcome` | Finish / Hold / Transfer / Cancelled etc. |
| `hold_reason` | Required when outcome is Hold |
| `transfer_reason` | Required when outcome is Transfer |
| `created_at` / `updated_at` | Standard record timing |
| `version` | Concurrency control |

The exact final field names are an implementation decision after schema reconciliation.

### 4.3 Why Work Session needs a child identity

The existing `session_started_at` / `session_ended_at` pair can describe at most one interval per Visit row. It cannot safely represent:

```text
W1 Doctor
  ↓ Finish
W2 Laser Room
  ↓ Finish
W3 Doctor Review
```

A child record makes the chronology explicit and removes pressure to overwrite the Visit-level timestamps.

### 4.4 Actor model

The target model must distinguish:

- **medical provider context** (`doctor_id` may remain where already authoritative);
- **authenticated worker** (`clinic_user_id`);
- **room/work context** (`room_id`);
- **current operational responsible party**;
- **historical initializer**.

A clinical Work Session must not require an artificial Doctor identity for every authorized actor.

A room may be the operational target, while the actual actor remains the authenticated clinic user who performed the work.

---

## 5. Target lifecycle model

### 5.1 Visit finality

The Visit has one authoritative finality dimension:

```text
OPEN
  ├── COMPLETED
  ├── CANCELLED
  └── NO_SHOW
```

`COMPLETED` is terminal under normal operations.

`CANCELLED` and `NO_SHOW` remain distinct from Hold and Transfer.

### 5.2 Administrative reopening

A completed/cancelled terminal Visit must not return through ordinary clinical/operational actions.

If a clinic policy permits reopening/correction, it must be a distinct administrative command:

```text
Administratively authorized Reopen
        ↓
explicit audit event
        ↓
controlled return to OPEN
```

This is not an ordinary transition and must never be granted merely because a user has generic `visits:update`.

---

## 6. Target clinical Work Session lifecycle

Conceptually:

```text
WAITING
   │
   └── Start Work ──→ ACTIVE
                       │
             ┌─────────┼──────────┐
             │         │          │
           Finish     Hold     Transfer
             │         │          │
             ▼         ▼          ▼
          FINISHED    HELD    TRANSFERRED
                       │          │
                       └──────┬───┘
                              ▼
                         continuation
```

The diagram is conceptual, not a literal enum requirement.

### Finish

`Finish` closes the current Work Session and produces the next Patient Flow consequence required by the Visit.

Default path when no other explicit clinical continuation is selected:

```text
ACTIVE Work Session
        ↓ Finish
Work Session = FINISHED
        ↓
Patient Flow determines operational handoff
        ↓
Operational Work / Reception queue
```

### Hold

```text
ACTIVE Work Session
        ↓ Hold
Work Session = HELD
        ↓
release active clinical responsibility
        ↓
Visit remains OPEN
        ↓
optional Hold context / waiting-for-result policy
```

If the patient returns and requires queue-based continuation:

```text
HELD Visit
   ↓ Resume/Return
WAITING
   ↓
new Clinical Work Session
```

Resuming a held Visit is not equivalent to re-locking the old Work Session.

### Transfer

```text
ACTIVE Work Session
        ↓ Transfer
current Work Session = TRANSFERRED
        ↓
new/continued target context
        ↓
new Clinical Work Session OR controlled external-work continuation
        ↓
same Visit ID
```

The source and destination are recorded in the business event ledger.

---

## 7. Target Queue architecture

### 7.1 Queue is an operational mechanism

The queue answers:

> Who is waiting, where, in what order, with what priority/routing context, for which next authorized step?

It must not answer:

> Has the patient started clinical work?

That question belongs to Work Session lifecycle.

### 7.2 Queue entry representation

The implementation should introduce or reuse an authoritative representation capable of storing **multiple Waiting intervals** for one Visit.

Conceptual queue-entry minimum:

| Field | Meaning |
|---|---|
| `id` | Queue-entry identity |
| `tenant_id` | Tenant isolation |
| `visit_id` | Parent Visit |
| `operating_date` | Clinic operating date for this queue episode |
| `lane_key` | Waiting/routing lane |
| `priority_class` | Urgency/priority independent of lifecycle |
| `position` | Authoritative current order within queue |
| `entered_at` | Start of this waiting interval |
| `exited_at` | End of this waiting interval |
| `entry_reason` | Arrival / return from Hold / return from transfer / carry-forward / etc. |
| `exit_reason` | Started Work / Transfer / Hold / operational handoff / etc. |
| `routing_target` | Optional room/service/team target |
| `created_by` | Authenticated actor who created the queue entry |

A Visit may therefore have:

```text
Queue Entry 1 — morning Waiting
Queue Entry 2 — returned after Hold
Queue Entry 3 — later operating date
```

### 7.3 Queue ordering

Reception's deliberate order must be authoritative.

Target behavior:

```text
Queue reorder command
   ↓
transaction locks target queue scope
   ↓
positions are adjusted atomically
   ↓
queue event is recorded
   ↓
realtime consumers re-read authoritative order
```

Emergency/urgent routing may move a patient to another dedicated waiting lane without starting clinical work.

### 7.4 Queue priority

Priority is metadata and routing, not a lifecycle transition.

Changing:

- priority;
- lane;
- room waiting area;
- queue position;
- operating-date workload bucket

must not set the Visit to active clinical work.

### 7.5 Queue wait time

Wait time must not be calculated exclusively from Visit `created_at`.

Target calculation is based on actual queue-entry intervals and the explicit product policy for whether Hold-return waiting is a new waiting interval or a continuation metric.

`created_at` remains Visit creation time, not a universal queue clock.

---

## 8. Arrival architecture

### 8.1 New arrival

Supported arrival categories include:

- scheduled appointment;
- walk-in with no existing patient record;
- walk-in with existing patient record;
- urgent/emergency arrival;
- return after investigation;
- return after Hold;
- additional/multiple procedure context.

Normal flow:

```text
Arrival
  ↓
Identify patient
  ↓
Open/identify same Visit where policy requires continuation
  ↓
Create Queue Entry
  ↓
WAITING
```

### 8.2 Existing Visit arrival guard

The current `registerPatientArrival()` behavior that can rewrite an existing Visit to `waiting` is not acceptable as a generic mutation.

Target rule:

- a new Visit may be opened into Waiting;
- an unresolved Visit may re-enter Waiting only through an explicit valid command such as `resumeHeldVisit` / `returnToWaiting` / `carryForwardReturn`;
- a completed/cancelled/no-show Visit cannot be reset by the generic arrival function;
- provider/room/Agenda references cannot be arbitrarily overwritten by re-registration.

### 8.3 Agenda boundary

Agenda remains authoritative for appointment identity where an appointment exists.

Agenda status and Visit lifecycle are separate.

Arrival can reference Agenda, but Agenda does not become the Patient Flow state machine.

---

## 9. Clinical start authority

Starting work is a command, not a direct status update.

Required evaluation order:

```text
Authenticated actor
      ↓
Tenant resolution
      ↓
Patient Flow capability check
      ↓
Current Visit finality check
      ↓
Current queue / Work Session check
      ↓
Actor eligibility for target clinical context
      ↓
Room/provider/workforce eligibility
      ↓
Concurrency lock
      ↓
Create/activate Work Session
      ↓
Record business event
```

The actor may be:

- doctor;
- specialist;
- authorized procedural operator;
- authorized clinical team member;
- another configured clinical actor.

The schema must not require all such users to masquerade as a Doctor.

---

## 10. Finish command contract

### 10.1 User-facing behavior

The visible primary clinical action is exactly:

> **Finish**

No longer compound label is required for the primary action.

### 10.2 Atomic contract

Finish must be one atomic command.

Conceptual transaction:

```text
BEGIN
  lock Visit + active Work Session
  validate actor + capability + ownership
  persist clinical documentation changes
  close active Work Session
  create Finish business event
  create/update required operational work
  update derived/compatibility fields only if needed
COMMIT
```

If any required operation fails, the complete command rolls back.

This eliminates the current split behavior where documentation may save while the lifecycle transition fails.

### 10.3 Finish must not force final completion

The command must return a structured next-action result, conceptually:

```text
{
  visitId,
  workSessionId,
  outcome: "finished",
  nextDisposition: "operational_handoff" | "waiting" | "hold" | "transfer" | "admin_review",
  workItemId: optional,
}
```

The exact API shape is implementation-stage work, but the semantics are fixed.

---

## 11. Hold command contract

### 11.1 Hold requirements

Hold must record:

- Visit;
- active Work Session;
- authenticated actor;
- timestamp;
- reason/category where required by policy;
- clinical/operational context;
- expected continuation mode if known;
- source/destination context when the Hold is caused by another domain.

### 11.2 Hold consequences

Hold must:

- close/suspend the active Work Session according to the selected model;
- release clinical responsibility/lock;
- retain Visit finality = OPEN;
- prevent Follow-up automation from interpreting the delay as completion;
- make the Visit discoverable for authorized continuation/admin handling.

### 11.3 Resume

Resume from Hold must not simply relock an old `in_consultation` row.

The preferred path is:

```text
Held Visit
   ↓ authorized return/resume command
Queue Entry created
   ↓
Waiting
   ↓
Start Work
   ↓
new Work Session
```

This produces correct queueing and history.

---

## 12. Transfer command contract

Transfer is an explicit business operation.

Required minimum information:

- Visit ID;
- current Work Session ID;
- source actor;
- source room/context;
- destination actor OR destination room/service target;
- transfer reason;
- authorized actor performing transfer;
- timestamp;
- resulting continuation mode.

Transfer must preserve:

- Visit ID;
- patient ID;
- tenant ID;
- all domain relationships to the Visit.

Transfer must not silently create a second Visit.

### 12.1 Transfer and Work Session creation

Where real work changes context, the target should create a new Work Session rather than overwrite the old one.

This supports:

```text
W1 Doctor
W2 Laser room
W3 Doctor review
```

without loss of history.

### 12.2 External investigation

When the patient leaves for external imaging/lab or otherwise leaves active clinic work unresolved, the preferred Patient Flow model is Hold/Transfer + continuation, not new Visit creation.

---

## 13. Operational handoff architecture

Journey Coordination already contains generic Work Item assignment/handoff mechanics. These should be reused rather than replaced.

### 13.1 Authority split

```text
Patient Flow
    owns: Visit lifecycle meaning

Journey Coordination
    owns: generic Work Item assignment / handoff history

Integration
    links: Visit-originated operational work to the Visit
```

Journey Coordination must not create a competing Patient Flow state machine.

### 13.2 Visit linkage

Preferred integration sequence:

1. inspect the existing `operational_work_items.source_type/source_id` contract;
2. reuse it for Visit-originated work if it can represent the relationship safely and queryably;
3. if not, add an explicit Visit FK rather than duplicating a second work engine;
4. optionally link an originating Work Session where needed for provenance.

Target invariant:

> Every Visit-originated operational Work Item can be resolved unambiguously back to its source Visit.

### 13.3 Reassignment

A receptionist change is a Work Item responsibility change, not an account identity change.

Example:

```text
Visit V100
   ↓
Operational Work Item O200
   ↓ assigned to Receptionist A
   ↓ A unavailable
handoff/reassign command
   ↓
O200 assigned to Receptionist B
```

Historical A ownership remains visible in Work/Business audit history.

---

## 14. Operational timing policy

### 14.1 Timing is configuration

Observed five-minute and sixty-minute values are implementation evidence, not product constants.

Target policy is tenant-configurable.

Conceptual policy dimensions:

| Policy | Purpose |
|---|---|
| `reassignment_after_minutes` | When unresolved work becomes eligible for broader reassignment |
| `escalation_after_minutes` | When unresolved work should be surfaced/escalated to Administration |
| `operational_close_after_minutes` | When daily operational workload may be removed by policy |
| `hold_review_after_minutes` | Optional review reminder for long Holds |

All fields are examples of policy dimensions; final naming requires implementation review.

### 14.2 Policy storage

The implementation must first reuse an existing tenant settings/policy structure if one exists.

A new policy table is only justified when no existing canonical configuration structure can represent these tenant-level policies safely.

### 14.3 Worker semantics

A timestamp alone is not a worker.

A complete timing feature requires:

```text
Policy configuration
   ↓
Eligibility timestamp / due time
   ↓
reliable scheduled evaluation
   ↓
authorized Patient Flow command
   ↓
business event + work reassignment/escalation/disposition
```

The scheduler may be implemented using an existing approved project mechanism; this architecture does not choose a specific background service.

### 14.4 Five-minute behavior

The current hard-coded five-minute trigger must not be treated as a permanent lifecycle state.

Its target meaning is eligibility for a configured operational consequence, such as reassignment or review.

### 14.5 Sixty-minute behavior

The current auto-close trigger is not sufficient evidence of a complete closure implementation.

A longer interval may cause **Operational Closure / escalation**, but cannot silently set final Visit completion.

---

## 15. Operational closure

Operational Closure means:

> The unresolved Visit is no longer part of the active daily operational workload according to policy.

Examples of reasons:

- end-of-day unresolved workload;
- timed escalation;
- operational work cannot be completed today;
- administrative follow-up is required.

Operational closure must preserve:

- Visit identity;
- domain links;
- business history;
- unresolved status;
- ability for authorized Administration to continue/carry forward/review.

It must not create a new Visit.

It must not create Follow-up merely because the queue item was removed.

---

## 16. Administrative closure

Administrative Closure is the final clinic-authority disposition.

### 16.1 Required authority

The command must be separately permissioned from normal clinical or reception updates.

### 16.2 Closure readiness

The system should evaluate cross-domain readiness rather than making the Admin user remember every detail manually.

Potential readiness signals include:

- no active Work Session;
- no unresolved required operational Work Item;
- required documentation present;
- required procedure/service records reconciled;
- financial prerequisites satisfied according to tenant policy;
- required inventory/consumption disposition satisfied according to domain policy;
- outstanding investigation/hold conditions appropriately dispositioned;
- required exceptions resolved or explicitly waived by authority.

These are policy checks, not a universal mandatory list for every clinic.

### 16.3 Finalization rule

Only the authoritative finalization operation may set final completion/closure fields.

Normal users with generic `visits:update` must not be able to bypass this operation.

---

## 17. Carry-forward architecture

Carry-forward is a continuation decision for an unresolved Visit.

Conceptual flow:

```text
OPEN Visit
   ↓
still unresolved at operating-date boundary
   ↓
authorized Carry-forward command
   ↓
record event + next operating date
   ↓
future operating date
   ↓
Waiting / appropriate operational entry
   ↓
new Clinical Work Session
```

### 17.1 Identity rule

The Visit ID remains unchanged.

### 17.2 Audit rule

Carry-forward must record:

- source operating date;
- destination operating date;
- actor;
- reason;
- source disposition;
- resulting queue/operational context.

### 17.3 Query rule

The normal daily queue must not be based only on `created_at`.

Administrative and operational queries must be capable of finding unresolved Visits independent of their original creation date.

---

## 18. Follow-up boundary

Follow-up automation should subscribe to authoritative completion outcomes, not generic delays or queue removals.

### Allowed conceptual sequence

```text
Visit COMPLETED
   ↓
Follow-up domain may create downstream work
```

### Disallowed implicit sequence

```text
Hold / Transfer / Carry-forward / Operational Closure
   ↓
automatic Follow-up because the Visit was delayed
```

A genuine future review after a completed Visit may be a Follow-up and/or a new Appointment according to the Follow-up and Agenda domains.

---

## 19. Cross-domain continuity contract

### 19.1 Procedures

`clinic_visit_procedures` remains Visit-owned context.

The target may add an optional Work Session link where exact procedure provenance is required for audit/reporting.

Do not move procedure ownership into Patient Flow.

### 19.2 Inventory

Existing Visit linkage is preserved.

Future Work Session attribution may be additive for provenance only.

Inventory remains authoritative for consumption/stock truth.

### 19.3 Billing

Existing invoice↔Visit linkage remains.

The billing source-of-truth must be reconciled so billable work is derived from authoritative Visit-owned procedure/service records rather than an outdated Agenda-only path.

Patient Flow must not silently finalize financial records.

### 19.4 Treatment Plan

Treatment Plan remains optional and separate.

A Visit can complete without a Treatment Plan. A Treatment Plan may reference the Visit.

### 19.5 Medical Files

Medical Files remain a separate document/medical domain.

Adding or reading a Medical File must not by itself mutate Visit lifecycle.

### 19.6 Communications

Communications remain general clinic-team infrastructure, not doctor-only infrastructure.

Patient Flow may emit operational notification events, but Communications owns message delivery/read state semantics.

---

## 20. Business lifecycle event ledger

Generic row audit and business lifecycle audit serve different purposes.

### 20.1 Row audit

Existing `audit_trail` / `fn_audit_changes()` infrastructure may remain useful for technical change history.

It must not be treated as the sole Patient Flow business ledger.

### 20.2 Business event

A Patient Flow business-event record should capture at least:

| Field | Purpose |
|---|---|
| `id` | Event identity |
| `tenant_id` | Tenant isolation |
| `visit_id` | Visit context |
| `work_session_id` | Optional session context |
| `queue_entry_id` | Optional queue context |
| `event_type` | Arrival / Waiting / Start / Finish / Hold / Transfer / Handoff / Reassign / Carry-forward / Operational Close / Admin Close / Reopen / etc. |
| `actor_clinic_user_id` | Authenticated actor |
| `actor_role` or resolved capability context | Audit context |
| `occurred_at` | Event time |
| `from_context` | Source state/context |
| `to_context` | Destination state/context |
| `reason` | Business reason where applicable |
| `metadata` | Non-authoritative supporting details |
| `correlation_id` | Connects one user command across writes/events |

### 20.3 Event semantics

Business events are append-only history.

They are not a second mutable state machine.

The authoritative current state remains in controlled aggregate/child records.

### 20.4 Actor identity

Sensitive Patient Flow operations must never silently produce a NULL business actor.

If the system cannot resolve an authenticated actor for a sensitive command, the command should fail rather than record an anonymous lifecycle action.

---

## 21. Authoritative command boundary

All sensitive lifecycle operations should converge on one Patient Flow command boundary.

Conceptual contract:

```text
Authenticated actor
      ↓
Patient Flow command API / server action adapter
      ↓
authoritative DB transaction boundary
      ↓
resolve tenant + capability
      ↓
lock relevant Visit / Work Session / Queue scope
      ↓
validate current state + command preconditions
      ↓
mutate controlled records
      ↓
append business event
      ↓
create/update downstream Work Items where required
      ↓
commit atomically
```

### 21.1 Supported command families

The implementation should converge on explicit commands analogous to:

```text
openVisit / arriveVisit
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
operationalCloseVisit
administrativelyCloseVisit
cancelVisit
markNoShow
reopenVisit        (admin-only, policy controlled)
```

Exact function/action names may differ. The important rule is semantic separation and one authority.

### 21.2 Direct UPDATE prohibition

The following must not remain arbitrary client-controlled lifecycle fields:

- final Visit status;
- active Work Session ownership;
- lifecycle timestamps;
- queue position;
- terminal closure;
- carry-forward disposition;
- operational closure;
- transfer metadata.

Documentation fields may remain directly editable where appropriate, but lifecycle mutation must use the authoritative command path.

---

## 22. Database enforcement strategy

### 22.1 Preferred execution model

Prefer a database function/transaction boundary that is **SECURITY INVOKER** so the caller remains subject to tenant/RLS security wherever feasible.

The function should derive actor identity from authenticated context and must not accept an arbitrary `tenant_id` or `actor_id` as trusted input.

### 22.2 When special privilege is genuinely required

If an implementation proves that a privileged database function is unavoidable for a cross-row operation, it must be treated as an explicit security design review item. Such a function must:

- validate `auth.uid()`;
- validate tenant scope;
- expose only the minimum intended command;
- live outside an exposed application schema where practical;
- have explicit EXECUTE grants;
- not rely on user-editable JWT metadata for authorization;
- be followed by security/RLS verification.

A generic SECURITY DEFINER write endpoint is not the target architecture.

### 22.3 Transition guard

Database enforcement must prevent arbitrary lifecycle transitions even if a user has generic row-update permissions.

A defense-in-depth pattern may combine:

1. controlled command functions;
2. restricted column update grants where applicable;
3. transition/immutability triggers;
4. RLS tenant + capability checks;
5. `WITH CHECK` protections for mutable relationship fields;
6. concurrency/version validation.

The final implementation must not depend on only one layer.

---

## 23. RLS and authorization architecture

### 23.1 Tenant isolation

All new Patient Flow child records must carry `tenant_id` and enforce same-tenant relationships with composite or equivalent integrity protections.

### 23.2 Capability model

Current live `sessions:*`, `visits:*`, and `work:*` permissions are useful building blocks but are too coarse by themselves for the expanded command semantics.

A final capability matrix must distinguish at least:

| Command | Typical capability concern |
|---|---|
| Open/Arrival | operational arrival capability |
| Queue reorder | operational queue management |
| Start clinical work | relevant clinical/work capability |
| Finish | active-work ownership + clinical capability |
| Hold | active-work ownership + clinical capability |
| Transfer | transfer capability + destination eligibility |
| Operational handoff | work assign/handoff capability |
| Reassign | authorized operational/admin management |
| Carry-forward | authorized operational/admin control |
| Operational close | configured operational/admin authority |
| Administrative close | clinic administrative closure capability |
| Reopen | explicit administrative correction capability |
| Cancel / No-show | appropriate operational/administrative capability |

Exact permission key names must be reconciled with the live permission catalog before implementation.

### 23.3 Patient Flow vocabulary reconciliation

Repository references to:

- `patient_flow:operations`
- `patient_flow:clinical`
- `patient_flow:administrative`

must not remain a second authorization vocabulary if the live permission catalog uses another canonical capability system.

Before implementation, one canonical permission vocabulary must be selected and synchronized between code and live DB.

### 23.4 Workspace behavior

A workspace provides UI context only.

The same command called from Clinical Workspace, Patient Flow Board, Administration or another approved surface must evaluate authorization through the same policy.

---

## 24. Concurrency and locking

### 24.1 Current problem

The existing Visit-row `lock_holder_id` is acting as both active work ownership and lifecycle control.

### 24.2 Target

Lock the **active Work Session** for clinical concurrency where possible.

The Visit itself remains the stable parent aggregate.

### 24.3 Start / Finish / Hold concurrency

Each command should use a transaction with appropriate row locks/version checks:

```text
SELECT active Work Session FOR UPDATE
       + Visit FOR UPDATE where required
       + Queue scope FOR UPDATE for reorder operations
```

The exact locking scope must avoid unnecessary tenant-wide blocking.

### 24.4 Non-owner protection

A non-owner must not Finish/Hold/modify another actor's active Work Session merely because generic `visits:update` exists.

This must be enforced at the authoritative command/database boundary.

---

## 25. UI architecture consequences

UI implementation comes after the backend contract, but the target behavior is fixed.

### Clinical Workspace

Must distinguish:

- Waiting available to this actor/room context;
- active Work Session owned by current actor;
- Hold/continuation state where relevant;
- Transfer option where authorized;
- Finish as the primary completion-of-current-work action.

It must not expose old `pending_close` as if it were the complete end-user concept unless it is purely a compatibility label during transition.

### Operation Workspace

Must emphasize:

- Waiting queue;
- operational handoff work;
- reassignment/ownership;
- follow-on reception/financial/administrative actions;
- unresolved/carry-forward work where authorized.

It must not present an active clinical Work Session as a reception-owned completion lane.

### Administration Workspace

Must operate as a control plane:

- find unresolved Visits across dates;
- correct arrival/registration problems;
- reassign operational work;
- carry forward Visits;
- inspect lifecycle history;
- resolve exceptions;
- finalize or reopen where explicitly authorized.

It must not merely mirror the operational queue with more drag/drop actions.

---

## 26. Legacy compatibility strategy

The target architecture must be additive and migration-safe.

### 26.1 `clinic_visit_sessions`

Retain the table as the parent Visit record rather than introducing a second `visits` table solely to rename it.

### 26.2 Existing `session_status`

Treat the current six-value `session_status` as a compatibility representation during migration.

Do not allow it to remain the long-term source of truth for every lifecycle dimension.

### 26.3 `pending_close`

`pending_close` should be treated as a legacy compatibility state representing an operational handoff/return phase, not the final architecture's universal concept of closure.

During migration, existing records may continue to read through a compatibility adapter until all authoritative commands and UI are migrated.

### 26.4 Existing start/end fields

Existing `session_started_at` / `session_ended_at` should not be overwritten destructively.

Where a new Work Session child model is introduced, historical rows should be mapped only from evidence actually present. Missing history must not be invented.

### 26.5 Existing locks

Existing `lock_holder_id` / `lock_timestamp` should be retained only as compatibility fields until active Work Session locking is canonical.

### 26.6 Existing initializer

`initialized_by_receptionist` remains a historical field.

It must not be repurposed as current ownership.

### 26.7 Existing generic Work Items

Reuse `operational_work_items` and `operational_work_history`. Add Visit linkage only if the current source-reference contract cannot safely support Visit-originated work.

---

## 27. Data migration principles

No automatic mass backfill should be performed merely to make the new model look complete.

Migration must follow:

```text
inspect evidence
   ↓
map unambiguous historical facts
   ↓
preserve uncertain data
   ↓
flag unresolved mappings
   ↓
verify counts/integrity
   ↓
cut over authority
```

### Existing live snapshot implication

The observed live snapshot is mostly `completed` with one stale waiting fixture. It does not provide enough scenario diversity to invent Hold/Transfer/Work Session history.

Therefore:

- existing rows may be mapped where fields prove the historical fact;
- absent events are not fabricated;
- new scenario coverage must be created in isolated testing after implementation begins.

---

## 28. Reconciliation of current DB triggers/functions

The following existing mechanisms require explicit treatment during implementation:

### `fn_set_session_buffer()`

Current behavior forces `pending_close` and sets a five-minute buffer when `session_ended_at` is first populated.

Target treatment:

- do not let this trigger remain an independent Patient Flow authority;
- reinterpret or retire it only after replacing the behavior with the configured policy command path;
- prevent a technical timestamp trigger from silently deciding business closure semantics.

### `fn_set_auto_close()`

Current behavior ties `auto_close_at` to a `visit_closed_at` transition plus `pending_close` condition.

Target treatment:

- reconcile the exact semantics;
- separate operational closure from final Visit completion;
- attach due timestamps to a configured policy/event model;
- ensure any scheduled action invokes an explicit authorized command.

### `tr_audit_sessions`

Target treatment:

- retain technical row audit where useful;
- add business lifecycle events rather than expecting row audit to reconstruct business meaning;
- require reliable actor identity for sensitive business operations.

---

## 29. Queue engine reconciliation

`queueEngine` remains the conceptual home for transition and queue rules only if it is wired to the real authority.

Current `processQueue()` must not coexist forever as a dead path while `getQueue()` independently orders by `created_at`.

The implementation choice must be one of:

1. make the canonical queue engine the actual authoritative ordering/transition path; or
2. retire the dead path after proving another canonical implementation fully replaces it.

Do not maintain two independent queue algorithms.

---

## 30. Exact command-to-record effects

| Command | Visit | Work Session | Queue | Operational Work | Business Event |
|---|---|---|---|---|---|
| Arrival/Open | create/open | none | create Waiting entry | optional | required |
| Queue reorder | unchanged | unchanged | reorder positions | unchanged | required |
| Start Work | open | create active | close active Waiting entry | may update responsibility | required |
| Finish | open | active → finished | none/next queue per policy | create/update operational work | required |
| Hold | open | active → held | optional return later | optional Hold/review work | required |
| Resume Hold | open | none → new active after Waiting | create Waiting entry | update work as needed | required |
| Transfer | open | active → transferred | target context as needed | optional | required |
| Handoff/Reassign | open | unchanged | unchanged | assignment/handoff change | required |
| Carry-forward | open | unchanged/held | create future-date entry when required | update unresolved responsibility | required |
| Operational Close | open | none active | remove active workload | mark operational disposition | required |
| Admin Close | open → completed | none active | none active | required work resolved | required |
| Cancel | open → cancelled | controlled termination | remove queue entry | resolve dependent work | required |
| No-show | open → no_show | none | remove queue entry | resolve dependent work | required |
| Reopen | completed/cancelled → open only by policy | controlled | controlled | controlled | required |

The exact storage write set for each command must be implemented transactionally and verified against the final schema.

---

## 31. Closure and finality rules

The implementation must establish the following negative guarantees:

- `Finish` cannot by itself force `completed`.
- `Hold` cannot force `completed`.
- `Transfer` cannot force `completed`.
- queue reorder cannot force `in_consultation`/active work.
- operational timeout cannot silently force final completion.
- Follow-up creation cannot force Visit completion.
- invoice creation/payment cannot silently become the lifecycle authority.
- Agenda completion cannot become Visit completion.
- generic `visits:update` cannot bypass terminality.

Final completion requires one authoritative finalization command.

---

## 32. Acceptance scenario catalog

The final implementation gate must include authenticated end-to-end scenarios, not only static/type checks.

### PF-SC-01 — Scheduled arrival

```text
Appointment
 → Arrival
 → same Agenda reference
 → Visit OPEN
 → Waiting
```

### PF-SC-02 — Walk-in

```text
Walk-in
 → Visit created
 → Waiting
```

### PF-SC-03 — Reception reorder

```text
A, B, C waiting
 → Reception moves C before A
 → authoritative order = C, A, B
 → no clinical start event
```

### PF-SC-04 — Clinical start

```text
Waiting
 → authorized clinical actor starts
 → Work Session W1 ACTIVE
 → clinical lock belongs to actor
```

### PF-SC-05 — Finish

```text
W1 ACTIVE
 → Finish
 → W1 FINISHED
 → Visit OPEN
 → operational handoff/work produced
 → Visit not COMPLETED
```

### PF-SC-06 — Hold and return

```text
W1 ACTIVE
 → Hold
 → Visit OPEN
 → W1 HELD
 → actor lock released
 → return
 → Waiting
 → new W2 ACTIVE after authorized start
```

### PF-SC-07 — Transfer

```text
W1 ACTIVE
 → Transfer Doctor → Laser Room
 → W1 TRANSFERRED
 → same Visit ID
 → W2 ACTIVE in Laser context
```

### PF-SC-08 — Multiple procedures

```text
same Visit
 → Procedure A
 → Procedure B
 → both remain Visit-linked
 → optional exact Work Session attribution available
```

### PF-SC-09 — Inventory continuity

```text
same Visit
 → transferred/procedural Work Session
 → consumable recorded
 → inventory row remains linked to same Visit
```

### PF-SC-10 — Billing continuity

```text
same Visit
 → billable procedures/services
 → invoice contains authoritative Visit work
 → invoice does not mutate Visit finality by itself
```

### PF-SC-11 — Reception handoff A → B

```text
Operational Work Item assigned to A
 → authorized handoff/reassign
 → assigned to B
 → A's historical assignment retained
 → no impersonation
```

### PF-SC-12 — Carry-forward

```text
unresolved Visit on Day 1
 → Carry-forward to Day 2
 → same Visit ID
 → Day 2 Waiting/operational entry
 → no automatic Follow-up
```

### PF-SC-13 — Operational closure

```text
unresolved Visit
 → configured operational timeout
 → removed from active daily workload
 → Visit remains OPEN
 → Admin can retrieve it
```

### PF-SC-14 — Administrative final closure

```text
Visit OPEN
 → all required policy checks satisfied
 → authorized admin closure
 → Visit COMPLETED
 → completion event recorded
 → Follow-up may now be generated downstream
```

### PF-SC-15 — Direct mutation attack

```text
authenticated user with generic update permission
 → attempts direct lifecycle UPDATE
 → rejected
```

### PF-SC-16 — Non-owner Finish

```text
A owns active Work Session
 → B attempts Finish
 → rejected by authoritative command boundary
```

### PF-SC-17 — Terminality

```text
COMPLETED Visit
 → ordinary update/reopen attempt
 → rejected
```

### PF-SC-18 — Arrival misuse

```text
COMPLETED Visit
 → generic register arrival
 → rejected
```

### PF-SC-19 — Audit actor

Every sensitive command records:

```text
actor + Visit + command/event + timestamp + source/destination + reason where required
```

### PF-SC-20 — Tenant isolation

A user from Tenant A cannot read, reorder, mutate, transfer or close a Visit belonging to Tenant B.

---

## 33. Implementation sequencing contract

After architecture approval, implementation should occur in controlled waves.

### Wave A — Authority and data model

1. Final schema reconciliation.
2. Decide exact child Work Session representation.
3. Decide queue-entry representation.
4. Define business event storage.
5. Define Visit operational responsibility linkage.
6. Define timing policy storage reuse/extension.
7. Define compatibility mapping for current six-state rows.

### Wave B — Database authority

1. Add additive schema structures.
2. Add same-tenant integrity.
3. Add controlled Patient Flow command boundary.
4. Restrict direct lifecycle mutation.
5. Add transition/immutability guards.
6. Add business event audit.
7. Reconcile existing triggers/functions.

### Wave C — Application orchestration

1. Adapt Queue engine to the authoritative command path.
2. Adapt Arrival.
3. Adapt Start.
4. Adapt Finish atomically.
5. Implement Hold.
6. Implement Transfer.
7. Integrate operational Work Items.
8. Implement carry-forward.
9. Implement operational closure.
10. Implement administrative closure/reopen policy.

### Wave D — UI

1. Clinical Workspace.
2. Operation Workspace.
3. Administration Control Plane.
4. queue ordering/reorder UI.
5. Hold/Transfer flows.
6. exact **Finish** label.
7. unresolved/carry-forward views.

### Wave E — verification

1. Isolated DB tests.
2. RLS/capability tests.
3. concurrency tests.
4. cross-domain integrity tests.
5. authenticated E2E scenarios.
6. audit reconstruction.
7. regression against existing completed data.

Vercel remains out of scope until the final production stage defined by the broader execution contract.

---

## 34. Explicit implementation guardrails

Implementation must not:

- create a second independent Visit engine;
- create a second independent generic Work engine;
- move Follow-up inside Patient Flow;
- make Agenda the Visit lifecycle authority;
- create a new Visit for every Work Session;
- treat Hold as completion;
- treat Transfer as a new Visit by default;
- use receptionist initializer as permanent owner;
- impersonate another user for continuation;
- keep five/sixty minutes as fixed architecture constants;
- rely on row audit alone for business lifecycle audit;
- rely on TypeScript transition validation as the only lifecycle protection;
- let generic `visits:update` bypass lifecycle rules;
- fabricate historical Work Session events during migration;
- redesign UI before the lifecycle/data contract is stable.

---

## 35. Open implementation decisions that remain intentionally gated

The architecture is now concrete enough to implement, but the following exact implementation choices still require evidence-based reconciliation before code/SQL begins:

1. Exact physical table/columns for Clinical Work Sessions.
2. Exact physical representation for multi-entry Queue history and current queue order.
3. Exact reuse path for tenant policy/settings.
4. Exact source-link strategy into `operational_work_items`.
5. Exact permission keys after live catalog reconciliation.
6. Exact SQL/RLS technique for blocking direct lifecycle field mutation while preserving safe documentation writes.
7. Exact replacement/retirement order for existing `fn_set_session_buffer()` / `fn_set_auto_close()`.
8. Exact closure readiness checks by tenant policy.
9. Exact compatibility mapping for existing `pending_close` records.
10. Exact scheduler/worker implementation for timing policies.

These are implementation details, not reasons to reopen the already-set product architecture.

---

## 36. Gate 01 target state

When implemented and verified, Gate 01 should be able to state:

```text
Visit                     = stable unresolved journey container
Clinical Work Session    = first-class child work unit
Waiting                  = operational queue condition
Finish                   = end current clinical Work Session
Hold                     = unresolved suspension
Transfer                 = same Visit continuation
Operational Handoff      = generic Work assignment/handoff linked to Visit
Operational Closure      = daily workload disposition
Administrative Closure   = final clinic disposition
Carry-forward            = same Visit, later operating date
Follow-up                = downstream after authoritative completion
Patient Flow authority   = one enforceable command boundary
Authorization            = tenant + capability + context + ownership
Audit                    = business event + technical row audit
```

The target architecture is therefore **implementation-ready at the product/architecture contract level**, but **not yet implementation-authorized** until the gated implementation decisions in Section 35 are reconciled against the current repository and live Supabase objects.

---

## 37. References

- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-GAP-MATRIX-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-HISTORICAL-DOCUMENTATION-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md`
- `src/domain/queue/queue.types.ts`
- `src/domain/queue/queue.engine.ts`
- `src/domain/queue/queue.actions.ts`
- `src/domain/queue/workspace.actions.ts`
- `src/domain/queue/queue.queries.ts`
- `src/domain/visit/visit.actions.ts`
- `src/features/workspaces/ClinicalWorkspace.tsx`
- `src/features/workspaces/OperationWorkspace.tsx`
- `src/features/patient-flow/PatientFlowBoard.tsx`
- `src/domain/journey-coordination/work.actions.ts`
- `src/core/i18n/terminology.ts`
- relevant Supabase migrations and live database objects referenced by Gate 01 evidence

**End of Gate 01 Patient Flow Target Architecture.**
