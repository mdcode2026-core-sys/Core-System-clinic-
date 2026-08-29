-- Seed a minimal clinic-sized leave catalog for existing tenants.
insert into public.workforce_leave_types(tenant_id,name,name_ar,annual_entitlement_days,carry_forward_days,paid,status)
select t.id, v.name, v.name_ar, v.days, 0, true, 'active'
from public.master_tenants t
cross join (values
  ('Annual Leave','إجازة سنوية',14::numeric),
  ('Sick Leave','إجازة مرضية',14::numeric),
  ('Unpaid Leave','إجازة بدون راتب',0::numeric)
) v(name,name_ar,days)
where not exists (
  select 1 from public.workforce_leave_types x where x.tenant_id=t.id and x.name=v.name
);
