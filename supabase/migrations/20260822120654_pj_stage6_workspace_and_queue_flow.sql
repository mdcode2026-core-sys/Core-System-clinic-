BEGIN;

ALTER TABLE public.clinic_visit_sessions
  DROP CONSTRAINT IF EXISTS clinic_visit_sessions_session_status_check;

ALTER TABLE public.clinic_visit_sessions
  ADD CONSTRAINT clinic_visit_sessions_session_status_check
  CHECK ((session_status)::text = ANY (ARRAY[
    'waiting'::text,
    'in_consultation'::text,
    'pending_close'::text,
    'completed'::text,
    'cancelled'::text,
    'no_show'::text
  ]));

INSERT INTO public.permissions (permission_key, permission_name, description, resource, action)
VALUES
  ('workspace:operation', 'Access Operation Workspace', 'Access the operational patient-flow workspace', 'workspace', 'operation'),
  ('workspace:clinical', 'Access Clinical Workspace', 'Access the clinical patient-work workspace', 'workspace', 'clinical'),
  ('workspace:administration', 'Access Administration Workspace', 'Access the tenant administration workspace', 'workspace', 'administration')
ON CONFLICT (permission_key) DO UPDATE
SET permission_name = EXCLUDED.permission_name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.role_key IN ('receptionist','clinic_admin','super_admin') AND p.permission_key = 'workspace:operation'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.role_key IN ('doctor','clinic_admin','super_admin') AND p.permission_key = 'workspace:clinical'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.role_key IN ('clinic_admin','super_admin') AND p.permission_key = 'workspace:administration'
ON CONFLICT DO NOTHING;

COMMIT;
