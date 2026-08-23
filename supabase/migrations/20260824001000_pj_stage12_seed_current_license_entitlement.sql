-- PJ12: seed the currently active licensed tenant with the Included Patient Portal entitlement.
-- This is a one-time entitlement provisioning step. It does not expose or hard-code plan names.
insert into public.tenant_entitlements (
  tenant_id,
  entitlement_key,
  status,
  source,
  effective_from,
  metadata,
  updated_at
)
select
  s.tenant_id,
  'patient_portal',
  'active',
  'base_plan',
  coalesce(s.started_at, now()),
  jsonb_build_object(
    'stage', 'PJ12',
    'provisioning', 'current_active_license',
    'reason', 'included_portal_enablement'
  ),
  now()
from public.subscriptions s
join public.subscription_plans p on p.id = s.plan_id
join public.master_tenants t on t.id = s.tenant_id
where s.status = 'active'
and p.modules @> '["all"]'::jsonb
and t.is_active = true
and t.deleted_at is null
on conflict (tenant_id, entitlement_key) do nothing;
