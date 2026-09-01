# CORE SYSTEM — Ideal Scenario Traceability Matrix

**Date:** 2026-08-30  
**Status:** DOCUMENTATION CLOSED — all 42 ideal scenarios traced to completed contracts.  
**Boundary:** Documentary traceability only; runtime/Production validation remains deferred.

## Scenario-to-contract matrix

| # | Ideal scenario | Primary contract(s) | Supporting contract(s) | Required continuity / evidence |
|---:|---|---|---|---|
| 1 | New patient first contact and identification | R10 | R09 | Patient identity established; authorized intake; next journey state |
| 2 | Existing patient recognition | R10 | R09 | Existing patient context retained; next action traceable |
| 3 | Walk-in registration and routing | R10 | R09, R02 | Intake → routing/work → authorized actor → next state |
| 4 | Pre-booked arrival/check-in | R10 | R04 | Appointment remains Agenda truth; arrival/flow work traceable |
| 5 | Information request before booking | R09 | R10, R01 | Message remains communication; explicit request only becomes work |
| 6 | Service/procedure selection and next action | R01 | R02, R10 | Service identity → appropriate next action without ownership duplication |
| 7 | Standard appointment booking | R02 | R01, R04, R05 | Booking requirement → Agenda appointment |
| 8 | Appointment with provider availability | R04 | R05, R11 | Workforce constraint → Agenda opportunity |
| 9 | Appointment requiring room/resource | R05 | R04, R07 | Procedure requirements + room/resource + time |
| 10 | Appointment requiring specific device | R05 | R04, R07 | Device requirement + staff + time |
| 11 | Provider + room + device simultaneously | R05 | R04, R11 | Simultaneous feasibility before booking |
| 12 | Confirmation and patient communication | R09 | R02, R10 | Appointment state + communication record |
| 13 | Normal rescheduling | R04 | R02, R05, R10 | Availability/booking change remains Agenda-owned and traceable |
| 14 | Normal cancellation | R02 | R09, R10 | Appointment state changes; affected communication/work traceable |
| 15 | Entry into clinical visit | R02 | R01, R10 | Appointment → Visit without creating duplicate clinical truth |
| 16 | Doctor assessment | R01 | R02, R10 | Clinical assessment owned by clinical domain |
| 17 | Specialist performs appropriate service | R05 | R11, R01 | Competence/qualification + permission + procedure/service |
| 18 | Clinical decision creates Treatment Plan | R01, R02 | R10, R11 | Clinical plan created by authorized clinical actor |
| 19 | Multi-stage/multi-session Treatment Plan | R02 | R01, R03 | Stages and sessions remain clinical/scheduled/commercially distinct |
| 20 | Treatment stage produces Next Action | R02 | R10 | Stage → next action → operational work |
| 21 | Next Action requires future appointment | R02 | R10 | Booking requirement → Agenda → appointment |
| 22 | Completed procedure advances Treatment Plan | R02 | R05, R10 | Visit/session completion returns to clinical plan |
| 23 | Treatment Plan planned completion | R02 | R10 | Final stage completion and next-state closure |
| 24 | Procedure selected from Medical Master/Service Catalog | R01 | R11 | Canonical medical definition → clinic service |
| 25 | Individual Service sale | R01 | R03, R08 | Service identity → commercial commitment → financial trace |
| 26 | Multi-service Package sale | R01 | R03 | Package grouping remains commercial; components traceable |
| 27 | Configured Offer/Discount | R01 | R03, R08 | Commercial rule affects commitment without changing clinical truth |
| 28 | Package linked to financial commitment | R03 | R01 | Package → Financial Plan, distinct ownership |
| 29 | Normal patient payment | R03 | R08 | Obligation → payment → collected amount |
| 30 | Installment payment | R03 | R08 | Installment due-state, allocation, remaining balance |
| 31 | Insured patient and responsibility determination | R06 | R03 | Coverage → payer/patient responsibility |
| 32 | Claim-ready service information | R06 | R01, R03 | Service/clinical/financial facts assembled without external dependency |
| 33 | Claim reconciliation and patient responsibility | R06 | R03, R08 | Claim → reconciliation → residual patient responsibility |
| 34 | Operating expense separate from patient revenue | R07 | R08 | Supplier/operating expense remains distinct from patient revenue |
| 35 | Supplier obligation and payment | R07 | R08 | Need/order → receiving → supplier obligation → payment |
| 36 | Collected revenue for downstream attribution | R08 | R03 | Payment/collection → eligibility → commission basis |
| 37 | Working pattern contributes to availability | R04 | R11 | Workforce pattern → availability constraint → Agenda |
| 38 | Leave/absence affects availability | R04 | R10, R09 | Workforce change → affected planning/work/communication |
| 39 | Procedure matched to competence/qualification and authorization | R11 | R05 | Skill/qualification and permission evaluated separately |
| 40 | Procedure consumption reflected in resources/inventory | R05 | R07 | Procedure/resource requirement → consumption → canonical resource/inventory truth |
| 41 | Domain event creates operational work and closes correctly | R10 | R09, R11 | Event → work → authorized actor → close → source-domain result |
| 42 | Completed visit triggers follow-up/next journey action | R02 | R09, R10 | Visit completion → follow-up/next action → continuation |

## Documentary completion test

For every row, the mapped contract set is `DOCUMENTATION CLOSED`. Each applicable contract defines:

- owner;
- source of truth;
- actors;
- authorization;
- trigger;
- state transition;
- operational steps;
- cross-domain handoff;
- output;
- next action;
- failure boundary;
- audit requirements;
- acceptance criteria;
- evidence requirements.

**Result:** 42/42 ideal scenarios have a complete documentary contract path.

## End-to-end continuity gate

The complete ideal baseline can be read as:

`Patient → PJ → Procedure/Service → Package/Offer → Treatment Plan → Next Action → Coordination Work → Workforce/Resource feasibility → Agenda → Appointment → Visit/Session → Financial Plan/Payment/Insurance → Resource Consumption → Follow-up → Next Action`

Ownership remains distributed by domain; the journey is integrated through explicit references and handoffs rather than a second central source of truth.

## Evidence boundary

This is a documentation closure result. It does not certify that the repository implementation, Supabase state, runtime, browser workflows or Vercel Production currently satisfy these contracts. Those are future validation gates.

## Deferred hard scenarios

The 60 difficult/exception scenarios in `CORE-SYSTEM-SCENARIO-REGISTER-2026-08-30.md` remain preserved and deferred. They must be tested later against the same ideal contracts.
