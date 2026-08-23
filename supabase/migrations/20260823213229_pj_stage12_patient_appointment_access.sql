drop policy if exists master_agenda_events_patient_portal_read on public.master_agenda_events;
create policy master_agenda_events_patient_portal_read on public.master_agenda_events for select to authenticated using (
  exists (
    select 1 from public.patient_identities pi
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id and pcr.tenant_id=master_agenda_events.tenant_id and pcr.clinic_patient_id=master_agenda_events.patient_id and pcr.status='active'
    where pi.auth_user_id=(select auth.uid()) and pi.status='active'
  )
);
create index if not exists idx_agenda_patient_tenant_time on public.master_agenda_events(patient_id,tenant_id,scheduled_start);
