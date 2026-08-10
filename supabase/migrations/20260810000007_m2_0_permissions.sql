-- M2.0 Migration 07: M2 Permission Keys + Role-Permission Seeding
BEGIN;

INSERT INTO public.permissions (id, permission_key, permission_name, resource, action, description, created_at)
VALUES
    (gen_random_uuid(), 'roles:read', 'Read Roles', 'roles', 'read', 'View roles and permission templates', now()),
    (gen_random_uuid(), 'roles:manage', 'Manage Roles', 'roles', 'manage', 'Create, update, delete custom roles and templates', now()),
    (gen_random_uuid(), 'templates:manage', 'Manage Templates', 'templates', 'manage', 'Manage role permission templates', now()),
    (gen_random_uuid(), 'overrides:manage', 'Manage Permission Overrides', 'overrides', 'manage', 'Manage user-specific permission overrides', now()),
    (gen_random_uuid(), 'subscription:read', 'Read Subscription', 'subscription', 'read', 'View subscription plan and billing info', now()),
    (gen_random_uuid(), 'notifications:manage', 'Manage Notifications', 'notifications', 'manage', 'Configure notification channel preferences', now())
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO public.roles (id, role_key, role_name, role_name_ar, description, is_system_role, created_at)
VALUES
    (gen_random_uuid(), 'super_admin', 'Super Admin', 'المشرف العام', 'System super administrator', true, now()),
    (gen_random_uuid(), 'clinic_admin', 'Clinic Admin', 'مدير العيادة', 'Clinic administrator', true, now()),
    (gen_random_uuid(), 'clinic_owner', 'Clinic Owner', 'صاحب العيادة', 'Clinic owner', true, now()),
    (gen_random_uuid(), 'doctor', 'Doctor', 'طبيب', 'Medical doctor', true, now()),
    (gen_random_uuid(), 'nurse', 'Nurse', 'ممرض', 'Nurse', true, now()),
    (gen_random_uuid(), 'receptionist', 'Receptionist', 'موظف الاستقبال', 'Front desk receptionist', true, now()),
    (gen_random_uuid(), 'accounting', 'Accounting', 'المحاسب', 'Accounting and billing staff', true, now())
ON CONFLICT (role_key) DO NOTHING;

DO $$
DECLARE
    v_super_admin_id UUID; v_clinic_admin_id UUID; v_perm_id UUID; v_perm_key TEXT;
    v_m2_perms TEXT[] := ARRAY['roles:read','roles:manage','templates:manage','overrides:manage','subscription:read','notifications:manage'];
BEGIN
    SELECT id INTO v_super_admin_id FROM public.roles WHERE role_key = 'super_admin' LIMIT 1;
    SELECT id INTO v_clinic_admin_id FROM public.roles WHERE role_key = 'clinic_admin' LIMIT 1;
    FOREACH v_perm_key IN ARRAY v_m2_perms LOOP
        SELECT id INTO v_perm_id FROM public.permissions WHERE permission_key = v_perm_key LIMIT 1;
        IF v_perm_id IS NOT NULL AND v_super_admin_id IS NOT NULL THEN
            INSERT INTO public.role_permissions (id, role_id, permission_id, created_at)
            VALUES (gen_random_uuid(), v_super_admin_id, v_perm_id, now()) ON CONFLICT DO NOTHING;
        END IF;
        IF v_perm_id IS NOT NULL AND v_clinic_admin_id IS NOT NULL THEN
            INSERT INTO public.role_permissions (id, role_id, permission_id, created_at)
            VALUES (gen_random_uuid(), v_clinic_admin_id, v_perm_id, now()) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

COMMIT;
