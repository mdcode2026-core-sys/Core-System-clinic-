-- M2.4 Migration: Clinic User Permission Overrides
-- Creates the clinic_user_permission_overrides table with RLS policies
-- This table enables per-user permission overrides beyond role templates

BEGIN;

-- ============================================
-- 1. clinic_user_permission_overrides TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.clinic_user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.clinic_users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted BOOLEAN NOT NULL, -- true = explicit grant, false = explicit revoke
    created_by UUID REFERENCES public.clinic_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One override per user+permission combination per tenant
    UNIQUE(tenant_id, user_id, permission_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_user_permission_overrides_tenant_id 
    ON public.clinic_user_permission_overrides(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clinic_user_permission_overrides_user_id 
    ON public.clinic_user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_user_permission_overrides_permission_id 
    ON public.clinic_user_permission_overrides(permission_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_clinic_user_permission_overrides_updated_at 
    ON public.clinic_user_permission_overrides;
CREATE TRIGGER tr_clinic_user_permission_overrides_updated_at
    BEFORE UPDATE ON public.clinic_user_permission_overrides
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ============================================
-- 2. RLS POLICIES
-- ============================================
ALTER TABLE public.clinic_user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read overrides within their own tenant
CREATE POLICY rls_clinic_user_permission_overrides_read 
    ON public.clinic_user_permission_overrides 
    FOR SELECT TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

-- INSERT: only users with overrides:manage permission in their tenant
-- Note: Application-layer enforces the permission check via server action
CREATE POLICY rls_clinic_user_permission_overrides_insert 
    ON public.clinic_user_permission_overrides 
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = public.get_current_tenant_id());

-- UPDATE: only within own tenant
CREATE POLICY rls_clinic_user_permission_overrides_update 
    ON public.clinic_user_permission_overrides 
    FOR UPDATE TO authenticated
    USING (tenant_id = public.get_current_tenant_id())
    WITH CHECK (tenant_id = public.get_current_tenant_id());

-- DELETE: only within own tenant
CREATE POLICY rls_clinic_user_permission_overrides_delete 
    ON public.clinic_user_permission_overrides 
    FOR DELETE TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

COMMIT;
