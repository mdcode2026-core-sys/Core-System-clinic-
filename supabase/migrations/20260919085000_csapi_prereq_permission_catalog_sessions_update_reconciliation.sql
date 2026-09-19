BEGIN;

-- Reconcile the repository replay with the canonical permission catalog already
-- present in the live database and referenced by the existing application/RLS paths.
-- This is an additive catalog repair, not a new authorization model.

INSERT INTO public.permissions (
  permission_key,
  permission_name,
  description,
  resource,
  action
)
VALUES (
  'sessions:update',
  'Update Sessions',
  'Edit sessions',
  'sessions',
  'update'
)
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p
  ON p.permission_key = 'sessions:update'
WHERE r.role_key IN ('clinic_admin','doctor','receptionist','super_admin')
  AND r.is_system_role = true
ON CONFLICT DO NOTHING;

COMMIT;
