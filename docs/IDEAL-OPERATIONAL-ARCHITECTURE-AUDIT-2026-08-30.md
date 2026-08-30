# CORE SYSTEM — Ideal Operational Architecture Audit

**Date:** 2026-08-30  
**Scope:** Architecture + execution-document reconciliation only  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Baseline branch:** `main`  
**Baseline commit reviewed:** `f6ce83b926c326af575b0fcc512996ce4dbb751d`

## 1. Purpose

This document records the completed documentary/architectural investigation of CORE SYSTEM's ideal clinic-operation scenarios. It is intended to preserve the investigation as repository evidence so later work does not depend on conversational memory.

This is **not** a code audit, runtime audit, or production functional acceptance. Those are explicitly deferred to a later phase.

## 2. Investigation conclusion

The current CORE SYSTEM architecture is fundamentally sound and should **not** be rebuilt. The principal remaining work is reconciliation and completion of cross-domain operational contracts, plus documentation governance.

The investigation found that historical implementation/closure documents do not always describe the same state. Therefore, a document marked `CLOSED`, `IMPLEMENTED`, or `PRODUCTION READY` must not by itself be treated as proof of current completeness.

The authoritative model going forward is:

`Architecture decision -> implementation contract -> execution evidence -> validation evidence -> exact accepted commit/deployment/database state`

Historical documents remain valuable, but must be explicitly classified as `HISTORICAL`, `SUPERSEDED`, `RECONCILED`, or `CURRENT`.

## 3. Architectural baseline to preserve

CORE SYSTEM is an integrated platform composed of independently owned domains around the Patient Journey (PJ).

The following ownership boundaries are considered stable:

- Patient Journey / clinical domains own the clinical journey and clinical truth.
- Agenda owns appointments and scheduling truth.
- Workforce owns employment/work reality, working patterns, leave, attendance and related workforce truth.
- Team & Access owns users, roles, permissions, access boundaries and overrides.
- Financial & Resources owns billing, payments, installments, insurance financial responsibility, purchasing, suppliers and inventory-related financial/resource flows.
- Communications owns communication channels and messages, not operational work.
- Journey Coordination owns cross-domain operational work/handoffs, not the source truth of another domain.
- Insights consumes authoritative domain data and does not become a second source of truth.

Critical separations to preserve:

- Role != Permission
- Employee != User
- Skill != Permission
- Qualification != Permission
- Workforce != Agenda
- Communication != Work
- Coordination != source-domain ownership
- Package != Treatment Plan
- Treatment Plan != Financial Plan
- Appointment != clinical treatment plan

## 4. Ideal operational chain

The target clinic model is:

`Patient contact -> identification -> service/procedure selection -> booking -> availability/resource check -> confirmation -> arrival -> queue/visit -> clinical decision -> treatment plan -> financial commitment -> execution -> resource consumption -> payment/insurance handling -> follow-up -> next action -> next appointment`

The chain must preserve ownership at every transition and must make the next required action understandable to the authorized actor without creating a second source of truth.

## 5. Cross-domain contracts requiring documentary completion

### 5.1 Procedure / Service / Package / Treatment Plan

Required conceptual chain:

`Medical Specialty -> Procedure Master -> Clinic Procedure -> Service -> Package/Offer -> Treatment Plan -> Appointment/Visit`

Definitions:

- Procedure = medical procedure.
- Service = clinic-delivered service representation.
- Package/Offer = commercial grouping.
- Treatment Plan = clinical commitment/plan.
- Financial Plan = financial commitment.
- Appointment = scheduled execution.
- Session = actual delivered execution where applicable.

Status: **Contract requires explicit reconciliation in implementation documentation.**

### 5.2 Treatment Plan -> Next Action -> Appointment

Required chain:

`Treatment Plan -> Treatment Stage -> Next Action -> Operational Work -> Booking requirement -> Agenda -> Appointment -> Session -> Completion -> Next Stage`

The Treatment Plan must remain the clinical owner; Agenda remains the appointment owner; Coordination may own operational handoffs/work but must not become a clinical engine.

Status: **Cross-domain implementation contract requires completion/reconciliation.**

### 5.3 Package / Installments / Sessions

Required distinction:

- Package = commercial commitment.
- Treatment Plan = clinical commitment.
- Financial Plan = financial commitment.
- Appointment = scheduled execution.
- Session = actual execution.

Installments must be represented as financial obligations without making Package or Treatment Plan the financial ledger.

Status: **Contract requires explicit reconciliation.**

### 5.4 Workforce -> Availability -> Agenda

Required conceptual chain:

`Employee + Working Pattern + Leave/Attendance + Capacity (+ Skill where relevant) -> operational availability -> Agenda`

Workforce does not create a second calendar. Workforce changes must be capable of producing an operational impact that can be handled by the appointment workflow.

Status: **Architecture is sound; operational impact contract requires explicit completion.**

### 5.5 Procedure -> qualified person + room/resource/device

For procedures requiring equipment or rooms, an appointment opportunity is valid only when the required people and required resources are simultaneously satisfiable.

Conceptually:

`Required procedure + authorized/qualified actor + required room/resource/device + time capacity = real appointment opportunity`

Status: **Architecture is sound; implementation contract must explicitly cover resource constraints.**

### 5.6 Insurance

Core lifecycle:

`Patient -> payer/coverage -> responsibility -> service -> claim-ready information -> claim -> reconciliation -> patient balance`

Electronic payer integration is not a prerequisite for the clinic's internal insurance workflow; it belongs to the appropriate advanced/integration layer.

Status: **Architecture is sound; lifecycle contract requires explicit reconciliation.**

### 5.7 Purchasing / Receiving / Inventory / Supplier / Payment

Required core lifecycle:

`Need -> purchase request/order -> supplier -> receiving -> inventory -> supplier obligation -> payment`

Purchasing must extend inventory/resource truth rather than create a second stock engine.

Status: **Core lifecycle requires explicit documentary closure.**

### 5.8 Workforce -> Commission -> Payroll

Required distinction:

`Procedure/service attribution -> invoice -> collected revenue -> eligible revenue -> commission rule -> commission -> payroll`

Invoice value must not automatically be treated as collected revenue.

Status: **Cross-domain financial/workforce contract requires explicit reconciliation.**

### 5.9 Communication -> operational work

Communication remains communication. When a message explicitly creates an actionable request, that request may enter the operational work/coordination flow.

`Message -> explicit request -> operational work -> completion -> response`

Status: **Architecture is sound; implementation documentation must preserve this boundary.**

### 5.10 Coordination as operational fabric

Required model:

`Domain event -> required work -> authorized actor -> assignment/request/handoff -> execute -> monitor -> escalate -> close -> analyze`

Coordination does not own the original clinical, financial, workforce, appointment or communication truth.

Status: **Highest-priority cross-domain contract to verify and close.**

## 6. Workforce and multi-role clinic reality

The ideal model must support an employee who legitimately performs several functions, for example reception, customer service, follow-up, booking and selected financial work, while preserving authorization boundaries.

The model must not infer permissions solely from job title.

A person may have:

`User + Role + direct permissions/overrides + workspace access + skills/qualifications`

with each concept retaining its distinct meaning.

Status: **Architecture is sound; later functional validation must verify composite-role reality.**

## 7. Financial and operating-expense reality

The platform must distinguish:

- patient revenue
- supplier payable
- payroll
- rent
- medical consumables
- hospitality
- general operating expenses

while remaining within the intended clinic financial scope rather than becoming an unrestricted ERP/accounting suite.

Status: **Architecture is sound.**

## 8. Documentation governance finding

Historical status records contain materially different states for AJM stages at different points in time, including `IN PROGRESS`, `NEEDS RECONCILIATION`, `NOT STARTED / GATED`, later `CLOSED`, and a production-closure document that still reported a blocker before later acceptance evidence.

This is not treated as a reason to discard historical records. It is a governance issue requiring explicit status authority and supersession rules.

Required rule:

> No `CLOSED` status is authoritative unless it references the exact evidence chain and accepted repository/deployment/database state on which the closure was based.

## 9. What the execution-document repair must accomplish

The next documentation-repair phase must produce a single coherent set of implementation contracts for every identified cross-domain gap.

For each contract, documentation must identify:

1. Business purpose.
2. Authoritative domain/owner.
3. Source of truth.
4. Trigger/event.
5. Authorized actor(s).
6. Required permission boundary.
7. User-facing operational surface.
8. Persistence responsibility.
9. Cross-domain handoff.
10. Expected next state.
11. Failure/return/escalation path.
12. Audit requirement.
13. Dependencies on other contracts.
14. Historical documents superseded or retained.
15. Acceptance evidence required for closure.

## 10. Master remediation priorities

Priority 1 — establish one current documentation authority and explicit historical/superseded classification.

Priority 2 — close the Coordination operational-fabric contract.

Priority 3 — close Treatment Plan -> Next Action -> Appointment.

Priority 4 — reconcile Procedure/Service/Package/Treatment Plan semantics.

Priority 5 — reconcile Workforce availability/resource constraints with Agenda.

Priority 6 — reconcile insurance, purchasing, commission and installment lifecycle contracts.

Priority 7 — normalize Skill/Qualification/Permission terminology across implementation documents.

Priority 8 — create one traceable acceptance matrix linking every contract to its future implementation and validation evidence.

## 11. Deferred work

The following are intentionally outside this investigation and must not be inferred from this document:

- detailed source-code correctness
- actual database schema correctness
- live runtime functional correctness
- browser/E2E execution correctness
- production UX correctness
- performance
- security penetration testing

These belong to the subsequent implementation/Reality validation phase.

## 12. Decision baseline

Unless a later approved decision explicitly supersedes it, this document establishes the following baseline:

1. **Do not rebuild the CORE architecture.**
2. **Repair/reconcile implementation contracts and cross-domain integration.**
3. **Preserve historical decisions as evidence, but classify their current authority explicitly.**
4. **Do not treat feature existence or a CLOSED label as sufficient proof of an operationally complete scenario.**
5. **The ideal scenario is complete only when ownership, authorization, next action, cross-domain handoff and source-of-truth continuity are all explicitly defined.**
6. **Difficult/exception scenarios are deferred until the ideal operational baseline is repaired and accepted.**

## 13. Status

**Documentary/architectural ideal-scenario investigation: COMPLETE.**

**Implementation-document remediation: NEXT PHASE.**

**Code/runtime validation: DEFERRED.**

This document is a repository record of the investigation and should be referenced by subsequent work instead of relying on conversational memory.
