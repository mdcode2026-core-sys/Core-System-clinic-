alter table public.communication_messages add column if not exists legacy_portal_message_id uuid;
create unique index if not exists communication_messages_legacy_portal_idx on public.communication_messages(legacy_portal_message_id) where legacy_portal_message_id is not null;
insert into public.communication_conversations (tenant_id, kind, subject, clinic_patient_id, created_by, status, created_at, updated_at)
select p.tenant_id, 'patient', 'Patient communication', p.clinic_patient_id, case when p.sender_type='clinic' then cu.id else null end, 'open', min(p.created_at), max(p.created_at)
from public.patient_portal_messages p
left join public.clinic_users cu on cu.tenant_id=p.tenant_id and cu.auth_user_id=p.sender_auth_user_id and p.sender_type='clinic'
where p.deleted_at is null
  and not exists (select 1 from public.communication_conversations c where c.tenant_id=p.tenant_id and c.clinic_patient_id=p.clinic_patient_id and c.kind='patient' and c.status <> 'archived')
group by p.tenant_id,p.clinic_patient_id,p.sender_type,cu.id;
insert into public.communication_messages (tenant_id, conversation_id, sender_clinic_user_id, sender_type, sender_patient_identity_id, body, message_kind, created_at, legacy_portal_message_id)
select p.tenant_id, c.id, case when p.sender_type='clinic' then cu.id else null end, p.sender_type, case when p.sender_type='patient' then pi.id else null end, p.body, 'message', p.created_at, p.id
from public.patient_portal_messages p
join public.communication_conversations c on c.tenant_id=p.tenant_id and c.clinic_patient_id=p.clinic_patient_id and c.kind='patient' and c.status <> 'archived'
left join public.clinic_users cu on cu.tenant_id=p.tenant_id and cu.auth_user_id=p.sender_auth_user_id and p.sender_type='clinic'
left join public.patient_identities pi on pi.auth_user_id=p.sender_auth_user_id and p.sender_type='patient'
where p.deleted_at is null and not exists (select 1 from public.communication_messages m where m.legacy_portal_message_id=p.id);
