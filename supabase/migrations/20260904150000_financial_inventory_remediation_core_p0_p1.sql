-- CORE SYSTEM — Financial & Inventory Remediation
-- Contract: docs/FINANCIAL-INVENTORY-REMEDIATION-CONTRACT-2026-09-04.md
-- ADR: docs/ADR-008-FINANCIAL-INVENTORY-CROSS-DOMAIN-ARCHITECTURE-2026-09-04.md
-- Mode: additive/non-breaking; preserves legacy experimental data.

begin;

-- -----------------------------------------------------------------------------
-- 1. Inventory: canonical movement metadata and valuation foundation
-- -----------------------------------------------------------------------------
alter table public.inventory_items
  add column if not exists purchase_cost_subunits integer,
  add column if not exists valuation_cost_subunits integer,
  add column if not exists selling_price_subunits integer,
  add column if not exists is_procedure_material boolean not null default false,
  add column if not exists is_operating_consumable boolean not null default false,
  add column if not exists requires_batch_tracking boolean not null default false,
  add column if not exists requires_expiry_tracking boolean not null default false;

alter table public.inventory_ledger
  add column if not exists quantity_delta numeric not null default 0,
  add column if not exists movement_type text not null default 'legacy_unclassified',
  add column if not exists source_type text,
  add column if not exists source_id uuid,
  add column if not exists unit_cost_subunits integer,
  add column if not exists cost_total_subunits integer;

update public.inventory_ledger
set quantity_delta = quantity_consumed
where quantity_delta = 0 and quantity_consumed <> 0;

update public.inventory_ledger
set movement_type = case
  when consumption_type = 'purchase' then 'purchase_receipt'
  when consumption_type = 'purchase_return' then 'purchase_return'
  when consumption_type = 'unused_return' then 'unused_return'
  when consumption_type = 'doctor_request' then 'procedure_consumption'
  when consumption_type in ('inventory_adjustment_increase','inventory_adjustment_decrease') then 'adjustment'
  else 'legacy_unclassified'
end
where movement_type = 'legacy_unclassified';

update public.inventory_ledger l
set source_type = 'legacy_untraceable',
    notes = concat_ws(' | ', nullif(l.notes,''), 'Legacy experimental movement preserved during 2026-09-04 remediation; source was not traceable at audit time.')
where l.source_type is null
  and l.procedure_id is null
  and l.session_id is null
  and l.treatment_plan_item_id is null
  and l.quantity_delta <> 0;

alter table public.inventory_items
  add constraint inventory_items_purchase_cost_nonnegative
    check (purchase_cost_subunits is null or purchase_cost_subunits >= 0) not valid,
  add constraint inventory_items_valuation_cost_nonnegative
    check (valuation_cost_subunits is null or valuation_cost_subunits >= 0) not valid,
  add constraint inventory_items_selling_price_nonnegative
    check (selling_price_subunits is null or selling_price_subunits >= 0) not valid;

alter table public.inventory_ledger
  add constraint inventory_ledger_movement_type_check
    check (movement_type in ('purchase_receipt','purchase_return','procedure_consumption','unused_return','adjustment','legacy_unclassified')) not valid;

alter table public.inventory_ledger
  add constraint inventory_ledger_source_type_check
    check (source_type is null or source_type in ('purchase_receipt','purchase_return','procedure_session','treatment_plan_item','unused_return','manual_adjustment','legacy_untraceable')) not valid;

-- -----------------------------------------------------------------------------
-- 2. Invoice/payment/installment invariants
-- -----------------------------------------------------------------------------
alter table public.clinic_invoices
  add constraint clinic_invoices_money_nonnegative
    check (subtotal_subunits >= 0 and discount_subunits >= 0 and tax_subunits >= 0 and total_subunits >= 0 and amount_paid_subunits >= 0 and coalesce(amount_due_subunits, greatest(total_subunits - amount_paid_subunits,0)) >= 0) not valid;

alter table public.invoice_items
  add constraint invoice_items_money_nonnegative
    check (quantity > 0 and unit_price_subunits >= 0 and discount_subunits >= 0 and tax_subunits >= 0 and coalesce(line_total_subunits,0) >= 0) not valid;

alter table public.invoice_payments
  add constraint invoice_payments_money_positive
    check (amount_subunits > 0) not valid;

-- -----------------------------------------------------------------------------
-- 3. Invoice lifecycle guard: ordinary UPDATE cannot rewrite issued financial facts
--    Lifecycle/payment RPCs are allowed to change only their intended state fields.
-- -----------------------------------------------------------------------------
create or replace function public.guard_invoice_mutation()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if old.invoice_status in ('issued','paid','partial','refunded') then
    if new.tenant_id is distinct from old.tenant_id
       or new.patient_id is distinct from old.patient_id
       or new.session_id is distinct from old.session_id
       or new.invoice_date is distinct from old.invoice_date
       or new.invoice_number is distinct from old.invoice_number
       or new.subtotal_subunits is distinct from old.subtotal_subunits
       or new.discount_subunits is distinct from old.discount_subunits
       or new.discount_reason is distinct from old.discount_reason
       or new.discount_approved_by is distinct from old.discount_approved_by
       or new.tax_subunits is distinct from old.tax_subunits
       or new.total_subunits is distinct from old.total_subunits
       or new.payment_terms is distinct from old.payment_terms
       or new.notes is distinct from old.notes
       or new.deleted_at is distinct from old.deleted_at then
      raise exception 'Issued/paid invoice financial facts are immutable; use an approved lifecycle operation';
    end if;
  end if;

  if old.invoice_status in ('paid','partial','refunded')
     and new.invoice_status not in ('paid','partial','refunded') then
    raise exception 'Paid/partial/refunded invoice cannot move backward in lifecycle';
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_guard_invoice_mutation on public.clinic_invoices;
create trigger trg_guard_invoice_mutation
before update on public.clinic_invoices
for each row execute function public.guard_invoice_mutation();

-- -----------------------------------------------------------------------------
-- 4. Canonical inventory mutation: stock + ledger in one transaction.
--    Existing 3-argument callers remain compatible through defaults.
-- -----------------------------------------------------------------------------
create or replace function public.adjust_inventory_stock(
  p_item_id uuid,
  p_tenant_id uuid,
  p_delta integer,
  p_movement_type text default null,
  p_source_type text default null,
  p_source_id uuid default null,
  p_procedure_id uuid default null,
  p_session_id uuid default null,
  p_treatment_plan_item_id uuid default null,
  p_actor_id uuid default null,
  p_reason text default null
)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_new_stock integer;
  v_current_tenant uuid;
  v_actor uuid;
  v_consumption_type varchar;
  v_unit_cost integer;
begin
  v_current_tenant := public.get_current_tenant_id();
  if v_current_tenant is distinct from p_tenant_id then
    raise exception 'Tenant mismatch';
  end if;
  if not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then
    raise exception 'Permission denied';
  end if;
  if p_delta = 0 then
    raise exception 'Inventory delta must not be zero';
  end if;

  v_actor := coalesce(p_actor_id, auth.uid());
  if v_actor is not null and not exists (
    select 1 from public.clinic_users
    where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null
  ) then
    raise exception 'Actor does not belong to tenant';
  end if;

  if p_source_type is not null and p_source_type not in ('purchase_receipt','purchase_return','procedure_session','treatment_plan_item','unused_return','manual_adjustment','legacy_untraceable') then
    raise exception 'Invalid inventory source type';
  end if;

  if p_delta < 0 and p_source_type is null then
    p_source_type := 'manual_adjustment';
  elsif p_delta > 0 and p_source_type is null then
    p_source_type := 'manual_adjustment';
  end if;

  if p_movement_type is null then
    if p_source_type = 'purchase_receipt' then p_movement_type := 'purchase_receipt';
    elsif p_source_type = 'purchase_return' then p_movement_type := 'purchase_return';
    elsif p_source_type = 'procedure_session' or p_source_type = 'treatment_plan_item' then p_movement_type := 'procedure_consumption';
    elsif p_source_type = 'unused_return' then p_movement_type := 'unused_return';
    else p_movement_type := 'adjustment';
    end if;
  end if;

  if p_movement_type not in ('purchase_receipt','purchase_return','procedure_consumption','unused_return','adjustment') then
    raise exception 'Invalid inventory movement type';
  end if;

  select valuation_cost_subunits into v_unit_cost
  from public.inventory_items
  where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null
  for update;

  if not found then
    raise exception 'Inventory item not found';
  end if;

  update public.inventory_items
  set current_stock = current_stock + p_delta,
      updated_at = now()
  where id = p_item_id
    and tenant_id = p_tenant_id
    and deleted_at is null
    and (current_stock + p_delta) >= 0
  returning current_stock into v_new_stock;

  if v_new_stock is null then
    raise exception 'Insufficient stock: adjustment would result in negative stock';
  end if;

  v_consumption_type := case
    when p_movement_type = 'purchase_receipt' then 'purchase'
    when p_movement_type = 'purchase_return' then 'purchase_return'
    when p_movement_type = 'procedure_consumption' then 'doctor_request'
    when p_movement_type = 'unused_return' then 'unused_return'
    when p_delta > 0 then 'inventory_adjustment_increase'
    else 'inventory_adjustment_decrease'
  end;

  insert into public.inventory_ledger(
    tenant_id,item_id,procedure_id,material_name,quantity_consumed,consumption_type,
    logged_by,session_id,notes,treatment_plan_item_id,quantity_delta,movement_type,
    source_type,source_id,unit_cost_subunits,cost_total_subunits
  )
  select p_tenant_id,p_item_id,p_procedure_id,i.name,v_delta_quantity,v_consumption_type,
         v_actor,p_session_id,p_reason,p_treatment_plan_item_id,p_delta,p_movement_type,
         p_source_type,p_source_id,v_unit_cost,case when v_unit_cost is null then null else abs(p_delta)*v_unit_cost end
  from public.inventory_items i
  cross join lateral (select abs(p_delta)::numeric as v_delta_quantity) q
  where i.id=p_item_id and i.tenant_id=p_tenant_id;

  return v_new_stock;
end;
$function$;

-- -----------------------------------------------------------------------------
-- 5. Harden invoice issue/cancel/payment and manual discount authority.
-- -----------------------------------------------------------------------------
create or replace function public.issue_invoice(p_invoice_id uuid)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare v_invoice record; v_number text; v_tenant uuid;
begin
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  v_tenant := public.get_current_tenant_id();
  if v_tenant is distinct from v_invoice.tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(v_tenant,'invoices:issue') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if v_invoice.invoice_status <> 'draft' then return jsonb_build_object('success',false,'error','Invoice is not in draft status'); end if;
  if v_invoice.total_subunits < 0 or v_invoice.subtotal_subunits < 0 or v_invoice.discount_subunits < 0 or v_invoice.tax_subunits < 0 then return jsonb_build_object('success',false,'error','Invalid invoice totals'); end if;
  v_number := v_invoice.invoice_number;
  if v_number is null or btrim(v_number)='' then v_number := public.generate_invoice_number(v_invoice.tenant_id); end if;
  update public.clinic_invoices
  set invoice_status='issued', issued_at=now(), invoice_number=v_number, updated_at=now()
  where id=p_invoice_id and tenant_id=v_tenant;
  return jsonb_build_object('success',true,'invoice_id',p_invoice_id,'status','issued','invoice_number',v_number);
end;
$function$;

create or replace function public.cancel_invoice(p_invoice_id uuid)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare v_invoice record; v_payment_count integer; v_tenant uuid;
begin
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  v_tenant := public.get_current_tenant_id();
  if v_tenant is distinct from v_invoice.tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(v_tenant,'invoices:cancel') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if v_invoice.invoice_status not in ('draft','issued') then return jsonb_build_object('success',false,'error','Invoice cannot be cancelled'); end if;
  select count(*) into v_payment_count from public.invoice_payments where invoice_id=p_invoice_id and tenant_id=v_tenant;
  if v_payment_count > 0 then return jsonb_build_object('success',false,'error','Cannot cancel invoice with payments; use refund/reversal'); end if;
  if v_invoice.invoice_status='issued' and (v_invoice.issued_at is null or now()-v_invoice.issued_at>interval '15 minutes') then
    return jsonb_build_object('success',false,'error','Cancellation window expired (15 minutes)');
  end if;
  update public.clinic_invoices set invoice_status='cancelled',updated_at=now() where id=p_invoice_id and tenant_id=v_tenant;
  return jsonb_build_object('success',true,'invoice_id',p_invoice_id,'status','cancelled');
end;
$function$;

create or replace function public.record_invoice_payment(
  p_tenant_id uuid,
  p_invoice_id uuid,
  p_amount_subunits integer,
  p_payment_method text,
  p_payment_reference text default null,
  p_notes text default null,
  p_collected_by uuid default null
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare v_invoice record; v_payment_id uuid; v_new_paid integer; v_new_status text; v_actor uuid;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:payment') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if p_amount_subunits is null or p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
  v_actor:=coalesce(p_collected_by,auth.uid());
  if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Collector does not belong to tenant'); end if;
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id for update;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  if v_invoice.invoice_status in ('cancelled','refunded','draft') then return jsonb_build_object('success',false,'error','Invoice is not payable'); end if;
  if p_amount_subunits>greatest(v_invoice.total_subunits-v_invoice.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds remaining balance'); end if;
  insert into public.invoice_payments(tenant_id,invoice_id,amount_subunits,payment_method,payment_reference,notes,collected_by)
  values(p_tenant_id,p_invoice_id,p_amount_subunits,p_payment_method,p_payment_reference,p_notes,v_actor)
  returning id into v_payment_id;
  v_new_paid:=v_invoice.amount_paid_subunits+p_amount_subunits;
  v_new_status:=case when greatest(v_invoice.total_subunits-v_new_paid,0)=0 then 'paid' when v_new_paid>0 then 'partial' else v_invoice.invoice_status end;
  update public.clinic_invoices
  set amount_paid_subunits=v_new_paid,invoice_status=v_new_status,collected_by=v_actor,payment_method=p_payment_method,updated_at=now()
  where id=p_invoice_id and tenant_id=p_tenant_id;
  return jsonb_build_object('success',true,'payment_id',v_payment_id,'amount_paid',v_new_paid,'amount_due',greatest(v_invoice.total_subunits-v_new_paid,0),'status',v_new_status);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

-- -----------------------------------------------------------------------------
-- 6. Manual invoice: discount authority + actor validation.
-- -----------------------------------------------------------------------------
create or replace function public.create_manual_invoice(
  p_tenant_id uuid,
  p_patient_id uuid,
  p_session_id uuid default null,
  p_invoice_date date default current_date,
  p_payment_terms text default 'cash',
  p_notes text default null,
  p_created_by uuid default null,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare v_invoice_id uuid; v_row jsonb; v_procedure record; v_description text; v_quantity integer; v_unit_price integer; v_discount_amount integer; v_discount_percent numeric; v_effective_discount integer; v_tax_rate numeric; v_tax_included boolean; v_amount_after_discount integer; v_tax integer; v_line_total integer; v_subtotal integer:=0; v_discount integer:=0; v_tax_total integer:=0; v_total integer:=0; v_sort integer:=0; v_actor uuid;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:create') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  v_actor:=coalesce(p_created_by,auth.uid());
  if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Creator does not belong to tenant'); end if;
  if not exists(select 1 from public.clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Patient not found'); end if;
  if p_session_id is not null and not exists(select 1 from public.clinic_visit_sessions where id=p_session_id and tenant_id=p_tenant_id and patient_id=p_patient_id) then return jsonb_build_object('success',false,'error','Session not found'); end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then return jsonb_build_object('success',false,'error','Invoice must have at least one item'); end if;
  if p_payment_terms not in ('cash','credit','installment') then return jsonb_build_object('success',false,'error','Invalid payment terms'); end if;
  insert into public.clinic_invoices(tenant_id,patient_id,session_id,invoice_date,invoice_status,payment_terms,notes,subtotal_subunits,total_subunits,tax_subunits,discount_subunits,amount_paid_subunits,amount_due_subunits)
  values(p_tenant_id,p_patient_id,p_session_id,p_invoice_date,'draft',p_payment_terms,p_notes,0,0,0,0,0,0) returning id into v_invoice_id;
  for v_row in select value from jsonb_array_elements(p_items) loop
    v_description:=trim(coalesce(v_row->>'description','')); v_quantity:=(v_row->>'quantity')::integer; v_unit_price:=(v_row->>'unit_price_subunits')::integer; v_discount_amount:=coalesce((v_row->>'discount_amount_subunits')::integer,0); v_discount_percent:=nullif(v_row->>'discount_percent','')::numeric;
    if v_description='' or v_quantity is null or v_quantity<=0 or v_unit_price is null or v_unit_price<0 or v_discount_amount<0 or (v_discount_percent is not null and (v_discount_percent<0 or v_discount_percent>100)) then raise exception 'Invalid invoice item'; end if;
    v_tax_rate:=coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,16); if v_tax_rate<0 then raise exception 'Invalid tax rate'; end if;
    v_tax_included:=false;
    if nullif(v_row->>'procedure_id','') is not null then
      select tax_rate_percent,tax_included into v_procedure from public.clinic_procedures where id=(v_row->>'procedure_id')::uuid and tenant_id=p_tenant_id and is_active=true;
      if not found then raise exception 'Procedure not found'; end if;
      v_tax_rate:=coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,v_procedure.tax_rate_percent); v_tax_included:=v_procedure.tax_included;
    end if;
    if v_discount_percent is not null and v_discount_percent>0 then v_effective_discount:=round((v_quantity*v_unit_price)*(v_discount_percent/100.0)); else v_effective_discount:=v_discount_amount; end if;
    if v_effective_discount>(v_quantity*v_unit_price) then raise exception 'Discount exceeds item amount'; end if;
    if v_effective_discount>0 and not public.has_tenant_permission(p_tenant_id,'invoices:discount') then raise exception 'Discount permission required'; end if;
    v_amount_after_discount:=(v_quantity*v_unit_price)-v_effective_discount;
    if v_tax_included then v_tax:=round(v_amount_after_discount*(v_tax_rate/(100.0+v_tax_rate))); v_line_total:=v_amount_after_discount; else v_tax:=round(v_amount_after_discount*(v_tax_rate/100.0)); v_line_total:=v_amount_after_discount+v_tax; end if;
    insert into public.invoice_items(tenant_id,invoice_id,procedure_id,item_description,item_description_ar,quantity,unit_price_subunits,discount_subunits,tax_rate_percent,tax_subunits,line_total_subunits,sort_order)
    values(p_tenant_id,v_invoice_id,nullif(v_row->>'procedure_id','')::uuid,v_description,nullif(v_row->>'description_ar',''),v_quantity,v_unit_price,v_effective_discount,v_tax_rate,v_tax,v_line_total,v_sort);
    v_subtotal:=v_subtotal+(v_quantity*v_unit_price); v_discount:=v_discount+v_effective_discount; v_tax_total:=v_tax_total+v_tax; v_total:=v_total+v_line_total; v_sort:=v_sort+1;
  end loop;
  update public.clinic_invoices
  set subtotal_subunits=v_subtotal,discount_subunits=v_discount,tax_subunits=v_tax_total,total_subunits=v_total,amount_due_subunits=v_total,discount_approved_by=case when v_discount>0 then v_actor else null end,updated_at=now()
  where id=v_invoice_id and tenant_id=p_tenant_id;
  return jsonb_build_object('success',true,'invoice_id',v_invoice_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

-- -----------------------------------------------------------------------------
-- 7. Session invoice compatibility: remove stale clinic_invoices.tax_rate_percent reference.
-- -----------------------------------------------------------------------------
create or replace function public.create_invoice_from_session(p_session_id uuid)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_tenant_id uuid; v_invoice_id uuid; v_invoice_number text; v_patient_id uuid;
  v_subtotal integer:=0; v_tax_total integer:=0; v_total integer:=0;
  v_procedure record; v_item_subtotal integer; v_item_tax integer; v_item_total integer;
begin
  select tenant_id,patient_id into v_tenant_id,v_patient_id from public.clinic_visit_sessions where id=p_session_id;
  if v_patient_id is null then return jsonb_build_object('success',false,'error','Session not found or has no patient'); end if;
  if public.get_current_tenant_id() is distinct from v_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(v_tenant_id,'invoices:create') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  v_invoice_number:=public.generate_invoice_number(v_tenant_id);
  insert into public.clinic_invoices(tenant_id,session_id,patient_id,invoice_number,subtotal_subunits,tax_subunits,total_subunits,amount_paid_subunits,amount_due_subunits,discount_subunits,invoice_status,payment_terms)
  values(v_tenant_id,p_session_id,v_patient_id,v_invoice_number,0,0,0,0,0,0,'draft','cash') returning id into v_invoice_id;
  for v_procedure in
    select cp.id procedure_id,cp.procedure_name,cp.procedure_name_ar,cp.base_price_subunits,cp.tax_included,cp.tax_rate_percent
    from public.clinic_visit_sessions cvs join public.master_agenda_events mae on mae.id=cvs.agenda_event_id join public.clinic_procedures cp on cp.id=mae.procedure_id
    where cvs.id=p_session_id and cvs.tenant_id=v_tenant_id and cp.is_active=true
  loop
    v_item_subtotal:=v_procedure.base_price_subunits;
    if v_procedure.tax_included then v_item_tax:=round(v_item_subtotal*v_procedure.tax_rate_percent/(100+v_procedure.tax_rate_percent)); v_item_subtotal:=v_item_subtotal-v_item_tax; else v_item_tax:=round(v_item_subtotal*v_procedure.tax_rate_percent/100); end if;
    v_item_total:=v_item_subtotal+v_item_tax;
    insert into public.invoice_items(tenant_id,invoice_id,procedure_id,item_description,item_description_ar,quantity,unit_price_subunits,tax_subunits,tax_rate_percent,line_total_subunits,sort_order)
    values(v_tenant_id,v_invoice_id,v_procedure.procedure_id,v_procedure.procedure_name,v_procedure.procedure_name_ar,1,v_item_subtotal,v_item_tax,v_procedure.tax_rate_percent,v_item_total,coalesce((select max(sort_order)+1 from public.invoice_items where invoice_id=v_invoice_id),0));
    v_subtotal:=v_subtotal+v_item_subtotal; v_tax_total:=v_tax_total+v_item_tax; v_total:=v_total+v_item_total;
  end loop;
  update public.clinic_invoices set subtotal_subunits=v_subtotal,tax_subunits=v_tax_total,total_subunits=v_total,amount_due_subunits=v_total,updated_at=now() where id=v_invoice_id and tenant_id=v_tenant_id;
  return jsonb_build_object('success',true,'invoice_id',v_invoice_id,'invoice_number',v_invoice_number,'subtotal',v_subtotal,'tax',v_tax_total,'total',v_total,'item_count',(select count(*) from public.invoice_items where invoice_id=v_invoice_id));
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

-- -----------------------------------------------------------------------------
-- 8. Installment payment must produce the canonical invoice payment transaction.
--    Legacy 3-argument calls are retained syntactically but require an invoice link.
-- -----------------------------------------------------------------------------
create or replace function public.apply_payment_to_installment(
  p_tenant_id uuid,
  p_installment_id uuid,
  p_amount_subunits integer,
  p_payment_method text default 'cash',
  p_payment_reference text default null,
  p_collected_by uuid default null
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_installment record; v_invoice record; v_paid integer; v_due integer; v_status text; v_payment jsonb; v_actor uuid;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:payment') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
  v_actor:=coalesce(p_collected_by,auth.uid());
  if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Collector does not belong to tenant'); end if;
  select * into v_installment from public.financial_installments where id=p_installment_id and tenant_id=p_tenant_id and deleted_at is null for update;
  if not found then return jsonb_build_object('success',false,'error','Installment not found'); end if;
  if v_installment.invoice_id is null then return jsonb_build_object('success',false,'error','Installment must be linked to an invoice before payment'); end if;
  v_due:=greatest(v_installment.amount_subunits-v_installment.amount_paid_subunits,0);
  if p_amount_subunits>v_due then return jsonb_build_object('success',false,'error','Payment exceeds installment balance'); end if;
  select * into v_invoice from public.clinic_invoices where id=v_installment.invoice_id and tenant_id=p_tenant_id for update;
  if not found then return jsonb_build_object('success',false,'error','Installment invoice not found'); end if;
  v_payment:=public.record_invoice_payment(p_tenant_id,v_invoice.id,p_amount_subunits,p_payment_method,p_payment_reference,'Installment payment',v_actor);
  if coalesce((v_payment->>'success')::boolean,false) is not true then return v_payment; end if;
  v_paid:=v_installment.amount_paid_subunits+p_amount_subunits;
  v_status:=case when v_paid>=v_installment.amount_subunits then 'paid' when v_paid>0 then 'partial' else v_installment.status end;
  update public.financial_installments set amount_paid_subunits=v_paid,status=v_status,updated_at=now() where id=p_installment_id and tenant_id=p_tenant_id;
  update public.invoice_payments set financial_plan_id=v_installment.financial_plan_id,installment_id=p_installment_id where id=(v_payment->>'payment_id')::uuid and tenant_id=p_tenant_id;
  return jsonb_build_object('success',true,'payment_id',v_payment->>'payment_id','installment_id',p_installment_id,'amount_paid',v_paid,'amount_due',greatest(v_installment.amount_subunits-v_paid,0),'status',v_status);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

-- -----------------------------------------------------------------------------
-- 9. Purchasing/insurance actor and patient-context hardening.
-- -----------------------------------------------------------------------------
create or replace function public.receive_purchase_order(p_tenant_id uuid,p_purchase_order_id uuid,p_received_by uuid,p_items jsonb)
returns jsonb
language plpgsql security definer set search_path to 'public'
as $function$
declare v_order record; v_receipt_id uuid; v_item jsonb; v_poi record; v_qty integer; v_remaining integer; v_status text; v_obligation_id uuid; v_received_value integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if not exists(select 1 from public.clinic_users where id=p_received_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Receiver does not belong to tenant'); end if;
 select * into v_order from public.purchase_orders where id=p_purchase_order_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Purchase order not found'); end if;
 if v_order.status in ('cancelled','received') then return jsonb_build_object('success',false,'error','Purchase order cannot receive in current status'); end if;
 if not exists(select 1 from public.suppliers where id=v_order.supplier_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Supplier does not belong to tenant'); end if;
 insert into public.purchase_receipts(tenant_id,purchase_order_id,received_by) values(p_tenant_id,p_purchase_order_id,p_received_by) returning id into v_receipt_id;
 for v_item in select * from jsonb_array_elements(p_items) loop
   v_qty:=(v_item->>'quantity')::integer; if v_qty<=0 then raise exception 'Received quantity must be positive'; end if;
   select * into v_poi from public.purchase_order_items where id=(v_item->>'purchase_order_item_id')::uuid and purchase_order_id=p_purchase_order_id and tenant_id=p_tenant_id for update;
   if not found then raise exception 'Purchase order item not found'; end if;
   if v_poi.quantity_received+v_qty>v_poi.quantity_ordered then raise exception 'Received quantity exceeds ordered quantity'; end if;
   if not exists(select 1 from public.inventory_items where id=v_poi.inventory_item_id and tenant_id=p_tenant_id and deleted_at is null) then raise exception 'Inventory item does not belong to tenant'; end if;
   insert into public.purchase_receipt_items(tenant_id,receipt_id,purchase_order_item_id,inventory_item_id,quantity_received) values(p_tenant_id,v_receipt_id,v_poi.id,v_poi.inventory_item_id,v_qty);
   update public.purchase_order_items set quantity_received=quantity_received+v_qty,updated_at=now() where id=v_poi.id;
   perform public.adjust_inventory_stock(v_poi.inventory_item_id,p_tenant_id,v_qty,'purchase_receipt','purchase_receipt',v_receipt_id,null,null,null,p_received_by,'Purchase receipt '||coalesce(v_order.order_number,v_order.id::text));
 end loop;
 select count(*) filter(where quantity_received<quantity_ordered) into v_remaining from public.purchase_order_items where purchase_order_id=p_purchase_order_id;
 v_status:=case when v_remaining=0 then 'received' else 'partially_received' end;
 update public.purchase_orders set status=v_status,updated_at=now() where id=p_purchase_order_id;
 select coalesce(sum(poi.quantity_received*poi.unit_cost_subunits),0) into v_received_value from public.purchase_order_items poi where poi.purchase_order_id=p_purchase_order_id and poi.tenant_id=p_tenant_id;
 if v_received_value>0 then
   insert into public.supplier_obligations(tenant_id,supplier_id,purchase_order_id,amount_subunits,amount_paid_subunits,due_date,status,created_by)
   values(p_tenant_id,v_order.supplier_id,p_purchase_order_id,v_received_value,0,v_order.expected_date,'open',p_received_by)
   on conflict (tenant_id,purchase_order_id) where purchase_order_id is not null do update set amount_subunits=excluded.amount_subunits,updated_at=now()
   returning id into v_obligation_id;
 end if;
 return jsonb_build_object('success',true,'receipt_id',v_receipt_id,'status',v_status,'supplier_obligation_id',v_obligation_id,'received_value_subunits',v_received_value);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

create or replace function public.record_supplier_payment(p_tenant_id uuid,p_supplier_obligation_id uuid,p_amount_subunits integer,p_payment_method text default null,p_reference text default null,p_created_by uuid default null)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_obligation record; v_payment_id uuid; v_paid integer; v_status text; v_actor uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid());
 if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 if p_amount_subunits is null or p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Invalid supplier payment'); end if;
 select o.* into v_obligation from public.supplier_obligations o where o.id=p_supplier_obligation_id and o.tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Supplier obligation not found'); end if;
 if not exists(select 1 from public.suppliers s where s.id=v_obligation.supplier_id and s.tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Supplier does not belong to tenant'); end if;
 if v_obligation.status in ('cancelled','paid') or p_amount_subunits>(v_obligation.amount_subunits-v_obligation.amount_paid_subunits) then return jsonb_build_object('success',false,'error','Payment exceeds outstanding supplier obligation'); end if;
 insert into public.supplier_payments(tenant_id,supplier_obligation_id,amount_subunits,payment_method,reference,created_by) values(p_tenant_id,p_supplier_obligation_id,p_amount_subunits,p_payment_method,p_reference,v_actor) returning id into v_payment_id;
 v_paid:=v_obligation.amount_paid_subunits+p_amount_subunits; v_status:=case when v_paid=v_obligation.amount_subunits then 'paid' else 'partially_paid' end;
 update public.supplier_obligations set amount_paid_subunits=v_paid,status=v_status,updated_at=now() where id=p_supplier_obligation_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'supplier_payment_id',v_payment_id,'status',v_status,'amount_paid_subunits',v_paid);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

create or replace function public.reconcile_insurance_claim(p_tenant_id uuid,p_claim_id uuid,p_reconciled_subunits integer,p_patient_responsibility_subunits integer,p_reconciled_by uuid)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_claim public.insurance_claims%rowtype; v_invoice public.clinic_invoices%rowtype; v_plan public.financial_plans%rowtype; v_profile public.patient_insurance_profiles%rowtype; v_payer_balance integer; v_patient_balance integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'insurance:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if not exists(select 1 from public.clinic_users where id=p_reconciled_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Invalid reconciler'); end if;
 if p_reconciled_subunits<0 or p_patient_responsibility_subunits<0 then return jsonb_build_object('success',false,'error','Amounts cannot be negative'); end if;
 select * into v_claim from public.insurance_claims where id=p_claim_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if not found then return jsonb_build_object('success',false,'error','Claim not found'); end if;
 select * into v_profile from public.patient_insurance_profiles where id=v_claim.insurance_profile_id and tenant_id=p_tenant_id;
 if not found or v_profile.patient_id is distinct from v_claim.patient_id then return jsonb_build_object('success',false,'error','Insurance profile patient mismatch'); end if;
 if v_claim.invoice_id is not null then
   select * into v_invoice from public.clinic_invoices where id=v_claim.invoice_id and tenant_id=p_tenant_id and deleted_at is null;
   if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
   if v_invoice.patient_id is distinct from v_claim.patient_id then return jsonb_build_object('success',false,'error','Claim patient does not match invoice patient'); end if;
 end if;
 if p_reconciled_subunits>v_claim.amount_claimed_subunits then return jsonb_build_object('success',false,'error','Reconciled amount exceeds claim'); end if;
 if v_claim.invoice_id is not null and p_reconciled_subunits+p_patient_responsibility_subunits>v_invoice.total_subunits then return jsonb_build_object('success',false,'error','Payer and patient responsibility exceed invoice'); end if;
 v_payer_balance:=v_claim.amount_claimed_subunits-p_reconciled_subunits; v_patient_balance:=p_patient_responsibility_subunits;
 update public.insurance_claims set amount_reconciled_subunits=p_reconciled_subunits,status=case when p_reconciled_subunits=v_claim.amount_claimed_subunits then 'reconciled' else 'exception' end,reconciled_at=now(),notes=coalesce(notes,'')||case when notes is null or notes='' then '' else E'\\n' end||'Patient responsibility: '||p_patient_responsibility_subunits||' · Reconciled by clinic user: '||p_reconciled_by,updated_at=now() where id=p_claim_id and tenant_id=p_tenant_id;
 update public.patient_insurance_profiles set patient_responsibility_subunits=p_patient_responsibility_subunits,reconciliation_status=case when p_reconciled_subunits=v_claim.amount_claimed_subunits then 'reconciled' else 'exception' end,updated_at=now() where id=v_claim.insurance_profile_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'claim_id',p_claim_id,'reconciled_subunits',p_reconciled_subunits,'patient_responsibility_subunits',v_patient_balance,'payer_balance_subunits',v_payer_balance);
end;
$function$;

-- -----------------------------------------------------------------------------
-- 10. Procedure consumption now uses canonical atomic stock+ledger operation.
-- -----------------------------------------------------------------------------
create or replace function public.consume_procedure_inventory(p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity numeric,p_consumed_by uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_stock integer; v_new integer; v_procedure_id uuid;
begin
 if public.get_current_tenant_id()<>p_tenant_id then raise exception 'Tenant mismatch'; end if;
 if not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then raise exception 'Permission denied'; end if;
 if not exists(select 1 from public.clinic_users where id=p_consumed_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then raise exception 'Actor does not belong to tenant'; end if;
 if p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 if not exists(select 1 from public.clinic_visit_sessions where id=p_visit_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Visit not found'); end if;
 if p_treatment_plan_item_id is not null and not exists(select 1 from public.clinic_treatment_plan_items where id=p_treatment_plan_item_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Treatment plan item not found'); end if;
 select mae.procedure_id into v_procedure_id from public.clinic_visit_sessions cvs left join public.master_agenda_events mae on mae.id=cvs.agenda_event_id where cvs.id=p_visit_id and cvs.tenant_id=p_tenant_id;
 if p_quantity<>trunc(p_quantity) then raise exception 'Inventory quantity must be a whole number for current stock unit model'; end if;
 select current_stock into v_stock from public.inventory_items where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null;
 if not found then return jsonb_build_object('success',false,'error','Inventory item not found'); end if;
 v_new:=public.adjust_inventory_stock(p_item_id,p_tenant_id,-p_quantity::integer,'procedure_consumption',case when p_treatment_plan_item_id is null then 'procedure_session' else 'treatment_plan_item' end,coalesce(p_treatment_plan_item_id,p_visit_id),v_procedure_id,p_visit_id,p_treatment_plan_item_id,p_consumed_by,p_reason);
 return jsonb_build_object('success',true,'new_stock',v_new,'visit_id',p_visit_id,'treatment_plan_item_id',p_treatment_plan_item_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

-- -----------------------------------------------------------------------------
-- 11. Same-tenant composite referential integrity for the highest-risk edges.
--     Data was validated clean before this migration.
-- -----------------------------------------------------------------------------
create unique index if not exists uq_clinic_patients_tenant_id_id on public.clinic_patients(tenant_id,id);
create unique index if not exists uq_clinic_visit_sessions_tenant_id_id on public.clinic_visit_sessions(tenant_id,id);
create unique index if not exists uq_clinic_procedures_tenant_id_id on public.clinic_procedures(tenant_id,id);
create unique index if not exists uq_clinic_invoices_tenant_id_id on public.clinic_invoices(tenant_id,id);
create unique index if not exists uq_financial_plans_tenant_id_id on public.financial_plans(tenant_id,id);
create unique index if not exists uq_financial_installments_tenant_id_id on public.financial_installments(tenant_id,id);
create unique index if not exists uq_inventory_items_tenant_id_id on public.inventory_items(tenant_id,id);
create unique index if not exists uq_suppliers_tenant_id_id on public.suppliers(tenant_id,id);

alter table public.clinic_invoices drop constraint if exists fk_invoice_patient_same_tenant;
alter table public.clinic_invoices add constraint fk_invoice_patient_same_tenant foreign key (tenant_id,patient_id) references public.clinic_patients(tenant_id,id) not valid;

alter table public.clinic_invoices drop constraint if exists fk_invoice_session_same_tenant;
alter table public.clinic_invoices add constraint fk_invoice_session_same_tenant foreign key (tenant_id,session_id) references public.clinic_visit_sessions(tenant_id,id) not valid;

alter table public.invoice_items drop constraint if exists fk_invoice_item_invoice_same_tenant;
alter table public.invoice_items add constraint fk_invoice_item_invoice_same_tenant foreign key (tenant_id,invoice_id) references public.clinic_invoices(tenant_id,id) not valid;

alter table public.invoice_items drop constraint if exists fk_invoice_item_procedure_same_tenant;
alter table public.invoice_items add constraint fk_invoice_item_procedure_same_tenant foreign key (tenant_id,procedure_id) references public.clinic_procedures(tenant_id,id) not valid;

alter table public.invoice_payments drop constraint if exists fk_payment_invoice_same_tenant;
alter table public.invoice_payments add constraint fk_payment_invoice_same_tenant foreign key (tenant_id,invoice_id) references public.clinic_invoices(tenant_id,id) not valid;

alter table public.financial_installments drop constraint if exists fk_installment_plan_same_tenant;
alter table public.financial_installments add constraint fk_installment_plan_same_tenant foreign key (tenant_id,financial_plan_id) references public.financial_plans(tenant_id,id) not valid;

alter table public.financial_installments drop constraint if exists fk_installment_invoice_same_tenant;
alter table public.financial_installments add constraint fk_installment_invoice_same_tenant foreign key (tenant_id,invoice_id) references public.clinic_invoices(tenant_id,id) not valid;

alter table public.inventory_ledger drop constraint if exists fk_inventory_ledger_item_same_tenant;
alter table public.inventory_ledger add constraint fk_inventory_ledger_item_same_tenant foreign key (tenant_id,item_id) references public.inventory_items(tenant_id,id) not valid;

alter table public.purchase_orders drop constraint if exists fk_purchase_order_supplier_same_tenant;
alter table public.purchase_orders add constraint fk_purchase_order_supplier_same_tenant foreign key (tenant_id,supplier_id) references public.suppliers(tenant_id,id) not valid;

-- -----------------------------------------------------------------------------
-- 12. Re-validate newly introduced local invariants. Cross-tenant FKs remain NOT VALID
--     until the broader production dataset is proven clean by the next verification pass.
-- -----------------------------------------------------------------------------
alter table public.inventory_items validate constraint inventory_items_purchase_cost_nonnegative;
alter table public.inventory_items validate constraint inventory_items_valuation_cost_nonnegative;
alter table public.inventory_items validate constraint inventory_items_selling_price_nonnegative;
alter table public.inventory_ledger validate constraint inventory_ledger_movement_type_check;
alter table public.inventory_ledger validate constraint inventory_ledger_source_type_check;
alter table public.clinic_invoices validate constraint clinic_invoices_money_nonnegative;
alter table public.invoice_items validate constraint invoice_items_money_nonnegative;
alter table public.invoice_payments validate constraint invoice_payments_money_positive;

commit;
