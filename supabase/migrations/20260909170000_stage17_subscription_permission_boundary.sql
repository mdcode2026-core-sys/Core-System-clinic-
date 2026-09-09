-- Stage 17: Subscription + Permission Boundary Repair
-- Extend the existing permission engine; do not introduce a parallel authorization model.
-- Full/enterprise plans retain the existing clinic-admin full catalogue behavior.
-- Non-full plans remain role/direct/override driven, but every resulting permission
-- is constrained by the tenant's active subscription/capability boundary.

CREATE OR REPLACE FUNCTION public.tenant_subscription_allows_permission(
  p_tenant_id uuid,
  p_permission_key text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH active_sub AS (
  SELECT sp.modules
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.tenant_id = p_tenant_id
    AND s.deleted_at IS NULL
    AND sp.deleted_at IS NULL
    AND sp.is_active = true
    AND (
      (s.status = 'active' AND (s.ends_at IS NULL OR s.ends_at > now()))
      OR
      (s.status = 'trial' AND (s.trial_ends_at IS NULL OR s.trial_ends_at > now()))
    )
  ORDER BY s.updated_at DESC NULLS LAST, s.created_at DESC NULLS LAST
  LIMIT 1
), perm AS (
  SELECT p.resource
  FROM public.permissions p
  WHERE p.permission_key = p_permission_key
    AND p.deleted_at IS NULL
  LIMIT 1
), full_plan AS (
  SELECT EXISTS (
    SELECT 1 FROM active_sub WHERE modules @> '["all"]'::jsonb
  ) AS allowed
), module_boundary AS (
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM active_sub) THEN false
    WHEN EXISTS (SELECT 1 FROM full_plan WHERE allowed) THEN true
    WHEN EXISTS (
      SELECT 1 FROM perm
      WHERE resource = 'analytics'
    ) THEN EXISTS (
      SELECT 1 FROM active_sub WHERE modules @> '["analytics"]'::jsonb
    )
    WHEN EXISTS (
      SELECT 1 FROM perm
      WHERE resource IN ('communications')
    ) THEN EXISTS (
      SELECT 1
      FROM public.tenant_entitlements te
      WHERE te.tenant_id = p_tenant_id
        AND te.deleted_at IS NULL
        AND te.status = 'active'
        AND te.effective_from <= now()
        AND (te.effective_until IS NULL OR te.effective_until > now())
        AND te.entitlement_key IN ('communication.email','communication.sms','communication.whatsapp')
    )
    WHEN EXISTS (
      SELECT 1 FROM perm
      WHERE resource IN ('inventory','purchasing','invoices','insurance','expenses')
    ) THEN EXISTS (
      SELECT 1
      FROM public.tenant_entitlements te
      WHERE te.tenant_id = p_tenant_id
        AND te.entitlement_key = 'financial_resources.core'
        AND te.deleted_at IS NULL
        AND te.status = 'active'
        AND te.effective_from <= now()
        AND (te.effective_until IS NULL OR te.effective_until > now())
    )
    ELSE EXISTS (
      SELECT 1 FROM active_sub WHERE modules @> '["basic"]'::jsonb OR modules @> '["advanced"]'::jsonb
    )
  END AS allowed
)
SELECT allowed FROM module_boundary;
$$;

REVOKE ALL ON FUNCTION public.tenant_subscription_allows_permission(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_effective_permissions(
  p_user_id uuid,
  p_tenant_id uuid
)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
  v_role_id uuid;
  v_role_key text;
  v_is_full boolean := false;
  v_permissions text[] := ARRAY[]::text[];
  v_all text[];
  v_key text;
  v_override_granted boolean;
  v_override_seen boolean;
BEGIN
  SELECT cu.id, cu.tenant_id, cu.role_id, r.role_key
    INTO v_user_id, v_tenant_id, v_role_id, v_role_key
  FROM public.clinic_users cu
  JOIN public.roles r ON r.id = cu.role_id AND r.deleted_at IS NULL
  WHERE cu.auth_user_id = auth.uid()
    AND (cu.id = p_user_id OR cu.auth_user_id = p_user_id)
    AND cu.tenant_id = p_tenant_id
    AND cu.deleted_at IS NULL
    AND cu.is_active = true
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN ARRAY[]::text[];
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE s.tenant_id = v_tenant_id
      AND s.deleted_at IS NULL
      AND sp.deleted_at IS NULL
      AND sp.is_active = true
      AND sp.modules @> '["all"]'::jsonb
      AND (
        (s.status = 'active' AND (s.ends_at IS NULL OR s.ends_at > now()))
        OR
        (s.status = 'trial' AND (s.trial_ends_at IS NULL OR s.trial_ends_at > now()))
      )
  ) INTO v_is_full;

  IF v_role_key = 'clinic_admin' AND v_is_full THEN
    SELECT COALESCE(array_agg(p.permission_key ORDER BY p.permission_key), ARRAY[]::text[])
      INTO v_all
    FROM public.permissions p
    WHERE p.deleted_at IS NULL;
    v_permissions := v_all;
  ELSE
    SELECT COALESCE(array_agg(p.permission_key ORDER BY p.permission_key), ARRAY[]::text[])
      INTO v_permissions
    FROM public.role_permissions rp
    JOIN public.permissions p ON p.id = rp.permission_id AND p.deleted_at IS NULL
    WHERE rp.role_id = v_role_id
      AND rp.deleted_at IS NULL;

    FOR v_key IN
      SELECT p.permission_key
      FROM public.clinic_user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id AND p.deleted_at IS NULL
      WHERE up.user_id = v_user_id
        AND up.tenant_id = v_tenant_id
        AND up.deleted_at IS NULL
    LOOP
      IF EXISTS (
        SELECT 1
        FROM public.clinic_user_permissions up
        JOIN public.permissions p ON p.id = up.permission_id
        WHERE up.user_id = v_user_id
          AND up.tenant_id = v_tenant_id
          AND up.deleted_at IS NULL
          AND p.permission_key = v_key
          AND up.granted = true
      ) THEN
        IF NOT (v_key = ANY(v_permissions)) THEN
          v_permissions := array_append(v_permissions, v_key);
        END IF;
      ELSE
        v_permissions := array_remove(v_permissions, v_key);
      END IF;
    END LOOP;
  END IF;

  -- The latest explicit override wins per permission and is always applied last.
  FOR v_key, v_override_granted IN
    SELECT p.permission_key, o.granted
    FROM public.clinic_user_permission_overrides o
    JOIN public.permissions p ON p.id = o.permission_id AND p.deleted_at IS NULL
    WHERE o.user_id = v_user_id
      AND o.tenant_id = v_tenant_id
      AND o.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.clinic_user_permission_overrides newer
        WHERE newer.user_id = o.user_id
          AND newer.tenant_id = o.tenant_id
          AND newer.permission_id = o.permission_id
          AND newer.deleted_at IS NULL
          AND (
            COALESCE(newer.updated_at, newer.created_at) > COALESCE(o.updated_at, o.created_at)
            OR (
              COALESCE(newer.updated_at, newer.created_at) = COALESCE(o.updated_at, o.created_at)
              AND newer.created_at > o.created_at
            )
          )
      )
  LOOP
    IF v_override_granted THEN
      IF NOT (v_key = ANY(v_permissions)) THEN
        v_permissions := array_append(v_permissions, v_key);
      END IF;
    ELSE
      v_permissions := array_remove(v_permissions, v_key);
    END IF;
  END LOOP;

  -- Subscription is the ceiling: no role/direct/override can escape it.
  v_permissions := COALESCE(ARRAY(
    SELECT key
    FROM unnest(v_permissions) AS key
    WHERE public.tenant_subscription_allows_permission(v_tenant_id, key)
    ORDER BY key
  ), ARRAY[]::text[]);

  RETURN v_permissions;
END;
$$;

REVOKE ALL ON FUNCTION public.get_effective_permissions(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_effective_permission(
  p_permission_key text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
SELECT p_permission_key = ANY(
  public.get_effective_permissions(
    p_user_id,
    COALESCE(public.get_current_tenant_id(), (
      SELECT cu.tenant_id
      FROM public.clinic_users cu
      WHERE cu.auth_user_id = auth.uid()
        AND cu.deleted_at IS NULL
        AND cu.is_active = true
      LIMIT 1
    ))
  )
);
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_permission(
  p_tenant_id uuid,
  p_permission_key text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
SELECT p_permission_key = ANY(
  public.get_effective_permissions(auth.uid(), p_tenant_id)
);
$$;

REVOKE ALL ON FUNCTION public.has_effective_permission(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_tenant_permission(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_effective_permission(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tenant_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_effective_permission(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_tenant_permission(uuid, text) TO service_role;
