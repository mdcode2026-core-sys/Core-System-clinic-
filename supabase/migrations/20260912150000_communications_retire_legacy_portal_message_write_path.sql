-- Phase 1 closure: patient_portal_messages is retained only as historical migration/audit data.
-- Communications is now the sole operational messaging authority.
-- Prevent new application writes to the legacy table so the deprecated path cannot
-- become a second messaging authority again.

revoke insert, update, delete on public.patient_portal_messages from authenticated;
