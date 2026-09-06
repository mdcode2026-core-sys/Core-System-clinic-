begin;

create or replace function public.create_workforce_payroll_entry_with_commissions(
  p_tenant_id uuid,
  p_payroll_period_id uuid,
  p_employee_id uuid,
  p_allowances_subunits integer default 0,
  p_overtime_subunits integer default 0,
  p_bonuses_subunits integer default 0,
  p_deductions_subunits integer default 0,
  p_created_by uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
declare
  v_actor uuid;
  v_period record;
  v_employee record;
  v_employment record;
  v_existing uuid;
  v_commissions integer := 0;
  v_net integer;
  v_entry_id uuid;
begin
  if public.get_current_tenant_id() is distinct from p_tenant_id
     or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then
    return jsonb_build_object('success',false,'error','Permission denied');
  end if;

  v_actor := coalesce(p_created_by, auth.uid());
  if v_actor is null or not exists (
    select 1 from public.clinic_users
    where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null
  ) then
    return jsonb_build_object('success',false,'error','Actor does not belong to tenant');
  end if;

  select * into v_period from public.workforce_payroll_periods
  where id=p_payroll_period_id and tenant_id=p_tenant_id;
  if not found then return jsonb_build_object('success',false,'error','Payroll period not found'); end if;
  if v_period.status not in ('open','processing') then return jsonb_build_object('success',false,'error','Payroll period is not open for entries'); end if;

  select * into v_employee from public.workforce_employees
  where id=p_employee_id and tenant_id=p_tenant_id and status='active';
  if not found then return jsonb_build_object('success',false,'error','Employee not found or inactive'); end if;

  select id into v_existing from public.workforce_payroll_entries
  where tenant_id=p_tenant_id and payroll_period_id=p_payroll_period_id and employee_id=p_employee_id limit 1;
  if v_existing is not null then return jsonb_build_object('success',false,'error','Payroll entry already exists for this employee and period','entry_id',v_existing); end if;

  select * into v_employment from public.workforce_employment_records
  where tenant_id=p_tenant_id and employee_id=p_employee_id and status='active'
    and effective_from <= v_period.period_end
    and (effective_to is null or effective_to >= v_period.period_start)
  order by effective_from desc limit 1;
  if not found then return jsonb_build_object('success',false,'error','No active employment record covers this payroll period'); end if;

  select coalesce(sum(case
    when lower(r.basis) in ('percentage','percent','collected_revenue') then round(c.eligible_amount_subunits * (r.rate / 100.0))
    when lower(r.basis) in ('fixed','fixed_amount') then coalesce(r.fixed_amount_subunits,0)
    else 0 end),0)::integer into v_commissions
  from public.workforce_commission_entries c
  join public.workforce_commission_rules r on r.id=c.commission_rule_id and r.tenant_id=c.tenant_id
  where c.tenant_id=p_tenant_id and c.employee_id=p_employee_id and c.status='approved'
    and c.calculated_at >= (v_period.period_start::timestamp at time zone 'UTC')
    and c.calculated_at < ((v_period.period_end + 1)::timestamp at time zone 'UTC');

  v_net := v_employment.base_salary_subunits
    + greatest(coalesce(p_allowances_subunits,0),0)
    + greatest(coalesce(p_overtime_subunits,0),0)
    + greatest(coalesce(p_bonuses_subunits,0),0)
    + v_commissions
    - greatest(coalesce(p_deductions_subunits,0),0);

  insert into public.workforce_payroll_entries(
    tenant_id,payroll_period_id,employee_id,base_salary_subunits,
    allowances_subunits,overtime_subunits,bonuses_subunits,commissions_subunits,
    deductions_subunits,net_subunits,status,notes,created_by
  ) values (
    p_tenant_id,p_payroll_period_id,p_employee_id,v_employment.base_salary_subunits,
    greatest(coalesce(p_allowances_subunits,0),0),greatest(coalesce(p_overtime_subunits,0),0),
    greatest(coalesce(p_bonuses_subunits,0),0),v_commissions,
    greatest(coalesce(p_deductions_subunits,0),0),v_net,'draft',
    'Generated from active employment record and approved workforce commissions',v_actor
  ) returning id into v_entry_id;

  return jsonb_build_object('success',true,'entry_id',v_entry_id,'base_salary_subunits',v_employment.base_salary_subunits,'commissions_subunits',v_commissions,'net_subunits',v_net);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm);
end;
$function$;

revoke all on function public.create_workforce_payroll_entry_with_commissions(uuid,uuid,uuid,integer,integer,integer,integer,uuid) from public, anon;
grant execute on function public.create_workforce_payroll_entry_with_commissions(uuid,uuid,uuid,integer,integer,integer,integer,uuid) to authenticated;

commit;
