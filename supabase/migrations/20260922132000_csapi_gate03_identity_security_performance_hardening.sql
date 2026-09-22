begin;

create index if not exists idx_patient_clinic_relationships_tenant_patient
  on public.patient_clinic_relationships(tenant_id,clinic_patient_id);
create index if not exists idx_patient_clinic_relationships_identity_tenant
  on public.patient_clinic_relationships(patient_identity_id,tenant_id);
create index if not exists idx_patient_identity_identifiers_hash
  on public.patient_identity_identifiers(identifier_type,value_hash);
create index if not exists idx_patient_portal_identities_auth
  on public.patient_portal_identities(auth_user_id)
  where auth_user_id is not null;

create policy patient_identity_deny_direct_access
  on public.patient_identities for all to authenticated
  using (false) with check (false);

create policy patient_identity_identifiers_deny_direct_access
  on public.patient_identity_identifiers for all to authenticated
  using (false) with check (false);

create policy patient_identity_match_audit_deny_direct_access
  on public.patient_identity_match_audit for all to authenticated
  using (false) with check (false);

commit;
