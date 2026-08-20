-- Patient Journey Stage 1 — Correction A: Registration
-- Date: 2026-08-20
--
-- Corrects create_tenant_with_subscription to use the canonical architecture:
--   master_tenants → clinic_users → clinic_admin
--
-- Changes:
-- 1. Inserts into master_tenants instead of legacy tenants table
-- 2. Inserts into clinic_users instead of legacy users table
-- 3. Assigns role = 'clinic_admin' (retired clinic_owner removed)
-- 4. Returns role in JSON result for consumer (signUp action)
-- 5. Adds explicit SET search_path for security

CREATE OR REPLACE FUNCTION public.create_tenant_with_subscription(
    p_clinic_name text,
    p_full_name text,
    p_email text,
    p_auth_user_id uuid,
    p_clinic_name_ar text DEFAULT NULL::text,
    p_license_key text DEFAULT NULL::text,
    p_plan_key text DEFAULT 'trial'::text,
    p_timezone text DEFAULT 'Asia/Amman'::text,
    p_currency text DEFAULT 'JOD'::text,
    p_country_code text DEFAULT 'JO'::text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_plan_id UUID;
    v_user_id UUID;
    v_subscription_id UUID;
    v_license TEXT;
    v_employee_code TEXT;
    v_pin_code TEXT;
BEGIN
    v_license := COALESCE(p_license_key, 'LIC-' || EXTRACT(EPOCH FROM NOW())::BIGINT);
    v_employee_code := 'EMP-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    v_pin_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Resolve plan
    SELECT id INTO v_plan_id FROM subscription_plans WHERE plan_key = p_plan_key;
    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plan not found: %', p_plan_key;
    END IF;

    -- Insert into canonical master_tenants table (was: tenants)
    INSERT INTO master_tenants (
        clinic_name, clinic_name_ar, license_key,
        timezone, currency, country_code
    ) VALUES (
        p_clinic_name, p_clinic_name_ar, v_license,
        p_timezone, p_currency, p_country_code
    )
    RETURNING id INTO v_tenant_id;

    -- Create subscription
    INSERT INTO subscriptions (tenant_id, plan_id, status, trial_ends_at)
    VALUES (
        v_tenant_id, v_plan_id, 'trial',
        CASE WHEN p_plan_key = 'trial' THEN NOW() + INTERVAL '14 days' ELSE NULL END
    )
    RETURNING id INTO v_subscription_id;

    -- Log subscription event
    INSERT INTO subscription_events (subscription_id, tenant_id, event_type, new_status, new_plan_id, reason)
    VALUES (v_subscription_id, v_tenant_id, 'created', 'trial', v_plan_id, 'Tenant created via signUp');

    -- Insert into canonical clinic_users table (was: users + roles join)
    -- role = 'clinic_admin' per settled architecture (clinic_owner retired)
    INSERT INTO clinic_users (
        id, tenant_id, full_name, email, role,
        employee_code, pin_code, auth_user_id, is_active
    ) VALUES (
        gen_random_uuid(), v_tenant_id, p_full_name, p_email, 'clinic_admin',
        v_employee_code, v_pin_code, p_auth_user_id, true
    )
    RETURNING id INTO v_user_id;

    -- Create default branch
    INSERT INTO branches (tenant_id, branch_name, branch_name_ar, is_default, is_active)
    VALUES (
        v_tenant_id,
        p_clinic_name || ' - Main Branch',
        COALESCE(p_clinic_name_ar, p_clinic_name) || ' - الفرع الرئيسي',
        true,
        true
    );

    RETURN jsonb_build_object(
        'tenant_id', v_tenant_id,
        'subscription_id', v_subscription_id,
        'user_id', v_user_id,
        'license_key', v_license,
        'role', 'clinic_admin'
    );
END;
$$;
