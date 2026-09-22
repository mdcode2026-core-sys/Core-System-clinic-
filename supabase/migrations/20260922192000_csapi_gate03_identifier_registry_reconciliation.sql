begin;

-- Complete the governed identifier registry required by the approved Gate 03 design.
alter table public.patient_identity_identifiers
  add column if not exists scope_type text not null default 'system',
  add column if not exists tenant_id uuid references public.master_tenants(id),
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists is_current boolean not null default true,
  add column if not exists valid_from timestamptz not null default now(),
  add column if not exists valid_to timestamptz,
  add column if not exists source text;

create index if not exists idx_patient_identity_identifiers_tenant_current
  on public.patient_identity_identifiers(tenant_id, identifier_type)
  where is_current=true;

update public.patient_identity_identifiers
set verification_status = case when verified_at is not null then 'verified' else 'unverified' end
where verification_status is null or verification_status='unverified';

commit;
