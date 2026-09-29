# CORE SYSTEM — Gate 04 Ownership & Integration Reconciliation
## Agenda & Scheduling
**Date:** 2026-09-29  
**Status:** PRECHECK / DECISION FREEZE COMPLETE / IMPLEMENTATION PLAN READY  
**Base main:** 9df3fa89f03eb92403d63d9907bd678760caeb5d

## 1. Purpose

Freeze the Module/Domain ownership model for Gate 04, reconcile the current Agenda implementation against the live database, and classify findings before implementation. This is a technical reconciliation record; it does not reopen Gates 01–03.

## 2. Frozen architectural ownership

| Business responsibility | Canonical owner | Canonical source / execution boundary |
|---|---|---|
| Appointment / scheduling | Agenda | master_agenda_events + Agenda mutation path |
| Calendar representation | Agenda/UI | Read representation of appointment truth |
| Workforce availability / eligibility | Workforce | Workforce schedules, unavailability and capability sources |
| Room truth | Clinic Administration / Facility | clinic_rooms |
| Operational resource truth | Clinic Administration / owning operational resource boundary | clinic_resources |
| Technical Medical Files agent device | Medical Files infrastructure | tenant_devices |
| Service / Procedure definition | Service/Procedure domain | clinic_procedures and approved service model |
| Patient identity | Patient / Identity | Gate 03 canonical identity |
| Patient real-time movement | Patient Flow / Visit Operations | Gate 01 closed implementation |
| Clinical progression | Treatment Plan / Clinical | Separate ownership |
| Follow-up / retention | Follow-up | Gate 11 |
| Consumable inventory | Inventory / Procurement | Separate domain |
| Audit | Cross-cutting governance | audit boundary |

Principle: a Module provides a capability; the owning Domain owns the truth behind it.

## 3. User-approved Gate 04 decisions

### D04-01 — Resource concurrency
Resource sharing/capacity is policy-driven. Default behavior is exclusive when no explicit sharing/capacity policy exists. The architecture must not hard-code permanent exclusivity.

### D04-02 — Service/Procedure requirements
The Service/Procedure definition is the canonical source of required operational resources. Agenda consumes those requirements and decides scheduling feasibility. Provider/doctor is conditional by service and is not universally required.

### D04-03 — Appointment auditability
Every Appointment mutation must be traceable: create, update, status transition, cancellation and reschedule. Audit retains complete decision context while UX disclosure remains permission-aware.

### D04-04 — Workforce boundary
Gate 04 consumes canonical Workforce contracts. Cleanup of legacy Workforce fallback sources remains outside Gate 04 and belongs to the Workforce owning gate.

## 4. Evidence reconciliation

### 4.1 Appointment authority
master_agenda_events is the live appointment source and has tenant-safe relationships to patient, doctor, room, resource, procedure and creator. Four PostgreSQL exclusion constraints provide defense-in-depth overlap prevention for doctor, patient, room and operational resource.

**Classification:** EXISTING / CORRECT, with policy hardening still required.

### 4.2 Canonical mutation path
src/domain/agenda/agenda.mutation-service.ts performs permission → time normalization → resource validation → procedure buffer → availability → conflict → persistence. agenda.actions.ts delegates create/update to it.

agenda.queries.ts also contains direct client mutation hooks for create/update/status/cancel. Repository search found no active callers beyond their definitions.

**Classification:** DUPLICATE / BYPASS SURFACE; active runtime bypass NOT PROVEN. Do not remove blindly; first verify callers and then converge all active mutation paths.

### 4.3 Provider requirement mismatch
The current Agenda TypeScript/server mutation contract requires doctorId, while the approved architecture and live database allow a provider to be optional depending on the service.

**Classification:** MIS-OWNED EXECUTION CONTRACT / Gate 04 implementation gap.

### 4.4 Service/Procedure requirements
clinic_procedures contains service duration, buffer and provider metadata. The historical clinic_procedure_resources model is not present as a live table. The live validate_procedure_resources_for_booking function reports active_model=false and does not enforce an active requirement model.

**Classification:** MISSING ACTIVE INTEGRATION CONTRACT. Do not resurrect the historical table merely because migrations mention it.

### 4.5 Workforce integration
The Agenda availability engine uses Workforce employee/schedule/unavailability/capability data and has legacy fallbacks to older availability/leave tables.

**Classification:** CORRECT OWNERSHIP / TRANSITIONAL SOURCE DUPLICATION. Legacy cleanup belongs to Workforce gate.

### 4.6 Availability engine
Current Agenda availability is a validator over provider working hours, Workforce unavailability, provider eligibility, Agenda conflicts and room availability. No separate slot-generation engine was found.

**Classification:** EXISTING / CORRECT FOR CURRENT GATE. Candidate slot generation can remain a later extension.

### 4.7 Inventory boundary
No Agenda booking path was found that makes consumable stock a mandatory appointment constraint.

**Classification:** CORRECT BOUNDARY.

### 4.8 Audit boundary
Live tr_audit_agenda is an AFTER UPDATE trigger only. Therefore appointment CREATE is not covered by that trigger.

**Classification:** MISSING CREATE AUDIT COVERAGE. The approved audit requirement makes this a Gate 04 implementation item.

### 4.9 Concurrency policy
Live clinic_rooms.capacity exists, but current Agenda conflict/exclusion rules are effectively exclusive for room/resource/provider overlap. No complete canonical policy model for shared/capacity/movable resources was identified.

**Classification:** MISSING POLICY CONTRACT. Implement the smallest canonical policy representation required by D04-01; do not create a generic resource engine.

### 4.10 Workforce changes and existing appointments
The established cross-domain contract treats Workforce changes as new availability constraints that may affect appointments and may trigger authorized operational work/communication. Existing appointments are not to be silently deleted/rebooked by Agenda.

**Classification:** EXISTING CROSS-DOMAIN CONTRACT / VERIFY IN GATE 04.

### 4.11 Planned vs actual time
Agenda planned start/end/buffer are distinct from real Patient Flow/Visit execution timing. Late arrival and overrun must not silently rewrite appointment planning truth.

**Classification:** ARCHITECTURALLY CORRECT / RUNTIME VERIFY.

### 4.12 Deferred/explicitly scoped cases
Emergency insertion, provider transfer, waitlist and booking approval are not established as independent Agenda engines in the current code. Multi-resource scheduling is represented through appointment resource fields but a richer requirement relationship is not active.

**Classification:** EXPLICIT EXTENSION / FUTURE INTEGRATION POINT. No ad-hoc implementation in the current Gate 04 work package.

## 5. Gate ownership decision

The violated invariant determines ownership:
- Appointment creation/update/status/conflict/availability/calendar → Gate 04.
- Clinical progression/treatment stage/next-action generation → Treatment Plan/Clinical.
- Follow-up/review/retention/communication continuity → Gate 11.
- Patient identity/duplicate/clinic relationship → Gate 03, only on proven regression.

No current finding invalidates Gates 01–03. No Treatment Plan repair is required by this reconciliation. The previously observed Follow-up continuity failure remains Gate 11.

## 6. Implementation boundary

Gate 04 may now implement only:
- canonical Agenda mutation convergence;
- conditional provider handling;
- canonical Service/Procedure requirement integration;
- policy-driven concurrency representation with default exclusivity;
- complete Appointment audit coverage;
- lifecycle/reschedule/no-show/cancel verification and any narrowly-scoped fixes proven necessary;
- runtime verification of Workforce/Agenda interaction;
- cross-domain contract verification without stealing ownership.

Gate 04 will not implement Patient Flow, Patient Identity, Treatment Plan, Follow-up, Inventory, Workforce cleanup, a second scheduler, or a generic Resource Engine.

## 7. Current conclusion

The Gate 04 precheck has produced no remaining Product Owner decision point. The four approved decisions are frozen. Remaining work is engineering design/implementation/verification, subject to the CSAPI plan sequence.

**Next phase:** final Gate 04 implementation plan → controlled Work Package → engineering verification → clean migration verification → runtime verification → production verification → closure.