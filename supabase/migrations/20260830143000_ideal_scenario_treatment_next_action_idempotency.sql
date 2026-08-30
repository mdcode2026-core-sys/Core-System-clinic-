-- R02 implementation hardening: a treatment-plan stage may own at most one active next-action work item.
-- This does not create a second source of truth; operational_work_items remains the coordination truth.
create unique index if not exists operational_work_next_action_source_uidx
  on public.operational_work_items(tenant_id, kind, source_type, source_id)
  where kind = 'next_action' and source_type = 'treatment_plan_item' and source_id is not null;

comment on index public.operational_work_next_action_source_uidx is
  'R02: idempotent Treatment Plan Stage -> Operational Work next-action handoff';
