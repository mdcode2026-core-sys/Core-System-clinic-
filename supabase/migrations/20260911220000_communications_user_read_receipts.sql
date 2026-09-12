-- Communications read-state correction.
-- Communications is a tenant-wide domain surface; read state is personal per clinic user.
-- Do not use communication_messages.read_at for internal user read state because one message
-- can be unread for one participant and read for another.

create table if not exists public.communication_message_reads (
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  message_id uuid not null references public.communication_messages(id) on delete cascade,
  clinic_user_id uuid not null references public.clinic_users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (tenant_id, message_id, clinic_user_id)
);

create index if not exists communication_message_reads_user_idx
  on public.communication_message_reads(tenant_id, clinic_user_id, read_at desc);

alter table public.communication_message_reads enable row level security;

drop policy if exists communication_message_reads_select on public.communication_message_reads;
create policy communication_message_reads_select
on public.communication_message_reads
for select to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and clinic_user_id = (
    select id from public.clinic_users
    where auth_user_id = auth.uid()
      and tenant_id = communication_message_reads.tenant_id
    limit 1
  )
);

drop policy if exists communication_message_reads_insert on public.communication_message_reads;
create policy communication_message_reads_insert
on public.communication_message_reads
for insert to authenticated
with check (
  tenant_id = public.get_current_tenant_id()
  and clinic_user_id = (
    select id from public.clinic_users
    where auth_user_id = auth.uid()
      and tenant_id = communication_message_reads.tenant_id
      and is_active = true
      and deleted_at is null
    limit 1
  )
  and exists (
    select 1
    from public.communication_conversation_participants cp
    join public.communication_messages cm
      on cm.tenant_id = cp.tenant_id
     and cm.conversation_id = cp.conversation_id
    where cp.tenant_id = communication_message_reads.tenant_id
      and cp.clinic_user_id = communication_message_reads.clinic_user_id
      and cm.id = communication_message_reads.message_id
  )
);

drop policy if exists communication_message_reads_update on public.communication_message_reads;
create policy communication_message_reads_update
on public.communication_message_reads
for update to authenticated
using (
  tenant_id = public.get_current_tenant_id()
  and clinic_user_id = (
    select id from public.clinic_users
    where auth_user_id = auth.uid()
      and tenant_id = communication_message_reads.tenant_id
    limit 1
  )
)
with check (
  tenant_id = public.get_current_tenant_id()
  and clinic_user_id = (
    select id from public.clinic_users
    where auth_user_id = auth.uid()
      and tenant_id = communication_message_reads.tenant_id
    limit 1
  )
);

-- The legacy communication_messages.read_at column is intentionally retained for
-- backward compatibility. It is not authoritative for internal user read state.
-- The authoritative contract is communication_message_reads.
