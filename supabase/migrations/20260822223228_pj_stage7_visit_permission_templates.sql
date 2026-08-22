-- PJ Stage 7 — default permission templates only.
-- Roles remain editable templates; user overrides remain authoritative.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.role_key in ('doctor','clinic_admin','super_admin')
  and p.permission_key in ('visits:read','visits:update')
on conflict do nothing;
