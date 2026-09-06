-- Payslips are issued only from approved/paid payroll entries and use period currency first.
create or replace function public.create_workforce_payslip_for_entry(p_tenant_id uuid,p_payroll_entry_id uuid,p_created_by uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_actor uuid; v_entry record; v_existing uuid; v_gross integer; v_id uuid; v_currency text;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 select * into v_entry from public.workforce_payroll_entries where id=p_payroll_entry_id and tenant_id=p_tenant_id; if not found then return jsonb_build_object('success',false,'error','Payroll entry not found'); end if;
 if v_entry.status not in ('approved','paid') then return jsonb_build_object('success',false,'error','Payslip requires an approved or paid payroll entry'); end if;
 select id into v_existing from public.workforce_payslips where payroll_entry_id=p_payroll_entry_id; if v_existing is not null then return jsonb_build_object('success',true,'payslip_id',v_existing,'idempotent',true); end if;
 v_gross:=v_entry.base_salary_subunits+v_entry.allowances_subunits+v_entry.overtime_subunits+v_entry.bonuses_subunits+v_entry.commissions_subunits;
 select currency into v_currency from public.workforce_payroll_periods where id=v_entry.payroll_period_id and tenant_id=p_tenant_id; if v_currency is null then select currency into v_currency from public.workforce_employment_records where tenant_id=p_tenant_id and employee_id=v_entry.employee_id and status='active' order by effective_from desc limit 1; end if; v_currency:=coalesce(v_currency,'JOD');
 insert into public.workforce_payslips(tenant_id,payroll_entry_id,employee_id,payroll_period_id,currency,gross_subunits,deductions_subunits,net_subunits,status,issued_at,created_by) values(p_tenant_id,v_entry.id,v_entry.employee_id,v_entry.payroll_period_id,v_currency,v_gross,v_entry.deductions_subunits,v_entry.net_subunits,'issued',now(),v_actor) returning id into v_id;
 return jsonb_build_object('success',true,'payslip_id',v_id,'gross_subunits',v_gross,'deductions_subunits',v_entry.deductions_subunits,'net_subunits',v_entry.net_subunits);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;
revoke execute on function public.create_workforce_payslip_for_entry(uuid,uuid,uuid) from anon,public;
grant execute on function public.create_workforce_payslip_for_entry(uuid,uuid,uuid) to authenticated;
