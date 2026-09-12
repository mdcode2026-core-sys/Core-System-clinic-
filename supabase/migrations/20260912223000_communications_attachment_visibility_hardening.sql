-- Attachment visibility follows the owning Communication message.
-- Clinic users may access attachments on patient-visible messages and internal notes they can access.
-- Patients may access only attachments on patient-visible messages in their own active relationship.

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
      and exists(select 1 from public.communication_messages cm where cm.tenant_id=communication_message_attachments.tenant_id and cm.id=communication_message_attachments.message_id)
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
        and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=a.tenant_id limit 1)
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
