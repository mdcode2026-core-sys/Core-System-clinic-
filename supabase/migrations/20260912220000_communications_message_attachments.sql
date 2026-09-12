-- Communications attachment authority.
-- One private storage bucket + one tenant-scoped metadata table.
-- Attachments belong to communication_messages; Chat and Portal do not own files.

create unique index if not exists communication_messages_tenant_id_id_uidx
  on public.communication_messages(tenant_id, id);

create table if not exists public.communication_message_attachments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  message_id uuid not null,
  storage_bucket text not null default 'communications',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  uploaded_by_clinic_user_id uuid,
  uploaded_by_patient_identity_id uuid,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (storage_bucket, storage_path),
  foreign key (tenant_id, message_id) references public.communication_messages(tenant_id, id) on delete cascade,
  foreign key (tenant_id, uploaded_by_clinic_user_id) references public.clinic_users(tenant_id, id) on delete set null,
  foreign key (uploaded_by_patient_identity_id) references public.patient_identities(id) on delete set null,
  check ((uploaded_by_clinic_user_id is not null) <> (uploaded_by_patient_identity_id is not null))
);

create index if not exists communication_message_attachments_message_idx
  on public.communication_message_attachments(tenant_id, message_id, created_at);
create index if not exists communication_message_attachments_clinic_uploader_idx
  on public.communication_message_attachments(tenant_id, uploaded_by_clinic_user_id, created_at);
create index if not exists communication_message_attachments_patient_uploader_idx
  on public.communication_message_attachments(uploaded_by_patient_identity_id, created_at);

alter table public.communication_message_attachments enable row level security;

drop policy if exists communications_message_attachments_select on public.communication_message_attachments;
create policy communications_message_attachments_select on public.communication_message_attachments
for select to authenticated using (
  tenant_id = public.get_current_tenant_id()
  and (
    public.has_tenant_permission(tenant_id, 'communications:manage')
    or exists (
      select 1 from public.communication_conversation_participants cp
      join public.communication_messages cm on cm.tenant_id=cp.tenant_id and cm.id=communication_message_attachments.message_id and cm.conversation_id=cp.conversation_id
      where cp.tenant_id=communication_message_attachments.tenant_id
        and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_message_attachments.tenant_id limit 1)
        and cm.message_kind='message'
    )
    or exists (
      select 1 from public.communication_messages cm
      join public.communication_conversations cc on cc.tenant_id=cm.tenant_id and cc.id=cm.conversation_id
      join public.patient_clinic_relationships pcr on pcr.tenant_id=cc.tenant_id and pcr.clinic_patient_id=cc.clinic_patient_id
      join public.patient_identities pi on pi.id=pcr.patient_identity_id
      where cm.tenant_id=communication_message_attachments.tenant_id
        and cm.id=communication_message_attachments.message_id
        and cm.message_kind='message'
        and pcr.status='active' and pi.auth_user_id=auth.uid() and pi.status='active'
    )
  )
);

drop policy if exists communications_message_attachments_insert on public.communication_message_attachments;
create policy communications_message_attachments_insert on public.communication_message_attachments
for insert to authenticated with check (
  tenant_id = public.get_current_tenant_id()
  and (
    (
      uploaded_by_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_message_attachments.tenant_id and is_active=true and deleted_at is null limit 1)
      and uploaded_by_patient_identity_id is null
      and public.has_tenant_permission(tenant_id,'communications:send')
      and exists(select 1 from public.communication_messages cm where cm.tenant_id=communication_message_attachments.tenant_id and cm.id=communication_message_attachments.message_id and cm.message_kind='message')
    )
    or
    (
      uploaded_by_clinic_user_id is null
      and uploaded_by_patient_identity_id=(select id from public.patient_identities where auth_user_id=auth.uid() and status='active' limit 1)
      and exists(
        select 1 from public.communication_messages cm
        join public.communication_conversations cc on cc.tenant_id=cm.tenant_id and cc.id=cm.conversation_id
        join public.patient_clinic_relationships pcr on pcr.tenant_id=cc.tenant_id and pcr.clinic_patient_id=cc.clinic_patient_id
        where cm.tenant_id=communication_message_attachments.tenant_id
          and cm.id=communication_message_attachments.message_id
          and cm.message_kind='message' and cc.kind='patient'
          and pcr.patient_identity_id=uploaded_by_patient_identity_id and pcr.status='active'
      )
    )
  )
);

drop policy if exists communications_message_attachments_delete on public.communication_message_attachments;
create policy communications_message_attachments_delete on public.communication_message_attachments
for delete to authenticated using (
  tenant_id=public.get_current_tenant_id()
  and (
    public.has_tenant_permission(tenant_id,'communications:manage')
    or uploaded_by_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_message_attachments.tenant_id limit 1)
    or uploaded_by_patient_identity_id=(select id from public.patient_identities where auth_user_id=auth.uid() and status='active' limit 1)
  )
);

insert into storage.buckets (id,name,public,file_size_limit)
values ('communications','communications',false,26214400)
on conflict (id) do update set public=false, file_size_limit=26214400;

drop policy if exists communications_storage_insert on storage.objects;
create policy communications_storage_insert on storage.objects for insert to authenticated with check (
  bucket_id='communications'
  and (
    (split_part(name,'/',1)=(public.get_current_tenant_id())::text and public.has_tenant_permission(public.get_current_tenant_id(),'communications:send'))
    or exists(
      select 1 from public.communication_message_attachments a
      join public.communication_messages m on m.tenant_id=a.tenant_id and m.id=a.message_id
      join public.communication_conversations c on c.tenant_id=m.tenant_id and c.id=m.conversation_id
      join public.patient_clinic_relationships pcr on pcr.tenant_id=c.tenant_id and pcr.clinic_patient_id=c.clinic_patient_id
      join public.patient_identities pi on pi.id=pcr.patient_identity_id
      where a.storage_bucket='communications' and a.storage_path=storage.objects.name
        and pi.auth_user_id=auth.uid() and pi.status='active' and pcr.status='active'
    )
  )
);

drop policy if exists communications_storage_select on storage.objects;
create policy communications_storage_select on storage.objects for select to authenticated using (
  bucket_id='communications'
  and exists(select 1 from public.communication_message_attachments a where a.storage_bucket='communications' and a.storage_path=storage.objects.name)
  and (
    public.has_tenant_permission(public.get_current_tenant_id(),'communications:manage')
    or exists(
      select 1 from public.communication_message_attachments a
      join public.communication_messages m on m.tenant_id=a.tenant_id and m.id=a.message_id
      join public.communication_conversation_participants cp on cp.tenant_id=m.tenant_id and cp.conversation_id=m.conversation_id
      where a.storage_bucket='communications' and a.storage_path=storage.objects.name and a.tenant_id=public.get_current_tenant_id()
        and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=a.tenant_id limit 1) and m.message_kind='message'
    )
    or exists(
      select 1 from public.communication_message_attachments a
      join public.communication_messages m on m.tenant_id=a.tenant_id and m.id=a.message_id
      join public.communication_conversations c on c.tenant_id=m.tenant_id and c.id=m.conversation_id
      join public.patient_clinic_relationships pcr on pcr.tenant_id=c.tenant_id and pcr.clinic_patient_id=c.clinic_patient_id
      join public.patient_identities pi on pi.id=pcr.patient_identity_id
      where a.storage_bucket='communications' and a.storage_path=storage.objects.name
        and pi.auth_user_id=auth.uid() and pi.status='active' and pcr.status='active' and m.message_kind='message'
    )
  )
);

drop policy if exists communications_storage_delete on storage.objects;
create policy communications_storage_delete on storage.objects for delete to authenticated using (
  bucket_id='communications'
  and (
    public.has_tenant_permission(public.get_current_tenant_id(),'communications:manage')
    or exists(
      select 1 from public.communication_message_attachments a
      where a.storage_bucket='communications' and a.storage_path=storage.objects.name
        and (a.uploaded_by_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=a.tenant_id limit 1)
          or a.uploaded_by_patient_identity_id=(select id from public.patient_identities where auth_user_id=auth.uid() and status='active' limit 1))
    )
  )
);
