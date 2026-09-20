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

-- Preserve the established role model: Patient Flow access is explicit per user,
-- not automatically granted by role. Seed the canonical demo users only.
WITH target_permissions AS (
  SELECT id, permission_key
  FROM public.permissions
  WHERE permission_key IN (
    'patient_flow:operations',
    'patient_flow:clinical',
    'patient_flow:administrative'
  )
    AND deleted_at IS NULL
),
target_users AS (
  SELECT id, full_name
  FROM public.clinic_users
  WHERE tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND id IN (
      '0e6e6030-121b-4e1a-bf14-ebbd18c19e4f'::uuid,
      '1fecee33-6021-4c29-bca4-7cc94da598fd'::uuid,
      '4d3896f8-51f8-44ce-934a-ba3fc1c5b58d'::uuid
    )
)
INSERT INTO public.clinic_user_permissions (tenant_id, user_id, permission_id, granted, created_by)
SELECT
  '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid,
  u.id,
  p.id,
  true,
  '0e6e6030-121b-4e1a-bf14-ebbd18c19e4f'::uuid
FROM target_users u
JOIN target_permissions p ON
  (u.id = '0e6e6030-121b-4e1a-bf14-ebbd18c19e4f'::uuid AND p.permission_key IN ('patient_flow:operations','patient_flow:clinical','patient_flow:administrative'))
  OR
  (u.id = '1fecee33-6021-4c29-bca4-7cc94da598fd'::uuid AND p.permission_key = 'patient_flow:clinical')
  OR
  (u.id = '4d3896f8-51f8-44ce-934a-ba3fc1c5b58d'::uuid AND p.permission_key = 'patient_flow:operations')
ON CONFLICT (tenant_id, user_id, permission_id)
DO UPDATE SET granted = true, deleted_at = NULL, updated_at = now();

COMMIT;
