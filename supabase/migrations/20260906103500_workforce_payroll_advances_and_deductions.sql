create table if not exists public.workforce_employee_advances (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, employee_id uuid not null references public.workforce_employees(id) on delete restrict,
  advance_type text not null check (advance_type in ('short_term','installment')), amount_subunits integer not null check (amount_subunits > 0), currency text not null,
  disbursed_on date not null default current_date, deduction_payroll_period_id uuid references public.workforce_payroll_periods(id) on delete restrict,
  installment_amount_subunits integer, installment_frequency text, installment_start_date date,
  status text not null default 'draft' check (status in ('draft','approved','disbursed','active','partially_repaid','fully_repaid','cancelled')),
  reason text, approved_by uuid references public.clinic_users(id) on delete set null, approved_at timestamptz, notes text,
  created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint workforce_employee_advances_installment_fields check ((advance_type='short_term' and deduction_payroll_period_id is not null and installment_amount_subunits is null and installment_frequency is null and installment_start_date is null) or (advance_type='installment' and deduction_payroll_period_id is null and installment_amount_subunits is not null and installment_amount_subunits > 0 and installment_frequency is not null and installment_start_date is not null))
);
create table if not exists public.workforce_advance_installments (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, advance_id uuid not null references public.workforce_employee_advances(id) on delete cascade,
  installment_no integer not null check (installment_no > 0), due_date date not null, amount_subunits integer not null check (amount_subunits > 0),
  status text not null default 'due' check (status in ('due','paid','void')), payroll_entry_id uuid references public.workforce_payroll_entries(id) on delete set null, paid_at timestamptz, notes text, created_at timestamptz not null default now(), unique (advance_id, installment_no)
);
create table if not exists public.workforce_payroll_deductions (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, employee_id uuid not null references public.workforce_employees(id) on delete restrict,
  payroll_period_id uuid not null references public.workforce_payroll_periods(id) on delete restrict,
  deduction_type text not null check (deduction_type in ('statutory_tax','statutory_social_security','late_arrival','early_departure','unpaid_absence','unpaid_leave','benefit_contribution','salary_advance','loan_repayment','disciplinary','administrative_adjustment','overpayment_recovery','manual_adjustment')),
  amount_subunits integer not null check (amount_subunits > 0), currency text not null,
  source_type text not null check (source_type in ('country_rule','attendance','leave','benefit','employee_advance','administrative_action','payroll_correction','manual')), source_id uuid, reason text,
  status text not null default 'approved' check (status in ('draft','approved','void')), created_by uuid references public.clinic_users(id) on delete set null, approved_by uuid references public.clinic_users(id) on delete set null, approved_at timestamptz, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_workforce_advances_employee_status on public.workforce_employee_advances(tenant_id,employee_id,status);
create index if not exists idx_workforce_advance_installments_due on public.workforce_advance_installments(tenant_id,due_date,status);
create index if not exists idx_workforce_payroll_deductions_period_employee on public.workforce_payroll_deductions(tenant_id,payroll_period_id,employee_id,status);
alter table public.workforce_employee_advances enable row level security;
alter table public.workforce_advance_installments enable row level security;
alter table public.workforce_payroll_deductions enable row level security;
create policy workforce_employee_advances_tenant_select on public.workforce_employee_advances for select using (tenant_id = public.get_current_tenant_id());
create policy workforce_advance_installments_tenant_select on public.workforce_advance_installments for select using (tenant_id = public.get_current_tenant_id());
create policy workforce_payroll_deductions_tenant_select on public.workforce_payroll_deductions for select using (tenant_id = public.get_current_tenant_id());

create or replace function public.create_workforce_employee_advance(p_tenant_id uuid,p_employee_id uuid,p_advance_type text,p_amount_subunits integer,p_currency text,p_disbursed_on date,p_deduction_payroll_period_id uuid default null,p_installment_amount_subunits integer default null,p_installment_frequency text default null,p_installment_start_date date default null,p_reason text default null,p_created_by uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_actor uuid; v_advance uuid; v_period record; v_remaining integer; v_no integer:=1; v_due date; v_amount integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 if not exists(select 1 from public.workforce_employees where id=p_employee_id and tenant_id=p_tenant_id and status='active') then return jsonb_build_object('success',false,'error','Employee not found or inactive'); end if;
 if p_amount_subunits <= 0 then return jsonb_build_object('success',false,'error','Advance amount must be positive'); end if;
 if p_advance_type='short_term' then
   if p_deduction_payroll_period_id is null then return jsonb_build_object('success',false,'error','Short-term advance requires a payroll period'); end if;
   select * into v_period from public.workforce_payroll_periods where id=p_deduction_payroll_period_id and tenant_id=p_tenant_id;
   if not found or v_period.status not in ('open','processing') then return jsonb_build_object('success',false,'error','Deduction payroll period is not open'); end if;
 elsif p_advance_type='installment' then
   if p_installment_amount_subunits is null or p_installment_amount_subunits <= 0 or p_installment_start_date is null or coalesce(p_installment_frequency,'') <> 'monthly' then return jsonb_build_object('success',false,'error','Installment advance requires monthly installment settings'); end if;
 else return jsonb_build_object('success',false,'error','Invalid advance type'); end if;
 insert into public.workforce_employee_advances(tenant_id,employee_id,advance_type,amount_subunits,currency,disbursed_on,deduction_payroll_period_id,installment_amount_subunits,installment_frequency,installment_start_date,status,reason,approved_by,approved_at,created_by) values(p_tenant_id,p_employee_id,p_advance_type,p_amount_subunits,p_currency,p_disbursed_on,p_deduction_payroll_period_id,p_installment_amount_subunits,p_installment_frequency,p_installment_start_date,'active',p_reason,v_actor,now(),v_actor) returning id into v_advance;
 if p_advance_type='installment' then
   v_remaining:=p_amount_subunits; v_due:=p_installment_start_date;
   while v_remaining > 0 loop v_amount:=least(v_remaining,p_installment_amount_subunits); insert into public.workforce_advance_installments(tenant_id,advance_id,installment_no,due_date,amount_subunits) values(p_tenant_id,v_advance,v_no,v_due,v_amount); v_remaining:=v_remaining-v_amount; v_no:=v_no+1; v_due:=(v_due + interval '1 month')::date; end loop;
 else
   insert into public.workforce_payroll_deductions(tenant_id,employee_id,payroll_period_id,deduction_type,amount_subunits,currency,source_type,source_id,reason,status,created_by,approved_by,approved_at) values(p_tenant_id,p_employee_id,p_deduction_payroll_period_id,'salary_advance',p_amount_subunits,p_currency,'employee_advance',v_advance,coalesce(p_reason,'Short-term employee advance'),'approved',v_actor,v_actor,now());
 end if;
 return jsonb_build_object('success',true,'advance_id',v_advance);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;
revoke all on function public.create_workforce_employee_advance(uuid,uuid,text,integer,text,date,uuid,integer,text,date,text,uuid) from anon;
grant execute on function public.create_workforce_employee_advance(uuid,uuid,text,integer,text,date,uuid,integer,text,date,text,uuid) to authenticated;

create or replace function public.create_workforce_payroll_deduction(p_tenant_id uuid,p_employee_id uuid,p_payroll_period_id uuid,p_deduction_type text,p_amount_subunits integer,p_currency text,p_source_type text,p_source_id uuid default null,p_reason text default null,p_created_by uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_actor uuid; v_id uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id or not public.has_tenant_permission(p_tenant_id,'workforce:payroll') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 v_actor:=coalesce(p_created_by,auth.uid()); if v_actor is null or not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Actor does not belong to tenant'); end if;
 if not exists(select 1 from public.workforce_employees where id=p_employee_id and tenant_id=p_tenant_id and status='active') then return jsonb_build_object('success',false,'error','Employee not found or inactive'); end if;
 if not exists(select 1 from public.workforce_payroll_periods where id=p_payroll_period_id and tenant_id=p_tenant_id and status in ('open','processing')) then return jsonb_build_object('success',false,'error','Payroll period is not open'); end if;
 if p_amount_subunits <= 0 then return jsonb_build_object('success',false,'error','Deduction amount must be positive'); end if;
 insert into public.workforce_payroll_deductions(tenant_id,employee_id,payroll_period_id,deduction_type,amount_subunits,currency,source_type,source_id,reason,status,created_by,approved_by,approved_at) values(p_tenant_id,p_employee_id,p_payroll_period_id,p_deduction_type,p_amount_subunits,p_currency,p_source_type,p_source_id,p_reason,'approved',v_actor,v_actor,now()) returning id into v_id;
 return jsonb_build_object('success',true,'deduction_id',v_id);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;
revoke all on function public.create_workforce_payroll_deduction(uuid,uuid,uuid,text,integer,text,text,uuid,text,uuid) from anon;
grant execute on function public.create_workforce_payroll_deduction(uuid,uuid,uuid,text,integer,text,text,uuid,text,uuid) to authenticated;
