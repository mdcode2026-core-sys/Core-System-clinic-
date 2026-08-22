alter table public.clinic_treatment_plan_visits
  add column if not exists treatment_plan_item_id uuid references public.clinic_treatment_plan_items(id) on delete set null;

create index if not exists clinic_treatment_plan_visits_item_idx on public.clinic_treatment_plan_visits(tenant_id, treatment_plan_item_id);
