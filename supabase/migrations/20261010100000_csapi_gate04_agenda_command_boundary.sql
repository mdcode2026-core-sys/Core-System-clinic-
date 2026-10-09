-- CSAPI Gate 04 / WP-1: protected canonical Agenda persistence commands.
-- The command layer deliberately does not duplicate the application availability/conflict engines.
-- Only the dedicated trusted server-side Agenda client may execute these functions.

BEGIN;

CREATE OR REPLACE FUNCTION public.agenda_create_appointment(
  p_tenant_id uuid,
  p_actor_clinic_user_id uuid,
  p_patient_id uuid,
  p_doctor_id uuid,
  p_room_id uuid,
  p_resource_id uuid,
  p_procedure_id uuid,
  p_inquiry_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_buffer_end timestamptz,
  p_booking_notes text
)
RETURNS public.master_agenda_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_actor public.clinic_users%ROWTYPE;
  v_event public.master_agenda_events%ROWTYPE;
BEGIN
  IF p_tenant_id IS NULL OR p_actor_clinic_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_OR_TENANT_MISSING';
  END IF;
  SELECT cu.* INTO v_actor
  FROM public.clinic_users cu
  WHERE cu.id = p_actor_clinic_user_id
    AND cu.tenant_id = p_tenant_id AND cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL;
  IF NOT FOUND OR v_actor.auth_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_NOT_ACTIVE_IN_TENANT';
  END IF;
  IF NOT COALESCE('agenda:create' = ANY(public.get_effective_permissions(v_actor.auth_user_id, p_tenant_id)), false) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PERMISSION_DENIED';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.master_tenants t WHERE t.id = p_tenant_id AND t.deleted_at IS NULL) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_TENANT_MISSING';
  END IF;
  IF p_patient_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.clinic_patients p
    WHERE p.id = p_patient_id AND p.tenant_id = p_tenant_id AND p.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PATIENT_NOT_FOUND_IN_TENANT';
  END IF;
  IF p_doctor_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_users u
    WHERE u.id = p_doctor_id AND u.tenant_id = p_tenant_id
      AND u.is_active = true AND u.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PROVIDER_NOT_FOUND_IN_TENANT';
  END IF;
  IF p_room_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_rooms r
    WHERE r.id = p_room_id AND r.tenant_id = p_tenant_id
      AND r.is_active = true AND r.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ROOM_NOT_AVAILABLE';
  END IF;
  IF p_resource_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_resources r
    WHERE r.id = p_resource_id AND r.tenant_id = p_tenant_id
      AND r.status = 'active' AND r.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_RESOURCE_UNAVAILABLE';
  END IF;
  IF p_procedure_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_procedures p
    WHERE p.id = p_procedure_id AND p.tenant_id = p_tenant_id
      AND p.is_active = true AND p.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PROCEDURE_NOT_AVAILABLE';
  END IF;
  IF p_inquiry_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_inquiries i
    WHERE i.id = p_inquiry_id AND i.tenant_id = p_tenant_id AND i.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_INQUIRY_NOT_FOUND_IN_TENANT';
  END IF;
  IF p_scheduled_start IS NULL OR p_scheduled_end IS NULL OR p_buffer_end IS NULL
     OR p_scheduled_end <= p_scheduled_start OR p_buffer_end < p_scheduled_end THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_INVALID_TIME_RANGE';
  END IF;

  PERFORM pg_catalog.set_config('app.agenda_actor_id', v_actor.id::text, true);
  PERFORM pg_catalog.set_config('app.agenda_actor_role', COALESCE(v_actor.role::text, ''), true);
  PERFORM pg_catalog.set_config('app.agenda_reason', 'appointment_created', true);

  INSERT INTO public.master_agenda_events (
    tenant_id, patient_id, doctor_id, room_id, resource_id, procedure_id, inquiry_id,
    created_by, scheduled_start, scheduled_end, buffer_end, event_type, status, booking_notes
  ) VALUES (
    p_tenant_id, p_patient_id, p_doctor_id, p_room_id, p_resource_id, p_procedure_id, p_inquiry_id,
    v_actor.id, p_scheduled_start, p_scheduled_end, p_buffer_end, 'appointment', 'scheduled', p_booking_notes
  )
  RETURNING * INTO v_event;

  RETURN v_event;
END;
$function$;

CREATE OR REPLACE FUNCTION public.agenda_update_appointment(
  p_tenant_id uuid,
  p_actor_clinic_user_id uuid,
  p_event_id uuid,
  p_expected_status text,
  p_patient_id uuid,
  p_doctor_id uuid,
  p_room_id uuid,
  p_resource_id uuid,
  p_procedure_id uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_buffer_end timestamptz,
  p_booking_notes text,
  p_reschedule boolean DEFAULT false
)
RETURNS public.master_agenda_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_actor public.clinic_users%ROWTYPE;
  v_event public.master_agenda_events%ROWTYPE;
BEGIN
  IF p_tenant_id IS NULL OR p_actor_clinic_user_id IS NULL OR p_event_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_TENANT_OR_EVENT_MISSING';
  END IF;
  SELECT cu.* INTO v_actor
  FROM public.clinic_users cu
  WHERE cu.id = p_actor_clinic_user_id AND cu.tenant_id = p_tenant_id AND cu.auth_user_id = auth.uid()
    AND cu.is_active = true AND cu.deleted_at IS NULL;
  IF NOT FOUND OR v_actor.auth_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_NOT_ACTIVE_IN_TENANT';
  END IF;
  IF NOT COALESCE('agenda:update' = ANY(public.get_effective_permissions(v_actor.auth_user_id, p_tenant_id)), false) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PERMISSION_DENIED';
  END IF;

  SELECT e.* INTO v_event
  FROM public.master_agenda_events e
  WHERE e.id = p_event_id AND e.tenant_id = p_tenant_id AND e.deleted_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_EVENT_NOT_FOUND';
  END IF;
  IF p_expected_status IS NULL OR v_event.status IS DISTINCT FROM p_expected_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_STATE_CONFLICT';
  END IF;
  IF p_reschedule AND p_expected_status NOT IN ('scheduled', 'confirmed', 'no_show') THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_INVALID_STATUS_TRANSITION';
  END IF;
  IF p_patient_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.clinic_patients p
    WHERE p.id = p_patient_id AND p.tenant_id = p_tenant_id AND p.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PATIENT_NOT_FOUND_IN_TENANT';
  END IF;
  IF p_doctor_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_users u
    WHERE u.id = p_doctor_id AND u.tenant_id = p_tenant_id
      AND u.is_active = true AND u.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PROVIDER_NOT_FOUND_IN_TENANT';
  END IF;
  IF p_room_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_rooms r
    WHERE r.id = p_room_id AND r.tenant_id = p_tenant_id
      AND r.is_active = true AND r.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ROOM_NOT_AVAILABLE';
  END IF;
  IF p_resource_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_resources r
    WHERE r.id = p_resource_id AND r.tenant_id = p_tenant_id
      AND r.status = 'active' AND r.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_RESOURCE_UNAVAILABLE';
  END IF;
  IF p_procedure_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_procedures p
    WHERE p.id = p_procedure_id AND p.tenant_id = p_tenant_id
      AND p.is_active = true AND p.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PROCEDURE_NOT_AVAILABLE';
  END IF;
  IF p_scheduled_start IS NULL OR p_scheduled_end IS NULL OR p_buffer_end IS NULL
     OR p_scheduled_end <= p_scheduled_start OR p_buffer_end < p_scheduled_end THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_INVALID_TIME_RANGE';
  END IF;

  PERFORM pg_catalog.set_config('app.agenda_actor_id', v_actor.id::text, true);
  PERFORM pg_catalog.set_config('app.agenda_actor_role', COALESCE(v_actor.role::text, ''), true);
  PERFORM pg_catalog.set_config(
    'app.agenda_reason',
    CASE WHEN p_reschedule THEN 'appointment_rescheduled' ELSE 'appointment_updated' END,
    true
  );

  UPDATE public.master_agenda_events e
  SET patient_id = p_patient_id,
      doctor_id = p_doctor_id,
      room_id = p_room_id,
      resource_id = p_resource_id,
      procedure_id = p_procedure_id,
      scheduled_start = p_scheduled_start,
      scheduled_end = p_scheduled_end,
      buffer_end = p_buffer_end,
      booking_notes = p_booking_notes,
      status = CASE WHEN p_reschedule THEN 'rescheduled' ELSE e.status END,
      updated_at = pg_catalog.now()
  WHERE e.id = p_event_id AND e.tenant_id = p_tenant_id AND e.status = p_expected_status
  RETURNING * INTO v_event;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_STATE_CONFLICT';
  END IF;
  RETURN v_event;
END;
$function$;

CREATE OR REPLACE FUNCTION public.agenda_transition_appointment(
  p_tenant_id uuid,
  p_actor_clinic_user_id uuid,
  p_event_id uuid,
  p_expected_status text,
  p_new_status text
)
RETURNS public.master_agenda_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_actor public.clinic_users%ROWTYPE;
  v_event public.master_agenda_events%ROWTYPE;
  v_allowed boolean := false;
BEGIN
  IF p_tenant_id IS NULL OR p_actor_clinic_user_id IS NULL OR p_event_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_TENANT_OR_EVENT_MISSING';
  END IF;
  SELECT cu.* INTO v_actor
  FROM public.clinic_users cu
  WHERE cu.id = p_actor_clinic_user_id AND cu.tenant_id = p_tenant_id AND cu.auth_user_id = auth.uid()
    AND cu.is_active = true AND cu.deleted_at IS NULL;
  IF NOT FOUND OR v_actor.auth_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_NOT_ACTIVE_IN_TENANT';
  END IF;
  IF NOT COALESCE('agenda:update' = ANY(public.get_effective_permissions(v_actor.auth_user_id, p_tenant_id)), false) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PERMISSION_DENIED';
  END IF;
  SELECT e.* INTO v_event
  FROM public.master_agenda_events e
  WHERE e.id = p_event_id AND e.tenant_id = p_tenant_id AND e.deleted_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_EVENT_NOT_FOUND';
  END IF;
  IF p_expected_status IS NULL OR v_event.status IS DISTINCT FROM p_expected_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_STATE_CONFLICT';
  END IF;
  v_allowed :=
    (p_expected_status = 'scheduled' AND p_new_status IN ('confirmed','cancelled','rescheduled')) OR
    (p_expected_status = 'confirmed' AND p_new_status IN ('arrived','no_show','cancelled','rescheduled')) OR
    (p_expected_status = 'arrived' AND p_new_status IN ('in_session','no_show','cancelled')) OR
    (p_expected_status = 'in_session' AND p_new_status IN ('completed','cancelled')) OR
    (p_expected_status = 'no_show' AND p_new_status = 'rescheduled') OR
    (p_expected_status = 'cancelled' AND p_new_status = 'scheduled') OR
    (p_expected_status = 'rescheduled' AND p_new_status = 'scheduled');
  IF NOT COALESCE(v_allowed, false) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_INVALID_STATUS_TRANSITION';
  END IF;

  PERFORM pg_catalog.set_config('app.agenda_actor_id', v_actor.id::text, true);
  PERFORM pg_catalog.set_config('app.agenda_actor_role', COALESCE(v_actor.role::text, ''), true);
  PERFORM pg_catalog.set_config('app.agenda_reason', 'appointment_status_transition', true);

  UPDATE public.master_agenda_events e
  SET status = p_new_status, updated_at = pg_catalog.now()
  WHERE e.id = p_event_id AND e.tenant_id = p_tenant_id AND e.status = p_expected_status
  RETURNING * INTO v_event;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_STATE_CONFLICT';
  END IF;
  RETURN v_event;
END;
$function$;

CREATE OR REPLACE FUNCTION public.agenda_cancel_appointment(
  p_tenant_id uuid,
  p_actor_clinic_user_id uuid,
  p_event_id uuid,
  p_expected_status text,
  p_reason text DEFAULT NULL
)
RETURNS public.master_agenda_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_actor public.clinic_users%ROWTYPE;
  v_event public.master_agenda_events%ROWTYPE;
BEGIN
  IF p_tenant_id IS NULL OR p_actor_clinic_user_id IS NULL OR p_event_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_TENANT_OR_EVENT_MISSING';
  END IF;
  SELECT cu.* INTO v_actor
  FROM public.clinic_users cu
  WHERE cu.id = p_actor_clinic_user_id AND cu.tenant_id = p_tenant_id AND cu.auth_user_id = auth.uid()
    AND cu.is_active = true AND cu.deleted_at IS NULL;
  IF NOT FOUND OR v_actor.auth_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_ACTOR_NOT_ACTIVE_IN_TENANT';
  END IF;
  IF NOT COALESCE('agenda:update' = ANY(public.get_effective_permissions(v_actor.auth_user_id, p_tenant_id)), false) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_PERMISSION_DENIED';
  END IF;
  SELECT e.* INTO v_event
  FROM public.master_agenda_events e
  WHERE e.id = p_event_id AND e.tenant_id = p_tenant_id AND e.deleted_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_EVENT_NOT_FOUND';
  END IF;
  IF p_expected_status IS NULL OR v_event.status IS DISTINCT FROM p_expected_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_STATE_CONFLICT';
  END IF;
  IF p_expected_status NOT IN ('scheduled','confirmed','arrived','in_session') THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_INVALID_CANCELLATION';
  END IF;

  PERFORM pg_catalog.set_config('app.agenda_actor_id', v_actor.id::text, true);
  PERFORM pg_catalog.set_config('app.agenda_actor_role', COALESCE(v_actor.role::text, ''), true);
  PERFORM pg_catalog.set_config('app.agenda_reason', COALESCE(NULLIF(p_reason, ''), 'appointment_cancelled'), true);

  UPDATE public.master_agenda_events e
  SET status = 'cancelled',
      cancellation_reason = NULLIF(p_reason, ''),
      updated_at = pg_catalog.now()
  WHERE e.id = p_event_id AND e.tenant_id = p_tenant_id AND e.status = p_expected_status
  RETURNING * INTO v_event;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'AGENDA_STATE_CONFLICT';
  END IF;
  RETURN v_event;
END;
$function$;

REVOKE ALL ON FUNCTION public.agenda_create_appointment(uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,timestamptz,timestamptz,timestamptz,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.agenda_update_appointment(uuid,uuid,uuid,text,uuid,uuid,uuid,uuid,uuid,timestamptz,timestamptz,timestamptz,text,boolean) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.agenda_transition_appointment(uuid,uuid,uuid,text,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.agenda_cancel_appointment(uuid,uuid,uuid,text,text) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.agenda_create_appointment(uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,timestamptz,timestamptz,timestamptz,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.agenda_update_appointment(uuid,uuid,uuid,text,uuid,uuid,uuid,uuid,uuid,timestamptz,timestamptz,timestamptz,text,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.agenda_transition_appointment(uuid,uuid,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.agenda_cancel_appointment(uuid,uuid,uuid,text,text) TO authenticated;

COMMIT;
