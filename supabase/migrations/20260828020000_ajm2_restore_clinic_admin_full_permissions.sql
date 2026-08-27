BEGIN;
-- AJM-2 foundation rule: Clinic Admin must have the complete current permission catalogue.
-- This does not alter subscriptions, entitlements, tenant architecture, or other roles.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.role_key = 'clinic_admin'
ON CONFLICT DO NOTHING;
COMMIT;
