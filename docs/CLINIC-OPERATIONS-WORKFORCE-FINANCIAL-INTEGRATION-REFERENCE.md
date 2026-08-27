# CORE SYSTEM — Financial & Resources Engineering Blueprint

**Status:** Final pre-implementation engineering reference — reconciled with PJ and adjacent domains
**Domain:** Financial & Resources
**Scope:** Tenant / Clinic operational environment
**Authority:** This document governs the Financial & Resources domain unless a later explicit architectural decision supersedes it.

## 1. Product position

CORE SYSTEM exists to enable and manage the complete patient journey inside the clinic. Financial & Resources supports that journey; it does not own the Patient Journey and is not a full accounting ERP.

The target is simple daily financial/resource workflows with deeper automation, controls, historical data and intelligence in the background.

The operating objective is:

**Patient Journey Outcome + Business Performance**

subject to:

**Clinical + Administrative + Financial + Legal/Compliance controls.**

Super Admin is outside this tenant operating domain.

## 2. Consolidated domain

```text
Financial & Resources
├── Billing
├── Payments
├── Installments
├── Insurance
├── Inventory
├── Purchasing
├── Suppliers
└── Financial Automation
```

These are one consolidated operational domain, not unrelated sidebar silos. They must not create duplicate Patient, Treatment Plan, Agenda, Follow-up, Notification, Permission or Analytics systems.

## 3. Existing baseline — reuse and extend

The repository already provides financial/resource foundations including invoicing, invoice items, payment representation, partial payments, insurance-related payment classification, inventory transactions/ledger, inventory KPIs and reporting/KPI infrastructure.

Decision: **REUSE + EXTEND**, not rebuild.

The existing Treatment Plan, Patient Portal, Follow-up and Agenda domains remain canonical PJ/operational domains and are integration anchors.

## 4. Billing

### Core
- Invoice creation and items.
- Service/procedure linkage.
- Discounts/controlled adjustments.
- Status and payment method.
- Partial payments.
- Outstanding balance.
- Patient financial history.
- Auditability.

### Advanced
- Advanced invoice workflows.
- Advanced adjustments and reconciliation.
- Country-specific electronic invoicing.
- Advanced financial reporting.

CORE must not become a full accounting ERP.

## 5. Payments

Payments are a core journey capability, not merely an invoice status.

```text
Treatment / Service → Invoice → Payment / Collection
→ Allocation / Reconciliation → Outstanding / Settled
```

Payment data must support installments, insurance reconciliation, collected-revenue attribution, Patient Portal visibility, Financial Automation and workforce commissions where applicable.

Historical payment meaning must be preserved; corrections use auditable adjustments rather than silent overwrites.

## 6. Installments — Core

Installments are explicitly **Core** because they connect Financial & Resources with Treatment Plan and Patient Portal.

```text
Treatment Plan
 → Financial Plan
 → Installment Schedule
 → Due Amounts
 → Payments
 → Patient Portal
```

Support schedules, due dates, amounts, payment state, remaining balance and appropriate patient-facing visibility.

Portal remains optional to internal operation; internal clinic workflow must work without Portal.

## 7. Insurance — Core minimum + Advanced integrations

### Core
- Mark patient as insurance-linked.
- Payer/insurance company.
- Coverage context.
- Financial responsibility where known.
- Claim-ready information.
- Clinic reconciliation/matching information.

### Advanced
- Electronic payer integrations.
- Country-specific insurance systems.
- Eligibility automation.
- Electronic claims exchange.
- Automated reconciliation.

External integrations are optional integrations and must not become prerequisites for the internal journey.

## 8. Inventory

Inventory is an existing canonical domain and must be extended.

### Core
- Item/catalog.
- Stock balance.
- Purchases.
- Consumption.
- Returns.
- Audited adjustments.
- Low-stock visibility.
- Procedure/session context where applicable.
- Basic inventory reporting.

### Advanced
- Advanced stock management.
- Forecasting.
- Advanced consumption analysis.
- Advanced purchasing controls.
- Cost optimization.
- Future multi-location optimization.

Canonical flow:

```text
Treatment / Procedure
 → Session / Activity
 → Material Consumption
 → Inventory Ledger
 → Cost / KPI / Financial Automation
```

## 9. Purchasing & Suppliers

Existing purchase transactions do not equal a complete procurement system.

### Core
- Supplier records.
- Basic purchasing.
- Purchase request/order where justified.
- Receiving.
- Supplier linkage.
- Purchase history.
- Basic supplier financial context.

### Advanced
- Approval workflows.
- Advanced procurement.
- Supplier performance.
- Price history/comparison.
- Reorder automation.
- Advanced purchasing analytics.

Purchasing extends the existing Inventory foundation; it does not create another stock system.

## 10. Financial Automation — background-first

Financial Automation is an approved cross-domain capability and must have data/event readiness from day one even when advanced workflows are not exposed in the daily UI.

Inputs:

- Billing.
- Payments.
- Installments.
- Insurance.
- Purchasing.
- Inventory.
- Treatment Plans.
- Workforce/commissions where relevant.

Target:

```text
Financial Events
 → Rules / Schedules / Reconciliation
 → Actions / Alerts / Exceptions
 → KPIs / Insights
 → Future AI
```

Advanced automation may remain behind the scenes initially, but its historical data, event model and auditability must be preserved.

## 11. Integration with Patient Journey

Financial functions support, but do not own, the journey.

```text
Treatment Plan
 → Financial Plan
 → Invoice / Installments
 → Payment
 → Portal visibility where enabled
```

```text
Treatment / Procedure
 → Consumption
 → Inventory
 → Cost / Intelligence
```

```text
Patient
 → Insurance-linked status
 → Eligible financial context
 → Claim-ready data
 → Reconciliation
```

Financial events may provide signals to Follow-up, but Follow-up remains the canonical PJ domain.

## 12. Integration with Workforce

Financial & Resources and Workforce are separate domains.

```text
Workforce
 → Work Performed
 → Attribution
 → Revenue / Cost
 → Compensation
 → Payroll
 → Performance
```

Commission logic must distinguish invoice value, collected revenue, eligible revenue, attribution rule and commission rule. A commission must not automatically equal invoice value when the clinic rule is based on collected revenue.

## 13. Analytics, automation and AI data

First-class historical data should include:

- Transaction identity.
- Patient-journey context.
- Service/procedure.
- Invoice/payment state.
- Collection date.
- Insurance state.
- Installment state.
- Inventory consumption.
- Supplier/purchase context.
- Cost.
- Attribution.
- Rules used and effective dates.
- Approval/override history.
- Reconciliation outcomes.

Do not manufacture unreliable KPIs from missing events. Capture the underlying event first.

Advanced data may produce management indicators before the complete advanced workflow is exposed.

## 14. Core / Advanced / Future-ready

### Core
Billing; Payments; Installments; basic Insurance; Inventory; basic Purchasing; Suppliers; core financial KPIs; audit/control mechanisms; Treatment Plan integration; Portal integration where enabled.

### Advanced
Advanced billing; advanced inventory; advanced procurement; advanced supplier management; insurance integrations; country-specific electronic invoicing; advanced financial automation; advanced reconciliation; advanced cost/revenue intelligence.

### Future-ready
Predictive financial forecasting; automated reconciliation at scale; AI financial analysis; AI exception detection; controlled AI actions.

Advanced does not mean data is ignored today. The approved background data foundation should exist from day one.

## 15. Controls

Financial simplicity must not weaken controls. Support as applicable:

- Permission enforcement.
- Audit trails.
- Approval boundaries.
- Period locking.
- Traceable adjustments.
- Effective-dated rules.
- Historical preservation.
- Tenant isolation.
- Country-localized legal rules.
- Separation of duties where required.

## 16. Domain boundaries

Financial & Resources does not own:

- Patient identity.
- Appointment scheduling.
- Agenda.
- Queue.
- Visit.
- Treatment Plan business logic.
- Follow-up business logic.
- Patient Portal authorization.
- Team & Access authorization.
- Analytics as a separate duplicate system.

The domain integrates with these canonical domains through explicit contracts.

## 17. Final reconciliation decisions

1. Installments are **Core**.
2. Insurance minimum is **Core**; external insurance integrations are **Advanced**.
3. Financial Automation is an approved cross-domain layer with data/event readiness from day one.
4. Advanced capabilities may produce background data/KPIs before their full workflow is exposed.
5. Inventory remains canonical; Purchasing extends it.
6. Billing and Payments remain distinct responsibilities inside the consolidated Financial & Resources domain.
7. Treatment Plan and Patient Portal remain canonical PJ domains and integration anchors.
8. Financial/legal/audit controls remain mandatory regardless of patient/team optimization.
9. No accounting ERP expansion.
10. No duplicate analytics, notification, follow-up, permission or patient systems.

## 18. Implementation rule

```text
Approved Domain Decision
 → Inspect Repository
 → Inspect Live Database
 → Inspect PJ Contract
 → Reuse
 → Extend
 → Integrate
 → Validate
 → Document
```

A capability is not complete merely because code, UI or a table exists. Workflow, permissions, tenant isolation, integration, failure handling, runtime validation and documentation must be satisfied where applicable.

**End of Financial & Resources Engineering Blueprint.**
