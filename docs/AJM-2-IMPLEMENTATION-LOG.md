# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS — Authenticated E2E / Closure Gate  
**Date:** 2026-08-28

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
- Corrected the financial-resource list contract against the live production schema, including payment reference naming, ordering fields, complete user-facing operational properties, currency/date formatting and Arabic/English surface labels.

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

- Invoice, invoice-item and invoice-payment mutation policies use tenant resolution plus the established permission function.
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
│   └── Claims
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

Production contains the `financial_resources.core` entitlement and its 12 capability mappings. The application does not compare raw plan names to decide authorization.

## Production verification completed

- Confirmed AJM-2 tables exist with expected columns.
- Confirmed RLS policies exist on new financial/resource tables.
- Confirmed invoice mutation policies exist for SELECT/INSERT/UPDATE/DELETE.
- Confirmed inventory ledger read/write policies are permission-scoped.
- Confirmed AJM-2 role permission assignments in production.
- Confirmed `financial_resources.core` is active for the current active subscribed tenant and maps to 12 Core capabilities.
- Confirmed production data foundation currently contains zero financial-plan/payment/insurance-claim/purchasing fixtures, so no test contamination was introduced.
- Production deployment for main commit `4fdee13ba81eb908f9d9d5ceb9a1fced500f8a3b` reached `READY`.
- Production Vercel status for the merge commit is successful.
- Production unauthenticated access to `/financial-resources` and `/payments` correctly redirects to the authenticated application boundary rather than exposing tenant data.
- Production runtime logs for the merged deployment were inspected; authenticated runtime closure was not falsely claimed because the available verification window did not include a valid authenticated E2E session.

## AJM-2 closure hardening audit — 2026-08-28

The repository, production schema and current Vercel runtime were re-inspected after the product-surface reconciliation. The following concrete issues were found and corrected:

1. **User-facing internal identifier leakage — FIXED**
   - Financial resource list surfaces were exposing raw foreign-key UUIDs such as patient, invoice, treatment-plan, supplier, purchase-order, inventory-item and session identifiers.
   - Overview fallbacks also exposed patient IDs and truncated purchase-order IDs when friendly labels were unavailable.
   - The UI now omits internal foreign-key identifiers rather than presenting technical IDs as operator-facing data.

2. **Inventory low-stock KPI runtime error — FIXED**
   - The KPI attempted a PostgREST comparison of one column to another using `.lte("current_stock", "reorder_threshold")`, which treats the second argument as a literal value rather than a column reference.
   - The calculation now performs the comparison over the tenant-scoped numeric fields after retrieval, preserving the same approved formula.

3. **Feature-flag RLS runtime error — FIXED in production**
   - Vercel production logs showed repeated `permission denied for function get_current_user_role` errors while reading `feature_flags`.
   - The `feature_flags` read policy now resolves the super-admin exception directly through the tenant-scoped `clinic_users` record instead of calling `get_current_user_role()` from the RLS predicate.
   - The corresponding production policy was applied and verified; the matching repository migration is `20260828000000_ajm2_harden_feature_flag_rls_role_lookup.sql`.

These corrections do not create a second financial, inventory or analytics engine and do not alter the approved AJM-2 domain boundaries.

## Current runtime evidence

The current production deployment inspected before these hardening changes was `READY`, but its runtime error aggregation showed:

- repeated feature-flag RLS errors;
- inventory low-stock KPI failures;
- unrelated historical authentication/session errors outside the AJM-2 product surface.

A new Vercel preview deployment was automatically queued from the AJM-2 hardening branch. Authenticated browser E2E evidence is still required before production closure can be claimed.

## Closure gate

AJM-2 remains **IN PROGRESS** until authenticated E2E evidence is completed. No test account, password, or private credential is stored in the repository or introduced into production fixtures for this verification.

Remaining closure evidence:

1. Authenticated Clinic Admin runtime verification.
2. Sidebar hierarchy verification in the authenticated tenant workspace.
3. Core entitlement + effective-permission verification together.
4. Authenticated verification of all Financial & Resources routes.
5. Cross-tenant denial with real authenticated tenant contexts.
6. Authenticated financial/payment/installment workflow verification against valid tenant/patient data without test contamination.
7. Patient Portal financial/installment read integration verification where applicable.
8. Existing Analytics consumption of canonical financial/resource facts without a duplicate analytics path.
9. Existing invoice and inventory workflow regression verification.
10. Final AJM-2 Definition of Done evidence update.

**No AJM-3 work has been started.**
