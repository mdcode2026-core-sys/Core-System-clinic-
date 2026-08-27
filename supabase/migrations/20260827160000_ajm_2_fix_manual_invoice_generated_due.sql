create or replace function public.create_manual_invoice(p_tenant_id uuid, p_patient_id uuid, p_session_id uuid default null, p_invoice_date date default current_date, p_payment_terms text default 'cash', p_notes text default null, p_created_by uuid default null, p_items jsonb default '[]'::jsonb)
returns jsonb language plpgsql set search_path to 'public'
as $$
declare v_invoice_id uuid; v_row jsonb; v_procedure record; v_description text; v_quantity integer; v_unit_price integer; v_discount_amount integer; v_discount_percent numeric; v_effective_discount integer; v_tax_rate numeric; v_tax_included boolean; v_amount_after_discount integer; v_tax integer; v_line_total integer; v_subtotal integer := 0; v_discount integer := 0; v_tax_total integer := 0; v_total integer := 0; v_sort integer := 0;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:create') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if not exists(select 1 from public.clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Patient not found'); end if;
  if p_session_id is not null and not exists(select 1 from public.clinic_visit_sessions where id=p_session_id and tenant_id=p_tenant_id and patient_id=p_patient_id) then return jsonb_build_object('success',false,'error','Session not found'); end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 then return jsonb_build_object('success',false,'error','Invoice must have at least one item'); end if;
  if p_payment_terms not in ('cash','credit','installment') then return jsonb_build_object('success',false,'error','Invalid payment terms'); end if;
  insert into public.clinic_invoices(tenant_id,patient_id,session_id,invoice_date,invoice_status,payment_terms,notes,subtotal_subunits,total_subunits,tax_subunits,discount_subunits,amount_paid_subunits)
  values(p_tenant_id,p_patient_id,p_session_id,p_invoice_date,'draft',p_payment_terms,p_notes,0,0,0,0,0) returning id into v_invoice_id;
  for v_row in select value from jsonb_array_elements(p_items) loop
    v_description := trim(coalesce(v_row->>'description','')); v_quantity := (v_row->>'quantity')::integer; v_unit_price := (v_row->>'unit_price_subunits')::integer; v_discount_amount := coalesce((v_row->>'discount_amount_subunits')::integer,0); v_discount_percent := nullif(v_row->>'discount_percent','')::numeric;
    if v_description='' or v_quantity is null or v_quantity<=0 or v_unit_price is null or v_unit_price<0 or v_discount_amount<0 or (v_discount_percent is not null and (v_discount_percent<0 or v_discount_percent>100)) then raise exception 'Invalid invoice item'; end if;
    v_tax_rate := coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,16); if v_tax_rate<0 then raise exception 'Invalid tax rate'; end if;
    v_tax_included := false;
    if nullif(v_row->>'procedure_id','') is not null then
      select tax_rate_percent,tax_included into v_procedure from public.clinic_procedures where id=(v_row->>'procedure_id')::uuid and tenant_id=p_tenant_id and is_active=true;
      if not found then raise exception 'Procedure not found'; end if;
      v_tax_rate := coalesce(nullif(v_row->>'tax_rate_percent','')::numeric,v_procedure.tax_rate_percent); v_tax_included := v_procedure.tax_included;
    end if;
    if v_discount_percent is not null and v_discount_percent>0 then v_effective_discount := round((v_quantity*v_unit_price)*(v_discount_percent/100.0)); else v_effective_discount := v_discount_amount; end if;
    if v_effective_discount>(v_quantity*v_unit_price) then raise exception 'Discount exceeds item amount'; end if;
    v_amount_after_discount := (v_quantity*v_unit_price)-v_effective_discount;
    if v_tax_included then v_tax := round(v_amount_after_discount*(v_tax_rate/(100.0+v_tax_rate))); v_line_total := v_amount_after_discount; else v_tax := round(v_amount_after_discount*(v_tax_rate/100.0)); v_line_total := v_amount_after_discount+v_tax; end if;
    insert into public.invoice_items(tenant_id,invoice_id,procedure_id,item_description,item_description_ar,quantity,unit_price_subunits,discount_subunits,tax_rate_percent,tax_subunits,line_total_subunits,sort_order)
    values(p_tenant_id,v_invoice_id,nullif(v_row->>'procedure_id','')::uuid,v_description,nullif(v_row->>'description_ar',''),v_quantity,v_unit_price,v_effective_discount,v_tax_rate,v_tax,v_line_total,v_sort);
    v_subtotal := v_subtotal+(v_quantity*v_unit_price); v_discount := v_discount+v_effective_discount; v_tax_total := v_tax_total+v_tax; v_total := v_total+v_line_total; v_sort := v_sort+1;
  end loop;
  update public.clinic_invoices set subtotal_subunits=v_subtotal,discount_subunits=v_discount,tax_subunits=v_tax_total,total_subunits=v_total,updated_at=now() where id=v_invoice_id and tenant_id=p_tenant_id;
  return jsonb_build_object('success',true,'invoice_id',v_invoice_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$$;