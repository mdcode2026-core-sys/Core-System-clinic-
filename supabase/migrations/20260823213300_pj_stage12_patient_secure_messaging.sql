create table if not exists public.patient_portal_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  clinic_patient_id uuid not null references public.clinic_patients(id) on delete cascade,
  sender_type text not null check (sender_type in ('patient','clinic')),
  sender_auth_user_id uuid references auth.users(id) on delete set null,
  body text not null check (length(trim(body)) between 1 and 10000),
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists idx_patient_messages_relationship on public.patient_portal_messages(tenant_id,clinic_patient_id,created_at desc);
alter table public.patient_portal_messages enable row level security;
drop policy if exists patient_messages_read on public.patient_portal_messages;
create policy patient_messages_read on public.patient_portal_messages for select to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_messages.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or exists (select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id and pcr.clinic_patient_id=patient_portal_messages.clinic_patient_id and pcr.tenant_id=patient_portal_messages.tenant_id and pcr.status='active' where pi.auth_user_id=(select auth.uid()) and pi.status='active')
);
drop policy if exists patient_messages_patient_insert on public.patient_portal_messages;
create policy patient_messages_patient_insert on public.patient_portal_messages for insert to authenticated with check (
  sender_type='patient' and sender_auth_user_id=(select auth.uid()) and exists (select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id and pcr.clinic_patient_id=patient_portal_messages.clinic_patient_id and pcr.tenant_id=patient_portal_messages.tenant_id and pcr.status='active' where pi.auth_user_id=(select auth.uid()) and pi.status='active')
);
drop policy if exists patient_messages_clinic_insert on public.patient_portal_messages;
create policy patient_messages_clinic_insert on public.patient_portal_messages for insert to authenticated with check (sender_type='clinic' and exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_messages.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null));
grant select,insert on public.patient_portal_messages to authenticated;
