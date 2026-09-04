# Financial & Inventory Remediation — Execution Addendum

**Governing references:** ADR-008 + FINANCIAL-INVENTORY-REMEDIATION-CONTRACT-2026-09-04.md

A final P1 hardening migration was applied after verification of the existing canonical application payment path:

- Production migration: `20260904144247` — `financial_inventory_remediation_canonical_payment_actor_integrity`.
- `record_invoice_payment_with_installment()` now validates the payment actor belongs to the current tenant.
- When an installment has no invoice link, the canonical payment operation links it to the paid invoice rather than leaving the relationship ambiguous.
- Existing canonical application path in `src/domain/invoicing/invoicing.actions.ts` was confirmed to use `record_invoice_payment_with_installment()` for installment payments.

The remediation therefore preserves the existing payment engine rather than introducing a second installment-payment engine.

## Current evidence

- Canonical stock mutation: enforced.
- Direct client inventory-ledger mutation: revoked.
- Direct client invoice-payment mutation: revoked.
- Legacy installment-only mutation RPC: revoked for authenticated clients.
- Invoice issue/cancel authorization: enforced at DB boundary.
- Issued invoice/item immutability: enforced.
- Tenant-aware financial relationships: validated successfully against current data.
- Experimental legacy inventory movement: preserved and explicitly classified; not deleted or fabricated.

## Closure status

**NOT CLOSED — BLOCKER**

The remaining blockers are primarily controlled runtime validation and remaining P1/P2 capabilities (refunds, returns/expiry, populated E2E financial/resource scenarios, costing/margin/report validation, and broader repository-production migration reconciliation). No architectural redesign is authorized or required by this remediation.
