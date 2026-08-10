-- M2.0 Migration 03: Create branches table + defaults + alter create_tenant_with_subscription()
BEGIN;

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,
    branch_name TEXT NOT NULL,
    branch_name_ar TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_branches_tenant_name_unique
ON public.branches (tenant_id, branch_name) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_branches_tenant_default_unique
ON public.branches (tenant_id) WHERE is_default = true AND deleted_at IS NULL;

CREATE INDEX idx_branches_tenant_id ON public.branches (tenant_id);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_branches_isolation
ON public.branches FOR ALL TO authenticated
USING (tenant_id = public.get_current_tenant_id());

INSERT INTO public.branches (tenant_id, branch_name, branch_name_ar, is_default, is_active)
SELECT id, clinic_name || ' - Main Branch', COALESCE(clinic_name_ar, clinic_name) || ' - الفرع الرئيسي', true, true
FROM public.master_tenants WHERE deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Alter create_tenant_with_subscription to create default branch
CREATE OR REPLACE FUNCTION public.create_tenant_with_subscription(
    p_clinic_name text, p_full_name text, p_email text, p_auth_user_id uuid,
    p_clinic_name_ar text DEFAULT NULL::text, p_license_key text DEFAULT NULL::text,
    p_plan_key text DEFAULT 'trial'::text, p_timezone text DEFAULT 'Asia/Amman'::text,
    p_currency text DEFAULT 'JOD'::text, p_country_code text DEFAULT 'JO'::text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_tenant_id UUID; v_plan_id UUID; v_role_id UUID; v_user_id UUID;
    v_subscription_id UUID; v_license TEXT;
BEGIN
    v_license := COALESCE(p_license_key, 'LIC-' || EXTRACT(EPOCH FROM NOW())::BIGINT);
    SELECT id INTO v_plan_id FROM subscription_plans WHERE plan_key = p_plan_key;
    IF v_plan_id IS NULL THEN RAISE EXCEPTION 'Plan not found: %', p_plan_key; END IF;
    SELECT id INTO v_role_id FROM roles WHERE role_key = 'clinic_owner';
    IF v_role_id IS NULL THEN RAISE EXCEPTION 'Role not found: clinic_owner'; END IF;
    INSERT INTO tenants (clinic_name, clinic_name_ar, license_key, timezone, currency, country_code)
    VALUES (p_clinic_name, p_clinic_name_ar, v_license, p_timezone, p_currency, p_country_code)
    RETURNING id INTO v_tenant_id;
    INSERT INTO subscriptions (tenant_id, plan_id, status, trial_ends_at)
    VALUES (v_tenant_id, v_plan_id, 'trial', CASE WHEN p_plan_key = 'trial' THEN NOW() + INTERVAL '14 days' ELSE NULL END)
    RETURNING id INTO v_subscription_id;
    INSERT INTO subscription_events (subscription_id, tenant_id, event_type, new_status, new_plan_id, reason)
    VALUES (v_subscription_id, v_tenant_id, 'created', 'trial', v_plan_id, 'Tenant created via signUp');
    INSERT INTO users (tenant_id, auth_user_id, full_name, email, role_id, employee_code, pin_code)
    VALUES (v_tenant_id, p_auth_user_id, p_full_name, p_email, v_role_id,
            'EMP-' || EXTRACT(EPOCH FROM NOW())::BIGINT, LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'))
    RETURNING id INTO v_user_id;
    INSERT INTO branches (tenant_id, branch_name, branch_name_ar, is_default, is_active)
    VALUES (v_tenant_id, p_clinic_name || ' - Main Branch',
            COALESCE(p_clinic_name_ar, p_clinic_name) || ' - الفرع الرئيسي', true, true);
    RETURN jsonb_build_object('tenant_id', v_tenant_id, 'subscription_id', v_subscription_id,
                              'user_id', v_user_id, 'license_key', v_license);
END;
$$;

COMMIT;
