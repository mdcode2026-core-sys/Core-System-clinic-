create table if not exists public.patient_portal_medical_file_releases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  clinic_patient_id uuid not null references public.clinic_patients(id) on delete cascade,
  medical_file_id uuid not null references public.medical_files(id) on delete cascade,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  released_at timestamptz not null default now(),
  released_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_patient_id, medical_file_id)
);
create index if not exists idx_patient_file_release_patient on public.patient_portal_medical_file_releases(clinic_patient_id,status);
create index if not exists idx_patient_file_release_file on public.patient_portal_medical_file_releases(medical_file_id,status);
alter table public.patient_portal_medical_file_releases enable row level security;
drop policy if exists patient_file_release_read on public.patient_portal_medical_file_releases;
create policy patient_file_release_read on public.patient_portal_medical_file_releases for select to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_medical_file_releases.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or exists (select 1 from public.patient_identities pi join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id where pcr.clinic_patient_id=patient_portal_medical_file_releases.clinic_patient_id and pcr.tenant_id=patient_portal_medical_file_releases.tenant_id and pcr.status='active' and pi.auth_user_id=(select auth.uid()) and pi.status='active')
);
drop policy if exists patient_file_release_staff_write on public.patient_portal_medical_file_releases;
create policy patient_file_release_staff_write on public.patient_portal_medical_file_releases for all to authenticated using (exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_medical_file_releases.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)) with check (exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_medical_file_releases.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null));
grant select on public.patient_portal_medical_file_releases to authenticated;
grant insert,update,delete on public.patient_portal_medical_file_releases to authenticated;

drop policy if exists medical_files_patient_portal_read on public.medical_files;
create policy medical_files_patient_portal_read on public.medical_files for select to authenticated using (
  exists (
    select 1 from public.patient_portal_medical_file_releases r
    join public.patient_identities pi on pi.auth_user_id=(select auth.uid())
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id and pcr.clinic_patient_id=r.clinic_patient_id and pcr.tenant_id=r.tenant_id and pcr.status='active'
    where r.medical_file_id=medical_files.id and r.status='active' and (r.expires_at is null or r.expires_at > now())
  )
);

create policy medical_files_patient_portal_storage_select on storage.objects for select to authenticated using (
  bucket_id='medical-files' and exists (
    select 1 from public.medical_files mf
    join public.patient_portal_medical_file_releases r on r.medical_file_id=mf.id and r.status='active' and (r.expires_at is null or r.expires_at > now())
    join public.patient_identities pi on pi.auth_user_id=(select auth.uid())
    join public.patient_clinic_relationships pcr on pcr.patient_identity_id=pi.id and pcr.clinic_patient_id=r.clinic_patient_id and pcr.tenant_id=r.tenant_id and pcr.status='active'
    where mf.storage_path=storage.objects.name and mf.tenant_id=r.tenant_id
  )
);
