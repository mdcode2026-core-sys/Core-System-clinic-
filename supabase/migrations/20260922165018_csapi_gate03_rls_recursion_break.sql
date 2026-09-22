begin;

create schema if not exists private;

create or replace function private.current_patient_identity_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select ppi.patient_identity_id
  from public.patient_portal_identities ppi
  where ppi.auth_user_id = (select auth.uid())
    and ppi.status = 'active'
  limit 1
$$;

create or replace function private.patient_portal_can_access_clinic_patient(
  p_tenant_id uuid,
  p_clinic_patient_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.patient_clinic_relationships pcr
    join public.patient_portal_identities ppi
      on ppi.patient_identity_id = pcr.patient_identity_id
    where pcr.tenant_id = p_tenant_id
      and pcr.clinic_patient_id = p_clinic_patient_id
      and pcr.status = 'active'
      and ppi.auth_user_id = (select auth.uid())
      and ppi.status = 'active'
  )
$$;

create or replace function private.staff_can_access_patient_identity(
  p_patient_identity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.patient_clinic_relationships pcr
    join public.clinic_users cu
      on cu.tenant_id = pcr.tenant_id
    where pcr.patient_identity_id = p_patient_identity_id
      and pcr.status = 'active'
      and cu.auth_user_id = (select auth.uid())
      and cu.is_active = true
      and cu.deleted_at is null
  )
$$;

revoke execute on function private.current_patient_identity_id() from public, anon;
revoke execute on function private.patient_portal_can_access_clinic_patient(uuid, uuid) from public, anon;
revoke execute on function private.staff_can_access_patient_identity(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.current_patient_identity_id() to authenticated;
grant execute on function private.patient_portal_can_access_clinic_patient(uuid, uuid) to authenticated;
grant execute on function private.staff_can_access_patient_identity(uuid) to authenticated;

drop policy if exists clinic_patients_portal_patient_read on public.clinic_patients;
create policy clinic_patients_portal_patient_read
  on public.clinic_patients
  for select
  to authenticated
  using ((select private.patient_portal_can_access_clinic_patient(tenant_id, id)));

drop policy if exists master_agenda_events_patient_portal_read on public.master_agenda_events;
create policy master_agenda_events_patient_portal_read
  on public.master_agenda_events
  for select
  to authenticated
  using ((select private.patient_portal_can_access_clinic_patient(tenant_id, patient_id)));

drop policy if exists patient_relationship_portal_self_read on public.patient_clinic_relationships;
create policy patient_relationship_portal_self_read
  on public.patient_clinic_relationships
  for select
  to authenticated
  using (patient_identity_id = (select private.current_patient_identity_id()));

drop policy if exists patient_portal_identity_staff_read on public.patient_portal_identities;
create policy patient_portal_identity_staff_read
  on public.patient_portal_identities
  for select
  to authenticated
  using ((select private.staff_can_access_patient_identity(patient_identity_id)));

commit;
