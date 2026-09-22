begin;

-- CSAPI Gate 03 corrective reconciliation:
-- 1) restore the approved authorization boundary for SECURITY DEFINER patient RPCs;
-- 2) implement the approved patient-match-v2 Path A + Path B contract;
-- 3) record identity attribute provenance/verification semantics;
-- 4) make patient search honor patients:read;
-- 5) preserve update data when optional fields are omitted;
-- 6) reconcile existing identity rows with explicit legacy-backfill provenance.
alter table public.patient_identities
  add column if not exists attribute_provenance jsonb not null default '{}'::jsonb,
  add column if not exists attribute_verification jsonb not null default '{}'::jsonb;

create index if not exists idx_patient_identities_phone_normalized
  on public.patient_identities(phone_normalized)
  where identity_state='active';

create index if not exists idx_patient_identities_dob
  on public.patient_identities(date_of_birth)
  where identity_state='active';

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
  v_candidates integer := 0;
  v_best jsonb := null;
  v_best_score integer := -1;
  v_best_classes integer := 0;
  v_best_strong_conflict boolean := false;
  v_best_path_b boolean := false;
  v_corrob integer := 0;
  r record;
begin
  if v_user is null then
    return jsonb_build_object('success',false,'error','AUTH_REQUIRED');
  end if;

  if not exists (
    select 1 from public.clinic_users cu
    where cu.tenant_id=p_tenant_id
      and cu.auth_user_id=v_user
      and cu.is_active=true
      and cu.deleted_at is null
  ) then
    return jsonb_build_object('success',false,'error','UNAUTHORIZED');
  end if;

  if not public.has_tenant_permission(p_tenant_id,'patients:create') then
    return jsonb_build_object('success',false,'error','PERMISSION_DENIED');
  end if;

  if v_first is null or v_father is null or v_family is null
     or v_phone is null or v_gender is null
     or (v_dob is null and v_age is null) then
    return jsonb_build_object('success',false,'error','PATIENT_INVALID_REQUEST');
  end if;

  if v_age is not null and (v_age < 0 or v_age > 130) then
    return jsonb_build_object('success',false,'error','PATIENT_INVALID_REQUEST');
  end if;

  select count(distinct pi.id)
    into v_candidates
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
      or (v_email is not null and pi.email_normalized=v_email)
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
        or pi.phone_normalized=v_phone
        or (v_email is not null and pi.email_normalized=v_email)
        or pi.first_name_normalized=lower(v_first)
        or pi.family_name_normalized=lower(v_family)
      )
  loop
    v_score := 0;
    v_best_classes := 0;
    v_best_strong_conflict := false;
    v_corrob := 0;

    if v_national is not null and exists (
      select 1 from public.patient_identity_identifiers pii
      where pii.patient_identity_id=r.id
        and pii.identifier_type='national_id'
        and pii.value_hash=digest(v_national,'sha256')
    ) then
      v_score := v_score + 20;
      v_best_classes := v_best_classes + 1;
    elsif v_national is not null and exists (
      select 1 from public.patient_identity_identifiers pii
      where pii.patient_identity_id=r.id
        and pii.identifier_type='national_id'
        and pii.verified_at is not null
        and pii.value_hash <> digest(v_national,'sha256')
    ) then
      v_best_strong_conflict := true;
    end if;

    if v_dob is not null and r.date_of_birth=v_dob then
      v_score := v_score + 25;
      v_best_classes := v_best_classes + 1;
    end if;

    if lower(coalesce(r.father_name_normalized,''))=lower(v_father) then
      v_score := v_score + 18;
      v_best_classes := v_best_classes + 1;
    end if;

    if lower(coalesce(r.family_name_normalized,''))=lower(v_family) then
      v_score := v_score + 15;
      v_best_classes := v_best_classes + 1;
    end if;

    if lower(coalesce(r.first_name_normalized,''))=lower(v_first) then
      v_score := v_score + 10;
      v_best_classes := v_best_classes + 1;
    end if;

    if v_mother is not null and lower(coalesce(r.mother_name_normalized,''))=lower(v_mother) then
      v_score := v_score + 5;
      v_best_classes := v_best_classes + 1;
      v_corrob := v_corrob + 1;
    end if;

    if lower(coalesce(r.gender,''))=v_gender then
      v_score := v_score + 4;
      v_best_classes := v_best_classes + 1;
    end if;

    if v_phone is not null and r.phone_normalized=v_phone then
      v_score := v_score + 2;
      v_best_classes := v_best_classes + 1;
      v_corrob := v_corrob + 1;
    end if;

    if v_email is not null and r.email_normalized=v_email then
      v_score := v_score + 1;
      v_best_classes := v_best_classes + 1;
      v_corrob := v_corrob + 1;
    end if;

    if v_dob is null and v_age is not null and r.date_of_birth is not null
       and extract(year from age(v_age_ref,r.date_of_birth)) between v_age-1 and v_age+1 then
      v_score := v_score + 8;
      v_best_classes := v_best_classes + 1;
    end if;

    -- Path B is intentionally narrow: it requires the complete core profile
    -- plus two corroborating classes, no strong conflict, and one unique candidate.
    if v_national is null
       and v_dob is not null
       and r.date_of_birth=v_dob
       and lower(coalesce(r.first_name_normalized,''))=lower(v_first)
       and lower(coalesce(r.father_name_normalized,''))=lower(v_father)
       and lower(coalesce(r.family_name_normalized,''))=lower(v_family)
       and lower(coalesce(r.gender,''))=v_gender
       and r.phone_normalized=v_phone
       and v_corrob >= 2
       and not v_best_strong_conflict then
      v_best_path_b := true;
    else
      v_best_path_b := false;
    end if;

    if v_score > v_best_score
       or (v_score = v_best_score and v_best is null) then
      v_best_score := v_score;
      v_best := jsonb_build_object(
        'patient_identity_id',r.id,
        'score',v_score,
        'matched_evidence_classes',v_best_classes,
        'strong_conflict',v_best_strong_conflict,
        'path_b_candidate',v_best_path_b,
        'first_name',r.first_name_normalized,
        'family_name',r.family_name_normalized,
        'date_of_birth',r.date_of_birth,
        'gender',r.gender,
        'phone_last4',right(coalesce(r.phone,''),4)
      );
    end if;
  end loop;

  if v_best is not null then
    v_best_path_b := coalesce((v_best->>'path_b_candidate')::boolean,false);
    v_best_strong_conflict := coalesce((v_best->>'strong_conflict')::boolean,false);
    v_best_classes := coalesce((v_best->>'matched_evidence_classes')::integer,0);
  end if;

  if v_best is not null
     and not v_best_strong_conflict
     and v_candidates = 1
     and (
       (v_best_score >= 80 and v_best_classes >= 3)
       or v_best_path_b
     ) then
    v_identity := (v_best->>'patient_identity_id')::uuid;

    select pcr.clinic_patient_id
      into v_patient
    from public.patient_clinic_relationships pcr
    where pcr.patient_identity_id=v_identity
      and pcr.tenant_id=p_tenant_id
      and pcr.deleted_at is null
    limit 1;

    if v_patient is null then
      insert into public.clinic_patients(
        tenant_id,first_name,last_name,father_name,family_name,mother_name,
        national_id,phone_primary,email,date_of_birth,age_at_registration,
        age_reference_date,gender,patient_status
      )
      values(
        p_tenant_id,v_first,v_family,v_father,v_family,v_mother,v_national,
        v_phone,v_email,v_dob,v_age,v_age_ref,v_gender,'active'
      )
      returning id into v_patient;

      insert into public.patient_clinic_relationships(
        patient_identity_id,clinic_patient_id,tenant_id,status
      ) values(v_identity,v_patient,p_tenant_id,'active');
    end if;

    insert into public.patient_identity_match_audit(
      tenant_id,patient_identity_id,outcome,policy_version,score,
      candidate_count,evidence,actor_user_id
    )
    values(
      p_tenant_id,v_identity,'EXACT_MATCH','patient-match-v2',v_best_score,
      v_candidates,v_best,v_user
    );

    insert into public.patient_portal_identities(patient_identity_id,status)
    values(v_identity,'unclaimed')
    on conflict(patient_identity_id) do nothing;

    return jsonb_build_object(
      'success',true,'outcome','EXACT_MATCH','patient_id',v_patient,
      'patient_identity_id',v_identity,'score',v_best_score
    );
  end if;

  if v_best is not null and (
      v_best_score >= 55
      or v_best_strong_conflict
      or (v_candidates = 1 and v_best_score >= 40)
    ) then
    insert into public.patient_identity_match_audit(
      tenant_id,patient_identity_id,outcome,policy_version,score,
      candidate_count,evidence,actor_user_id
    )
    values(
      p_tenant_id,(v_best->>'patient_identity_id')::uuid,'REVIEW_REQUIRED',
      'patient-match-v2',greatest(v_best_score,0),v_candidates,v_best,v_user
    );

    return jsonb_build_object(
      'success',false,'outcome','REVIEW_REQUIRED','score',v_best_score,
      'candidate',v_best
    );
  end if;

  insert into public.patient_identities(
    first_name_normalized,father_name_normalized,family_name_normalized,
    mother_name_normalized,date_of_birth,gender,phone_normalized,email_normalized,
    phone,email,status,identity_state,attribute_provenance,attribute_verification
  )
  values(
    lower(v_first),lower(v_father),lower(v_family),lower(v_mother),
    v_dob,v_gender,v_phone,v_email,v_phone,v_email,'active','active',
    jsonb_build_object(
      'first_name','clinic_registration',
      'father_name','clinic_registration',
      'family_name','clinic_registration',
      'mother_name','clinic_registration',
      'date_of_birth','clinic_registration',
      'gender','clinic_registration',
      'phone','clinic_registration',
      'email','clinic_registration'
    ),
    jsonb_build_object(
      'first_name','self_reported',
      'father_name','self_reported',
      'family_name','self_reported',
      'mother_name','self_reported',
      'date_of_birth','self_reported',
      'gender','self_reported',
      'phone','self_reported',
      'email','self_reported'
    )
  )
  returning id into v_identity;

  insert into public.clinic_patients(
    tenant_id,first_name,last_name,father_name,family_name,mother_name,
    national_id,phone_primary,email,date_of_birth,age_at_registration,
    age_reference_date,gender,patient_status
  )
  values(
    p_tenant_id,v_first,v_family,v_father,v_family,v_mother,v_national,
    v_phone,v_email,v_dob,v_age,v_age_ref,v_gender,'active'
  )
  returning id into v_patient;

  insert into public.patient_clinic_relationships(
    patient_identity_id,clinic_patient_id,tenant_id,status
  ) values(v_identity,v_patient,p_tenant_id,'active');

  if v_national is not null then
    insert into public.patient_identity_identifiers(
      patient_identity_id,identifier_type,value_hash,value_last4,verified_at
    )
    values(v_identity,'national_id',digest(v_national,'sha256'),right(v_national,4),null)
    on conflict do nothing;
  end if;

  insert into public.patient_portal_identities(patient_identity_id,status)
  values(v_identity,'unclaimed')
  on conflict(patient_identity_id) do nothing;

  insert into public.patient_identity_match_audit(
    tenant_id,patient_identity_id,outcome,policy_version,score,
    candidate_count,evidence,actor_user_id
  )
  values(
    p_tenant_id,v_identity,'NO_MATCH','patient-match-v2',greatest(v_best_score,0),
    v_candidates,coalesce(v_best,'{}'::jsonb),v_user
  );

  return jsonb_build_object(
    'success',true,'outcome','NO_MATCH','patient_id',v_patient,
    'patient_identity_id',v_identity,'score',greatest(v_best_score,0)
  );
end;
$$;

revoke all on function public.register_patient_identity(uuid,jsonb) from public, anon;
grant execute on function public.register_patient_identity(uuid,jsonb) to authenticated;

create or replace function public.update_patient_identity(
  p_tenant_id uuid,
  p_patient_id uuid,
  p_registration jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user uuid := auth.uid();
  v_identity uuid;
begin
  if v_user is null or not exists(
    select 1 from public.clinic_users cu
    where cu.tenant_id=p_tenant_id and cu.auth_user_id=v_user
      and cu.is_active=true and cu.deleted_at is null
  ) then
    return jsonb_build_object('success',false,'error','UNAUTHORIZED');
  end if;

  if not public.has_tenant_permission(p_tenant_id,'patients:update') then
    return jsonb_build_object('success',false,'error','PERMISSION_DENIED');
  end if;

  select patient_identity_id into v_identity
  from public.patient_clinic_relationships
  where tenant_id=p_tenant_id and clinic_patient_id=p_patient_id and deleted_at is null
  limit 1;

  if v_identity is null then
    return jsonb_build_object('success',false,'error','PATIENT_NOT_FOUND');
  end if;

  update public.clinic_patients set
    first_name=coalesce(nullif(trim(p_registration->>'first_name'),''),first_name),
    father_name=coalesce(nullif(trim(p_registration->>'father_name'),''),father_name),
    family_name=coalesce(nullif(trim(p_registration->>'family_name'),''),family_name),
    last_name=coalesce(nullif(trim(p_registration->>'family_name'),''),last_name),
    mother_name=case when p_registration ? 'mother_name' then nullif(trim(p_registration->>'mother_name'),'') else mother_name end,
    national_id=case when p_registration ? 'national_id' then nullif(trim(p_registration->>'national_id'),'') else national_id end,
    phone_primary=coalesce(nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),''),phone_primary),
    email=case when p_registration ? 'email' then lower(nullif(trim(p_registration->>'email'),'')) else email end,
    date_of_birth=case when p_registration ? 'date_of_birth' and nullif(p_registration->>'date_of_birth','') is not null then nullif(p_registration->>'date_of_birth','')::date else date_of_birth end,
    age_at_registration=case when p_registration ? 'age_at_registration' then nullif(p_registration->>'age_at_registration','')::integer else age_at_registration end,
    age_reference_date=case when p_registration ? 'age_reference_date' and nullif(p_registration->>'age_reference_date','') is not null then nullif(p_registration->>'age_reference_date','')::date else age_reference_date end,
    gender=case when p_registration ? 'gender' and nullif(p_registration->>'gender','') is not null then lower(nullif(trim(p_registration->>'gender'),'')) else gender end,
    updated_at=now()
  where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null;

  update public.patient_identities set
    first_name_normalized=coalesce(lower(nullif(trim(p_registration->>'first_name'),'')),first_name_normalized),
    father_name_normalized=coalesce(lower(nullif(trim(p_registration->>'father_name'),'')),father_name_normalized),
    family_name_normalized=coalesce(lower(nullif(trim(p_registration->>'family_name'),'')),family_name_normalized),
    mother_name_normalized=case when p_registration ? 'mother_name' then lower(nullif(trim(p_registration->>'mother_name'),'')) else mother_name_normalized end,
    date_of_birth=case when p_registration ? 'date_of_birth' and nullif(p_registration->>'date_of_birth','') is not null then nullif(p_registration->>'date_of_birth','')::date else date_of_birth end,
    gender=case when p_registration ? 'gender' and nullif(p_registration->>'gender','') is not null then lower(nullif(trim(p_registration->>'gender'),'')) else gender end,
    phone_normalized=coalesce(nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),''),phone_normalized),
    email_normalized=case when p_registration ? 'email' then lower(nullif(trim(p_registration->>'email'),'')) else email_normalized end,
    phone=coalesce(nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),''),phone),
    email=case when p_registration ? 'email' then lower(nullif(trim(p_registration->>'email'),'')) else email end,
    attribute_provenance=attribute_provenance || jsonb_build_object('last_update','clinic_update'),
    attribute_verification=attribute_verification || jsonb_build_object('last_update','self_reported'),
    updated_at=now()
  where id=v_identity;

  return jsonb_build_object('success',true,'patient_id',p_patient_id,'patient_identity_id',v_identity);
end;
$$;

revoke all on function public.update_patient_identity(uuid,uuid,jsonb) from public, anon;
grant execute on function public.update_patient_identity(uuid,uuid,jsonb) to authenticated;

create or replace function public.search_patient_records(
  p_tenant_id uuid,
  p_query text default null
) returns setof public.clinic_patients
language sql
security definer
set search_path = public, extensions
as $$
  select cp.*
  from public.clinic_patients cp
  where cp.tenant_id=p_tenant_id
    and cp.deleted_at is null
    and public.has_tenant_permission(p_tenant_id,'patients:read')
    and (
      nullif(trim(p_query),'') is null
      or lower(cp.first_name||' '||cp.family_name||' '||coalesce(cp.father_name,'')||' '||cp.last_name||' '||coalesce(cp.mother_name,'')) like '%'||lower(trim(p_query))||'%'
      or coalesce(cp.phone_primary,'') like '%'||regexp_replace(trim(p_query),'[^0-9]+','','g')||'%'
      or coalesce(cp.email,'') ilike '%'||trim(p_query)||'%'
      or coalesce(cp.file_number,'') ilike '%'||trim(p_query)||'%'
      or coalesce(cp.national_id,'') ilike '%'||trim(p_query)||'%'
    )
  order by cp.created_at desc
  limit 100;
$$;

revoke all on function public.search_patient_records(uuid,text) from public, anon;
grant execute on function public.search_patient_records(uuid,text) to authenticated;

-- Existing Gate 03 backfill is preserved; this reconciliation makes its provenance explicit.
update public.patient_identities pi
set attribute_provenance = case
      when pi.attribute_provenance = '{}'::jsonb then jsonb_build_object(
        'first_name','legacy_gate03_backfill',
        'father_name','legacy_gate03_backfill',
        'family_name','legacy_gate03_backfill',
        'mother_name','legacy_gate03_backfill',
        'date_of_birth','legacy_gate03_backfill',
        'gender','legacy_gate03_backfill',
        'phone','legacy_gate03_backfill',
        'email','legacy_gate03_backfill'
      )
      else pi.attribute_provenance
    end,
    attribute_verification = case
      when pi.attribute_verification = '{}'::jsonb then jsonb_build_object(
        'source','legacy_gate03_backfill',
        'verification','unverified'
      )
      else pi.attribute_verification
    end
where pi.identity_state='active';

insert into public.patient_identity_identifiers(
  patient_identity_id,identifier_type,value_hash,value_last4,verified_at
)
select cp.id,'national_id',digest(regexp_replace(cp.national_id,'[^0-9A-Za-z]+','','g'),'sha256'),
       right(regexp_replace(cp.national_id,'[^0-9A-Za-z]+','','g'),4),null
from public.clinic_patients cp
join public.patient_identities pi on pi.id=cp.id and pi.identity_state='active'
where cp.deleted_at is null
  and nullif(regexp_replace(coalesce(cp.national_id,''),'[^0-9A-Za-z]+','','g'),'') is not null
  and not exists(
    select 1 from public.patient_identity_identifiers pii
    where pii.patient_identity_id=cp.id
      and pii.identifier_type='national_id'
  );

insert into public.patient_portal_identities(patient_identity_id,status)
select pi.id,'unclaimed'
from public.patient_identities pi
where pi.identity_state='active'
  and not exists(
    select 1 from public.patient_portal_identities ppi
    where ppi.patient_identity_id=pi.id
  );

commit;
