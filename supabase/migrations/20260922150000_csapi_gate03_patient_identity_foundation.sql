begin;

alter table public.clinic_patients
  add column if not exists father_name text,
  add column if not exists family_name text,
  add column if not exists mother_name text,
  add column if not exists age_at_registration smallint,
  add column if not exists age_reference_date date;

create index if not exists idx_clinic_patients_identity_core
  on public.clinic_patients (tenant_id, date_of_birth, gender);

alter table public.patient_identities
  add column if not exists first_name_normalized text,
  add column if not exists father_name_normalized text,
  add column if not exists family_name_normalized text,
  add column if not exists mother_name_normalized text,
  add column if not exists date_of_birth date,
  add column if not exists age_at_registration smallint,
  add column if not exists age_reference_date date,
  add column if not exists gender text,
  add column if not exists phone_normalized text,
  add column if not exists email_normalized text,
  add column if not exists identity_state text not null default 'active';

create index if not exists idx_patient_identities_match_dob_gender
  on public.patient_identities (date_of_birth, gender);
create index if not exists idx_patient_identities_match_phone
  on public.patient_identities (phone_normalized);
create index if not exists idx_patient_identities_match_email
  on public.patient_identities (email_normalized);
create index if not exists idx_patient_identities_match_names
  on public.patient_identities (first_name_normalized, father_name_normalized, family_name_normalized);

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
  updated_at timestamptz not null default now(),
  check ((scope_type = 'system' and tenant_id is null) or (scope_type <> 'system' and tenant_id is not null))
);

create unique index if not exists uq_patient_identity_identifier_active
  on public.patient_identity_identifiers (
    scope_type,
    coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid),
    identifier_type,
    normalized_value
  )
  where is_current = true;

create index if not exists idx_patient_identity_identifiers_identity
  on public.patient_identity_identifiers(patient_identity_id);
create index if not exists idx_patient_identity_identifiers_lookup
  on public.patient_identity_identifiers(identifier_type, normalized_value);

create table if not exists public.patient_portal_identities (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null unique references public.patient_identities(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  status text not null default 'unclaimed' check (status in ('unclaimed','active','suspended','revoked')),
  verified_at timestamptz,
  last_authenticated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_portal_identities_auth_user
  on public.patient_portal_identities(auth_user_id);

create table if not exists public.patient_identity_match_decisions (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid references public.patient_identities(id) on delete set null,
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  clinic_patient_id uuid references public.clinic_patients(id) on delete set null,
  policy_version text not null,
  outcome text not null check (outcome in ('EXACT_MATCH','REVIEW_REQUIRED','NO_MATCH')),
  score numeric(6,2),
  candidate_count integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  strong_conflicts jsonb not null default '[]'::jsonb,
  actor_auth_user_id uuid references auth.users(id) on delete set null,
  reviewed_by_auth_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_match_decisions_tenant_created
  on public.patient_identity_match_decisions(tenant_id, created_at desc);
create index if not exists idx_patient_match_decisions_identity
  on public.patient_identity_match_decisions(patient_identity_id, created_at desc);

alter table public.patient_clinic_relationships
  add constraint patient_clinic_relationships_tenant_patient_fk
  foreign key (tenant_id, clinic_patient_id)
  references public.clinic_patients(tenant_id, id)
  not valid;

alter table public.patient_clinic_relationships
  validate constraint patient_clinic_relationships_tenant_patient_fk;

alter table public.clinic_patients
  drop constraint if exists uq_patient_phone;

alter table public.patient_identity_identifiers enable row level security;
alter table public.patient_portal_identities enable row level security;
alter table public.patient_identity_match_decisions enable row level security;

drop policy if exists patient_identity_identifier_staff_read on public.patient_identity_identifiers;
create policy patient_identity_identifier_staff_read
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
      and pcr.tenant_id = patient_identity_identifiers.tenant_id
      and pcr.status = 'active'
  )
);

drop policy if exists patient_portal_identity_self_read on public.patient_portal_identities;
create policy patient_portal_identity_self_read
on public.patient_portal_identities
for select to authenticated
using (auth_user_id = (select auth.uid()));

drop policy if exists patient_match_decision_staff_read on public.patient_identity_match_decisions;
create policy patient_match_decision_staff_read
on public.patient_identity_match_decisions
for select to authenticated
using (
  exists (
    select 1
    from public.clinic_users cu
    where cu.tenant_id = patient_identity_match_decisions.tenant_id
      and cu.auth_user_id = (select auth.uid())
      and cu.is_active = true
      and cu.deleted_at is null
  )
);

revoke all on public.patient_identity_identifiers from anon;
revoke all on public.patient_portal_identities from anon;
revoke all on public.patient_identity_match_decisions from anon;

grant select on public.patient_identity_identifiers, public.patient_portal_identities, public.patient_identity_match_decisions to authenticated;

commit;
