-- CORE SYSTEM Financial/Inventory cumulative reconciliation after production migration 20260904144247.
-- Non-destructive; preserves experimental history.
begin;
insert into public.permissions(permission_key,permission_name,description,resource,action) values
('invoices:refund','Refund invoices','Create auditable invoice refunds without deleting original payments','invoices','refund'),
('purchasing:return','Return received purchasing stock','Return received stock against a purchase receipt','purchasing','return') on conflict(permission_key) do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.role_key in ('clinic_admin','accounting') and r.tenant_id is null and p.permission_key in ('invoices:refund','purchasing:return')
and not exists(select 1 from public.role_permissions rp where rp.role_id=r.id and rp.permission_id=p.id and rp.deleted_at is null);

create table if not exists public.invoice_refunds(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null, invoice_id uuid not null, payment_id uuid,
 amount_subunits integer not null, refund_method text not null, reference text, reason text not null,
 refunded_by uuid not null, refunded_at timestamptz not null default now(), created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), deleted_at timestamptz,
 constraint invoice_refunds_amount_positive check(amount_subunits>0),
 constraint invoice_refunds_method_check check(refund_method in ('cash','card','bank_transfer','online','other')));
alter table public.invoice_refunds enable row level security;
create unique index if not exists uq_invoice_refunds_tenant_id_id on public.invoice_refunds(tenant_id,id);
create index if not exists idx_invoice_refunds_invoice on public.invoice_refunds(tenant_id,invoice_id,refunded_at desc);
drop policy if exists invoice_refunds_select on public.invoice_refunds;
drop policy if exists invoice_refunds_insert on public.invoice_refunds;
create policy invoice_refunds_select on public.invoice_refunds for select to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:read'));
create policy invoice_refunds_insert on public.invoice_refunds for insert to authenticated with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:refund'));
revoke all on public.invoice_refunds from anon;
grant select,insert on public.invoice_refunds to authenticated;

create table if not exists public.inventory_lots(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null, inventory_item_id uuid not null,
 lot_number text not null, expiry_date date, quantity_on_hand integer not null default 0, unit_cost_subunits integer,
 status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 constraint inventory_lots_qty_nonnegative check(quantity_on_hand>=0),
 constraint inventory_lots_status_check check(status in ('active','expired','quarantined','depleted')));
alter table public.inventory_lots enable row level security;
create unique index if not exists uq_inventory_lots_tenant_id_id on public.inventory_lots(tenant_id,id);
create unique index if not exists uq_inventory_lots_tenant_item_lot on public.inventory_lots(tenant_id,inventory_item_id,lot_number) where deleted_at is null;
create index if not exists idx_inventory_lots_expiry on public.inventory_lots(tenant_id,expiry_date) where deleted_at is null;
drop policy if exists inventory_lots_select on public.inventory_lots;
drop policy if exists inventory_lots_write on public.inventory_lots;
create policy inventory_lots_select on public.inventory_lots for select to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:read'));
create policy inventory_lots_write on public.inventory_lots for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:update')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:update'));
revoke all on public.inventory_lots from anon;
grant select,insert,update,delete on public.inventory_lots to authenticated;

alter table public.purchase_receipt_items add column if not exists quantity_returned integer not null default 0;
alter table public.purchase_receipt_items add constraint purchase_receipt_items_return_nonnegative check(quantity_returned>=0 and quantity_returned<=quantity_received) not valid;
alter table public.purchase_receipt_items validate constraint purchase_receipt_items_return_nonnegative;

create or replace function public.guard_invoice_mutation() returns trigger language plpgsql set search_path='public' as $function$
begin
 if old.invoice_status in ('issued','paid','partial','refunded') then
  if new.tenant_id is distinct from old.tenant_id or new.patient_id is distinct from old.patient_id or new.session_id is distinct from old.session_id or new.invoice_date is distinct from old.invoice_date or new.invoice_number is distinct from old.invoice_number or new.subtotal_subunits is distinct from old.subtotal_subunits or new.discount_subunits is distinct from old.discount_subunits or new.discount_reason is distinct from old.discount_reason or new.discount_approved_by is distinct from old.discount_approved_by or new.tax_subunits is distinct from old.tax_subunits or new.total_subunits is distinct from old.total_subunits or new.payment_terms is distinct from old.payment_terms or new.notes is distinct from old.notes or new.deleted_at is distinct from old.deleted_at then raise exception 'Issued/paid invoice financial facts are immutable'; end if;
  if new.amount_paid_subunits is distinct from old.amount_paid_subunits and coalesce(current_setting('core.invoice_refund_mutation',true),'')<>'1' and coalesce(current_setting('core.invoice_payment_mutation',true),'')<>'1' then raise exception 'Collected amount is controlled by canonical payment/refund operations'; end if;
 end if;
 if old.invoice_status in ('paid','refunded') and new.invoice_status not in ('paid','refunded','partial') then raise exception 'Paid/refunded invoice cannot move backward'; end if;
 return new;
end;$function$;

create or replace function public.refund_invoice_payment(p_tenant_id uuid,p_invoice_id uuid,p_amount_subunits integer,p_refund_method text,p_reason text,p_refunded_by uuid,p_payment_id uuid default null,p_reference text default null) returns jsonb language plpgsql security definer set search_path='public' as $function$
declare v_invoice record; v_refunded integer; v_refundable integer; v_id uuid; v_actor uuid; v_new integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'invoices:refund') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_refunded_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Refund actor does not belong to tenant'); end if;
 if p_amount_subunits<=0 or trim(coalesce(p_reason,''))='' then return jsonb_build_object('success',false,'error','Refund amount and reason are required'); end if;
 select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id for update; if not found or v_invoice.invoice_status not in ('issued','partial','paid','refunded') then return jsonb_build_object('success',false,'error','Invoice is not refundable'); end if;
 select coalesce(sum(amount_subunits),0) into v_refunded from public.invoice_refunds where invoice_id=p_invoice_id and tenant_id=p_tenant_id and deleted_at is null;
 v_refundable:=greatest(v_invoice.amount_paid_subunits-v_refunded,0); if p_amount_subunits>v_refundable then return jsonb_build_object('success',false,'error','Refund exceeds refundable amount'); end if;
 if p_payment_id is not null and not exists(select 1 from public.invoice_payments where id=p_payment_id and invoice_id=p_invoice_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Payment not found for invoice'); end if;
 insert into public.invoice_refunds(tenant_id,invoice_id,payment_id,amount_subunits,refund_method,reference,reason,refunded_by) values(p_tenant_id,p_invoice_id,p_payment_id,p_amount_subunits,p_refund_method,p_reference,trim(p_reason),v_actor) returning id into v_id;
 v_new:=greatest(v_invoice.amount_paid_subunits-p_amount_subunits,0); perform set_config('core.invoice_refund_mutation','1',true);
 update public.clinic_invoices set amount_paid_subunits=v_new,invoice_status=case when v_new=0 then 'refunded' else 'partial' end,updated_at=now() where id=p_invoice_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'refund_id',v_id,'amount_refunded',p_amount_subunits,'net_collected',v_new);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;$function$;
revoke all on function public.refund_invoice_payment(uuid,uuid,integer,text,text,uuid,uuid,text) from public,anon;
grant execute on function public.refund_invoice_payment(uuid,uuid,integer,text,text,uuid,uuid,text) to authenticated;

create or replace function public.get_financial_resource_summary(p_tenant_id uuid,p_from_date date default null,p_to_date date default null) returns jsonb language plpgsql set search_path='public' as $function$
declare v_from date:=coalesce(p_from_date,date_trunc('month',current_date)::date); v_to date:=coalesce(p_to_date,current_date);
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'reports:read') then raise exception 'Permission denied'; end if;
 return jsonb_build_object('period',jsonb_build_object('from',v_from,'to',v_to),'revenue_subunits',coalesce((select sum(total_subunits) from public.clinic_invoices where tenant_id=p_tenant_id and invoice_status<>'cancelled' and invoice_date between v_from and v_to and deleted_at is null),0),'collections_subunits',coalesce((select sum(amount_subunits) from public.invoice_payments where tenant_id=p_tenant_id and payment_date::date between v_from and v_to),0),'refunds_subunits',coalesce((select sum(amount_subunits) from public.invoice_refunds where tenant_id=p_tenant_id and refunded_at::date between v_from and v_to and deleted_at is null),0),'outstanding_subunits',coalesce((select sum(greatest(total_subunits-amount_paid_subunits,0)) from public.clinic_invoices where tenant_id=p_tenant_id and invoice_status in ('issued','partial') and deleted_at is null),0),'inventory_value_subunits',coalesce((select sum(current_stock*coalesce(valuation_cost_subunits,purchase_cost_subunits,0)) from public.inventory_items where tenant_id=p_tenant_id and deleted_at is null),0),'supplier_payables_subunits',coalesce((select sum(greatest(amount_subunits-amount_paid_subunits,0)) from public.supplier_obligations where tenant_id=p_tenant_id and status<>'cancelled'),0),'operating_expenses_subunits',coalesce((select sum(amount_subunits) from public.operating_expenses where tenant_id=p_tenant_id and expense_date between v_from and v_to),0),'invoice_count',(select count(*) from public.clinic_invoices where tenant_id=p_tenant_id and invoice_date between v_from and v_to and deleted_at is null),'payment_count',(select count(*) from public.invoice_payments where tenant_id=p_tenant_id and payment_date::date between v_from and v_to),'inventory_item_count',(select count(*) from public.inventory_items where tenant_id=p_tenant_id and deleted_at is null),'legacy_untraceable_inventory_movements',(select count(*) from public.inventory_ledger where tenant_id=p_tenant_id and source_type='legacy_untraceable'));
end;$function$;
revoke all on function public.get_financial_resource_summary(uuid,date,date) from public,anon;
grant execute on function public.get_financial_resource_summary(uuid,date,date) to authenticated;
commit;
