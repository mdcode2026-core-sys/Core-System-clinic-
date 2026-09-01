-- Procedure -> required resource mapping for Scenarios 10-11.
create table if not exists public.clinic_procedure_resources(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 procedure_id uuid not null references public.clinic_procedures(id) on delete cascade,
 resource_id uuid not null references public.clinic_resources(id) on delete restrict,
 required boolean not null default true,
 created_at timestamptz not null default now(),
 unique(tenant_id,procedure_id,resource_id));
alter table public.clinic_procedure_resources enable row level security;
create policy clinic_procedure_resources_isolation on public.clinic_procedure_resources for all to authenticated using(tenant_id=public.get_current_tenant_id()) with check(tenant_id=public.get_current_tenant_id());
create index if not exists clinic_procedure_resources_proc_idx on public.clinic_procedure_resources(tenant_id,procedure_id);
grant select,insert,update,delete on public.clinic_procedure_resources to authenticated,service_role;
