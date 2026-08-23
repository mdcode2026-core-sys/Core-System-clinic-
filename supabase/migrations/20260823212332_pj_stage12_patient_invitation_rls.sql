drop policy if exists portal_invitation_patient_read on public.patient_portal_invitations;
create policy portal_invitation_patient_read on public.patient_portal_invitations for select to authenticated using (
  (channel = 'email' and lower(destination) = lower(coalesce((select auth.jwt() ->> 'email'), '')))
  or
  (channel in ('sms','whatsapp') and regexp_replace(destination, '[^0-9+]', '', 'g') = regexp_replace(coalesce((select auth.jwt() ->> 'phone'), ''), '[^0-9+]', '', 'g'))
);
drop policy if exists portal_invitation_patient_claim on public.patient_portal_invitations;
create policy portal_invitation_patient_claim on public.patient_portal_invitations for update to authenticated using (
  (channel = 'email' and lower(destination) = lower(coalesce((select auth.jwt() ->> 'email'), '')))
  or
  (channel in ('sms','whatsapp') and regexp_replace(destination, '[^0-9+]', '', 'g') = regexp_replace(coalesce((select auth.jwt() ->> 'phone'), ''), '[^0-9+]', '', 'g'))
) with check (status in ('claimed','expired','revoked','failed'));
grant update on public.patient_portal_invitations to authenticated;
