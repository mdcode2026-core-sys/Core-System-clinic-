drop index if exists public.operational_work_next_action_source_uidx;
create unique index if not exists operational_work_next_action_source_uidx
  on public.operational_work_items(tenant_id, kind, source_type, source_id)
  where kind = 'next_action'
    and source_type = 'treatment_plan_item'
    and source_id is not null
    and status not in ('completed','rejected','cancelled');
