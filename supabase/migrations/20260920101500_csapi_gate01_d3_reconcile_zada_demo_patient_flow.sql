BEGIN;

-- Canonical Patient Flow access permissions were historically introduced by Stage 6,
-- but the persistent database currently lacks the rows. Restore the canonical
-- permission definitions without changing the lifecycle authority model.
INSERT INTO public.permissions (permission_key, permission_name, description, resource, action)
VALUES
  ('patient_flow:operations', 'Access Patient Flow — Operations', 'Explicitly enable the Operations view of Patient Flow', 'patient_flow', 'operations'),
  ('patient_flow:clinical', 'Access Patient Flow — Clinical', 'Explicitly enable the Clinical view of Patient Flow', 'patient_flow', 'clinical'),
  ('patient_flow:administrative', 'Access Patient Flow — Administrative', 'Explicitly enable the Administrative view of Patient Flow', 'patient_flow', 'administrative')
ON CONFLICT (permission_key) DO UPDATE
SET permission_name = EXCLUDED.permission_name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    deleted_at = NULL;

-- Zada Clinic is the canonical full-subscription demo account. Keep the tenant
-- subscription tier aligned with its active Enterprise / modules=[all] subscription.
UPDATE public.master_tenants
SET subscription_tier = 'enterprise',
    subscription_start = COALESCE(subscription_start, now()),
    subscription_end = NULL,
    is_active = true,
    updated_at = now()
WHERE id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid;

-- Preserve the existing role model. Patient Flow surface access is an explicit
-- user permission, but the canonical Zada demo users should reflect their real
-- workspace responsibility: active doctors can enter Clinical Patient Flow and
-- active receptionists can operate the Operations Patient Flow. Clinic Admin is
-- deliberately not changed here: on the full [all] subscription it already
-- receives the complete permission catalogue through get_effective_permissions.
WITH admin_actor AS (
  SELECT id
  FROM public.clinic_users
  WHERE tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND role = 'clinic_admin'
    AND deleted_at IS NULL
    AND is_active = true
  ORDER BY created_at
  LIMIT 1
),
patient_flow_permissions AS (
  SELECT id, permission_key
  FROM public.permissions
  WHERE permission_key IN ('patient_flow:operations', 'patient_flow:clinical')
    AND deleted_at IS NULL
),
target_users AS (
  SELECT id, role
  FROM public.clinic_users
  WHERE tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND deleted_at IS NULL
    AND is_active = true
    AND role IN ('doctor', 'receptionist')
)
INSERT INTO public.clinic_user_permissions (tenant_id, user_id, permission_id, granted, created_by)
SELECT
  '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid,
  u.id,
  p.id,
  true,
  a.id
FROM target_users u
CROSS JOIN admin_actor a
JOIN patient_flow_permissions p ON (
  (u.role = 'doctor' AND p.permission_key = 'patient_flow:clinical')
  OR
  (u.role = 'receptionist' AND p.permission_key = 'patient_flow:operations')
)
ON CONFLICT (tenant_id, user_id, permission_id)
DO UPDATE SET granted = true, deleted_at = NULL, updated_at = now();

COMMIT;
