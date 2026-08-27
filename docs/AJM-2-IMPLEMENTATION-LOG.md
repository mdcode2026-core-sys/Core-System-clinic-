# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS — Product Surface Reconciliation  
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
- Added the approved hierarchical **Financial & Resources** Sidebar surface.
- Preserved `/invoices` and `/inventory` as authoritative existing surfaces while placing them under the Financial & Resources product surface rather than creating duplicate engines.
- Added user-facing list surfaces for Payments, Financial Plans, Installments, Insurance, Consumption, Suppliers, Purchasing and Receiving, backed by tenant-scoped canonical tables.
- Documented the Core / Advanced / Add-on visibility model as a licensing/entitlement concern separate from permissions.
- Added tenant capability metadata to the navigation contract so future Advanced/Add-on surfaces can be governed by entitlement without converting licensing into authorization.

### Production database

Applied and verified AJM-2 migrations:

- `ajm_2_financial_resources_foundation`
- `ajm_2_invoice_manual_and_payment_hardening`
- `ajm_2_purchasing_receiving_and_inventory_security`
- `ajm_2_permission_role_boundary_correction`
- `ajm_2_financial_resources_audit_triggers`
- `ajm2_financial_resources_core_entitlements`

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
- New user-facing list routes perform an effective-permission check before querying their tenant-scoped source table.

## Product Surface Reconciliation

The former implementation had the domain data foundation but did not expose the full AJM-2 capability set coherently to the user. This reconciliation establishes:

```text
Financial & Resources
├── Overview
├── Invoices
├── Payments
├── Financial Plans
├── Installments
├── Insurance
├── Inventory
├── Consumption
├── Suppliers
├── Purchasing
└── Receiving
```

The Sidebar hierarchy is a product surface only. Domain ownership remains independent.

Capability packaging is not hard-coded into the navigation as raw subscription tiers. The access model is:

```text
Subscription / Add-on
 → Entitlement
 → Capability
 → Effective Permission
 → UI/action access
```

The authoritative AJM-2 scope marks the listed financial/resource foundation capabilities as Core. Advanced scope includes deeper automation and external insurer integrations; those are not exposed as incomplete Core features. The entitlement model remains extensible for future Advanced/Add-on capabilities without changing domain ownership.

Production currently contains the `financial_resources.core` entitlement and its 12 AJM-2 capability mappings. Active subscribed tenants on the applicable Basic/Professional/Enterprise/Trial module families are provisioned through the entitlement table; the application does not compare raw plan names to decide authorization.

## Production verification completed

- Confirmed new AJM-2 tables exist with expected columns.
- Confirmed RLS policies exist on new financial/resource tables.
- Confirmed invoice mutation policies exist for SELECT/INSERT/UPDATE/DELETE.
- Confirmed inventory ledger read/write policies are permission-scoped.
- Confirmed AJM-2 role permission assignments in production.
- Regenerated Supabase TypeScript types from the live database to confirm the production schema/RPC model includes the AJM-2 objects.
- Confirmed `financial_resources.core` is active for the current active Enterprise tenant and its capability mapping contains the complete Core surface.
- Vercel preview deployments have been observed for the new branch; one earlier list-surface build failed on strict row typing and that error has been corrected in the repository.

## Important limitation

AJM-2 is **not closed**. The entitlement foundation is now present, but the current work still requires a successful latest preview build/runtime verification and authenticated E2E against valid tenant/patient data.

## Remaining AJM-2 work

- Verify the latest branch deployment reaches `READY` after the row typing correction.
- Verify Sidebar hierarchy and all Financial & Resources routes in authenticated runtime.
- Verify Core capability entitlement and effective-permission behavior together.
- Verify future Advanced/Add-on surfaces remain unexposed unless their entitlement/capability is actually provisioned.
- Complete authenticated financial/payment/installment E2E without test contamination.
- Verify cross-tenant denial with real authenticated tenant contexts.
- Verify Patient Portal financial/installment read integration where applicable.
- Verify existing Analytics consumes canonical financial/resource facts without a duplicate analytics path.
- Verify existing invoice and inventory workflows have no regression.
- Update AJM stage closure evidence only after all Definition of Done items pass.

**No AJM-3 work has been started.**
