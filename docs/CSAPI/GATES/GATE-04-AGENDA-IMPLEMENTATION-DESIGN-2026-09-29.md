# CORE SYSTEM — CSAPI Gate 04 — Agenda & Scheduling
## Implementation Design

**Date:** 2026-09-29
**Status:** IMPLEMENTATION DESIGN COMPLETE — REVIEW-READY
**Execution status:** IMPLEMENTATION NOT STARTED
**Authority:** Approved Gate 04 decisions D04-01..D04-04 + Gate 04 Ownership & Integration Reconciliation
**Base main:** 69405d65c6d282b4f703743a81df5252bec73bcc

## 1. Design objective

Translate the approved Gate 04 architecture into one executable Agenda design without creating a second scheduler, resource engine, workforce engine, workflow engine, or clinical/follow-up state engine.

## 2. Canonical architecture

```text
Patient / Identity ───────────────┐
Service / Procedure ──────────────┤
Workforce facts ──────────────────┤
Room / operational resource facts ┤
Policy / eligibility facts ───────┤
                                  ↓
                         AGENDA FEASIBILITY
                                  ↓
                         CONFLICT / POLICY
                                  ↓
                        Agenda Mutation Service
                                  ↓
                         master_agenda_events
                                  ↓
                      Calendar / Visit / Journey
```

Agenda owns the appointment decision and persisted appointment state. Every other domain supplies facts or consumes the resulting appointment reference.

## 3. Mutation authority

All Appointment mutations must converge on one server-side authority:

`Agenda server action → agenda.mutation-service.ts → validation → persistence`

The mutation service becomes authoritative for:
- create;
- update/reschedule;
- status transition;
- cancellation;
- no-show;
- any future appointment mutation introduced within Gate 04.

`agenda.actions.ts` remains a thin authentication/input adapter.
`agenda.queries.ts` remains read/query infrastructure only.

Direct client writes to `master_agenda_events` are prohibited at the application architecture level. Existing mutation hooks are treated as migration targets and must not remain as active write paths.

## 4. Provider model

`doctorId/providerId` is nullable at the Agenda command boundary.

Provider requirement is resolved from the owning Service/Procedure configuration:
- provider required → provider identity, Workforce availability and capability are evaluated;
- provider not required → provider checks are skipped;
- no hidden universal doctor requirement is added by Agenda.

Current transitional provider evidence comes from `clinic_procedures.provider_type` plus the canonical Workforce capability model. The physical Medical Master/Service Catalog redesign remains outside Gate 04.

## 5. Booking requirement contract

Agenda consumes a read-only logical contract from the owning Service/Procedure boundary:

```ts
type BookingRequirementSet = {
  provider: { required: boolean; providerType?: string | null };
  room: { required: boolean };
  operationalResources: Array<{
    resourceType: string;
    required: boolean;
    quantity: number;
  }>;
};
```

Agenda must not infer hidden resource requirements from UI selections.

Current physical state does not contain an active canonical procedure→resource requirement table. Therefore Gate 04 will:
1. define and enforce the consumer contract;
2. reuse current `clinic_procedures` provider metadata;
3. validate explicitly selected room/resource facts;
4. not recreate historical `clinic_procedure_resources` merely because the table existed in old migrations;
5. record the absence of an active requirement source as a bounded dependency for the owning Service/Procedure/Resource workstream.

Generalized N-resource scheduling is not invented in Gate 04. The current appointment model supports patient + provider + room + one operational resource; broader resource aggregation remains a later owning-gate extension.

## 6. Workforce integration

Agenda consumes Workforce facts through one adapter boundary.

Required inputs:
- active employee identity;
- working schedule;
- approved unavailability/leave;
- procedure capability/eligibility;
- any canonical capacity signal already exposed by Workforce.

The current fallback to legacy availability/leave data is transitional evidence only. Gate 04 will not remove or redesign those sources.

## 7. Resource and concurrency design

Resource policy is represented logically as:

```ts
type ResourceConcurrencyPolicy = {
  mode: 'exclusive' | 'capacity';
  capacity: number;
  simultaneous: boolean;
  movable: boolean;
};
```

Rules:
- no explicit policy → `exclusive`, capacity 1;
- explicit owner policy may allow capacity/shared behavior;
- Agenda consumes policy, it does not own resource configuration;
- no universal hard-coded permanent exclusivity rule;
- Gate 04 does not activate a new capacity engine when no authoritative policy source exists.

The current PostgreSQL exclusion constraints remain defense-in-depth for the active exclusive model. Any future capacity mode must be implemented at the owning resource boundary before Agenda changes the enforcement behavior.

## 8. Feasibility pipeline

Every create/update/reschedule operation follows:

`Authenticate → Resolve tenant → Authorize → Normalize tenant-local time → Resolve procedure requirements → Resolve Workforce facts → Resolve room/resource policy → Validate feasibility → Check Agenda conflicts → Persist appointment → Audit`

Validation layers are distinct:

`Appointment Feasibility ≠ Procedure Readiness ≠ Inventory Availability`

Consumable stock must not block booking unless a future owning-domain contract explicitly changes this boundary.

## 9. Conflict and database defense

Application conflict engine remains canonical for explainable decision results.

Database exclusion constraints remain defense-in-depth for doctor, patient, room and operational resource overlaps.

The application must return stable machine-readable failure codes and the UI maps those codes to permission-appropriate messages.

## 10. Time model

Input contract:
`tenant-local wall clock → server normalization → UTC persistence`

`scheduled_start` / `scheduled_end` represent planned Agenda time.
`buffer_end` represents the scheduling protection window.

Queue/Visit actual start, late arrival and overrun must not silently rewrite planned Agenda time.

## 11. Appointment lifecycle design

Existing statuses remain authoritative:
`scheduled`, `confirmed`, `arrived`, `in_session`, `completed`, `no_show`, `cancelled`, `rescheduled`.

State transitions remain guarded by expected-current-state checks.

Reschedule remains an Agenda mutation over the existing appointment entity in Gate 04. The mutation must preserve the old state in the audit trail through old/new values; a new linked appointment entity is not introduced without evidence that current audit/history is insufficient.

Cancellation reason remains constrained by the canonical database vocabulary.

## 12. Audit design

Appointment audit must cover:
- CREATE;
- UPDATE;
- STATUS_CHANGE;
- CANCEL;
- RESCHEDULE.

The audit record must retain actor, role, tenant, table, record, old values, new values and time. The operation classification must distinguish cancellation/reschedule/status changes from generic updates.

Current `tr_audit_agenda` only fires on UPDATE and `fn_audit_changes()` only handles UPDATE. The Gate 04 DB work will extend this canonical audit boundary rather than create an Agenda-specific audit store.

UX explanations remain separate from audit truth.

## 13. Security model

Application permission checks remain mandatory:
- `agenda:read` for read;
- `agenda:create` for creation;
- `agenda:update` for update/status/cancel/reschedule;
- `agenda:delete` only where an explicit delete feature exists.

Tenant is always resolved server-side and cross-tenant references are rejected by tenant-safe foreign keys and scoped queries.

Gate 04 security work will verify the Agenda-specific boundary only. System-wide SECURITY DEFINER findings remain separately governed.

## 14. UI design boundary

Existing Agenda screens and Quick Appointment are adapted rather than redesigned.

UI responsibilities:
- display available provider/room/resource choices;
- collect tenant-local booking times;
- display stable Agenda failure messages;
- respect permission visibility;
- route all writes through server actions;
- preserve existing calendar and detail views.

UI must not contain duplicate availability/conflict logic.

## 15. Cross-domain contracts

### Treatment Plan → Agenda
`Treatment Plan → Next Action → Booking Requirement → Agenda → Appointment`.
Treatment Plan owns the clinical decision; Agenda owns the appointment.

### Workforce → Agenda
`Workforce fact → availability constraint → Agenda feasibility`.
Workforce owns workforce truth.

### Patient → Agenda
Patient Identity supplies the canonical patient reference; Agenda owns the appointment link.

### Agenda → Patient Flow
Agenda appointment state may be consumed by arrival/visit workflows; Queue/Visit owns actual clinic-day movement.

### Follow-up → Agenda
Follow-up may request an appointment, but Gate 11 owns follow-up continuity. Agenda only creates the appointment.

## 16. Deferred cases

These are not implemented as new ad-hoc workflows in Gate 04:
- emergency insertion;
- waitlist;
- provider transfer;
- booking approval workflow;
- generalized N-resource aggregation;
- automated communications;
- inventory reservation/consumption;
- Workforce legacy cleanup.

They remain explicit future integration points or owning-gate scope.

## 17. Error contract

Stable codes include:
- `AGENDA_TENANT_MISSING`
- `AGENDA_PERMISSION_DENIED`
- `AGENDA_INVALID_TIME_RANGE`
- `AGENDA_RESOURCE_UNAVAILABLE`
- `AGENDA_UNAVAILABLE`
- `AGENDA_CONFLICT_DOCTOR`
- `AGENDA_CONFLICT_ROOM`
- `AGENDA_CONFLICT_RESOURCE`
- `AGENDA_CONFLICT_PATIENT`
- `AGENDA_STATE_CONFLICT`
- `AGENDA_INVALID_STATUS_TRANSITION`.

The machine code is the domain contract. Localized presentation is a UI concern.

## 18. Design invariants

1. One appointment source of truth.
2. One Agenda mutation authority.
3. No Agenda ownership of Workforce/Inventory/Treatment Plan/Follow-up truth.
4. Provider optionality is resolved from service requirements.
5. Resource feasibility is policy-aware.
6. Consumables do not automatically block booking.
7. Queue is not scheduling.
8. Calendar is not authority.
9. Tenant isolation applies at every mutation boundary.
10. Audit reconstructs every appointment mutation.
11. Existing data is preserved.
12. No historical engine is resurrected without current evidence.

## 19. Implementation readiness

Design is ready for controlled implementation. No Product Owner decision remains open.