# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS  
**Date:** 2026-08-27

## Verified and implemented

### Repository / application

- Reconciled invoice actions with live Supabase RPC signatures.
- Reconciled invoice item/payment field names with the live schema.
- Wired the invoice detail UI to real issue/payment/cancel server actions; removed exposed no-op refund behavior from this stage surface.
- Added explicit server-side effective-permission checks for financial mutations.
- Extended the permission type catalog for AJM-2 capabilities.
- Removed client-supplied tenant ID as an authorization source in inventory mutations; server tenant context is authoritative.
- Added financial-resources domain types, actions and queries for financial plans, installments, insurance profiles, suppliers and purchasing/receiving.

### Production database

Applied and verified AJM-2 migrations:

- `ajm_2_financial_resources_foundation`
- `ajm_2_invoice_manual_and_payment_hardening`
- `ajm_2_purchasing_receiving_and_inventory_security`
- `ajm_2_permission_role_boundary_correction`
- `ajm_2_financial_resources_audit_triggers`

New Core tables:

- `financial_plans`
- `financial_installments`
- `patient_insurance_profiles`
- `insurance_claims`
- `suppliers`
- `purchase_orders`
- `purchase_order_items`
- `purchase_receipts`
- `purchase_receipt_items`

Existing canonical inventory tables remain:

- `inventory_items`
- `inventory_ledger`

### Security

- Invoice, invoice-item and invoice-payment mutation policies now use tenant resolution plus the established permission function.
- Inventory ledger writes require `inventory:adjust`.
- Purchasing and insurance tables are tenant-scoped with RLS.
- Financial/resource mutations have audit triggers using the existing audit function.
- Receptionist permissions were narrowed after review to avoid unnecessary discount/cancel/purchasing-management/inventory-adjust/insurance-management authority.

## Production verification completed

- Confirmed new AJM-2 tables exist with expected columns.
- Confirmed RLS policies exist on new financial/resource tables.
- Confirmed invoice mutation policies exist for SELECT/INSERT/UPDATE/DELETE.
- Confirmed inventory ledger read/write policies are permission-scoped.
- Confirmed AJM-2 role permission assignments in production.
- Regenerated Supabase TypeScript types from the live database to confirm the production schema/RPC model includes the AJM-2 objects.
- Vercel preview deployment was triggered from branch `ajm/ajm-2-financial-resources-foundation`.
- Earlier preview builds exposed an import defect; `hasEffectivePermission` was added to the permission engine. The latest preview deployment is currently building and has produced no new build errors in the observed log tail.

## Important limitation

The current production database contains no invoice/patient fixtures, so a full authenticated end-to-end payment scenario cannot be honestly declared passed yet. The stage remains open until runtime scenarios can be exercised against valid tenant/patient data without leaving test contamination.

## Remaining AJM-2 work

- Finish/verify the user-facing financial/installment/insurance/purchasing surfaces against the new domain actions.
- Synchronize repository database types with the live generated schema rather than relying on temporary local casts in the newly added financial-resources domain.
- Complete authenticated runtime acceptance scenarios.
- Verify cross-tenant denial with real authenticated tenant contexts.
- Verify Patient Portal financial/installment read integration where applicable.
- Verify existing Analytics consumes the canonical financial/resource facts without a duplicate analytics path.
- Update AJM stage closure evidence only after all Definition of Done items pass.

**No AJM-3 work has been started.**
