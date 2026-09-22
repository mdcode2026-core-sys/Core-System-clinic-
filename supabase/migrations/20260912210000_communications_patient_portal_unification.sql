-- Unify basic Patient Portal communication with the authoritative Communications domain.
alter table public.communication_messages alter column sender_clinic_user_id drop not null;
alter table public.communication_messages add column if not exists sender_type text not null default 'clinic';
alter table public.communication_messages add column if not exists sender_patient_identity_id uuid references public.patient_identities(id) on delete set null;
create index if not exists communication_messages_patient_sender_idx on public.communication_messages(tenant_id, sender_patient_identity_id, created_at);
create index if not exists communication_conversations_patient_idx on public.communication_conversations(tenant_id, clinic_patient_id, created_at desc);
create unique index if not exists communication_one_patient_conversation_idx on public.communication_conversations(tenant_id, clinic_patient_id) where kind = 'patient' and clinic_patient_id is not null and status <> 'archived';
alter table public.communication_messages drop constraint if exists communication_messages_sender_same_tenant_fk;
alter table public.communication_messages add constraint communication_messages_sender_type_ck check (sender_type in ('clinic','patient'));
alter table public.communication_messages add constraint communication_messages_sender_identity_ck check ((sender_type='clinic' and sender_clinic_user_id is not null and sender_patient_identity_id is null) or (sender_type='patient' and sender_clinic_user_id is null and sender_patient_identity_id is not null));

drop policy if exists communications_patient_messages_read on public.communication_messages;
create policy communications_patient_messages_read on public.communication_messages for select to authenticated using (
  tenant_id = public.get_current_tenant_id() and message_kind = 'message' and exists (
    select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id = pi.id
    where pi.auth_user_id = auth.uid() and pi.status = 'active' and pcr.tenant_id = communication_messages.tenant_id
      and pcr.clinic_patient_id = (select clinic_patient_id from public.communication_conversations cc where cc.id = communication_messages.conversation_id and cc.tenant_id = communication_messages.tenant_id)
      and pcr.status = 'active' and pcr.deleted_at is null
  )
);

drop policy if exists communications_patient_conversations_read on public.communication_conversations;
create policy communications_patient_conversations_read on public.communication_conversations for select to authenticated using (
  tenant_id = public.get_current_tenant_id() and kind = 'patient' and exists (
    select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id = pi.id
    where pi.auth_user_id = auth.uid() and pi.status = 'active' and pcr.tenant_id = communication_conversations.tenant_id
      and pcr.clinic_patient_id = communication_conversations.clinic_patient_id and pcr.status = 'active' and pcr.deleted_at is null
  )
);

drop policy if exists communications_patient_conversations_insert on public.communication_conversations;
create policy communications_patient_conversations_insert on public.communication_conversations for insert to authenticated with check (
  tenant_id = public.get_current_tenant_id() and kind = 'patient' and status = 'open' and exists (
    select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id = pi.id
    where pi.auth_user_id = auth.uid() and pi.status = 'active' and pcr.tenant_id = communication_conversations.tenant_id
      and pcr.clinic_patient_id = communication_conversations.clinic_patient_id and pcr.status = 'active' and pcr.deleted_at is null
  )
);

drop policy if exists communications_patient_messages_insert on public.communication_messages;
create policy communications_patient_messages_insert on public.communication_messages for insert to authenticated with check (
  tenant_id = public.get_current_tenant_id() and sender_type = 'patient' and sender_clinic_user_id is null and message_kind = 'message'
  and sender_patient_identity_id = (select id from public.patient_identities where auth_user_id = auth.uid() and status = 'active' limit 1)
  and exists (
    select 1 from public.communication_conversations cc join public.patient_clinic_relationships pcr on pcr.tenant_id = cc.tenant_id and pcr.clinic_patient_id = cc.clinic_patient_id
    where cc.id = communication_messages.conversation_id and cc.tenant_id = communication_messages.tenant_id and cc.kind='patient'
      and pcr.patient_identity_id = communication_messages.sender_patient_identity_id and pcr.status='active' and pcr.deleted_at is null
  )
);
