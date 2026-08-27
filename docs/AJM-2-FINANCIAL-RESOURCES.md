# CORE SYSTEM — AJM-2 Financial & Resources Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS — Product Surface Reconciliation  
**Date:** 2026-08-27  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `ajm/ajm-2-financial-resources-surface`

## 1. Governing authority

AJM-2 is executed under:

- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md`
- `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md`
- Approved PJ contracts relevant to Treatment Plan, financial commitment, Portal visibility and cross-domain ownership.
- Current owner-approved AJM-2 Product Surface decisions recorded during reconciliation.

The implementation must follow the authority order and must not reopen settled AJM/PJ architecture.

## 2. Architecture preserved

AJM-2 preserves **Independent Modules + Integrated Platform**.

- Invoicing remains the authoritative billing domain.
- Inventory and `inventory_ledger` remain the authoritative resource/stock domain.
- Treatment Plan remains authoritative for treatment intent.
- Agenda remains authoritative for appointment scheduling.
- Patient Portal remains patient-facing and does not own financial source data.
- Insights remains the analytical owner; AJM-2 only supplies structured source facts.
- `billing_events` remains reserved for platform/subscription billing and is not repurposed for patient billing.

## 3. Product Surface Contract

**Financial & Resources is a first-class tenant-facing product surface and primary Sidebar section.** It is not a duplicate financial domain and not merely a dashboard card collection.

The approved surface is organized as:

```text
Financial & Resources
├── Overview
├── Invoices
├── Payments
├── Financial Plans
├── Installments
├── Insurance
│   ├── Patient Insurance
│   └── Claims
├── Inventory
├── Consumption
├── Suppliers
├── Purchasing
└── Receiving
```

The hierarchy is a user-facing product surface. It does not merge domain ownership in the backend.

### Visibility and packaging

Every user-facing capability is evaluated through the existing licensing/entitlement model and effective permissions:

```text
Tenant subscription / add-on
        ↓
Entitlement
        ↓
Capability
        ↓
Effective user permission
        ↓
Visible/enabled surface and permitted actions
```

The AJM product model distinguishes **Core**, **Advanced**, and **Add-on / Independent product** capabilities. AJM-2 must not use a raw subscription tier as an authorization shortcut. Where a capability is subscription-dependent, the data foundation may exist before the feature is exposed.

For AJM-2 specifically, the current implementation plan explicitly marks the minimum listed financial/resource backbone as **Core**, including Installments and the minimum Insurance capability. Deeper financial automation and external insurer-system integration remain Advanced/deferred. Future Advanced/Add-on surfaces must use the same entitlement/capability chain rather than hard-coded plan names.

A capability may therefore be:

- enabled for the tenant and permitted for the user;
- present as a licensed/upgrade surface but unavailable to the tenant;
- internal/background data foundation and not exposed as an unfinished feature.

Licensing never replaces authorization. A tenant may have a capability while an individual user lacks the permission to execute its actions.

### User-visible properties

Operational properties needed to understand and operate a financial/resource record must be visible in its appropriate list/detail/action surface. Technical implementation fields such as internal IDs, tenant IDs, generated bookkeeping fields, RPC metadata and other internal mechanics remain hidden unless a specific administrative use case requires them.

Monetary subunit storage fields are converted to tenant currency for user-facing display. Internal foreign-key identifiers are not exposed as standalone technical columns when they are not useful to the operator.

The system must not create duplicate records or duplicate engines merely to make a capability visible in this surface.

## 4. Implemented capabilities

### Billing / Payments

Existing invoicing implementation is reconciled against the production schema and RPC contracts. Manual invoices, session-linked invoices, issuing, payments, discounts and cancellation use server-resolved tenant context and effective permissions.

Payment allocation to installments is handled by the authoritative transactional RPC `record_invoice_payment_with_installment`, keeping invoice payment and installment state changes atomic.

### Financial Plans / Installments

A Core financial-plan model was added, linked optionally to the existing Treatment Plan, with an installment schedule and payment allocation references.

Invariants are enforced in the database:

- insurance coverage + patient responsibility = total;
- installment paid amount cannot exceed installment amount;
- unique installment number within a financial plan;
- tenant and cross-domain reference integrity.

### Minimum Insurance

Structured patient insurance profiles and claim-preparation records were added with payer, policy/member references, coverage context, patient responsibility where known, claim-ready state, reconciliation status and claim preparation records.

The tenant-facing surface includes Insurance and a Claims child route. External payer integrations remain Advanced/deferred scope.

### Inventory / Consumption

The existing canonical inventory records and ledger are retained. Mutation actions resolve tenant context server-side and require the appropriate AJM-1 permission. No second stock-balance engine is introduced.

### Suppliers / Purchasing / Receiving

Supplier, purchase-order, order-item, receipt and receipt-item records are used. Purchase order creation and receiving are transactional and validate tenant ownership and inventory ownership. Receiving updates the existing canonical inventory stock/ledger rather than creating another inventory system.

## 5. Authorization and isolation

All AJM-2 mutations follow:

```text
Authentication
 → server tenant resolution
 → entitlement/capability gate where applicable
 → effective permission
 → input/business validation
 → database transaction
```

Database RLS policies are tenant-scoped and permission-scoped. Cross-domain references must preserve tenant consistency.

Role assignments remain governed by AJM-1. Role, permission, workspace and capability are not collapsed into one concept.

## 6. Repository / database reconciliation

Production RPC signatures and field names are reconciled with repository calls. AJM-2 tables remain represented in the repository migration stream.

The existing invoice and inventory surfaces are extended/reorganized rather than replaced by duplicate engines.

The current branch also records the production `financial_resources.core` entitlement and its Core capability mappings. The migration provisions this entitlement for active subscribed tenant plans in the existing subscription model; the application does not authorize directly from a raw `subscription_tier`/plan-name comparison.

## 7. Validation requirements

AJM-2 remains open until the Product Surface Contract is proven through:

- repository verification;
- database/RLS verification;
- entitlement/licensing verification;
- permission verification;
- authenticated runtime verification;
- Sidebar/navigation verification;
- list/detail/action verification for each exposed capability;
- tenant-isolation verification;
- PJ linkage verification;
- Patient Portal financial read integration where applicable;
- existing Analytics consumption of canonical facts;
- regression verification of existing invoices and inventory;
- end-to-end financial and resource workflows.

## 8. Deliberately deferred

AJM-2 does not include:

- external insurer integrations;
- full accounting ERP;
- advanced financial automation beyond the required data foundation;
- AI financial agents;
- second analytics engine;
- second inventory engine;
- replacement of Treatment Plan, Agenda, Follow-up or Patient Portal.

## 9. Current reconciliation status

The underlying financial/resource data foundation, security model and user-facing surfaces are now being reconciled into the approved Financial & Resources product surface. The stage remains **IN PROGRESS** until entitlement-aware navigation/runtime and authenticated E2E evidence are complete.

No AJM-3 implementation is authorized from this document while AJM-2 remains open.

## 10. Definition of Done

AJM-2 may be marked CLOSED only when all of the following are evidenced:

1. Financial & Resources appears as the coherent primary Sidebar surface.
2. Its approved user-facing capabilities are discoverable beneath it without duplicate root surfaces.
3. Each exposed capability uses its authoritative existing/new domain implementation.
4. Core/Advanced/Add-on visibility is governed by entitlement/licensing rather than hard-coded subscription tiers.
5. User actions remain governed by effective permissions.
6. User-visible properties are complete while internal implementation complexity remains hidden.
7. Billing, payments, financial plans and installments operate against the canonical financial model.
8. Minimum insurance and claims preparation are operationally represented.
9. Inventory/consumption use the canonical inventory model and ledger.
10. Suppliers, purchasing and receiving operate transactionally and integrate with canonical inventory.
11. Tenant isolation and RLS are verified.
12. Treatment Plan and Patient Portal ownership/integration remain intact.
13. Insights consumes canonical source facts without a duplicate analytics path.
14. Authenticated runtime E2E scenarios pass.
15. Existing behavior outside AJM-2 has no material regression.
16. Stage documentation and repository state reflect the final implementation.
17. Production deployment/runtime evidence is available.
18. Only then is AJM-2 explicitly CLOSED and AJM-3 may proceed.
