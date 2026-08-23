drop policy if exists clinic_patients_portal_patient_read on public.clinic_patients;
create policy clinic_patients_portal_patient_read on public.clinic_patients for select to authenticated using (
  exists (
    select 1
    from public.patient_clinic_relationships pcr
    join public.patient_identities pi on pi.id = pcr.patient_identity_id
    where pcr.clinic_patient_id = clinic_patients.id
      and pcr.tenant_id = clinic_patients.tenant_id
      and pcr.status = 'active'
      and pi.auth_user_id = (select auth.uid())
      and pi.status = 'active'
  )
);
