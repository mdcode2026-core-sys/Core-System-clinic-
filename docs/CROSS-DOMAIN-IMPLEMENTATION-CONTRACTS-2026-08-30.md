# CORE SYSTEM — Cross-Domain Implementation Contracts

**Date:** 2026-08-30  
**Status:** DOCUMENTATION CLOSED — implementation-ready specification  
**Scope:** Documentation/contract remediation only; no code, runtime, database or Production validation is claimed.

## Contract standard

Every R-item below is expressed using the mandatory 25-part contract format. `DOCUMENTATION CLOSED` means the requirement is explicit and traceable; it does not mean software is implemented or validated.

---

# R12 — Documentation Governance / Status / Closure

1. **Purpose** — Establish one trustworthy authority for current documentation state and closure.
2. **Operational Problem** — Historical AJM/Stage records contain incompatible status claims, including CLOSED and later blockers.
3. **Architectural Decision** — Preserve history; current authority wins; closure requires an exact evidence chain.
4. **Domain Owner** — Documentation Governance / program governance.
5. **Source of Truth** — `DOCUMENTATION_STATUS.md` for repository-wide status; this contract bundle for remediation-contract state.
6. **Actors** — System owner, documentation maintainer, implementation/validation agents.
7. **Authorization** — Only an authorized owner/maintainer may accept a closure; implementation agents may record evidence but must not manufacture acceptance.
8. **Inputs** — Decisions, contracts, execution evidence, validation evidence, repository/deployment/database identifiers.
9. **Trigger** — New decision, implementation claim, validation result, contradiction or closure request.
10. **State Transition** — `UNEXECUTED → PRECHECK → RECONCILED → IMPLEMENTING → VALIDATED → PRODUCTION VERIFIED → DOCUMENTATION CLOSED → CLOSED`.
11. **Operational Steps** — Identify authority; classify documents; reconcile conflicts; record exact candidate/evidence; obtain acceptance; publish status.
12. **Cross-Domain Handoff** — Governance state is consumed by every domain contract; it never becomes business truth.
13. **Output** — Current status plus provenance and evidence pointers.
14. **Next Action** — Execute the next contract only when dependencies are complete/non-blocking.
15. **Failure / Exception Boundary** — Conflicting current claims remain `INVALID/CONTRADICTORY` or `DECISION REQUIRED`; historical records are never deleted.
16. **Audit Requirements** — Preserve document path, revision/commit, evidence references, acceptance actor and date.
17. **Dependencies** — All R-items and current architecture/PJ/UX/terminology authorities.
18. **Existing Documents** — `DOCUMENTATION_STATUS.md`, `AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`, AJM acceptance/closure records, `CORE_SYSTEM_INDEX.md`.
19. **Historical Decisions** — Earlier AJM closure records are retained as historical evidence.
20. **Superseded Decisions** — Any historical status claim superseded by a later exact-evidence acceptance is non-authoritative for current state.
21. **Implementation Requirements** — Provide a machine/readable or clearly structured status/evidence record; no status may rely only on a label.
22. **Acceptance Criteria** — One current status authority exists; every R-item has a state; conflicting claims have explicit classification; closure evidence schema is defined.
23. **Evidence Requirements** — Repository commit, relevant validation output, deployment/database identifiers where applicable, acceptance record.
24. **Scenario Coverage** — All 42 ideal scenarios indirectly; all contracts directly.
25. **Closure Condition** — `DOCUMENTATION CLOSED` when authority, lifecycle, historical classification and evidence rules are linked from the index.

---

# R01 — Procedure / Service / Package / Treatment Plan

1. **Purpose** — Preserve distinct medical, clinic-service, commercial and clinical-plan concepts while connecting them.
2. **Operational Problem** — Earlier documents could blur what is selected, sold, planned, scheduled and delivered.
3. **Architectural Decision** — `Specialty → Procedure Master → Clinic Procedure → Service → Package/Offer → Treatment Plan → Appointment/Visit` with distinct ownership.
4. **Domain Owner** — Medical Master Library owns medical definitions; clinic configuration owns clinic service configuration; Commercial owns offers/packages; Patient Journey/clinical domain owns Treatment Plan; Agenda owns Appointment.
5. **Source of Truth** — One canonical record per concept in its owning domain.
6. **Actors** — Admin/configurator, reception/customer service, clinician, authorized finance staff.
7. **Authorization** — Catalog maintenance by configured admin; sale/offer use by authorized commercial/front-desk users; Treatment Plan by authorized clinical actors.
8. **Inputs** — Specialty, procedure definition, clinic configuration, price/availability, package components, clinical assessment.
9. **Trigger** — Service selection, configuration, sale or clinical decision.
10. **State Transition** — Defined medical concept → configured clinic service → optional commercial grouping → clinical plan → scheduled/delivered work.
11. **Operational Steps** — Select canonical procedure/service; configure clinic representation; optionally group into package/offer; create Treatment Plan only from clinical intent; schedule through Agenda.
12. **Cross-Domain Handoff** — Service/package context passes to PJ/clinical and Financial without transferring ownership.
13. **Output** — Unambiguous identity and references between concepts.
14. **Next Action** — Booking, clinical planning or financial commitment according to the event.
15. **Failure / Exception Boundary** — Ambiguous object identity blocks implementation; no domain may silently reinterpret another object.
16. **Audit Requirements** — Record which master/service/package/plan identifiers were used and by whom.
17. **Dependencies** — Medical Master, PJ, Agenda, Financial, R02/R03.
18. **Existing Documents** — Architecture audit; Medical Master/Service Catalog records; PJ master docs; terminology governance.
19. **Historical Decisions** — Earlier Medical Master and service-catalog decisions remain evidence where consistent.
20. **Superseded Decisions** — Any wording treating Package as Treatment Plan or Treatment Plan as Financial Plan is superseded/clarified by this contract.
21. **Implementation Requirements** — Maintain separate identifiers/ownership and explicit references; support services containing multiple procedures only through configured canonical links.
22. **Acceptance Criteria** — One traceable service can be followed through master definition, sale/package, treatment plan and appointment without duplicated ownership.
23. **Evidence Requirements** — Later implementation trace, persisted references, authorized user evidence, scenario execution evidence.
24. **Scenario Coverage** — 6, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28.
25. **Closure Condition** — Semantics, ownership, links, booking/clinical/commercial boundaries and evidence requirements are explicit.

---

# R02 — Treatment Plan → Next Action → Appointment

1. **Purpose** — Turn clinical planning into an explicit continuation path.
2. **Operational Problem** — Treatment, follow-up, generic work and scheduling can become competing workflow owners.
3. **Architectural Decision** — `Treatment Plan → Stage → Next Action → Operational Work → Booking Requirement → Agenda → Appointment → Visit/Session → Stage Progression`.
4. **Domain Owner** — Treatment Plan/PJ owns clinical plan/progression; Follow-up owns continuity logic; Coordination owns operational work; Agenda owns appointments.
5. **Source of Truth** — Treatment Plan for clinical progression; Agenda for appointment lifecycle; Coordination for work state.
6. **Actors** — Clinician, follow-up staff, reception/booking staff, authorized coordinator.
7. **Authorization** — Clinical plan changes require clinical permission; booking requires appointment permission; work execution requires operational permission.
8. **Inputs** — Treatment stage, due action, timing, procedure/service, patient context, booking requirements.
9. **Trigger** — Clinical decision, completed session, stage becoming due.
10. **State Transition** — Planned stage → next action → work/booking requirement → booked appointment → completed visit → next stage.
11. **Operational Steps** — Clinician defines stage/action; system identifies whether operational work is needed; authorized actor executes/requests booking; Agenda books; visit completion returns result to Treatment Plan.
12. **Cross-Domain Handoff** — Treatment Plan sends booking requirement/context to Agenda through operational work when needed; completion returns clinical result to PJ.
13. **Output** — Next required action and, where applicable, a valid appointment.
14. **Next Action** — Execute stage, book future work, follow up, or close plan.
15. **Failure / Exception Boundary** — No scheduler embedded in Treatment Plan; no clinical state owned by Coordination.
16. **Audit Requirements** — Record stage/action creation, actor, booking handoff, appointment reference and completion.
17. **Dependencies** — R01, Agenda, Follow-up, Coordination.
18. **Existing Documents** — PJ master docs, Treatment Plan implementation records, Agenda contract/audit, architecture audit.
19. **Historical Decisions** — Prior PJ and Treatment Plan descriptions retained as evidence.
20. **Superseded Decisions** — Any competing generic-task or scheduler ownership for clinical progression is superseded by this boundary.
21. **Implementation Requirements** — Explicit stage/action linkage; booking requirement must reference owning clinical context; appointment remains Agenda-owned.
22. **Acceptance Criteria** — A completed visit can demonstrably advance the plan and produce the next required action without duplicate clinical state.
23. **Evidence Requirements** — Later E2E trace from stage through work/booking/appointment/visit to next stage.
24. **Scenario Coverage** — 18–23, 41, 42.
25. **Closure Condition** — Full clinical-to-operational-to-Agenda continuation is defined with ownership and return path.

---

# R03 — Package / Financial Plan / Installments / Sessions

1. **Purpose** — Connect commercial entitlement, financial obligation and actual delivery.
2. **Operational Problem** — Package, payment and session completion can be incorrectly collapsed.
3. **Architectural Decision** — Package = commercial; Treatment Plan = clinical; Financial Plan = financial; Appointment = scheduled; Session/Visit = delivered.
4. **Domain Owner** — Commercial owns package; Financial owns obligations/payments; PJ/clinical owns treatment; Agenda owns appointment.
5. **Source of Truth** — Financial ledger/obligation records for money; package record for entitlement; Treatment Plan for clinical delivery intent.
6. **Actors** — Sales/front desk, finance, clinician, authorized manager.
7. **Authorization** — Selling/configuring package, recording payment, adjusting financial state and consuming sessions are separately authorized.
8. **Inputs** — Package, price/offer, financial commitment, installment schedule, payments, session delivery.
9. **Trigger** — Package sale, financial agreement, payment, completed session.
10. **State Transition** — Commercial commitment → financial obligation → due/partial/paid → session consumption → remaining entitlement/balance.
11. **Operational Steps** — Create package; create financial plan; schedule installments; allocate payment; record session consumption; recompute remaining commitment/balance.
12. **Cross-Domain Handoff** — Package context informs Financial; session completion informs entitlement/clinical records; financial status informs patient-facing/admin surfaces.
13. **Output** — Independent commercial, clinical and financial states that reconcile.
14. **Next Action** — Collect due amount, deliver next session, review balance or complete package.
15. **Failure / Exception Boundary** — Partial payment is never treated as collected full obligation; session completion never equals payment.
16. **Audit Requirements** — Payment allocation, adjustments, session consumption and balance history.
17. **Dependencies** — R01, R02, Financial.
18. **Existing Documents** — Financial resources/AJM records, package/service records, PJ documents.
19. **Historical Decisions** — Earlier package/payment terminology retained and reconciled.
20. **Superseded Decisions** — Any model conflating package or Treatment Plan with financial ledger is superseded.
21. **Implementation Requirements** — Distinct commercial, financial and clinical references; explicit installment states; auditable allocation.
22. **Acceptance Criteria** — The system can distinguish purchased entitlement, invoice/obligation, collected amount, outstanding balance and sessions delivered.
23. **Evidence Requirements** — Later persistence and E2E evidence for full/partial payments and session consumption.
24. **Scenario Coverage** — 26–30, plus 18–23 where package-backed treatment applies.
25. **Closure Condition** — All financial/commercial/session distinctions and handoffs are explicit.

---

# R04 — Workforce → Availability → Agenda

1. **Purpose** — Make staff reality affect operational availability without creating a second scheduler.
2. **Operational Problem** — Working patterns and absences can diverge from appointment reality.
3. **Architectural Decision** — Workforce owns work reality; Agenda owns appointments; availability is the integration boundary.
4. **Domain Owner** — Workforce for employee/work reality; Agenda for scheduling truth.
5. **Source of Truth** — Workforce records for patterns/absence/capacity inputs; Agenda for appointment state.
6. **Actors** — Workforce/admin, managers, reception/booking users.
7. **Authorization** — Workforce changes require workforce permission; appointment actions require Agenda permission.
8. **Inputs** — Working pattern, leave, sick leave, conference/seminar, official holiday, attendance/absence, capacity.
9. **Trigger** — Workforce change affecting a future time window.
10. **State Transition** — Workforce fact → availability constraint → affected availability → appointment decision/work.
11. **Operational Steps** — Record workforce reality; derive constraint; expose to Agenda; determine impact on existing/future appointments; generate authorized communication/work when required.
12. **Cross-Domain Handoff** — Workforce constraint is consumed by Agenda; Agenda retains booking ownership.
13. **Output** — Accurate operational availability and explicit impact handling.
14. **Next Action** — Book, reschedule, notify, review or leave appointment unchanged according to policy.
15. **Failure / Exception Boundary** — Workforce must not own appointments or create a second calendar.
16. **Audit Requirements** — Change source, effective period, impacted capacity and resulting appointment actions.
17. **Dependencies** — Agenda, R05, R11.
18. **Existing Documents** — Agenda audit/Stage 4 records, Workforce-related implementation records, architecture audit.
19. **Historical Decisions** — Existing working-hours/blocking proposals retained as implementation evidence.
20. **Superseded Decisions** — Any second-calendar model is superseded.
21. **Implementation Requirements** — Availability integration must account for patterns and all listed absence categories.
22. **Acceptance Criteria** — Staff availability changes alter appointment opportunity without changing appointment ownership.
23. **Evidence Requirements** — Later scenario tests for working pattern, leave, illness, conference and holiday effects.
24. **Scenario Coverage** — 8–14, 37–38.
25. **Closure Condition** — Workforce-to-Agenda operational impact is explicit, including existing-appointment handling boundary.

---

# R05 — Staff + Room + Device + Procedure

1. **Purpose** — Establish real appointment feasibility for resource-dependent services.
2. **Operational Problem** — Provider availability alone can falsely indicate a valid appointment.
3. **Architectural Decision** — Feasibility requires procedure + authorized/qualified actor + required room/resource/device + time capacity.
4. **Domain Owner** — Procedure requirements from Medical Master/service configuration; Workforce for staff capacity/competence inputs; resource/inventory domain for room/device/resource state; Agenda for appointment.
5. **Source of Truth** — Each owner retains its resource/competence fact; Agenda combines them for scheduling.
6. **Actors** — Booking staff, clinician/specialist, resource/admin staff.
7. **Authorization** — Authorization and competence are independent gates.
8. **Inputs** — Procedure requirements, staff eligibility, room/device state, time capacity.
9. **Trigger** — Booking request or availability recalculation.
10. **State Transition** — Requirements identified → constraints checked → feasible/not feasible → appointment opportunity.
11. **Operational Steps** — Resolve procedure requirements; check actor; check room; check device; check time; return feasible slot or explicit block.
12. **Cross-Domain Handoff** — Agenda consumes constraints; post-execution resource consumption returns to owning resource/inventory domain.
13. **Output** — Operationally valid appointment opportunity.
14. **Next Action** — Book, select alternative valid slot/resource, or route for review.
15. **Failure / Exception Boundary** — No booking claim of availability if a mandatory simultaneous constraint is unsatisfied.
16. **Audit Requirements** — Required resources, checked constraints, selected actor/resource and resulting appointment.
17. **Dependencies** — R01, R04, R11, Agenda/resource records.
18. **Existing Documents** — Stage 4 Agenda/resource audit, room/resource decisions, architecture audit.
19. **Historical Decisions** — Existing room and device findings retained.
20. **Superseded Decisions** — Provider-only availability as proof of feasibility is superseded.
21. **Implementation Requirements** — Model mandatory requirements conceptually and enforce simultaneous satisfiability at booking.
22. **Acceptance Criteria** — Provider+room+device scenarios cannot book when any required element is unavailable.
23. **Evidence Requirements** — Later targeted tests for provider, room, device and combined constraints plus post-session consumption.
24. **Scenario Coverage** — 9–11, 17, 39–40.
25. **Closure Condition** — Resource feasibility boundary and evidence are explicit.

---

# R06 — Insurance Lifecycle

1. **Purpose** — Support Core internal insurance workflow without requiring external payer integration.
2. **Operational Problem** — Coverage, responsibility and claim reconciliation may be disconnected.
3. **Architectural Decision** — `Patient → Payer/Coverage → Responsibility → Service → Claim-ready information → Claim → Reconciliation → Patient responsibility`.
4. **Domain Owner** — Financial & Resources owns financial responsibility/claim accounting; Patient/PJ owns patient context; payer/coverage data remains linked to patient financial context.
5. **Source of Truth** — Internal coverage/responsibility/claim records for Core operation.
6. **Actors** — Reception, finance/claims staff, authorized managers, clinicians for required clinical inputs.
7. **Authorization** — Coverage edits, claim submission/reconciliation and financial adjustments are separately authorized.
8. **Inputs** — Patient, insurer, coverage, service, clinical/financial claim-ready data, payments.
9. **Trigger** — Insurance identification, service delivery, claim preparation, payer response.
10. **State Transition** — Coverage known → responsibility determined → claim-ready → claim → response/reconciliation → residual patient balance.
11. **Operational Steps** — Record coverage; determine responsibility; gather claim-ready data; create/track claim; reconcile; post patient responsibility.
12. **Cross-Domain Handoff** — Clinical/service facts feed claim-ready data; Financial owns resulting balances.
13. **Output** — Reconciled payer/patient responsibility.
14. **Next Action** — Submit/review claim, collect patient balance, correct data or close.
15. **Failure / Exception Boundary** — Electronic payer integration is Advanced; Core must remain operational without it.
16. **Audit Requirements** — Coverage version, responsibility calculation, claim state, reconciliation and adjustments.
17. **Dependencies** — R01/R03, Financial, PJ.
18. **Existing Documents** — Financial resources records, architecture audit, current financial/PJ authorities.
19. **Historical Decisions** — Prior insurance concepts retained where compatible.
20. **Superseded Decisions** — Any requirement that Core insurance depends on electronic payer integration is superseded.
21. **Implementation Requirements** — Internal claim lifecycle must be represented independently from external integrations.
22. **Acceptance Criteria** — Insurer amount, patient responsibility and reconciliation can be determined and audited internally.
23. **Evidence Requirements** — Later scenario evidence for insured service, claim-ready state and reconciliation.
24. **Scenario Coverage** — 31–33.
25. **Closure Condition** — Core lifecycle and Advanced integration boundary are explicit.

---

# R07 — Procurement / Receiving / Inventory / Supplier Payment

1. **Purpose** — Connect purchasing to inventory and supplier financial truth.
2. **Operational Problem** — Purchase records can stop before receiving, stock and payable continuation.
3. **Architectural Decision** — `Need → Purchase Request/Order → Supplier → Receiving → Inventory → Supplier Obligation → Payment`.
4. **Domain Owner** — Financial & Resources owns purchasing/resource financial flow; Inventory owns stock truth; Supplier records own supplier context.
5. **Source of Truth** — Inventory for stock; purchasing for order; Financial for supplier obligation/payment.
6. **Actors** — Requesting staff, purchasing staff, receiver, finance, authorized approver where configured.
7. **Authorization** — Request, order, receiving and payment may require distinct permissions.
8. **Inputs** — Need, item, quantity, supplier, order, receipt, invoice/obligation, payment.
9. **Trigger** — Resource need or replenishment requirement.
10. **State Transition** — Need → ordered → received/partial → stock updated → supplier obligation → paid.
11. **Operational Steps** — Create request/order; link supplier; receive; update canonical inventory; establish obligation; pay/reconcile.
12. **Cross-Domain Handoff** — Receiving updates Inventory; financial obligation flows to Financial; no duplicate stock ledger.
13. **Output** — Traceable procurement and stock/financial continuation.
14. **Next Action** — Receive, resolve discrepancy, pay or review.
15. **Failure / Exception Boundary** — Advanced approvals/comparison/reorder remain separate; Purchasing cannot invent a second inventory state.
16. **Audit Requirements** — Request/order/receipt/item quantity/supplier obligation/payment linkage.
17. **Dependencies** — Inventory, Financial, R05.
18. **Existing Documents** — AJM Financial & Resources records, architecture audit, current inventory/resource documentation.
19. **Historical Decisions** — Existing purchasing/resource proposals retained.
20. **Superseded Decisions** — Any duplicate stock engine proposal is superseded.
21. **Implementation Requirements** — Receiving must write/affect canonical inventory state.
22. **Acceptance Criteria** — A purchase can be traced from need through receipt, stock and supplier payment.
23. **Evidence Requirements** — Later persistence and E2E evidence including partial receiving where future hard scenarios apply.
24. **Scenario Coverage** — 34–35, 40.
25. **Closure Condition** — Procurement lifecycle and source-of-truth boundaries are explicit.

---

# R08 — Revenue → Commission → Payroll

1. **Purpose** — Provide auditable collection-based downstream compensation attribution.
2. **Operational Problem** — Invoice value may be incorrectly used as collected revenue or commission basis.
3. **Architectural Decision** — `Procedure/Service attribution → Invoice → Collected Revenue → Eligible Revenue → Commission Basis → Commission → Payroll`.
4. **Domain Owner** — Financial owns revenue/commission rules and financial records; Workforce/Payroll owns compensation execution.
5. **Source of Truth** — Financial records for invoice/payment/collection; workforce/payroll records for compensation execution.
6. **Actors** — Finance, manager, authorized payroll staff.
7. **Authorization** — Commission-rule maintenance, adjustments and payroll approval are separately controlled.
8. **Inputs** — Attribution, invoice, payments, eligibility rules, effective dates, adjustments.
9. **Trigger** — Collection/reconciliation event or payroll period close.
10. **State Transition** — Invoice → collection → eligibility → commission calculation → approved commission → payroll.
11. **Operational Steps** — Attribute service; record invoice; reconcile payment; determine eligible revenue; apply effective-dated rule; approve commission; hand off to payroll.
12. **Cross-Domain Handoff** — Financial result feeds Workforce/Payroll without transferring financial truth.
13. **Output** — Auditable commission result and payroll input.
14. **Next Action** — Review/approve, adjust with audit, or include in payroll.
15. **Failure / Exception Boundary** — Invoice amount alone cannot establish collection or commission eligibility.
16. **Audit Requirements** — Source transactions, rule/version, effective date, calculation, adjustment and approver.
17. **Dependencies** — R01/R03, Financial, Workforce.
18. **Existing Documents** — Financial resources/AJM records, workforce/payroll records, architecture audit.
19. **Historical Decisions** — Existing commission/payroll terminology retained where consistent.
20. **Superseded Decisions** — Invoice=collected revenue is superseded.
21. **Implementation Requirements** — Separate transaction types/states and effective-dated commission rules.
22. **Acceptance Criteria** — Unpaid/partially paid invoices cannot be treated as fully collected for commission basis without explicit rule.
23. **Evidence Requirements** — Later tests with invoice, payment, partial collection, commission and payroll linkage.
24. **Scenario Coverage** — 34–36.
25. **Closure Condition** — Financial basis and payroll handoff are explicit and auditable.

---

# R09 — Communication → Request → Work

1. **Purpose** — Allow communication to generate work without becoming a workflow engine.
2. **Operational Problem** — Messages can be mistaken for tasks or permission grants.
3. **Architectural Decision** — `Message/Conversation → Explicit actionable Request → Coordination/Domain work → Completion → Response/Notification`.
4. **Domain Owner** — Communications owns messages/channels; Coordination owns resulting operational work; source domain owns business truth.
5. **Source of Truth** — Communication records for messages; request/work records for work; source-domain records for business facts.
6. **Actors** — Patient, customer service, reception, follow-up, domain staff.
7. **Authorization** — Receiving/seeing communication differs from authority to execute the requested work.
8. **Inputs** — Message, patient context, explicit request, routing/recipient.
9. **Trigger** — Message received or explicit actionable request created.
10. **State Transition** — Conversation → request (only if explicit) → work → completion → response.
11. **Operational Steps** — Record message; identify explicit request; attach context; route to authorized work owner; execute; close; respond.
12. **Cross-Domain Handoff** — Request references owning-domain object and enters Coordination only when operational work is needed.
13. **Output** — Traceable communication and, where applicable, completed work.
14. **Next Action** — Reply, execute request, route, or escalate.
15. **Failure / Exception Boundary** — Message is not automatically Task; request does not grant missing permission.
16. **Audit Requirements** — Original message, request conversion, actor, permission, work state, response.
17. **Dependencies** — R10, Team & Access, source domains.
18. **Existing Documents** — Communications/PJ/Portal records, architecture audit, terminology governance.
19. **Historical Decisions** — Earlier communication/work proposals retained as evidence.
20. **Superseded Decisions** — Any automatic message→task rule without explicit action semantics is superseded.
21. **Implementation Requirements** — Preserve communication and operational work as separate concepts with references.
22. **Acceptance Criteria** — Normal conversation remains conversation; explicit requests become traceable work without bypassing authorization.
23. **Evidence Requirements** — Later E2E evidence from message to request to authorized work to response.
24. **Scenario Coverage** — 5, 12, 41–42.
25. **Closure Condition** — Communication/work boundary and handoff are explicit.

---

# R10 — Domain Event → Coordination → Authorized Actor → Completion

1. **Purpose** — Provide the central operational fabric between domains.
2. **Operational Problem** — Cross-domain events can lack a clear actor, work state or return path, causing duplicate workflow engines.
3. **Architectural Decision** — `Domain Event → Required Work → Authorized Actor → Assignment/Request/Handoff → Execute → Monitor → Escalate → Close → Analyze`.
4. **Domain Owner** — Journey Coordination owns operational work state; originating domain retains business truth.
5. **Source of Truth** — Coordination for work lifecycle; originating domain for event/business fact; Team & Access for permission; Workforce for availability/capacity.
6. **Actors** — Coordinator, domain operator, clinician, reception, finance, purchasing, follow-up, portal support as authorized.
7. **Authorization** — Eligible actor must satisfy permission/entitlement; skill/qualification may affect eligibility but never grant permission.
8. **Inputs** — Canonical domain event, context, required work type, priority, eligible actor criteria.
9. **Trigger** — Domain event requiring human/operational action.
10. **State Transition** — Event → required work → unassigned/assigned → in progress → blocked/escalated if needed → completed/closed → result returned.
11. **Operational Steps** — Consume event; create work; determine eligible actor; assign/request/handoff; execute; monitor; escalate; close; return result.
12. **Cross-Domain Handoff** — Explicit context and expected result cross domain boundaries; ownership of source fact never moves.
13. **Output** — Completed work plus result/acknowledgement linked to source event.
14. **Next Action** — Follow source-domain next state or create subsequent authorized work.
15. **Failure / Exception Boundary** — Coordination never edits clinical/financial/appointment truth merely to close work; no hidden second engine.
16. **Audit Requirements** — Event ID, work ID, actor, authorization basis, timestamps, state changes, handoffs, escalation, completion result.
17. **Dependencies** — All R01–R09, R11, Team & Access.
18. **Existing Documents** — Architecture audit, PJ/AJM/Stage records, communication/portal records, terminology governance.
19. **Historical Decisions** — Older task/work/handoff proposals retained and reconciled here.
20. **Superseded Decisions** — Competing Coordination ownership of source-domain truth is superseded.
21. **Implementation Requirements** — Distinguish Assignment vs Request vs Handoff; support examples for appointment confirmation, treatment stage due, follow-up, low stock, financial exception, portal request and communication request.
22. **Acceptance Criteria** — Each listed event produces a clear work state, authorized actor, completion and return/result without duplicate source truth.
23. **Evidence Requirements** — Later cross-domain E2E evidence plus audit reconstruction showing event/work/result continuity.
24. **Scenario Coverage** — 6, 20–22, 41–42 and all scenarios with cross-domain operational work.
25. **Closure Condition** — Central operational-fabric contract is explicit and all source-domain ownership boundaries are preserved.

---

# R11 — Skill / Qualification / Permission / Capability / Entitlement

1. **Purpose** — Prevent semantic ambiguity from corrupting authorization and routing.
2. **Operational Problem** — Role, permission, skill, qualification, capability and entitlement can be conflated.
3. **Architectural Decision** — Role=organizational label; Permission=authorization; Capability=platform/business capability; Skill=human competence; Qualification=formal credential; Entitlement=right to use a capability.
4. **Domain Owner** — Team & Access owns authorization/entitlement; Workforce owns employee/skill/qualification facts; Medical/clinical domains define procedure competence requirements.
5. **Source of Truth** — Permission/entitlement records for access; Workforce records for skill/qualification; Role records for organizational template.
6. **Actors** — Admin, employee, manager, system/router.
7. **Authorization** — Permission/entitlement govern access; skill/qualification can qualify eligibility but never grant permission.
8. **Inputs** — User, role, permission, entitlement, employee, skill, qualification, procedure requirements.
9. **Trigger** — Access request, assignment, procedure eligibility check or configuration change.
10. **State Transition** — Identity/workforce facts + access grants → eligibility evaluation → authorized/unauthorized execution decision.
11. **Operational Steps** — Resolve user/employee; resolve role and permissions; resolve entitlement; resolve skill/qualification; evaluate procedure eligibility; enforce authorization.
12. **Cross-Domain Handoff** — Workforce supplies competence facts; Team & Access supplies authorization; Coordination/Agenda consume both without merging them.
13. **Output** — Explicit authorization and competence/eligibility result.
14. **Next Action** — Allow, deny, route to qualified actor, or request authorized delegation/configuration.
15. **Failure / Exception Boundary** — Skill/qualification never silently becomes permission; role name never alone grants authorization.
16. **Audit Requirements** — Permission decision, entitlement, role, competence evidence and effective dates where relevant.
17. **Dependencies** — R04, R05, R10, Team & Access.
18. **Existing Documents** — `CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`, AJM Team & Access records, Workforce/Agenda records.
19. **Historical Decisions** — Historical terminology is retained but classified under glossary policy.
20. **Superseded Decisions** — Any wording that uses skill/capability/qualification as authorization is superseded/clarified.
21. **Implementation Requirements** — Keep concepts distinct in data, authorization checks and documentation.
22. **Acceptance Criteria** — A user may possess competence without permission; a user may have permission but still fail competence requirements where the procedure requires qualification.
23. **Evidence Requirements** — Later authorization/eligibility tests for multi-role employees and procedure/resource matching.
24. **Scenario Coverage** — 17, 39, plus all actor/authorization-sensitive scenarios.
25. **Closure Condition** — Terminology and behavioral boundaries are consistent across the remediation bundle.

---

# Global contract invariants

- Patient truth remains Patient/PJ-owned.
- Appointment truth remains Agenda-owned.
- Treatment Plan remains clinical/PJ-owned.
- Financial truth remains Financial-owned.
- Workforce truth remains Workforce-owned.
- Communication truth remains Communications-owned.
- Coordination owns operational work state, not source-domain truth.
- Permission truth remains Team & Access-owned.
- Inventory remains the stock source of truth.
- No contract creates a second engine for another domain.
- `Role ≠ Permission`, `Employee ≠ User`, `Skill ≠ Permission`, `Qualification ≠ Permission`, `Workspace ≠ Security`.
- Visibility is not authorization.
- All implementation acceptance is deferred to the later Reality/implementation phase.
