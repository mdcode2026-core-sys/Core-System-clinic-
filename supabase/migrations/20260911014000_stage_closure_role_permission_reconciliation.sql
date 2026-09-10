-- Stage closure: Workforce is an Administration-domain capability.
-- Clinical and operational clinical-support roles must not inherit Workforce navigation/access.
-- Keep workforce access for clinic_admin/accounting; remove only the leaked read permission
-- from doctor, nurse and receptionist system role templates.

update public.role_permissions rp
set deleted_at = coalesce(rp.deleted_at, now())
from public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.is_system_role = true
  and r.role_key in ('doctor', 'nurse', 'receptionist')
  and p.permission_key = 'workforce:read'
  and rp.deleted_at is null;

-- Guardrail: this migration intentionally does not touch tenant-specific user grants,
-- role definitions, or Workforce permissions required by Administration roles.
