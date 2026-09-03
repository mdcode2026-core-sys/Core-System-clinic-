-- 1.1: has_effective_permission must resolve role permissions from clinic_users.role_id only.
CREATE OR REPLACE FUNCTION public.has_effective_permission(p_permission_key text, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH u AS (
  SELECT cu.id,cu.tenant_id,cu.role_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id=auth.uid()
    AND (cu.id=p_user_id OR cu.auth_user_id=p_user_id)
    AND cu.deleted_at IS NULL
    AND cu.is_active=true
  LIMIT 1
), base AS (
  SELECT 1 FROM u JOIN public.roles r ON r.id=u.role_id JOIN public.role_permissions rp ON rp.role_id=r.id JOIN public.permissions p ON p.id=rp.permission_id WHERE p.permission_key=p_permission_key
), direct AS (
  SELECT 1 FROM u JOIN public.clinic_user_permissions up ON up.user_id=u.id AND up.tenant_id=u.tenant_id AND up.granted AND up.deleted_at IS NULL JOIN public.permissions p ON p.id=up.permission_id WHERE p.permission_key=p_permission_key
), override AS (
  SELECT o.granted FROM u JOIN public.clinic_user_permission_overrides o ON o.user_id=u.id AND o.tenant_id=u.tenant_id AND o.deleted_at IS NULL JOIN public.permissions p ON p.id=o.permission_id WHERE p.permission_key=p_permission_key ORDER BY o.updated_at DESC NULLS LAST,o.created_at DESC LIMIT 1
), admin AS (
  SELECT 1 FROM u JOIN public.roles r ON r.id=u.role_id WHERE r.role_key='clinic_admin'
)
SELECT CASE WHEN EXISTS(SELECT 1 FROM admin) THEN true WHEN EXISTS(SELECT 1 FROM override WHERE granted=false) THEN false WHEN EXISTS(SELECT 1 FROM override WHERE granted=true) THEN true ELSE EXISTS(SELECT 1 FROM base) OR EXISTS(SELECT 1 FROM direct) END;
$$;
