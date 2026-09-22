begin;

do $$
declare
  p record;
  v_identity_id uuid;
  v_phone text;
  v_email text;
begin
  for p in
    select id, tenant_id, first_name, last_name, date_of_birth, gender, phone_primary, email
    from public.clinic_patients
    where deleted_at is null
  loop
    if exists (
      select 1 from public.patient_clinic_relationships pcr
      where pcr.clinic_patient_id=p.id
    ) then
      continue;
    end if;

    v_phone := regexp_replace(coalesce(p.phone_primary,''), '[^0-9]+', '', 'g');
    v_email := nullif(lower(trim(coalesce(p.email,''))), '');

    insert into public.patient_identities(
      first_name_normalized,
      father_name_normalized,
      family_name_normalized,
      mother_name_normalized,
      date_of_birth,
      gender,
      phone_normalized,
      email_normalized,
      phone,
      email,
      status,
      identity_state
    ) values (
      lower(regexp_replace(trim(coalesce(p.first_name,'')), '\s+', ' ', 'g')),
      null,
      lower(regexp_replace(trim(coalesce(p.last_name,'')), '\s+', ' ', 'g')),
      null,
      p.date_of_birth,
      p.gender,
      v_phone,
      v_email,
      p.phone_primary,
      p.email,
      'active',
      'active'
    ) returning id into v_identity_id;

    insert into public.patient_clinic_relationships(
      patient_identity_id, clinic_patient_id, tenant_id, status
    ) values (
      v_identity_id, p.id, p.tenant_id, 'active'
    );

    insert into public.patient_portal_identities(
      patient_identity_id, status
    ) values (
      v_identity_id, 'unclaimed'
    ) on conflict (patient_identity_id) do nothing;
  end loop;
end $$;

commit;
