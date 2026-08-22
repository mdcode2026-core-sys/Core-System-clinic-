insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.role_key in ('doctor','clinic_admin','super_admin')
  and p.permission_key in ('treatment_plans:read','treatment_plans:create','treatment_plans:update')
on conflict do nothing;
