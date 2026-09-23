-- AJM-2 post-reconciliation source synchronization.
-- These definitions match the production contracts established during AJM-2 validation.

create or replace function public.record_invoice_payment_with_installment(
  p_tenant_id uuid, p_invoice_id uuid, p_amount_subunits integer, p_payment_method text,
  p_payment_reference text default null, p_notes text default null,
  p_collected_by uuid default null, p_installment_id uuid default null
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_invoice record; v_installment record; v_payment_id uuid; v_plan_id uuid; v_new_paid integer; v_new_due integer; v_new_status text;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:payment') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if p_amount_subunits is null or p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id for update;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  if v_invoice.invoice_status in('cancelled','refunded','draft') then return jsonb_build_object('success',false,'error','Invoice is not payable'); end if;
  if p_amount_subunits>greatest(v_invoice.total_subunits-v_invoice.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds remaining balance'); end if;
  if p_installment_id is not null then
    select * into v_installment from public.financial_installments where id=p_installment_id and tenant_id=p_tenant_id for update;
    if not found then return jsonb_build_object('success',false,'error','Installment not found'); end if;
    if v_installment.invoice_id is not null and v_installment.invoice_id<>p_invoice_id then return jsonb_build_object('success',false,'error','Installment is linked to another invoice'); end if;
    if p_amount_subunits>greatest(v_installment.amount_subunits-v_installment.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds installment balance'); end if;
    v_plan_id:=v_installment.financial_plan_id;
  end if;
  insert into public.invoice_payments(tenant_id,invoice_id,financial_plan_id,installment_id,amount_subunits,payment_method,payment_reference,notes,collected_by)
  values(p_tenant_id,p_invoice_id,v_plan_id,p_installment_id,p_amount_subunits,p_payment_method,p_payment_reference,p_notes,p_collected_by) returning id into v_payment_id;
  v_new_paid:=v_invoice.amount_paid_subunits+p_amount_subunits; v_new_due:=greatest(v_invoice.total_subunits-v_new_paid,0);
  v_new_status:=case when v_new_due=0 then 'paid' when v_new_paid>0 then 'partial' else v_invoice.invoice_status end;
  update public.clinic_invoices set amount_paid_subunits=v_new_paid,amount_due_subunits=v_new_due,invoice_status=v_new_status,collected_by=coalesce(p_collected_by,collected_by),payment_method=p_payment_method,updated_at=now() where id=p_invoice_id and tenant_id=p_tenant_id;
  if p_installment_id is not null then
    update public.financial_installments set amount_paid_subunits=amount_paid_subunits+p_amount_subunits,status=case when amount_paid_subunits+p_amount_subunits>=amount_subunits then 'paid' when amount_paid_subunits+p_amount_subunits>0 then 'partial' else status end,updated_at=now() where id=p_installment_id and tenant_id=p_tenant_id;
  end if;
  return jsonb_build_object('success',true,'payment_id',v_payment_id,'financial_plan_id',v_plan_id,'installment_id',p_installment_id,'amount_paid',v_new_paid,'amount_due',v_new_due,'status',v_new_status);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;
revoke all on function public.record_invoice_payment_with_installment(uuid,uuid,integer,text,text,text,uuid,uuid) from public;
grant execute on function public.record_invoice_payment_with_installment(uuid,uuid,integer,text,text,text,uuid,uuid) to authenticated;

create or replace function public.create_financial_plan_with_installments(
  p_tenant_id uuid,p_patient_id uuid,p_treatment_plan_id uuid,p_total_amount_subunits integer,
  p_insurance_covered_subunits integer,p_patient_responsibility_subunits integer,p_currency text,
  p_notes text,p_created_by uuid,p_installments jsonb default '[]'::jsonb
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_plan_id uuid; v_sum integer; v_count integer; v_row jsonb;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:update') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if p_total_amount_subunits is null or p_total_amount_subunits<0 or p_insurance_covered_subunits is null or p_insurance_covered_subunits<0 or p_patient_responsibility_subunits is null or p_patient_responsibility_subunits<0 or p_insurance_covered_subunits+p_patient_responsibility_subunits<>p_total_amount_subunits then return jsonb_build_object('success',false,'error','Financial plan amounts must balance'); end if;
  if not exists(select 1 from public.clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Patient not found'); end if;
  if p_treatment_plan_id is not null and not exists(select 1 from public.clinic_treatment_plans where id=p_treatment_plan_id and patient_id=p_patient_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Treatment plan not found'); end if;
  if jsonb_typeof(p_installments)<>'array' then return jsonb_build_object('success',false,'error','Installments must be an array'); end if;
  select coalesce(sum((x->>'amount_subunits')::integer),0),count(*) into v_sum,v_count from jsonb_array_elements(p_installments) x;
  if v_sum<>p_patient_responsibility_subunits then return jsonb_build_object('success',false,'error','Installments must equal patient responsibility'); end if;
  insert into public.financial_plans(tenant_id,patient_id,treatment_plan_id,total_amount_subunits,insurance_covered_subunits,patient_responsibility_subunits,currency,notes,created_by) values(p_tenant_id,p_patient_id,p_treatment_plan_id,p_total_amount_subunits,p_insurance_covered_subunits,p_patient_responsibility_subunits,p_currency,p_notes,p_created_by) returning id into v_plan_id;
  for v_row in select * from jsonb_array_elements(p_installments) loop
    if coalesce((v_row->>'installment_no')::integer,0)<=0 or coalesce((v_row->>'amount_subunits')::integer,0)<=0 or nullif(v_row->>'due_date','') is null then raise exception 'Invalid installment'; end if;
    insert into public.financial_installments(tenant_id,financial_plan_id,installment_no,due_date,amount_subunits,invoice_id,notes) values(p_tenant_id,v_plan_id,(v_row->>'installment_no')::integer,(v_row->>'due_date')::date,(v_row->>'amount_subunits')::integer,nullif(v_row->>'invoice_id','')::uuid,v_row->>'notes');
  end loop;
  return jsonb_build_object('success',true,'financial_plan_id',v_plan_id,'installment_count',v_count);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;
revoke all on function public.create_financial_plan_with_installments(uuid,uuid,uuid,integer,integer,integer,text,text,uuid,jsonb) from public;
grant execute on function public.create_financial_plan_with_installments(uuid,uuid,uuid,integer,integer,integer,text,text,uuid,jsonb) to authenticated;

create or replace function public.create_manual_invoice(
  p_tenant_id uuid,p_patient_id uuid,p_session_id uuid default null,p_invoice_date date default current_date,
  p_payment_terms text default 'cash',p_notes text default null,p_created_by uuid default null,p_items jsonb default '[]'::jsonb
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_invoice_id uuid; v_row jsonb; v_procedure record; v_description text; v_quantity integer; v_unit_price integer; v_discount_amount integer; v_discount_percent numeric; v_effective_discount integer; v_tax_rate numeric; v_tax_included boolean; v_amount_after_discount integer; v_tax integer; v_line_total integer; v_subtotal integer:=0; v_discount integer:=0; v_tax_total integer:=0; v_total integer:=0; v_sort integer:=0;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:create') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if not exists(select 1 from public.clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Patient not found'); end if;
  if p_session_id is not null and not exists(select 1 from public.clinic_visit_sessions where id=p_session_id and tenant_id=p_tenant_id and patient_id=p_patient_id) then return jsonb_build_object('success',false,'error','Session not found'); end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then return jsonb_build_object('success',false,'error','Invoice must have at least one item'); end if;
  if p_payment_terms not in('cash','credit','installment') then return jsonb_build_object('success',false,'error','Invalid payment terms'); end if;
  insert into public.clinic_invoices(tenant_id,patient_id,session_id,invoice_date,invoice_status,payment_terms,notes,subtotal_subunits,total_subunits,tax_subunits,discount_subunits,amount_paid_subunits,amount_due_subunits) values(p_tenant_id,p_patient_id,p_session_id,p_invoice_date,'draft',p_payment_terms,p_notes,0,0,0,0,0,0) returning id into v_invoice_id;
  for v_row in select value from jsonb_array_elements(p_items) loop
    v_description:=trim(coalesce(v_row->>'description','')); v_quantity:=(v_row->>'quantity')::integer; v_unit_price:=(v_row->>'unit_price_subunits')::integer; v_discount_amount:=coalesce((v_row->>'discount_amount_subunits')::integer,0); v_discount_percent:=nullif(v_row->>'discount_percent','')::numeric;
    if v_description='' or v_quantity is null or v_quantity<=0 or v_unit_price is null or v_unit_price<0 or v_discount_amount<0 or(v_discount_percent is not null and(v_discount_percent<0 or v_discount_percent>100)) then raise exception 'Invalid invoice item'; end if;
    v_tax_rate:=coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,16); if v_tax_rate<0 then raise exception 'Invalid tax rate'; end if; v_tax_included:=false;
    if nullif(v_row->>'procedure_id','') is not null then select tax_rate_percent,tax_included into v_procedure from public.clinic_procedures where id=(v_row->>'procedure_id')::uuid and tenant_id=p_tenant_id and is_active=true; if not found then raise exception 'Procedure not found'; end if; v_tax_rate:=coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,v_procedure.tax_rate_percent); v_tax_included:=v_procedure.tax_included; end if;
    if v_discount_percent is not null and v_discount_percent>0 then v_effective_discount:=round((v_quantity*v_unit_price)*(v_discount_percent/100.0)); else v_effective_discount:=v_discount_amount; end if; if v_effective_discount>(v_quantity*v_unit_price) then raise exception 'Discount exceeds item amount'; end if;
    v_amount_after_discount:=(v_quantity*v_unit_price)-v_effective_discount;
    if v_tax_included then v_tax:=round(v_amount_after_discount*(v_tax_rate/(100.0+v_tax_rate))); v_line_total:=v_amount_after_discount; else v_tax:=round(v_amount_after_discount*(v_tax_rate/100.0)); v_line_total:=v_amount_after_discount+v_tax; end if;
    insert into public.invoice_items(tenant_id,invoice_id,procedure_id,item_description,item_description_ar,quantity,unit_price_subunits,discount_subunits,tax_rate_percent,tax_subunits,line_total_subunits,sort_order) values(p_tenant_id,v_invoice_id,nullif(v_row->>'procedure_id','')::uuid,v_description,nullif(v_row->>'description_ar',''),v_quantity,v_unit_price,v_effective_discount,v_tax_rate,v_tax,v_line_total,v_sort);
    v_subtotal:=v_subtotal+(v_quantity*v_unit_price); v_discount:=v_discount+v_effective_discount; v_tax_total:=v_tax_total+v_tax; v_total:=v_total+v_line_total; v_sort:=v_sort+1;
  end loop;
  update public.clinic_invoices set subtotal_subunits=v_subtotal,discount_subunits=v_discount,tax_subunits=v_tax_total,total_subunits=v_total,amount_due_subunits=v_total,updated_at=now() where id=v_invoice_id and tenant_id=p_tenant_id;
  return jsonb_build_object('success',true,'invoice_id',v_invoice_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

create or replace function public.create_purchase_order_with_items(
  p_tenant_id uuid,p_supplier_id uuid,p_order_number text default null,p_order_date date default current_date,
  p_expected_date date default null,p_notes text default null,p_created_by uuid default null,p_items jsonb default '[]'::jsonb
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_order_id uuid; v_row jsonb; v_item record; v_qty integer; v_cost integer; v_subtotal integer:=0; v_count integer:=0;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if not exists(select 1 from public.suppliers where id=p_supplier_id and tenant_id=p_tenant_id and status='active') then return jsonb_build_object('success',false,'error','Supplier not found'); end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then return jsonb_build_object('success',false,'error','Purchase order must have at least one item'); end if;
  for v_row in select value from jsonb_array_elements(p_items) loop v_qty:=(v_row->>'quantity_ordered')::integer; v_cost:=(v_row->>'unit_cost_subunits')::integer; if v_qty is null or v_qty<=0 or v_cost is null or v_cost<0 then raise exception 'Invalid purchase order item'; end if; select id into v_item from public.inventory_items where id=(v_row->>'inventory_item_id')::uuid and tenant_id=p_tenant_id and deleted_at is null; if not found then raise exception 'Inventory item not found'; end if; v_subtotal:=v_subtotal+(v_qty*v_cost); v_count:=v_count+1; end loop;
  insert into public.purchase_orders(tenant_id,supplier_id,order_number,status,order_date,expected_date,subtotal_subunits,tax_subunits,total_subunits,notes,created_by) values(p_tenant_id,p_supplier_id,nullif(trim(p_order_number),''),'draft',coalesce(p_order_date,current_date),p_expected_date,v_subtotal,0,v_subtotal,p_notes,p_created_by) returning id into v_order_id;
  for v_row in select value from jsonb_array_elements(p_items) loop v_qty:=(v_row->>'quantity')::integer; v_cost:=(v_row->>'unit_cost_subunits')::integer; insert into public.purchase_order_items(tenant_id,purchase_order_id,inventory_item_id,quantity_ordered,quantity_received,unit_cost_subunits,line_total_subunits) values(p_tenant_id,v_order_id,(v_row->>'inventory_item_id')::uuid,v_qty,0,v_cost,v_qty*v_cost); end loop;
  return jsonb_build_object('success',true,'purchase_order_id',v_order_id,'item_count',v_count);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

alter table public.financial_plans drop constraint if exists financial_plans_amount_balance_check;
alter table public.financial_plans add constraint financial_plans_amount_balance_check check(insurance_covered_subunits+patient_responsibility_subunits=total_amount_subunits);
alter table public.financial_installments drop constraint if exists financial_installments_paid_le_amount_check;
alter table public.financial_installments add constraint financial_installments_paid_le_amount_check check(amount_paid_subunits<=amount_subunits);
alter table public.patient_insurance_profiles drop constraint if exists patient_insurance_date_order_check;
alter table public.patient_insurance_profiles add constraint patient_insurance_date_order_check check(effective_to is null or effective_from is null or effective_to>=effective_from);
alter table public.purchase_order_items drop constraint if exists purchase_order_items_received_le_ordered_check;
alter table public.purchase_order_items add constraint purchase_order_items_received_le_ordered_check check(quantity_received<=quantity_ordered);

-- Reinstall tenant-integrity guards as the authoritative cross-domain invariant.
create or replace function public.validate_ajm2_tenant_integrity() returns trigger language plpgsql set search_path=public as $$
begin
  if TG_TABLE_NAME='clinic_invoices' then
    if exists(select 1 from public.clinic_patients p where p.id=NEW.patient_id and p.tenant_id<>NEW.tenant_id) then raise exception 'Patient tenant mismatch'; end if;
    if NEW.session_id is not null and exists(select 1 from public.clinic_visit_sessions s where s.id=NEW.session_id and s.tenant_id<>NEW.tenant_id) then raise exception 'Session tenant mismatch'; end if;
  elsif TG_TABLE_NAME='invoice_items' then
    if exists(select 1 from public.clinic_invoices i where i.id=NEW.invoice_id and i.tenant_id<>NEW.tenant_id) then raise exception 'Invoice item tenant mismatch'; end if;
    if NEW.procedure_id is not null and exists(select 1 from public.clinic_procedures p where p.id=NEW.procedure_id and p.tenant_id<>NEW.tenant_id) then raise exception 'Procedure tenant mismatch'; end if;
  elsif TG_TABLE_NAME='invoice_payments' then
    if exists(select 1 from public.clinic_invoices i where i.id=NEW.invoice_id and i.tenant_id<>NEW.tenant_id) then raise exception 'Payment invoice tenant mismatch'; end if;
    if NEW.financial_plan_id is not null and exists(select 1 from public.financial_plans f where f.id=NEW.financial_plan_id and f.tenant_id<>NEW.tenant_id) then raise exception 'Payment financial plan tenant mismatch'; end if;
    if NEW.installment_id is not null and exists(select 1 from public.financial_installments fi where fi.id=NEW.installment_id and fi.tenant_id<>NEW.tenant_id) then raise exception 'Payment installment tenant mismatch'; end if;
    if NEW.installment_id is not null and NEW.financial_plan_id is distinct from(select fi.financial_plan_id from public.financial_installments fi where fi.id=NEW.installment_id) then raise exception 'Payment financial plan/installment mismatch'; end if;
  elsif TG_TABLE_NAME='financial_plans' then
    if exists(select 1 from public.clinic_patients p where p.id=NEW.patient_id and p.tenant_id<>NEW.tenant_id) then raise exception 'Financial plan patient tenant mismatch'; end if;
    if NEW.treatment_plan_id is not null and exists(select 1 from public.clinic_treatment_plans tp where tp.id=NEW.treatment_plan_id and(tp.tenant_id<>NEW.tenant_id or tp.patient_id<>NEW.patient_id)) then raise exception 'Financial plan treatment plan mismatch'; end if;
  elsif TG_TABLE_NAME='financial_installments' then
    if exists(select 1 from public.financial_plans f where f.id=NEW.financial_plan_id and f.tenant_id<>NEW.tenant_id) then raise exception 'Installment financial plan tenant mismatch'; end if;
  elsif TG_TABLE_NAME='patient_insurance_profiles' then
    if exists(select 1 from public.clinic_patients p where p.id=NEW.patient_id and p.tenant_id<>NEW.tenant_id) then raise exception 'Insurance patient tenant mismatch'; end if;
  elsif TG_TABLE_NAME='insurance_claims' then
    if exists(select 1 from public.patient_insurance_profiles ip where ip.id=NEW.insurance_profile_id and(ip.tenant_id<>NEW.tenant_id or ip.patient_id<>NEW.patient_id)) then raise exception 'Insurance claim profile mismatch'; end if;
    if NEW.invoice_id is not null and exists(select 1 from public.clinic_invoices i where i.id=NEW.invoice_id and(i.tenant_id<>NEW.tenant_id or i.patient_id<>NEW.patient_id)) then raise exception 'Insurance claim invoice mismatch'; end if;
  elsif TG_TABLE_NAME='purchase_orders' then
    if exists(select 1 from public.suppliers s where s.id=NEW.supplier_id and s.tenant_id<>NEW.tenant_id) then raise exception 'Purchase order supplier tenant mismatch'; end if;
  elsif TG_TABLE_NAME='purchase_order_items' then
    if exists(select 1 from public.purchase_orders po where po.id=NEW.purchase_order_id and po.tenant_id<>NEW.tenant_id) then raise exception 'Purchase order item tenant mismatch'; end if;
    if exists(select 1 from public.inventory_items ii where ii.id=NEW.inventory_item_id and ii.tenant_id<>NEW.tenant_id) then raise exception 'Purchase order inventory item tenant mismatch'; end if;
  elsif TG_TABLE_NAME='purchase_receipts' then
    if exists(select 1 from public.purchase_orders po where po.id=NEW.purchase_order_id and po.tenant_id<>NEW.tenant_id) then raise exception 'Receipt purchase order tenant mismatch'; end if;
    if NEW.received_by is not null and exists(select 1 from public.clinic_users cu where cu.id=NEW.received_by and cu.tenant_id<>NEW.tenant_id) then raise exception 'Receipt actor tenant mismatch'; end if;
  elsif TG_TABLE_NAME='purchase_receipt_items' then
    if exists(select 1 from public.purchase_receipts pr where pr.id=NEW.receipt_id and pr.tenant_id<>NEW.tenant_id) then raise exception 'Receipt item receipt tenant mismatch'; end if;
    if exists(select 1 from public.purchase_order_items poi where poi.id=NEW.purchase_order_item_id and poi.tenant_id<>NEW.tenant_id) then raise exception 'Receipt item purchase-order tenant mismatch'; end if;
    if exists(select 1 from public.inventory_items ii where ii.id=NEW.inventory_item_id and ii.tenant_id<>NEW.tenant_id) then raise exception 'Receipt item inventory tenant mismatch'; end if;
  end if;
  return NEW;
end; $$;

do $$ declare t text; begin foreach t in array array['clinic_invoices','invoice_items','invoice_payments','financial_plans','financial_installments','patient_insurance_profiles','insurance_claims','purchase_orders','purchase_order_items','purchase_receipts','purchase_receipt_items'] loop execute format('drop trigger if exists trg_ajm2_tenant_integrity on public.%I',t); execute format('create trigger trg_ajm2_tenant_integrity before insert or update on public.%I for each row execute function public.validate_ajm2_tenant_integrity()',t); end loop; end $$;
