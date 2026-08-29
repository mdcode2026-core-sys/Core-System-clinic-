-- AJM-5 Journey Coordination foundation.
-- One general operational work model; it references domain records without owning their lifecycles.

insert into public.permissions(permission_key,permission_name,description,resource,action) values
('work:read','View Operational Work','View authorized operational work','coordination','read'),
('work:create','Create Operational Work','Create tasks, requests, handoffs and next actions','coordination','create'),
('work:manage','Manage Operational Work','Manage assignments, status and escalations','coordination','manage'),
('work:assign','Assign Operational Work','Assign work to authorized clinic users','coordination','assign')
on conflict(permission_key) do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.role_key in ('clinic_admin','doctor','nurse','receptionist','accounting') and p.permission_key in ('work:read','work:create') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.role_key='clinic_admin' and p.permission_key in ('work:manage','work:assign') on conflict do nothing;

create table if not exists public.operational_work_items(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 kind text not null default 'task' check(kind in ('task','request','handoff','next_action','escalation')),
 title text not null, details text, status text not null default 'open' check(status in ('open','accepted','in_progress','blocked','completed','rejected','cancelled')),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 requester_clinic_user_id uuid references public.clinic_users(id) on delete set null,
 assignee_clinic_user_id uuid references public.clinic_users(id) on delete set null,
 patient_id uuid references public.clinic_patients(id) on delete set null,
 source_type text, source_id uuid,
 due_at timestamptz, completed_at timestamptz, outcome text,
 parent_work_item_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,id),
 foreign key (tenant_id,requester_clinic_user_id) references public.clinic_users(tenant_id,id) on delete set null,
 foreign key (tenant_id,assignee_clinic_user_id) references public.clinic_users(tenant_id,id) on delete set null,
 foreign key (tenant_id,patient_id) references public.clinic_patients(tenant_id,id) on delete set null,
 foreign key (tenant_id,parent_work_item_id) references public.operational_work_items(tenant_id,id) on delete set null);

create table if not exists public.operational_work_history(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 work_item_id uuid not null, actor_clinic_user_id uuid, from_status text, to_status text, note text,
 created_at timestamptz not null default now(),
 foreign key (tenant_id,work_item_id) references public.operational_work_items(tenant_id,id) on delete cascade,
 foreign key (tenant_id,actor_clinic_user_id) references public.clinic_users(tenant_id,id) on delete set null);

create index if not exists operational_work_items_tenant_status_idx on public.operational_work_items(tenant_id,status,priority,due_at);
create index if not exists operational_work_items_tenant_assignee_idx on public.operational_work_items(tenant_id,assignee_clinic_user_id,status);
create index if not exists operational_work_history_tenant_work_idx on public.operational_work_history(tenant_id,work_item_id,created_at);

alter table public.operational_work_items enable row level security;
alter table public.operational_work_history enable row level security;

drop policy if exists work_items_read on public.operational_work_items;
create policy work_items_read on public.operational_work_items for select to authenticated using (
 tenant_id=public.get_current_tenant_id() and (
  public.has_tenant_permission(tenant_id,'work:manage') or requester_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_items.tenant_id limit 1) or assignee_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_items.tenant_id limit 1)
 )
);

drop policy if exists work_items_create on public.operational_work_items;
create policy work_items_create on public.operational_work_items for insert to authenticated with check (
 tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'work:create') and requester_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_items.tenant_id and is_active=true and deleted_at is null limit 1)
);

drop policy if exists work_items_manage on public.operational_work_items;
create policy work_items_manage on public.operational_work_items for update to authenticated using (
 tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'work:manage') or assignee_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_items.tenant_id limit 1))
) with check (tenant_id=public.get_current_tenant_id());

drop policy if exists work_history_read on public.operational_work_history;
create policy work_history_read on public.operational_work_history for select to authenticated using (
 tenant_id=public.get_current_tenant_id() and exists(select 1 from public.operational_work_items w where w.tenant_id=operational_work_history.tenant_id and w.id=operational_work_history.work_item_id and (public.has_tenant_permission(tenant_id,'work:manage') or w.requester_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_history.tenant_id limit 1) or w.assignee_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_history.tenant_id limit 1)))
);
