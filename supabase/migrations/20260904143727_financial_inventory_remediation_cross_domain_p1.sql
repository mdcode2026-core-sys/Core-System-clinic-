-- CORE SYSTEM Financial & Inventory cross-domain P1 remediation.
begin;
create or replace function public.create_manual_invoice(p_tenant_id uuid,p_patient_id uuid,p_session_id uuid default null,p_invoice_date date default current_date,p_payment_terms text default 'cash',p_notes text default null,p_created_by uuid default null,p_items jsonb default '[]'::jsonb) returns jsonb language plpgsql set search_path to 'public' as $function$
declare v_invoice_id uuid; v_row jsonb; v_procedure record; v_description text; v_quantity integer; v_unit_price integer; v_discount_amount integer; v_discount_percent numeric; v_effective_discount integer; v_tax_rate numeric; v_tax_included boolean; v_amount_after_discount integer; v_tax integer; v_line_total integer; v_subtotal integer:=0; v_discount integer:=0; v_tax_total integer:=0; v_total integer:=0; v_sort integer:=0; v_actor uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'invoices:create') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid()); if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Creator does not belong to tenant'); end if;
 if not exists(select 1 from public.clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Patient not found'); end if;
 if p_session_id is not null and not exists(select 1 from public.clinic_visit_sessions where id=p_session_id and tenant_id=p_tenant_id and patient_id=p_patient_id) then return jsonb_build_object('success',false,'error','Session not found'); end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then return jsonb_build_object('success',false,'error','Invoice must have at least one item'); end if;
 if p_payment_terms not in ('cash','credit','installment') then return jsonb_build_object('success',false,'error','Invalid payment terms'); end if;
 insert into public.clinic_invoices(tenant_id,patient_id,session_id,invoice_date,invoice_status,payment_terms,notes,subtotal_subunits,total_subunits,tax_subunits,discount_subunits,amount_paid_subunits,amount_due_subunits) values(p_tenant_id,p_patient_id,p_session_id,p_invoice_date,'draft',p_payment_terms,p_notes,0,0,0,0,0,0) returning id into v_invoice_id;
 for v_row in select value from jsonb_array_elements(p_items) loop
  v_description:=trim(coalesce(v_row->>'description','')); v_quantity:=(v_row->>'quantity')::integer; v_unit_price:=(v_row->>'unit_price_subunits')::integer; v_discount_amount:=coalesce((v_row->>'discount_amount_subunits')::integer,0); v_discount_percent:=nullif(v_row->>'discount_percent','')::numeric;
  if v_description='' or v_quantity is null or v_quantity<=0 or v_unit_price is null or v_unit_price<0 or v_discount_amount<0 or (v_discount_percent is not null and (v_discount_percent<0 or v_discount_percent>100)) then raise exception 'Invalid invoice item'; end if;
  v_tax_rate:=coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,16); if v_tax_rate<0 then raise exception 'Invalid tax rate'; end if; v_tax_included:=false;
  if nullif(v_row->>'procedure_id','') is not null then select tax_rate_percent,tax_included into v_procedure from public.clinic_procedures where id=(v_row->>'procedure_id')::uuid and tenant_id=p_tenant_id and is_active=true; if not found then raise exception 'Procedure not found'; end if; v_tax_rate:=coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,v_procedure.tax_rate_percent); v_tax_included:=v_procedure.tax_included; end if;
  if v_discount_percent is not null and v_discount_percent>0 then v_effective_discount:=round((v_quantity*v_unit_price)*(v_discount_percent/100.0)); else v_effective_discount:=v_discount_amount; end if;
  if v_effective_discount>(v_quantity*v_unit_price) then raise exception 'Discount exceeds item amount'; end if;
  if v_effective_discount>0 and not public.has_tenant_permission(p_tenant_id,'invoices:discount') then raise exception 'Discount permission required'; end if;
  v_amount_after_discount:=(v_quantity*v_unit_price)-v_effective_discount;
  if v_tax_included then v_tax:=round(v_amount_after_discount*(v_tax_rate/(100.0+v_tax_rate))); v_line_total:=v_amount_after_discount; else v_tax:=round(v_amount_after_discount*(v_tax_rate/100.0)); v_line_total:=v_amount_after_discount+v_tax; end if;
  insert into public.invoice_items(tenant_id,invoice_id,procedure_id,item_description,item_description_ar,quantity,unit_price_subunits,discount_subunits,tax_rate_percent,tax_subunits,line_total_subunits,sort_order) values(p_tenant_id,v_invoice_id,nullif(v_row->>'procedure_id','')::uuid,v_description,nullif(v_row->>'description_ar',''),v_quantity,v_unit_price,v_effective_discount,v_tax_rate,v_tax,v_line_total,v_sort);
  v_subtotal:=v_subtotal+(v_quantity*v_unit_price); v_discount:=v_discount+v_effective_discount; v_tax_total:=v_tax_total+v_tax; v_total:=v_total+v_line_total; v_sort:=v_sort+1;
 end loop;
 update public.clinic_invoices set subtotal_subunits=v_subtotal,discount_subunits=v_discount,tax_subunits=v_tax_total,total_subunits=v_total,amount_due_subunits=v_total,discount_approved_by=case when v_discount>0 then v_actor else null end,updated_at=now() where id=v_invoice_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'invoice_id',v_invoice_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

create or replace function public.receive_purchase_order(p_tenant_id uuid,p_purchase_order_id uuid,p_received_by uuid,p_items jsonb) returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_order record; v_receipt_id uuid; v_item jsonb; v_poi record; v_qty integer; v_remaining integer; v_status text; v_obligation_id uuid; v_received_value integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if; if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if not exists(select 1 from public.clinic_users where id=p_received_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Receiver does not belong to tenant'); end if;
 select * into v_order from public.purchase_orders where id=p_purchase_order_id and tenant_id=p_tenant_id for update; if not found then return jsonb_build_object('success',false,'error','Purchase order not found'); end if;
 if v_order.status in ('cancelled','received') then return jsonb_build_object('success',false,'error','Purchase order cannot receive in current status'); end if;
 if not exists(select 1 from public.suppliers where id=v_order.supplier_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Supplier does not belong to tenant'); end if;
 insert into public.purchase_receipts(tenant_id,purchase_order_id,received_by) values(p_tenant_id,p_purchase_order_id,p_received_by) returning id into v_receipt_id;
 for v_item in select * from jsonb_array_elements(p_items) loop
  v_qty:=(v_item->>'quantity')::integer; if v_qty<=0 then raise exception 'Received quantity must be positive'; end if;
  select * into v_poi from public.purchase_order_items where id=(v_item->>'purchase_order_item_id')::uuid and purchase_order_id=p_purchase_order_id and tenant_id=p_tenant_id for update; if not found then raise exception 'Purchase order item not found'; end if;
  if v_poi.quantity_received+v_qty>v_poi.quantity_ordered then raise exception 'Received quantity exceeds ordered quantity'; end if;
  if not exists(select 1 from public.inventory_items where id=v_poi.inventory_item_id and tenant_id=p_tenant_id and deleted_at is null) then raise exception 'Inventory item does not belong to tenant'; end if;
  insert into public.purchase_receipt_items(tenant_id,receipt_id,purchase_order_item_id,inventory_item_id,quantity_received) values(p_tenant_id,v_receipt_id,v_poi.id,v_poi.inventory_item_id,v_qty);
  update public.purchase_order_items set quantity_received=quantity_received+v_qty,updated_at=now() where id=v_poi.id;
  perform public.adjust_inventory_stock(v_poi.inventory_item_id,p_tenant_id,v_qty,'purchase_receipt','purchase_receipt',v_receipt_id,null,null,null,p_received_by,'Purchase receipt '||coalesce(v_order.order_number,v_order.id::text));
 end loop;
 select count(*) filter(where quantity_received<quantity_ordered) into v_remaining from public.purchase_order_items where purchase_order_id=p_purchase_order_id; v_status:=case when v_remaining=0 then 'received' else 'partially_received' end; update public.purchase_orders set status=v_status,updated_at=now() where id=p_purchase_order_id;
 select coalesce(sum(poi.quantity_received*poi.unit_cost_subunits),0) into v_received_value from public.purchase_order_items poi where poi.purchase_order_id=p_purchase_order_id and poi.tenant_id=p_tenant_id;
 if v_received_value>0 then insert into public.supplier_obligations(tenant_id,supplier_id,purchase_order_id,amount_subunits,amount_paid_subunits,due_date,status,created_by) values(p_tenant_id,v_order.supplier_id,p_purchase_order_id,v_received_value,0,v_order.expected_date,'open',p_received_by) on conflict (tenant_id,purchase_order_id) where purchase_order_id is not null do update set amount_subunits=excluded.amount_subunits,updated_at=now() returning id into v_obligation_id; end if;
 return jsonb_build_object('success',true,'receipt_id',v_receipt_id,'status',v_status,'supplier_obligation_id',v_obligation_id,'received_value_subunits',v_received_value);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

create or replace function public.record_supplier_payment(p_tenant_id uuid,p_supplier_obligation_id uuid,p_amount_subunits integer,p_payment_method text default null,p_reference text default null,p_created_by uuid default null) returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_obligation record; v_payment_id uuid; v_paid integer; v_status text; v_actor uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if; if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid()); if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 if p_amount_subunits is null or p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Invalid supplier payment'); end if;
 select o.* into v_obligation from public.supplier_obligations o where o.id=p_supplier_obligation_id and o.tenant_id=p_tenant_id for update; if not found then return jsonb_build_object('success',false,'error','Supplier obligation not found'); end if;
 if not exists(select 1 from public.suppliers s where s.id=v_obligation.supplier_id and s.tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Supplier does not belong to tenant'); end if;
 if v_obligation.status in ('cancelled','paid') or p_amount_subunits>(v_obligation.amount_subunits-v_obligation.amount_paid_subunits) then return jsonb_build_object('success',false,'error','Payment exceeds outstanding supplier obligation'); end if;
 insert into public.supplier_payments(tenant_id,supplier_obligation_id,amount_subunits,payment_method,reference,created_by) values(p_tenant_id,p_supplier_obligation_id,p_amount_subunits,p_payment_method,p_reference,v_actor) returning id into v_payment_id;
 v_paid:=v_obligation.amount_paid_subunits+p_amount_subunits; v_status:=case when v_paid=v_obligation.amount_subunits then 'paid' else 'partially_paid' end;
 update public.supplier_obligations set amount_paid_subunits=v_paid,status=v_status,updated_at=now() where id=p_supplier_obligation_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'supplier_payment_id',v_payment_id,'status',v_status,'amount_paid_subunits',v_paid);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;

create or replace function public.reconcile_insurance_claim(p_tenant_id uuid,p_claim_id uuid,p_reconciled_subunits integer,p_patient_responsibility_subunits integer,p_reconciled_by uuid) returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_claim public.insurance_claims%rowtype; v_invoice public.clinic_invoices%rowtype; v_profile public.patient_insurance_profiles%rowtype; v_payer_balance integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if; if not public.has_tenant_permission(p_tenant_id,'insurance:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if not exists(select 1 from public.clinic_users where id=p_reconciled_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Invalid reconciler'); end if;
 if p_reconciled_subunits<0 or p_patient_responsibility_subunits<0 then return jsonb_build_object('success',false,'error','Amounts cannot be negative'); end if;
 select * into v_claim from public.insurance_claims where id=p_claim_id and tenant_id=p_tenant_id and deleted_at is null for update; if not found then return jsonb_build_object('success',false,'error','Claim not found'); end if;
 select * into v_profile from public.patient_insurance_profiles where id=v_claim.insurance_profile_id and tenant_id=p_tenant_id; if not found or v_profile.patient_id is distinct from v_claim.patient_id then return jsonb_build_object('success',false,'error','Insurance profile patient mismatch'); end if;
 if v_claim.invoice_id is not null then select * into v_invoice from public.clinic_invoices where id=v_claim.invoice_id and tenant_id=p_tenant_id and deleted_at is null; if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if; if v_invoice.patient_id is distinct from v_claim.patient_id then return jsonb_build_object('success',false,'error','Claim patient does not match invoice patient'); end if; end if;
 if p_reconciled_subunits>v_claim.amount_claimed_subunits then return jsonb_build_object('success',false,'error','Reconciled amount exceeds claim'); end if;
 if v_claim.invoice_id is not null and p_reconciled_subunits+p_patient_responsibility_subunits>v_invoice.total_subunits then return jsonb_build_object('success',false,'error','Payer and patient responsibility exceed invoice'); end if;
 v_payer_balance:=v_claim.amount_claimed_subunits-p_reconciled_subunits;
 update public.insurance_claims set amount_reconciled_subunits=p_reconciled_subunits,status=case when p_reconciled_subunits=v_claim.amount_claimed_subunits then 'reconciled' else 'exception' end,reconciled_at=now(),notes=coalesce(notes,'')||case when notes is null or notes='' then '' else E'\n' end||'Patient responsibility: '||p_patient_responsibility_subunits||' · Reconciled by clinic user: '||p_reconciled_by,updated_at=now() where id=p_claim_id and tenant_id=p_tenant_id;
 update public.patient_insurance_profiles set patient_responsibility_subunits=p_patient_responsibility_subunits,reconciliation_status=case when p_reconciled_subunits=v_claim.amount_claimed_subunits then 'reconciled' else 'exception' end,updated_at=now() where id=v_claim.insurance_profile_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'claim_id',p_claim_id,'reconciled_subunits',p_reconciled_subunits,'patient_responsibility_subunits',p_patient_responsibility_subunits,'payer_balance_subunits',v_payer_balance);
end;
$function$;

create or replace function public.consume_procedure_inventory(p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity numeric,p_consumed_by uuid,p_reason text) returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_new integer; v_procedure_id uuid; v_source_type text; v_source_id uuid;
begin
 if public.get_current_tenant_id()<>p_tenant_id then raise exception 'Tenant mismatch'; end if; if not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then raise exception 'Permission denied'; end if;
 if not exists(select 1 from public.clinic_users where id=p_consumed_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then raise exception 'Actor does not belong to tenant'; end if;
 if p_quantity<=0 or p_quantity<>trunc(p_quantity) then return jsonb_build_object('success',false,'error','Inventory quantity must be a positive whole number'); end if;
 if not exists(select 1 from public.clinic_visit_sessions where id=p_visit_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Visit not found'); end if;
 if p_treatment_plan_item_id is not null and not exists(select 1 from public.clinic_treatment_plan_items where id=p_treatment_plan_item_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Treatment plan item not found'); end if;
 select mae.procedure_id into v_procedure_id from public.clinic_visit_sessions cvs left join public.master_agenda_events mae on mae.id=cvs.agenda_event_id where cvs.id=p_visit_id and cvs.tenant_id=p_tenant_id;
 v_source_type:=case when p_treatment_plan_item_id is null then 'procedure_session' else 'treatment_plan_item' end; v_source_id:=coalesce(p_treatment_plan_item_id,p_visit_id);
 v_new:=public.adjust_inventory_stock(p_item_id,p_tenant_id,-p_quantity::integer,'procedure_consumption',v_source_type,v_source_id,v_procedure_id,p_visit_id,p_treatment_plan_item_id,p_consumed_by,p_reason);
 return jsonb_build_object('success',true,'new_stock',v_new,'visit_id',p_visit_id,'treatment_plan_item_id',p_treatment_plan_item_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$function$;
commit;
