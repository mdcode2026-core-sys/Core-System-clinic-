create table if not exists public.clinic_resources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  resource_name text not null,
  resource_type text not null,
  status text not null default 'active',
  serial_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint clinic_resources_status_check check (status in ('active','maintenance','blocked','retired')),
  constraint clinic_resources_tenant_name_unique unique (tenant_id, resource_name)
);
alter table public.clinic_resources enable row level security;
drop policy if exists clinic_resources_isolation on public.clinic_resources;
create policy clinic_resources_isolation on public.clinic_resources as permissive for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());
alter table public.master_agenda_events add column if not exists resource_id uuid references public.clinic_resources(id) on delete set null;
create index if not exists idx_master_agenda_events_resource_id on public.master_agenda_events(resource_id);
alter table public.master_agenda_events drop constraint if exists no_resource_overlap;
alter table public.master_agenda_events add constraint no_resource_overlap exclude using gist (resource_id with =, tstzrange(scheduled_start, buffer_end) with &&) where (status not in ('cancelled','no_show','completed') and resource_id is not null);
insert into public.clinic_resources (tenant_id,resource_name,resource_type,status,notes) values ('2fa98983-8069-420f-9c27-7c36ef96ef6e','Laser Device — Alexandrite','laser_device','active','Reality-audit fixture: laser procedure resource'),('2fa98983-8069-420f-9c27-7c36ef96ef6e','HydraFacial Device','hydrafacial_device','active','Reality-audit fixture: HydraFacial resource') on conflict (tenant_id,resource_name) do update set status='active',updated_at=now();
