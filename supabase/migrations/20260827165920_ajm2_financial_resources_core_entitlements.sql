-- AJM-2: provision the Core Financial & Resources product surface through the
-- existing entitlement/capability model. No raw subscription tier is used by UI.
insert into public.entitlements (key, description, entitlement_type)
values ('financial_resources.core', 'AJM-2 core Financial & Resources capabilities', 'feature')
on conflict (key) do nothing;

insert into public.capabilities (key, description, is_core)
values
 ('financial_resources.access', 'Access the Financial & Resources product surface', true),
 ('financial_resources.overview', 'View Financial & Resources overview', true),
 ('financial_resources.invoices', 'Use tenant billing invoices', true),
 ('financial_resources.payments', 'View and operate tenant payments', true),
 ('financial_resources.financial_plans', 'View and manage financial plans', true),
 ('financial_resources.installments', 'View and manage installment schedules', true),
 ('financial_resources.insurance', 'Use minimum patient insurance capability', true),
 ('financial_resources.inventory', 'Use tenant inventory', true),
 ('financial_resources.consumption', 'Record and view resource consumption', true),
 ('financial_resources.suppliers', 'Use supplier records', true),
 ('financial_resources.purchasing', 'Use purchasing workflows', true),
 ('financial_resources.receiving', 'Use purchase receiving workflows', true)
on conflict (key) do nothing;

insert into public.entitlement_capabilities (entitlement_key, capability_key)
select 'financial_resources.core', key
from public.capabilities
where key like 'financial_resources.%'
on conflict do nothing;

insert into public.tenant_entitlements (tenant_id, entitlement_key, status, source, effective_from, metadata, updated_at)
select s.tenant_id,
       'financial_resources.core',
       'active',
       case when p.plan_key = 'trial' then 'trial' else 'base_plan' end,
       coalesce(s.started_at, now()),
       jsonb_build_object('stage','AJM-2','provisioning','base_financial_resources_core'),
       now()
from public.subscriptions s
join public.subscription_plans p on p.id = s.plan_id
join public.master_tenants t on t.id = s.tenant_id
where s.status = 'active'
  and t.is_active = true
  and t.deleted_at is null
  and (p.modules @> '["basic"]'::jsonb or p.modules @> '["advanced"]'::jsonb or p.modules @> '["all"]'::jsonb)
on conflict (tenant_id, entitlement_key) do update
set status='active', updated_at=now();
