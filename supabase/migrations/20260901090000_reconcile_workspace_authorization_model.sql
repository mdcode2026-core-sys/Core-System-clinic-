BEGIN;

-- Workspace assignment and Patient Flow classification are not authorization permissions.
-- Runtime now uses clinic_user_workspaces for assignment and clinic-admin authority for the background flow console.
DELETE FROM public.permissions
WHERE permission_key IN (
  'workspace:operation',
  'workspace:clinical',
  'workspace:administration',
  'patient_flow:operations',
  'patient_flow:clinical',
  'patient_flow:administrative'
);

COMMIT;
