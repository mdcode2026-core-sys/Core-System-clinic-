# Gate 02 — 42-Scenario Current Evidence Reconciliation

Date: 2026-09-23
Authority: Gate 02 Deep Evidence Audit
Purpose: Convert the 42-scenario **documentary** baseline into an explicit current-evidence inventory without treating documentary closure as runtime proof.

Legend:
- DOCUMENTARY = contract/baseline exists; current runtime proof not established by Gate 02.
- GATE01-PROVEN = directly exercised by Gate 01 evidence, but not proof of longitudinal continuity.
- DOMAIN-DEPENDENCY = belongs to another domain gate and must be verified there; Gate 02 must only verify the continuity handoff/dependency.
- GATE02-EVIDENCE-MISSING = specifically required by Gate 02 but not proven by its historical closure evidence.

| # | Scenario | Contract baseline | Current evidence classification | Gate 02 action |
|---:|---|---|---|---|
| 1 | New patient first contact and identification | R10/R09 | DOMAIN-DEPENDENCY | Reconcile identity handoff; Gate 03 owns identity execution |
| 2 | Existing patient recognition | R10/R09 | GATE02-EVIDENCE-MISSING | Verify repeated-patient continuity input |
| 3 | Walk-in registration and routing | R10/R09/R02 | DOCUMENTARY | Verify handoff into Patient Flow/Agenda without duplicate routing |
| 4 | Pre-booked arrival/check-in | R10/R04 | GATE02-EVIDENCE-MISSING | Verify Appointment → Visit continuity |
| 5 | Information request before booking | R09/R10/R01 | DOMAIN-DEPENDENCY | Verify explicit request → work boundary |
| 6 | Service/procedure selection and next action | R01/R02/R10 | GATE02-EVIDENCE-MISSING | Verify selection → next-action ownership |
| 7 | Standard appointment booking | R02/R01/R04/R05 | DOMAIN-DEPENDENCY | Gate 04 owns booking; verify continuity reference |
| 8 | Appointment with provider availability | R04/R05/R11 | DOMAIN-DEPENDENCY | Gate 04/09 ownership; continuity dependency only |
| 9 | Appointment requiring room/resource | R05/R04/R07 | DOMAIN-DEPENDENCY | Gate 04/09/10 ownership; verify handoff |
| 10 | Appointment requiring device | R05/R04/R07 | DOMAIN-DEPENDENCY | Gate 04/09/10 ownership; verify handoff |
| 11 | Provider + room + device simultaneously | R05/R04/R11 | DOMAIN-DEPENDENCY | Gate 04/09 ownership; verify continuity consequence |
| 12 | Confirmation and patient communication | R09/R02/R10 | DOMAIN-DEPENDENCY | Verify appointment state → communication boundary |
| 13 | Normal rescheduling | R04/R02/R05/R10 | DOMAIN-DEPENDENCY | Gate 04 owns lifecycle; continuity impact only |
| 14 | Normal cancellation | R02/R09/R10 | DOMAIN-DEPENDENCY | Gate 04 owns lifecycle; verify downstream continuity |
| 15 | Entry into clinical visit | R02/R01/R10 | GATE01-PROVEN | Reconcile Appointment → Visit separately |
| 16 | Doctor assessment | R01/R02/R10 | GATE01-PROVEN | Reconcile result → continuation |
| 17 | Specialist performs appropriate service | R05/R11/R01 | DOMAIN-DEPENDENCY | Gate 05/09/17 ownership; continuity consequence |
| 18 | Clinical decision creates Treatment Plan | R01/R02/R10/R11 | GATE02-EVIDENCE-MISSING | Verify clinical result → Plan relation |
| 19 | Multi-stage/multi-session Treatment Plan | R02/R01/R03 | GATE02-EVIDENCE-MISSING | Verify stage/session continuity |
| 20 | Treatment stage produces Next Action | R02/R10 | GATE02-EVIDENCE-MISSING | Runtime-proof canonical next-action path |
| 21 | Next Action requires future appointment | R02/R10 | GATE02-EVIDENCE-MISSING | Verify Next Action → Agenda handoff |
| 22 | Completed procedure advances Treatment Plan | R02/R05/R10 | GATE02-EVIDENCE-MISSING | Verify completion → plan progression |
| 23 | Treatment Plan planned completion | R02/R10 | GATE02-EVIDENCE-MISSING | Verify final-stage continuation/no-action semantics |
| 24 | Procedure selected from Medical Master/Service Catalog | R01/R11 | DOMAIN-DEPENDENCY | Gate 05/07 ownership; continuity reference only |
| 25 | Individual Service sale | R01/R03/R08 | DOMAIN-DEPENDENCY | Gate 07/08 ownership |
| 26 | Multi-service Package sale | R01/R03 | DOMAIN-DEPENDENCY | Gate 07/08 ownership |
| 27 | Configured Offer/Discount | R01/R03/R08 | DOMAIN-DEPENDENCY | Gate 07/08 ownership |
| 28 | Package linked to financial commitment | R03/R01 | DOMAIN-DEPENDENCY | Gate 08 ownership; continuity reference |
| 29 | Normal patient payment | R03/R08 | DOMAIN-DEPENDENCY | Gate 08 ownership |
| 30 | Installment payment | R03/R08 | DOMAIN-DEPENDENCY | Gate 08 ownership |
| 31 | Insured patient responsibility | R06/R03 | DOMAIN-DEPENDENCY | Gate 08 ownership |
| 32 | Claim-ready service information | R06/R01/R03 | DOMAIN-DEPENDENCY | Gate 08 ownership; verify clinical/financial references |
| 33 | Claim reconciliation | R06/R03/R08 | DOMAIN-DEPENDENCY | Gate 08 ownership |
| 34 | Operating expense separate from revenue | R07/R08 | DOMAIN-DEPENDENCY | Gate 08/10 ownership |
| 35 | Supplier obligation and payment | R07/R08 | DOMAIN-DEPENDENCY | Gate 10/08 ownership |
| 36 | Collected revenue attribution | R08/R03 | DOMAIN-DEPENDENCY | Gate 08 ownership |
| 37 | Working pattern contributes to availability | R04/R11 | DOMAIN-DEPENDENCY | Gate 09/04 ownership |
| 38 | Leave/absence affects availability | R04/R10/R09 | DOMAIN-DEPENDENCY | Gate 09/04 ownership |
| 39 | Procedure competence/qualification/authorization | R11/R05 | DOMAIN-DEPENDENCY | Gate 17/09 ownership |
| 40 | Procedure consumption → inventory | R05/R07 | DOMAIN-DEPENDENCY | Gate 10 ownership; continuity reference |
| 41 | Domain event creates operational work and closes | R10/R09/R11 | GATE02-EVIDENCE-MISSING | Verify event → work → result without source-truth mutation |
| 42 | Completed visit → follow-up/next journey action | R02/R09/R10 | GATE02-EVIDENCE-MISSING | Primary Gate 02 longitudinal acceptance scenario |

## Current Gate 02 acceptance-critical set

The following scenarios are the minimum direct continuity evidence set before Gate 02 can be reconsidered:

**2, 4, 6, 18, 19, 20, 21, 22, 23, 41, 42**

The broader 42 scenarios remain the dependency/reference baseline. Gate 02 does not absorb ownership of Agenda, Identity, Treatment Planning, Financial, Workforce, Inventory, Follow-up or Communications; it must prove that continuity crosses those boundaries correctly.

## Important evidence boundary

The 42-scenario matrix itself is documentary. It does not claim runtime success. This distinction is required by the original scenario baseline, which explicitly states that its 42/42 closure is documentary traceability only.

Gate 02 must now attach current executable evidence to the acceptance-critical scenarios above and record the owning downstream gate for the remaining dependency scenarios.
