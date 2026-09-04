create table public.workforce_procedure_capabilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  workforce_employee_id uuid not null,
  procedure_id uuid not null,
  enabled_by uuid not null,
  enabled_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint workforce_procedure_capabilities_tenant_id_fkey
    foreign key (tenant_id) references public.master_tenants(id),
  constraint workforce_procedure_capabilities_employee_same_tenant_fk
    foreign key (tenant_id, workforce_employee_id)
    references public.workforce_employees(tenant_id, id),
  constraint workforce_procedure_capabilities_procedure_id_fkey
    foreign key (procedure_id) references public.clinic_procedures(id),
  constraint workforce_procedure_capabilities_enabled_by_fkey
    foreign key (enabled_by) references public.clinic_users(id),
  constraint workforce_procedure_capabilities_unique
    unique (tenant_id, workforce_employee_id, procedure_id)
);

create index workforce_procedure_capabilities_procedure_idx
  on public.workforce_procedure_capabilities (tenant_id, procedure_id)
  where deleted_at is null;

create index workforce_procedure_capabilities_lookup_idx
  on public.workforce_procedure_capabilities (tenant_id, procedure_id, workforce_employee_id)
  where deleted_at is null;

alter table public.workforce_procedure_capabilities enable row level security;

revoke all on table public.workforce_procedure_capabilities from anon, authenticated;
grant select, insert, update, delete on table public.workforce_procedure_capabilities to authenticated;

create policy workforce_procedure_capabilities_read
  on public.workforce_procedure_capabilities
  for select
  to authenticated
  using (
    tenant_id = get_current_tenant_id()
    and (
      has_tenant_permission(tenant_id, 'workforce:manage')
      or has_tenant_permission(tenant_id, 'agenda:create')
    )
  );

create policy workforce_procedure_capabilities_insert
  on public.workforce_procedure_capabilities
  for insert
  to authenticated
  with check (
    tenant_id = get_current_tenant_id()
    and has_tenant_permission(tenant_id, 'workforce:manage')
    and exists (
      select 1 from public.clinic_users cu
      where cu.id = enabled_by
        and cu.tenant_id = tenant_id
    )
    and exists (
      select 1 from public.clinic_procedures cp
      where cp.id = procedure_id
        and cp.tenant_id = tenant_id
        and cp.deleted_at is null
    )
    and exists (
      select 1 from public.workforce_employees we
      where we.id = workforce_employee_id
        and we.tenant_id = tenant_id
    )
  );

create policy workforce_procedure_capabilities_update
  on public.workforce_procedure_capabilities
  for update
  to authenticated
  using (
    tenant_id = get_current_tenant_id()
    and has_tenant_permission(tenant_id, 'workforce:manage')
  )
  with check (
    tenant_id = get_current_tenant_id()
    and has_tenant_permission(tenant_id, 'workforce:manage')
    and exists (
      select 1 from public.clinic_users cu
      where cu.id = enabled_by
        and cu.tenant_id = tenant_id
    )
    and exists (
      select 1 from public.clinic_procedures cp
      where cp.id = procedure_id
        and cp.tenant_id = tenant_id
        and cp.deleted_at is null
    )
    and exists (
      select 1 from public.workforce_employees we
      where we.id = workforce_employee_id
        and we.tenant_id = tenant_id
    )
  );

create policy workforce_procedure_capabilities_delete
  on public.workforce_procedure_capabilities
  for delete
  to authenticated
  using (
    tenant_id = get_current_tenant_id()
    and has_tenant_permission(tenant_id, 'workforce:manage')
  );
