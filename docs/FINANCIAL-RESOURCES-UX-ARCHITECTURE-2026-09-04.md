# CORE SYSTEM — Financial & Resources UX Architecture

Status: Approved implementation direction
Date: 2026-09-04

## Purpose

Financial & Resources is an integrated domain surface, not a collection of CRUD pages. The user must see operational work first and configuration second.

## UX rules

1. **One operational home**: Financial & Resources has one primary center. Do not expose parallel CRUD pages for the same business object in the same navigation level.
2. **Operations before configuration**: daily users see invoices, receipts, plans, claims, inventory, purchasing, supplier bills and expenses. Configuration is reached through one dedicated Financial & Resources Settings surface.
3. **Forms are action-driven**: do not display every create/edit form permanently. A list or dashboard is the default; a form opens only after the user chooses Add, Record, Adjust, Prepare, or Edit.
4. **Human identifiers only**: users select patients, invoices, suppliers, items and insurance contracts by recognizable business information. Internal UUIDs never appear as required user input.
5. **Contextual search**: every high-volume operational list supports search using the business identifiers users actually know (invoice number, patient name/phone, supplier name/bill number, item name/SKU).
6. **Clear financial language**: Receipt means money received; Disbursement/Expense means money paid out; Invoice means a bill issued to a patient; Supplier Bill means a bill received from a supplier; Installment means a scheduled amount due, not a payment.
7. **Settings are reference/configuration**: service pricing remains in Medical Master Library / Service Catalog; insurance providers/contracts are configured in settings; item master data is configured in settings; daily stock changes happen in operations.
8. **Cross-domain entry points remain contextual**: Patient Flow and clinical workflows can create or open the relevant financial record without forcing the user to navigate the Financial Center manually.
9. **No duplicate engines**: UI consolidation must reuse the existing canonical invoice, payment, inventory, purchasing, insurance and permission engines.
10. **Advanced data stays available**: reporting and detailed audit information remain available without forcing advanced fields into daily transaction forms.

## External UX patterns adopted

SimplePractice currently uses a central Billing hub for dashboard, outstanding work, claims and transactions while keeping Billing configuration under Settings. Jane similarly separates Billing Settings from daily billing work and hides feature-specific settings until the feature is enabled. Cliniko provides configurable payment allocation rules under Settings while the actual payment workflow remains operational. CORE adopts the organizational pattern, not their feature set or terminology, and keeps its own architecture and clinical workflow authoritative.

## Target hierarchy

Financial & Resources
- Overview
- Sales & Receivables
  - Invoices
  - Receipts & Collections
- Financial Plans & Installments
- Insurance & Claims
- Items & Inventory
- Purchasing & Suppliers
- Operating Expenses
- Financial & Resources Settings
  - Billing reference/configuration
  - Insurance providers & contracts
  - Item master
  - Purchasing reference/configuration
  - Expense configuration

## Acceptance rule

A screen is not considered complete merely because its table and RPC work. A non-technical clinic user must be able to identify the record, understand the action, complete it without UUID knowledge, and locate the resulting transaction afterward.
