drop function if exists public.apply_payment_to_installment(uuid, integer);

create or replace function public.apply_payment_to_installment(
  p_tenant_id uuid,
  p_installment_id uuid,
  p_amount_subunits integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_installment record;
  v_paid integer;
  v_due integer;
  v_status text;
begin
  if p_amount_subunits <= 0 then
    return jsonb_build_object('success',false,'error','Payment amount must be positive');
  end if;

  select * into v_installment
  from public.financial_installments
  where id=p_installment_id and tenant_id=p_tenant_id
  for update;

  if not found then
    return jsonb_build_object('success',false,'error','Installment not found');
  end if;

  v_due := greatest(v_installment.amount_subunits - v_installment.amount_paid_subunits,0);
  if p_amount_subunits > v_due then
    return jsonb_build_object('success',false,'error','Payment exceeds installment balance');
  end if;

  v_paid := v_installment.amount_paid_subunits + p_amount_subunits;
  if v_paid >= v_installment.amount_subunits then v_status := 'paid';
  elsif v_paid > 0 then v_status := 'partial';
  else v_status := v_installment.status;
  end if;

  update public.financial_installments
  set amount_paid_subunits=v_paid,status=v_status,updated_at=now()
  where id=p_installment_id and tenant_id=p_tenant_id;

  return jsonb_build_object(
    'success',true,
    'installment_id',p_installment_id,
    'amount_paid',v_paid,
    'amount_due',greatest(v_installment.amount_subunits-v_paid,0),
    'status',v_status
  );
end;
$$;

revoke all on function public.apply_payment_to_installment(uuid, uuid, integer) from public;
grant execute on function public.apply_payment_to_installment(uuid, uuid, integer) to authenticated;
