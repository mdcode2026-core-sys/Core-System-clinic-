BEGIN;

INSERT INTO public.permissions (permission_key, permission_name, description, resource, action)
VALUES
  ('patient_flow:operations', 'Access Patient Flow — Operations', 'Explicitly enable the Operations view of Patient Flow', 'patient_flow', 'operations'),
  ('patient_flow:clinical', 'Access Patient Flow — Clinical', 'Explicitly enable the Clinical view of Patient Flow', 'patient_flow', 'clinical'),
  ('patient_flow:administrative', 'Access Patient Flow — Administrative', 'Explicitly enable the Administrative view of Patient Flow', 'patient_flow', 'administrative')
ON CONFLICT (permission_key) DO UPDATE
SET permission_name = EXCLUDED.permission_name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action;

-- Intentionally no role grants are created here. Patient Flow visibility is an explicit
-- Clinic Admin permission assignment, not an automatic consequence of a role/workspace.

COMMIT;
