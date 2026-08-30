# CORE SYSTEM — Ideal Operational Scenarios Baseline

**Date:** 2026-08-30  
**Status:** DOCUMENTATION CLOSED — 42/42 scenarios traced to implementation contracts  
**Purpose:** Permanent record of the ideal clinic scenarios defined during the operational architecture audit.

## 1. Scope

This document records the ideal-state operating model for an Enterprise clinic using CORE SYSTEM with full capabilities. It is the baseline for implementation validation and for the future difficult/exception scenario phase.

## 2. Clinic model

- Dermatologist.
- Skin specialist.
- Laser specialist.
- Three multi-function administrative employees covering reception, customer service, follow-up, booking, accounting and finance according to individual permissions.
- Clinical users may access administrative functions directly connected to the Patient Journey.
- Suppliers, purchasing, payments and operating expenses.
- Five health insurance companies.
- Packages, offers and installments.
- Laser hair/skin devices, HydraFacial and fat-reduction devices.
- Approximately 25 dermatology/aesthetic procedures.
- Payroll, rent, medical consumables, hospitality and other business expenses.
- Staff leave, conferences, seminars, official holidays, sick leave and permissions/absences.

## 3. Ideal scenario family

The following 42 scenarios form the baseline set. They are intentionally ideal/normal-flow scenarios; difficult exceptions are registered separately for a future phase.

### Patient entry and identity

1. New patient first contact and identification.
2. Existing patient returns and is recognized.
3. Walk-in patient is registered and routed into the journey.
4. Pre-booked patient arrives and is checked in.
5. Patient requests information before booking.
6. Patient selects a service/procedure and receives the appropriate next action.

### Booking and capacity

7. Standard appointment booking.
8. Appointment with provider availability.
9. Appointment requiring a room/resource.
10. Appointment requiring a specific device.
11. Appointment requiring provider + room + device simultaneously.
12. Appointment confirmation and patient communication.
13. Rescheduling under normal conditions.
14. Cancellation under normal conditions.

### Clinical journey

15. Patient enters clinical visit.
16. Doctor performs assessment.
17. Specialist performs delegated/appropriate service.
18. Clinical decision creates a Treatment Plan.
19. Treatment Plan contains multiple stages/sessions.
20. Treatment stage produces a next action.
21. Next action requires a future appointment.
22. Completed procedure advances the Treatment Plan.
23. Treatment Plan reaches planned completion.

### Services, packages and commercial journey

24. Procedure is selected from the medical master/service catalog.
25. Service is sold as an individual service.
26. Multiple services are sold as a package.
27. Offer/discount is applied according to configured rules.
28. Package is linked to the appropriate financial commitment.
29. Patient pays through a normal payment flow.
30. Patient uses installments against an agreed financial commitment.

### Insurance and finance

31. Insured patient is identified and coverage/responsibility is determined.
32. Service generates claim-ready financial/clinical information.
33. Claim is reconciled and remaining patient responsibility is determined.
34. Operating expense is recorded separately from patient revenue.
35. Supplier obligation and payment are recorded through the financial domain.
36. Collected revenue is used as the appropriate basis for downstream financial attribution.

### Resources and workforce

37. Staff working pattern contributes to operational availability.
38. Leave/absence affects availability and operational planning.
39. Procedure is matched to required competence/qualification and authorization.
40. Procedure consumption is reflected in required resources/inventory.

### Continuity and coordination

41. A domain event creates required operational work for an authorized actor, who completes it and closes the work without changing the originating domain's source of truth.
42. Completed visit triggers the appropriate follow-up/next journey action and the patient journey continues to its next intended state.

## 4. End-to-end ideal chain

`First Contact → Patient Identity → Service/Procedure → Booking → Capacity Check → Confirmation → Arrival → Visit → Clinical Decision → Treatment Plan → Next Action → Appointment → Procedure/Session → Financial Commitment → Payment/Insurance → Resource Consumption → Follow-up → Next Journey Action → Completion`

## 5. Ownership rules

- Patient Journey owns the patient journey and clinical journey context.
- Agenda owns appointments and scheduling truth.
- Medical Master Library owns canonical medical/service definitions.
- Financial & Resources owns financial, inventory, purchasing and supplier financial truth.
- Workforce owns employment/work reality and availability inputs.
- Team & Access owns authorization and access truth.
- Communications owns communication delivery/records.
- Journey Coordination owns operational work coordination, not originating business truth.
- Insights consumes governed data and does not become a competing source of truth.

## 6. Cross-domain integrity rule

A scenario is documentation-complete only when the complete chain is defined:

`Trigger → Owner → Source of Truth → Authorized Actor → Work → Handoff → Result → Next State`

The completed mapping is maintained in `IDEAL-SCENARIO-TRACEABILITY-MATRIX-2026-08-30.md` and the contract definitions are maintained in `CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`.

## 7. Future difficult-scenario register

Difficult scenarios remain intentionally deferred and are preserved in `CORE-SYSTEM-SCENARIO-REGISTER-2026-08-30.md`. They include late arrival, no-show, provider/resource failure, treatment-plan change, package cancellation/refund, failed/overdue payment, insurance rejection/partial coverage, stock shortage, supplier delay, multi-role conflicts, communication failure, escalation, out-of-order events and recovery cases.

These are **deferred by design**, not forgotten.

## 8. Baseline rule

This document is the reference scenario set for the next stages. Any future change to the ideal operating model must be explicitly recorded as a superseding decision rather than silently modifying this baseline.
