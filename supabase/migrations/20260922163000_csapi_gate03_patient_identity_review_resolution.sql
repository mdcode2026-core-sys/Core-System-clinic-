begin;

create or replace function public.resolve_patient_identity_match(
  p_tenant_id uuid,
  p_candidate_identity_id uuid,
  p_decision text,
  p_registration jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_patient uuid;
  v_identity uuid;
  v_first text := nullif(trim(p_registration->>'first_name'),'');
  v_father text := nullif(trim(p_registration->>'father_name'),'');
  v_family text := nullif(trim(p_registration->>'family_name'),'');
  v_mother text := nullif(trim(p_registration->>'mother_name'),'');
  v_phone text := nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),'');
  v_email text := nullif(lower(trim(p_registration->>'email')),'');
  v_dob date := nullif(p_registration->>'date_of_birth','')::date;
  v_gender text := lower(nullif(trim(p_registration->>'gender'),''));
  v_age integer := nullif(p_registration->>'age_at_registration','')::integer;
  v_age_ref date := coalesce(nullif(p_registration->>'age_reference_date','')::date,current_date);
begin
  if v_user is null or not exists(select 1 from public.clinic_users cu where cu.tenant_id=p_tenant_id and cu.auth_user_id=v_user and cu.is_active=true and cu.deleted_at is null) then
    return jsonb_build_object('success',false,'error','UNAUTHORIZED');
  end if;
  if p_decision not in ('LINK_EXISTING','CREATE_NEW') or v_first is null or v_father is null or v_family is null or v_phone is null or v_gender is null or (v_dob is null and v_age is null) then
    return jsonb_build_object('success',false,'error','PATIENT_INVALID_REQUEST');
  end if;

  if p_decision='LINK_EXISTING' then
    select id into v_identity from public.patient_identities where id=p_candidate_identity_id and identity_state='active';
    if v_identity is null then return jsonb_build_object('success',false,'error','PATIENT_MATCH_NOT_FOUND'); end if;

    select pcr.clinic_patient_id into v_patient
    from public.patient_clinic_relationships pcr
    where pcr.patient_identity_id=v_identity and pcr.tenant_id=p_tenant_id and pcr.deleted_at is null
    limit 1;

    if v_patient is null then
      insert into public.clinic_patients(tenant_id,first_name,last_name,father_name,family_name,mother_name,national_id,phone_primary,email,date_of_birth,age_at_registration,age_reference_date,gender,patient_status)
      values(p_tenant_id,v_first,v_family,v_father,v_family,v_mother,nullif(trim(p_registration->>'national_id'),''),v_phone,v_email,v_dob,v_age,v_age_ref,v_gender,'active')
      returning id into v_patient;
      insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status) values(v_identity,v_patient,p_tenant_id,'active');
    end if;

    insert into public.patient_identity_match_audit(tenant_id,patient_identity_id,outcome,policy_version,score,candidate_count,evidence,actor_user_id)
    values(p_tenant_id,v_identity,'EXACT_MATCH','patient-match-v2-human-reviewed',80,1,jsonb_build_object('decision','LINK_EXISTING'),v_user);

    insert into public.patient_portal_identities(patient_identity_id,status) values(v_identity,'unclaimed') on conflict(patient_identity_id) do nothing;
    return jsonb_build_object('success',true,'outcome','EXACT_MATCH','patient_id',v_patient,'patient_identity_id',v_identity,'human_reviewed',true);
  end if;

  insert into public.patient_identities(first_name_normalized,father_name_normalized,family_name_normalized,mother_name_normalized,date_of_birth,gender,phone_normalized,email_normalized,phone,email,status,identity_state)
  values(lower(v_first),lower(v_father),lower(v_family),lower(v_mother),v_dob,v_gender,v_phone,v_email,v_phone,v_email,'active','active')
  returning id into v_identity;

  insert into public.clinic_patients(tenant_id,first_name,last_name,father_name,family_name,mother_name,national_id,phone_primary,email,date_of_birth,age_at_registration,age_reference_date,gender,patient_status)
  values(p_tenant_id,v_first,v_family,v_father,v_family,v_mother,nullif(trim(p_registration->>'national_id'),''),v_phone,v_email,v_dob,v_age,v_age_ref,v_gender,'active')
  returning id into v_patient;

  insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status) values(v_identity,v_patient,p_tenant_id,'active');
  insert into public.patient_portal_identities(patient_identity_id,status) values(v_identity,'unclaimed') on conflict(patient_identity_id) do nothing;
  insert into public.patient_identity_match_audit(tenant_id,patient_identity_id,outcome,policy_version,score,candidate_count,evidence,actor_user_id)
  values(p_tenant_id,v_identity,'NO_MATCH','patient-match-v2-human-reviewed',0,1,jsonb_build_object('decision','CREATE_NEW','overrode_candidate',p_candidate_identity_id),v_user);

  return jsonb_build_object('success',true,'outcome','NO_MATCH','patient_id',v_patient,'patient_identity_id',v_identity,'human_reviewed',true);
end;
$$;

revoke all on function public.resolve_patient_identity_match(uuid,uuid,text,jsonb) from public, anon;
grant execute on function public.resolve_patient_identity_match(uuid,uuid,text,jsonb) to authenticated;

commit;
