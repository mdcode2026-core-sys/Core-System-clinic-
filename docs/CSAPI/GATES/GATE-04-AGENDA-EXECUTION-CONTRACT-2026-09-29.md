# CORE SYSTEM — CSAPI Gate 04 — Agenda & Scheduling
## Binding Implementation / Integration Contract

**Date:** 2026-09-29
**Status:** DESIGN FROZEN — IMPLEMENTATION CONTRACT READY
**Gate:** Gate 04
**Authority:** Approved Gate 04 decisions D04-01..D04-04 + Gate 04 ownership reconciliation + Gate 04 implementation design

## 1. Purpose
Establish the single executable contract for Agenda and Scheduling so that implementation, tests, runtime behavior and cross-domain integrations all use the same ownership and mutation boundaries.

## 2. Operational problem
CORE SYSTEM currently has a correct central appointment table and Agenda engines, but execution surfaces are not yet fully converged, provider optionality is narrower in code than in architecture, procedure/resource requirements are not represented by an active canonical requirement boundary, appointment CREATE is not fully covered by the existing audit trigger, and resource concurrency policy is not yet represented as an explicit contract.

## 3. Architectural decision
Agenda is the scheduling Module and appointment authority. Owning domains provide facts; Agenda evaluates appointment feasibility and owns the appointment decision/state. No second scheduler, calendar engine, queue scheduler, resource engine, workforce engine or clinical/follow-up state engine may be introduced.

## 4. Canonical owners
- Appointment: Agenda.
- Workforce reality: Workforce.
- Room / operational resource configuration: Clinic Administration / owning operational-resource boundary.
- Service / Procedure definition and booking requirements: Service / Procedure domain.
- Patient identity: Patient / Identity.
- Actual clinic-day movement: Patient Flow / Visit Operations.
- Clinical progression: Clinical / Treatment Plan.
- Follow-up continuity: Follow-up / Gate 11.
- Consumable stock: Inventory.
- Operational work state: Coordination.
- Audit: Platform Governance / canonical audit boundary.

## 5. Source of truth
`master_agenda_events` is the canonical appointment source of truth. Calendar views, Quick Appointment, Treatment Plan next actions, Follow-up requests and other entry surfaces are consumers/requesters and must not persist competing appointment state.

## 6. Actors and authorization
Appointment actions are performed by authorized clinic users. Permission requirements remain:
- `agenda:read` for reads;
- `agenda:create` for creation;
- `agenda:update` for update, status, cancellation and reschedule;
- `agenda:delete` only when an explicitly authorized delete capability exists.
Skills/qualifications/capabilities never replace permission. Tenant context is resolved server-side.

## 7. Inputs
Agenda may consume:
- patient identity/reference;
- service/procedure identity and booking requirements;
- provider/workforce availability and capability;
- room/resource state and approved concurrency policy;
- tenant timezone;
- requested start/end and derived buffer;
- current appointment state for update/lifecycle operations;
- explicit booking context such as Treatment Plan next-action reference where already available.

## 8. Trigger
Booking request, appointment update/reschedule, appointment lifecycle action, or a valid cross-domain request that asks Agenda to create or modify an appointment.

## 9. State transition
The canonical appointment statuses remain:
`scheduled → confirmed → arrived → in_session → completed`
with approved cancellation/no-show/reschedule transitions already represented in the current Agenda model.
Lifecycle mutations must use the persisted current state as the authority; client-submitted state is only an expected-state guard.

## 10. Operational execution path
`Authenticate → Resolve tenant → Authorize → Normalize tenant-local time → Resolve booking requirements → Resolve Workforce/resource facts → Apply concurrency policy → Validate feasibility → Check conflicts → DB command boundary → Persist in master_agenda_events → Audit`.

Create/update/reschedule share the canonical mutation service. Status/cancel/no-show paths must converge into the same mutation authority. The final persistence step is a protected DB command boundary; direct authenticated table writes are not an accepted alternate path.

## 11. Provider contract
Provider is conditional, not universal.
- If the Service/Procedure requires a provider, Agenda must require a valid provider and validate Workforce availability + capability.
- If the Service/Procedure does not require a provider, provider may be null and provider checks are skipped.
- Agenda must not infer a provider requirement solely because older UI/types required doctorId.

Current `clinic_procedures.provider_type` is a transitional input. The full Medical Master / Service Catalog redesign remains outside Gate 04.

## 12. Booking requirement contract
Agenda consumes a logical read-only requirement set from the Service/Procedure owner:
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
The contract expresses requirements; it does not authorize Agenda to own the configuration.

Gate 04 must establish the smallest current canonical physical source required to satisfy this contract. Historical `clinic_procedure_resources` is not restored by name or migration copy merely because it existed previously. Any replacement must be justified as the current Service/Procedure configuration boundary and must be tenant-safe, auditable and compatible with existing resources.

## 13. Workforce integration
Workforce remains the sole source for employee work reality. Agenda consumes canonical schedule, approved unavailability/leave and explicit procedure capability inputs.
Legacy fallback tables in the current availability implementation are transitional compatibility paths. Gate 04 will not redesign or delete them; their cleanup belongs to Gate 09 / Workforce or the owning work package.

## 14. Resource concurrency contract
Resource concurrency is policy-driven.
`No explicit policy → exclusive / capacity 1`.
An explicit owning-domain policy may allow capacity/shared behavior. Agenda consumes that policy.
Current database exclusion constraints remain the defense-in-depth enforcement for the active exclusive model. Gate 04 must not silently weaken those constraints without an authoritative policy representation and proof.

## 15. Feasibility boundaries
Agenda booking feasibility is distinct from:
- Procedure readiness;
- Inventory/consumable availability;
- actual Queue/Visit execution timing.
Consumable shortage does not automatically cancel or prevent an appointment.

## 16. Conflict contract
Application conflict rules remain the explainable domain decision layer. Database exclusion constraints remain final integrity defense.
Conflict scope includes doctor, room, operational resource and patient overlap where those entities participate in the appointment.
Stable machine codes are returned by the domain; localized presentation remains a UI concern.

## 17. Time contract
Tenant-local wall-clock input is normalized server-side and stored as UTC. `scheduled_start` and `scheduled_end` are planned Agenda time; `buffer_end` is the scheduling protection window.
Late arrival and overrun do not silently rewrite planned appointment truth. Actual movement belongs to Queue/Visit.

## 18. Lifecycle / reschedule contract
Reschedule is currently an update to the same Appointment entity. The existing `rescheduled` status records the lifecycle action, and old/new values are preserved through audit.
Do not introduce a second linked appointment record solely to model reschedule unless future evidence proves the current appointment/audit model insufficient.

## 19. Persistence / Database command contract
All appointment persistence mutations use narrow Agenda DB command functions invoked only by the trusted server-side mutation service. The functions are protected by explicit tenant/actor/current-state checks and tightly-scoped execution privileges, following the already-proven Gate 01 D3 command-boundary pattern. They do not recreate the Availability or Conflict engines.

Planned commands: `agenda_create_appointment`, `agenda_update_appointment` (including reschedule), `agenda_transition_appointment`, `agenda_cancel_appointment`. No delete command is required by the current Gate 04 product contract.

These commands are called only by a dedicated trusted server-role client. The existing Auth administration client is not repurposed.

Authenticated/anonymous INSERT/UPDATE/DELETE access to `master_agenda_events` must not remain as a browser-accessible bypass once all active application callers are migrated. SELECT remains governed by Agenda RLS.

## 20. Audit contract
Every appointment mutation must produce reconstructible audit evidence:
CREATE, UPDATE, STATUS_CHANGE, CANCEL, RESCHEDULE.
The canonical `audit_trail` is reused. Audit must preserve tenant, actor, role, action, table, record, old/new values, reason/context and timestamp as available.
UX error detail is permission-aware and must not expose audit-level internal data to unauthorized users.

## 21. Cross-domain contracts
### Treatment Plan → Agenda
`Treatment Plan → Next Action → Booking Requirement → Agenda → Appointment`.
Treatment Plan remains clinical authority; Agenda becomes appointment authority.

### Workforce → Agenda
`Workforce fact → availability constraint → Agenda feasibility → appointment decision`.
Workforce remains authoritative for work reality.

### Patient → Agenda
Patient/Identity supplies canonical patient reference; Agenda owns the appointment link.

### Agenda → Patient Flow
Agenda state can support pre-booked arrival/check-in; Patient Flow owns actual clinic-day movement.

### Follow-up → Agenda
Follow-up may request an appointment; Follow-up retains continuity ownership; Agenda owns the appointment created from the request.

## 22. Deferred scope
Gate 04 does not implement new engines for:
- waitlist;
- generalized emergency insertion workflow;
- provider-transfer workflow;
- booking-approval workflow;
- inventory reservation;
- automated communications;
- generalized N-resource aggregation beyond the current model;
- Workforce legacy cleanup;
- Treatment Plan or Follow-up lifecycle.

These remain explicit integration extension points or future owning-gate work.

## 23. Failure / exception contract
Failure must identify the violated invariant and owning layer. No workaround may hide a real Agenda defect.
Examples:
- provider unavailable → Agenda feasibility failure;
- room conflict → Agenda conflict;
- resource conflict → Agenda conflict;
- Workforce leave → Agenda availability constraint from Workforce;
- inventory shortage → separate operational readiness state, not an implicit Agenda block;
- Follow-up continuity failure → Gate 11;
- clinical progression failure → Treatment Plan/Clinical.

## 24. Acceptance criteria
Gate 04 implementation is acceptable only when all of the following are proven:
- all active Appointment writes converge on the canonical server mutation authority and protected DB command boundary;
- authenticated/anonymous direct table-write bypasses are removed or denied;
- provider optionality matches the Service/Procedure contract;
- required booking constraints are explicit and tenant-safe;
- provider/room/resource conflicts are prevented and explainable;
- resource concurrency policy has an explicit owner and default behavior;
- appointment create/update/status/cancel/reschedule are auditable;
- tenant isolation and permission boundaries hold;
- planned Agenda time remains separate from actual Queue/Visit time;
- Treatment Plan / Follow-up integrations preserve ownership;
- no parallel scheduler or resource engine exists.

## 25. Required evidence
Evidence must progress through:
`UI → server action/API → domain decision → persisted appointment state → audit → downstream handoff`.
Required automated evidence is defined in the Gate 04 Verification Plan. Production evidence is only accepted against the exact promoted main candidate.

## 26. Closure condition
Gate 04 closes only after the approved implementation, engineering validation, database/migration/security verification, authenticated real-world E2E, cross-domain verification, final review, exact production verification where required, and synchronized CSAPI documentation are all PASS.
