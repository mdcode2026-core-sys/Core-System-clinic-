-- M2.0 Migration 05: Custom Roles & Templates Foundation
BEGIN;

ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS tenant_id UUID NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE;
ALTER TABLE public.clinic_users ADD COLUMN IF NOT EXISTS role_template_id UUID NULL REFERENCES public.roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON public.roles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_clinic_users_role_template_id ON public.clinic_users (role_template_id);

ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_role_key_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_system_unique ON public.roles (role_key) WHERE is_system_role = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_custom_unique ON public.roles (tenant_id, role_key) WHERE tenant_id IS NOT NULL;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- SELECT: system roles visible to all; custom roles only to owning tenant
CREATE POLICY rls_roles_read ON public.roles FOR SELECT TO authenticated
USING (is_system_role = true OR tenant_id = public.get_current_tenant_id());

-- INSERT: only custom roles for current tenant
CREATE POLICY rls_roles_custom_insert ON public.roles FOR INSERT TO authenticated
WITH CHECK (is_system_role = false AND tenant_id = public.get_current_tenant_id());

-- UPDATE: only custom roles for current tenant
CREATE POLICY rls_roles_custom_update ON public.roles FOR UPDATE TO authenticated
USING (is_system_role = false AND tenant_id = public.get_current_tenant_id())
WITH CHECK (is_system_role = false AND tenant_id = public.get_current_tenant_id());

-- DELETE: only custom roles for current tenant
CREATE POLICY rls_roles_custom_delete ON public.roles FOR DELETE TO authenticated
USING (is_system_role = false AND tenant_id = public.get_current_tenant_id());

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- SELECT: system role permissions visible to all; custom role permissions only to owning tenant
CREATE POLICY rls_role_permissions_read ON public.role_permissions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_permissions.role_id
    AND (r.is_system_role = true OR r.tenant_id = public.get_current_tenant_id())));

-- INSERT: only for custom roles of current tenant
CREATE POLICY rls_role_permissions_custom_insert ON public.role_permissions FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_permissions.role_id
    AND r.is_system_role = false AND r.tenant_id = public.get_current_tenant_id()));

-- UPDATE: only for custom roles of current tenant
CREATE POLICY rls_role_permissions_custom_update ON public.role_permissions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_permissions.role_id
    AND r.is_system_role = false AND r.tenant_id = public.get_current_tenant_id()))
WITH CHECK (EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_permissions.role_id
    AND r.is_system_role = false AND r.tenant_id = public.get_current_tenant_id()));

-- DELETE: only for custom roles of current tenant
CREATE POLICY rls_role_permissions_custom_delete ON public.role_permissions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_permissions.role_id
    AND r.is_system_role = false AND r.tenant_id = public.get_current_tenant_id()));

COMMIT;
