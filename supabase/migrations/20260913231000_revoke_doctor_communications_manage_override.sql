-- Communications authorization boundary correction.
-- The Communications role contract grants communications:manage to Clinic Admin,
-- not Clinical users. Remove any direct manage grant from doctor users so a
-- user-level override cannot elevate a clinical role into management authority.

UPDATE public.clinic_user_permissions cup
SET granted = false,
    updated_at = now()
FROM public.clinic_users cu
JOIN public.roles r ON r.id = cu.role_id
JOIN public.permissions p ON p.id = cup.permission_id
WHERE cup.user_id = cu.id
  AND cup.tenant_id = cu.tenant_id
  AND r.role_key = 'doctor'
  AND p.permission_key = 'communications:manage'
  AND cup.granted = true
  AND cup.deleted_at IS NULL;
