# CORE SYSTEM — AJM-2 Financial & Resources Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS — Authenticated E2E / Closure Gate  
**Date:** 2026-08-28  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`

## Product Surface Contract

**Financial & Resources is one coherent first-class tenant-facing product surface.** The user enters one Financial & Resources area; all AJM-2 financial/resource functions are organized underneath that surface.

The canonical navigation hierarchy is:

```text
Financial & Resources
├── Overview
├── Invoices                 (existing canonical domain surface)
├── Payments
├── Financial Plans
│   └── Installments
├── Insurance
│   └── Claims
├── Inventory                (existing canonical domain surface)
│   └── Consumption
└── Purchasing
    ├── Suppliers
    └── Receiving
```

This hierarchy is intentional. A capability that is operationally subordinate to another capability is represented as its child rather than as another tenant-facing root product. In particular, Installments belongs to Financial Plans; Claims belongs to Insurance; Consumption belongs to Inventory; and Suppliers/Receiving belong to Purchasing.

This is a **product/UX boundary**, not a claim that backend ownership must be collapsed. Backend domains remain independently owned and integrated through explicit contracts. The user must not experience these capabilities as unrelated root products.

The existing canonical invoice and inventory implementations are reused. AJM-2 adds the missing financial/resource foundation and exposes the complete surface through the single Financial & Resources entry.

## Navigation architecture rule

`src/core/navigation/navigationRegistry.ts` is the single source of truth for this hierarchy. Financial & Resources is the root surface; its children and grandchildren are represented explicitly in the registry. The corresponding route structure mirrors the hierarchy under `/financial-resources/...`, except for the already-canonical `/invoices` and `/inventory` implementations which remain reused rather than duplicated.

Legacy AJM-2 root routes for Payments, Financial Plans, Installments, Insurance, Claims, Consumption, Suppliers, Purchasing and Receiving are removed. Their functionality is now reached through the Financial & Resources surface and its canonical nested routes.

## Overview contract

Overview is a status/summary surface only. It does not contain the operational forms or workflows belonging to Payments, Financial Plans, Installments, Insurance, Claims, Purchasing, Suppliers, Receiving or Consumption.

## Current foundation access rule

During the current AJM-2 implementation and manual-validation phase, **Clinic Admin is unrestricted by the temporary subscription/entitlement packaging layer** for the tenant platform surface. Clinic Admin receives the complete current permission catalogue and can see/test every implemented tenant-facing AJM-2 capability.

This does not remove authentication, tenant isolation, RLS, or server-side authorization. It also does not alter the subscription/tenant architecture. Commercial plan-based feature restrictions are a later concern.

## Scope

Billing, Payments, Financial Plans, Installments, Minimum Insurance, Inventory, Consumption, Purchasing, Suppliers and Receiving are in AJM-2. Treatment Plan, Agenda, PJ, Workforce, Communications, Insights, AI and Subscription/Tenant redesign are not owned by this stage.

## Implementation state

The repository contains a dedicated `financial-resources` feature center and domain action/query layer. The primary `/financial-resources` route is the coherent surface for the stage. Canonical existing routes such as `/invoices` and `/inventory` remain reachable from that surface because their authoritative implementations predate AJM-2 and are explicitly reused.

The new AJM-2 routes are nested under `/financial-resources` according to the product hierarchy. This prevents duplicate root products while retaining independent backend domain ownership.

Production migrations establish financial plans/installments, minimum insurance/claims, suppliers, purchasing/receiving, inventory security and auditability. Existing invoice/inventory engines are not duplicated.

## Security

Server-side tenant resolution and effective permissions remain authoritative. RLS remains enabled and tenant-scoped. Clinic Admin's current full permission catalogue is a visibility/testing foundation, not a permission bypass for other roles.

## Validation gate

The implementation is not marked CLOSED until authenticated E2E, cross-tenant isolation, financial workflows, Patient Portal/Insights integration and regression evidence are completed. No AJM-3 work starts before this gate is closed.
