-- AJM-3 Workforce & Operations foundation.
-- Workforce is independent from Team & Access and Agenda; it supplies employment, staffing and capacity inputs without creating a second appointment engine.

insert into public.permissions(permission_key,permission_name,description,resource,action) values
('workforce:read','View Workforce','View staff and workforce operations','workforce','read'),
('workforce:manage','Manage Workforce','Manage staff, employment and workforce operations','workforce','manage'),
('workforce:attendance','Manage Attendance','Record and manage attendance','workforce','attendance'),
('workforce:leave','Manage Leave','Manage leave types, balances and requests','workforce','leave'),
('workforce:payroll','Manage Payroll','Manage payroll periods and payroll inputs','workforce','payroll'),
('workforce:commission','Manage Commissions','Manage commission rules and entries','workforce','commission'),
('workforce:recruitment','Manage Recruitment','Manage clinic-sized recruitment workflow','workforce','recruitment')
on conflict(permission_key) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.role_key in ('clinic_admin','accounting') and p.permission_key in ('workforce:read','workforce:manage','workforce:attendance','workforce:leave','workforce:payroll','workforce:commission','workforce:recruitment') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.permissions p cross join public.roles r
where r.role_key in ('doctor','nurse','receptionist') and p.permission_key='workforce:read' on conflict do nothing;

create table if not exists public.workforce_positions(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 name text not null, name_ar text, department text, employment_type text not null default 'full_time' check(employment_type in ('full_time','part_time','contract','temporary','intern')),
 status text not null default 'active' check(status in ('active','inactive','closed')), default_capacity numeric(10,2) not null default 1 check(default_capacity>=0),
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_employees(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 user_id uuid references public.clinic_users(id) on delete set null, position_id uuid references public.workforce_positions(id) on delete set null,
 employee_number text, first_name text not null, last_name text not null, first_name_ar text, last_name_ar text,
 phone text, email text, status text not null default 'active' check(status in ('active','inactive','terminated','on_leave')),
 manager_employee_id uuid references public.workforce_employees(id) on delete set null,
 hire_date date, termination_date date, notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id, employee_number));

create table if not exists public.workforce_employment_records(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 employee_id uuid not null references public.workforce_employees(id) on delete cascade, position_id uuid references public.workforce_positions(id) on delete set null,
 effective_from date not null, effective_to date, employment_type text not null default 'full_time' check(employment_type in ('full_time','part_time','contract','temporary','intern')),
 base_salary_subunits integer not null default 0 check(base_salary_subunits>=0), currency text not null default 'JOD', working_hours_per_week numeric(6,2) not null default 40 check(working_hours_per_week>=0),
 status text not null default 'active' check(status in ('draft','active','ended')), notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_staff_schedules(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 employee_id uuid not null references public.workforce_employees(id) on delete cascade, day_of_week smallint not null check(day_of_week between 0 and 6),
 starts_at time not null, ends_at time not null, capacity_units numeric(8,2) not null default 1 check(capacity_units>=0), effective_from date, effective_to date, status text not null default 'active' check(status in ('active','inactive')),
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends_at>starts_at));

create table if not exists public.workforce_attendance(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 employee_id uuid not null references public.workforce_employees(id) on delete cascade, attendance_date date not null, check_in timestamptz, check_out timestamptz,
 status text not null default 'present' check(status in ('present','absent','late','remote','partial','holiday','leave')), overtime_minutes integer not null default 0 check(overtime_minutes>=0), notes text,
 recorded_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tenant_id,employee_id,attendance_date));

create table if not exists public.workforce_leave_types(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 name text not null, name_ar text, annual_entitlement_days numeric(8,2) not null default 0 check(annual_entitlement_days>=0), carry_forward_days numeric(8,2) not null default 0 check(carry_forward_days>=0), paid boolean not null default true, status text not null default 'active' check(status in ('active','inactive')),
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_leave_requests(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 employee_id uuid not null references public.workforce_employees(id) on delete cascade, leave_type_id uuid not null references public.workforce_leave_types(id) on delete restrict,
 starts_on date not null, ends_on date not null, days numeric(8,2) not null check(days>0), reason text, status text not null default 'pending' check(status in ('pending','approved','rejected','cancelled')),
 approved_by uuid references public.clinic_users(id) on delete set null, approved_at timestamptz, created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends_on>=starts_on));

create table if not exists public.workforce_payroll_periods(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 period_start date not null, period_end date not null, status text not null default 'open' check(status in ('open','processing','locked','paid','cancelled')), currency text not null default 'JOD', locked_at timestamptz, locked_by uuid references public.clinic_users(id) on delete set null,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tenant_id,period_start,period_end), check(period_end>=period_start));

create table if not exists public.workforce_payroll_entries(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 payroll_period_id uuid not null references public.workforce_payroll_periods(id) on delete cascade, employee_id uuid not null references public.workforce_employees(id) on delete restrict,
 base_salary_subunits integer not null default 0 check(base_salary_subunits>=0), allowances_subunits integer not null default 0 check(allowances_subunits>=0), overtime_subunits integer not null default 0 check(overtime_subunits>=0), bonuses_subunits integer not null default 0 check(bonuses_subunits>=0), commissions_subunits integer not null default 0 check(commissions_subunits>=0), deductions_subunits integer not null default 0 check(deductions_subunits>=0), net_subunits integer not null default 0,
 status text not null default 'draft' check(status in ('draft','approved','paid','void')), notes text, created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(payroll_period_id,employee_id));

create table if not exists public.workforce_benefits(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 employee_id uuid not null references public.workforce_employees(id) on delete cascade, benefit_name text not null, benefit_name_ar text, value_subunits integer not null default 0 check(value_subunits>=0), currency text not null default 'JOD', starts_on date, ends_on date, status text not null default 'active' check(status in ('active','inactive','ended')), notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_commission_rules(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 name text not null, basis text not null check(basis in ('collected_revenue','invoice_value','procedure_count','fixed_bonus')), rate numeric(8,4) not null default 0 check(rate>=0), fixed_amount_subunits integer not null default 0 check(fixed_amount_subunits>=0), status text not null default 'active' check(status in ('active','inactive')), notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_commission_entries(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 employee_id uuid not null references public.workforce_employees(id) on delete restrict, commission_rule_id uuid not null references public.workforce_commission_rules(id) on delete restrict,
 source_type text not null, source_id uuid, basis_amount_subunits integer not null default 0 check(basis_amount_subunits>=0), eligible_amount_subunits integer not null default 0 check(eligible_amount_subunits>=0), status text not null default 'draft' check(status in ('draft','approved','paid','void')), calculated_at timestamptz not null default now(), notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_staffing_needs(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 position_id uuid references public.workforce_positions(id) on delete set null, title text not null, needed_from date, needed_to date, quantity numeric(8,2) not null default 1 check(quantity>0), status text not null default 'open' check(status in ('open','in_review','filled','cancelled')), notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.workforce_candidates(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 staffing_need_id uuid references public.workforce_staffing_needs(id) on delete set null, first_name text not null, last_name text not null, phone text, email text, stage text not null default 'candidate' check(stage in ('candidate','screening','evaluation','offer','hired','rejected')), notes text,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create index if not exists workforce_employees_tenant_status_idx on public.workforce_employees(tenant_id,status);
create index if not exists workforce_schedule_tenant_employee_idx on public.workforce_staff_schedules(tenant_id,employee_id);
create index if not exists workforce_attendance_tenant_date_idx on public.workforce_attendance(tenant_id,attendance_date);
create index if not exists workforce_leave_tenant_employee_idx on public.workforce_leave_requests(tenant_id,employee_id,status);
create index if not exists workforce_payroll_tenant_period_idx on public.workforce_payroll_periods(tenant_id,period_start,period_end);
create index if not exists workforce_commission_tenant_employee_idx on public.workforce_commission_entries(tenant_id,employee_id,status);

-- RLS: every workforce record is tenant scoped and server-authorized through the existing permission engine.
DO $$ declare t text; begin
  foreach t in array array['workforce_positions','workforce_employees','workforce_employment_records','workforce_staff_schedules','workforce_attendance','workforce_leave_types','workforce_leave_requests','workforce_payroll_periods','workforce_payroll_entries','workforce_benefits','workforce_commission_rules','workforce_commission_entries','workforce_staffing_needs','workforce_candidates'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('drop policy if exists workforce_read on public.%I',t);
    execute format('drop policy if exists workforce_manage on public.%I',t);
    execute format('create policy workforce_read on public.%I for select to authenticated using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,''workforce:read'') or public.has_tenant_permission(tenant_id,''workforce:manage'')))',t);
    execute format('create policy workforce_manage on public.%I for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,''workforce:manage'')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,''workforce:manage''))',t);
  end loop;
end $$;

-- More specific permission policies where the operation is intentionally narrower.
drop policy if exists workforce_attendance on public.workforce_attendance;
create policy workforce_attendance on public.workforce_attendance for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:attendance')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:attendance'));
drop policy if exists workforce_leave on public.workforce_leave_requests;
create policy workforce_leave on public.workforce_leave_requests for all to authenticated using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'workforce:leave') or public.has_tenant_permission(tenant_id,'workforce:manage'))) with check (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'workforce:leave') or public.has_tenant_permission(tenant_id,'workforce:manage')));
drop policy if exists workforce_payroll on public.workforce_payroll_periods;
create policy workforce_payroll on public.workforce_payroll_periods for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:payroll')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:payroll'));
drop policy if exists workforce_payroll_entries on public.workforce_payroll_entries;
create policy workforce_payroll_entries on public.workforce_payroll_entries for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:payroll')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:payroll'));
drop policy if exists workforce_commission on public.workforce_commission_entries;
create policy workforce_commission on public.workforce_commission_entries for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:commission')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'workforce:commission'));
