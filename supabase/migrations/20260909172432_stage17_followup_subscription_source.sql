BEGIN;

-- The active subscription row is the authoritative capability source.
-- master_tenants.subscription_tier is retained for compatibility but is not used
-- to decide feature-flag eligibility.

CREATE OR REPLACE FUNCTION public.followup_automation_enabled(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH active_sub AS (
    SELECT lower(sp.plan_key) AS plan_key
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
    ORDER BY s.created_at DESC
    LIMIT 1
  ), candidates AS (
    SELECT
      f.is_enabled,
      f.tenant_id,
      f.allowed_tiers,
      COALESCE((SELECT plan_key FROM active_sub), '') AS plan_key,
      COALESCE(f.updated_at, f.created_at) AS precedence_at,
      f.created_at,
      f.id
    FROM public.feature_flags f
    JOIN public.master_tenants t ON t.id = p_tenant_id
    WHERE f.flag_key = 'followup_automation'
      AND (f.tenant_id = p_tenant_id OR f.tenant_id IS NULL)
      AND f.deleted_at IS NULL
      AND t.is_active = true
      AND t.deleted_at IS NULL
  )
  SELECT COALESCE((
    SELECT c.is_enabled
    FROM candidates c
    WHERE c.allowed_tiers IS NULL
       OR EXISTS (
         SELECT 1
         FROM unnest(c.allowed_tiers) AS x
         WHERE lower(x) = c.plan_key
            OR (lower(x) = 'professional' AND c.plan_key = 'pro')
            OR (lower(x) = 'pro' AND c.plan_key = 'professional')
            OR (lower(x) = 'full' AND c.plan_key = 'enterprise')
            OR (lower(x) = 'enterprise' AND c.plan_key = 'full')
       )
    ORDER BY (c.tenant_id IS NOT NULL) DESC,
             c.precedence_at DESC,
             c.created_at DESC,
             c.id DESC
    LIMIT 1
  ), false);
$function$;

COMMIT;
