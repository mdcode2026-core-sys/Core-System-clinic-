# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS — Authenticated E2E / Closure Gate  
**Date:** 2026-08-28

## Governing reconciliation

AJM-2 is implemented as **one tenant-facing Financial & Resources product surface**. Billing, Payments, Installments, Insurance, Inventory, Consumption, Purchasing, Suppliers and Receiving remain independently owned backend responsibilities but are presented and navigated as one coherent product surface. This follows the AJM Master Blueprint, Implementation Plan and Financial & Resources engineering blueprint. fileciteturn153file0 fileciteturn154file0 fileciteturn167file0

The current Clinic Admin foundation rule is: **all implemented tenant-facing AJM-2 capabilities are visible/testable without the temporary commercial entitlement gate**. Authorization, tenant isolation, RLS and audit controls remain mandatory.

## Verified and implemented

### Repository / application

- Reconciled invoice actions with live Supabase RPC signatures.
- Reconciled invoice item/payment field names with the live schema.
- Wired the invoice detail UI to real issue/payment/cancel server actions.
- Added explicit server-side effective-permission checks for financial mutations.
- Removed client-supplied tenant ID as an authorization source in inventory mutations; server tenant context is authoritative.
- Added financial-resources domain types, actions and queries for financial plans, installments, insurance profiles, suppliers and purchasing/receiving.
- Added the approved hierarchical **Financial & Resources** Sidebar surface.
- Corrected the Sidebar UX: Financial & Resources is collapsed initially, expands on explicit click, and the desktop Sidebar remains persistent while navigating. Mobile may close after selecting a page.
- Converted operational AJM-2 child navigation to the single Financial & Resources surface using section routing where the central surface is the operational UI.
- Preserved `/invoices` and `/inventory` as canonical existing implementations rather than creating duplicate engines.
- Added live operational workflows for payment recording, financial-plan creation, insurance-profile creation, supplier creation, purchase-order creation and purchase receiving.
- Added bilingual operational labels for the Financial & Resources surface.
- Removed temporary entitlement gating from Clinic Admin's Financial & Resources routes; permissions/RLS remain authoritative.

### Production database

Applied and verified AJM-2 migrations:

- `ajm_2_financial_resources_foundation`
- `ajm_2_invoice_manual_and_payment_hardening`
- `ajm_2_purchasing_receiving_and_inventory_security`
- `ajm_2_permission_role_boundary_correction`
- `ajm_2_financial_resources_audit_triggers`
- `ajm2_financial_resources_core_entitlements`
- `ajm2_restore_clinic_admin_full_permissions`

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

### Security and current foundation access

- Invoice, invoice-item and invoice-payment mutation policies use tenant resolution plus the established permission function.
- Inventory ledger writes require `inventory:adjust`.
- Purchasing and insurance tables are tenant-scoped with RLS.
- Financial/resource mutations have audit triggers using the existing audit function.
- Clinic Admin has **63/63** current role permissions in production.
- Clinic Admin is not blocked by the temporary commercial entitlement packaging layer for the current tenant surface.

## Product Surface

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

This is the product/UX boundary. Backend domain ownership remains independent.

## Production database verification

The live Supabase project contains all AJM-2 Core tables listed above. RLS is enabled on the financial/resource tables checked, including financial plans/installments, insurance profiles/claims, suppliers, purchasing/receiving and invoice payments. Clinic Admin currently has 63 assigned permissions.

## Corrections made after user runtime review

1. **Temporary entitlement gating was still present in route code despite the documented Clinic Admin bypass.** Removed from the central Financial & Resources page and legacy financial-resource list surface.
2. **Financial & Resources was not behaving as a product surface.** Child operational navigation now routes into the central Financial & Resources surface where applicable.
3. **Sidebar behavior was wrong.** It is now persistent on desktop; Financial & Resources is collapsed until explicitly expanded; child navigation does not close the desktop Sidebar.
4. **Payments was read-only.** The unified surface now uses the existing canonical `recordPayment` action for actual payment recording.
5. **Suppliers was read-only.** The unified surface now exposes the existing `createSupplier` action.
6. **Purchasing was read-only.** The unified surface now exposes the existing `createPurchaseOrder` action.
7. **Receiving was read-only.** The unified surface now exposes the existing `receivePurchaseOrder` action and purchase-order item selection.
8. **Insurance creation was not visible as an operational workflow.** The unified surface now exposes `createInsuranceProfile` when the authenticated user has the required permission.

## Vercel verification

A Vercel production deployment for the earlier entitlement-gate correction reached build failure because the subsequent UI contract change added the `invoices` prop after that deployment snapshot. The error was identified from the actual build log and corrected in the repository before the current implementation was documented. A fresh production deployment must reach READY before runtime closure is claimed.

## Closure gate

AJM-2 remains **IN PROGRESS** until authenticated E2E evidence is completed. Required evidence remains:

1. Authenticated Clinic Admin runtime verification.
2. Sidebar hierarchy verification.
3. Complete Clinic Admin permission verification together with the temporary capability bypass.
4. Authenticated verification of all Financial & Resources routes/workflows.
5. Cross-tenant denial with real authenticated tenant contexts.
6. Authenticated financial/payment/installment workflow verification against valid tenant/patient data.
7. Patient Portal financial/installment read integration verification where applicable.
8. Existing Analytics consumption of canonical financial/resource facts.
9. Existing invoice and inventory regression verification.
10. Final AJM-2 Definition of Done evidence update.

**No AJM-3 work has been started.**
