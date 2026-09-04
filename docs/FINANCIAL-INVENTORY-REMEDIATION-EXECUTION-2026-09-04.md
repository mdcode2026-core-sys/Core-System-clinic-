# CORE SYSTEM — Financial & Inventory Remediation Execution Record

**Date:** 2026-09-04  
**Governing architecture:** ADR-008 — Financial & Inventory Cross-Domain Architecture  
**Governing engineering contract:** FINANCIAL-INVENTORY-REMEDIATION-CONTRACT-2026-09-04.md  
**Execution mode:** approved remediation; additive/non-breaking; legacy experimental data preserved  

## 1. Execution Result

The approved P0/P1 remediation work was executed against the production Supabase project `core-system-clinic` and recorded in repository migrations.

Production migration versions created during this execution:

- `20260904143635` — financial_inventory_remediation_core_p0_p1
- `20260904143727` — financial_inventory_remediation_cross_domain_p1
- `20260904143806` — financial_inventory_remediation_rpc_exposure_hardening
- `20260904143827` — financial_inventory_remediation_lock_legacy_installment_path
- `20260904143850` — financial_inventory_remediation_validate_tenant_relationships
- `20260904143926` — financial_inventory_remediation_canonical_mutation_boundary
- `20260904143939` — financial_inventory_remediation_invoice_item_lifecycle_guard

Repository migration filenames were reconciled to these exact production versions so the new migrations are not duplicated under a different timestamp.

## 2. Implemented Controls

### Invoice
- `issue_invoice()` now verifies current tenant and `invoices:issue`.
- `cancel_invoice()` now verifies current tenant and `invoices:cancel`.
- Issued/paid/partial/refunded invoice financial facts are protected from ordinary UPDATE mutation.
- Invoice line items are immutable after issue.
- Monetary non-negative invariants were added and validated.
- `create_invoice_from_session()` was corrected to use the current invoice schema; the stale `clinic_invoices.tax_rate_percent` reference was removed.
- Manual invoice discounts now require `invoices:discount` and preserve the approving actor in `discount_approved_by`.

### Payments / installments
- `record_invoice_payment()` remains the canonical invoice payment primitive and validates the collector tenant.
- `apply_payment_to_installment()` now creates the canonical invoice payment, links it to the financial plan/installment, and updates installment state.
- The legacy 3-argument installment-only mutation path was disabled for authenticated clients so it cannot silently desynchronize invoice state.
- Direct client mutation of `invoice_payments` was removed; payment mutation is through the canonical operation.

### Inventory
- Inventory item costing/classification foundation was added: purchase cost, valuation cost, optional selling price, procedure-material flag, operating-consumable flag, batch/expiry configuration flags.
- Inventory ledger now carries signed `quantity_delta`, movement classification, source type/source id, unit cost and movement cost.
- `adjust_inventory_stock()` is now the canonical atomic stock + ledger operation with tenant, permission and actor checks.
- Direct `current_stock` mutation is blocked by a database trigger unless the canonical operation establishes the transaction-local mutation marker.
- Purchase receiving and procedure consumption were moved to the canonical stock operation.
- Direct client mutation of `inventory_ledger` was removed.

### Tenant integrity
- Tenant-aware composite unique indexes and foreign keys were added for the highest-risk Financial/Inventory relationships.
- All newly added tenant-aware foreign keys were validated successfully against existing production data.

### Purchasing / Insurance
- Purchase receiving validates the receiver and supplier tenant and uses atomic stock/ledger mutation.
- Supplier payment validates actor and supplier tenant.
- Insurance reconciliation validates insurance-profile patient and claim/invoice patient consistency.

## 3. Experimental Production Data Handling

The existing inventory ledger anomaly was **not deleted** and was not rewritten into a fabricated source event.

It was preserved and explicitly classified as `legacy_untraceable`, with the original row and historical note retained. Its movement classification was normalized to `legacy_unclassified` so the system does not falsely represent the movement as a traceable procedure event.

This follows the approved rule: preserve historical experimental evidence, retain what is useful, and do not manufacture a false business source.

## 4. Verification Evidence

Post-migration read-only verification confirmed:

- No negative inventory stock exists.
- Newly introduced monetary and inventory metadata constraints validate successfully.
- Tenant-aware composite foreign keys validate successfully.
- Sensitive remediation RPCs are not executable by `anon`.
- The old 3-argument installment mutation RPC is no longer executable by authenticated clients.
- The canonical inventory mutation RPC is executable only for authenticated clients and enforces tenant + permission + actor checks internally.
- The legacy inventory row remains present and classified rather than deleted.

## 5. Remaining Closure Items

This execution does **not** claim full production closure yet.

The following remain explicitly unverified or outside the evidence available from the current production dataset:

- Full controlled financial E2E with real test transactions across invoice → payment → installment → insurance → purchasing → supplier payment.
- Full procedure/material mapping and procedure margin calculation across representative test data.
- Refund lifecycle implementation.
- Purchase returns, unused clinical material returns, expiry/damage workflow.
- Full commission runtime calculation and settlement lifecycle.
- Complete reporting/analytics validation from populated canonical transactions.
- Full Git ↔ production migration reconciliation beyond the Financial/Inventory remediation migrations; the broader historical migration drift remains a separate repository-governance workstream.
- UI/server-action inspection and browser E2E for all affected financial/inventory screens.

Therefore the correct closure state remains:

**NOT CLOSED — BLOCKER**

The blockers above are validation/completeness blockers, not permission to redesign the Financial/Inventory architecture. The canonical existing domains remain the SSOT and remediation must continue under ADR-008 and the approved engineering contract.
