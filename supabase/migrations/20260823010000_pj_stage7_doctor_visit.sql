-- PJ Stage 7 — Doctor Visit
-- Visit remains the independent clinical encounter. Treatment Plan is intentionally not required.

alter table public.clinic_visit_sessions
  add column if not exists examination jsonb,
  add column if not exists findings jsonb,
  add column if not exists decision jsonb;

create table if not exists public.clinic_visit_procedures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  visit_id uuid not null references public.clinic_visit_sessions(id) on delete cascade,
  procedure_id uuid not null references public.clinic_procedures(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  notes text,
  performed_at timestamptz,
  created_by uuid not null references public.clinic_users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (visit_id, procedure_id)
);

create index if not exists clinic_visit_procedures_visit_idx
  on public.clinic_visit_procedures(tenant_id, visit_id);

create index if not exists clinic_visit_sessions_clinical_idx
  on public.clinic_visit_sessions(tenant_id, session_status, doctor_id);

insert into public.permissions (permission_key, permission_name, description, resource, action)
values
  ('visits:read', 'Read Visits', 'View clinical visit records', 'visits', 'read'),
  ('visits:update', 'Update Visits', 'Record and update clinical visit data', 'visits', 'update')
on conflict (permission_key) do nothing;

-- Effective permission resolver for database-side RLS. Role rows are templates;
-- user overrides are authoritative for the individual user.
create or replace function public.has_effective_permission(p_permission_key text, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with u as (
    select cu.id, cu.tenant_id, cu.role_template_id
    from public.clinic_users cu
    where cu.id = p_user_id
      and cu.deleted_at is null
      and cu.is_active = true
    limit 1
  ), base as (
    select p.permission_key
    from u
    join public.role_permissions rp on rp.role_id = u.role_template_id
    join public.permissions p on p.id = rp.permission_id
    where p.permission_key = p_permission_key
  ), override as (
    select o.granted
    from u
    join public.clinic_user_permission_overrides o
      on o.user_id = u.id and o.tenant_id = u.tenant_id
    join public.permissions p on p.id = o.permission_id
    where p.permission_key = p_permission_key
    order by o.updated_at desc
    limit 1
  )
  select coalesce((select granted from override), exists(select 1 from base));
$$;

revoke all on function public.has_effective_permission(text, uuid) from public;
grant execute on function public.has_effective_permission(text, uuid) to authenticated;

-- Replace role-name-based Visit RLS with tenant + effective permission checks.
drop policy if exists rls_sessions_select on public.clinic_visit_sessions;
drop policy if exists rls_sessions_update on public.clinic_visit_sessions;
drop policy if exists rls_sessions_write_role_check on public.clinic_visit_sessions;

create policy rls_sessions_select on public.clinic_visit_sessions
for select to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:read')
);

create policy rls_sessions_update on public.clinic_visit_sessions
for update to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:update')
)
with check (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:update')
);

create policy rls_sessions_write_permission on public.clinic_visit_sessions
for insert to authenticated
with check (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('sessions:create')
);

alter table public.clinic_visit_procedures enable row level security;

drop policy if exists clinic_visit_procedures_select on public.clinic_visit_procedures;
drop policy if exists clinic_visit_procedures_insert on public.clinic_visit_procedures;
drop policy if exists clinic_visit_procedures_update on public.clinic_visit_procedures;
drop policy if exists clinic_visit_procedures_delete on public.clinic_visit_procedures;

create policy clinic_visit_procedures_select on public.clinic_visit_procedures
for select to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:read')
);

create policy clinic_visit_procedures_insert on public.clinic_visit_procedures
for insert to authenticated
with check (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:update')
);

create policy clinic_visit_procedures_update on public.clinic_visit_procedures
for update to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:update')
)
with check (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:update')
);

create policy clinic_visit_procedures_delete on public.clinic_visit_procedures
for delete to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and public.has_effective_permission('visits:update')
);
