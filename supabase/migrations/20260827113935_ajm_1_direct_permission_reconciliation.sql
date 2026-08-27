BEGIN;
INSERT INTO public.clinic_user_permissions(tenant_id,user_id,permission_id,granted,created_by,created_at,updated_at) SELECT tenant_id,user_id,permission_id,true,created_by,created_at,now() FROM public.clinic_user_permission_overrides WHERE granted=true ON CONFLICT(tenant_id,user_id,permission_id) DO NOTHING;
DELETE FROM public.clinic_user_permission_overrides WHERE granted=true;
COMMIT;
