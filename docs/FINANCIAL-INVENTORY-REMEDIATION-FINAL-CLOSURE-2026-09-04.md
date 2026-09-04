# CORE SYSTEM — Financial & Inventory Final Closure

**Governance:** ADR-008 + FINANCIAL-INVENTORY-REMEDIATION-CONTRACT-2026-09-04.md

## Final status

**NOT CLOSED — BLOCKER**

The backend/security remediation remains production-valid, but the overall Financial + Inventory scope is reopened for user-facing workflow remediation. Runtime inspection exposed a material UX/operational gap: several existing routes still present internal identifiers or generic CRUD forms instead of complete clinic workflows.

## Confirmed user-facing blockers

1. Invoice list had an ambiguous PostgREST relationship between `clinic_invoices` and `invoice_items`, producing an embedding error in production.
2. Payments exposed invoice identifiers instead of business-searchable invoice/patient selection and did not clearly distinguish patient receipts from outgoing disbursements.
3. Financial plans/installments did not provide sufficient guided workflow for creating a patient plan and understanding the difference between a scheduled installment and an actual payment.
4. Insurance lacked clinic insurance-provider/contract configuration and a clear patient coverage → claim workflow.
5. Inventory lacked an adequate item-master/stock-adjustment UI despite the backend foundation supporting these concepts.
6. Purchasing lacked a clear supplier-bill workflow connected to supplier obligations.
7. Reports did not sufficiently explain what each number represents or provide an understandable operational interpretation.

## Remediation executed in this continuation

- Invoice embedding was changed to explicit foreign-key relationship selection in `invoicing.queries.ts`.
- Added tenant-scoped `insurance_providers` and `insurance_contracts` business entities.
- Linked patient insurance coverage to the clinic contract model.
- Added tenant-scoped `supplier_bills` and linked them to canonical supplier obligations.
- Extended inventory item master with SKU, category, description and manufacturer while preserving the canonical `inventory_items` entity.
- Added `expenses:manage` to the existing permission model for Clinic Admin and Accounting.
- Added authenticated server actions for inventory item maintenance, stock adjustment, insurance provider/contract maintenance, supplier bills and operating expenses.
- Replaced the generic financial-resources landing surface with a business-oriented workflow center exposing invoices, receipts, financial plans, insurance, inventory, purchasing and expenses with human-readable labels and selection controls.
- Added patient financial-plan, insurance-coverage and claim preparation UI.
- Added an explainable financial/resource summary surface using the canonical reporting RPC.

## Verification

- Production Supabase accepted the new additive migrations.
- Repository migration files were added for each production DDL change.
- The latest Vercel production deployment for commit `0a371cb1f4d4b76197d12a4b3b8104a0cd7dd422` reached **READY**.
- The latest production build passed TypeScript, static generation and deployment.
- The inspected runtime error window for that deployment contained no error/fatal logs.

## Remaining closure gate

The scope must not return to **PRODUCTION CLOSED** until the user can execute the complete business workflows from the UI without UUIDs/internal identifiers:

`Patient → Visit/Procedure → Invoice → Receipt → Outstanding/Refund`

`Financial Plan → Installments → Receipt → Outstanding`

`Insurance Provider/Contract → Patient Coverage → Invoice Split → Claim → Reconciliation`

`Item Master → Purchase Order → Supplier Bill → Receiving → Inventory/Lot/Expiry → Payable → Supplier Payment`

`Adjustment/Return/Expiry/Damage → Inventory Ledger → Stock/Valuation`

`Procedure → Material Consumption → Procedure Cost → Reporting`

and can understand every important report figure and trace it back to its canonical business records.

**Closure decision:** **NOT CLOSED — BLOCKER** until the complete UI workflow acceptance gate is satisfied.
