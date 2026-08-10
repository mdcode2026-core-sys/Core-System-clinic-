-- M2.0 Migration 01: Expand clinic_users.role CHECK constraint to 7 values
BEGIN;
ALTER TABLE public.clinic_users
DROP CONSTRAINT IF EXISTS clinic_users_role_check;
ALTER TABLE public.clinic_users
ADD CONSTRAINT clinic_users_role_check
CHECK (role IN ('super_admin','clinic_admin','clinic_owner','doctor','nurse','receptionist','accounting'));
COMMIT;
