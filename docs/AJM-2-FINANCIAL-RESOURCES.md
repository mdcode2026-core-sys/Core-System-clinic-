# CORE SYSTEM — AJM-2 Financial & Resources Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-2 — Financial & Resources Foundation  
**Status:** IMPLEMENTATION IN PROGRESS  
**Date:** 2026-08-27  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Branch:** `ajm/ajm-2-financial-resources-foundation`

## 1. Objective

Implement the approved Financial & Resources foundation by reusing the existing invoicing and inventory domains, reconciling repository/database drift, and adding only the bounded financial/resource capabilities that are genuinely missing: installments, minimum insurance, suppliers/purchasing foundations, and explicit resource/financial data relationships.

AJM-2 does not create a second patient, treatment-plan, agenda, follow-up, permission, portal, or analytics system.

## 2. Governing references

- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md`
- `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md`
- Existing PJ contracts, especially PJ-03, PJ-05, PJ-07, PJ-08 and PJ-09 in the project Library.

## 3. Current verified baseline

### Repository

Existing reusable foundations:

- `src/domain/invoicing/*`
- `src/features/invoicing/*`
- `src/domain/inventory/*`
- `src/features/inventory/*`
- existing Analytics/KPI infrastructure
- existing Treatment Plan and Patient Portal integration anchors.

### Live database

Verified AJM-2 tables:

- `clinic_invoices`
- `invoice_items`
- `invoice_payments`
- `billing_events`
- `inventory_items`
- `inventory_ledger`
- Treatment Plan / visit / procedure tables used as integration anchors.

Current live counts on 2026-08-27:

| Entity | Count |
|---|---:|
| Invoices | 0 |
| Invoice items | 0 |
| Invoice payments | 0 |
| Billing events | 0 |
| Inventory items | 1 |
| Inventory ledger | 1 |

No live columns/tables were found for installments, payer/insurance, suppliers or purchasing.

### Database security

RLS is enabled on the inspected AJM-2 financial/resource tables. However, the current invoice policy set is incomplete, and legacy role-name checks (`admin`) remain in invoice item/payment policies even though the active architecture uses `clinic_admin`. These are implementation defects to reconcile, not architectural changes.

### Function/API drift

The live database signatures differ from current repository calls. Examples verified:

- `create_invoice_from_session(p_session_id uuid)` — repository passes an extra tenant argument.
- `record_invoice_payment(p_tenant_id uuid, p_invoice_id uuid, p_amount_subunits integer, p_payment_method text, p_payment_reference text, p_notes text, p_collected_by uuid)` — repository omits required tenant and collector arguments.
- `issue_invoice(p_invoice_id uuid)` returns JSON without the invoice number currently expected by repository code.

Repository invoice item/payment field names also differ from the live schema. This is a blocking repository/database reconciliation issue for invoice runtime.

### Inventory security drift

`src/domain/inventory/inventory.actions.ts` accepts a client-provided `tenant_id` for mutations. AJM-2 must replace this with server-resolved tenant context and permission-based authorization while preserving the existing inventory domain.

## 4. Classification

| Capability | Classification | Decision |
|---|---|---|
| Billing | REUSE / FIX / EXTEND | Preserve existing invoicing domain; reconcile DB/API drift |
| Payments | REUSE / FIX / EXTEND | Preserve payment ledger and audited state changes |
| Installments | BUILD / CORE / DATA FOUNDATION | New bounded financial-plan/installment model linked to Treatment Plan |
| Insurance minimum | BUILD / CORE / DATA FOUNDATION | Patient/payer/coverage/claim-ready model; no external payer integration |
| Inventory | REUSE / FIX / EXTEND | Preserve canonical inventory and ledger |
| Consumption | REUSE / EXTEND / DATA FOUNDATION | Preserve ledger; strengthen treatment/session linkage |
| Suppliers | BUILD / CORE | New bounded supplier master |
| Purchasing | BUILD / CORE | Purchase request/order/receiving foundation linked to inventory |
| Financial automation | DATA FOUNDATION / ADVANCED | Capture auditable financial events; advanced automation deferred |
| Advanced insurer integrations | DEFER / ADVANCED | Not required for AJM-2 core |
| Accounting ERP | DEFER / OUT OF SCOPE | Explicitly prohibited by blueprint |
| Duplicate analytics | REMOVE / PROHIBITED | Reuse existing Analytics/Reports |

## 5. Exact implementation scope

### A. Invoice/payment reconciliation

- Align server actions and types with the live schema/function signatures.
- Replace role-name authorization with the established permission architecture.
- Add missing invoice mutation policies using active role/permission semantics.
- Preserve invoice history and audited cancellation/discount behavior.
- Ensure payment collection records the actual collector and tenant safely.

### B. Installments

Introduce a bounded financial-plan/installment model:

```text
Treatment Plan
  ↓
Financial Plan
  ↓
Installment Schedule
  ↓
Payments
```

The model must preserve due amount, due date, status, payment allocation context and audit history. It must not become a second Treatment Plan.

### C. Insurance minimum

Introduce minimum structured patient insurance context:

- payer/insurance company;
- policy/coverage reference;
- coverage context;
- patient financial responsibility where known;
- claim-ready state;
- reconciliation/matching state.

External payer integrations remain Advanced.

### D. Inventory / purchasing / suppliers

- Preserve `inventory_items` and `inventory_ledger` as canonical inventory records.
- Add bounded supplier and purchasing records.
- Support purchase lifecycle and receiving sufficiently to update inventory through the existing canonical ledger.
- Do not create a second stock balance system.

### E. Data/event foundation

Capture structured financial/resource events needed later by Insights and automation without building AI or advanced automation in AJM-2.

## 6. Integration requirements

### Treatment Plan → Financial & Resources

Treatment Plan remains authoritative for patient treatment intent. Financial Plan/Installments reference it.

### Visit/Procedure → Billing

Existing procedure/session relationships remain authoritative. Billing references them rather than duplicating service definitions.

### Treatment/Procedure → Inventory

Existing inventory ledger remains the resource-consumption source.

### Financial → Patient Portal

Expose only patient-appropriate financial/installment information through the existing Portal architecture when enabled. Portal is not a dependency for internal financial operation.

### Financial → Insights

Emit structured, auditable financial/resource facts for existing analytics infrastructure. Insights remains the analytical owner.

## 7. Authorization and tenant isolation

Every AJM-2 mutation must follow:

```text
Authentication
 → Server tenant resolution
 → Effective permission check
 → Input validation
 → Business rule validation
 → Database mutation
```

Client-provided tenant IDs are not trusted as security boundaries.

RLS remains defense-in-depth and must match the active `clinic_admin`/permission architecture.

## 8. Acceptance scenarios

1. Create invoice from a valid visit session.
2. Create manual invoice with procedure-linked items.
3. Issue a draft invoice.
4. Record partial payment.
5. Record final payment and reach paid state.
6. Reject payment beyond outstanding balance.
7. Apply an authorized discount and preserve approval context.
8. Cancel an eligible invoice and preserve history.
9. Create Treatment Plan financial plan and installment schedule.
10. Record an installment payment allocation without corrupting invoice/payment history.
11. Attach minimum insurance context to a patient and mark claim-ready state.
12. Create supplier and purchase order.
13. Receive purchased stock through the canonical inventory ledger.
14. Prevent cross-tenant financial/resource access.
15. Prevent unauthorized financial/resource mutation.
16. Preserve existing Agenda, Treatment Plan, Follow-up, Portal and Analytics behavior.

## 9. Current blockers / risks

- Invoice repository/database drift is confirmed and must be fixed before invoice runtime can be considered reliable.
- Existing invoice RLS policies do not currently provide complete mutation coverage.
- Legacy `admin` role literals remain in invoice item/payment policies.
- Installment/insurance/purchasing/supplier models are absent from the live schema and therefore require controlled migrations.
- Existing inventory actions trust client tenant input and require security reconciliation.

No architectural conflict is currently identified. These are implementation/schema reconciliation defects within the approved AJM-2 design.

## 10. Explicit non-goals

AJM-2 will not:

- replace the Patient Journey;
- replace Treatment Plan;
- replace Agenda;
- replace Follow-up;
- replace Patient Portal;
- create an accounting ERP;
- implement external insurer integrations;
- implement advanced financial automation;
- implement AI;
- create a second analytics engine;
- create a second inventory engine.

## 11. Definition of Done

AJM-2 can be closed only when all applicable items are evidenced:

- [ ] Billing workflow reconciled and operational.
- [ ] Payments workflow reconciled and operational.
- [ ] Installments Core model operational.
- [ ] Minimum Insurance model operational.
- [ ] Inventory remains canonical and secure.
- [ ] Suppliers operational.
- [ ] Purchasing and receiving operational.
- [ ] Financial/resource data relationships persist correctly.
- [ ] Permissions enforced through current authorization architecture.
- [ ] Tenant isolation verified.
- [ ] RLS and database constraints verified.
- [ ] Treatment Plan/PJ integration verified.
- [ ] Patient Portal integration remains optional and correct.
- [ ] Existing Analytics/Reports reused.
- [ ] Runtime acceptance scenarios pass.
- [ ] Regression validation passes.
- [ ] Repository migrations are synchronized with live schema.
- [ ] Stage documentation contains completion evidence.
- [ ] Git commit is verified on `main` after merge.
- [ ] Production deployment and runtime are verified.

## 12. Status

**AJM-2 is currently IMPLEMENTATION IN PROGRESS.**

The baseline gate is complete enough to begin controlled implementation. No AJM-3 work is authorized until AJM-2 reaches its Definition of Done.
