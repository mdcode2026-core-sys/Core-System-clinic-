-- Financial/Inventory referential-integrity completion; additive and non-destructive.
begin;
create unique index if not exists uq_invoice_refunds_tenant_invoice on public.invoice_refunds(tenant_id,invoice_id);
create unique index if not exists uq_invoice_payments_tenant_id_id on public.invoice_payments(tenant_id,id);
create unique index if not exists uq_clinic_users_tenant_id_id on public.clinic_users(tenant_id,id);
create unique index if not exists uq_inventory_lots_tenant_item on public.inventory_lots(tenant_id,inventory_item_id);
alter table public.invoice_refunds add constraint fk_refund_invoice_same_tenant foreign key(tenant_id,invoice_id) references public.clinic_invoices(tenant_id,id) not valid;
alter table public.invoice_refunds add constraint fk_refund_payment_same_tenant foreign key(tenant_id,payment_id) references public.invoice_payments(tenant_id,id) not valid;
alter table public.invoice_refunds add constraint fk_refund_actor_same_tenant foreign key(tenant_id,refunded_by) references public.clinic_users(tenant_id,id) not valid;
alter table public.inventory_lots add constraint fk_inventory_lot_item_same_tenant foreign key(tenant_id,inventory_item_id) references public.inventory_items(tenant_id,id) not valid;
alter table public.invoice_refunds validate constraint fk_refund_invoice_same_tenant;
alter table public.invoice_refunds validate constraint fk_refund_payment_same_tenant;
alter table public.invoice_refunds validate constraint fk_refund_actor_same_tenant;
alter table public.inventory_lots validate constraint fk_inventory_lot_item_same_tenant;
commit;
