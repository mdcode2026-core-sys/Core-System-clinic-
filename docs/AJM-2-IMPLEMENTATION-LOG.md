# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS  
**Date:** 2026-08-27

## Governing execution rule

AJM-2 follows the AJM Master Blueprint, AJM Implementation Plan, Stage Index and Financial & Resources Engineering Blueprint. Existing Billing/Invoicing and Inventory domains remain canonical. Financial & Resources capabilities are integrated with those surfaces without creating a duplicate billing or inventory engine.

## User-surface reconciliation

The earlier implementation exposed `/financial-resources` as a parallel user-facing application. That was an execution error. The corrected implementation removes that duplicate route and exposes the AJM-2 capabilities through the existing canonical surfaces:

- `/invoices` remains the Billing & Invoices entry point.
- `/invoices/financial` provides Financial Plans, Installments and Insurance.
- `/inventory` remains the Inventory entry point.
- `/inventory/purchasing` provides Suppliers and Purchasing.
- `/inventory/purchasing/receiving` provides Purchase Receiving.
- Financial & Resources remains independently owned in the domain layer.

## Database reconciliation and fixes

Production inspection found that two AJM-2 invoice/payment RPC implementations attempted to write generated columns. This was a real repository-to-production contract defect, not a UI issue.

Corrected production functions:

- `create_manual_invoice` no longer writes generated `clinic_invoices.amount_due_subunits`.
- `create_manual_invoice` no longer writes generated `invoice_items.line_total_subunits`.
- `record_invoice_payment` no longer writes generated `clinic_invoices.amount_due_subunits`.
- `record_invoice_payment_with_installment` no longer writes generated `clinic_invoices.amount_due_subunits`.

The matching migration files are synchronized in the AJM-2 branch with the production migration versions.

## Real database E2E evidence

Using an authenticated tenant context inside a rollback transaction, the following scenarios were executed against Production:

### Billing E2E — PASS

`Clinic Admin → manual invoice → issue invoice → financial plan → installment linked to invoice → payment allocated to installment → invoice paid → installment paid`

Assertions passed:

- invoice creation succeeded;
- invoice issuance succeeded;
- financial plan creation succeeded;
- installment creation/link succeeded;
- atomic installment payment succeeded;
- invoice `amount_paid_subunits` reached the expected amount;
- generated `amount_due_subunits` resolved to zero;
- invoice status became `paid`;
- installment status became `paid`.

### Purchasing E2E — PASS

`Clinic Admin → supplier → purchase order → purchase order item → receiving → canonical inventory stock increase → inventory ledger entry`

Assertions passed:

- supplier creation succeeded;
- purchase order creation succeeded;
- receiving succeeded;
- received quantity matched the ordered quantity;
- canonical inventory stock increased by the received quantity;
- canonical inventory ledger recorded the purchase event.

### Security negative scenarios — PASS

- Cross-tenant invoice creation returned `Tenant mismatch`.
- Unbalanced financial plan installments were rejected.
- Over-receiving beyond ordered quantity was rejected.

All E2E database fixtures were executed inside transactions and rolled back. Production counts remained unchanged after validation.

## Repository state

The reconciliation branch is `ajm/ajm-2-e2e-reconciliation`.

The branch contains the corrected canonical surface routing, bilingual nested navigation, receiving workflow, generated-column RPC fixes, synchronized migrations, and this validation record.

## Remaining gates before Definition of Done

1. Final branch build must pass.
2. Preview deployment must correspond to the final branch HEAD.
3. Authenticated browser/runtime acceptance must pass on `/invoices`, `/invoices/financial`, `/inventory`, `/inventory/purchasing`, and `/inventory/purchasing/receiving`.
4. Existing invoice and inventory regression behavior must pass.
5. Treatment Plan financial linkage must be verified where applicable.
6. Patient Portal financial/installment read integration must be verified where enabled.
7. Final Production deployment must correspond to the validated branch HEAD.
8. Only after these gates pass may AJM-2 be marked CLOSED and AJM-3 started.

## Current state

**AJM-2 remains IN PROGRESS.** The core authenticated database E2E scenarios now pass, but the final browser/build/Production deployment gate cannot yet be marked passed because Vercel is currently returning a `build-rate-limit` failure for this project. No claim of full Definition of Done is made until the deployment/runtime gate is actually verified.
