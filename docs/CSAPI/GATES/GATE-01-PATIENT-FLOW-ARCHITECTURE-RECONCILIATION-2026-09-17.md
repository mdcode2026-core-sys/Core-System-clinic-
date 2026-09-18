# CSAPI Gate 01 — Patient Flow Architecture Reconciliation

**Date:** 2026-09-17  
**Status:** APPROVED PRODUCT ARCHITECTURE CLARIFICATION — DOCUMENTATION RECONCILIATION ONLY  
**Scope:** Patient Flow, Visit, Clinical Work Session, Queue, Hold, Transfer, Operational Handoff, Administrative Control  
**Canonical term:** Patient Flow  
**Implementation status:** No code/database/runtime change authorized by this document

## 1. Purpose

This document reconciles the historical Patient Flow architecture and engineering documentation with the Product Owner's clarified real-world clinic workflow on 2026-09-17.

It does not replace the Patient Journey architecture, Agenda, Clinical, Financial & Resources, Workforce & Operations, Team & Access, or Journey Coordination domains. It clarifies how those domains participate in one Patient Flow without duplicating ownership.

The governing principle is:

> **Patient Flow is the clinic's live operational system for moving a patient through the clinic from arrival until administrative closure. A Visit is the container for that journey; clinical work performed during the journey may occur in multiple Clinical Work Sessions.**

## 2. What the historical documentation already got right

The historical architecture is materially aligned with the clarified model in several important ways:

1. Patient Flow is distinct from Patient Journey.
2. Patient Flow begins when the patient enters the clinic, not at first contact or appointment booking.
3. Patient Flow remains the canonical workflow/state authority.
4. Clinical, Operational and Administration are work classifications/work areas, not Roles or permission sets.
5. Clinical and Operational Workspaces consume the Patient Flow authority rather than owning a second state machine.
6. Clinical completion does not automatically mean the entire Visit is completed.
7. `pending_close` was intentionally introduced to separate clinical completion from reception/operational closure.
8. Agenda and Visit are separate bounded contexts.
9. Queue is a mechanism inside Patient Flow, not a replacement for Patient Flow.
10. Handoff is a first-class coordination concept and existing Clinical → Reception behavior is intended to be reused rather than duplicated.
11. Financial/resource domains remain authoritative for billing, inventory and resource truth.
12. Clinic Admin has broader operational oversight and clinic-level authority.

These existing decisions remain valid.

## 3. Required clarification: Visit is the journey container

The historical documentation used **Visit** as the canonical user-facing term but did not fully state the required distinction between a Visit and one clinical work interaction.

For current architecture:

> **Visit is the canonical container for the patient's actual clinic journey/work episode. It remains open while the patient still has unresolved clinical, operational or administrative work related to that episode.**

A Visit may span:

- scheduled appointment arrival;
- walk-in arrival;
- unscheduled patient with an existing record;
- urgent/emergency arrival;
- multiple rooms;
- multiple clinical staff;
- multiple procedures;
- additional procedures or consumables discovered during the journey;
- investigations performed inside or outside the clinic;
- temporary suspension/Hold;
- return to the clinic on a later day to continue the same unresolved Visit;
- operational/financial/reception processing;
- administrative correction or final closure.

A later return to complete an unresolved Visit is **not automatically a new Visit and is not automatically a Follow-up**.

## 4. Clinical Work Session

To avoid conflating CORE's user-facing **Visit** with the external medical-standard term **Encounter**, the internal architectural concept used by this reconciliation is:

> **Clinical Work Session** — one discrete unit of clinical/procedural work performed for the patient inside an existing Visit.

A Visit may contain zero, one, or multiple Clinical Work Sessions.

Examples:

```text
Visit #100
  ├── Clinical Work Session 1 — Doctor consultation
  ├── Hold — external imaging
  ├── Clinical Work Session 2 — Laser room
  │     ├── Procedure A
  │     ├── Additional procedure B
  │     └── Consumables
  ├── Transfer
  └── Clinical Work Session 3 — Doctor review / final assessment
```

This does not require a new database table merely because the concept is documented. The implementation investigation must first determine whether existing session/visit/procedure records already represent this separation and whether an extension is sufficient.

`Encounter` remains an interoperability/medical-standard mapping term under the terminology governance unless a later explicit architecture decision changes that rule.

## 5. Arrival and Waiting

Patient arrival is an operational entry action, not clinical initiation.

The canonical initial operational path is:

```text
Patient arrives
    ↓
Operational registration / Visit opening
    ↓
WAITING
```

Waiting means:

> The patient is present in the clinic and available for the next authorized step, but clinical work has not yet been started for the current work session.

Reception/Operational users may:

- register scheduled patients;
- register walk-ins;
- identify an existing patient record;
- handle urgent/priority situations;
- arrange queue order;
- route the patient to an appropriate waiting/room queue;
- return a patient to Waiting after Hold/transfer when appropriate.

Reception does **not** start clinical work merely by moving a patient through the queue.

A queue movement is not equivalent to starting a Clinical Work Session.

## 6. Clinical start

A Clinical user who is authorized for the relevant work pulls the patient from Waiting and starts the Clinical Work Session.

The clinical actor may be a doctor, specialist, room owner/operator, or another authorized clinical/procedural user according to the clinic's permissions and configuration.

The operational role is not required to initiate the clinical work merely because it placed the patient in the queue.

## 7. Finish Clinical Work

The user-facing clinical action should remain simple.

The canonical concept is:

> **Finish Clinical Work** — the current clinical/procedural work session has ended for this actor; the system determines the appropriate next operational path.

This action does **not** inherently mean:

- Visit Completed;
- Administrative Closure;
- patient journey finished;
- Follow-up created;
- new appointment created.

Depending on the context, finishing the current Clinical Work Session may result in:

- operational/reception handoff;
- another Clinical Work Session through Transfer;
- a Hold/continuation path;
- another Queue placement;
- another domain action required before the Visit can continue.

The UI should expose only the decision the clinical user needs to make, not the internal state-machine vocabulary.

## 8. Hold

**Hold is a first-class Patient Flow condition.**

Hold means:

> Clinical work for the current Visit is temporarily suspended, while the Visit itself remains unresolved/open.

Typical causes include:

- external imaging;
- laboratory investigation;
- waiting for results;
- procedure dependency;
- patient temporarily leaving the clinic;
- physician-directed return at a later time/day;
- any other clinically or operationally valid interruption that does not constitute final Visit completion.

Hold must allow the clinical actor to work on another eligible patient rather than remaining blocked by the held patient.

When the patient returns, the Visit may return to Waiting so the patient can re-enter the appropriate queue and resume through another Clinical Work Session.

Hold is not Follow-up and is not Completed.

## 9. Transfer

Transfer means that the current work requires another authorized actor, room or clinical/procedural context.

Examples:

```text
Doctor → Laser Room
Doctor → Specialist
Room → Doctor
Clinical work → Imaging
Imaging → Clinical review
```

Transfer preserves the identity and history of the parent Visit.

A transfer may create or continue a separate Clinical Work Session within that Visit.

The receiving work may add:

- procedures;
- services;
- consumables;
- clinical findings;
- financial charges;
- inventory movements;
- other domain-owned records.

Those records remain authoritative in their owning domains while remaining linked to the same Visit context.

## 10. Operational handoff and reception ownership

After clinical work reaches an appropriate operational handoff point, the patient becomes operational work rather than remaining permanently attached to the individual receptionist who first handled the patient.

Example:

```text
Clinical Work Finished
        ↓
Operational Work Queue
        ↓
Receptionist A
        ↓
A becomes unavailable / cannot continue
        ↓
Administrative or configured reassignment mechanism
        ↓
Receptionist B
        ↓
Continue operational processing
```

B must not impersonate or enter A's account. The system must transfer work ownership/context through an authorized handoff/reassignment mechanism and preserve audit history.

Journey Coordination owns generic work/handoff mechanics; Patient Flow remains authoritative for the patient lifecycle semantics.

## 11. Operational timing policies

Operational timing rules such as a configured short reassignment window or longer administrative escalation window are **tenant-configurable control policies**, not immutable Patient Flow states.

The example discussed on 2026-09-17 is:

```text
T0  Clinical Work Finished / Hold
    ↓
T+configured short interval
    Work may become eligible for reassignment or broader operational handling
    ↓
T+configured longer interval
    Work may become Administrative Pending / operationally closed for daily-flow purposes
```

The previously observed values of approximately 5 minutes and 60 minutes are examples of the intended control mechanism, not architectural constants.

Clinic Admin must be able to configure/enable the relevant policies within the product's subscription and control model.

The policy exists to prevent operational blockage, not merely to compensate for human forgetfulness.

## 12. Operational close vs Administrative close

The architecture must distinguish:

### Operational closure

The Visit is removed from the active daily operational queue/workload so it does not contaminate current-day execution, appointment/queue calculations, or normal reception work.

Operational closure may be automatic according to configured policy.

### Administrative closure

The Visit is finally closed under the clinic's administrative authority after the system has ensured that required clinical, operational, financial, inventory, documentation and exception handling are complete or appropriately dispositioned.

Administrative closure may include correction, reassignment, reopening or carry-forward decisions where permitted by the clinic's authority model.

Therefore:

> **Automatic operational closure is not equivalent to final administrative closure.**

## 13. End-of-day continuation

A Visit in Hold or another unresolved continuation state must not be forcibly converted into a new Follow-up merely because the clinic day ended.

Where the patient must return on a later day to complete the same unresolved work:

```text
Open Visit
   ↓
Administrative carry-forward / continuation decision
   ↓
Future operating date
   ↓
Waiting / appropriate operational entry
   ↓
Clinical Work Session resumes
```

This is an administrative/operational continuation decision, not a new medical Follow-up unless the clinical workflow separately creates one.

## 14. Follow-up boundary

Follow-up remains a distinct patient-continuity domain.

The normal trigger point for Visit follow-up automation is after the Visit reaches its authoritative completed state.

However:

- Hold is not Follow-up.
- Transfer is not Follow-up.
- Continuation of an unresolved Visit is not Follow-up.
- Return to complete the same Visit is not automatically a new appointment.
- A genuine future review after Visit completion may create Follow-up and/or a new Appointment according to the Follow-up/Agenda domains.

## 15. Administrative control plane

Administration is not merely another reception queue.

The Administration Workspace provides the clinic-level control surface for authorized exception handling and workflow governance, including cases such as:

- correcting registration mistakes;
- resolving forgotten or incomplete operational actions;
- reassigning work between operational users;
- carrying an unresolved Visit into a later operating date;
- correcting workflow data;
- handling operational exceptions;
- reopening or adjusting a Visit where the clinic's authority model permits it;
- completing administrative closure decisions.

Administrative flexibility must not become an unlogged security bypass. Sensitive administrative actions remain authenticated, tenant-scoped, permission-controlled and auditable.

The exact scope of administrative reopening/correction remains an implementation/governance control to be hardened progressively using real clinic operating evidence.

## 16. Cross-domain ownership

| Concept | Canonical owner |
|---|---|
| Patient Journey semantics | Patient Journey / relevant patient-care domains |
| Patient Flow lifecycle and patient movement | Patient Flow / Queue domain |
| Queue ordering and movement | Patient Flow / Operational workflow |
| Clinical Work Session content | Clinical / Procedure domains |
| Visit container | Visit / Patient Flow context |
| Appointment | Agenda |
| Procedures / services | Clinical / Medical Master / relevant domain |
| Inventory / consumption | Financial & Resources |
| Billing / payments | Financial & Resources |
| Staff authorization | Team & Access |
| Availability / workforce reality | Workforce & Operations |
| General Task / Request / Handoff mechanics | Journey Coordination |
| Follow-up rules | Follow-up |
| Notifications / messages | Communications / Notifications |
| Administrative clinic governance | Clinic Admin / Administration architecture |

No domain should create a shadow copy of another domain's authoritative lifecycle.

## 17. Canonical conceptual flow

```text
PATIENT ARRIVAL
      ↓
OPEN / IDENTIFY VISIT
      ↓
WAITING
      │
      ├───────────────┐
      │               │
      ▼               ▼
   ACTIVE          PRIORITY / ROUTING
      │               │
      └───────┬───────┘
              ▼
     CLINICAL WORK SESSION
              │
       ┌──────┼───────────┐
       │      │           │
       ▼      ▼           ▼
    FINISH   HOLD      TRANSFER
       │      │           │
       │      ▼           ▼
       │   WAITING   NEW/CONTINUED
       │      │      WORK SESSION
       │      └───────┬───┘
       │              │
       └──────────────┘
              │
              ▼
      CLINICAL WORK FINISHED
              │
              ▼
      OPERATIONAL WORK QUEUE
              │
        ┌─────┴─────┐
        ▼           ▼
   Reception     Admin Control
        │           │
        └─────┬─────┘
              ▼
    OPERATIONAL CLOSURE
              │
              ▼
 ADMINISTRATIVE FINALIZATION
              │
              ▼
         COMPLETED VISIT
              │
              ▼
      FOLLOW-UP / NEXT CARE
```

This is a conceptual model. It must not be implemented as a literal database enum/state list until the existing repository and live database representation are reconciled against it.

## 18. Architectural consequences for Gate 01

The Gate 01 investigation must now verify the existing system against these separate concepts:

1. Visit container vs individual Clinical Work Session.
2. Waiting vs clinical initiation.
3. Queue movement vs clinical initiation.
4. Hold as an unresolved Visit condition.
5. Transfer as continuation of the same Visit with potentially distinct work sessions.
6. Operational handoff/reassignment independent of individual receptionist ownership.
7. Operational closure vs administrative closure.
8. End-of-day carry-forward of unresolved Visits.
9. Follow-up only after authoritative completion unless a separate explicit rule applies.
10. Administrative control and correction boundaries.
11. Procedure, inventory and financial records remaining linked to the same Visit context.
12. Tenant-configurable timing policies for reassignment/escalation/operational closure.
13. A single authoritative Patient Flow mutation path that prevents direct lifecycle bypass.
14. Auditability of lifecycle, handoff, reassignment and administrative control actions.

## 19. Implementation gate

No implementation is authorized merely because this reconciliation exists.

The next engineering step is evidence reconciliation:

```text
Historical architecture
        ↓
Current repository implementation
        ↓
Live database / RLS / triggers
        ↓
Current UI/workspaces
        ↓
Canonical Patient Flow model above
        ↓
Documented gaps / matches / drift
        ↓
Implementation decisions
```

No code, migration, permission change, cleanup or production change is part of this document.

**End of Patient Flow Architecture Reconciliation.**
