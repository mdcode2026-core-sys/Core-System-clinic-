-- CSAPI Gate 03 — canonical Patient registration/matching service.
-- This migration is prepared on the execution branch. Production application
-- and database rollout remain gated by the final verification sequence.

create or replace function public.csapi_patient_normalize_text(p_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(regexp_replace(lower(trim(coalesce(p_value,''))), '[[:space:][:punct:]]+', ' ', 'g'), '');
$$;

create or replace function public.csapi_patient_normalize_phone(p_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(regexp_replace(trim(coalesce(p_value,'')), '[^0-9+]', '', 'g'), '');
$$;

create or replace function public.csapi_patient_normalize_email(p_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(lower(trim(coalesce(p_value,''))), '');
$$;

create or replace function public.csapi_patient_match_candidates(
  p_tenant_id uuid,
  p_first_name_norm text,
  p_father_name_norm text,
  p_family_name_norm text,
  p_mother_name_norm text default null,
  p_national_id_norm text default null,
  p_phone_norm text default null,
  p_email_norm text default null,
  p_date_of_birth date default null,
  p_age_at_registration smallint default null,
  p_age_reference_date date default null,
  p_gender text default null
)
returns table(
  patient_identity_id uuid,
  score smallint,
  strong_conflict boolean,
  evidence jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_score integer;
  v_conflict boolean;
  v_evidence jsonb;
  v_age_points integer;
begin
  if (select auth.uid()) is null then
    raise exception 'PATIENT_IDENTITY_AUTH_REQUIRED';
  end if;

  if not exists (
    select 1 from public.clinic_users cu
    where cu.tenant_id = p_tenant_id
      and cu.auth_user_id = (select auth.uid())
      and cu.is_active = true
      and cu.deleted_at is null
  ) then
    raise exception 'PATIENT_IDENTITY_TENANT_ACCESS_DENIED';
  end if;

  if not public.has_effective_permission('patients:read', (select auth.uid())) then
    raise exception 'PATIENT_IDENTITY_PERMISSION_DENIED';
  end if;

  for r in
    select pi.*
    from public.patient_identities pi
    where pi.identity_state = 'active'
      and (
        (p_national_id_norm is not null and exists (
          select 1 from public.patient_identity_identifiers pii
          where pii.patient_identity_id = pi.id
            and pii.identifier_type = 'national_id'
            and pii.normalized_value = p_national_id_norm
            and pii.is_current = true
        ))
        or (p_phone_norm is not null and pi.phone_norm = p_phone_norm)
        or (p_email_norm is not null and pi.email_norm = p_email_norm)
        or (p_date_of_birth is not null and pi.date_of_birth = p_date_of_birth)
        or (
          p_first_name_norm is not null
          and p_family_name_norm is not null
          and pi.first_name_norm = p_first_name_norm
          and pi.family_name_norm = p_family_name_norm
        )
      )
    limit 25
  loop
    v_score := 0;
    v_conflict := false;
    v_evidence := '{}'::jsonb;

    if p_national_id_norm is not null and exists (
      select 1 from public.patient_identity_identifiers pii
      where pii.patient_identity_id = r.id
        and pii.identifier_type = 'national_id'
        and pii.is_current = true
        and pii.normalized_value = p_national_id_norm
    ) then
      v_score := v_score + 30;
      v_evidence := v_evidence || jsonb_build_object('national_id',30);
    elsif p_national_id_norm is not null and exists (
      select 1 from public.patient_identity_identifiers pii
      where pii.patient_identity_id = r.id
        and pii.identifier_type = 'national_id'
        and pii.is_current = true
        and pii.verification_status = 'verified'
        and pii.normalized_value <> p_national_id_norm
    ) then
      v_conflict := true;
      v_evidence := v_evidence || jsonb_build_object('national_id_conflict',true);
    end if;

    if p_date_of_birth is not null and r.date_of_birth is not null then
      if p_date_of_birth = r.date_of_birth then
        v_score := v_score + 20;
        v_evidence := v_evidence || jsonb_build_object('date_of_birth',20);
      else
        v_conflict := true;
        v_evidence := v_evidence || jsonb_build_object('date_of_birth_conflict',true);
      end if;
    elsif p_date_of_birth is null and p_age_at_registration is not null and r.date_of_birth is null and r.age_at_registration is not null then
      if p_age_reference_date is not null and r.age_reference_date is not null then
        if abs(p_age_at_registration - r.age_at_registration) = 0
           and abs(p_age_reference_date - r.age_reference_date) <= 365 then
          v_age_points := 8;
        elsif abs(p_age_at_registration - r.age_at_registration) = 1
           and abs(p_age_reference_date - r.age_reference_date) <= 365 then
          v_age_points := 4;
        else
          v_age_points := 0;
        end if;
      else
        v_age_points := case when p_age_at_registration = r.age_at_registration then 8 else 0 end;
      end if;
      v_score := v_score + coalesce(v_age_points,0);
      v_evidence := v_evidence || jsonb_build_object('age',coalesce(v_age_points,0));
    end if;

    if p_father_name_norm is not null and p_father_name_norm = r.father_name_norm then
      v_score := v_score + 12;
      v_evidence := v_evidence || jsonb_build_object('father_name',12);
    end if;

    if p_family_name_norm is not null and p_family_name_norm = r.family_name_norm then
      v_score := v_score + 12;
      v_evidence := v_evidence || jsonb_build_object('family_name',12);
    end if;

    if p_first_name_norm is not null and p_first_name_norm = r.first_name_norm then
      v_score := v_score + 8;
      v_evidence := v_evidence || jsonb_build_object('first_name',8);
    end if;

    if p_mother_name_norm is not null and p_mother_name_norm = r.mother_name_norm then
      v_score := v_score + 5;
      v_evidence := v_evidence || jsonb_build_object('mother_name',5);
    end if;

    if p_gender is not null and r.gender is not null then
      if lower(p_gender) = lower(r.gender) then
        v_score := v_score + 5;
        v_evidence := v_evidence || jsonb_build_object('gender',5);
      else
        v_conflict := true;
        v_evidence := v_evidence || jsonb_build_object('gender_conflict',true);
      end if;
    end if;

    if p_phone_norm is not null and p_phone_norm = r.phone_norm then
      v_score := v_score + 5;
      v_evidence := v_evidence || jsonb_build_object('phone',5);
    end if;

    if p_email_norm is not null and p_email_norm = r.email_norm then
      v_score := v_score + 3;
      v_evidence := v_evidence || jsonb_build_object('email',3);
    end if;

    patient_identity_id := r.id;
    score := least(v_score,100)::smallint;
    strong_conflict := v_conflict;
    evidence := v_evidence;
    return next;
  end loop;
end;
$$;

revoke all on function public.csapi_patient_match_candidates(uuid,text,text,text,text,text,text,text,date,smallint,date,text) from public, anon;
grant execute on function public.csapi_patient_match_candidates(uuid,text,text,text,text,text,text,text,date,smallint,date,text) to authenticated;

create or replace function public.csapi_register_patient(
  p_tenant_id uuid,
  p_first_name text,
  p_father_name text,
  p_family_name text,
  p_mother_name text,
  p_national_id text,
  p_phone_primary text,
  p_email text,
  p_gender text,
  p_date_of_birth date,
  p_age_at_registration smallint,
  p_age_reference_date date,
  p_first_name_ar text,
  p_last_name_ar text,
  p_phone_secondary text,
  p_preferred_channel text,
  p_first_visit_date date,
  p_referral_source text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := (select auth.uid());
  v_first text := public.csapi_patient_normalize_text(p_first_name);
  v_father text := public.csapi_patient_normalize_text(p_father_name);
  v_family text := public.csapi_patient_normalize_text(p_family_name);
  v_mother text := public.csapi_patient_normalize_text(p_mother_name);
  v_national text := nullif(regexp_replace(trim(coalesce(p_national_id,'')), '[^[:alnum:]]', '', 'g'), '');
  v_phone text := public.csapi_patient_normalize_phone(p_phone_primary);
  v_email text := public.csapi_patient_normalize_email(p_email);
  v_age smallint;
  v_age_ref date;
  v_candidate record;
  v_identity uuid;
  v_clinic_patient uuid;
  v_portal_identity uuid;
  v_score smallint;
  v_conflict boolean;
  v_evidence jsonb;
  v_result text;
  v_candidate_count integer := 0;
begin
  if v_actor is null then
    return jsonb_build_object('success',false,'error','PATIENT_AUTH_REQUIRED');
  end if;

  if not exists (
    select 1 from public.clinic_users cu
    where cu.tenant_id=p_tenant_id and cu.auth_user_id=v_actor
      and cu.is_active=true and cu.deleted_at is null
  ) then
    return jsonb_build_object('success',false,'error','PATIENT_TENANT_ACCESS_DENIED');
  end if;

  if not public.has_effective_permission('patients:write', v_actor) then
    return jsonb_build_object('success',false,'error','PATIENT_WRITE_PERMISSION_DENIED');
  end if;

  if v_first is null or v_father is null or v_family is null then
    return jsonb_build_object('success',false,'error','PATIENT_REQUIRED_NAME_FIELDS');
  end if;

  if v_phone is null or v_phone !~ '^\+?[1-9][0-9]{7,14}$' then
    return jsonb_build_object('success',false,'error','PATIENT_INVALID_PHONE');
  end if;

  if p_gender is null or trim(p_gender) = '' then
    return jsonb_build_object('success',false,'error','PATIENT_REQUIRED_GENDER');
  end if;

  if p_date_of_birth is null and (p_age_at_registration is null or p_age_at_registration < 0 or p_age_at_registration > 120) then
    return jsonb_build_object('success',false,'error','PATIENT_REQUIRED_DOB_OR_AGE');
  end if;

  if p_date_of_birth is not null and p_date_of_birth > current_date then
    return jsonb_build_object('success',false,'error','PATIENT_INVALID_DOB');
  end if;

  v_age := case when p_date_of_birth is null then p_age_at_registration else null end;
  v_age_ref := case when p_date_of_birth is null then coalesce(p_age_reference_date,current_date) else null end;

  select * into v_candidate
  from public.csapi_patient_match_candidates(
    p_tenant_id,v_first,v_father,v_family,v_mother,v_national,v_phone,v_email,
    p_date_of_birth,v_age,v_age_ref,p_gender
  )
  order by strong_conflict asc, score desc
  limit 1;

  if v_candidate.patient_identity_id is not null then
    v_candidate_count := 1;
    v_score := v_candidate.score;
    v_conflict := v_candidate.strong_conflict;
    v_evidence := v_candidate.evidence;
    if v_score >= 80 and not v_conflict then
      v_result := 'EXACT_MATCH';
    elsif v_score >= 55 or v_conflict then
      v_result := 'REVIEW_REQUIRED';
    else
      v_result := 'NO_MATCH';
    end if;
  else
    v_result := 'NO_MATCH';
  end if;

  if v_result = 'REVIEW_REQUIRED' then
    insert into public.patient_identity_match_decisions(
      tenant_id,policy_version,candidate_identity_id,result,score,evidence,strong_conflict,actor_user_id
    ) values (
      p_tenant_id,'patient-match-v1',v_candidate.patient_identity_id,v_result,
      coalesce(v_score,0),coalesce(v_evidence,'{}'::jsonb),coalesce(v_conflict,false),v_actor
    );
    return jsonb_build_object(
      'success',false,'result','REVIEW_REQUIRED',
      'candidateIdentityId',v_candidate.patient_identity_id,
      'score',v_score,'evidence',v_evidence
    );
  end if;

  if v_result = 'EXACT_MATCH' then
    v_identity := v_candidate.patient_identity_id;

    select pcr.clinic_patient_id into v_clinic_patient
    from public.patient_clinic_relationships pcr
    where pcr.patient_identity_id=v_identity
      and pcr.tenant_id=p_tenant_id
      and pcr.status='active'
    limit 1;

    if v_clinic_patient is null then
      insert into public.clinic_patients(
        id,tenant_id,first_name,last_name,first_name_ar,last_name_ar,
        father_name,family_name,mother_name,national_id,age_at_registration,
        age_reference_date,date_of_birth,gender,phone_primary,phone_secondary,email,
        preferred_channel,first_visit_date,patient_status,referral_source,notes
      ) values (
        gen_random_uuid(),p_tenant_id,p_first_name,p_family_name,p_first_name_ar,p_last_name_ar,
        p_father_name,p_family_name,p_mother_name,p_national_id,v_age,v_age_ref,
        p_date_of_birth,p_gender,v_phone,p_phone_secondary,p_email,
        coalesce(p_preferred_channel,'whatsapp'),p_first_visit_date,'active',p_referral_source,p_notes
      ) returning id into v_clinic_patient;

      insert into public.patient_clinic_relationships(
        patient_identity_id,clinic_patient_id,tenant_id,status
      ) values (v_identity,v_clinic_patient,p_tenant_id,'active')
      on conflict (patient_identity_id,clinic_patient_id) do update set status='active',updated_at=now();
    end if;
  else
    insert into public.patient_identities(
      first_name_norm,father_name_norm,family_name_norm,mother_name_norm,
      date_of_birth,gender,phone_norm,email_norm,age_at_registration,age_reference_date,
      phone,email,status,identity_state
    ) values (
      v_first,v_father,v_family,v_mother,p_date_of_birth,p_gender,v_phone,v_email,
      v_age,v_age_ref,v_phone,p_email,'active','active'
    ) returning id into v_identity;

    insert into public.clinic_patients(
      id,tenant_id,first_name,last_name,first_name_ar,last_name_ar,
      father_name,family_name,mother_name,national_id,age_at_registration,
      age_reference_date,date_of_birth,gender,phone_primary,phone_secondary,email,
      preferred_channel,first_visit_date,patient_status,referral_source,notes
    ) values (
      gen_random_uuid(),p_tenant_id,p_first_name,p_family_name,p_first_name_ar,p_last_name_ar,
      p_father_name,p_family_name,p_mother_name,p_national_id,v_age,v_age_ref,
      p_date_of_birth,p_gender,v_phone,p_phone_secondary,p_email,
      coalesce(p_preferred_channel,'whatsapp'),p_first_visit_date,'active',p_referral_source,p_notes
    ) returning id into v_clinic_patient;

    insert into public.patient_clinic_relationships(
      patient_identity_id,clinic_patient_id,tenant_id,status
    ) values(v_identity,v_clinic_patient,p_tenant_id,'active');

    if p_national_id is not null and trim(p_national_id) <> '' then
      insert into public.patient_identity_identifiers(
        patient_identity_id,identifier_type,normalized_value,display_value,
        scope_type,tenant_id,verification_status,source
      ) values(v_identity,'national_id',v_national,p_national_id,'system',null,'unverified','registration');
    end if;
  end if;

  v_portal_identity := public.ensure_patient_portal_identity(v_identity);

  insert into public.patient_identity_match_decisions(
    tenant_id,clinic_patient_id,patient_identity_id,candidate_identity_id,
    policy_version,result,score,evidence,strong_conflict,actor_user_id
  ) values(
    p_tenant_id,v_clinic_patient,v_identity,v_candidate.patient_identity_id,
    'patient-match-v1',v_result,coalesce(v_score,0),coalesce(v_evidence,'{}'::jsonb),
    coalesce(v_conflict,false),v_actor
  );

  insert into public.patient_identity_audit(
    patient_identity_id,tenant_id,action,actor_user_id,after_state,metadata
  ) values(
    v_identity,p_tenant_id,
    case when v_result='EXACT_MATCH' then 'clinic_relationship_created' else 'identity_created' end,
    v_actor,
    jsonb_build_object('clinic_patient_id',v_clinic_patient,'match_result',v_result),
    jsonb_build_object('policy_version','patient-match-v1')
  );

  return jsonb_build_object(
    'success',true,'result',v_result,
    'patientIdentityId',v_identity,'clinicPatientId',v_clinic_patient,
    'portalIdentityId',v_portal_identity,'score',coalesce(v_score,0)
  );
exception
  when unique_violation then
    return jsonb_build_object('success',false,'error','PATIENT_REGISTRATION_CONFLICT','retryable',true);
end;
$$;

revoke all on function public.csapi_register_patient(uuid,text,text,text,text,text,text,text,text,date,smallint,date,text,text,text,text,date,text,text) from public, anon;
grant execute on function public.csapi_register_patient(uuid,text,text,text,text,text,text,text,text,date,smallint,date,text,text,text,text,date,text,text) to authenticated;
