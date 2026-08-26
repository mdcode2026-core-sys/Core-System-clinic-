# CORE SYSTEM — Clinic Operations & Workforce / Financial Integration Reference

**Status:** Conceptual reference / architecture baseline
**Scope:** Clinic Operations (Workforce, Agenda, Resources, Operational Performance) and its integration with Financial & Resources and Patient Journey (PJ)
**Platform governance:** Out of scope for this document. Super Admin remains outside the tenant operational system.

## 1. Purpose

This document records the current reconciliation between the existing CORE SYSTEM repository and the approved direction for the next Clinic Operations and Financial & Resources work. It is a reference for future implementation planning. It does not authorize implementation by itself.

The governing product principle is:

> CORE SYSTEM exists to enable and manage the complete patient journey inside the clinic. Clinic operations, workforce, agenda, financial controls, inventory and resources are supporting operating capabilities around that journey—not a replacement for it.

The journey starts when the clinic receives an initial contact or appointment and continues beyond the visit through treatment, payment, follow-up, retention and other continuing interactions.

## 2. Architectural boundaries

### 2.1 Tenant operational system

The tenant-facing CORE system contains the complete operational environment used by clinics.

It includes:

- Patient Journey
- Clinical workflow
- Treatment Plans
- Patient Portal
- Follow-up
- Agenda
- Queue
- Rooms / resources
- Workforce
- Financial & Resources
- Operational reporting and intelligence

### 2.2 Platform Governance

Super Admin is not part of the tenant operational workflow. It belongs to a separate platform-governance layer concerned with the technical product, tenants, platform configuration, support, training, maintenance and product-level controls.

It must not be treated as another clinic role inside the tenant operating model.

## 3. Core operating philosophy

The system should optimize for a sustainable outcome rather than maximize a single metric.

Conceptually:

**Patient Journey Outcome + Team Sustainability + Business Performance**

subject to:

**Clinical + Administrative + Financial + Legal/Compliance controls.**

The system must therefore never trade away financial, administrative, legal or audit controls merely to improve patient convenience or workforce convenience.

The patient remains the primary business/operational objective, while the team is a necessary operating resource and stakeholder whose sustainable capacity must be respected.

## 4. Existing repository foundations to reuse

The current repository already contains significant foundations that must be reused rather than rebuilt.

### 4.1 Users

Existing user/domain structures provide tenant user identity and role context.

**Decision:** REUSE.

Important distinction:

- User = system account/access identity.
- Employee = workforce/employment identity.

A user and an employee must not become the same conceptual entity merely because many employees have user accounts.

### 4.2 Roles & Permissions

The existing role/permission architecture is a PJ-era foundation and includes role permissions and user-level override concepts.

**Decision:** REUSE + EXTEND.

Workforce must reference system roles/permissions where appropriate, but Job/Position, Employment status and system Role remain distinct concepts.

### 4.3 Agenda

Agenda already exists as an independent domain and must remain separate from Workforce.

**Decision:** REUSE + EXTEND.

Agenda answers primarily:

> When does operational work occur?

Workforce answers primarily:

> Who can perform it, under what employment/availability/capacity conditions?

### 4.4 Availability

The repository already contains availability logic connected to working hours, blocked periods and agenda conflicts.

**Decision:** REUSE + EXTEND.

The future Workforce model should add capacity and workforce constraints without replacing Agenda's appointment responsibility.

### 4.5 Queue

Queue is already an independent operational domain.

**Decision:** REUSE + INTEGRATE.

Expected flow:

Appointment → Arrival → Queue → Staff/Resource assignment → Clinical work.

### 4.6 Rooms / Resources

Rooms already exist as a domain and Agenda already accounts for room conflicts.

**Decision:** REUSE + EXTEND.

Future resource modeling may add equipment, capabilities, maintenance/availability and utilization where genuinely useful.

### 4.7 Treatment Plans

Treatment Plan is already a PJ domain and must remain a primary integration anchor.

**Decision:** REUSE + INTEGRATE.

It can drive financial planning, installment schedules, consumption expectations and operational requirements.

### 4.8 Patient Portal

Patient Portal is already part of the implemented PJ architecture.

**Decision:** REUSE + INTEGRATE.

Financial capabilities such as installment visibility and payment-related patient interactions must connect to the existing journey/portal rather than create a second patient-facing financial model.

### 4.9 Follow-up

Follow-up already exists as part of the extended patient journey.

**Decision:** REUSE + INTEGRATE.

Financial and workforce events may provide useful signals, but Follow-up remains a patient-journey capability.

### 4.10 Reporting / KPI infrastructure

The repository contains reporting and KPI infrastructure, including domain-specific financial/inventory KPIs.

**Decision:** REUSE + EXTEND.

Do not create a second analytics system for Workforce or Financial & Resources.

## 5. Financial & Resources reconciliation

### 5.1 Invoicing

The repository already contains invoice structures and UI, including invoice items, status, payment method, partial payments, insurance-related payment classification, discounts and related controls.

**Decision:** REUSE + EXTEND.

Target relationship:

Patient Journey → Service/Treatment → Invoice → Payment → Insurance/Installment → Follow-up/Portal.

### 5.2 Payments

Payments are already represented within the invoicing model.

**Decision:** REUSE + EXTEND.

Future work should strengthen payment allocation, reconciliation, installment execution and collected-revenue attribution without turning CORE into a full accounting ERP.

### 5.3 Installments

Installment payment terms already exist in the financial model.

**Decision:** ACTIVE CORE CAPABILITY + EXTEND.

Installments are not a dormant advanced feature because they directly support Treatment Plans and Patient Portal.

Target flow:

Treatment Plan → Financial Plan → Installment Schedule → Due Amounts → Payments → Patient Portal.

### 5.4 Insurance

Insurance payment classification exists at a basic level.

**Decision:** EXTEND.

Core minimum should support identifying insurance-linked patients, payer/coverage context and claim-ready/reconciliation information for the clinic.

External payer integrations and country-specific insurance integrations are later integration layers, not prerequisites for the core model.

### 5.5 Inventory

Inventory is already a real domain with ledger/transactions, UI, actions/queries and inventory KPIs. Existing ledger concepts include purchase, purchase return, doctor request, unused return and adjustments. Inventory entries can already carry procedure/session-related context.

**Decision:** REUSE + EXTEND.

Target model:

Treatment/Procedure → Session → Material Consumption → Inventory → Cost → Financial/Operational Intelligence.

### 5.6 Inventory intelligence

Existing inventory KPI foundations include turnover, consumption, low-stock risk, adjustment and purchase-return indicators.

**Decision:** REUSE + EXTEND.

Where data is currently insufficient for a KPI, add the underlying transaction/event rather than manufacturing an unreliable metric.

### 5.7 Purchasing / Suppliers

The current repository has purchase-related inventory transactions, but that is not equivalent to a complete procurement domain.

Missing/insufficient capabilities include supplier records, purchase orders, approvals, receiving, supplier invoice/balance context and purchasing workflow.

**Decision:** CREATE on top of existing Inventory foundations.

### 5.8 Financial Automation

Financial Automation should be a cross-domain operational layer rather than another duplicate financial UI/domain.

It should consume events from:

- Invoicing
- Payments
- Installments
- Insurance
- Purchasing
- Inventory
- Treatment Plans

and support rules, alerts, scheduled actions, reconciliation and financial KPIs.

Advanced capabilities may remain behind the scenes initially, but the required data and event model should exist from day one.

## 6. Workforce reconciliation

The repository has users, roles/permissions, Agenda, availability, Queue, Rooms and reporting foundations, but does not currently contain a complete Workforce domain covering employee lifecycle and employment operations.

### 6.1 Employee

**Decision:** CREATE.

Employee must be an operational/employment entity distinct from User.

### 6.2 Employment / Contracts

**Decision:** CREATE.

At minimum support employment status, position, employment type, dates, contract terms, working pattern and compensation context.

### 6.3 Recruitment

**Decision:** CREATE.

Scope should be clinic-oriented rather than a general-purpose recruiting platform:

Staffing need → Position → Candidate → Evaluation → Offer → Employment.

Recruitment should eventually connect to workforce-capacity gaps and budgeting.

### 6.4 Attendance / Time

**Decision:** CREATE.

Attendance must support operational capacity and payroll, not merely presence tracking.

Attendance/time data should be usable for:

- Working-time evidence
- Overtime
- Absence
- Payroll inputs
- Capacity
- Agenda availability
- Operational analysis

### 6.5 Leave / Absence

**Decision:** CREATE.

Minimum capabilities should include leave types, entitlement/balance, accrual where applicable, approval, public holidays, partial leave and payroll/availability impact.

### 6.6 Payroll

**Decision:** CREATE.

CORE should provide clinic-sized payroll capability rather than compete with enterprise payroll suites.

Core concepts:

- Salary
- Salary components
- Allowances
- Deductions
- Overtime
- Bonuses
- Commissions
- Leave/absence effects
- Payroll periods
- Payslips
- Employer cost
- Audit and period locking

Country-specific payroll/legal rules should be implemented through a localization layer rather than hard-coded into the universal model.

### 6.7 Benefits

**Decision:** CREATE.

Benefits should support the clinic's total employment-cost picture without requiring a full enterprise benefits administration platform.

### 6.8 Commissions / Incentives

**Decision:** CREATE.

This is a high-value clinic capability because doctors, reception/coordinators and other staff may have revenue-based commissions or incentives.

Commission attribution must remain separate from compensation rules.

Example:

Patient → Appointment → Visit/Procedure → Invoice → Collected Revenue → Attribution → Commission Rule → Eligible Commission.

Commission must not automatically be calculated from an appointment or invoice total if the clinic's rule is based on collected revenue.

### 6.9 Performance

**Decision:** CREATE + INTEGRATE WITH EXISTING ANALYTICS.

Performance must not be reduced to number of patients seen.

Relevant dimensions may include:

- Workload
- Productivity
- Quality indicators
- Reliability
- Attendance
- Operational contribution
- Financial contribution
- Patient-flow contribution
- Compliance

The system should distinguish activity, attribution, financial contribution and actual performance rather than collapsing them into one score.

## 7. Workforce ↔ Agenda boundary

Workforce and Agenda are separate domains with an explicit integration contract.

### Workforce owns

- Employee status
- Working patterns
- Employment constraints
- Skills/capabilities
- Availability inputs
- Capacity
- Leave/absence
- Workload
- Workforce cost

### Agenda owns

- Appointment scheduling
- Booking lifecycle
- Appointment timing
- Schedule conflicts
- Operational calendar/agenda behavior

### Shared operating layer

Availability → Capacity → Requirements → Agenda scheduling.

A resource being technically available does not necessarily mean it has usable capacity.

## 8. Workforce ↔ Patient Journey

The patient journey remains the anchor.

Typical flow:

Appointment → Agenda → Arrival/Queue → Workforce/Resource → Clinical Work → Treatment → Payment → Follow-up.

Workforce data should help explain whether the clinic can reliably deliver the intended journey without treating employees as disposable capacity.

## 9. Workforce ↔ Financial & Resources

This is a closed operational loop:

Workforce → Work performed → Attribution → Revenue/Cost → Compensation → Payroll → Performance.

Examples include:

- Doctor salary + procedure commission
- Reception salary + conversion incentive
- Overtime affecting payroll and capacity
- Absence affecting Agenda capacity
- Staff cost compared with associated collected revenue
- Resource usage affecting treatment cost

Financial contribution must never be presented as identical to employee profit.

## 10. Financial & Resources ↔ Patient Journey

The financial domain must support the journey rather than interrupt it.

Examples:

### Treatment Plan

Treatment Plan → Financial Plan → Invoice/Installments → Payment → Patient Portal.

### Inventory

Treatment/Procedure → Consumption → Inventory → Cost/Reporting.

### Insurance

Patient → Insurance-linked financial status → Eligible services → Claim-ready information → Reconciliation.

### Follow-up

Financial events can become journey signals without replacing the Follow-up domain.

## 11. Operational intelligence

Analytics should be built from operational events rather than manually maintained dashboards.

Target flow:

Domain Events/Transactions → Data Model → KPIs → Operational Insights → Automation → Future AI.

Advanced data may exist and produce useful management indicators before its full workflow is exposed as an advanced feature.

This is intentional: CORE should be able to learn from the clinic from day one.

## 12. Core vs Advanced vs Future-ready

### Core operational capability

Should be usable by ordinary clinics with minimal training:

- Employees
- Employment basics
- Roles/permissions integration
- Working patterns
- Attendance
- Leave
- Core payroll
- Basic commissions/incentives
- Agenda integration
- Capacity basics
- Rooms/resources
- Invoicing
- Payments
- Installments
- Basic insurance status and claim-ready data
- Inventory
- Basic purchasing
- Core operational KPIs
- Audit/control mechanisms

### Advanced capability

May be exposed as higher-value modules/add-ons:

- Advanced payroll/compensation rules
- Complex commission plans
- Advanced workforce planning
- Advanced performance analytics
- Advanced procurement
- Advanced inventory management
- Cost-to-revenue analysis
- Capacity forecasting
- Advanced insurance integrations
- Country-specific electronic invoicing integrations
- Advanced financial automation
- Advanced operational optimization

### Future-ready capability

The data model should support later:

- Predictive capacity
- Workforce optimization
- Financial forecasting
- Automated reconciliation
- Predictive staffing
- AI operational recommendations
- AI financial analysis
- Controlled AI actions

The future-ready layer should not be allowed to complicate today's daily UI.

## 13. Compliance and control principles

Operational optimization is subordinate to required controls.

The system should provide, as appropriate:

- Permission enforcement
- Approval boundaries
- Audit trail
- Effective-dated compensation and employment terms
- Payroll period closing/locking
- Historical corrections through adjustments rather than silent overwrites
- Country-localized legal/financial rules
- Separation of duties where required
- Traceable attribution for financial calculations
- Tenant isolation

The objective is to make correct operation easy, not to remove controls for convenience.

## 14. Data principles for future automation and AI

The following should be treated as first-class historical data where relevant:

- Who performed work
- What work was required
- What work was performed
- When it was performed
- Planned vs actual duration
- Resource used
- Patient-journey context
- Financial transaction context
- Compensation rule used
- Effective date of the rule
- Approval/override history
- Capacity and workload
- Attendance and absence
- Inventory consumption
- Payment/collection state
- Operational outcomes

Historical records should not be overwritten merely to reflect current rules. Effective dating and auditable adjustments are preferred.

## 15. Reuse / Extend / Create map

| Area | Repository baseline | Direction |
|---|---|---|
| Users | Existing | REUSE |
| Roles | Existing | REUSE |
| Permissions | Existing/PJ | EXTEND |
| Agenda | Existing | REUSE + EXTEND |
| Availability | Existing | REUSE + EXTEND |
| Queue | Existing | REUSE + INTEGRATE |
| Rooms | Existing | REUSE + EXTEND |
| Treatment Plans | Existing/PJ | REUSE + INTEGRATE |
| Patient Portal | Existing/PJ | REUSE + INTEGRATE |
| Follow-up | Existing/PJ | REUSE + INTEGRATE |
| Reporting/KPIs | Existing | REUSE + EXTEND |
| Invoicing | Existing | REUSE + EXTEND |
| Payments | Existing | REUSE + EXTEND |
| Installments | Existing foundation | ACTIVE + EXTEND |
| Insurance | Basic foundation | EXTEND |
| Inventory | Existing | REUSE + EXTEND |
| Inventory KPIs | Existing | REUSE + EXTEND |
| Purchasing | Partial inventory basis | CREATE + INTEGRATE |
| Suppliers | Missing/insufficient | CREATE |
| Financial Automation | Missing as cross-domain layer | CREATE |
| Employee | Missing | CREATE |
| Employment/Contracts | Missing | CREATE |
| Recruitment | Missing | CREATE |
| Attendance | Missing as Workforce capability | CREATE |
| Leave | Missing | CREATE |
| Payroll | Missing | CREATE |
| Benefits | Missing | CREATE |
| Commissions | Missing | CREATE |
| Incentives | Missing | CREATE |
| Workforce Performance | Missing | CREATE + ANALYTICS INTEGRATION |
| Workforce Analytics | Partial analytics foundation | EXTEND |
| Compliance controls | Partial/shared foundation | EXTEND |
| Audit | Existing foundation | REUSE + EXTEND |

## 16. Non-goals

This reference does not authorize building:

- A full enterprise HR suite
- A full accounting ERP
- A full recruitment marketplace
- A full insurance administration platform
- A universal payroll engine without country localization
- An autonomous AI workforce manager
- A second calendar/agenda system
- A second analytics platform

CORE should provide the smallest complete clinic-operating capability that produces the required business, operational and patient-journey outcomes, while keeping deeper complexity in the background.

## 17. Governing implementation principle

Before implementing any item:

1. Inspect existing PJ and repository capability.
2. Reuse existing entities and workflows where valid.
3. Extend existing foundations before creating duplicates.
4. Create a new domain only when a real capability is missing.
5. Preserve existing tenant isolation, permissions, auditability and PJ behavior.
6. Keep the daily UI simple even when the underlying model is sophisticated.
7. Capture important operational and financial data from day one so later automation and AI do not need historical reconstruction.

## 18. Current status

This document is a **reference baseline for reconciliation and future implementation planning**. Individual components remain subject to detailed domain decisions before implementation.

It should be updated when a component's final scope is approved or when repository implementation materially changes the architecture described here.
