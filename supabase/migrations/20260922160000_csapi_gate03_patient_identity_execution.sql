begin;

-- Gate 03 canonical identity foundation.
alter table public.clinic_patients
  add column if not exists father_name text,
  add column if not exists family_name text,
  add column if not exists mother_name text,
  add column if not exists national_id text,
  add column if not exists age_at_registration integer,
  add column if not exists age_reference_date date;

alter table public.clinic_patients
  drop constraint if exists uq_patient_phone;

alter table public.patient_identities
  add column if not exists first_name_normalized text,
  add column if not exists father_name_normalized text,
  add column if not exists family_name_normalized text,
  add column if not exists mother_name_normalized text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists phone_normalized text,
  add column if not exists email_normalized text,
  add column if not exists identity_state text not null default 'active';

create table if not exists public.patient_identity_identifiers (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null references public.patient_identities(id) on delete cascade,
  identifier_type text not null,
  value_hash bytea not null,
  value_last4 text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_identity_id, identifier_type, value_hash)
);

create table if not exists public.patient_portal_identities (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null unique references public.patient_identities(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  status text not null default 'unclaimed' check (status in ('unclaimed','active','disabled')),
  verified_at timestamptz,
  last_authenticated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_identity_match_audit (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id),
  patient_identity_id uuid references public.patient_identities(id),
  outcome text not null check (outcome in ('EXACT_MATCH','REVIEW_REQUIRED','NO_MATCH')),
  policy_version text not null,
  score integer not null,
  candidate_count integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.patient_clinic_relationships
  drop constraint if exists patient_clinic_relationships_tenant_id_clinic_patient_id_fkey;

alter table public.patient_clinic_relationships
  add constraint patient_clinic_relationships_tenant_clinic_patient_fk
  foreign key (tenant_id, clinic_patient_id)
  references public.clinic_patients(tenant_id, id);


alter table public.patient_identity_identifiers enable row level security;
alter table public.patient_portal_identities enable row level security;
alter table public.patient_identity_match_audit enable row level security;

revoke all on public.patient_identities from anon, authenticated;
revoke insert, update, delete on public.patient_clinic_relationships from anon, authenticated;
revoke all on public.patient_identity_identifiers from anon, authenticated;
revoke all on public.patient_identity_match_audit from anon, authenticated;

drop policy if exists patient_identity_self_read on public.patient_identities;
drop policy if exists patient_identity_self_insert on public.patient_identities;
drop policy if exists patient_identity_self_update on public.patient_identities;
drop policy if exists patient_relationship_self_read on public.patient_clinic_relationships;
drop policy if exists patient_relationship_self_insert on public.patient_clinic_relationships;

drop policy if exists clinic_patients_portal_patient_read on public.clinic_patients;
drop policy if exists communications_conversations_read on public.communication_conversations;
drop policy if exists communications_patient_conversations_insert on public.communication_conversations;
drop policy if exists communications_patient_conversations_read on public.communication_conversations;
drop policy if exists communications_message_attachments_delete on public.communication_message_attachments;
drop policy if exists communications_message_attachments_insert on public.communication_message_attachments;
drop policy if exists communications_message_attachments_select on public.communication_message_attachments;
drop policy if exists communications_messages_read on public.communication_messages;
drop policy if exists communications_patient_messages_insert on public.communication_messages;
drop policy if exists communications_patient_messages_read on public.communication_messages;
drop policy if exists master_agenda_events_patient_portal_read on public.master_agenda_events;
drop policy if exists medical_files_patient_portal_read on public.medical_files;
drop policy if exists patient_file_release_read on public.patient_portal_medical_file_releases;
drop policy if exists patient_messages_patient_insert on public.patient_portal_messages;
drop policy if exists patient_messages_read on public.patient_portal_messages;
drop policy if exists tenant_entitlements_scoped_read on public.tenant_entitlements;

create policy patient_portal_identity_self_read
  on public.patient_portal_identities for select to authenticated
  using ((select auth.uid()) = auth_user_id and status = 'active');

create policy patient_portal_identity_staff_read
  on public.patient_portal_identities for select to authenticated
  using (
    exists (
      select 1 from public.patient_clinic_relationships pcr
      join public.clinic_users cu on cu.tenant_id = pcr.tenant_id
      where pcr.patient_identity_id = patient_portal_identities.patient_identity_id
        and cu.auth_user_id = (select auth.uid())
        and cu.is_active = true
        and cu.deleted_at is null
    )
  );

create policy patient_relationship_portal_self_read
  on public.patient_clinic_relationships for select to authenticated
  using (
    exists (
      select 1 from public.patient_portal_identities ppi
      where ppi.patient_identity_id = patient_clinic_relationships.patient_identity_id
        and ppi.auth_user_id = (select auth.uid())
        and ppi.status = 'active'
    )
  );

create policy patient_relationship_staff_read
  on public.patient_clinic_relationships for select to authenticated
  using (
    exists (
      select 1 from public.clinic_users cu
      where cu.tenant_id = patient_clinic_relationships.tenant_id
        and cu.auth_user_id = (select auth.uid())
        and cu.is_active = true
        and cu.deleted_at is null
    )
  );

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
    if v_national is not null and exists (select 1 from public.patient_identity_identifiers pii where pii.patient_identity_id=r.id and pii.identifier_type='national_id' and pii.value_hash=digest(v_national,'sha256')) then v_score := v_score + 30; end if;
    if v_dob is not null and r.date_of_birth=v_dob then v_score := v_score + 25; end if;
    if lower(coalesce(r.father_name_normalized,''))=lower(v_father) then v_score := v_score + 20; end if;
    if lower(coalesce(r.family_name_normalized,''))=lower(v_family) then v_score := v_score + 15; end if;
    if lower(coalesce(r.first_name_normalized,''))=lower(v_first) then v_score := v_score + 12; end if;
    if v_mother is not null and lower(coalesce(r.mother_name_normalized,''))=lower(v_mother) then v_score := v_score + 8; end if;
    if lower(coalesce(r.gender,''))=v_gender then v_score := v_score + 5; end if;
    if v_phone is not null and r.phone_normalized=v_phone then v_score := v_score + 5; end if;
    if v_email is not null and r.email_normalized=v_email then v_score := v_score + 3; end if;
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
  if v_user is null or not exists(select 1 from public.clinic_users cu where cu.tenant_id=p_tenant_id and cu.auth_user_id=v_user and cu.is_active=true and cu.deleted_at is null) then
    return jsonb_build_object('success',false,'error','UNAUTHORIZED');
  end if;

  select patient_identity_id into v_identity
  from public.patient_clinic_relationships
  where tenant_id=p_tenant_id and clinic_patient_id=p_patient_id and deleted_at is null
  limit 1;

  if v_identity is null then return jsonb_build_object('success',false,'error','PATIENT_NOT_FOUND'); end if;

  update public.clinic_patients set
    first_name=coalesce(nullif(trim(p_registration->>'first_name'),''),first_name),
    last_name=coalesce(nullif(trim(p_registration->>'family_name'),''),last_name),
    father_name=coalesce(nullif(trim(p_registration->>'father_name'),''),father_name),
    family_name=coalesce(nullif(trim(p_registration->>'family_name'),''),family_name),
    mother_name=nullif(trim(p_registration->>'mother_name'),''),
    national_id=nullif(trim(p_registration->>'national_id'),''),
    phone_primary=coalesce(nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),''),phone_primary),
    email=nullif(lower(trim(p_registration->>'email')),''),
    date_of_birth=nullif(p_registration->>'date_of_birth','')::date,
    age_at_registration=nullif(p_registration->>'age_at_registration','')::integer,
    age_reference_date=coalesce(nullif(p_registration->>'age_reference_date','')::date,age_reference_date),
    gender=nullif(lower(trim(p_registration->>'gender')),''),
    updated_at=now()
  where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null;

  update public.patient_identities set
    first_name_normalized=lower(nullif(trim(p_registration->>'first_name'),'') ),
    father_name_normalized=lower(nullif(trim(p_registration->>'father_name'),'') ),
    family_name_normalized=lower(nullif(trim(p_registration->>'family_name'),'') ),
    mother_name_normalized=lower(nullif(trim(p_registration->>'mother_name'),'') ),
    date_of_birth=nullif(p_registration->>'date_of_birth','')::date,
    gender=lower(nullif(trim(p_registration->>'gender'),'') ),
    phone_normalized=nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),''),
    email_normalized=lower(nullif(trim(p_registration->>'email'),'') ),
    phone=nullif(regexp_replace(coalesce(p_registration->>'phone_primary',''),'[^0-9]+','','g'),''),
    email=lower(nullif(trim(p_registration->>'email'),'') ),
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
    and exists(select 1 from public.clinic_users cu where cu.tenant_id=p_tenant_id and cu.auth_user_id=auth.uid() and cu.is_active=true and cu.deleted_at is null)
    and (
      nullif(trim(p_query),'') is null
      or lower(cp.first_name||' '||cp.family_name||' '||coalesce(cp.father_name,'')||' '||cp.last_name) like '%'||lower(trim(p_query))||'%'
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

-- Seed system identity rows for existing patients only where no relationship exists.
insert into public.patient_identities(
  id,first_name_normalized,family_name_normalized,date_of_birth,gender,phone_normalized,email_normalized,phone,email,status,identity_state
)
select cp.id,
       lower(trim(cp.first_name)),
       lower(trim(coalesce(cp.family_name,cp.last_name))),
       cp.date_of_birth,
       lower(cp.gender),
       nullif(regexp_replace(coalesce(cp.phone_primary,''),'[^0-9]+','','g'),''),
       lower(nullif(trim(cp.email),'')),
       cp.phone_primary,
       cp.email,
       'active','active'
from public.clinic_patients cp
where cp.deleted_at is null
  and not exists(select 1 from public.patient_clinic_relationships pcr where pcr.clinic_patient_id=cp.id);

insert into public.patient_clinic_relationships(patient_identity_id,clinic_patient_id,tenant_id,status)
select cp.id,cp.id,cp.tenant_id,'active'
from public.clinic_patients cp
where cp.deleted_at is null
  and not exists(select 1 from public.patient_clinic_relationships pcr where pcr.clinic_patient_id=cp.id);

insert into public.patient_portal_identities(patient_identity_id,status)
select pi.id,'unclaimed'
from public.patient_identities pi
where not exists(select 1 from public.patient_portal_identities ppi where ppi.patient_identity_id=pi.id);

commit;
