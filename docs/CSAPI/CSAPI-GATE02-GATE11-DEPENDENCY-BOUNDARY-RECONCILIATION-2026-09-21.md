# CORE SYSTEM — CSAPI Gate 02 ↔ Gate 11 Dependency & Boundary Reconciliation

**Date:** 2026-09-21  
**Status:** PRECHECK RECONCILIATION — ADOPTED EXECUTION DIRECTION  
**Gate:** CSAPI Gate 02 — Patient Journey  
**Related Gate:** CSAPI Gate 11 — Follow-up & Retention  
**Purpose:** Establish the execution boundary and dependency contract between the longitudinal Patient Journey gate and the independent Follow-up module before Gate 02 implementation planning.

---

## 1. Executive decision

**Gate 02 remains Gate 02. Gate 11 is not merged into it, and the 20-gate CSAPI map is not reordered at this time.**

The adopted execution structure is:

```text
Gate 02 — Patient Journey
    ↓ defines / approves longitudinal continuity contract
Gate 11 — Follow-up & Retention
    ↓ implements / verifies Follow-up-owned continuity mechanics
Gate 12 — Communications & Chat
    ↓ owns communication records/orchestration
Gate 13 — Notifications & Operational Work
    ↓ owns notification infrastructure boundary + operational work coordination
```

This is **not** a rigid one-way runtime chain. Runtime continuity is branching and remains domain-owned.

The reason for retaining the map is that the current architecture already contains independent owners for Patient Journey continuity, Follow-up, Communications, Agenda, and Journey Coordination. The correct action is to clarify their contracts, not collapse them into one gate or one engine.

---

## 2. Why Gate 02 and Gate 11 are coupled but not merged

### Gate 02 owns the longitudinal question

Gate 02 must answer:

- How the patient remains one continuous longitudinal record across repeated interactions.
- How a completed clinical interaction can produce zero, one, or many valid continuation consequences.
- How Patient Journey relates Treatment Plan, Appointment, Follow-up, Review, Communication, and Operational Work without creating a universal workflow/state engine.
- Which domain owns each continuation consequence.
- What evidence proves the continuation link is truthful.

### Gate 11 owns the Follow-up capability

Follow-up remains an independent CORE Module with its own:

- records;
- permissions;
- scheduling/execution semantics;
- automation rules;
- results/outcomes;
- patient/visit linkage;
- auditability.

Gate 11 must implement and validate the Follow-up contract approved through the broader CSAPI architecture. It must not redefine Patient Journey ownership.

Therefore:

> **Gate 02 defines the longitudinal integration contract; Gate 11 owns the Follow-up implementation inside that contract.**

---

## 3. The current gate map does not need reordering

The current CSAPI map is still structurally usable:

- Gate 02 — Patient Journey
- Gate 11 — Follow-up & Retention
- Gate 12 — Communications & Chat
- Gate 13 — Notifications & Operational Work

No evidence requires:

- merging Gate 11 into Gate 02;
- moving Gate 11 before Gate 02;
- creating a new gate;
- splitting the 20-gate map.

The correction required is a **scope clarification inside Gate 11**, because its current one-line description is broader than its architectural ownership.

This is a documentation/boundary correction, not a gate-map reorganization.

---

## 4. Corrected Gate 11 architectural scope

The existing Gate 11 line was:

> Event → follow-up → communication/notification → operational work → completion; one engine only

This wording is too linear and can be read as making Follow-up the owner of communication, notification, operational work, and completion.

The reconciled meaning is:

> **Follow-up lifecycle, retention continuity, scheduling and automation, plus controlled integrations with Communications, Agenda and Journey Coordination — one Follow-up engine only.**

Gate 11 may orchestrate/emit consequences through owned contracts, but ownership remains:

```text
Follow-up continuity        → Follow-up
Communication               → Communications
Appointment                 → Agenda
Operational Work            → Journey Coordination
Notification delivery      → Notification infrastructure / owning integration boundary
Clinical progression        → Clinical / Patient Journey / Treatment Plan
```

Gate 11 must validate the integrations without taking ownership of the other domains.

---

## 5. Canonical Gate 02 → Follow-up contract

Gate 02 may produce a continuity consequence of type:

```text
Follow-up
```

The Follow-up module then owns:

- creating or accepting the Follow-up record;
- scheduling;
- assignment;
- manual or automated execution;
- recording result/outcome;
- determining whether another Follow-up is needed;
- emitting a downstream intent when another domain consequence is explicitly required.

Gate 02 must not create a second Follow-up record model or second Follow-up state machine.

---

## 6. Canonical Follow-up outputs

A Follow-up may end with:

```text
Follow-up
 ├─→ no immediate further action
 ├─→ another Follow-up
 ├─→ Review requirement
 ├─→ Appointment requirement → Agenda
 ├─→ Communication intent → Communications
 └─→ explicit operational action/request → Journey Coordination
```

These are consequences, not a universal scalar "Next Action" field for the whole Patient Journey.

A Follow-up completion therefore **does not** mean:

```text
Patient Journey completed
```

The longitudinal Patient Journey remains continuous.

---

## 7. Next Action boundary

The following is now binding for Gate 02 and later gates:

> **Next Action is a continuity concept, not a universal database object and not an automatic Work Item.**

A Work Item is created only when an actual operational action, request, handoff, or escalation is required.

Examples:

```text
Next Action: book a future appointment
    → Agenda

Next Action: perform a follow-up call
    → Follow-up

Next Action: send patient communication
    → Communications

Next Action: ask another staff member to perform a clinic action
    → Journey Coordination / Work Item
```

The frontend should hide this architectural complexity and present only the simple action appropriate to the user.

---

## 8. Current repository evidence

### 8.1 Follow-up is a real independent module

Current application code has an independent Follow-up layer:

- `src/domain/followup/`
- `src/features/followup/`
- Follow-up-specific permission checks
- `retention_followups` as the current canonical table
- dedicated automation rules and execution function

Current Follow-up action types include:

- call;
- WhatsApp;
- SMS;
- email;
- appointment;
- review;
- general task.

Current Follow-up completion supports a result/outcome plus optional next-action metadata.

### 8.2 Current live database state

Read-only Supabase verification on 2026-09-21 found:

- `retention_followups`: **813**
- `followup_automation_rules`: **18**
- `operational_work_items`: **17**
- `operational_work_history`: **17**

Current non-deleted Follow-up statuses:

- open: 811
- completed: 1
- cancelled: 1

Current non-deleted action types:

- WhatsApp: 626
- appointment: 138
- call: 49

No current `next_action_type` values are populated in the inspected Follow-up rows.

### 8.3 Current automation scope

Current live automation rules cover, among others:

- appointment reminders;
- post-visit follow-up;
- reactivation;
- explicit clinical follow-up configuration.

This confirms Follow-up is not merely a notification table and has its own continuity/automation capability.

---

## 9. Confirmed architectural drift to defer to the owning implementation gate

### D1 — Follow-up → Notification Queue business coupling still exists

The live function `enqueue_followup_notification(...)` is called by `run_followup_automation()` and directly inserts rows into `notification_queue`.

The live notification queue currently contains:

- **812** total rows;
- **623** rows tagged with `communication_source = followup`;
- **744** rows carrying a Follow-up identifier in metadata.

This proves the coupling is real implementation behavior, not only a documentation concern.

**Classification:** Gate 11 remediation / Communications integration dependency.

**Do now:** record the boundary; do not mutate production during Gate 02 precheck.

**Do later:** replace the business-responsibility coupling with the approved Communications contract while preserving Follow-up ownership and delivery infrastructure semantics.

### D2 — Completed Follow-up can create generic Operational Work from Next Action metadata

The live trigger:

`trg_bridge_completed_followup_next_action`

calls:

`bridge_completed_followup_to_next_action()`

That function can create:

```text
Operational Work Item
kind = next_action
source_type = retention_followup
source_id = <follow-up id>
```

when a Follow-up is completed with `next_action_at` or `next_action_type`.

The implementation does not independently establish that an actual operational action/request/handoff/escalation is required before creating the Work Item.

Current live data contains only **one** Follow-up-linked Work Item, with source type `follow_up`; the remaining 16 Work Items are synthetic demo records. No currently inspected Follow-up rows have a populated `next_action_type`.

**Classification:** cross-boundary drift affecting Gate 11 + Gate 13.

**Do now:** preserve as evidence; do not delete or rewrite existing data.

**Do later:** change the bridge contract so operational work is emitted only for an explicit operational requirement.

---

## 10. Current communications boundary evidence

The Communications implementation already has a canonical request path:

```text
createCommunicationRequest(...)
    → communication_requests
    → optional Coordination Work Item
```

The action implementation in:

`src/domain/communications/communications.actions.ts`

creates a `communication_requests` record and, when an assignee is present, creates the corresponding Work Item through the existing Coordination path.

This is consistent with the desired boundary:

```text
Communication
    → Work only when explicit operational action is required
```

The Follow-up automation path has not yet been brought fully into this same ownership model. That is therefore an identified integration gap, not a justification for moving Communications into Gate 02.

---

## 11. Current Journey Coordination boundary evidence

The Journey Coordination blueprint explicitly states:

- Follow-up remains its own domain capability.
- Coordination integrates with Follow-up rather than rebuilding it.
- A Follow-up can lead to a Work/Task when an operational action is required.
- Coordination does not own appointment scheduling.
- Coordination does not own clinical progression.
- Coordination does not own communications/notification transport.

This matches the reconciled Gate 02/Gate 11 boundary.

---

## 12. Gate 02 implementation boundary resulting from this reconciliation

### Gate 02 may change

Only continuity-level artifacts required to express the approved longitudinal contract, such as:

- canonical patient-context continuity references;
- explicit continuation mapping;
- decision/result semantics;
- domain-to-domain integration contracts;
- traceability;
- runtime verification for continuation.

### Gate 02 must not implement

- a new Follow-up engine;
- new Follow-up tables when the existing model is sufficient;
- new notification infrastructure;
- a second Communications engine;
- a second Work Item engine;
- appointment scheduling inside Patient Journey;
- universal Patient Journey completion;
- a generic scalar Next Action engine that absorbs all downstream consequences.

### Gate 11 will own later

- Follow-up automation correctness;
- Follow-up-specific lifecycle and assignment behavior;
- removal/correction of the Follow-up → notification business coupling;
- explicit operational-work emission semantics;
- Follow-up-specific runtime and security verification;
- preserving existing Follow-up records and automation idempotency.

### Gate 12 will own later

- Communications domain completion;
- canonical communication record/orchestration behavior;
- Chat as a compact surface over Communications.

### Gate 13 will own later

- Notification vs Communication vs Operational Work boundary verification;
- general event-to-output work rules;
- operational work authority and lifecycle;
- cross-domain integration of explicit work requests.

---

## 13. Required Gate 02 acceptance language

Gate 02 should prove:

```text
Patient / prior context
      ↓
Current interaction / result
      ↓
Continuity consequence(s)
      ├─ Treatment Plan progression
      ├─ Appointment requirement → Agenda
      ├─ Follow-up → Follow-up
      ├─ Communication intent → Communications
      ├─ Explicit operational requirement → Coordination
      └─ No immediate action
      ↓
Next interaction / continued relationship
```

No branch is required merely because another branch exists.

The system may maintain complex hidden orchestration, but the user experience must remain simple.

---

## 14. Final reconciliation outcome

**Adopted for execution:**

1. **Gate 02 remains the current gate.**
2. **Gate 11 is not merged into Gate 02.**
3. **The 20-gate map remains unchanged.**
4. **Gate 11 scope wording must be corrected so it does not imply ownership of Communications, Notifications, or Operational Work.**
5. **Gate 02 defines the longitudinal contract; Gate 11 later implements its Follow-up-specific portion.**
6. **Gate 12 and Gate 13 retain their own domain/infrastructure ownership.**
7. **The current Follow-up → Notification Queue coupling is recorded as a real Gate 11/Communications integration gap and is not repaired during Gate 02 precheck.**
8. **The current generic Follow-up Next Action → Work Item bridge is recorded as boundary drift and is not repaired during Gate 02 precheck.**
9. **No gate reorder is required by the evidence currently available.**
10. **Gate 02 may now continue to its full current-state longitudinal map, ownership matrix, reality/gap matrix and Product Decision Report using this reconciliation as a binding precheck input.**

---

## 15. Next controlled action

Continue Gate 02 PRECHECK.

The next evidence package should reconcile:

- Patient Identity continuity;
- Visit/Session continuity;
- Treatment Plan progression;
- Appointment handoff;
- Follow-up handoff using this contract;
- financial/resource consequences;
- 42-scenario chain against current implementation;
- Agenda dependency impact;
- runtime/security evidence.

No code/database implementation starts until the complete Gate 02 decision package is ready and explicitly approved.

**End of Gate 02 ↔ Gate 11 reconciliation.**
