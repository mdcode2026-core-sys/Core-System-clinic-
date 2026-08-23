create extension if not exists pgcrypto;

create table if not exists public.capabilities (
  key text primary key,
  description text not null,
  is_core boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  key text primary key,
  description text not null,
  entitlement_type text not null default 'feature' check (entitlement_type in ('feature','add_on','channel','resource')),
  created_at timestamptz not null default now()
);

create table if not exists public.entitlement_capabilities (
  entitlement_key text not null references public.entitlements(key) on delete cascade,
  capability_key text not null references public.capabilities(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entitlement_key, capability_key)
);

create table if not exists public.tenant_entitlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  entitlement_key text not null references public.entitlements(key) on delete restrict,
  status text not null default 'active' check (status in ('active','suspended','expired','revoked')),
  source text not null default 'manual' check (source in ('base_plan','add_on','manual_super_admin','trial','promotion','system')),
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, entitlement_key)
);
create index if not exists idx_tenant_entitlements_tenant on public.tenant_entitlements(tenant_id);
create index if not exists idx_tenant_entitlements_active on public.tenant_entitlements(tenant_id, entitlement_key, status);

create table if not exists public.patient_identities (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending','active','suspended','revoked')),
  verified_at timestamptz,
  last_authenticated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table if not exists public.patient_clinic_relationships (
  id uuid primary key default gen_random_uuid(),
  patient_identity_id uuid not null references public.patient_identities(id) on delete cascade,
  clinic_patient_id uuid not null references public.clinic_patients(id) on delete cascade,
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  status text not null default 'active' check (status in ('pending','active','suspended','revoked')),
  consent_scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_identity_id, clinic_patient_id),
  unique (patient_identity_id, tenant_id)
);
create index if not exists idx_patient_relationship_identity on public.patient_clinic_relationships(patient_identity_id);
create index if not exists idx_patient_relationship_tenant_patient on public.patient_clinic_relationships(tenant_id, clinic_patient_id);

create table if not exists public.patient_portal_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  clinic_patient_id uuid not null references public.clinic_patients(id) on delete cascade,
  channel text not null check (channel in ('email','sms','whatsapp')),
  destination text not null,
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','sent','claimed','expired','revoked','failed')),
  fallback_channel text check (fallback_channel in ('email','sms','whatsapp')),
  expires_at timestamptz not null,
  sent_at timestamptz,
  claimed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_portal_invitation_tenant_patient on public.patient_portal_invitations(tenant_id, clinic_patient_id);
create index if not exists idx_portal_invitation_active on public.patient_portal_invitations(token_hash, status, expires_at);

insert into public.entitlements(key, description, entitlement_type) values
  ('patient_portal', 'Included patient-facing portal access', 'feature'),
  ('patient_experience.advanced', 'Advanced patient experience add-on', 'add_on'),
  ('communication.email', 'Patient communication by email', 'channel'),
  ('communication.sms', 'Patient communication by SMS', 'channel'),
  ('communication.whatsapp', 'Patient communication by WhatsApp', 'channel')
on conflict (key) do nothing;

insert into public.capabilities(key, description, is_core) values
  ('patient_portal.access', 'Access the patient portal', false),
  ('patient_portal.profile', 'View patient profile', false),
  ('patient_portal.appointments', 'View patient appointments', false),
  ('patient_portal.medical_files', 'View released medical files', false),
  ('patient_experience.messaging', 'Advanced patient messaging', false),
  ('patient_experience.forms', 'Advanced patient forms', false),
  ('patient_experience.consent', 'Digital consent workflows', false),
  ('patient_experience.uploads', 'Patient uploads', false),
  ('communication.email', 'Send patient email communication', false),
  ('communication.sms', 'Send patient SMS communication', false),
  ('communication.whatsapp', 'Send patient WhatsApp communication', false)
on conflict (key) do nothing;

insert into public.entitlement_capabilities(entitlement_key, capability_key) values
  ('patient_portal','patient_portal.access'),
  ('patient_portal','patient_portal.profile'),
  ('patient_portal','patient_portal.appointments'),
  ('patient_portal','patient_portal.medical_files'),
  ('patient_experience.advanced','patient_experience.messaging'),
  ('patient_experience.advanced','patient_experience.forms'),
  ('patient_experience.advanced','patient_experience.consent'),
  ('patient_experience.advanced','patient_experience.uploads'),
  ('communication.email','communication.email'),
  ('communication.sms','communication.sms'),
  ('communication.whatsapp','communication.whatsapp')
on conflict do nothing;

alter table public.capabilities enable row level security;
alter table public.entitlements enable row level security;
alter table public.entitlement_capabilities enable row level security;
alter table public.tenant_entitlements enable row level security;
alter table public.patient_identities enable row level security;
alter table public.patient_clinic_relationships enable row level security;
alter table public.patient_portal_invitations enable row level security;

drop policy if exists capabilities_authenticated_read on public.capabilities;
create policy capabilities_authenticated_read on public.capabilities for select to authenticated using (true);
drop policy if exists entitlements_authenticated_read on public.entitlements;
create policy entitlements_authenticated_read on public.entitlements for select to authenticated using (true);
drop policy if exists entitlement_capabilities_authenticated_read on public.entitlement_capabilities;
create policy entitlement_capabilities_authenticated_read on public.entitlement_capabilities for select to authenticated using (true);
drop policy if exists tenant_entitlements_scoped_read on public.tenant_entitlements;
create policy tenant_entitlements_scoped_read on public.tenant_entitlements for select to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id = tenant_entitlements.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null)
  or exists (select 1 from public.patient_clinic_relationships pcr join public.patient_identities pi on pi.id = pcr.patient_identity_id where pcr.tenant_id = tenant_entitlements.tenant_id and pcr.status = 'active' and pi.auth_user_id = (select auth.uid()) and pi.status = 'active')
);
drop policy if exists patient_identity_self_read on public.patient_identities;
create policy patient_identity_self_read on public.patient_identities for select to authenticated using (auth_user_id = (select auth.uid()));
drop policy if exists patient_identity_self_insert on public.patient_identities;
create policy patient_identity_self_insert on public.patient_identities for insert to authenticated with check (auth_user_id = (select auth.uid()));
drop policy if exists patient_identity_self_update on public.patient_identities;
create policy patient_identity_self_update on public.patient_identities for update to authenticated using (auth_user_id = (select auth.uid())) with check (auth_user_id = (select auth.uid()));
drop policy if exists patient_relationship_self_read on public.patient_clinic_relationships;
create policy patient_relationship_self_read on public.patient_clinic_relationships for select to authenticated using (
  exists (select 1 from public.patient_identities pi where pi.id = patient_clinic_relationships.patient_identity_id and pi.auth_user_id = (select auth.uid()) and pi.status = 'active')
  or exists (select 1 from public.clinic_users cu where cu.tenant_id = patient_clinic_relationships.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null)
);
drop policy if exists patient_relationship_self_insert on public.patient_clinic_relationships;
create policy patient_relationship_self_insert on public.patient_clinic_relationships for insert to authenticated with check (
  exists (select 1 from public.patient_identities pi where pi.id = patient_clinic_relationships.patient_identity_id and pi.auth_user_id = (select auth.uid()))
  or exists (select 1 from public.clinic_users cu where cu.tenant_id = patient_clinic_relationships.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null)
);
drop policy if exists portal_invitation_staff_read on public.patient_portal_invitations;
create policy portal_invitation_staff_read on public.patient_portal_invitations for select to authenticated using (exists (select 1 from public.clinic_users cu where cu.tenant_id = patient_portal_invitations.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null));
drop policy if exists portal_invitation_staff_insert on public.patient_portal_invitations;
create policy portal_invitation_staff_insert on public.patient_portal_invitations for insert to authenticated with check (exists (select 1 from public.clinic_users cu where cu.tenant_id = patient_portal_invitations.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null));
drop policy if exists portal_invitation_staff_update on public.patient_portal_invitations;
create policy portal_invitation_staff_update on public.patient_portal_invitations for update to authenticated using (exists (select 1 from public.clinic_users cu where cu.tenant_id = patient_portal_invitations.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null)) with check (exists (select 1 from public.clinic_users cu where cu.tenant_id = patient_portal_invitations.tenant_id and cu.auth_user_id = (select auth.uid()) and cu.is_active = true and cu.deleted_at is null));

grant select on public.capabilities, public.entitlements, public.entitlement_capabilities, public.tenant_entitlements, public.patient_identities, public.patient_clinic_relationships, public.patient_portal_invitations to authenticated;
grant insert, update on public.patient_identities, public.patient_clinic_relationships, public.patient_portal_invitations to authenticated;
