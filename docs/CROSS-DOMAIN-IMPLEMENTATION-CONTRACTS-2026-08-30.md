# CORE SYSTEM — Cross-Domain Implementation Contracts

**Date:** 2026-08-30  
**Status:** READY FOR DOCUMENTATION REMEDIATION  
**Purpose:** Operational contracts to be completed before software implementation/Reality validation.  
**Parent:** `IMPLEMENTATION-DOCUMENT-REMEDIATION-RUNBOOK-2026-08-30.md`

## Contract completion standard

Each contract is documentation-complete only when:

- one authoritative owner is named;
- one source of truth is named for each owned fact;
- trigger is explicit;
- authorized actor is explicit;
- UX/work surface is explicit;
- persistence responsibility is explicit;
- inputs/outputs and handoff are explicit;
- state transitions are explicit;
- failure/return/escalation behavior is explicit;
- audit requirement is explicit;
- historical documents are classified;
- implementation evidence and acceptance evidence are specified.

---

## R01 — Procedure / Service / Package / Treatment Plan

**Purpose:** Keep medical definition, clinic service, commercial offer and clinical plan distinct while allowing a coherent journey.

**Required chain:**
`Specialty → Procedure Master → Clinic Procedure → Service → Package/Offer → Treatment Plan → Appointment/Visit`

**Ownership:**
- Medical Master Library: canonical Procedure/Specialty definitions.
- Clinic configuration: clinic-specific availability/pricing/customization of services.
- Commercial layer: Package/Offer.
- Treatment Plan: clinical plan.
- Agenda: appointment.

**Required rules:**
- Procedure is a medical concept.
- Service is a clinic-delivered service representation and may contain multiple procedures where defined.
- Package/Offer is a commercial grouping.
- Treatment Plan is clinical commitment/planning.
- Financial Plan is financial commitment.
- Appointment is scheduled execution.
- Session/Visit is actual delivery/execution.

**Evidence required later:** trace one service from master definition through booking, clinical use, commercial commitment and completion without ownership duplication.

**Blocker:** Any unresolved ambiguity about which object is selected, sold, planned, scheduled or delivered.

---

## R02 — Treatment Plan → Next Action → Appointment

**Purpose:** Turn treatment planning into an explicit, governed continuation path.

**Required chain:**
`Treatment Plan → Stage → Next Action → Operational Work → Booking Requirement → Agenda → Appointment → Visit/Session → Stage Progression`

**Ownership:**
- Treatment Plan owns clinical planning and progression.
- Follow-up owns patient continuity logic.
- Coordination owns general operational work.
- Agenda owns appointment lifecycle.

**Required rules:**
- A Treatment Plan does not become an appointment scheduler.
- A Next Action is not automatically a generic Task; it becomes operational work when action is required.
- Agenda remains the only booking authority.
- Completion of a visit/session updates the owning clinical plan; it does not create duplicate state in Coordination.

**Blocker:** No explicit route from treatment stage to the required next operational action.

---

## R03 — Package / Financial Plan / Installments / Sessions

**Purpose:** Connect commercial commitment, financial obligation and actual clinical delivery.

**Required chain:**
`Package → Financial Plan → Installment Schedule → Payment → Session consumption → Remaining commitment/balance`

**Rules:**
- Package ≠ Financial Plan.
- Treatment Plan ≠ financial ledger.
- Installment due-state is financial truth.
- A session may consume a commercial/package entitlement without automatically marking a payment as collected.
- Partial payment remains visibly partial.
- Financial history is auditable.

**Blocker:** Inability to distinguish purchased entitlement, amount due, amount collected and sessions delivered.

---

## R04 — Workforce → Availability → Agenda

**Purpose:** Ensure staff reality affects appointment opportunity without creating a second scheduler.

**Inputs:**
- working pattern;
- attendance/absence;
- leave/sick leave;
- conferences/seminars;
- official holidays;
- capacity;
- advanced skill/qualification data where activated.

**Required chain:**
`Workforce reality → operational availability constraint → Agenda availability → appointment decision`

**Existing appointments:** Document the operational response when future workforce availability changes after appointments already exist.

**Blocker:** Workforce and Agenda descriptions disagree on who owns the appointment or how availability changes affect it.

---

## R05 — Staff + Room + Device + Procedure feasibility

**Purpose:** Model true clinic capacity for resource-dependent procedures.

**Required condition:**
`Required procedure + authorized/qualified actor + required room/resource/device + time capacity`

must be satisfiable for a real appointment opportunity.

**Rules:**
- authorization and competence are distinct;
- room/resource/device ownership remains in its canonical domain;
- provider availability alone does not prove feasibility;
- resource consumption after execution is recorded by the owning resource/inventory domain.

**Blocker:** Booking logic can claim availability while a required provider, room or device is unavailable.

---

## R06 — Insurance lifecycle

**Purpose:** Support clinic insurance operations at Core level without requiring external payer integration.

**Required chain:**
`Patient → Payer/Coverage → Responsibility → Service → Claim-ready information → Claim → Reconciliation → Patient responsibility`

**Core boundary:** Internal insurance operation must work without electronic insurer integration.

**Advanced boundary:** Eligibility automation, electronic claims and automated payer reconciliation are separate advanced integrations.

**Blocker:** No stable way to determine what the insurer owes versus what the patient owes, or inability to reconcile the claim.

---

## R07 — Procurement lifecycle

**Purpose:** Connect clinic purchasing to supplier and inventory truth.

**Required chain:**
`Need → Purchase Request/Order → Supplier → Receiving → Inventory → Supplier Obligation → Payment`

**Rules:**
- Inventory remains stock truth.
- Purchasing does not duplicate stock state.
- Receiving must affect the canonical inventory/resource record.
- Supplier financial context must remain traceable.
- Advanced approvals/comparison/reorder are separately classified.

**Blocker:** Purchase history exists without a coherent receiving/inventory/supplier financial continuation.

---

## R08 — Revenue → Commission → Payroll

**Purpose:** Create auditable compensation attribution.

**Required chain:**
`Procedure/Service attribution → Invoice → Collected Revenue → Eligible Revenue → Commission Basis → Commission → Payroll`

**Rules:**
- Invoice amount is not automatically collected revenue.
- Commission basis must be explicit and effective-dated.
- Adjustments remain auditable.
- Payroll owns compensation execution; Financial owns financial rules/records.

**Blocker:** Commission can be calculated only from an ambiguous or incorrect financial basis.

---

## R09 — Communication → Request → Work

**Purpose:** Allow communication to drive work without becoming a second workflow engine.

**Required chain:**
`Message/Conversation → Explicit actionable Request (when required) → Coordination/Domain work → Completion → Response/Notification`

**Rules:**
- Normal conversation is not automatically a Task.
- Request does not grant missing permission.
- Patient-visible communication remains separate from internal notes.
- Context links may reference appointment, treatment, invoice, payment, follow-up or other owning-domain objects.

**Blocker:** Users must leave CORE or use an untracked side process to complete normal clinic work that should be traceable.

---

## R10 — Domain Event → Coordination → Authorized Actor → Completion

**Purpose:** Provide the operational fabric connecting domains.

**Required chain:**
`Domain Event → Required Work → Authorized Actor → Assignment/Request/Handoff → Execute → Monitor → Escalate if needed → Close → Analyze`

**Examples that must be explicitly mapped:**
- appointment confirmed → preparation work;
- treatment stage due → booking work;
- follow-up due → operational action where required;
- low stock → purchasing request;
- financial exception → review work;
- patient portal request → clinic action;
- communication request → domain work.

**Rules:**
- Coordination owns work state, not source-domain business truth.
- Assignment, Request and Handoff are distinct concepts.
- Permissions remain owned by Team & Access.
- Workforce provides availability/capacity inputs where relevant.

**Blocker:** A domain event has no clear next actor/work state or requires a duplicate engine to continue the journey.

---

## R11 — Skill / Qualification / Permission

**Purpose:** eliminate semantic and authorization ambiguity.

**Definitions:**
- Role = organizational label.
- Permission = authorization.
- Capability = platform/business/tenant capability.
- Skill = human competence.
- Qualification = formal credential/evidence.
- Entitlement = right to have a capability available.

**Rules:**
- Skill/qualification may influence eligibility/routing but never grant authorization.
- Entitlement and permission remain separate.
- Historical wording may be preserved as evidence but must be classified when it conflicts with current terminology.

**Blocker:** Any implementation document uses Skill, Capability, Qualification, Permission or Entitlement interchangeably where the distinction changes behavior.

---

## R12 — Documentation Authority / Status / Closure

**Purpose:** make documentation and closure trustworthy.

**Canonical evidence chain:**
`Decision → Implementation Contract → Planned Work → Execution Evidence → Validation Evidence → Exact accepted repository/deployment/database state → Closure`

**Required status distinction:**
`UNEXECUTED → PRECHECK → RECONCILED → IMPLEMENTING → VALIDATED → PRODUCTION VERIFIED → DOCUMENTATION CLOSED → CLOSED`

**Rules:**
- Historical CLOSED is historical unless revalidated under the current acceptance policy.
- Every closure record must identify the exact accepted state.
- Historical documents are never silently deleted.
- Conflicting current documents must be resolved or explicitly marked contradictory.

**Blocker:** Two current documents claim incompatible status with no supersession or acceptance authority.

---

## Global implementation handoff rule

A future implementation agent must not begin coding a remediation item unless its contract is marked `DOCUMENTATION COMPLETE` and the dependent contracts are either complete or explicitly declared non-blocking.

No implementation prompt may replace a missing architectural/operational decision with an assumption.
