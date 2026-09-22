-- CSAPI Gate 03 — Patient & Identity foundation
-- Prepared on the approved implementation branch. Do not apply to production
-- until the Gate 03 rollout verification sequence is complete.

alter table public.clinic_patients
  add column if not exists father_name text,
  add column if not exists family_name text,
  add column if not exists mother_name text,
  add column if not exists national_id text,
  add column if not exists age_at_registration smallint,
  add column if not exists age_reference_date date;

alter table public.patient_identities
  add column if not exists first_name_norm text,
  add column if not exists father_name_norm text,
  add column if not exists family_name_norm text,
  add column if not exists mother_name_norm text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists phone_norm text,
  add column if not exists email_norm text,
  add column if not exists age_at_registration smallint,
  add column if not exists age_reference_date date,
  add column if not exists superseded_by uuid references public.patient_identities(id),
  add column if not exists identity_state text not null default 'active'
    check (identity_state in ('active','superseded','review_required','revoked'));

create table if not exists public.patient_identity_identifiers (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null references public.patient_identities(id) on delete cascade,
  identifier_type text not null,
  normalized_value text not null,
  display_value text,
  scope_type text not null default 'system' check (scope_type in ('system','clinic','external')),
  tenant_id uuid references public.master_tenants(id) on delete cascade,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','rejected')),
  is_current boolean not null default true,
  valid_from timestamptz,
  valid_to timestamptz,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_patient_identity_identifier_current
  on public.patient_identity_identifiers(identifier_type, normalized_value, scope_type, coalesce(tenant_id,'00000000-0000-0000-0000-000000000000'::uuid))
  where is_current = true;

create index if not exists idx_patient_identity_identifiers_identity
  on public.patient_identity_identifiers(patient_identity_id);

create index if not exists idx_patient_identity_match_phone
  on public.patient_identities(phone_norm)
  where phone_norm is not null and identity_state = 'active';

create index if not exists idx_patient_identity_match_name
  on public.patient_identities(first_name_norm, father_name_norm, family_name_norm)
  where identity_state = 'active';

create index if not exists idx_patient_identity_match_dob
  on public.patient_identities(date_of_birth)
  where date_of_birth is not null and identity_state = 'active';

create table if not exists public.patient_portal_identities (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null references public.patient_identities(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  status text not null default 'unclaimed'
    check (status in ('unclaimed','active','suspended','revoked')),
  verified_at timestamptz,
  last_authenticated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_identity_id)
);

create index if not exists idx_patient_portal_identity_auth_user
  on public.patient_portal_identities(auth_user_id)
  where auth_user_id is not null;

alter table public.patient_clinic_relationships
  drop constraint if exists patient_clinic_relationships_tenant_clinic_patient_fkey;

alter table public.patient_clinic_relationships
  add constraint patient_clinic_relationships_tenant_clinic_patient_fkey
  foreign key (tenant_id, clinic_patient_id)
  references public.clinic_patients(tenant_id, id)
  on delete cascade;

create table if not exists public.patient_identity_match_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  clinic_patient_id uuid references public.clinic_patients(id) on delete set null,
  patient_identity_id uuid references public.patient_identities(id) on delete set null,
  candidate_identity_id uuid references public.patient_identities(id) on delete set null,
  policy_version text not null,
  result text not null check (result in ('EXACT_MATCH','REVIEW_REQUIRED','NO_MATCH')),
  score smallint not null check (score between 0 and 100),
  evidence jsonb not null default '{}'::jsonb,
  strong_conflict boolean not null default false,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_identity_match_decisions_patient
  on public.patient_identity_match_decisions(clinic_patient_id, created_at desc);

create index if not exists idx_patient_identity_match_decisions_identity
  on public.patient_identity_match_decisions(patient_identity_id, created_at desc);

create table if not exists public.patient_identity_audit (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null references public.patient_identities(id) on delete cascade,
  tenant_id uuid references public.master_tenants(id) on delete set null,
  action text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_identity_audit_identity
  on public.patient_identity_audit(patient_identity_id, created_at desc);

-- Portal authentication is being separated from canonical Patient Identity.
-- Keep auth_user_id temporarily for compatibility until all application lookups
-- are migrated; it is not used as the canonical identity key by Gate 03.
create or replace function public.ensure_patient_portal_identity(p_patient_identity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.patient_portal_identities(patient_identity_id, status)
  values (p_patient_identity_id, 'unclaimed')
  on conflict (patient_identity_id) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id
    from public.patient_portal_identities
    where patient_identity_id = p_patient_identity_id;
  end if;

  return v_id;
end;
$$;

revoke all on function public.ensure_patient_portal_identity(uuid) from public, anon, authenticated;

alter table public.patient_identity_identifiers enable row level security;
alter table public.patient_portal_identities enable row level security;
alter table public.patient_identity_match_decisions enable row level security;
alter table public.patient_identity_audit enable row level security;

drop policy if exists patient_portal_identity_self_read on public.patient_portal_identities;
create policy patient_portal_identity_self_read
on public.patient_portal_identities
for select to authenticated
using (auth_user_id = (select auth.uid()));

drop policy if exists patient_portal_identity_self_update on public.patient_portal_identities;
create policy patient_portal_identity_self_update
on public.patient_portal_identities
for update to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()));

drop policy if exists patient_identity_identifiers_staff_read on public.patient_identity_identifiers;
create policy patient_identity_identifiers_staff_read
on public.patient_identity_identifiers
for select to authenticated
using (
  exists (
    select 1
    from public.patient_clinic_relationships pcr
    join public.clinic_users cu
      on cu.tenant_id = pcr.tenant_id
     and cu.auth_user_id = (select auth.uid())
     and cu.is_active = true
     and cu.deleted_at is null
    where pcr.patient_identity_id = patient_identity_identifiers.patient_identity_id
      and pcr.status = 'active'
  )
);

drop policy if exists patient_identity_match_decisions_staff_read on public.patient_identity_match_decisions;
create policy patient_identity_match_decisions_staff_read
on public.patient_identity_match_decisions
for select to authenticated
using (
  exists (
    select 1 from public.clinic_users cu
    where cu.tenant_id = patient_identity_match_decisions.tenant_id
      and cu.auth_user_id = (select auth.uid())
      and cu.is_active = true
      and cu.deleted_at is null
  )
);

drop policy if exists patient_identity_audit_staff_read on public.patient_identity_audit;
create policy patient_identity_audit_staff_read
on public.patient_identity_audit
for select to authenticated
using (
  exists (
    select 1 from public.clinic_users cu
    where cu.tenant_id = patient_identity_audit.tenant_id
      and cu.auth_user_id = (select auth.uid())
      and cu.is_active = true
      and cu.deleted_at is null
  )
);

grant select on public.patient_identity_identifiers, public.patient_portal_identities,
  public.patient_identity_match_decisions, public.patient_identity_audit to authenticated;

-- Canonical identity must no longer be self-created/edited by a patient.
drop policy if exists patient_identity_self_insert on public.patient_identities;
drop policy if exists patient_identity_self_update on public.patient_identities;

-- Do not yet drop auth_user_id. Portal application migration must land first.
