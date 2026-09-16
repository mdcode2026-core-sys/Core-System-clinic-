# CSAPI Gate 01 — Patient Flow Engineering Reconciliation

**Date:** 2026-09-17  
**Status:** PRE-IMPLEMENTATION ENGINEERING AUTHORITY  
**Depends on:** `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`  
**Purpose:** Prevent the historical narrow lifecycle contract from being implemented as the complete Patient Flow model.

## 1. Existing 2026-09-01 engineering specification

`docs/ENGINEERING-SPEC-WORKSPACE-PATIENT-FLOW-2026-09-01.md` remains valid for its Workspace/global-surface decisions and for the principle that Patient Flow owns the workflow/state authority.

However, its explicit execution list:

```text
waiting
in_consultation
pending_close
completed
cancelled
no_show
```

must now be treated as a **historical/currently observed implementation representation**, not as the exhaustive architectural model.

No implementation may infer from that list that:

- Hold is not a first-class Patient Flow condition;
- Transfer is merely a room-id change;
- one Visit equals one clinical work session;
- reception ownership is permanently attached to one user;
- operational closure equals administrative closure;
- cross-day continuation requires a new Visit;
- Follow-up is the mechanism for unresolved Visit continuation.

## 2. Required engineering investigation model

The implementation investigation must map existing repository/database objects to these conceptual layers:

```text
VISIT
  └── complete unresolved clinic work episode

CLINICAL WORK SESSION
  └── discrete clinical/procedural work unit inside Visit

PATIENT FLOW
  ├── Waiting
  ├── Active clinical work
  ├── Hold
  ├── Transfer / continuation
  ├── operational handoff
  └── final lifecycle disposition

JOURNEY COORDINATION
  ├── Task
  ├── Request
  ├── Handoff
  ├── Assignment / reassignment
  └── Escalation

ADMINISTRATION
  ├── correction
  ├── reassignment control
  ├── carry-forward
  ├── exception handling
  └── final administrative closure
```

The same physical table may support more than one conceptual layer only if its semantics remain unambiguous and the ownership boundary is documented.

## 3. Required verification questions

Before implementation, verify:

1. Does `clinic_visit_sessions` represent the Visit container, a Clinical Work Session, or both?
2. Where is the identity of the parent Visit preserved across clinical/procedural work?
3. Can multiple procedures/rooms/actors be represented within one Visit without losing sequence/history?
4. Is Hold represented distinctly from completed/pending-close?
5. Is Transfer represented as a first-class handoff/continuation or merely as a field update?
6. Does Queue movement remain distinct from clinical initiation?
7. Can operational work be reassigned from Receptionist A to B without impersonation?
8. How are operational ownership and administrative ownership represented?
9. What is the exact relationship between `pending_close`, operational closure and administrative closure?
10. How is an unresolved Visit carried to a later operating date?
11. How are procedures, inventory consumption, billing and payments linked to the parent Visit across multiple work sessions?
12. Which permissions authorize each transition/action for Clinical, Operational and Administration users?
13. Can direct client/API writes bypass the intended transition authority?
14. Can audit reconstruct lifecycle, handoff, reassignment and administrative actions?
15. What are the tenant-configurable timing policies and where are they stored?

## 4. Implementation principles

- Reuse existing authoritative records.
- Do not create a second Patient Flow engine.
- Do not create a generic task engine that owns Patient Flow states.
- Do not turn Workspace into an authorization boundary.
- Do not make Queue a substitute for Patient Flow.
- Do not treat `pending_close` as synonymous with final Visit completion.
- Do not use Follow-up as a substitute for unresolved Visit continuation.
- Do not force one Visit per clinical work interaction.
- Do not bind operational continuation permanently to the receptionist who first opened the work.
- Do not permit administrative flexibility to bypass tenant isolation, authorization or auditability.
- Do not add schema objects until a representation gap is demonstrated.

## 5. Clinical UX constraint

Clinical users should not be required to understand internal lifecycle terminology.

The principal clinical completion action should communicate the intended user decision, such as **Finish Clinical Work**, while the Patient Flow engine determines the correct next state/handoff.

Hold and Transfer should be exposed only where relevant to the current context and should remain simple.

## 6. Timing-policy constraint

Short reassignment windows and longer administrative escalation/operational-closure windows are policy configuration, not hard-coded lifecycle definitions.

The previously discussed example values of approximately 5 minutes and 60 minutes are not architectural constants.

Clinic Admin configuration must be inspected before any implementation assumes a fixed duration.

## 7. Verification scenarios

The final implementation verification must include at minimum:

### Arrival
- Scheduled patient.
- Walk-in with no prior record.
- Walk-in with existing patient record.
- Urgent/priority patient.
- Existing Visit continuation.

### Queue
- Reception creates/opens Visit.
- Patient enters Waiting.
- Reception changes queue order/room routing.
- Queue movement does not start clinical work.

### Clinical
- Clinical actor pulls Waiting patient.
- Clinical Work Session begins.
- Finish Clinical Work.
- Hold.
- Resume after Hold.
- Transfer to another room/actor.
- Multiple Clinical Work Sessions inside one Visit.

### Cross-domain
- Additional procedure added after Transfer.
- Consumables linked to the same Visit.
- Financial charges linked to the same Visit.
- Clinical documentation remains attributable to the correct work session/actor.

### Operational
- Clinical handoff to Operations.
- Receptionist A becomes unavailable.
- Authorized reassignment to Receptionist B.
- B continues without entering A's account.
- Audit records the reassignment.

### Cross-day
- Visit remains unresolved at end of day.
- Administrative carry-forward to a later date.
- Same Visit returns to Waiting.
- Clinical work resumes.

### Closure
- Operational closure according to configured policy.
- Administrative review of unresolved work.
- Administrative final closure.
- Correction/reopen path according to authorized policy.

### Follow-up
- Completed Visit creates eligible Follow-up.
- Hold does not create Follow-up.
- Transfer does not create Follow-up merely because a handoff occurred.
- Cross-day continuation does not create Follow-up merely because the date changed.

## 8. Gate condition

No implementation phase may claim Patient Flow architecture complete until the repository/live evidence has been reconciled against the architecture reconciliation document and the above questions/scenarios have evidence.

**End of Engineering Reconciliation.**
