create or replace function public.sync_supplier_bill_obligation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if new.deleted_at is not null or new.status = 'void' then
    if tg_op = 'UPDATE' then update public.supplier_obligations set status='void', updated_at=now() where tenant_id=new.tenant_id and supplier_bill_id=new.id; end if;
    return new;
  end if;
  select id into v_id from public.supplier_obligations where tenant_id=new.tenant_id and supplier_bill_id=new.id limit 1 for update;
  if v_id is null then
    insert into public.supplier_obligations(tenant_id,supplier_id,purchase_order_id,supplier_bill_id,amount_subunits,amount_paid_subunits,due_date,status,created_by)
    values(new.tenant_id,new.supplier_id,new.purchase_order_id,new.id,new.total_subunits,least(new.amount_paid_subunits,new.total_subunits),new.due_date,case when new.amount_paid_subunits>=new.total_subunits then 'paid' when new.amount_paid_subunits>0 then 'partially_paid' else 'open' end,new.created_by);
  else
    update public.supplier_obligations set supplier_id=new.supplier_id,purchase_order_id=new.purchase_order_id,amount_subunits=new.total_subunits,amount_paid_subunits=least(new.amount_paid_subunits,new.total_subunits),due_date=new.due_date,status=case when new.amount_paid_subunits>=new.total_subunits then 'paid' when new.amount_paid_subunits>0 then 'partially_paid' else 'open' end,updated_at=now() where id=v_id;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_supplier_bill_obligation on public.supplier_bills;
create trigger trg_supplier_bill_obligation after insert or update of supplier_id,purchase_order_id,total_subunits,amount_paid_subunits,due_date,status,deleted_at on public.supplier_bills for each row execute function public.sync_supplier_bill_obligation();