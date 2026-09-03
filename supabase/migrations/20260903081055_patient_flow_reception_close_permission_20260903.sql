-- D7: explicit reception close authority. Clinic Admin remains unrestricted via has_tenant_permission().
INSERT INTO public.permissions (permission_key, permission_name, description, resource, action)
VALUES ('sessions:close','Close clinical session','Complete a visit from pending_close through the reception-owned close step','sessions','close')
ON CONFLICT (permission_key) DO UPDATE SET permission_name=EXCLUDED.permission_name, description=EXCLUDED.description, resource=EXCLUDED.resource, action=EXCLUDED.action, deleted_at=NULL;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id,p.id
FROM public.roles r CROSS JOIN public.permissions p
WHERE r.role_key='receptionist' AND p.permission_key='sessions:close'
  AND NOT EXISTS (SELECT 1 FROM public.role_permissions rp WHERE rp.role_id=r.id AND rp.permission_id=p.id AND rp.deleted_at IS NULL);
