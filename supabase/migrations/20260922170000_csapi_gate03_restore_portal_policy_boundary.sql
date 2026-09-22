begin;

create policy clinic_patients_portal_patient_read on public.clinic_patients for select to authenticated using (
  exists (
    select 1 from public.patient_clinic_relationships pcr
    join public.patient_portal_identities ppi on ppi.patient_identity_id=pcr.patient_identity_id
    where pcr.clinic_patient_id=clinic_patients.id
      and pcr.tenant_id=clinic_patients.tenant_id
      and pcr.status='active'
      and ppi.auth_user_id=(select auth.uid())
      and ppi.status='active'
  )
);

create policy patient_file_release_read on public.patient_portal_medical_file_releases for select to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_medical_file_releases.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or exists (select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id where pcr.clinic_patient_id=patient_portal_medical_file_releases.clinic_patient_id and pcr.tenant_id=patient_portal_medical_file_releases.tenant_id and pcr.status='active' and ppi.auth_user_id=(select auth.uid()) and ppi.status='active')
);
create policy patient_file_release_staff_write on public.patient_portal_medical_file_releases for all to authenticated using (exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_medical_file_releases.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)) with check (exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_medical_file_releases.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null));

create policy medical_files_patient_portal_read on public.medical_files for select to authenticated using (
  exists (
    select 1 from public.patient_portal_medical_file_releases r
    join public.patient_portal_identities ppi on ppi.auth_user_id=(select auth.uid())
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id and pcr.clinic_patient_id=r.clinic_patient_id and pcr.tenant_id=r.tenant_id and pcr.status='active'
    where r.medical_file_id=medical_files.id and r.status='active' and (r.expires_at is null or r.expires_at > now())
  )
);

create policy medical_files_patient_portal_storage_select on storage.objects for select to authenticated using (
  bucket_id='medical-files' and exists (
    select 1 from public.medical_files mf
    join public.patient_portal_medical_file_releases r on r.medical_file_id=mf.id and r.status='active' and (r.expires_at is null or r.expires_at > now())
    join public.patient_portal_identities ppi on ppi.auth_user_id=(select auth.uid())
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id and pcr.clinic_patient_id=r.clinic_patient_id and pcr.tenant_id=r.tenant_id and pcr.status='active'
    where mf.storage_path=storage.objects.name and mf.tenant_id=r.tenant_id
  )
);

create policy master_agenda_events_patient_portal_read on public.master_agenda_events for select to authenticated using (
  exists (
    select 1 from public.patient_portal_identities ppi
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id and pcr.tenant_id=master_agenda_events.tenant_id and pcr.clinic_patient_id=master_agenda_events.patient_id and pcr.status='active'
    where ppi.auth_user_id=(select auth.uid()) and ppi.status='active'
  )
);

create policy patient_messages_read on public.patient_portal_messages for select to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_messages.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or exists (select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id and pcr.clinic_patient_id=patient_portal_messages.clinic_patient_id and pcr.tenant_id=patient_portal_messages.tenant_id and pcr.status='active' where ppi.auth_user_id=(select auth.uid()) and ppi.status='active')
);
create policy patient_messages_patient_insert on public.patient_portal_messages for insert to authenticated with check (
  sender_type='patient' and sender_auth_user_id=(select auth.uid()) and exists (
    select 1 from public.patient_portal_identities ppi
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id and pcr.clinic_patient_id=patient_portal_messages.clinic_patient_id and pcr.tenant_id=patient_portal_messages.tenant_id and pcr.status='active'
    where ppi.auth_user_id=(select auth.uid()) and ppi.status='active'
  )
);
create policy patient_messages_clinic_insert on public.patient_portal_messages for insert to authenticated with check (sender_type='clinic' and exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_messages.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null));

create policy tenant_entitlements_scoped_read on public.tenant_entitlements for select to authenticated using (
 exists (select 1 from public.clinic_users cu where cu.tenant_id=tenant_entitlements.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
 or exists (select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id where pcr.tenant_id=tenant_entitlements.tenant_id and pcr.status='active' and ppi.auth_user_id=(select auth.uid()) and ppi.status='active')
);

create policy communications_conversations_read on public.communication_conversations for select to authenticated using (
  tenant_id=public.get_current_tenant_id() and (
    has_tenant_permission(tenant_id,'communications:manage')
    or (exists(select 1 from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=communication_conversations.tenant_id and cu.is_active=true and cu.deleted_at is null) and has_tenant_permission(tenant_id,'communications:read'))
    or exists(select 1 from public.communication_conversation_participants cp where cp.tenant_id=communication_conversations.tenant_id and cp.conversation_id=communication_conversations.id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_conversations.tenant_id limit 1))
    or (kind='patient' and exists(select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id where ppi.auth_user_id=auth.uid() and ppi.status='active' and pcr.tenant_id=communication_conversations.tenant_id and pcr.clinic_patient_id=communication_conversations.clinic_patient_id and pcr.status='active' and pcr.deleted_at is null))
  )
);
create policy communications_messages_read on public.communication_messages for select to authenticated using (
  tenant_id=public.get_current_tenant_id() and (
    has_tenant_permission(tenant_id,'communications:manage')
    or (message_kind='message' and has_tenant_permission(tenant_id,'communications:read') and exists(select 1 from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=communication_messages.tenant_id and cu.is_active=true and cu.deleted_at is null))
    or exists(select 1 from public.communication_conversation_participants cp where cp.tenant_id=communication_messages.tenant_id and cp.conversation_id=communication_messages.conversation_id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_messages.tenant_id limit 1))
    or (message_kind='message' and exists(select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id join public.communication_conversations cc on cc.tenant_id=pcr.tenant_id and cc.clinic_patient_id=pcr.clinic_patient_id and cc.id=communication_messages.conversation_id where ppi.auth_user_id=auth.uid() and ppi.status='active' and pcr.tenant_id=communication_messages.tenant_id and pcr.status='active' and pcr.deleted_at is null))
  )
);
create policy communications_patient_conversations_read on public.communication_conversations for select to authenticated using (
  tenant_id=public.get_current_tenant_id() and kind='patient' and exists (
    select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id
    where ppi.auth_user_id=auth.uid() and ppi.status='active' and pcr.tenant_id=communication_conversations.tenant_id
      and pcr.clinic_patient_id=communication_conversations.clinic_patient_id and pcr.status='active' and pcr.deleted_at is null
  )
);
create policy communications_patient_conversations_insert on public.communication_conversations for insert to authenticated with check (
  tenant_id=public.get_current_tenant_id() and kind='patient' and status='open' and exists (
    select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id
    where ppi.auth_user_id=auth.uid() and ppi.status='active' and pcr.tenant_id=communication_conversations.tenant_id
      and pcr.clinic_patient_id=communication_conversations.clinic_patient_id and pcr.status='active' and pcr.deleted_at is null
  )
);
create policy communications_patient_messages_read on public.communication_messages for select to authenticated using (
  tenant_id=public.get_current_tenant_id() and message_kind='message' and exists (
    select 1 from public.patient_portal_identities ppi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=ppi.patient_identity_id
    where ppi.auth_user_id=auth.uid() and ppi.status='active' and pcr.tenant_id=communication_messages.tenant_id
      and pcr.clinic_patient_id=(select clinic_patient_id from public.communication_conversations cc where cc.id=communication_messages.conversation_id and cc.tenant_id=communication_messages.tenant_id)
      and pcr.status='active' and pcr.deleted_at is null
  )
);
create policy communications_patient_messages_insert on public.communication_messages for insert to authenticated with check (
  tenant_id=public.get_current_tenant_id() and sender_type='patient' and sender_clinic_user_id is null and message_kind='message'
  and sender_patient_identity_id=(select patient_identity_id from public.patient_portal_identities where auth_user_id=auth.uid() and status='active' limit 1)
  and exists (
    select 1 from public.communication_conversations cc join public.patient_clinic_relationships pcr on pcr.tenant_id=cc.tenant_id and pcr.clinic_patient_id=cc.clinic_patient_id
    where cc.id=communication_messages.conversation_id and cc.tenant_id=communication_messages.tenant_id and cc.kind='patient'
      and pcr.patient_identity_id=communication_messages.sender_patient_identity_id and pcr.status='active' and pcr.deleted_at is null
  )
);
create policy communications_message_attachments_delete on public.communication_message_attachments for delete to authenticated using (
  tenant_id=public.get_current_tenant_id() and (
    public.has_tenant_permission(tenant_id,'communications:manage')
    or uploaded_by_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_message_attachments.tenant_id limit 1)
    or uploaded_by_patient_identity_id=(select patient_identity_id from public.patient_portal_identities where auth_user_id=auth.uid() and status='active' limit 1)
  )
);
create policy communications_message_attachments_select on public.communication_message_attachments for select to authenticated using (
  tenant_id=public.get_current_tenant_id() and (
    public.has_tenant_permission(tenant_id,'communications:manage')
    or exists (
      select 1 from public.communication_conversation_participants cp
      join public.communication_messages cm on cm.tenant_id=cp.tenant_id and cm.id=communication_message_attachments.message_id and cm.conversation_id=cp.conversation_id
      where cp.tenant_id=communication_message_attachments.tenant_id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_message_attachments.tenant_id limit 1)
    )
    or exists (
      select 1 from public.communication_messages cm
      join public.communication_conversations cc on cc.tenant_id=cm.tenant_id and cc.id=cm.conversation_id
      join public.patient_clinic_relationships pcr on pcr.tenant_id=cc.tenant_id and pcr.clinic_patient_id=cc.clinic_patient_id
      join public.patient_portal_identities ppi on ppi.patient_identity_id=pcr.patient_identity_id
      where cm.tenant_id=communication_message_attachments.tenant_id and cm.id=communication_message_attachments.message_id and cm.message_kind='message'
        and pcr.status='active' and ppi.auth_user_id=auth.uid() and ppi.status='active'
    )
  )
);
create policy communications_message_attachments_insert on public.communication_message_attachments for insert to authenticated with check (
  tenant_id=public.get_current_tenant_id() and (
    (uploaded_by_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_message_attachments.tenant_id and is_active=true and deleted_at is null limit 1)
      and uploaded_by_patient_identity_id is null and public.has_tenant_permission(tenant_id,'communications:send')
      and exists(select 1 from public.communication_messages cm where cm.tenant_id=communication_message_attachments.tenant_id and cm.id=communication_message_attachments.message_id))
    or
    (uploaded_by_clinic_user_id is null
      and uploaded_by_patient_identity_id=(select patient_identity_id from public.patient_portal_identities where auth_user_id=auth.uid() and status='active' limit 1)
      and exists(select 1 from public.communication_messages cm join public.communication_conversations cc on cc.tenant_id=cm.tenant_id and cc.id=cm.conversation_id join public.patient_clinic_relationships pcr on pcr.tenant_id=cc.tenant_id and pcr.clinic_patient_id=cc.clinic_patient_id where cm.tenant_id=communication_message_attachments.tenant_id and cm.id=communication_message_attachments.message_id and cm.message_kind='message' and cc.kind='patient' and pcr.patient_identity_id=uploaded_by_patient_identity_id and pcr.status='active'))
  )
);
create policy communications_storage_select on storage.objects for select to authenticated using (
  bucket_id='communications'
  and exists(select 1 from public.communication_message_attachments a where a.storage_bucket='communications' and a.storage_path=storage.objects.name)
  and (
    public.has_tenant_permission(public.get_current_tenant_id(),'communications:manage')
    or exists(select 1 from public.communication_message_attachments a join public.communication_messages m on m.tenant_id=a.tenant_id and m.id=a.message_id join public.communication_conversation_participants cp on cp.tenant_id=m.tenant_id and cp.conversation_id=m.conversation_id where a.storage_bucket='communications' and a.storage_path=storage.objects.name and a.tenant_id=public.get_current_tenant_id() and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=a.tenant_id limit 1))
    or exists(select 1 from public.communication_message_attachments a join public.communication_messages m on m.tenant_id=a.tenant_id and m.id=a.message_id join public.communication_conversations c on c.tenant_id=m.tenant_id and c.id=m.conversation_id join public.patient_clinic_relationships pcr on pcr.tenant_id=c.tenant_id and pcr.clinic_patient_id=c.clinic_patient_id join public.patient_portal_identities ppi on ppi.patient_identity_id=pcr.patient_identity_id where a.storage_bucket='communications' and a.storage_path=storage.objects.name and ppi.auth_user_id=auth.uid() and ppi.status='active' and pcr.status='active')
  )
);

commit;
