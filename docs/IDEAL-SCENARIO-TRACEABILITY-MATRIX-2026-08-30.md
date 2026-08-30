# CORE SYSTEM — Ideal Scenario Traceability Matrix

**Date:** 2026-08-30  
**Status:** Documentation baseline for remediation and later implementation validation.

## Purpose

Provide a compact traceability bridge between the 42 ideal scenarios and the implementation contracts required to support them. This is not a code-validation result.

| Contract | Primary scenario coverage | Required architectural chain | Current documentation status |
|---|---|---|---|
| R01 Procedure/Service/Package | 6, 24–28 | Procedure → Service → Package/Offer → Treatment Plan | Contract remediation required |
| R02 Treatment Plan/Next Action | 18–23, 42 | Treatment Plan → Next Action → Work → Agenda → Visit | Contract remediation required |
| R03 Financial commitment/installments | 26–30 | Package → Financial Plan → Installment → Session | Contract remediation required |
| R04 Workforce availability | 8–14, 37–38 | Workforce reality → Availability → Agenda | Contract remediation required |
| R05 Staff/room/device feasibility | 9–11, 17, 40 | Procedure → Actor + Room + Device → Appointment | Contract remediation required |
| R06 Insurance | 31–33 | Coverage → Responsibility → Claim-ready → Reconciliation | Contract remediation required |
| R07 Procurement | 34–35, 40 | Need → Purchase → Receiving → Inventory → Supplier payment | Contract remediation required |
| R08 Revenue/commission/payroll | 34–36 | Collection → attribution → commission → payroll | Contract remediation required |
| R09 Communication/work | 5, 12, 41–42 | Communication → explicit request → operational work | Contract remediation required |
| R10 Coordination | 6, 20–22, 41–42 | Event → Work → Authorized Actor → Close | Critical contract to close |
| R11 Skill/qualification/permission | 17, 39 | Skill/qualification ≠ permission | Terminology/contract reconciliation |
| R12 Closure authority | All | Decision → Plan → Evidence → Validation → Closure | Governance remediation required |

## Scenario completion gate

No scenario may be marked architecturally complete until its required contracts have:

1. one authoritative owner;
2. one source of truth per owned fact;
3. defined actor and authorization;
4. defined handoff to the next domain;
5. defined result and next state;
6. documented acceptance criteria;
7. historical documents reconciled.

## Evidence boundary

This matrix records the documentation state. It does not claim that the corresponding software behavior has passed runtime validation. That validation is intentionally deferred to the subsequent implementation/Reality stage.

## Relationship to future hard scenarios

Hard/exception scenarios must not replace or dilute the 42 ideal scenarios. They will be tested after the ideal baseline is implemented and validated. Any hard scenario that exposes an architectural defect must be traced back to the affected ideal contract rather than patched as an isolated exception.
