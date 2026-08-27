# CORE SYSTEM — AJM-2 Financial & Resources Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** CLOSED  
**Date:** 2026-08-27  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `ajm/ajm-2-financial-resources-foundation`

## 1. Governing authority

AJM-2 was executed under:

- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md`
- `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md`
- Approved PJ contracts relevant to Treatment Plan, financial commitment, Portal visibility and cross-domain ownership.

The implementation followed the authority order and did not reopen settled AJM/PJ architecture.

## 2. Architecture preserved

AJM-2 preserves **Independent Modules + Integrated Platform**.

- Invoicing remains the authoritative billing domain.
- Inventory and `inventory_ledger` remain the authoritative resource/stock domain.
- Treatment Plan remains authoritative for treatment intent.
- Agenda remains authoritative for appointment scheduling.
- Patient Portal remains patient-facing and does not own financial source data.
- Insights remains the analytical owner; AJM-2 only supplies structured source facts.
- `billing_events` remains reserved for platform/subscription billing and was not repurposed for patient billing.

## 3. Implemented capabilities

### Billing / Payments

Existing invoicing implementation was reconciled against the production schema and RPC contracts. Manual invoices, session-linked invoices, issuing, payments, discounts and cancellation now use server-resolved tenant context and effective permissions.

Payment allocation to installments is handled by the authoritative transactional RPC `record_invoice_payment_with_installment`, keeping invoice payment and installment state changes atomic.

### Financial Plans / Installments

A Core financial-plan model was added, linked optionally to the existing Treatment Plan, with an installment schedule and payment allocation references.

Invariants are enforced in the database:

- insurance coverage + patient responsibility = total;
- installment paid amount cannot exceed installment amount;
- unique installment number within a financial plan;
- tenant and cross-domain reference integrity.

### Minimum Insurance

Structured patient insurance profiles and claim-preparation records were added with:

- payer;
- policy/member references;
- coverage context;
- patient responsibility where known;
- claim-ready state;
- reconciliation status;
- claim preparation records.

External payer integrations remain deferred as Advanced scope.

### Inventory / Consumption

The existing canonical inventory records and ledger were retained. Mutation actions now resolve tenant context server-side and require the appropriate AJM-1 permission. No second stock-balance engine was introduced.

### Suppliers / Purchasing / Receiving

Supplier, purchase-order, order-item, receipt and receipt-item records were added. Purchase order creation and receiving are transactional and validate tenant ownership and inventory ownership. Receiving updates the existing canonical inventory stock/ledger rather than creating another inventory system.

## 4. Authorization and isolation

All AJM-2 mutations follow:

```text
Authentication
 → server tenant resolution
 → effective permission
 → input/business validation
 → database transaction
```

Database RLS policies are tenant-scoped and permission-scoped. Database triggers additionally enforce cross-domain tenant consistency for invoices, payments, financial plans/installments, insurance and purchasing/receiving references.

Role assignments were reconciled with separation-of-duties intent: Clinic Admin and Accounting retain appropriate administrative financial/resource permissions; Receptionist retains only the approved operational subset.

## 5. Repository / database reconciliation

Production RPC signatures and field names were reconciled with repository calls. The repository now reflects the production financial/resource contract, including the current RPC signatures and AJM-2 tables.

A post-reconciliation migration is present in the AJM-2 branch to keep the production definitions represented in the repository migration stream.

## 6. Validation evidence

### Build

The AJM-2 preview successfully completed the project build pipeline:

- I18N catalog parity passed for 23 catalogs.
- Next.js production build completed.
- TypeScript checking completed.
- Static page generation completed for all generated pages.

The preview deployment reached `READY` for commit `56e82ced174120c85ad1f34e4f0ad109359be97c`.

### Runtime

Vercel preview runtime error inspection for the AJM-2 deployment returned no error/fatal log entries during the verification window.

### Database

Production was verified to contain the AJM-2 tables, relationships, constraints, permissions, RLS policies and transactional RPC contracts. Generated Supabase types were regenerated from the live schema and checked against the implemented domain contract.

### Data integrity

The database now enforces the financial and cross-domain invariants at the persistence boundary rather than depending only on UI validation.

## 7. Acceptance status

| Acceptance area | Status |
|---|---|
| Billing contract reconciliation | PASS |
| Payment contract reconciliation | PASS |
| Installment Core foundation | PASS |
| Minimum insurance foundation | PASS |
| Supplier foundation | PASS |
| Purchasing / receiving foundation | PASS |
| Canonical inventory preservation | PASS |
| Effective permissions | PASS |
| Tenant isolation / cross-reference integrity | PASS |
| RLS / database invariants | PASS |
| Treatment Plan linkage | PASS |
| Portal ownership preserved | PASS |
| Existing Analytics ownership preserved | PASS |
| Production schema synchronization | PASS |
| Production build validation | PASS |
| Preview runtime error validation | PASS |

## 8. Deliberately deferred

AJM-2 does not include:

- external insurer integrations;
- full accounting ERP;
- advanced financial automation;
- AI financial agents;
- second analytics engine;
- second inventory engine;
- replacement of Treatment Plan, Agenda, Follow-up or Patient Portal.

## 9. Definition of Done

All AJM-2 implementation and reconciliation gates are satisfied. AJM-2 is therefore **CLOSED**.

No AJM-3 implementation was started during AJM-2.
