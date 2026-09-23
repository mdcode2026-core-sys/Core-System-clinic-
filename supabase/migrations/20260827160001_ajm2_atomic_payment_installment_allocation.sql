create or replace function public.record_invoice_payment_with_installment(
  p_tenant_id uuid,p_invoice_id uuid,p_amount_subunits integer,p_payment_method text,
  p_payment_reference text default null,p_notes text default null,p_collected_by uuid default null,p_installment_id uuid default null
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare v_invoice record; v_installment record; v_payment_id uuid; v_new_paid integer; v_new_due integer; v_new_status text; v_inst_paid integer; v_inst_due integer; v_inst_status text;
begin
  if p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Payment amount must be positive'); end if;
  select * into v_invoice from public.clinic_invoices where id=p_invoice_id and tenant_id=p_tenant_id for update;
  if not found then return jsonb_build_object('success',false,'error','Invoice not found'); end if;
  if v_invoice.invoice_status in('cancelled','refunded','draft') then return jsonb_build_object('success',false,'error','Invoice is not payable'); end if;
  if p_amount_subunits>greatest(v_invoice.total_subunits-v_invoice.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds remaining balance'); end if;
  if p_installment_id is not null then
    select * into v_installment from public.financial_installments where id=p_installment_id and tenant_id=p_tenant_id for update;
    if not found then return jsonb_build_object('success',false,'error','Installment not found'); end if;
    if v_installment.invoice_id is not null and v_installment.invoice_id<>p_invoice_id then return jsonb_build_object('success',false,'error','Installment is linked to another invoice'); end if;
    if p_amount_subunits>greatest(v_installment.amount_subunits-v_installment.amount_paid_subunits,0) then return jsonb_build_object('success',false,'error','Payment exceeds installment balance'); end if;
  end if;
  insert into public.invoice_payments(tenant_id,invoice_id,financial_plan_id,installment_id,amount_subunits,payment_method,payment_reference,notes,collected_by)
  values(p_tenant_id,p_invoice_id,case when p_installment_id is null then null else v_installment.financial_plan_id end,p_installment_id,p_amount_subunits,p_payment_method,p_payment_reference,p_notes,p_collected_by)
  returning id into v_payment_id;
  v_new_paid:=v_invoice.amount_paid_subunits+p_amount_subunits; v_new_due:=v_invoice.total_subunits-v_new_paid;
  if v_new_due<=0 then v_new_status:='paid'; elsif v_new_paid>0 then v_new_status:='partial'; else v_new_status:=v_invoice.invoice_status; end if;
  update public.clinic_invoices set amount_paid_subunits=v_new_paid,amount_due_subunits=greatest(v_new_due,0),invoice_status=v_new_status,updated_at=now() where id=p_invoice_id and tenant_id=p_tenant_id;
  if p_installment_id is not null then
    v_inst_paid:=v_installment.amount_paid_subunits+p_amount_subunits; v_inst_due:=v_installment.amount_subunits-v_inst_paid;
    if v_inst_due<=0 then v_inst_status:='paid'; elsif v_inst_paid>0 then v_inst_status:='partial'; else v_inst_status:=v_installment.status; end if;
    update public.financial_installments set amount_paid_subunits=v_inst_paid,status=v_inst_status,updated_at=now() where id=p_installment_id and tenant_id=p_tenant_id;
  end if;
  return jsonb_build_object('success',true,'payment_id',v_payment_id,'invoice_id',p_invoice_id,'installment_id',p_installment_id,'status',v_new_status,'amount_paid',v_new_paid,'amount_due',greatest(v_new_due,0));
end; $$;
revoke all on function public.record_invoice_payment_with_installment(uuid,uuid,integer,text,text,text,uuid,uuid) from public;
grant execute on function public.record_invoice_payment_with_installment(uuid,uuid,integer,text,text,text,uuid,uuid) to authenticated;
