# ADR-008 — CORE Financial & Inventory Cross-Domain Architecture

**Date:** 2026-09-04  
**Status:** Approved / Frozen for Gap-Map Audit  
**Scope:** Financial + Inventory + their relationships with the rest of CORE SYSTEM

## 1. Context

Previous financial/inventory documentation described the internal building blocks but did not fully define how those domains exchange business facts with Patient, Patient Flow, Visit, Treatment Plan, Medical Master Library, Service Catalog, Workforce, Agenda, Insurance, Purchasing, Reporting, Portal, Subscription and future integrations.

The purpose of this ADR is to establish the complete architectural boundary before the integrated Gap Map. It does not authorize implementation changes by itself.

## 2. Core Decision

CORE SYSTEM remains a **Clinic Operating System**, not an ERP. Financial and Inventory are foundational engines whose operational UI remains simple while their advanced configuration, controls, audit history, costing, valuation, reconciliation and reporting remain available in advanced layers.

The architecture is:

`Clinical / Operational Event → Commercial or Resource Event → Financial / Inventory Record → Downstream Effect → Reporting / Integration`

Financial and Inventory are independent domains, but they are integrated with the clinical and operational domains through explicit business relationships. No duplicate financial engine, inventory engine, permission engine, or parallel tables may be created to solve a gap where an existing canonical entity can be reused or extended.

## 3. Financial Domain Components

The Financial domain includes, as applicable:

- Charges / billable events
- Invoices and invoice lines
- Payments / receipts / payment vouchers
- Payment methods and cashier attribution
- Financial plans and installments
- Discounts and discount approval/audit
- Insurance responsibility, claims and reconciliation
- Refunds as a lifecycle distinct from cancellation
- Supplier bills / payables and supplier payments
- Workforce commissions
- Operating expenses
- Financial audit history
- Financial reporting and analytics
- Future accounting integration boundary

These are financial capabilities, not necessarily separate UI modules or separate database tables. The canonical existing entity must be reused whenever it already represents the required business fact.

## 4. Inventory Domain Components

Inventory includes:

- Item master/classification
- Units of measure
- Purchase cost
- Current valuation cost
- Stock quantity
- Stock value
- Optional selling price
- Procedure-cost eligibility
- Operating-consumable eligibility
- Batch / lot / expiry rules where applicable
- Inventory ledger / movement history
- Procedure consumption
- Receiving
- Adjustments
- Returns
- Expired/damaged stock handling
- Inventory reporting and valuation

Inventory is not quantity-only. Where economically relevant, quantity, cost/valuation and movement traceability must remain coherent.

## 5. Costing Decision

CORE distinguishes:

1. **Purchase Cost** — acquisition cost from supplier purchasing/receiving.
2. **Inventory Valuation Cost** — the current accounting/management valuation of stock.
3. **Procedure Material Cost** — cost consumed by a clinical procedure.
4. **Operating Consumable Cost** — stock consumed for clinic operations but not attributable to a specific procedure.
5. **Selling Price** — optional commercial price for an inventory item where the clinic needs it for pricing decisions.
6. **Revenue** — amount charged/recognized from a commercial event.
7. **Margin / Profitability** — derived from revenue less relevant cost and adjustments.

A material used in a procedure may therefore have both a cost role and an optional commercial/selling-price role. Selling price does not turn Inventory into an ERP sales catalog.

## 6. Cross-Domain Relationships

Each relationship is classified as:

- **Core Mandatory** — required for normal CORE operation or data integrity.
- **Integrated Optional** — supported when the related capability is enabled or used.
- **Advanced Layer** — operationally hidden/simple but exposed in advanced settings, controls or reports.
- **Future Integration** — reserved boundary for later external/system expansion.
- **Not Applicable** — no direct business dependency.

### 6.1 Patient

`Patient → Charge/Invoice → Patient Responsibility → Payment/Outstanding`

Classification: **Core Mandatory**.

Patient is the canonical subject of patient-facing commercial and financial responsibility. Financial records must not create an alternative patient identity.

### 6.2 Patient Flow / Session / Visit

`Visit/Session → Billable Event → Charge/Invoice → Payment`

and, when procedure resources are consumed:

`Visit/Procedure → Inventory Consumption → Cost`

Classification: **Core Mandatory** for clinical-linked billing and procedure costing; standalone commercial sale is also supported where appropriate.

### 6.3 Treatment Plan

`Treatment Plan → Approved/Performed Procedure or Service → Charge → Invoice`

Treatment Plan is a clinical decision/plan, not the financial ledger. Financial records reference the resulting billable event. Treatment-plan creation must not itself imply payment unless the business event actually occurred.

Classification: **Core Mandatory** where treatment-plan procedures are billed; otherwise no artificial financial record is created.

### 6.4 Medical Master Library / Procedure / Service Catalog

`Master Procedure / Service → Clinic Catalog → Price / Billable Definition → Charge`

and:

`Procedure → Required Material Definition → Inventory → Procedure Cost`

Classification: **Core Mandatory** for canonical clinical/commercial identity; detailed costing configuration is **Advanced Layer**.

The Medical Master Library remains scientific/master data. Financial records must reference the canonical procedure/service identity rather than duplicate procedure definitions.

### 6.5 Workforce / Provider

`Provider/Employee → Performed Procedure → Revenue Attribution / Commission Basis → Commission Entry`

Classification: **Integrated Optional**, with commission rules and analysis as **Advanced Layer**.

Workforce identity must remain canonical in Workforce; Financial stores the financial consequence/attribution, not a duplicate employee master.

### 6.6 Agenda / Appointment

`Appointment → Attendance/Visit → Billable Event`

Classification: **Core Mandatory indirectly**. Appointment is not itself a financial transaction. Financial consequences arise from the configured business event (service performed, cancellation policy, deposit, etc.).

### 6.7 Insurance

`Charge → Invoice → Coverage → Insurance Portion + Patient Portion → Claim → Reconciliation → Final Responsibility`

Classification: **Integrated Optional**; when insurance is enabled, integrity controls are **Core Mandatory** for that flow.

Insurance coverage remains the source of coverage facts. Claims and reconciliation represent financial consequences and settlement state; they must not duplicate patient/coverage identity.

### 6.8 Purchasing / Suppliers

`Supplier → Purchase Order → Receiving → Inventory`

and:

`Supplier → Purchase Bill → Payable → Payment`

Classification: **Core Mandatory for inventory purchasing**, with payable/payment depth as **Integrated Optional / Advanced Layer** depending on clinic configuration.

Receiving changes stock. Supplier billing creates an obligation. Payment settles the obligation. These are distinct business events.

### 6.9 Inventory ↔ Procedures

`Procedure → Required/Consumed Material → Inventory Ledger → Procedure Cost`

Classification: **Core Mandatory** for clinics using procedure materials; operating consumables are **Integrated Optional**.

Consumption must remain traceable to its source event where the business context is known.

### 6.10 Discounts

`Price/Charge → Discount → Approval (when required) → Net Charge → Invoice`

Classification: **Core Mandatory as a financial concept**; approval thresholds, roles and detailed analytics are **Advanced Layer**.

A discount is a financial adjustment event, not merely an overwritten price. Cancellation and refund are separate lifecycle concepts.

### 6.11 Payments / Receipts / Payment Vouchers

`Invoice/Responsibility → Payment → Receipt/Voucher → Outstanding Update`

Classification: **Core Mandatory**.

Partial payments are valid. Payment attribution, method, reference and receipt history belong to the payment event. Installment schedules do not replace actual payment transactions.

### 6.12 Installments / Financial Plans

`Financial Plan → Due Schedule → Actual Payment → Outstanding`

Classification: **Integrated Optional**; schedule configuration and aging analysis are **Advanced Layer**.

An installment is a due obligation/schedule item. A payment is an actual financial event. They must remain distinct but linked.

### 6.13 Refunds / Returns / Expiry

Financial:
`Payment/Invoice → Refund → Financial Reversal/Adjustment`

Inventory:
`Stock Movement → Return / Expiry / Damage → Ledger + Quantity + Valuation Effect`

Classification: **Integrated Optional**, becoming **Core Mandatory** once the corresponding business event is supported.

Refund must not be represented as invoice cancellation. Inventory expiry/return must not be represented by an unexplained stock adjustment where traceability is expected.

### 6.14 Operating Expenses

`Expense Event → Expense Record → Payment/Settlement → Expense Reporting`

Classification: **Integrated Optional / Advanced Layer**.

Expenses are clinic operating costs and must not be confused with inventory acquisition cost or patient invoice revenue.

### 6.15 Reporting / Analytics

Financial and Inventory are data producers for:

- Revenue
- Collections
- Outstanding balances
- Installments/aging
- Insurance claims/reconciliation
- Supplier payables
- Inventory quantity/value
- Consumption
- Procedure cost
- Procedure margin/profitability
- Discounts
- Refunds
- Commissions
- Operating expenses
- Cash summaries

Classification: **Core Mandatory data dependency**; advanced analysis is **Advanced Layer**.

Reports must consume canonical records rather than maintain a second transaction system.

### 6.16 Patient Portal

`Financial Responsibility → Patient-visible balance / payment status / permitted financial information`

Classification: **Integrated Optional**.

Portal is a consumer of authorized financial state, not an independent financial source of truth.

### 6.17 Subscription / Tenant / License

`Tenant → Enabled Capabilities → Financial/Inventory availability`

Classification: **Core Mandatory platform boundary**, with detailed license/feature gating as defined by ADR-003 and ADR-006.

Financial and Inventory remain tenant-scoped. Subscription controls whether advanced capabilities are available; it does not create duplicate financial/inventory data models.

### 6.18 Future Accounting / External Integration

`CORE Financial Events → Integration Boundary → External Accounting / ERP / Tax / Payment Ecosystem`

Classification: **Future Integration**.

CORE must remain the operational clinic source for its own business events. Future external accounting systems may consume mapped, stable financial events. CORE is not required to become a general-purpose ERP.

## 7. Two Commercial Paths

CORE supports two legitimate origins of financial activity:

### Clinical-linked commercial flow

`Patient → Appointment/Visit → Procedure/Service → Charge → Discount/Insurance → Invoice → Payment → Receipt`

with resource costing:

`Procedure → Inventory Consumption → Procedure Cost → Margin`

### Standalone commercial flow

`Patient/Customer Context → Product/Package/Service Sale → Charge → Invoice → Payment`

The two paths converge at canonical financial records. They must not create parallel billing engines.

## 8. UI Principle

Daily clinic operation must remain simple:

- Create/perform service
- Charge/bill
- Collect payment
- Receive stock
- Consume stock automatically where configured
- View essential status

Complexity belongs in Advanced Settings, Controls, Audit, Costing, Reconciliation and Reports. This is a UX decision, not permission to weaken backend integrity.

## 9. Architectural Invariants for the Gap Map

The integrated Gap Map must verify at minimum:

1. Every financial/inventory record has a canonical tenant boundary.
2. Clinical identity comes from canonical Patient/Visit/Procedure/Service entities.
3. A financial event is distinct from a schedule/plan/appointment.
4. Invoice, payment, installment, discount, refund and cancellation have distinct meanings and lifecycle controls.
5. Inventory quantity and valuation are traceable to movements.
6. Procedure consumption is traceable to its clinical/commercial source when applicable.
7. Purchasing, receiving, inventory, supplier obligations and supplier payments remain distinct but linked.
8. Insurance claim/reconciliation cannot create patient, invoice or coverage identity drift.
9. Workforce commission records derive from canonical workforce and financial events.
10. Reporting consumes canonical operational records and does not become a parallel ledger.
11. Security boundaries are enforced both by RLS and, where SECURITY DEFINER is required, by explicit internal tenant/permission/ownership validation.
12. No new duplicate domain/table/function should be introduced merely to patch an existing canonical capability.
13. Current production data anomalies are recorded as findings; they are not silently normalized during an audit.

## 10. Audit Consequence

This ADR is the architectural baseline for the **Integrated Financial & Inventory Gap Map**. The next phase is read-only engineering/implementation inspection of repository code, migrations/schema, functions/RPCs, RLS/grants, and relevant runtime-facing integration points.

No remediation is authorized by this ADR. Findings must be classified as implemented, partial, missing, contradictory, unsafe, unverifiable, or blocked, with direct repository/database evidence.
