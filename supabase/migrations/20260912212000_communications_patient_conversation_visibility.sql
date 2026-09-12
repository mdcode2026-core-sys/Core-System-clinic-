drop policy if exists communications_conversations_read on public.communication_conversations;
create policy communications_conversations_read on public.communication_conversations for select to authenticated using (
  tenant_id = public.get_current_tenant_id()
  and (
    has_tenant_permission(tenant_id, 'communications:manage')
    or (exists (select 1 from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=communication_conversations.tenant_id and cu.is_active=true and cu.deleted_at is null) and has_tenant_permission(tenant_id, 'communications:read'))
    or exists (select 1 from public.communication_conversation_participants cp where cp.tenant_id=communication_conversations.tenant_id and cp.conversation_id=communication_conversations.id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_conversations.tenant_id limit 1))
    or (kind='patient' and exists (select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id where pi.auth_user_id=auth.uid() and pi.status='active' and pcr.tenant_id=communication_conversations.tenant_id and pcr.clinic_patient_id=communication_conversations.clinic_patient_id and pcr.status='active' and pcr.deleted_at is null))
  )
);

drop policy if exists communications_messages_read on public.communication_messages;
create policy communications_messages_read on public.communication_messages for select to authenticated using (
  tenant_id = public.get_current_tenant_id()
  and (
    has_tenant_permission(tenant_id, 'communications:manage')
    or (message_kind='message' and has_tenant_permission(tenant_id, 'communications:read') and exists (select 1 from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=communication_messages.tenant_id and cu.is_active=true and cu.deleted_at is null))
    or exists (select 1 from public.communication_conversation_participants cp where cp.tenant_id=communication_messages.tenant_id and cp.conversation_id=communication_messages.conversation_id and cp.clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_messages.tenant_id limit 1))
    or (message_kind='message' and exists (select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id join public.communication_conversations cc on cc.tenant_id=pcr.tenant_id and cc.clinic_patient_id=pcr.clinic_patient_id and cc.id=communication_messages.conversation_id where pi.auth_user_id=auth.uid() and pi.status='active' and pcr.tenant_id=communication_messages.tenant_id and pcr.status='active' and pcr.deleted_at is null))
  )
);
