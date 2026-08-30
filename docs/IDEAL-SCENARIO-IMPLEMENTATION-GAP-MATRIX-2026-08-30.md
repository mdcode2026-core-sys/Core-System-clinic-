# CORE SYSTEM — Ideal Scenario Implementation Gap Matrix

**Date:** 2026-08-30
**Authority:** `docs/CROSS-DOMAIN-IMPLEMENTATION-CONTRACTS-2026-08-30.md`

A scenario is `VALIDATED` only after the full workflow is executed against the current candidate with evidence. Code/DB/UI presence alone is not validation.

| # | Scenario | Contract | Reality / gap | Status |
|---:|---|---|---|---|
| 1 | New patient first contact and identification | R01 | Patient creation/persistence exists; current-candidate authenticated E2E evidence pending | IMPLEMENTED |
| 2 | Existing patient returns and is recognized | R01 | Patient lookup/Journey exists; full return workflow not executed on current candidate | IMPLEMENTED |
| 3 | Walk-in patient registered and routed | R01/R02 | Patient + Patient Flow exist; explicit walk-in handoff evidence pending | IMPLEMENTED |
| 4 | Pre-booked patient arrives and is checked in | R02 | Agenda state machine supports arrival/in-session; current-candidate E2E pending | IMPLEMENTED |
| 5 | Patient requests information before booking | R10 | Communications/request domain exists; full request→work→completion evidence pending | IMPLEMENTED |
| 6 | Patient selects service/procedure and receives next action | R01/R02 | Procedure catalog exists and Service foundation was added; service→next-action handoff not fully implemented | BLOCKED |
| 7 | Standard appointment booking | R04/R05 | Agenda create/update, conflicts and resource checks exist; full E2E pending | IMPLEMENTED |
| 8 | Appointment with provider availability | R04 | Workforce schedules now feed Agenda availability | IMPLEMENTED |
| 9 | Appointment requiring room/resource | R05 | Room/resource constraints and conflict engine exist | IMPLEMENTED |
| 10 | Appointment requiring specific device | R05 | Resources exist; procedure/device requirement mapping and E2E incomplete | BLOCKED |
| 11 | Provider + room + device simultaneously | R05 | Provider/room/resource conflicts exist; combined procedure requirement not fully proven | BLOCKED |
| 12 | Appointment confirmation and patient communication | R04/R10 | Confirmation and communication domains exist; handoff evidence pending | IMPLEMENTED |
| 13 | Rescheduling | R04 | Reschedule transition/update exists; current-candidate execution pending | IMPLEMENTED |
| 14 | Cancellation | R04 | Cancellation states/reasons exist; current-candidate execution pending | IMPLEMENTED |
| 15 | Patient enters clinical visit | R02 | Visit/Patient Flow exists; full current-candidate evidence pending | IMPLEMENTED |
| 16 | Doctor assessment | R02 | Clinical visit domain exists; assessment→decision evidence pending | IMPLEMENTED |
| 17 | Specialist performs appropriate service | R01/R05 | Procedure/visit exists; delegation/qualification workflow not fully exercised | BLOCKED |
| 18 | Clinical decision creates Treatment Plan | R01/R02 | Treatment Plan tables/actions/UI exist; persistence E2E pending | IMPLEMENTED |
| 19 | Treatment Plan contains multiple stages | R02 | Ordered multi-stage model exists; current-candidate E2E pending | IMPLEMENTED |
| 20 | Treatment stage produces next action | R02 | Work item supports `next_action`; automatic Treatment Stage→Next Action generation is not wired | BLOCKED |
| 21 | Next action requires future appointment | R02 | Agenda and work domains exist; explicit Treatment→Booking Requirement handoff is not implemented | BLOCKED |
| 22 | Completed procedure advances Treatment Plan | R02 | Treatment item state model exists; full Visit→Procedure→stage evidence pending | IMPLEMENTED |
| 23 | Treatment Plan planned completion | R02 | Completion states exist; full multi-stage E2E pending | IMPLEMENTED |
| 24 | Procedure selected from medical master/service catalog | R01 | Procedure catalog exists; current-candidate UI execution pending | IMPLEMENTED |
| 25 | Individual Service sale | R01/R03 | Service DB foundation exists; commercial sale/UI/financial linkage absent | BLOCKED |
| 26 | Multiple services sold as package | R01/R03 | Package/package-item DB foundation exists; sale workflow/UI absent | BLOCKED |
| 27 | Offer/discount applied by rules | R01/R03 | Offer DB foundation exists; application/calculation workflow absent | BLOCKED |
| 28 | Package linked to financial commitment | R03 | Financial plan/package and patient package foundations exist; atomic sale linkage absent | BLOCKED |
| 29 | Normal patient payment | R03 | Invoice/payment domain exists; live DB currently has 0 invoices/payments; E2E pending | IMPLEMENTED |
| 30 | Installments against commitment | R03 | Financial plan/installment RPC/schema exists; live DB has 0 plans/installments; E2E pending | IMPLEMENTED |
| 31 | Insurance coverage/responsibility | R06 | Insurance profile/actions exist; live DB has 0 profiles; E2E pending | IMPLEMENTED |
| 32 | Claim-ready service information | R06 | Claim creation exists; clinical/service→claim-ready aggregation not fully wired | BLOCKED |
| 33 | Claim reconciliation/patient responsibility | R06 | Claim states exist; complete reconciliation action/balance handoff not found | BLOCKED |
| 34 | Operating expense separate from revenue | R08 | Operating-expense foundation added; UI/reporting/E2E pending | IMPLEMENTED |
| 35 | Supplier obligation/payment | R07 | Supplier/PO/receiving existed; obligation/payment foundation added; PO→obligation automation absent | BLOCKED |
| 36 | Collected revenue drives financial attribution | R08 | Commission rules/entries exist and collected-payment path added; E2E/policy evidence pending | IMPLEMENTED |
| 37 | Working pattern affects availability | R04 | Workforce schedules are now enforced by Agenda | IMPLEMENTED |
| 38 | Leave/absence affects availability | R04 | Approved leave is consumed; sick/conference/holiday/permission variants are not all modeled in availability | BLOCKED |
| 39 | Procedure competence/qualification/authorization | R05/R11 | Skill/qualification tables and Agenda eligibility checks added; no realistic seeded requirements/E2E yet | IMPLEMENTED |
| 40 | Procedure consumption affects resource/inventory | R05 | Inventory ledger exists; procedure→resource/consumable consumption automation absent | BLOCKED |
| 41 | Domain event creates authorized work | R10 | Work lifecycle/assignment/handoff/history exists; domain-event→work creation not universal | BLOCKED |
| 42 | Completed visit triggers follow-up/next journey action | R02/R10 | Follow-up automation exists; full Visit→Follow-up→Next Action chain not executed on current candidate | BLOCKED |

## Current evidence baseline

- Live DB: 75 patients, 66 agenda events, 63 visits, 8 treatment plans, 34 treatment-plan items.
- Live DB: 0 invoices, 0 payments, 0 financial plans, 0 installments, 0 insurance profiles, 0 claims, 0 purchase orders, 0 receipts, 0 operational work items.
- Live DB: 2 workforce employees and 9 inventory items.
- Current candidate has a successful Vercel production deployment status; this is deployment evidence, not authenticated scenario validation.
- Production `/login` returned HTTP 200 and recent Vercel runtime error aggregation reported no errors in the selected window.

## Gate

**42/42 VALIDATED: NOT ACHIEVED.** The implementation foundations have advanced, but the complete scenario chain remains blocked by missing commercial workflows, Treatment Next Action handoff, insurance reconciliation, supplier-obligation automation, resource consumption and universal domain-event coordination.
