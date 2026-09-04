# CORE SYSTEM — Financial & Inventory Engineering Remediation Contract

**Date:** 2026-09-04  
**Status:** Approved Engineering Contract — Execution Authorization  
**Baseline:** ADR-008 — Financial & Inventory Cross-Domain Architecture  
**Input:** FINANCIAL-INVENTORY-INTEGRATED-GAP-MAP-2026-09-04.md  
**Mode:** Additive/non-breaking remediation unless an item below explicitly requires controlled correction  

## 1. Purpose

This contract converts the integrated Gap Map into an exact engineering scope. It is an execution contract, not a new architecture exercise.

The objective is to make Financial + Inventory operationally reliable across CORE domains while keeping the daily clinic UI simple and preserving the future integration boundary for formal accounting systems.

## 2. Governing Rules

1. ADR-008 is the architectural authority for this remediation.
2. Existing authoritative domains/tables/functions must be reused before any new object is created.
3. No duplicate financial, inventory, permission, tenant, patient, procedure, payment, or ledger engine may be introduced.
4. Repository and production schema must be reconciled; production-only objects may not remain undocumented.
5. Every security-sensitive mutation must enforce tenant isolation and effective permission at the server/database boundary.
6. Security-definer functions must use a safe search_path and explicit tenant/ownership validation.
7. Clinical source facts remain owned by clinical domains; Financial/Inventory consume those facts and create financial/resource consequences.
8. Financial records are not to be silently rewritten to repair history. Corrections must use explicit lifecycle operations such as cancellation, refund, reversal, return, or adjustment where applicable.
9. No destructive migration, table replacement, data deletion, or renaming is authorized by this contract unless separately approved after impact analysis.
10. Financial/inventory RPCs with side effects must not be used as audit probes. Verification must use static inspection and controlled test data only where explicitly approved.

## 3. Priority Model

- **P0 — Blocker:** security, tenant integrity, accounting/resource integrity, or production correctness issue that prevents closure.
- **P1 — Critical:** required business workflow or architectural invariant missing; must be corrected before production closure.
- **P2 — Important:** operational completeness, reporting, lifecycle, or maintainability gap that should be corrected in this remediation cycle where it does not expand scope.
- **P3 — Future:** intentionally deferred integration/advanced capability; document only, do not implement under this contract.

## 4. Workstream A — Repository / Production Schema Synchronization — P0

### A1. Establish authoritative schema baseline
- Compare all production Financial/Inventory tables, constraints, indexes, policies, triggers, functions and grants with repository migrations.
- Identify every production object with no authoritative migration representation.
- Do not overwrite production history.

### A2. Migration reconciliation
- Add missing additive migration history only for objects confirmed to exist in production and required by the approved architecture.
- Resolve duplicate/contradictory migration definitions.
- Ensure a clean repository checkout can reconstruct the intended schema.
- Record unavoidable historical drift explicitly rather than pretending the old migrations created the current state.

### A3. Required closure evidence
- Git migration inventory.
- Production migration inventory.
- Reconciled object matrix.
- No unexplained production-only Financial/Inventory object remains.

## 5. Workstream B — Invoice Lifecycle and Authorization — P0/P1

### B1. Unify permission model
- `invoices:issue` must be the authoritative permission for issuing an invoice.
- `invoices:cancel` must be the authoritative permission for cancellation.
- `invoices:update` must not implicitly authorize cancellation or lifecycle transitions that have dedicated permissions.
- Reconcile RLS, RPC/server actions, permission engine and UI visibility so all layers agree.

### B2. Harden invoice lifecycle RPCs
- `issue_invoice`: explicitly enforce tenant and `invoices:issue`.
- `cancel_invoice`: explicitly enforce tenant and `invoices:cancel`; preserve no-payment rule unless a separately approved refund/reversal path exists.
- Review every invoice mutation path for the same rule.

### B3. Fix invoice creation compatibility
- Resolve the confirmed mismatch where `create_invoice_from_session()` references a production column that does not exist.
- Prefer adapting the implementation to the authoritative current schema rather than adding a column merely to satisfy stale code.
- Re-test session → invoice creation.

### B4. Invoice invariants
- Prevent negative monetary amounts.
- Prevent issued invoices from being edited through ordinary update paths.
- Ensure invoice totals remain consistent with invoice items.
- Preserve auditability of discounts and lifecycle transitions.

## 6. Workstream C — Payments / Receipts / Installments — P0/P1

### C1. Establish one canonical payment transaction path
- `record_invoice_payment` remains the canonical invoice payment primitive unless a stronger existing function is proven canonical.
- Installment payment must create/associate the corresponding payment transaction and update invoice/payment state consistently.
- Remove or lock down competing mutation paths that can update installment balances without creating the financial payment record.

### C2. Installment integrity
- Financial Plan total must reconcile with installment schedule.
- Installment paid amount must never exceed installment amount.
- Invoice paid amount must reconcile with valid payment transactions.
- Patient responsibility must remain distinct from insurance responsibility.

### C3. Actor integrity
- Payment actor (`collected_by`) must belong to the same tenant as the transaction.
- Similar actor fields in financial mutation functions must be same-tenant validated.

### C4. Receipt/payment document semantics
- Payment transaction must remain distinct from invoice.
- Receipt/payment-voucher representation may be UI/document output over the canonical payment record; do not create a duplicate payment table.
- Preserve payment method, reference, actor, date, amount and source invoice/installment.

## 7. Workstream D — Discounts / Refunds / Adjustments — P1

### D1. Discounts
- A discount is a controlled financial adjustment, not an arbitrary overwrite of selling price.
- Enforce `invoices:discount` at the mutation boundary.
- Preserve who approved the discount and when.
- Ensure invoice creation/update cannot silently bypass the approved discount authority.

### D2. Refunds
- Distinguish refund from cancellation.
- Implement only if an existing canonical payment/lifecycle model can support it without duplication.
- Refund must reference the original payment/invoice and preserve audit history.
- Do not erase the original payment.

### D3. Corrections
- No direct historical mutation as a shortcut for financial correction.
- Use explicit adjustment/reversal records where required.

## 8. Workstream E — Inventory Engine Integrity — P0

### E1. Canonical stock mutation
- Establish one authoritative atomic operation for stock quantity + ledger movement.
- A successful stock movement and its ledger entry must commit together.
- A failed ledger write must roll back the stock change.
- Direct writes to `current_stock` must be removed from ordinary operational paths.

### E2. `adjust_inventory_stock`
- Review whether this existing function can be safely extended into the canonical atomic movement primitive.
- If reused, add required movement metadata without creating a second stock engine.
- Permission `inventory:adjust` must be enforced at the mutation boundary.

### E3. Ledger source integrity
- Each operational movement must identify its source where applicable: purchase receipt, procedure/session/treatment-plan consumption, return, or explicit adjustment.
- Actor must be recorded where an authenticated user performs the movement.
- Tenant identity must be consistent across item, movement and source.

### E4. Existing anomalous movement
- Preserve the existing historical row.
- Do not silently delete or rewrite it.
- Classify it as legacy/untraceable data and provide an explicit documented correction/reconciliation mechanism if business approval permits.

## 9. Workstream F — Inventory Cost / Valuation / Item Classification — P1

Extend the existing Inventory model rather than replacing it.

Required conceptual capabilities:
- Purchase Cost.
- Current Valuation Cost.
- Stock Value.
- Optional Selling Price.
- Procedure Material eligibility.
- Operating Consumable eligibility.
- Unit of measure.
- Batch/expiry capability where required.

Rules:
- Procedure material contributes to procedure cost.
- Operating consumable contributes to operating cost.
- Selling price is optional and must not be confused with purchase/valuation cost.
- Cost and revenue remain separate measures.

Do not introduce a full ERP valuation engine in this remediation cycle. Implement the minimum reliable foundation required by ADR-008 and document advanced valuation methods as future capability if not already supported.

## 10. Workstream G — Procedure / Service Catalog Integration — P1

### G1. Procedure pricing
- Procedure/service remains the source of clinical service definition and selling price.
- Financial consumes the commercial price; it must not duplicate procedure master data.

### G2. Procedure material mapping
- Reuse the existing procedure/material relationship if present.
- Required materials must resolve to canonical inventory items.
- Procedure execution/consumption must create traceable inventory movement and procedure cost.

### G3. Cost calculation
- Procedure cost = consumed material/resource cost according to the approved valuation basis.
- Procedure selling price remains separate.
- Margin = revenue minus applicable cost, not simply invoice total.

## 11. Workstream H — Clinical Flow / Visit / Treatment Plan Integration — P1

### H1. Clinical-linked sale
Canonical conceptual flow:
`Patient → Visit/Session → Procedure/Service → Charge → Invoice → Payment`

### H2. Treatment Plan
- Treatment Plan may be the clinical source for planned services and financial commitments where supported.
- Creation/approval of a treatment plan must not automatically fabricate a payment unless the business event is explicitly a financial commitment/sale.
- Actual service execution and actual payment remain distinct events.

### H3. Standalone commercial sale
- Package/product/service sale that is not tied to a clinical visit must use the same canonical Financial engine.
- Do not create a separate commercial billing engine.

## 12. Workstream I — Purchasing / Supplier / Payables — P1

Canonical flow:
`Supplier → Purchase Order → Receiving → Inventory → Supplier Obligation → Payment`

Requirements:
- Receiving increases stock atomically with inventory ledger movement.
- Receiving creates/updates the supplier obligation exactly once.
- Supplier payment reduces the obligation exactly once.
- Receiving/payment actors must be same-tenant validated.
- Prevent receiving against invalid/cancelled purchase orders.
- Preserve partial receiving.
- Support purchase returns through explicit return movements rather than negative manual adjustments.

Purchase bill/invoice functionality must not be confused with customer invoice functionality; reuse the existing supplier/payable domain if present.

## 13. Workstream J — Expiry / Batch / Returns — P1/P2

- Add batch/expiry tracking only where inventory item configuration requires it.
- Expired stock must be identifiable and excluded from usable stock according to approved business rules.
- Unused clinical material return must increase stock through a traceable return movement.
- Purchase return must decrease stock and reference the source receipt/order.
- No generic adjustment should be used to disguise a return.

## 14. Workstream K — Insurance / Claims / Reconciliation — P1

Canonical flow:
`Charge → Invoice → Coverage → Insurance Portion → Patient Portion → Claim → Reconciliation → Final Responsibility`

Requirements:
- Claim, invoice, financial plan and patient must belong to the same tenant and consistent patient context.
- Insurance reconciliation must update the correct responsibility state without silently overwriting original billed amounts.
- Reconciliation differences must remain auditable.
- Claim lifecycle must be explicit: prepared/submitted/rejected/paid/reconciled/exception as supported.
- No duplicate insurance financial engine.

## 15. Workstream L — Workforce / Commission — P2

- Commission rule remains in Workforce.
- Financial events provide the eligible financial basis.
- Commission entry must reference a valid source event/payment where applicable.
- Basis must be explicit: collected revenue, invoice value, procedure count, or fixed bonus.
- Preserve approval and payment lifecycle.
- Do not create payroll inside Financial unless already part of an authoritative Workforce domain.

## 16. Workstream M — Operating Expenses — P2

- Expense record remains separate from inventory purchase and patient revenue.
- Support amount, payment status, supplier/payee, date, category, reference and actor.
- Supplier-related expenses must not bypass supplier/payable logic where the existing supplier domain is authoritative.
- Expense reporting must feed management analytics without creating a duplicate accounting ledger.

## 17. Workstream N — Reporting / Analytics — P2

Reports must consume canonical records; no report-specific shadow transaction tables.

Required reporting foundation:
- Revenue.
- Collections.
- Outstanding receivables.
- Installments.
- Insurance receivables/reconciliation.
- Supplier payables.
- Inventory quantity/value.
- Inventory consumption.
- Procedure cost.
- Procedure margin.
- Discounts.
- Refunds.
- Commissions.
- Operating expenses.
- Cash/payment-method summary.

Daily UI remains simple. Advanced reports/settings expose the complexity.

## 18. Workstream O — Tenant / Security / RLS / RPC Boundary — P0

For every financial/resource mutation:
- Derive or verify current tenant server-side.
- Verify target record belongs to tenant.
- Verify actor belongs to tenant where actor ID is supplied.
- Verify effective permission.
- Avoid relying on UI-only permissions.
- Review SECURITY DEFINER functions for explicit tenant/ownership checks.
- Keep `anon` unable to execute financial/resource mutation RPCs.
- Remove unnecessary broad table grants where safe and additive.
- Keep safe `search_path` on SECURITY DEFINER functions.

Particular required reviews:
- `execute_commercial_sale`
- `receive_purchase_order`
- `record_supplier_payment`
- `reconcile_insurance_claim`
- `consume_procedure_inventory`
- `issue_invoice`
- `cancel_invoice`
- `record_invoice_payment`
- installment payment functions
- inventory adjustment functions

## 19. Workstream P — Cross-Tenant Referential Integrity — P1

Where financial/resource records reference tenant-scoped entities, strengthen integrity using composite tenant-aware foreign keys or equivalent database constraints where compatible with the existing schema.

Priority relationships:
- invoice ↔ patient/session/treatment plan.
- invoice item ↔ invoice/procedure.
- payment ↔ invoice/plan/installment.
- claim ↔ patient/invoice/insurance profile/plan.
- PO ↔ supplier.
- PO item/receipt item ↔ inventory item.
- supplier obligation/payment ↔ supplier/PO.
- inventory ledger ↔ inventory item/source.

Do not add constraints blindly; first prove the existing data is clean and determine required unique indexes for composite references.

## 20. Workstream Q — UI / Server Action Consistency — P1/P2

- Every UI mutation must call the canonical server-side operation.
- Remove client-side sequences that separately mutate stock and ledger.
- Remove duplicate invoice/payment mutation paths.
- UI must hide advanced complexity from routine clinic users while retaining access for authorized administrative/reporting users.
- Error states must not present a successful financial/resource operation when the authoritative transaction failed.

## 21. Explicit Non-Scope

This contract does NOT authorize:
- Building a general-purpose ERP.
- General ledger/accounting chart-of-accounts implementation.
- Tax authority integration unless already approved elsewhere.
- Payroll engine replacement.
- Full warehouse/ERP procurement expansion.
- New duplicate billing/payment engines.
- New duplicate inventory ledgers.
- Rewriting Patient Journey architecture.
- Changing authoritative PJ documents.
- Cosmetic redesign unrelated to the identified workflow gaps.

## 22. Required Engineering Sequence

1. Freeze current baseline and create remediation branch.
2. Reconcile Git ↔ production schema first.
3. Fix P0 authorization and transaction-integrity boundaries.
4. Fix invoice/payment/installment canonical paths.
5. Fix inventory atomic stock+ledger path.
6. Repair cross-domain links: procedure/visit/treatment plan/purchasing/insurance/workforce.
7. Add only required integrity constraints after data validation.
8. Update UI/server actions to consume canonical paths.
9. Build controlled test data in a safe test environment.
10. Run unit/static/integration tests.
11. Run production read-only verification.
12. Run controlled runtime E2E in the approved environment.
13. Update Gap Map with evidence.
14. Update architecture/handoff/changelog documents.
15. Close only when all P0/P1 blockers are verified closed.

## 23. Acceptance Criteria

The remediation cannot be declared complete merely because the build passes.

Minimum acceptance:
- Repository schema is reproducible and production-only drift is documented/resolved.
- Invoice lifecycle permissions match database enforcement.
- Payment and installment records reconcile.
- Discount/refund/cancellation semantics are distinct and auditable.
- Every inventory mutation has atomic ledger traceability.
- Procedure consumption produces traceable cost.
- Purchasing receiving/payment chain reconciles.
- Insurance claim/reconciliation preserves patient and financial responsibility integrity.
- Tenant and actor isolation is enforced at database/server boundary.
- Reports derive from canonical financial/resource facts.
- No duplicate domain/engine introduced.
- Controlled E2E workflows pass.
- Existing unrelated CORE workflows remain non-breaking.

## 24. Closure Rule

Final status must be exactly one of:

**PRODUCTION CLOSED** — all required acceptance criteria verified with evidence.

or

**NOT CLOSED — BLOCKER** — at least one P0/P1 acceptance criterion remains unverified or failed.

No other wording constitutes production closure.
