-- Communications authorization boundary correction.
-- The Communications role contract grants communications:manage to Clinic Admin,
-- not Clinical users. Remove any direct manage grant from doctor users so a
-- user-level override cannot elevate a clinical role into management authority.

UPDATE public.clinic_user_permissions
SET granted = false,
    updated_at = now()
WHERE id IN (
  SELECT cup.id
  FROM public.clinic_user_permissions cup
  JOIN public.clinic_users cu
    ON cu.id = cup.user_id
   AND cu.tenant_id = cup.tenant_id
  JOIN public.roles r
    ON r.id = cu.role_id
  JOIN public.permissions p
    ON p.id = cup.permission_id
  WHERE r.role_key = 'doctor'
    AND p.permission_key = 'communications:manage'
    AND cup.granted = true
    AND cup.deleted_at IS NULL
);