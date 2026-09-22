begin;

create or replace function public.register_patient_identity(
  p_tenant_id uuid,
  p_registration jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_first text := lower(regexp_replace(trim(coalesce(p_registration->>'first_name','')), '\s+', ' ', 'g'));
  v_father text := lower(regexp_replace(trim(coalesce(p_registration->>'father_name','')), '\s+', ' ', 'g'));
  v_family text := lower(regexp_replace(trim(coalesce(p_registration->>'family_name','')), '\s+', ' ', 'g'));
  v_mother text := nullif(lower(regexp_replace(trim(coalesce(p_registration->>'mother_name','')), '\s+', ' ', 'g')), '');
  v_phone text := regexp_replace(coalesce(p_registration->>'phone_primary',''), '[^0-9]+', '', 'g');
  v_email text := nullif(lower(trim(coalesce(p_registration->>'email',''))), '');
  v_gender text := nullif(lower(trim(coalesce(p_registration->>'gender',''))), '');
  v_dob date := nullif(p_registration->>'date_of_birth','')::date;
  v_age integer := nullif(p_registration->>'age_at_registration','')::integer;
  v_age_ref date := nullif(p_registration->>'age_reference_date','')::date;
  v_national_id text := nullif(lower(regexp_replace(trim(coalesce(p_registration->>'national_id','')), '[^[:alnum:]]+', '', 'g')), '');
  v_patient_status text := coalesce(nullif(p_registration->>'patient_status',''),'active');
  v_patient_id uuid;
  v_identity_id uuid;
  v_match record;
  v_candidate_count integer := 0;
  v_score numeric(6,2) := 0;
  v_outcome text;
  v_core_path boolean := false;
  v_national_exact boolean := false;
  v_strong_conflict boolean := false;
  v_corroborators integer := 0;
  v_evidence jsonb := '{}'::jsonb;
  v_conflicts jsonb := '[]'::jsonb;
begin
  if v_actor is null then
    return jsonb_build_object('success',false,'error','AUTH_REQUIRED');
  end if;

  if not exists (
    select 1 from public.clinic_users cu
    where cu.auth_user_id=v_actor
      and cu.tenant_id=p_tenant_id
      and cu.is_active=true
      and cu.deleted_at is null
  ) then
    return jsonb_build_object('success',false,'error','TENANT_ACCESS_DENIED');
  end if;

  if not public.has_tenant_permission(p_tenant_id,'patients:create') then
    return jsonb_build_object('success',false,'error','PERMISSION_DENIED');
  end if;

  if v_first='' or v_father='' or v_family='' or v_phone='' or v_gender is null then
    return jsonb_build_object('success',false,'error','REGISTRATION_REQUIRED_FIELDS');
  end if;

  if v_dob is null and v_age is null then
    return jsonb_build_object('success',false,'error','DOB_OR_AGE_REQUIRED');
  end if;

  if length(v_phone) < 8 or length(v_phone) > 15 then
    return jsonb_build_object('success',false,'error','PHONE_INVALID');
  end if;

  if v_gender not in ('male','female','other') then
    return jsonb_build_object('success',false,'error','GENDER_INVALID');
  end if;

  if v_age is not null and (v_age < 0 or v_age > 120) then
    return jsonb_build_object('success',false,'error','AGE_INVALID');
  end if;

  if v_dob is not null and v_dob > current_date then
    return jsonb_build_object('success',false,'error','DOB_INVALID');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    p_tenant_id::text || '|' || v_first || '|' || v_father || '|' || v_family || '|' ||
    coalesce(v_dob::text,'') || '|' || coalesce(v_phone,''),
    0
  ));

  with candidate_base as (
    select
      pi.id,
      pi.date_of_birth,
      pi.gender,
      pi.first_name_normalized,
      pi.father_name_normalized,
      pi.family_name_normalized,
      pi.mother_name_normalized,
      pi.phone_normalized,
      pi.email_normalized,
      (
        case when v_national_id is not null and exists (
          select 1 from public.patient_identity_identifiers pii
          where pii.patient_identity_id=pi.id
            and pii.identifier_type in ('national_id','government_id','national_card')
            and pii.normalized_value=v_national_id
            and pii.verification_status='verified'
            and pii.is_current=true
        ) then 30 else 0 end
        + case when v_dob is not null and pi.date_of_birth=v_dob then 20 else 0 end
        + case when pi.father_name_normalized=v_father and v_father<>'' then 12 else 0 end
        + case when pi.family_name_normalized=v_family and v_family<>'' then 12 else 0 end
        + case when pi.first_name_normalized=v_first and v_first<>'' then 8 else 0 end
        + case when v_mother is not null and pi.mother_name_normalized=v_mother then 5 else 0 end
        + case when pi.gender=v_gender then 5 else 0 end
        + case when pi.phone_normalized=v_phone then 5 else 0 end
        + case when v_email is not null and pi.email_normalized=v_email then 3 else 0 end
        + case when v_dob is null and v_age is not null and pi.date_of_birth is null and pi.age_at_registration=v_age then 8 else 0 end
      )::numeric as score,
      case when v_national_id is not null and exists (
        select 1 from public.patient_identity_identifiers pii
        where pii.patient_identity_id=pi.id
          and pii.identifier_type in ('national_id','government_id','national_card')
          and pii.normalized_value=v_national_id
          and pii.verification_status='verified'
          and pii.is_current=true
      ) then true else false end as national_exact,
      case when v_dob is not null and pi.date_of_birth is not null and pi.date_of_birth<>v_dob then true else false end as dob_conflict,
      case when v_gender is not null and pi.gender is not null and pi.gender<>v_gender then true else false end as gender_conflict,
      case when v_national_id is not null and exists (
        select 1 from public.patient_identity_identifiers pii
        where pii.patient_identity_id=pi.id
          and pii.identifier_type in ('national_id','government_id','national_card')
          and pii.verification_status='verified'
          and pii.is_current=true
          and pii.normalized_value<>v_national_id
      ) then true else false end as national_conflict,
      exists (
        select 1 from public.patient_identity_identifiers pii
        where pii.patient_identity_id=pi.id
          and pii.identifier_type not in ('national_id','government_id','national_card')
          and pii.verification_status='verified'
          and pii.is_current=true
      ) as has_other_verified_identifier
    from public.patient_identities pi
    where pi.identity_state='active'
      and (
        (v_dob is not null and pi.date_of_birth=v_dob)
        or pi.first_name_normalized=v_first
        or pi.father_name_normalized=v_father
        or pi.family_name_normalized=v_family
        or pi.phone_normalized=v_phone
        or (v_email is not null and pi.email_normalized=v_email)
        or (v_national_id is not null and exists (
          select 1 from public.patient_identity_identifiers pii
          where pii.patient_identity_id=pi.id
            and pii.identifier_type in ('national_id','government_id','national_card')
            and pii.normalized_value=v_national_id
            and pii.verification_status='verified'
            and pii.is_current=true
        ))
      )
  ), scored as (
    select cb.*,
      (cb.national_exact or cb.dob_conflict or cb.gender_conflict or cb.national_conflict) as has_strong_conflict,
      (
        case when cb.mother_name_normalized is not null and v_mother is not null and cb.mother_name_normalized=v_mother then 1 else 0 end
        + case when cb.email_normalized is not null and v_email is not null and cb.email_normalized=v_email then 1 else 0 end
        + case when cb.has_other_verified_identifier then 1 else 0 end
      ) as corroborator_count,
      (
        cb.first_name_normalized=v_first
        and cb.father_name_normalized=v_father
        and cb.family_name_normalized=v_family
        and v_dob is not null and cb.date_of_birth=v_dob
        and cb.gender=v_gender
        and cb.phone_normalized=v_phone
      ) as core_profile_exact
    from candidate_base cb
  )
  select count(*) into v_candidate_count from scored;

  if v_candidate_count > 0 then
    select * into v_match
    from (
      select * from (
        with candidate_base as (
          select
            pi.id,
            pi.date_of_birth,
            pi.gender,
            pi.first_name_normalized,
            pi.father_name_normalized,
            pi.family_name_normalized,
            pi.mother_name_normalized,
            pi.phone_normalized,
            pi.email_normalized,
            (
              case when v_national_id is not null and exists (
                select 1 from public.patient_identity_identifiers pii
                where pii.patient_identity_id=pi.id
                  and pii.identifier_type in ('national_id','government_id','national_card')
                  and pii.normalized_value=v_national_id
                  and pii.verification_status='verified'
                  and pii.is_current=true
              ) then 30 else 0 end
              + case when v_dob is not null and pi.date_of_birth=v_dob then 20 else 0 end
              + case when pi.father_name_normalized=v_father then 12 else 0 end
              + case when pi.family_name_normalized=v_family then 12 else 0 end
              + case when pi.first_name_normalized=v_first then 8 else 0 end
              + case when v_mother is not null and pi.mother_name_normalized=v_mother then 5 else 0 end
              + case when pi.gender=v_gender then 5 else 0 end
              + case when pi.phone_normalized=v_phone then 5 else 0 end
              + case when v_email is not null and pi.email_normalized=v_email then 3 else 0 end
              + case when v_dob is null and v_age is not null and pi.date_of_birth is null and pi.age_at_registration=v_age then 8 else 0 end
            )::numeric as score,
            case when v_national_id is not null and exists (
              select 1 from public.patient_identity_identifiers pii
              where pii.patient_identity_id=pi.id
                and pii.identifier_type in ('national_id','government_id','national_card')
                and pii.normalized_value=v_national_id
                and pii.verification_status='verified'
                and pii.is_current=true
            ) then true else false end as national_exact,
            case when v_dob is not null and pi.date_of_birth is not null and pi.date_of_birth<>v_dob then true else false end as dob_conflict,
            case when v_gender is not null and pi.gender is not null and pi.gender<>v_gender then true else false end as gender_conflict,
            case when v_national_id is not null and exists (
              select 1 from public.patient_identity_identifiers pii
              where pii.patient_identity_id=pi.id
                and pii.identifier_type in ('national_id','government_id','national_card')
                and pii.verification_status='verified'
                and pii.is_current=true
                and pii.normalized_value<>v_national_id
            ) then true else false end as national_conflict,
            exists (
              select 1 from public.patient_identity_identifiers pii
              where pii.patient_identity_id=pi.id
                and pii.identifier_type not in ('national_id','government_id','national_card')
                and pii.verification_status='verified'
                and pii.is_current=true
            ) as has_other_verified_identifier
          from public.patient_identities pi
          where pi.identity_state='active'
            and (
              (v_dob is not null and pi.date_of_birth=v_dob)
              or pi.first_name_normalized=v_first
              or pi.father_name_normalized=v_father
              or pi.family_name_normalized=v_family
              or pi.phone_normalized=v_phone
              or (v_email is not null and pi.email_normalized=v_email)
              or (v_national_id is not null and exists (
                select 1 from public.patient_identity_identifiers pii
                where pii.patient_identity_id=pi.id
                  and pii.identifier_type in ('national_id','government_id','national_card')
                  and pii.normalized_value=v_national_id
                  and pii.verification_status='verified'
                  and pii.is_current=true
              ))
            )
        )
        select cb.*,
          (cb.national_exact or cb.dob_conflict or cb.gender_conflict or cb.national_conflict) as has_strong_conflict,
          (
            case when cb.mother_name_normalized is not null and v_mother is not null and cb.mother_name_normalized=v_mother then 1 else 0 end
            + case when cb.email_normalized is not null and v_email is not null and cb.email_normalized=v_email then 1 else 0 end
            + case when cb.has_other_verified_identifier then 1 else 0 end
          ) as corroborator_count,
          (
            cb.first_name_normalized=v_first
            and cb.father_name_normalized=v_father
            and cb.family_name_normalized=v_family
            and v_dob is not null and cb.date_of_birth=v_dob
            and cb.gender=v_gender
            and cb.phone_normalized=v_phone
          ) as core_profile_exact
        from candidate_base cb
      ) s
      order by s.score desc, s.core_profile_exact desc, s.id
      limit 1
    ) top_candidate;
  end if;

  if v_candidate_count > 0 and v_match.id is not null then
    v_score := v_match.score;
    v_national_exact := v_match.national_exact;
    v_strong_conflict := v_match.has_strong_conflict;
    v_corroborators := v_match.corroborator_count;
    v_core_path := v_match.core_profile_exact
      and v_corroborators >= 2
      and not v_strong_conflict
      and v_candidate_count = 1;

    if ((v_score >= 80 and (v_national_exact or v_match.core_profile_exact) and not v_strong_conflict)
        or (v_score >= 80 and not v_strong_conflict)
        or v_core_path) then
      v_outcome := 'EXACT_MATCH';
      v_identity_id := v_match.id;
    elsif v_score >= 55 or v_strong_conflict or v_core_path=false then
      v_outcome := 'REVIEW_REQUIRED';
    else
      v_outcome := 'NO_MATCH';
    end if;
  else
    v_outcome := 'NO_MATCH';
  end if;

  v_evidence := jsonb_build_object(
    'first_name_exact',coalesce(v_match.first_name_normalized=v_first,false),
    'father_name_exact',coalesce(v_match.father_name_normalized=v_father,false),
    'family_name_exact',coalesce(v_match.family_name_normalized=v_family,false),
    'mother_name_exact',coalesce(v_match.mother_name_normalized=v_mother,false),
    'dob_exact',coalesce(v_match.date_of_birth=v_dob,false),
    'gender_exact',coalesce(v_match.gender=v_gender,false),
    'phone_exact',coalesce(v_match.phone_normalized=v_phone,false),
    'email_exact',coalesce(v_match.email_normalized=v_email,false),
    'national_id_exact',coalesce(v_match.national_exact,false),
    'core_profile_exact',coalesce(v_match.core_profile_exact,false),
    'corroborator_count',coalesce(v_match.corroborator_count,0)
  );

  v_conflicts := jsonb_build_array(
    case when coalesce(v_match.national_conflict,false) then 'NATIONAL_ID_MISMATCH' else null end,
    case when coalesce(v_match.dob_conflict,false) then 'DOB_MISMATCH' else null end,
    case when coalesce(v_match.gender_conflict,false) then 'GENDER_MISMATCH' else null end
  ) - 'null';

  if v_outcome='REVIEW_REQUIRED' then
    insert into public.patient_identity_match_decisions(
      patient_identity_id,tenant_id,policy_version,outcome,score,candidate_count,evidence,strong_conflicts,actor_auth_user_id
    ) values (
      v_match.id,p_tenant_id,'patient-match-v1',v_outcome,v_score,v_candidate_count,v_evidence,v_conflicts,v_actor
    );
    return jsonb_build_object(
      'success',true,'outcome',v_outcome,'score',v_score,'candidate_count',v_candidate_count,
      'candidate_identity_id',v_match.id,'evidence',v_evidence,'strong_conflicts',v_conflicts
    );
  end if;

  if v_outcome='EXACT_MATCH' then
    select pcr.clinic_patient_id into v_patient_id
    from public.patient_clinic_relationships pcr
    where pcr.patient_identity_id=v_identity_id
      and pcr.tenant_id=p_tenant_id
      and pcr.status='active'
    limit 1;

    if v_patient_id is null then
      insert into public.clinic_patients(
        id,tenant_id,first_name,last_name,father_name,family_name,mother_name,
        date_of_birth,age_at_registration,age_reference_date,gender,phone_primary,email,patient_status
      ) values (
        gen_random_uuid(),p_tenant_id,p_registration->>'first_name',p_registration->>'family_name',
        p_registration->>'father_name',p_registration->>'family_name',p_registration->>'mother_name',
        v_dob,v_age,v_age_ref,v_gender,p_registration->>'phone_primary',p_registration->>'email',v_patient_status
      ) returning id into v_patient_id;

      insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status)
      values(v_identity_id,v_patient_id,p_tenant_id,'active');
    end if;

    insert into public.patient_portal_identities(patient_identity_id,status)
    values(v_identity_id,'unclaimed')
    on conflict(patient_identity_id) do nothing;

    insert into public.patient_identity_match_decisions(
      patient_identity_id,tenant_id,clinic_patient_id,policy_version,outcome,score,candidate_count,evidence,strong_conflicts,actor_auth_user_id
    ) values(v_identity_id,p_tenant_id,v_patient_id,'patient-match-v1',v_outcome,v_score,v_candidate_count,v_evidence,v_conflicts,v_actor);

    return jsonb_build_object('success',true,'outcome',v_outcome,'patient_id',v_patient_id,'patient_identity_id',v_identity_id,'score',v_score,'candidate_count',v_candidate_count);
  end if;

  insert into public.patient_identities(
    first_name_normalized,father_name_normalized,family_name_normalized,mother_name_normalized,
    date_of_birth,age_at_registration,age_reference_date,gender,phone_normalized,email_normalized,
    phone,email,status,identity_state
  ) values (
    v_first,v_father,v_family,v_mother,v_dob,v_age,v_age_ref,v_gender,v_phone,v_email,
    p_registration->>'phone_primary',p_registration->>'email','active','active'
  ) returning id into v_identity_id;

  if v_national_id is not null then
    insert into public.patient_identity_identifiers(
      patient_identity_id,identifier_type,normalized_value,display_value,scope_type,verification_status,is_current,source
    ) values(v_identity_id,'national_id',v_national_id,p_registration->>'national_id','system','unverified',true,'patient_registration');
  end if;

  insert into public.clinic_patients(
    id,tenant_id,first_name,last_name,father_name,family_name,mother_name,
    date_of_birth,age_at_registration,age_reference_date,gender,phone_primary,email,patient_status
  ) values (
    gen_random_uuid(),p_tenant_id,p_registration->>'first_name',p_registration->>'family_name',
    p_registration->>'father_name',p_registration->>'family_name',p_registration->>'mother_name',
    v_dob,v_age,v_age_ref,v_gender,p_registration->>'phone_primary',p_registration->>'email',v_patient_status
  ) returning id into v_patient_id;

  insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status)
  values(v_identity_id,v_patient_id,p_tenant_id,'active');

  insert into public.patient_portal_identities(patient_identity_id,status)
  values(v_identity_id,'unclaimed')
  on conflict(patient_identity_id) do nothing;

  insert into public.patient_identity_match_decisions(
    patient_identity_id,tenant_id,clinic_patient_id,policy_version,outcome,score,candidate_count,evidence,strong_conflicts,actor_auth_user_id
  ) values(v_identity_id,p_tenant_id,v_patient_id,'patient-match-v1','NO_MATCH',coalesce(v_score,0),v_candidate_count,v_evidence,v_conflicts,v_actor);

  return jsonb_build_object('success',true,'outcome','NO_MATCH','patient_id',v_patient_id,'patient_identity_id',v_identity_id,'score',coalesce(v_score,0),'candidate_count',v_candidate_count);
end;
$$;

revoke execute on function public.register_patient_identity(uuid,jsonb) from public, anon;
grant execute on function public.register_patient_identity(uuid,jsonb) to authenticated, service_role;

commit;
