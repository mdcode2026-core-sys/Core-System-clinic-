-- Workforce Payroll Core completion: benefit employee cost + approval/payment lifecycle.
-- Canonical payroll remains country-neutral; country rules remain a separate reference layer.

alter table public.workforce_benefits
  add column if not exists employee_contribution_subunits integer not null default 0;

alter table public.workforce_benefits
  drop constraint if exists workforce_benefits_employee_contribution_nonnegative;
alter table public.workforce_benefits
  add constraint workforce_benefits_employee_contribution_nonnegative check (employee_contribution_subunits >= 0);

alter table public.workforce_payroll_entries
  add column if not exists approved_by uuid,
  add column if not exists approved_at timestamptz,
  add column if not exists paid_by uuid,
  add column if not exists paid_at timestamptz;

create or replace function public.approve_workforce_payroll_entry(p_tenant_id uuid,p_payroll_entry_id uuid,p_approved_by uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_actor uuid; v_entry record; begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_approved_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 select * into v_entry from public.workforce_payroll_entries where id=p_payroll_entry_id and tenant_id=p_tenant_id for update; if not found then return jsonb_build_object('success',false,'error','Payroll entry not found'); end if;
 if v_entry.status='approved' then return jsonb_build_object('success',true,'idempotent',true,'entry_id',v_entry.id); end if;
 if v_entry.status<>'draft' then return jsonb_build_object('success',false,'error','Only draft payroll entries can be approved'); end if;
 if not exists(select 1 from public.workforce_payroll_periods p where p.id=v_entry.payroll_period_id and p.tenant_id=p_tenant_id and p.status in ('open','processing','locked')) then return jsonb_build_object('success',false,'error','Payroll period is not valid for approval'); end if;
 update public.workforce_payroll_entries set status='approved',approved_by=v_actor,approved_at=now(),updated_at=now() where id=v_entry.id;
 return jsonb_build_object('success',true,'entry_id',v_entry.id,'status','approved');
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

create or replace function public.pay_workforce_payroll_entry(p_tenant_id uuid,p_payroll_entry_id uuid,p_paid_by uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_actor uuid; v_entry record; v_period record; v_advance uuid; begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_paid_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 select * into v_entry from public.workforce_payroll_entries where id=p_payroll_entry_id and tenant_id=p_tenant_id for update; if not found then return jsonb_build_object('success',false,'error','Payroll entry not found'); end if;
 if v_entry.status='paid' then return jsonb_build_object('success',true,'idempotent',true,'entry_id',v_entry.id); end if;
 if v_entry.status<>'approved' then return jsonb_build_object('success',false,'error','Payroll entry must be approved before payment'); end if;
 select * into v_period from public.workforce_payroll_periods where id=v_entry.payroll_period_id and tenant_id=p_tenant_id for update; if not found then return jsonb_build_object('success',false,'error','Payroll period not found'); end if;
 if v_period.status not in ('processing','locked') then return jsonb_build_object('success',false,'error','Payroll period must be processing or locked before payment'); end if;
 update public.workforce_payroll_entries set status='paid',paid_by=v_actor,paid_at=now(),updated_at=now() where id=v_entry.id;
 update public.workforce_advance_installments set status='paid' where tenant_id=p_tenant_id and payroll_entry_id=v_entry.id and status='allocated';
 for v_advance in select distinct advance_id from public.workforce_advance_installments where tenant_id=p_tenant_id and payroll_entry_id=v_entry.id loop
   if not exists(select 1 from public.workforce_advance_installments where tenant_id=p_tenant_id and advance_id=v_advance and status in ('due','allocated')) then update public.workforce_employee_advances set status='fully_repaid',updated_at=now() where id=v_advance and tenant_id=p_tenant_id; else update public.workforce_employee_advances set status='partially_repaid',updated_at=now() where id=v_advance and tenant_id=p_tenant_id; end if;
 end loop;
 update public.workforce_employee_advances a set status='fully_repaid',updated_at=now() where a.tenant_id=p_tenant_id and a.advance_type='short_term' and a.status='active' and a.deduction_payroll_period_id=v_entry.payroll_period_id and exists(select 1 from public.workforce_payroll_deductions d where d.tenant_id=p_tenant_id and d.source_type='employee_advance' and d.source_id=a.id and d.employee_id=v_entry.employee_id and d.payroll_period_id=v_entry.payroll_period_id and d.status='approved');
 return jsonb_build_object('success',true,'entry_id',v_entry.id,'status','paid');
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

revoke all on function public.approve_workforce_payroll_entry(uuid,uuid,uuid) from public;
grant execute on function public.approve_workforce_payroll_entry(uuid,uuid,uuid) to authenticated;
revoke all on function public.pay_workforce_payroll_entry(uuid,uuid,uuid) from public;
grant execute on function public.pay_workforce_payroll_entry(uuid,uuid,uuid) to authenticated;
