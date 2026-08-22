-- PJ Stage 8 — Treatment Plan
-- Treatment Plan is a patient-specific longitudinal plan. Visit remains independent.

create table if not exists public.clinic_treatment_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  patient_id uuid not null references public.clinic_patients(id) on delete restrict,
  source_visit_id uuid references public.clinic_visit_sessions(id) on delete set null,
  title text not null,
  diagnosis_summary text,
  goals text,
  status text not null default 'draft' check (status in ('draft','active','on_hold','completed','cancelled')),
  start_date date,
  target_end_date date,
  completed_at timestamptz,
  created_by uuid not null references public.clinic_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinic_treatment_plan_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  treatment_plan_id uuid not null references public.clinic_treatment_plans(id) on delete cascade,
  procedure_id uuid references public.clinic_procedures(id) on delete restrict,
  title text not null,
  description text,
  sequence_no integer not null default 1 check (sequence_no > 0),
  planned_date date,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'planned' check (status in ('planned','scheduled','in_progress','completed','skipped','cancelled')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (treatment_plan_id, sequence_no)
);

create table if not exists public.clinic_treatment_plan_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  treatment_plan_id uuid not null references public.clinic_treatment_plans(id) on delete cascade,
  visit_id uuid not null references public.clinic_visit_sessions(id) on delete restrict,
  linked_at timestamptz not null default now(),
  linked_by uuid not null references public.clinic_users(id) on delete restrict,
  unique (treatment_plan_id, visit_id)
);

create index if not exists clinic_treatment_plans_patient_idx on public.clinic_treatment_plans(tenant_id, patient_id, status);
create index if not exists clinic_treatment_plan_items_plan_idx on public.clinic_treatment_plan_items(tenant_id, treatment_plan_id, sequence_no);
create index if not exists clinic_treatment_plan_visits_plan_idx on public.clinic_treatment_plan_visits(tenant_id, treatment_plan_id);
create index if not exists clinic_treatment_plan_visits_visit_idx on public.clinic_treatment_plan_visits(tenant_id, visit_id);

insert into public.permissions (permission_key, permission_name, description, resource, action)
values
 ('treatment_plans:read', 'Read Treatment Plans', 'View patient treatment plans and planned activities', 'treatment_plans', 'read'),
 ('treatment_plans:create', 'Create Treatment Plans', 'Create patient-specific treatment plans', 'treatment_plans', 'create'),
 ('treatment_plans:update', 'Update Treatment Plans', 'Update treatment plans and activities', 'treatment_plans', 'update')
on conflict (permission_key) do nothing;

alter table public.clinic_treatment_plans enable row level security;
alter table public.clinic_treatment_plan_items enable row level security;
alter table public.clinic_treatment_plan_visits enable row level security;

create policy clinic_treatment_plans_select on public.clinic_treatment_plans for select to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:read'));
create policy clinic_treatment_plans_insert on public.clinic_treatment_plans for insert to authenticated with check (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:create'));
create policy clinic_treatment_plans_update on public.clinic_treatment_plans for update to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update')) with check (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update'));

create policy clinic_treatment_plan_items_select on public.clinic_treatment_plan_items for select to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:read'));
create policy clinic_treatment_plan_items_insert on public.clinic_treatment_plan_items for insert to authenticated with check (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update'));
create policy clinic_treatment_plan_items_update on public.clinic_treatment_plan_items for update to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update')) with check (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update'));
create policy clinic_treatment_plan_items_delete on public.clinic_treatment_plan_items for delete to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update'));

create policy clinic_treatment_plan_visits_select on public.clinic_treatment_plan_visits for select to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:read'));
create policy clinic_treatment_plan_visits_insert on public.clinic_treatment_plan_visits for insert to authenticated with check (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update'));
create policy clinic_treatment_plan_visits_delete on public.clinic_treatment_plan_visits for delete to authenticated using (tenant_id = public.get_current_tenant_id() and public.has_effective_permission('treatment_plans:update'));
