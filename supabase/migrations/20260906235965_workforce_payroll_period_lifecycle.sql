-- Payroll period lifecycle: Open -> Processing -> Locked -> Paid, with controlled cancellation.
create or replace function public.set_workforce_payroll_period_status(p_tenant_id uuid,p_payroll_period_id uuid,p_status text,p_actor uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_actor uuid; v_old text; v_open_entries integer; begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_actor,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 select status into v_old from public.workforce_payroll_periods where id=p_payroll_period_id and tenant_id=p_tenant_id for update; if v_old is null then return jsonb_build_object('success',false,'error','Payroll period not found'); end if;
 if p_status not in ('open','processing','locked','paid','cancelled') then return jsonb_build_object('success',false,'error','Invalid payroll period status'); end if;
 if p_status='processing' and v_old<>'open' then return jsonb_build_object('success',false,'error','Only open periods can move to processing'); end if;
 if p_status='locked' and v_old<>'processing' then return jsonb_build_object('success',false,'error','Only processing periods can be locked'); end if;
 if p_status='paid' then select count(*) into v_open_entries from public.workforce_payroll_entries where tenant_id=p_tenant_id and payroll_period_id=p_payroll_period_id and status<>'paid'; if v_open_entries>0 then return jsonb_build_object('success',false,'error','All payroll entries must be paid before the period can be marked paid','remaining_entries',v_open_entries); end if; end if;
 if p_status='cancelled' and v_old not in ('open','processing') then return jsonb_build_object('success',false,'error','Only open or processing periods can be cancelled'); end if;
 update public.workforce_payroll_periods set status=p_status,updated_at=now() where id=p_payroll_period_id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'period_id',p_payroll_period_id,'status',p_status,'previous_status',v_old);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;
revoke execute on function public.set_workforce_payroll_period_status(uuid,uuid,text,uuid) from anon,public;
grant execute on function public.set_workforce_payroll_period_status(uuid,uuid,text,uuid) to authenticated;
