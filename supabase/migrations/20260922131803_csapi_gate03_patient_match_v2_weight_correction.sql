begin;
create or replace function public.register_patient_identity(
  p_tenant_id uuid,
  p_registration jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_first text := nullif(trim(p_registration->>'first_name'),'');
  v_father text := nullif(trim(p_registration->>'father_name'),'');
  v_family text := nullif(trim(p_registration->>'family_name'),'');
  v_mother text := nullif(trim(p_registration->>'mother_name'),'');
  v_phone text := nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''), '[^0-9]+','','g'),'');
  v_email text := nullif(lower(trim(p_registration->>'email')),'');
  v_dob date := nullif(p_registration->>'date_of_birth','')::date;
  v_gender text := nullif(lower(trim(p_registration->>'gender')),'');
  v_age integer := nullif(p_registration->>'age_at_registration','')::integer;
  v_age_ref date := coalesce(nullif(p_registration->>'age_reference_date','')::date, current_date);
  v_national text := nullif(regexp_replace(coalesce(p_registration->>'national_id',''), '[^0-9A-Za-z]+','','g'),'');
  v_identity uuid;
  v_patient uuid;
  v_score integer;
  v_candidates integer;
  v_best jsonb := null;
  v_best_score integer := -1;
  r record;
begin
  if v_user is null then
    return jsonb_build_object('success',false,'error','AUTH_REQUIRED');
  end if;

  if not exists (
    select 1 from public.clinic_users cu
    where cu.tenant_id=p_tenant_id and cu.auth_user_id=v_user and cu.is_active=true and cu.deleted_at is null
  ) then
    return jsonb_build_object('success',false,'error','UNAUTHORIZED');
  end if;

  if v_first is null or v_father is null or v_family is null or v_phone is null or v_gender is null or (v_dob is null and v_age is null) then
    return jsonb_build_object('success',false,'error','PATIENT_INVALID_REQUEST');
  end if;

  select count(*) into v_candidates
  from public.patient_identities pi
  where pi.identity_state='active'
    and (
      (v_national is not null and exists (
        select 1 from public.patient_identity_identifiers pii
        where pii.patient_identity_id=pi.id
          and pii.identifier_type='national_id'
          and pii.value_hash=digest(v_national,'sha256')
      ))
      or (v_dob is not null and pi.date_of_birth=v_dob)
      or (pi.phone_normalized=v_phone)
      or (pi.email_normalized=v_email and v_email is not null)
      or pi.first_name_normalized=lower(v_first)
      or pi.family_name_normalized=lower(v_family)
    );

  for r in
    select pi.*
    from public.patient_identities pi
    where pi.identity_state='active'
      and (
        (v_national is not null and exists (
          select 1 from public.patient_identity_identifiers pii
          where pii.patient_identity_id=pi.id
            and pii.identifier_type='national_id'
            and pii.value_hash=digest(v_national,'sha256')
        ))
        or (v_dob is not null and pi.date_of_birth=v_dob)
        or (pi.phone_normalized=v_phone)
        or (pi.email_normalized=v_email and v_email is not null)
        or pi.first_name_normalized=lower(v_first)
        or pi.family_name_normalized=lower(v_family)
      )
  loop
    v_score := 0;
    if v_national is not null and exists (select 1 from public.patient_identity_identifiers pii where pii.patient_identity_id=r.id and pii.identifier_type='national_id' and pii.value_hash=digest(v_national,'sha256')) then v_score := v_score + 18; end if;
    if v_dob is not null and r.date_of_birth=v_dob then v_score := v_score + 25; end if;
    if lower(coalesce(r.father_name_normalized,''))=lower(v_father) then v_score := v_score + 18; end if;
    if lower(coalesce(r.family_name_normalized,''))=lower(v_family) then v_score := v_score + 15; end if;
    if lower(coalesce(r.first_name_normalized,''))=lower(v_first) then v_score := v_score + 10; end if;
    if v_mother is not null and lower(coalesce(r.mother_name_normalized,''))=lower(v_mother) then v_score := v_score + 5; end if;
    if lower(coalesce(r.gender,''))=v_gender then v_score := v_score + 4; end if;
    if v_phone is not null and r.phone_normalized=v_phone then v_score := v_score + 2; end if;
    if v_email is not null and r.email_normalized=v_email then v_score := v_score + 1; end if;
    if v_dob is null and v_age is not null and r.date_of_birth is not null and extract(year from age(v_age_ref,r.date_of_birth)) between v_age-1 and v_age+1 then v_score := v_score + 8; end if;

    if v_score > v_best_score then
      v_best_score := v_score;
      v_best := jsonb_build_object('patient_identity_id',r.id,'score',v_score,'first_name',r.first_name_normalized,'family_name',r.family_name_normalized,'date_of_birth',r.date_of_birth,'gender',r.gender,'phone_last4',right(coalesce(r.phone,''),4));
    end if;
  end loop;

  if v_best_score >= 80 and v_best is not null then
    v_identity := (v_best->>'patient_identity_id')::uuid;
    if not exists (select 1 from public.patient_clinic_relationships where patient_identity_id=v_identity and tenant_id=p_tenant_id and deleted_at is null) then
      insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status)
      select v_identity,id,p_tenant_id,'active' from public.clinic_patients where tenant_id=p_tenant_id and deleted_at is null and false;
    end if;
    select pcr.clinic_patient_id into v_patient from public.patient_clinic_relationships pcr where pcr.patient_identity_id=v_identity and pcr.tenant_id=p_tenant_id and pcr.deleted_at is null limit 1;
    if v_patient is null then
      insert into public.clinic_patients(tenant_id,first_name,last_name,father_name,family_name,mother_name,national_id,phone_primary,email,date_of_birth,age_at_registration,age_reference_date,gender,patient_status)
      values(p_tenant_id,v_first,v_family,v_father,v_family,v_mother,v_national,v_phone,v_email,v_dob,v_age,v_age_ref,v_gender,'active')
      returning id into v_patient;
      insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status) values(v_identity,v_patient,p_tenant_id,'active');
    end if;
    insert into public.patient_identity_match_audit(tenant_id,patient_identity_id,outcome,policy_version,score,candidate_count,evidence,actor_user_id)
    values(p_tenant_id,v_identity,'EXACT_MATCH','patient-match-v2',v_best_score,v_candidates,v_best,v_user);
    insert into public.patient_portal_identities(patient_identity_id,status) values(v_identity,'unclaimed') on conflict(patient_identity_id) do nothing;
    return jsonb_build_object('success',true,'outcome','EXACT_MATCH','patient_id',v_patient,'patient_identity_id',v_identity,'score',v_best_score);
  end if;

  if v_best_score >= 55 and v_best is not null then
    insert into public.patient_identity_match_audit(tenant_id,outcome,policy_version,score,candidate_count,evidence,actor_user_id)
    values(p_tenant_id,'REVIEW_REQUIRED','patient-match-v2',v_best_score,v_candidates,v_best,v_user);
    return jsonb_build_object('success',false,'outcome','REVIEW_REQUIRED','score',v_best_score,'candidate',v_best);
  end if;

  insert into public.patient_identities(first_name_normalized,father_name_normalized,family_name_normalized,mother_name_normalized,date_of_birth,gender,phone_normalized,email_normalized,phone,email,status,identity_state)
  values(lower(v_first),lower(v_father),lower(v_family),lower(v_mother),v_dob,v_gender,v_phone,v_email,v_phone,v_email,'active','active')
  returning id into v_identity;

  insert into public.clinic_patients(tenant_id,first_name,last_name,father_name,family_name,mother_name,national_id,phone_primary,email,date_of_birth,age_at_registration,age_reference_date,gender,patient_status)
  values(p_tenant_id,v_first,v_family,v_father,v_family,v_mother,v_national,v_phone,v_email,v_dob,v_age,v_age_ref,v_gender,'active')
  returning id into v_patient;

  insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status)
  values(v_identity,v_patient,p_tenant_id,'active');

  if v_national is not null then
    insert into public.patient_identity_identifiers(patient_identity_id,identifier_type,value_hash,value_last4)
    values(v_identity,'national_id',digest(v_national,'sha256'),right(v_national,4))
    on conflict do nothing;
  end if;

  insert into public.patient_portal_identities(patient_identity_id,status)
  values(v_identity,'unclaimed')
  on conflict(patient_identity_id) do nothing;

  insert into public.patient_identity_match_audit(tenant_id,patient_identity_id,outcome,policy_version,score,candidate_count,evidence,actor_user_id)
  values(p_tenant_id,v_identity,'NO_MATCH','patient-match-v2',greatest(v_best_score,0),v_candidates,coalesce(v_best,'{}'::jsonb),v_user);

  return jsonb_build_object('success',true,'outcome','NO_MATCH','patient_id',v_patient,'patient_identity_id',v_identity,'score',greatest(v_best_score,0));
end;
$$;

revoke all on function public.register_patient_identity(uuid,jsonb) from public, anon;
grant execute on function public.register_patient_identity(uuid,jsonb) to authenticated;


commit;
