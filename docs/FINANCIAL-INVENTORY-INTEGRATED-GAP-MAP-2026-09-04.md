# CORE SYSTEM — Financial & Inventory Integrated Gap Map

**Date:** 2026-09-04  
**Baseline ADR:** ADR-008 — Financial & Inventory Cross-Domain Architecture  
**Audit mode:** Read-only repository + production database inspection  
**Status:** **NOT CLOSED — BLOCKERS FOUND**

## 1. Audit Boundary

This Gap Map evaluates Financial and Inventory as integrated clinic engines, not as isolated pages. It covers relationships with Patient, Visit/Session, Treatment Plan, Procedure/Service Catalog, Workforce, Agenda, Insurance, Purchasing/Suppliers, Patient Portal, Reports/Analytics and Tenant/License boundaries.

Evidence sources inspected:

- Repository architecture and project tree.
- `src/domain/invoicing/*` and `src/domain/inventory/*`.
- Invoice and Inventory UI routes/components.
- Version-controlled Supabase migrations.
- Live Supabase production schema, constraints, foreign keys, RLS policies, grants, functions and production data.

No executable changes were made during the audit.

## 2. Executive Result

The repository and production database contain a substantial financial/inventory foundation, but the implementation is **not yet an end-to-end coherent financial/resource engine** under ADR-008.

The strongest areas are:

- Tenant-scoped financial/inventory tables.
- RLS on the inspected financial/inventory tables.
- Explicit permission checks in most server actions/RPCs.
- Invoice, payment, installment, insurance, purchasing, supplier and commission entities already exist.
- Purchase receiving and procedure inventory consumption have transactional server-side patterns.

The major blockers are:

1. **Repository ↔ production migration history is severely divergent.** Production contains a very large number of migrations through 2026-09-04 while the repository contains only a small captured subset. This prevents the repository from being a reliable reproducible representation of the production database.
2. **Inventory stock can be changed directly without a mandatory ledger event.** `updateInventoryItem()` accepts `current_stock`, and `adjust_inventory_stock()` changes stock without writing the ledger. The UI adjustment path performs stock mutation and ledger insertion as two separate requests, so ledger failure can leave stock changed but movement missing.
3. **A live inventory ledger entry is untraceable.** The only production ledger movement is a 170-unit `doctor_request` with no procedure, session, treatment-plan item or actor, while the item currently has stock 5. This is a real data-integrity/history anomaly.
4. **Invoice creation has a production/code contract mismatch.** `create_invoice_from_session()` inserts `tax_rate_percent` into `clinic_invoices`, but the inspected live `clinic_invoices` table has no `tax_rate_percent` column. This path is therefore structurally unsafe/unverifiable without runtime execution.
5. **Invoice cancellation authorization is inconsistent.** The application requires `invoices:cancel`, but the database RPC has no internal permission/tenant check and relies on the invoice UPDATE RLS boundary, which requires only `invoices:update`.
6. **Invoice discount approval is represented but not truly separated as an approval workflow.** The server action writes the current user into `discount_approved_by`; no independent approval boundary was found.
7. **Installment/payment architecture has two paths with different integrity.** `apply_payment_to_installment()` changes the installment only; it does not create an invoice payment or update invoice paid/status. The newer combined payment RPC does both. Both paths therefore coexist with materially different financial semantics.
8. **Cross-tenant relational integrity is weaker than the tenant-aware reference pattern.** Many financial/inventory FKs reference IDs without carrying tenant identity; RLS reduces normal exposure but SECURITY DEFINER flows require stronger internal invariants.
9. **Purchasing/receiving creates supplier obligations, but full purchasing → bill → payable → settlement and return/expiry lifecycle is not proven operationally because production has no transaction dataset for these flows.**
10. **Inventory costing/valuation is incomplete.** The live inventory item model is quantity-oriented and lacks purchase cost, valuation cost, stock value, optional selling price and procedure/operating-consumable classification required by ADR-008.

## 3. Cross-Domain Status Matrix

| Relationship | Classification | Current state | Gap |
|---|---|---|---|
| Tenant → Financial/Inventory | Core Mandatory | Implemented structurally | Migration drift and non-composite cross-domain FKs weaken reproducibility/integrity |
| Patient → Invoice | Core Mandatory | Implemented | No production transactions to validate full lifecycle |
| Visit/Session → Invoice | Core Mandatory | Partial | `create_invoice_from_session()` contains schema mismatch |
| Visit/Procedure → Inventory Consumption | Core Mandatory | Partial | Consumption exists, but source fields are not consistently populated in ledger |
| Treatment Plan → Financial Plan | Core Mandatory when used | Implemented structurally | Runtime lifecycle not proven |
| Procedure/Service Catalog → Billing | Core Mandatory | Partial | Current billing points to flat `clinic_procedures`; ADR-005 master/service architecture is not fully present |
| Procedure → Material Cost | Core Mandatory when configured | Partial | No robust material-definition/costing layer found |
| Workforce → Commission | Integrated Optional | Structurally present | Source linkage is partly polymorphic; runtime calculation not proven |
| Agenda → Visit → Billing | Core Mandatory indirectly | Partial | Appointment is not itself financial; full conversion chain not proven |
| Insurance → Claim → Reconciliation | Integrated Optional | Structurally present | Patient/invoice/profile consistency checks are incomplete |
| Purchasing → Receiving → Inventory | Core Mandatory | Partial | Receiving exists; cost/valuation and returns/expiry are incomplete/unproven |
| Supplier → Payable → Payment | Integrated Optional | Partial | Entities/RPCs exist; no production transaction proof |
| Discounts → Approval → Net Charge | Core Mandatory | Partial | Approval is not an independent control path |
| Invoice → Payment → Receipt | Core Mandatory | Partial | Payment event exists; receipt/voucher presentation and lifecycle not fully proven |
| Financial Plan → Installment → Actual Payment | Integrated Optional | Partial | Legacy direct installment RPC can desynchronize invoice financial state |
| Refund → Financial reversal | Integrated Optional | Missing/Unproven | No dedicated refund RPC identified in inspected implementation |
| Inventory Return/Expiry/Damage | Integrated Optional | Partial/Missing | Transaction types exist but complete lifecycle is not implemented/proven |
| Operating Expense → Settlement | Advanced/Integrated Optional | Structurally present | No transaction proof; richer linkage/reporting not proven |
| Financial/Inventory → Reports | Core data dependency | Partial | KPI/report consumers exist, but financial source completeness is not established |
| Financial → Patient Portal | Integrated Optional | Unproven | No end-to-end financial portal consumption established |
| Financial/Inventory → External Accounting | Future Integration | Reserved only | No stable integration boundary/event contract yet |

## 4. Repository Findings

### F-01 — Financial domain exists but is not fully represented as an independent operational surface

Repository tree contains invoice domain/actions/queries/types and invoice pages/components. Inventory has actions/queries/types and pages/components. The invoice page links to `/financial-resources`, but the inspected repository tree does not contain a corresponding `src/app/(dashboard)/financial-resources` route.

**Classification:** Partial / repository integration inconsistency.

### F-02 — Invoice action layer is permission-aware, but DB RPC boundaries are inconsistent

`src/domain/invoicing/invoicing.actions.ts` checks effective permissions for create, issue, payment, discount and cancel. However, the corresponding database functions do not uniformly repeat the same boundary internally.

**Classification:** Security/architecture gap.

### F-03 — `createInvoiceFromSession` has an implementation contract mismatch

The DB function inserts a `tax_rate_percent` value into `clinic_invoices`, while live inspection shows no such column on `clinic_invoices`.

**Classification:** **Blocker.**

### F-04 — Discount action conflates approval with application

`applyDiscount()` requires `invoices:discount` but writes `discount_approved_by` to the acting user. This is not an independent approve/reject workflow and does not demonstrate separation of requester and approver.

**Classification:** Partial.

### F-05 — Inventory item update exposes `current_stock`

`updateInventoryItem()` directly writes `current_stock`. This bypasses the intended stock-movement semantics and allows an authorized inventory editor to change stock without a corresponding ledger event.

**Classification:** **High-priority integrity blocker.**

### F-06 — Inventory adjustment is not atomic across stock and ledger

`adjustStock()` first calls `adjust_inventory_stock()` and then performs a separate `inventory_ledger` insert. If the second operation fails, stock has already changed.

**Classification:** **High-priority integrity blocker.**

### F-07 — Inventory model is too thin for ADR-008 costing requirements

`InventoryItem` contains name, unit, reorder threshold, current stock and activity state only. It does not expose purchase cost, valuation cost, stock value, optional selling price, procedure-cost eligibility, operating-consumable classification or expiry/batch configuration.

**Classification:** Missing capability.

## 5. Production Database Findings

### DB-01 — Production transaction coverage is insufficient for closure

Current counts are:

- invoices: 0
- invoice items: 0
- invoice payments: 0
- financial plans/installments: 0
- insurance claims/profiles: 0
- purchase orders/items: 0
- purchase receipts/items: 0
- supplier obligations/payments: 0
- commission rules/entries: 0
- operating expenses: 0
- inventory items: 9
- inventory ledger: 1
- suppliers: 2

Therefore, many lifecycle paths can only be structurally audited; they cannot honestly be marked runtime-validated.

**Classification:** Blocker for production closure, not evidence that every untested feature is broken.

### DB-02 — Inventory history anomaly

The sole inventory ledger record is a 170-unit `doctor_request` against item `TEST`, with `procedure_id`, `session_id`, `treatment_plan_item_id` and `logged_by` all NULL. Current stock is 5 and there are no purchase receipts in production explaining the movement.

**Classification:** **Data-integrity/history blocker.**

### DB-03 — RLS is enabled but not FORCE RLS

All inspected financial/inventory tables have RLS enabled and `relforcerowsecurity=false`. This is not automatically a vulnerability because normal API roles are still constrained and privileged internal functions have explicit guards, but it means RLS is not the final boundary for privileged owners/SECURITY DEFINER contexts.

**Classification:** Architecture/security hardening item.

### DB-04 — SECURITY DEFINER functions are appropriately restricted at EXECUTE level

Inspected sensitive SECURITY DEFINER functions have authenticated execution and no anon/public execution, and `search_path=public` is explicitly set.

**Classification:** Positive finding; no blocker.

### DB-05 — `cancel_invoice()` has a database authorization mismatch

Application layer requires `invoices:cancel`. The DB function itself checks neither current tenant nor `invoices:cancel`; it updates by invoice ID. The live invoice UPDATE RLS policy requires `invoices:update`, so the effective database boundary differs from the application boundary.

**Classification:** **Authorization blocker.**

### DB-06 — `apply_payment_to_installment()` can create financial-state divergence

The function updates only `financial_installments`. It does not create `invoice_payments` and does not update `clinic_invoices.amount_paid_subunits` or invoice status.

**Classification:** **Financial-integrity blocker.**

### DB-07 — Insurance reconciliation does not fully enforce identity coherence

`reconcile_insurance_claim()` verifies tenant, claim, invoice and financial-plan existence, but the claim's patient, invoice patient and financial-plan patient are not all explicitly cross-checked in the function. Simple single-column FKs also do not encode tenant-aware identity relationships.

**Classification:** High-priority integrity gap.

### DB-08 — Cross-tenant FKs are not consistently composite

Many relationships are single-ID FKs: invoice→patient/session, invoice item→invoice/procedure, insurance claim→invoice/plan/patient, purchasing→supplier/item, supplier payment→obligation, etc. RLS and explicit function checks mitigate normal API use, but this is weaker than the tenant-aware composite FK pattern already used successfully by commission tables.

**Classification:** Architectural hardening gap.

### DB-09 — Commission source model remains partly polymorphic

Commission entries contain `source_type` + `source_id`, with a specific `source_payment_id` FK also present. This permits source identities that are not constrained by FK when `source_id` is used.

**Classification:** Integrity/traceability gap.

### DB-10 — Inventory valuation model is missing

Live `inventory_items` contains quantity but no purchase cost/current valuation cost/stock value/selling price or item-role flags required by ADR-008.

**Classification:** **Core capability gap.**

## 6. Migration / Repository Reality

The repository currently contains a small migration subset under `supabase/migrations`, while production migration history contains a very large sequence through 2026-09-04, including many migrations not represented as repository files.

This is not merely documentation debt. It means:

`Git repository ≠ reproducible production schema`

until the migration history is reconciled/captured under the project's migration-governance rules.

**Classification:** **Global production/reproducibility blocker.**

## 7. What Is Already Good and Should Be Reused

The following should not be replaced by parallel implementations:

- `clinic_invoices` / `invoice_items` / `invoice_payments`
- `financial_plans` / `financial_installments`
- `insurance_claims` / `patient_insurance_profiles`
- `purchase_orders` / `purchase_order_items` / `purchase_receipts` / `purchase_receipt_items`
- `suppliers` / `supplier_obligations` / `supplier_payments`
- `inventory_items` / `inventory_ledger`
- `workforce_commission_rules` / `workforce_commission_entries`
- Existing permission engine and `has_tenant_permission()` boundary
- Existing procedure/session/patient/workforce canonical entities

The remediation principle remains **Inspect → Reuse → Extend → Create only when genuinely required**.

## 8. Priority Classification

### P0 — Must block closure

- Production migration/repository divergence.
- Invoice session-creation schema mismatch.
- Inventory stock/ledger non-atomicity and direct stock mutation.
- Live orphan/untraceable inventory ledger history.
- Invoice cancellation authorization mismatch.
- Installment-only payment path that can bypass invoice payment state.
- Lack of real production transaction validation for critical financial/resource lifecycles.

### P1 — Must be resolved before declaring integrated financial/resource completeness

- Inventory cost/valuation/selling-price/classification model.
- Insurance identity/coherence controls.
- Composite tenant-aware relational integrity where required.
- Discount approval semantics.
- Refund lifecycle.
- Purchase returns / expiry / damage lifecycle.
- Procedure material definitions and procedure-cost calculation.
- Commission source/basis lifecycle and runtime calculation.

### P2 — Advanced/quality layer

- Rich financial/resource reporting.
- Cashier/receipt/voucher presentation refinements.
- Aging/reconciliation dashboards.
- Patient Portal financial presentation.
- External accounting integration contracts.

## 9. Closure Decision

**NOT CLOSED — BLOCKER.**

This is not a declaration that the Financial or Inventory domains must be rebuilt. The opposite is true: the current system already contains substantial canonical structures that should be repaired and extended.

The next engineering phase should therefore be a **targeted remediation contract derived from this Gap Map**, not a redesign. Before implementation, the user/product owner must approve the P0/P1 repair scope and the handling policy for the existing 170-unit inventory history anomaly and production migration drift.
