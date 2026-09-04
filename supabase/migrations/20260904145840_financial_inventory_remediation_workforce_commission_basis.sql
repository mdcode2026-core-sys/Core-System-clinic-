-- Workforce commission remains in Workforce; payment supplies the canonical financial basis.
begin;
create or replace function public.calculate_workforce_commission_from_payment(p_tenant_id uuid,p_payment_id uuid,p_employee_id uuid,p_rule_id uuid,p_created_by uuid) returns jsonb language plpgsql security definer set search_path='public' as $function$
declare v_payment record; v_rule record; v_existing uuid; v_eligible integer; v_commission integer; v_actor uuid; v_entry_id uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:commission') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 select * into v_payment from public.invoice_payments where id=p_payment_id and tenant_id=p_tenant_id; if not found then return jsonb_build_object('success',false,'error','Payment not found'); end if;
 if not exists(select 1 from public.workforce_employees where id=p_employee_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Employee not found'); end if;
 select * into v_rule from public.workforce_commission_rules where id=p_rule_id and tenant_id=p_tenant_id and status='active'; if not found then return jsonb_build_object('success',false,'error','Commission rule not found'); end if;
 select id into v_existing from public.workforce_commission_entries where tenant_id=p_tenant_id and source_payment_id=p_payment_id and employee_id=p_employee_id and commission_rule_id=p_rule_id and status<>'cancelled' limit 1; if v_existing is not null then return jsonb_build_object('success',true,'entry_id',v_existing,'idempotent',true); end if;
 v_eligible:=v_payment.amount_subunits; v_commission:=case when lower(v_rule.basis) in ('percentage','percent') then round(v_eligible*(v_rule.rate/100.0)) when lower(v_rule.basis) in ('fixed','fixed_amount') then coalesce(v_rule.fixed_amount_subunits,0) else 0 end;
 insert into public.workforce_commission_entries(tenant_id,employee_id,commission_rule_id,source_type,source_id,basis_amount_subunits,eligible_amount_subunits,status,calculated_at,created_by,source_payment_id,notes) values(p_tenant_id,p_employee_id,p_rule_id,'invoice_payment',p_payment_id,v_payment.amount_subunits,v_eligible,'calculated',now(),v_actor,p_payment_id,'Calculated from canonical invoice payment') returning id into v_entry_id;
 return jsonb_build_object('success',true,'commission_subunits',v_commission,'basis_subunits',v_eligible,'entry_id',v_entry_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end;$function$;
revoke all on function public.calculate_workforce_commission_from_payment(uuid,uuid,uuid,uuid,uuid) from public,anon;
grant execute on function public.calculate_workforce_commission_from_payment(uuid,uuid,uuid,uuid,uuid) to authenticated;
commit;
