-- Ideal Scenario remediation: supplier payment and obligation balance update are one transaction.
create or replace function public.record_supplier_payment(p_tenant_id uuid,p_supplier_obligation_id uuid,p_amount_subunits integer,p_payment_method text default null,p_reference text default null,p_created_by uuid default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_obligation record; v_payment_id uuid; v_paid integer; v_status text;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if p_amount_subunits is null or p_amount_subunits<=0 then return jsonb_build_object('success',false,'error','Invalid supplier payment'); end if;
 select id,amount_subunits,amount_paid_subunits,status into v_obligation from public.supplier_obligations where id=p_supplier_obligation_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Supplier obligation not found'); end if;
 if v_obligation.status in ('cancelled','paid') or p_amount_subunits > (v_obligation.amount_subunits-v_obligation.amount_paid_subunits) then return jsonb_build_object('success',false,'error','Payment exceeds outstanding supplier obligation'); end if;
 insert into public.supplier_payments(tenant_id,supplier_obligation_id,amount_subunits,payment_method,reference,created_by) values(p_tenant_id,p_supplier_obligation_id,p_amount_subunits,p_payment_method,p_reference,p_created_by) returning id into v_payment_id;
 v_paid:=v_obligation.amount_paid_subunits+p_amount_subunits;
 v_status:=case when v_paid=v_obligation.amount_subunits then 'paid' else 'partially_paid' end;
 update public.supplier_obligations set amount_paid_subunits=v_paid,status=v_status,updated_at=now() where id=p_supplier_obligation_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'supplier_payment_id',v_payment_id,'status',v_status,'amount_paid_subunits',v_paid);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm);
end; $$;
revoke all on function public.record_supplier_payment(uuid,uuid,integer,text,text,uuid) from public;
grant execute on function public.record_supplier_payment(uuid,uuid,integer,text,text,uuid) to authenticated,service_role;
