# AJM-2 Implementation Log

**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IN PROGRESS — Authenticated E2E / Closure Gate  
**Date:** 2026-08-28

## Deployment synchronization checkpoint

This commit is an intentional Git integration checkpoint after the AJM-2 UI/runtime corrections. Vercel Production must consume this `main` revision and produce a new deployment before runtime validation is considered complete.

## Governing reconciliation

AJM-2 is implemented as **one tenant-facing Financial & Resources product surface**. Billing, Payments, Installments, Insurance, Inventory, Consumption, Purchasing, Suppliers and Receiving remain independently owned backend responsibilities but are presented and navigated as one coherent product surface. This follows the AJM Master Blueprint, Implementation Plan and Financial & Resources engineering blueprint.

The current Clinic Admin foundation rule is: **all implemented tenant-facing AJM-2 capabilities are visible/testable without the temporary commercial entitlement gate**. Authorization, tenant isolation, RLS and audit controls remain mandatory.

## Verified and implemented

- Invoice actions and live schema/RPC contracts reconciled.
- Invoice detail issue/payment/cancel actions wired.
- Server-side permission checks added to financial mutations.
- Inventory mutations use authoritative server tenant context.
- Financial plans, installments, insurance, suppliers, purchasing and receiving domain actions/queries added and connected to the Financial & Resources surface.
- Financial & Resources is one hierarchical Sidebar surface; it is collapsed initially and expands explicitly. Desktop navigation remains persistent while navigating.
- `/invoices` and `/inventory` remain canonical implementations; no duplicate engines created.
- Operational create/record workflows are exposed for payments, financial plans, insurance profiles, suppliers, purchase orders and receiving.
- Temporary commercial entitlement gating does not hide implemented AJM-2 capabilities from Clinic Admin.

## Production database foundation

AJM-2 production migrations establish financial plans/installments, minimum insurance/claims, suppliers, purchasing/receiving, inventory security and auditability. Existing canonical invoice and inventory tables/engines are reused.

Clinic Admin currently has the complete 63-permission catalogue in production. RLS and tenant-scoped authorization remain authoritative.

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

## Runtime closure gate

AJM-2 is **not closed** until a fresh Vercel Production deployment reaches READY and authenticated runtime validation confirms the surface and workflows. Required validation includes Clinic Admin visibility, sidebar hierarchy, create/record workflows, tenant isolation, RLS, auditability, Patient Portal financial/installment integration, Analytics consumption, and invoice/inventory regression.

**No AJM-3 work has been started.**
