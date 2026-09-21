# CORE SYSTEM — CSAPI Gate 02 Product Decision Report

**Date:** 2026-09-21  
**Gate:** Gate 02 — Patient Journey  
**Status:** DECISION READY — PRODUCT OWNER APPROVAL REQUIRED  
**Implementation:** NOT STARTED  
**Production mutation:** NONE

---

## 1. Decision purpose

This report converts the completed Gate 02 precheck into explicit product/architecture decisions.

It does not authorize implementation by itself.

The precheck was completed against:

- current CSAPI Gate 02/Gate 11 documentation;
- approved Patient Journey records;
- current main repository implementation;
- live Supabase schema, functions, constraints and read-only data;
- existing cross-domain implementation contracts;
- 42-scenario traceability material;
- current Patient Flow closure authority.

---

## 2. Current state established

The current system already has the principal pieces required for longitudinal continuity:

```text
Patient
  ↓
Visit / Appointment / Clinical context
  ↓
Treatment Plan / Follow-up / other consequence
  ↓
Agenda / Communications / Coordination / Financial / Resource owners
  ↓
Next interaction
```

No second Patient Journey engine is required.

The current longitudinal relationship is represented through existing canonical records rather than one universal Patient Journey state record.

Live evidence confirms:

- one canonical patient table;
- repeated visits against the same patient;
- strong Visit → Agenda integrity;
- explicit Treatment Plan ↔ Visit linkage;
- explicit Follow-up ↔ Visit linkage;
- independent Communication and Coordination records;
- tenant-consistent cross-domain references in the inspected surface.

---

## 3. Binding decisions proposed for approval

### P1 — Patient Journey continuity model

**Decision:** Adopt a longitudinal integration graph over existing domain-owned records.

Patient Journey is the continuity interpretation across the patient's history and current context. It is not a new database engine that owns all downstream states.

**Resulting rule:**

```text
Patient Journey
    = longitudinal continuity + traceability
    ≠ universal state machine
```

### P2 — Continuation is fan-out, not one scalar Next Action

**Decision:** A completed interaction may produce zero, one or many legitimate continuation consequences.

Supported consequence classes include:

- Treatment Plan progression;
- Appointment requirement;
- Follow-up;
- Review;
- Communication;
- explicit operational work;
- no immediate action.

**Resulting rule:**

> Next Action is a continuity concept describing what may happen next; it is not the universal storage owner of every downstream consequence.

### P3 — Operational Work threshold

**Decision:** A Work Item is created only when an actual operational action, request, handoff, or escalation is required.

The system must not create Work merely because a domain has a next state.

This supersedes any implementation reading in which every Next Action automatically becomes a Coordination Work Item.

### P4 — Follow-up boundary

**Decision:** Follow-up remains an independent CORE Module.

Gate 02 may produce or reference a Follow-up continuity consequence, but Follow-up retains ownership of:

- Follow-up record lifecycle;
- assignment;
- scheduling;
- manual execution;
- automation;
- result/outcome;
- repeated Follow-up decisions;
- Follow-up-specific auditability.

Gate 11 remains a separate gate.

### P5 — Appointment boundary

**Decision:** Agenda remains the sole owner of Appointment lifecycle and scheduling.

Patient Journey, Treatment Plan and Follow-up may express an appointment requirement or continuation intent, but they may not own booking state or implement a second scheduler.

### P6 — Patient Journey has no universal terminal state

**Decision:** Patient Journey remains continuous.

```text
Patient Flow Completed
    ≠
Patient Journey Completed
```

“Completed” is an operational visit-cycle state. Longitudinal patient continuity may continue with another visit, follow-up, plan, review, communication, or simply no immediate action.

### P7 — Patient decision remains explicit and historical

**Decision:** Clinical Recommendations may be multiple and each recommendation may be:

```text
Recommended
   ↓
Patient Decision
   ├── Accepted
   ├── Declined
   └── Deferred
```

Historical decisions remain traceable.

Re-use/reopen is permitted only while the same decision context remains valid. A materially changed context creates a new decision record/context.

---

## 4. Gate ordering decision

**Decision:** Keep the existing 20-gate map unchanged.

No evidence from the Gate 02 precheck justifies:

- merging Gate 11 into Gate 02;
- moving Gate 11 before Gate 02;
- splitting the map;
- creating a new gate.

Gate relationship:

```text
Gate 02
Longitudinal continuity contract
        ↓
Gate 11
Follow-up implementation + bounded integrations
        ↓
Gate 12
Communications
        ↓
Gate 13
Notifications + Operational Work
```

The arrows describe dependency/ownership preparation, not a single runtime state machine.

---

## 5. Gate 11 scope correction

The working gate map now defines Gate 11 as:

> Follow-up lifecycle, retention continuity, scheduling/automation, and controlled integrations with Communications, Agenda and Journey Coordination; one Follow-up engine only.

Gate 11 does not become the owner of:

- Communications;
- Agenda;
- Notification delivery infrastructure;
- Coordination Work Items;
- Patient Journey as a whole.

---

## 6. Known implementation findings that are not Gate 02 implementation

### F1 — Follow-up automation → Notification Queue

Current live automation reaches the notification queue through 'enqueue_followup_notification()'.

This is documented as a later Follow-up/Communications boundary remediation.

It must not be fixed by creating a second communication or notification engine inside Gate 02.

### F2 — Follow-up next-action → Work Item trigger

Current live trigger 'trg_bridge_completed_followup_next_action' can create generic Work from Follow-up next-action metadata.

This is documented as a later Gate 11/Gate 13 boundary correction.

### F3 — Treatment Plan next-stage → Work Item helper

Current 'ensureNextAction()' creates Coordination Work from the next Treatment Plan item after item completion.

This is documented as a Gate 06/Gate 13 boundary reconciliation finding.

The future implementation must keep Work creation conditional on actual operational need.

### F4 — Agenda lifecycle observation

The earlier broad Production workflow has an Agenda-only lifecycle failure after appointment booking and Patient Flow route access.

It remains an external Agenda dependency observation.

Gate 02 must verify the continuity handoff to Agenda but must not silently repair Agenda under this gate.

---

## 7. Gate 02 implementation boundary after approval

### Allowed

After explicit Product Owner approval, Gate 02 may implement only genuine longitudinal-continuity requirements such as:

- canonical continuation references;
- continuity traceability;
- explicit result/decision linkage where currently missing;
- cross-domain integration contracts needed to preserve the longitudinal model;
- authorization/tenant-safe continuity queries;
- runtime evidence for supported continuation paths.

### Not allowed

Gate 02 must not:

- create a Patient Journey engine/table that duplicates existing truth;
- create a Follow-up engine;
- create a scheduler;
- create a Communications engine;
- create a Notification engine;
- create a Work Item engine;
- redefine Patient Flow;
- turn every Next Action into Work;
- make Treatment Plan mandatory for every visit;
- make Follow-up mandatory for visit completion;
- create a universal Journey Completed state.

---

## 8. Verification contract

Gate 02 implementation, once approved, must be verified against the following:

### Core continuity

- one patient remains one patient across repeated Visits/Sessions;
- current interaction remains connected to prior patient context;
- continuation remains traceable to the source interaction.

### Treatment continuity

- Treatment Plan stage progression can produce the correct continuation consequence;
- no universal Work Item is created unless operational work is actually required;
- appointment requirements remain Agenda-owned;
- plan completion does not terminate Patient Journey.

### Follow-up continuity

- Visit/result can create or reference the appropriate Follow-up;
- Follow-up completion can yield another Follow-up, Review, Appointment requirement, Communication intent, explicit Operational Work or no further immediate action;
- Follow-up completion never marks Patient Journey completed;
- repeated follow-up remains attached to the same patient context.

### Communication / work boundaries

- communication intent crosses into Communications without Follow-up owning delivery;
- explicit operational requirement crosses into Coordination without source-domain ownership moving;
- Notification Queue is treated as delivery infrastructure, not proof of communication delivery.

### Security and isolation

- tenant isolation;
- authorization at authoritative boundaries;
- no cross-tenant continuity references;
- no UI-only claims of successful state changes.

### Failure / retry

- failed continuation remains distinguishable from successfully executed continuation;
- retries are idempotent where the owning contract requires it;
- cancellation/no-longer-required actions do not create false completion.

---

## 9. Product Owner approval

**Decision package status:** READY FOR APPROVAL

**Approval required before implementation:** YES

**Approved implementation scope:** To be recorded after approval.

**Approved verification contract:** To be recorded after approval.

---

## 10. Gate status transition

```text
Gate 02
PRECHECK
   ↓
Current-state / ownership / reality / gap reconciliation COMPLETE
   ↓
DECISION READY  ← current state
   ↓
Product Owner Approval
   ↓
Focused implementation
   ↓
Verification
   ↓
Closure
```

**No implementation has started.**