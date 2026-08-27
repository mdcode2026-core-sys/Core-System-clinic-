create or replace function public.record_invoice_payment_with_installment(p_tenant_id uuid, p_invoice_id uuid, p_amount_subunits integer, p_payment_method text, p_payment_reference text default null, p_notes text default null, p_collected_by uuid default null, p_installment_id uuid default null)
returns jsonb language plpgsql set search_path to 'public'
as $$
declare v_invoice record; v_installment record; v_payment_id uuid; v_plan_id uuid; v_new_paid integer; v_new_status text;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:payment') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if p_amount_subunits is null or p_amount_subunits <= 0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id for update;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  if v_invoice.invoice_status in ('cancelled','refunded','draft') then return jsonb_build_object('success',false,'error','Invoice is not payable'); end if;
  if p_amount_subunits > greatest(v_invoice.total_subunits-v_invoice.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds remaining balance'); end if;
  if p_installment_id is not null then
    select * into v_installment from public.financial_installments where id=p_installment_id and tenant_id=p_tenant_id for update;
    if not found then return jsonb_build_object('success',false,'error','Installment not found'); end if;
    if v_installment.invoice_id is not null and v_installment.invoice_id <> p_invoice_id then return jsonb_build_object('success',false,'error','Installment is linked to another invoice'); end if;
    if p_amount_subunits > greatest(v_installment.amount_subunits-v_installment.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds installment balance'); end if;
    v_plan_id := v_installment.financial_plan_id;
  end if;
  insert into public.invoice_payments(tenant_id,invoice_id,financial_plan_id,installment_id,amount_subunits,payment_method,payment_reference,notes,collected_by) values(p_tenant_id,p_invoice_id,v_plan_id,p_installment_id,p_amount_subunits,p_payment_method,p_payment_reference,p_notes,p_collected_by) returning id into v_payment_id;
  v_new_paid:=v_invoice.amount_paid_subunits+p_amount_subunits;
  v_new_status:=case when greatest(v_invoice.total_subunits-v_new_paid,0)=0 then 'paid' when v_new_paid>0 then 'partial' else v_invoice.invoice_status end;
  update public.clinic_invoices set amount_paid_subunits=v_new_paid, invoice_status=v_new_status, collected_by=coalesce(p_collected_by,collected_by), payment_method=p_payment_method, updated_at=now() where id=p_invoice_id and tenant_id=p_tenant_id;
  if p_installment_id is not null then update public.financial_installments set amount_paid_subunits=amount_paid_subunits+p_amount_subunits,status=case when amount_paid_subunits+p_amount_subunits>=amount_subunits then 'paid' when amount_paid_subunits+p_amount_subunits>0 then 'partial' else status end,updated_at=now() where id=p_installment_id and tenant_id=p_tenant_id; end if;
  return jsonb_build_object('success',true,'payment_id',v_payment_id,'financial_plan_id',v_plan_id,'installment_id',p_installment_id,'amount_paid',v_new_paid,'amount_due',greatest(v_invoice.total_subunits-v_new_paid,0),'status',v_new_status);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$$;

create or replace function public.record_invoice_payment(p_tenant_id uuid, p_invoice_id uuid, p_amount_subunits integer, p_payment_method text, p_payment_reference text default null, p_notes text default null, p_collected_by uuid default null)
returns jsonb language plpgsql set search_path to 'public'
as $$
declare v_invoice record; v_payment_id uuid; v_new_paid integer; v_new_status text;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
  if not public.has_tenant_permission(p_tenant_id,'invoices:payment') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
  if p_amount_subunits is null or p_amount_subunits <= 0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id for update;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  if v_invoice.invoice_status in ('cancelled','refunded','draft') then return jsonb_build_object('success',false,'error','Invoice is not payable'); end if;
  if p_amount_subunits > greatest(v_invoice.total_subunits-v_invoice.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds remaining balance'); end if;
  insert into public.invoice_payments(tenant_id,invoice_id,amount_subunits,payment_method,payment_reference,notes,collected_by) values(p_tenant_id,p_invoice_id,p_amount_subunits,p_payment_method,p_payment_reference,p_notes,p_collected_by) returning id into v_payment_id;
  v_new_paid:=v_invoice.amount_paid_subunits+p_amount_subunits;
  v_new_status:=case when greatest(v_invoice.total_subunits-v_new_paid,0)=0 then 'paid' when v_new_paid>0 then 'partial' else v_invoice.invoice_status end;
  update public.clinic_invoices set amount_paid_subunits=v_new_paid, invoice_status=v_new_status, collected_by=coalesce(p_collected_by,collected_by), payment_method=p_payment_method, updated_at=now() where id=p_invoice_id and tenant_id=p_tenant_id;
  return jsonb_build_object('success',true,'payment_id',v_payment_id,'amount_paid',v_new_paid,'amount_due',greatest(v_invoice.total_subunits-v_new_paid,0),'status',v_new_status);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;
$$;
