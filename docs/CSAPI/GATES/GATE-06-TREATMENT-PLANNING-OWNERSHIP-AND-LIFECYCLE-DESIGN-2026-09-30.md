# CSAPI Gate 06 — Treatment Planning — Ownership & Lifecycle Design
## 2026-09-30

**Status:** Design draft for implementation-readiness

## 1. Canonical ownership
Treatment Plan is the authoritative source for:
- treatment-plan identity and patient association;
- plan lifecycle state;
- ordered plan stages/items;
- stage lifecycle state;
- plan completion/cancellation/hold semantics;
- plan-to-visit relationship semantics;
- plan next-action intent.

Other domains remain authoritative for their own consequences.

| Concern | Owner | Gate 06 relationship |
|---|---|---|
| Visit lifecycle | Patient Flow / Visit | consumes/links plan context |
| Clinical decision/recommendation | Clinical / Gate 05 | source input to plan |
| Appointment | Agenda / Gate 04 | books when plan action requires appointment |
| Operational work | Coordination | stores derived next-action work |
| Follow-up/retention | Gate 11 | consumes eligible continuity outcomes |
| Procedure definition | Gate 07 | source of procedure identity/requirements |
| Package/commercial commitment | Gates 07/08 | optional commercial linkage |
| Workforce eligibility | Gate 09 | consumed indirectly through Agenda |
| Patient identity | Gate 03 | patient reference only |

## 2. Plan lifecycle
Canonical plan states:
- draft — being authored; not yet active;
- active — authoritative plan in force;
- on_hold — intentionally paused;
- completed — plan lifecycle fulfilled/closed;
- cancelled — intentionally terminated.

Canonical transition policy:
- draft → active;
- active → on_hold;
- on_hold → active;
- active → completed;
- draft/active/on_hold → cancelled.

No direct arbitrary status jumps are authorized.

Completion requires a defined completion condition, not merely a UI click. The implementation must establish one deterministic rule and verify it. The planning baseline is: a plan may complete only when no required stage remains in an actionable state, unless an authorized explicit completion override is part of the product policy and is audited.

## 3. Stage/item lifecycle
Canonical stage states:
- planned;
- scheduled;
- in_progress;
- completed;
- skipped;
- cancelled.

A stage is not considered completed merely because an appointment was booked or a visit was linked.

Baseline transitions:
- planned → scheduled;
- planned → in_progress only for valid walk-in/unscheduled execution;
- scheduled → in_progress;
- in_progress → completed;
- planned/scheduled/in_progress → skipped or cancelled only under explicit transition rules;
- no reopening of completed/cancelled stages without an explicit corrective lifecycle rule.

A visit link records a relationship between a visit and a stage; it does not itself assert clinical completion.

## 4. Next-action contract
A completed stage may emit a **derived next-action intent**.

Treatment Plan owns the intent; Coordination owns the work item.

The intent must be explicit rather than inferred from `planned_date`. The planning model should support at minimum:
- no next action;
- book appointment;
- perform operational action;
- follow-up/relationship action;
- clinical review/decision required.

Gate 06 does not execute these consequences. It emits a typed source event/consequence request consumed by the owning domain.

The existing `operational_work_items` record remains the coordination representation when operational work is required.

## 5. Visit linkage
A plan-stage/visit link must preserve:
- tenant;
- plan;
- optional stage;
- visit;
- actor;
- timestamp;
- relationship provenance.

Linking a visit does not automatically complete a stage. Completion is driven by the stage lifecycle and the authoritative clinical/operational outcome.

## 6. Agenda integration
When a stage requires an appointment:
1. Treatment Plan identifies the next-action intent as booking-required.
2. Coordination may expose a booking work item.
3. Agenda receives the booking context.
4. Agenda creates/owns the appointment.
5. Treatment Plan may later consume the appointment/visit relationship through explicit linkage.
6. No Treatment Plan code writes `master_agenda_events`.

## 7. Clinical integration
Gate 05 may provide:
- source clinical decision;
- recommendation;
- patient decision.

Gate 06 may reference those sources where durable provenance is needed.

Gate 06 does not decide whether a clinical recommendation is medically correct and does not finalize clinical records.

## 8. Package / financial integration
Gate 06 may reference package/commercial context where it exists, but it does not own commercial commitment, invoice, payment, consumption or financial-plan state.

Package availability cannot silently become a clinical lifecycle rule.

## 9. Follow-up integration
A plan outcome may become a Follow-up source, but Gate 06 does not own follow-up scheduling, communication, retention or review.

The absence of a Follow-up record must never mean the plan is incomplete.

## 10. Patient choice
Existing CSAPI decisions remain binding:
- patient choice governs procedures/plan decisions;
- declined care is not forced;
- a new decision may be created when a previously declined commercial/clinical offer is materially different;
- an active offer may reopen a decision only under the established decision/history rules.

Gate 06 preserves those rules and does not convert them into automatic plan activation.

## 11. No duplicate engine rule
Gate 06 must not create:
- a second appointment scheduler;
- a second follow-up engine;
- a second operational-work engine;
- a second clinical decision engine;
- a universal workflow engine.

## 12. Implementation-readiness decision set
Engineering decisions can be frozen now:
1. Treatment Plan remains the sole lifecycle authority for plan/stage state.
2. Appointment creation remains Agenda-owned.
3. Operational work remains Coordination-owned.
4. Visit linkage does not equal clinical completion.
5. Next-action type must become explicit rather than date-derived.
6. Arbitrary lifecycle jumps must be prevented.
7. Existing canonical tables are extended/reconciled rather than replaced.

Any product-policy question affecting the exact completion override or exact next-action taxonomy must be explicitly approved before implementation if not already settled by existing product decisions.
