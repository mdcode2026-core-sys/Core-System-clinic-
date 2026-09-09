-- CORE SYSTEM Stage 17/21 — Follow-up feature-flag precedence hardening
-- Tenant-specific flag rows must take precedence over the global row.
-- This preserves the existing feature-flag model and prevents a disabled tenant override
-- from being resurrected by a matching global flag.

BEGIN;

CREATE OR REPLACE FUNCTION public.followup_automation_enabled(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE((
    SELECT f.is_enabled
    FROM public.master_tenants t
    JOIN public.feature_flags f
      ON f.flag_key = 'followup_automation'
     AND (f.tenant_id = p_tenant_id OR f.tenant_id IS NULL)
     AND f.deleted_at IS NULL
    WHERE t.id = p_tenant_id
      AND t.is_active = true
      AND t.deleted_at IS NULL
      AND (
        f.allowed_tiers IS NULL
        OR lower(
          CASE lower(t.subscription_tier)
            WHEN 'professional' THEN 'professional'
            WHEN 'pro' THEN 'pro'
            ELSE t.subscription_tier
          END
        ) = ANY (SELECT lower(x) FROM unnest(f.allowed_tiers) AS x)
      )
    ORDER BY
      (f.tenant_id IS NOT NULL) DESC,
      COALESCE(f.updated_at, f.created_at) DESC,
      f.created_at DESC,
      f.id DESC
    LIMIT 1
  ), false);
$function$;

COMMIT;
