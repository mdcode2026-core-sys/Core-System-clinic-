# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS  
**Date:** 2026-08-27

## Governing execution rule

AJM-2 is being executed under the AJM Master Blueprint, AJM Implementation Plan, Stage Index and the Financial & Resources Engineering Blueprint. Existing Billing/Invoicing and Inventory domains remain canonical. Financial & Resources capabilities are integrated with those existing surfaces; no duplicate billing or inventory engine is created.

## Verified and implemented

### Repository / application

- Reconciled invoice actions with live Supabase RPC signatures.
- Reconciled invoice item/payment field names with the live schema.
- Wired invoice issue/payment/cancellation to real server actions.
- Added server-side effective-permission checks for financial mutations.
- Removed client-supplied tenant ID as an authorization source in inventory mutations.
- Added financial-plan, installment, minimum-insurance, supplier and purchasing/receiving domain capabilities.
- Preserved `inventory_items` and `inventory_ledger` as the canonical inventory implementation.
- Preserved Treatment Plan, Agenda, Follow-up and Patient Portal ownership.

### User-surface reconciliation

The first AJM-2 implementation incorrectly exposed a separate `/financial-resources` application surface. This was identified as a domain/surface duplication during reconciliation and is being removed from the user-facing navigation model.

The corrected model is:

- existing **Invoices** surface remains the canonical billing entry point;
- Financial Plans, Installments and Insurance are exposed as the financial workspace beneath the Invoices surface;
- existing **Inventory** surface remains the canonical stock entry point;
- Suppliers, Purchasing and Receiving are exposed beneath the Inventory surface;
- the Financial & Resources domain remains independently owned in the background and is not merged into Invoicing or Inventory ownership.

### Production database

Applied and verified AJM-2 migrations:

- `ajm_2_financial_resources_foundation`
- `ajm_2_invoice_manual_and_payment_hardening`
- `ajm_2_purchasing_receiving_and_inventory_security`
- `ajm_2_permission_role_boundary_correction`
- `ajm_2_financial_resources_audit_triggers`

Core AJM-2 tables include:

- `financial_plans`
- `financial_installments`
- `patient_insurance_profiles`
- `insurance_claims`
- `suppliers`
- `purchase_orders`
- `purchase_order_items`
- `purchase_receipts`
- `purchase_receipt_items`

Canonical inventory remains:

- `inventory_items`
- `inventory_ledger`

## Security / integrity

- Authentication → server tenant resolution → effective permission → validation → transactional database operation is the required mutation path.
- Financial/resource tables are tenant-scoped with RLS.
- Invoice and payment mutations enforce tenant and permission boundaries.
- Purchasing/receiving validates tenant and inventory ownership.
- Financial/resource mutations are auditable.
- Financial amount invariants are enforced at the persistence boundary.
- No second inventory balance engine exists.
- `billing_events` remains reserved for platform/subscription billing.

## Validation gate

The following are required before AJM-2 can be closed:

1. Repository/build validation on the final branch head.
2. Preview runtime validation of the corrected canonical surfaces.
3. Authenticated invoice → financial plan → installment/payment flow.
4. Authenticated inventory → supplier → purchase order → receiving flow.
5. Permission-denied validation for unauthorized mutations.
6. Cross-tenant denial validation.
7. Treatment Plan / financial linkage validation.
8. Patient Portal financial/installment read integration validation where enabled.
9. Regression validation for existing Invoices and Inventory behavior.
10. Final production deployment and runtime acceptance.

No AJM-3 implementation is permitted before these gates pass.

## Current state

AJM-2 remains **IN PROGRESS**. Previous closure evidence was invalid because the user-facing surface was not reconciled with the existing canonical Invoices/Inventory surfaces and the authenticated E2E acceptance gate had not been passed.
