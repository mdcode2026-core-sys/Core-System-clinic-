# Financial & Inventory UX Remediation Plan — 2026-09-04

Status: **OPEN — EXECUTION AUTHORIZED**

## Objective
Bring Financial Resources, Inventory, Purchasing, Insurance and Reports to a user-operable clinic workflow while preserving the approved canonical backend architecture.

## Non-negotiables
- Reuse canonical entities and permission engine.
- No duplicate financial, inventory, patient, insurance, supplier or permission engines.
- Human-readable labels; database IDs are never the primary user input.
- Search/select by patient, invoice number, supplier, item, procedure and date where relevant.
- Distinguish business events: invoice, receipt/payment, expense/disbursement, installment, supplier bill, receiving, stock adjustment, refund and return.
- Daily operations remain simple; advanced configuration/audit/reconciliation/reporting belongs in advanced layers.
- Every workflow must answer: what am I doing, for whom/what, what happens next, and where do I see the result.

## Required user workflows
1. Patient/Visit/Procedure → Invoice → Receipt → Outstanding/Refund.
2. Financial Plan → Installment Schedule → Actual Receipt → Outstanding.
3. Insurance Provider/Contract → Patient Coverage → Invoice split → Claim → Reconciliation.
4. Item Master → Purchase Order → Supplier Bill → Receiving → Stock/Lot/Expiry → Supplier Payable → Supplier Payment.
5. Inventory Adjustment/Return/Expiry/Damage → Ledger → Stock/Valuation reports.
6. Procedure → Material Consumption → Procedure Cost → Margin/reporting.
7. Workforce payment basis → Commission entry without duplication.
8. Reports drill down from KPI to canonical transactions.

## Acceptance gates
A feature is not complete when only a database primitive exists. It is complete when the intended clinic user can perform the business workflow from the UI without knowing UUIDs or internal table names, with searchable/selectable business identities and clear next actions.
