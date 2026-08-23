create index if not exists idx_entitlement_capabilities_capability on public.entitlement_capabilities(capability_key);
create index if not exists idx_tenant_entitlements_entitlement on public.tenant_entitlements(entitlement_key);
create index if not exists idx_patient_relationship_clinic_patient on public.patient_clinic_relationships(clinic_patient_id);
create index if not exists idx_patient_portal_invitations_created_by on public.patient_portal_invitations(created_by);
create index if not exists idx_patient_portal_invitations_clinic_patient on public.patient_portal_invitations(clinic_patient_id);

drop policy if exists portal_invitation_staff_read on public.patient_portal_invitations;
drop policy if exists portal_invitation_patient_read on public.patient_portal_invitations;
create policy portal_invitation_read on public.patient_portal_invitations for select to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_invitations.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or (channel='email' and lower(destination)=lower(coalesce(((select auth.jwt()) ->> 'email'), '')))
  or (channel in ('sms','whatsapp') and regexp_replace(destination,'[^0-9+]','','g')=regexp_replace(coalesce(((select auth.jwt()) ->> 'phone'), ''),'[^0-9+]','','g'))
);

drop policy if exists portal_invitation_staff_update on public.patient_portal_invitations;
drop policy if exists portal_invitation_patient_claim on public.patient_portal_invitations;
create policy portal_invitation_update on public.patient_portal_invitations for update to authenticated using (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_invitations.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or (channel='email' and lower(destination)=lower(coalesce(((select auth.jwt()) ->> 'email'), '')))
  or (channel in ('sms','whatsapp') and regexp_replace(destination,'[^0-9+]','','g')=regexp_replace(coalesce(((select auth.jwt()) ->> 'phone'), ''),'[^0-9+]','','g'))
) with check (
  exists (select 1 from public.clinic_users cu where cu.tenant_id=patient_portal_invitations.tenant_id and cu.auth_user_id=(select auth.uid()) and cu.is_active=true and cu.deleted_at is null)
  or status in ('claimed','expired','revoked','failed')
);
