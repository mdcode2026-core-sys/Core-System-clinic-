-- AJM-4 Communications foundation.
-- Reuse existing Patient Portal messages and notification queue; add only the missing internal conversation/request primitives.

insert into public.permissions(permission_key,permission_name,description,resource,action) values
('communications:read','View Communications','View authorized clinic communications and history','communications','read'),
('communications:send','Send Communications','Send authorized internal and patient communications','communications','send'),
('communications:manage','Manage Communications','Manage communication settings, templates and operational communication records','communications','manage'),
('communications:request','Create Communication Requests','Create operational requests from communication context','communications','request')
on conflict(permission_key) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.role_key in ('clinic_admin','doctor','nurse','receptionist','accounting')
  and p.permission_key in ('communications:read','communications:send') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.role_key='clinic_admin'
  and p.permission_key in ('communications:manage','communications:request') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.role_key in ('doctor','nurse','receptionist','accounting')
  and p.permission_key='communications:request' on conflict do nothing;

create table if not exists public.communication_conversations(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 kind text not null default 'internal' check(kind in ('internal','patient')),
 subject text,
 clinic_patient_id uuid references public.clinic_patients(id) on delete set null,
 created_by uuid references public.clinic_users(id) on delete set null,
 status text not null default 'open' check(status in ('open','closed','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,id));

create table if not exists public.communication_conversation_participants(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 conversation_id uuid not null, clinic_user_id uuid not null,
 role text not null default 'participant' check(role in ('participant','owner','observer')),
 created_at timestamptz not null default now(),
 unique(tenant_id,conversation_id,clinic_user_id),
 foreign key (tenant_id,conversation_id) references public.communication_conversations(tenant_id,id) on delete cascade,
 foreign key (tenant_id,clinic_user_id) references public.clinic_users(tenant_id,id) on delete cascade);

create table if not exists public.communication_messages(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 conversation_id uuid not null, sender_clinic_user_id uuid not null,
 body text not null, message_kind text not null default 'message' check(message_kind in ('message','internal_note')),
 related_type text, related_id uuid, created_at timestamptz not null default now(), read_at timestamptz,
 foreign key (tenant_id,conversation_id) references public.communication_conversations(tenant_id,id) on delete cascade,
 foreign key (tenant_id,sender_clinic_user_id) references public.clinic_users(tenant_id,id) on delete restrict);

create table if not exists public.communication_requests(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 conversation_id uuid, requester_clinic_user_id uuid not null, assignee_clinic_user_id uuid,
 clinic_patient_id uuid references public.clinic_patients(id) on delete set null,
 related_type text, related_id uuid,
 category text not null default 'general', priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 title text not null, details text, status text not null default 'open' check(status in ('open','accepted','in_progress','completed','rejected','cancelled')),
 outcome text, due_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,id),
 foreign key (tenant_id,conversation_id) references public.communication_conversations(tenant_id,id) on delete set null,
 foreign key (tenant_id,requester_clinic_user_id) references public.clinic_users(tenant_id,id) on delete restrict,
 foreign key (tenant_id,assignee_clinic_user_id) references public.clinic_users(tenant_id,id) on delete set null);

create table if not exists public.communication_templates(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 event_type text not null, channel text not null check(channel in ('portal','in_app','email','sms','whatsapp')),
 locale text not null default 'en' check(locale in ('en','ar')),
 name text not null, subject text, body text not null, variables jsonb not null default '[]'::jsonb,
 is_active boolean not null default true, version integer not null default 1 check(version>0), created_by uuid references public.clinic_users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,event_type,channel,locale,name,version));

create index if not exists communication_conversations_tenant_status_idx on public.communication_conversations(tenant_id,status,updated_at desc);
create index if not exists communication_messages_tenant_conversation_idx on public.communication_messages(tenant_id,conversation_id,created_at);
create index if not exists communication_requests_tenant_status_idx on public.communication_requests(tenant_id,status,priority,due_at);
create index if not exists communication_templates_tenant_event_idx on public.communication_templates(tenant_id,event_type,channel,locale,is_active);

alter table public.communication_conversations enable row level security;
alter table public.communication_conversation_participants enable row level security;
alter table public.communication_messages enable row level security;
alter table public.communication_requests enable row level security;
alter table public.communication_templates enable row level security;

drop policy if exists communications_conversations_read on public.communication_conversations;
create policy communications_conversations_read on public.communication_conversations for select to authenticated using (
 tenant_id=public.get_current_tenant_id() and (
   public.has_tenant_permission(tenant_id,'communications:manage') or
   exists(select 1 from public.communication_conversation_participants cp where cp.tenant_id=communication_conversations.tenant_id and cp.conversation_id=communication_conversations.id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_conversations.tenant_id limit 1))
 )
);

drop policy if exists communications_conversations_manage on public.communication_conversations;
create policy communications_conversations_manage on public.communication_conversations for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:manage')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:manage'));

drop policy if exists communications_participants_access on public.communication_conversation_participants;
create policy communications_participants_access on public.communication_conversation_participants for all to authenticated using (
 tenant_id=public.get_current_tenant_id() and (
  public.has_tenant_permission(tenant_id,'communications:manage') or
  clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_conversation_participants.tenant_id limit 1)
 )
) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:manage'));

drop policy if exists communications_messages_read on public.communication_messages;
create policy communications_messages_read on public.communication_messages for select to authenticated using (
 tenant_id=public.get_current_tenant_id() and (
  public.has_tenant_permission(tenant_id,'communications:manage') or
  exists(select 1 from public.communication_conversation_participants cp where cp.tenant_id=communication_messages.tenant_id and cp.conversation_id=communication_messages.conversation_id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_messages.tenant_id limit 1))
 )
);

drop policy if exists communications_messages_send on public.communication_messages;
create policy communications_messages_send on public.communication_messages for insert to authenticated with check (
 tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:send') and
 sender_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_messages.tenant_id and is_active=true and deleted_at is null limit 1)
);

drop policy if exists communications_requests_access on public.communication_requests;
create policy communications_requests_access on public.communication_requests for select to authenticated using (
 tenant_id=public.get_current_tenant_id() and (
  public.has_tenant_permission(tenant_id,'communications:manage') or requester_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_requests.tenant_id limit 1) or assignee_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_requests.tenant_id limit 1)
 )
);

drop policy if exists communications_requests_create on public.communication_requests;
create policy communications_requests_create on public.communication_requests for insert to authenticated with check (
 tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:request') and
 requester_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_requests.tenant_id and is_active=true and deleted_at is null limit 1)
);

drop policy if exists communications_requests_manage on public.communication_requests;
create policy communications_requests_manage on public.communication_requests for update using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'communications:manage') or assignee_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_requests.tenant_id limit 1))) with check (tenant_id=public.get_current_tenant_id());

drop policy if exists communications_templates_manage on public.communication_templates;
create policy communications_templates_manage on public.communication_templates for all to authenticated using (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:manage')) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:manage'));
