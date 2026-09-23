-- CORE SYSTEM — Patient Journey Stage 1
-- Function security hardening
-- Preserves the currently-live function bodies and behavior.

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_audit_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_actor_id UUID;
    v_actor_role TEXT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF TG_TABLE_NAME = 'master_tenants' THEN
            v_tenant_id := NEW.id;
        ELSE
            v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
        END IF;

        SELECT cu.id, cu.role
        INTO v_actor_id, v_actor_role
        FROM public.clinic_users cu
        WHERE cu.auth_user_id = auth.uid()
        LIMIT 1;

        INSERT INTO public.audit_trail (
            tenant_id,
            actor_id,
            actor_role,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        )
        VALUES (
            v_tenant_id,
            v_actor_id,
            v_actor_role,
            'UPDATE',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;

    RETURN NEW;
END;
$$;
