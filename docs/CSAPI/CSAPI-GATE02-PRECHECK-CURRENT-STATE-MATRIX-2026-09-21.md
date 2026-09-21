# CORE SYSTEM — CSAPI Gate 02 Precheck: Current-State Longitudinal Matrix

**Date:** 2026-09-21  
**Gate:** Gate 02 — Patient Journey  
**Status:** PRECHECK IN PROGRESS — CURRENT-STATE EVIDENCE RECORDED  
**Implementation:** NOT STARTED  
**Production mutation:** NONE

---

## 1. Purpose

This document records the current longitudinal Patient Journey state from the repository and live Supabase evidence.

It is a precheck evidence artifact. It does not authorize implementation and does not close Gate 02.

The current Gate 02 objective is:

> Prove how CORE SYSTEM preserves one longitudinal patient context across repeated interactions while each domain remains the owner of its own truth.

---

## 2. Canonical longitudinal model

The current reconciled model is:

```text
Patient Identity
    ↓
Service / Procedure / Clinical Intent
    ↓
Appointment / Agenda (when scheduling is required)
    ↓
Arrival
    ↓
Patient Flow / Visit
    ↓
Clinical Work + Clinical Decision
    ↓
Clinical Recommendations / Treatment Plan (when applicable)
    ↓
One or more continuation consequences
    ├── Treatment Plan progression
    ├── Appointment requirement → Agenda
    ├── Follow-up → Follow-up Module
    ├── Review
    ├── Communication intent → Communications
    ├── Explicit operational requirement → Journey Coordination
    └── No immediate action
    ↓
Next interaction / continued patient relationship
```

This is a conceptual continuity graph, not a universal state machine.

Patient Flow completion closes the current in-clinic operational cycle only. It does not terminate Patient Journey.

---

## 3. Entity and ownership map

| Continuity concern | Canonical record / mechanism | Owner | Current evidence | Current interpretation |
|---|---|---|---|---|
| Patient identity | `clinic_patients` | Patient / Identity | 391 active/non-deleted patient records observed | Single patient anchor |
| Repeated visits | `clinic_visit_sessions.patient_id` | Patient Flow / Clinical | 139 visits; 55 patients have >1 visit; maximum observed = 3 | Longitudinal relation exists |
| Appointment | `master_agenda_events` | Agenda | 337 active/non-deleted events; 138 completed | Agenda remains scheduling truth |
| Visit → Appointment | `clinic_visit_sessions.agenda_event_id` | Patient Flow/Agenda integration | 138/139 visits have an Agenda event; 0 broken/mismatched patient links | Strong current continuity link |
| Clinical plan | `clinic_treatment_plans` | Clinical / Treatment Plan | 8 plans; 3 active; 1 completed | Plan layer exists |
| Plan stage | `clinic_treatment_plan_items` | Treatment Plan | 4 items; 3 completed; 1 actionable | Stage progression exists but evidence dataset is small |
| Plan ↔ Visit | `clinic_treatment_plan_visits` | Treatment Plan | 3 links; 0 broken plan/visit links | Explicit return path exists |
| Follow-up | `retention_followups` | Follow-up | 813 records; 0 broken patient/session links | Independent continuity capability exists |
| Follow-up ↔ Visit | `retention_followups.session_id` | Follow-up | 0 broken session links | Visit context preserved without making Follow-up mandatory |
| Communication | `communication_* ` | Communications | 17 communication requests; 16 linked to work | Independent communication authority exists |
| Operational work | `operational_work_items` | Journey Coordination | 17 rows; current live data mainly synthetic/demo plus one follow-up-sourced task | Coordination remains separate |
| Financial continuity | `financial_plans`, invoices/payments | Financial | 1 financial plan; 138 invoices | Financial records are patient-linked and may optionally reference Treatment Plan |
| Resources | inventory/procedure/session links | Inventory / Resources | Existing cross-domain implementation and provenance path | Downstream consequence, not PJ owner |
| Patient Portal | Portal access/communication surfaces | Portal as patient-facing surface | Existing optional Portal architecture | Must remain optional and must not own journey truth |

---

## 4. Current database relationship evidence

### 4.1 Patient → repeated Visits

Live Supabase read-only verification:

- 391 active/non-deleted patients.
- 139 non-deleted visit sessions.
- 55 patients have multiple visit sessions.
- Maximum observed visits for one patient = 3.

This is direct evidence that the current data model can represent repeated interactions against one patient identity.

### 4.2 Visit → Agenda

Live verification:

- 138 of 139 non-deleted visit sessions have an `agenda_event_id`.
- 1 visit has no Agenda event, consistent with the existing walk-in/non-prebooked possibility.
- 0 broken Visit → Agenda references.
- 0 patient mismatches between a Visit and its linked Agenda event.

This supports:

```text
Appointment (when present) → Visit
```

without moving appointment ownership into Patient Flow.

### 4.3 Visit → Follow-up

Live verification:

- 813 non-deleted Follow-up rows.
- 0 Follow-up rows with a populated `session_id` pointing to a missing/mismatched Visit.

The repository implementation also validates that a Follow-up's optional visit context belongs to the same tenant and patient.

### 4.4 Treatment Plan → Visits

Live verification:

- 8 Treatment Plans.
- 4 Treatment Plan Items.
- 3 Treatment Plan ↔ Visit links.
- 0 broken Treatment Plan ↔ Visit links.
- 0 broken Treatment Plan Item ↔ Plan links.

The existing Treatment Plan implementation also validates same-patient linking before adding a Plan ↔ Visit relationship.

### 4.5 Treatment Plan → Financial

Current schema permits `financial_plans.treatment_plan_id` to be nullable.

Live verification:

- 1 Financial Plan.
- 0 currently linked to a Treatment Plan.
- 0 patient mismatches among inspected linked records.

This is **not** classified as a defect. Financial planning may exist independently of a Treatment Plan and should not be made artificially dependent.

---

## 5. Patient Flow boundary inherited into Gate 02

The proven Gate 01 lifecycle is:

```text
Reception
 → Waiting
 → Clinical Pull
 → Clinical Work
 → Finish
 → Pending Close
 → Reception Completion
 → Completed
```

Gate 02 therefore starts from the continuity meaning of a completed/closed **current visit cycle**, not from a new Patient Flow state.

No Gate 02 implementation may alter:

- Waiting semantics;
- Clinical Pull;
- clinical Finish;
- Pending Close;
- Reception completion;
- Patient Flow ownership.

---

## 6. Treatment Plan → Next Action current implementation

The current Treatment Plan implementation contains an `ensureNextAction()` helper.

When a Treatment Plan item is completed, the current code:

1. finds the next actionable item;
2. creates an `operational_work_items` record with `kind = next_action`;
3. uses the item date to infer a booking requirement;
4. creates a work-history row.

This is evidence of a working continuation mechanism, but it is also a current boundary issue.

### Reconciled interpretation

The current CSAPI decision already establishes:

> Next Action is not automatically a Work Item.

Therefore the existing Treatment Plan helper must not be interpreted as the universal future architecture. It represents one currently implemented path that must be reconciled with the newer ownership contract.

**Classification:** Gate 02 dependency / Gate 06 + Gate 13 boundary finding.

**No fix is authorized in the Gate 02 precheck.**

The later correction must preserve the following distinction:

```text
Clinical/Treatment Plan next intended step
          ↓
Determine actual required consequence
          ├── appointment → Agenda
          ├── follow-up → Follow-up
          ├── explicit operational action → Coordination Work
          └── no immediate operational work
```

---

## 7. Follow-up current implementation

Follow-up is a real independent module, not a view over another engine.

Current repository evidence:

- `src/domain/followup/`
- `src/features/followup/`
- `retention_followups`
- `followup_automation_rules`
- Follow-up-specific permission boundary
- manual + automated execution modes
- result/outcome/next-action metadata
- optional Visit linkage

Current action types include call, WhatsApp, SMS, email, appointment, review and general.

The current UI exposes a simple user-facing completion model such as:

- Next step
- No further action
- Follow up again

This is consistent with the product principle that the complex orchestration remains behind the UI.

---

## 8. Follow-up boundary findings

### F-02-11-A — Follow-up → notification queue residual coupling

The active database function `enqueue_followup_notification()` directly inserts into `notification_queue`, and `run_followup_automation()` calls it.

Live evidence:

- 812 total notification queue rows.
- 623 tagged with `communication_source = followup`.
- 744 carry a Follow-up identifier in metadata.

**Classification:** Later owning-domain remediation (Gate 11 / Gate 12 integration).

The fact that the queue is populated is not evidence of successful communication delivery.

### F-02-11-B — Follow-up next-action → Work Item bridge is too broad

The active trigger `trg_bridge_completed_followup_next_action` calls `bridge_completed_followup_to_next_action()`.

The function can create a generic operational Work Item whenever a completed Follow-up contains `next_action_at` or `next_action_type`.

No currently inspected Follow-up row has a populated `next_action_type`, so the live dataset does not currently demonstrate the defect in execution.

**Classification:** Later owning-domain remediation (Gate 11 / Gate 13 integration).

---

## 9. Agenda dependency

The Gate 01 broad production smoke workflow observed an Agenda-only lifecycle failure after successful:

- exact candidate resolution;
- authentication;
- Patient Flow route access;
- appointment booking.

The failure occurred while locating the created patient/appointment inside the Agenda lifecycle subscenario.

Current Gate 02 consequence:

- Agenda remains a direct dependency for any future continuation that becomes an Appointment.
- Gate 02 must prove the handoff contract into Agenda.
- Gate 02 must not repair Agenda unless its evidence demonstrates a direct Gate 02 continuity contract failure and the scope is explicitly approved.

**Classification:** External Agenda dependency observation carried into Gate 02.

---

## 10. Forty-two scenario reconciliation

The existing 42-scenario documentation identifies the following scenarios as directly relevant to Gate 02 continuity:

| Scenario | Existing documented state | Gate 02 interpretation |
|---|---|---|
| 2 Existing patient recognition | Implemented/documented | Identity continuity evidence |
| 4 Pre-booked arrival/check-in | Implemented/documented | Agenda → Visit continuity |
| 6 Service/procedure selection + next action | Implemented/documented | Continuation fan-out |
| 7 Standard appointment booking | Implemented/documented | Agenda-owned appointment |
| 12 Confirmation + communication | Implemented/documented | Communications remains owner |
| 15 Entry into clinical visit | Implemented/documented | Appointment → Visit |
| 18 Clinical decision creates Treatment Plan | Implemented/documented | Clinical/PJ ownership |
| 19 Multi-stage/multi-session Treatment Plan | Implemented/documented | Longitudinal progression |
| 20 Treatment stage produces Next Action | Implemented/documented | Must be interpreted conditionally, not as universal Work |
| 21 Next Action requires future appointment | Implemented/documented | Handoff to Agenda |
| 22 Completed procedure advances Treatment Plan | Implemented/documented | Plan progression after actual result |
| 23 Treatment Plan planned completion | Implemented/documented | Plan closure, not Patient Journey closure |
| 40 Procedure consumption → inventory | Implemented/documented | Downstream resource consequence |
| 41 Domain event → operational work | Implemented/documented | Coordination-owned work |
| 42 Completed visit → follow-up / next journey action | Implemented/documented | Primary Gate 02 continuity scenario |

The documentation says these scenarios are implemented, but Gate 02 must still distinguish **documented implementation** from **current exact runtime proof**.

Therefore the 42-scenario material is a traceability baseline, not by itself Gate 02 closure evidence.

---

## 11. Current reality classification

### Working / aligned

- One canonical Patient identity anchor.
- Repeated Visits linked to the same patient.
- Appointment remains Agenda-owned.
- Visit → Appointment linkage is currently structurally healthy.
- Follow-up is independently represented and linked to Visit.
- Treatment Plan has explicit Plan/Item/Visit relationships.
- Financial Plan may independently exist without forcing Treatment Plan dependency.
- Communications and Coordination are separate implementations.
- Patient Flow lifecycle remains authoritative and closed from Gate 01.

### Working but structurally constrained

- Treatment Plan completion currently materializes a generic Coordination Work Item for a next stage.
- Follow-up completion can materialize generic Coordination Work through a trigger if next-action metadata is populated.
- Follow-up automation still reaches Notification Queue directly.

### Data-evidence limited

- Treatment Plan dataset is small (8 plans, 4 items, 3 plan/visit links).
- Only 1 Financial Plan currently exists.
- Current Follow-up data do not exercise the generic next-action Work bridge because no inspected Follow-up has a populated `next_action_type`.
- The current evidence therefore cannot be used to claim that all longitudinal branches have been runtime-proven.

### Explicitly optional

- Patient Portal.
- Medical Photos as a non-blocking capability.
- Treatment Plan for visits that do not require an ongoing plan.
- Future Appointment when no appointment is clinically/operationally determined yet.

---

## 12. Gate 02 gap matrix

| Gap | Current reality | Owner | Gate 02 action | Status |
|---|---|---|---|---|
| Longitudinal continuity contract | Exists across several canonical tables | Gate 02 | Define canonical integration contract | **IN SCOPE** |
| Universal Next Action model | No valid universal model; several older implementations materialize Work | Gate 02 + Gate 06/13 | Freeze conditional fan-out rule | **IN SCOPE / DEPENDENCY** |
| Treatment Plan next-stage Work bridge | Current implementation creates generic Work | Gate 06 + Gate 13 | Reconcile later; do not duplicate engine | **DEFERRED** |
| Follow-up automation → queue | Current implementation directly inserts queue rows | Gate 11 + Gate 12 | Reconcile ownership later | **DEFERRED** |
| Follow-up → Work bridge | Trigger creates Work from next-action metadata | Gate 11 + Gate 13 | Reconcile explicit-work requirement later | **DEFERRED** |
| Appointment handoff proof | Structural links exist; earlier Agenda runtime smoke had a failure | Gate 02 + Agenda | Include exact dependency proof in verification contract | **OPEN** |
| Repeated-visit identity | Current DB supports it and live data exercise it | Patient/Identity + Gate 02 | Validate representative multi-visit scenarios | **IN SCOPE** |
| Full 42-scenario runtime proof | Documentation says implemented; exact current runtime proof is not yet complete | Owning gates + Gate 02 | Use as traceability; prove relevant continuity scenarios | **OPEN** |
| Patient Journey terminal state | No universal terminal state | Gate 02 | Preserve continuous relationship model | **CLOSED AS DECISION** |

---

## 13. Gate 02 ownership matrix

| Output / transition | Source truth | Receiving owner | Gate 02 responsibility |
|---|---|---|---|
| Patient identity | Patient | Patient/Identity | Verify stable patient anchor |
| Appointment requirement | Clinical/PJ/Treatment context | Agenda | Define requirement/handoff only |
| Appointment lifecycle | Agenda | Agenda | Reference, never own |
| Visit lifecycle | Patient Flow | Patient Flow | Consume completed result, never redefine |
| Clinical decision | Clinical | Clinical | Consume as continuity input |
| Treatment plan | Treatment Plan | Treatment Plan/Clinical | Preserve plan relationship |
| Follow-up | Follow-up | Follow-up | Define how continuity reaches Follow-up |
| Communication intent | Source domain | Communications | Define intent handoff |
| Operational work | Coordination | Coordination | Require explicit operational need |
| Financial consequence | Financial | Financial | Reference consequence, never own financial state |
| Resource consumption | Inventory/Resources | Inventory/Resources | Preserve provenance |
| Portal presentation | Domain-owned data | Portal | Optional surface, never journey owner |

---

## 14. Product Decision candidates required after remaining precheck evidence

The following are the material choices Gate 02 must settle before implementation approval:

### Decision P1 — Continuity representation

Adopt a **longitudinal integration graph** across existing canonical records rather than introduce a monolithic Patient Journey state table/engine.

### Decision P2 — Continuation fan-out

A completed interaction may yield zero, one or many consequences. No universal scalar Next Action may absorb them.

### Decision P3 — Work creation threshold

Operational Work exists only when an explicit operational action, request, handoff, or escalation is required.

### Decision P4 — Follow-up boundary

Follow-up is an independent module. Gate 02 defines when continuity delegates to Follow-up; Gate 11 owns Follow-up mechanics and later boundary remediation.

### Decision P5 — Appointment boundary

Appointment lifecycle remains Agenda-owned. Gate 02 may reference and request an appointment but must never implement scheduling.

### Decision P6 — Journey completion

Patient Journey has no universal Completed/Closed terminal state. “Completed” remains a Patient Flow/visit-cycle concept.

### Decision P7 — Patient agency

Clinical Recommendations may be accepted, declined or deferred per recommendation, with decision history retained.

These decisions are already reflected in the CSAPI ledger where explicitly adopted; any remaining unresolved choice must be surfaced in the final Product Decision Report rather than inferred from implementation behavior.

---

## 15. Current precheck conclusion

**Gate 02 remains structurally valid as the current gate.**

The evidence does **not** justify merging Gate 11 into Gate 02 or reordering the 20-gate map.

The current Gate 02 work is therefore:

```text
Current longitudinal evidence
        ↓
Ownership / boundary reconciliation
        ↓
Decision Report
        ↓
Product Owner approval
        ↓
Focused implementation only where a genuine Gate 02 gap exists
```

The current architecture is not missing a second Patient Journey engine. The principal remaining problem is that older implementations sometimes materialize a Coordination Work Item as though every Next Action were operational work, and Follow-up automation still has residual queue coupling.

Those are boundary-remediation findings for their owning gates. They must not be solved by expanding Gate 02 into a replacement engine.

---

## 16. Remaining Gate 02 precheck work

Before marking Gate 02 **DECISION READY**, complete:

1. Exact implementation trace for Patient Identity → Visit → Plan/Follow-up → continuation.
2. Relevant current test/runtime evidence for scenarios 20, 21, 22, 23 and 42.
3. Exact Agenda dependency impact classification.
4. Duplicate-engine audit across PJ, Treatment Plan, Follow-up, Communications and Coordination.
5. Final gap separation: true Gate 02 defect vs later-gate remediation.
6. Product Decision Report with only genuine choices.
7. Verification/closure contract.

No application or production database change is authorized before these are complete and the Product Owner approves the decision package.

**End of current-state matrix.**


## 17. Duplicate-engine audit

The current evidence does not identify a second Patient Journey engine, but it does identify multiple **continuation materialization paths** that must remain conditional and domain-owned:

- Patient Flow owns the in-clinic visit lifecycle.
- Treatment Plan has a next-stage helper that currently materializes a Coordination Work Item.
- Follow-up has a trigger that can materialize a Coordination Work Item.
- Coordination owns the Work Item store and lifecycle.
- Agenda owns appointment scheduling.
- Communications owns communication requests/messages.
- Notification Queue remains delivery infrastructure.

These are not evidence of multiple Patient Journey engines. They are evidence that older cross-domain bridges need contract reconciliation so that one user-facing continuity concept does not become several competing backend owners.

The Gate 02 architectural target is therefore **one continuity model over multiple domain-owned records**, not one universal continuity table/engine.

## 18. Precheck status after this evidence pass

**Current state:** Gate 02 remains OPEN — PRECHECK.

**Evidence completed so far:**
- Gate 02 ↔ Gate 11 boundary reconciliation;
- current entity/ownership map;
- live patient/visit/appointment/treatment/follow-up/financial relationship evidence;
- current Follow-up and Treatment Plan boundary findings;
- 42-scenario continuity traceability classification;
- duplicate-engine audit baseline.

**Still required before DECISION READY:**
- exact current implementation traces for the remaining relevant continuation paths;
- targeted automated/runtime evidence available without Vercel or production mutation;
- final Agenda dependency classification;
- final separation of Gate 02 defects from Gate 06/11/12/13/18 findings;
- Product Decision Report;
- verification/closure contract.
