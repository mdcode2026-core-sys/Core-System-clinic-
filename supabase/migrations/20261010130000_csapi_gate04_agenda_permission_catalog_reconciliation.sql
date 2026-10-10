BEGIN;

-- Gate 04: reconcile canonical Agenda permission keys referenced by application
-- authorization and the existing Agenda RLS policies, but absent from clean replay.
-- This is an additive catalogue repair; it does not change the permission engine.
INSERT INTO public.permissions (
  permission_key,
  permission_name,
  description,
  resource,
  action
)
VALUES
  ('agenda:read',   'Read Agenda',   'View clinic appointments',                 'agenda', 'read'),
  ('agenda:create', 'Create Agenda', 'Create clinic appointments',               'agenda', 'create'),
  ('agenda:update', 'Update Agenda', 'Update and manage appointment lifecycle',  'agenda', 'update'),
  ('agenda:delete', 'Delete Agenda', 'Delete appointments where explicitly authorized', 'agenda', 'delete')
ON CONFLICT (permission_key) DO UPDATE
SET permission_name = EXCLUDED.permission_name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    deleted_at = NULL;

-- Keep database role grants aligned with the existing application permissionMatrix:
-- clinic_admin: read/create/update/delete; doctor: read; receptionist: read/create/update.
-- Do not grant delete to receptionist or doctor, and do not activate unrelated roles.
WITH role_permission_keys(role_key, permission_key) AS (
  VALUES
    ('clinic_admin', 'agenda:read'),
    ('clinic_admin', 'agenda:create'),
    ('clinic_admin', 'agenda:update'),
    ('clinic_admin', 'agenda:delete'),
    ('doctor', 'agenda:read'),
    ('receptionist', 'agenda:read'),
    ('receptionist', 'agenda:create'),
    ('receptionist', 'agenda:update')
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM role_permission_keys mapping
JOIN public.roles r
  ON r.role_key = mapping.role_key
 AND r.is_system_role = true
 AND r.deleted_at IS NULL
JOIN public.permissions p
  ON p.permission_key = mapping.permission_key
 AND p.deleted_at IS NULL
ON CONFLICT (role_id, permission_id) DO UPDATE
SET deleted_at = NULL;

COMMIT;
