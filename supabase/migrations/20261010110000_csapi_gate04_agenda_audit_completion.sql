-- CSAPI Gate 04 / WP-4: make canonical appointment audit reconstructible.
-- Reuses audit_trail; no parallel Agenda audit store is introduced.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_audit_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_tenant_id uuid;
  v_actor_id uuid;
  v_actor_role text;
  v_action text := 'UPDATE';
  v_reason text;
  v_request_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  -- Preserve the pre-existing behavior of all non-Agenda audit consumers.
  -- Gate 04 extends only the Agenda branch; it must not broaden unrelated audit domains.
  IF TG_TABLE_NAME <> 'master_agenda_events' THEN
    IF TG_OP = 'UPDATE' THEN
      IF TG_TABLE_NAME = 'master_tenants' THEN
        v_tenant_id := COALESCE(NEW.id, OLD.id);
      ELSE
        v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
      END IF;

      SELECT cu.id INTO v_actor_id
      FROM public.clinic_users cu
      WHERE cu.auth_user_id = auth.uid()
      LIMIT 1;

      INSERT INTO public.audit_trail (
        tenant_id, actor_id, actor_role, action, table_name, record_id,
        old_values, new_values
      ) VALUES (
        v_tenant_id, v_actor_id, public.get_current_user_role(), 'UPDATE',
        TG_TABLE_NAME, OLD.id, to_jsonb(OLD), to_jsonb(NEW)
      );
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_tenant_id := NEW.tenant_id;
  ELSE
    v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
  END IF;

  -- Only the protected service-role command boundary can supply Agenda audit context.
  -- Validate its actor against the claim installed by the server-side command before attribution.
  IF v_request_role = 'service_role' THEN
    SELECT cu.id, cu.role::text
      INTO v_actor_id, v_actor_role
    FROM public.clinic_users cu
    WHERE cu.id = NULLIF(current_setting('app.agenda_actor_id', true), '')::uuid
      AND cu.auth_user_id = auth.uid()
      AND cu.tenant_id = v_tenant_id
      AND cu.is_active = true
      AND cu.deleted_at IS NULL
    LIMIT 1;

    IF v_actor_id IS NOT NULL THEN
      v_reason := NULLIF(current_setting('app.agenda_reason', true), '');
    END IF;
  END IF;

  IF v_actor_id IS NULL THEN
    SELECT cu.id, cu.role::text
      INTO v_actor_id, v_actor_role
    FROM public.clinic_users cu
    WHERE cu.auth_user_id = auth.uid()
      AND cu.tenant_id = v_tenant_id
      AND cu.is_active = true
      AND cu.deleted_at IS NULL
    ORDER BY cu.created_at ASC
    LIMIT 1;
  END IF;
  IF v_actor_role IS NULL THEN
    v_actor_role := public.get_current_user_role();
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATE';
  ELSIF TG_OP = 'UPDATE'
    AND NULLIF(current_setting('app.agenda_reason', true), '') = 'appointment_rescheduled' THEN
    v_action := 'RESCHEDULE';
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'cancelled' THEN
    v_action := 'CANCEL';
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'rescheduled' THEN
    v_action := 'RESCHEDULE';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_action := 'STATUS_CHANGE';
  ELSE
    v_action := 'UPDATE';
  END IF;

  INSERT INTO public.audit_trail (
    tenant_id, actor_id, actor_role, action, table_name, record_id,
    old_values, new_values, reason
  ) VALUES (
    v_tenant_id, v_actor_id, v_actor_role, v_action, TG_TABLE_NAME, NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    to_jsonb(NEW), v_reason
  );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS tr_audit_agenda ON public.master_agenda_events;
CREATE TRIGGER tr_audit_agenda
AFTER INSERT OR UPDATE ON public.master_agenda_events
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_changes();

REVOKE ALL ON FUNCTION public.fn_audit_changes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_audit_changes() TO service_role;

COMMIT;
