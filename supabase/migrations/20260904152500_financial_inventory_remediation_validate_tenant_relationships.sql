-- CORE SYSTEM Financial & Inventory remediation: validate tenant-aware references.
begin;
alter table public.clinic_invoices validate constraint fk_invoice_patient_same_tenant;
alter table public.clinic_invoices validate constraint fk_invoice_session_same_tenant;
alter table public.invoice_items validate constraint fk_invoice_item_invoice_same_tenant;
alter table public.invoice_items validate constraint fk_invoice_item_procedure_same_tenant;
alter table public.invoice_payments validate constraint fk_payment_invoice_same_tenant;
alter table public.financial_installments validate constraint fk_installment_plan_same_tenant;
alter table public.inventory_ledger validate constraint fk_inventory_ledger_item_same_tenant;
alter table public.purchase_orders validate constraint fk_purchase_order_supplier_same_tenant;
commit;
