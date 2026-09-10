-- Applied in production as migration 20260910224312.
-- Workforce is an Administration-domain capability; clinical/support roles
-- must not inherit workforce:read through their system-role templates.

update public.role_permissions rp
set deleted_at = coalesce(rp.deleted_at, now())
from public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.is_system_role = true
  and r.role_key in ('doctor', 'nurse', 'receptionist')
  and p.permission_key = 'workforce:read'
  and rp.deleted_at is null;

-- Intentionally leaves tenant-specific grants, role definitions, and
-- Administration-role Workforce access unchanged.
