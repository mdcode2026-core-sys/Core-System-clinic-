BEGIN;

-- CSAPI Gate 01 / D3 — authoritative Patient Flow lifecycle write boundary.
-- D2 supplies the persistence primitives; D3 owns the controlled multi-table transition.
-- Production is not touched by this repository migration.

CREATE UNIQUE INDEX IF NOT EXISTS patient_flow_events_one_command_per_correlation_idx
  ON public.patient_flow_events (tenant_id, correlation_id)
  WHERE correlation_id IS NOT NULL;

COMMENT ON INDEX public.patient_flow_events_one_command_per_correlation_idx IS
  'D3 command idempotency boundary: one command outcome per tenant/correlation key.';

CREATE OR REPLACE FUNCTION public.csapi_d3_enter_waiting(
  p_visit_id uuid,
  p_lane_key text DEFAULT 'general',
  p_priority_class text DEFAULT 'normal',
  p_entry_reason text DEFAULT 'arrival',
  p_routing_target text DEFAULT NULL,
  p_correlation_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_timezone text;
  v_operating_date date;
  v_visit record;
  v_existing_event record;
  v_queue_id uuid;
  v_event_id uuid;
  v_position integer;
  v_now timestamptz := now();
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('patient_flow:operations')
     OR NOT public.has_effective_permission('sessions:update') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'waiting_entered' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_enter_waiting',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status','waiting',
      'new_status','waiting',
      'work_session_id',NULL,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  IF p_lane_key NOT IN ('general','doctor','urgent') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='INVALID_QUEUE_LANE';
  END IF;

  SELECT timezone
  INTO v_timezone
  FROM public.master_tenants
  WHERE id = v_tenant_id
    AND deleted_at IS NULL;

  IF v_timezone IS NULL OR trim(v_timezone) = '' THEN
    v_timezone := 'UTC';
  END IF;

  v_operating_date := (v_now AT TIME ZONE v_timezone)::date;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'waiting' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ENTER_WAITING_REQUIRES_WAITING_VISIT';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.patient_flow_queue_entries q
    WHERE q.tenant_id = v_tenant_id
      AND q.visit_id = p_visit_id
      AND q.exited_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='WAITING_QUEUE_ALREADY_ACTIVE';
  END IF;

  SELECT COALESCE(MAX(q.position),0) + 1
  INTO v_position
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.operating_date = v_operating_date
    AND q.lane_key = p_lane_key
    AND q.exited_at IS NULL;

  INSERT INTO public.patient_flow_queue_entries (
    tenant_id, visit_id, operating_date, lane_key, priority_class, position,
    entered_at, entry_reason, routing_target, created_by_clinic_user_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_operating_date, p_lane_key, p_priority_class, v_position,
    v_now, p_entry_reason, p_routing_target, v_actor_id
  )
  RETURNING id INTO v_queue_id;

  UPDATE public.clinic_visit_sessions
  SET arrived_at = COALESCE(arrived_at, v_now),
      updated_at = v_now
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, queue_entry_id, event_type, actor_clinic_user_id,
    actor_context, occurred_at, source_context, destination_context,
    reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_queue_id, 'waiting_entered', v_actor_id,
    'operations', v_now,
    jsonb_build_object('status', v_visit.session_status),
    jsonb_build_object('status','waiting','lane_key',p_lane_key,'position',v_position),
    p_entry_reason, jsonb_build_object('routing_target',p_routing_target),
    p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_enter_waiting',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'previous_status','waiting',
    'new_status','waiting',
    'work_session_id',NULL,
    'queue_entry_id',v_queue_id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_d3_reorder_waiting(
  p_queue_entry_id uuid,
  p_target_position integer,
  p_target_lane_key text DEFAULT NULL,
  p_routing_target text DEFAULT NULL,
  p_correlation_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_timezone text;
  v_entry record;
  v_visit_status text;
  v_existing_event record;
  v_new_lane text;
  v_new_position integer := GREATEST(COALESCE(p_target_position,1),1);
  v_event_id uuid;
  v_now timestamptz := now();
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('patient_flow:operations')
     OR NOT public.has_effective_permission('sessions:update') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'waiting_reordered' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_reorder_waiting',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status','waiting',
      'new_status','waiting',
      'work_session_id',NULL,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  IF p_target_lane_key IS NOT NULL AND p_target_lane_key NOT IN ('general','doctor','urgent') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='INVALID_QUEUE_LANE';
  END IF;

  SELECT q.*, v.session_status
  INTO v_entry, v_visit_status
  FROM public.patient_flow_queue_entries q
  JOIN public.clinic_visit_sessions v
    ON v.tenant_id = q.tenant_id
   AND v.id = q.visit_id
  WHERE q.id = p_queue_entry_id
    AND q.tenant_id = v_tenant_id
    AND q.exited_at IS NULL
  FOR UPDATE;

  IF v_entry.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTIVE_QUEUE_ENTRY_NOT_FOUND';
  END IF;

  IF v_visit_status <> 'waiting' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='REORDER_REQUIRES_WAITING_VISIT';
  END IF;

  v_new_lane := COALESCE(p_target_lane_key, v_entry.lane_key);

  SELECT timezone INTO v_timezone
  FROM public.master_tenants
  WHERE id = v_tenant_id;

  IF v_timezone IS NULL OR trim(v_timezone) = '' THEN
    v_timezone := 'UTC';
  END IF;

  PERFORM 1
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.operating_date = v_entry.operating_date
    AND q.lane_key IN (v_entry.lane_key, v_new_lane)
    AND q.exited_at IS NULL
  ORDER BY q.id
  FOR UPDATE;

  UPDATE public.patient_flow_queue_entries
  SET lane_key = v_new_lane,
      position = v_new_position,
      routing_target = COALESCE(p_routing_target, routing_target),
      updated_at = v_now
  WHERE id = p_queue_entry_id
    AND tenant_id = v_tenant_id;

  WITH ranked AS (
    SELECT q.id,
           row_number() OVER (
             ORDER BY
               CASE WHEN q.id = p_queue_entry_id THEN v_new_position ELSE q.position END,
               q.entered_at,
               q.id
           )::integer AS new_position
    FROM public.patient_flow_queue_entries q
    WHERE q.tenant_id = v_tenant_id
      AND q.operating_date = v_entry.operating_date
      AND q.lane_key = v_new_lane
      AND q.exited_at IS NULL
  )
  UPDATE public.patient_flow_queue_entries q
  SET position = ranked.new_position,
      updated_at = v_now
  FROM ranked
  WHERE q.id = ranked.id;

  IF v_entry.lane_key <> v_new_lane THEN
    WITH ranked_old AS (
      SELECT q.id,
             row_number() OVER (ORDER BY q.position, q.entered_at, q.id)::integer AS new_position
      FROM public.patient_flow_queue_entries q
      WHERE q.tenant_id = v_tenant_id
        AND q.operating_date = v_entry.operating_date
        AND q.lane_key = v_entry.lane_key
        AND q.exited_at IS NULL
    )
    UPDATE public.patient_flow_queue_entries q
    SET position = ranked_old.new_position,
        updated_at = v_now
    FROM ranked_old
    WHERE q.id = ranked_old.id;
  END IF;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, queue_entry_id, event_type, actor_clinic_user_id,
    actor_context, occurred_at, source_context, destination_context,
    reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, v_entry.visit_id, p_queue_entry_id, 'waiting_reordered', v_actor_id,
    'operations', v_now,
    jsonb_build_object('lane_key',v_entry.lane_key,'position',v_entry.position),
    jsonb_build_object('lane_key',v_new_lane,'position',v_new_position,'routing_target',COALESCE(p_routing_target,v_entry.routing_target)),
    'reorder_waiting', '{}'::jsonb, p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_reorder_waiting',
    'tenant_id',v_tenant_id,
    'visit_id',v_entry.visit_id,
    'previous_status','waiting',
    'new_status','waiting',
    'work_session_id',NULL,
    'queue_entry_id',p_queue_entry_id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_d3_start_clinical_work(
  p_visit_id uuid,
  p_correlation_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_visit record;
  v_queue record;
  v_existing_event record;
  v_workspace_context text := 'clinical';
  v_work_session_id uuid;
  v_event_id uuid;
  v_sequence_no integer;
  v_now timestamptz := now();
  v_admin_override boolean := false;
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('patient_flow:clinical')
     OR NOT public.has_effective_permission('sessions:update') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  v_admin_override := public.has_effective_permission('patient_flow:administrative');

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':visit:' || p_visit_id::text, 0)
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':corr:' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'clinical_started' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_start_clinical_work',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status','waiting',
      'new_status','in_consultation',
      'work_session_id',v_existing_event.work_session_id,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'waiting' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CLINICAL_START_REQUIRES_WAITING';
  END IF;

  IF v_visit.doctor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CLINICAL_PROVIDER_REQUIRED';
  END IF;

  IF NOT v_admin_override AND v_visit.doctor_id <> v_actor_id THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CLINICAL_PROVIDER_MISMATCH';
  END IF;

  SELECT q.*
  INTO v_queue
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.visit_id = p_visit_id
    AND q.exited_at IS NULL
  ORDER BY q.entered_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_queue.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTIVE_WAITING_QUEUE_ENTRY_REQUIRED';
  END IF;

  SELECT COALESCE(MAX(ws.sequence_no),0) + 1
  INTO v_sequence_no
  FROM public.clinical_work_sessions ws
  WHERE ws.tenant_id = v_tenant_id
    AND ws.visit_id = p_visit_id;

  INSERT INTO public.clinical_work_sessions (
    tenant_id, visit_id, sequence_no, status, performed_by_clinic_user_id,
    clinical_provider_id, room_id, started_at, version
  )
  VALUES (
    v_tenant_id, p_visit_id, v_sequence_no, 'active', v_actor_id,
    v_visit.doctor_id, v_visit.room_id, v_now, 1
  )
  RETURNING id INTO v_work_session_id;

  UPDATE public.patient_flow_queue_entries
  SET exited_at = v_now,
      exit_reason = 'clinical_start',
      updated_at = v_now
  WHERE id = v_queue.id
    AND tenant_id = v_tenant_id;

  UPDATE public.clinic_visit_sessions
  SET session_status = 'in_consultation',
      session_started_at = COALESCE(session_started_at, v_now),
      lock_holder_id = v_actor_id,
      lock_timestamp = v_now,
      updated_at = v_now
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, work_session_id, queue_entry_id, event_type,
    actor_clinic_user_id, actor_context, occurred_at, source_context,
    destination_context, reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_work_session_id, v_queue.id, 'clinical_started',
    v_actor_id, v_workspace_context, v_now,
    jsonb_build_object('status','waiting'),
    jsonb_build_object('status','in_consultation','provider_id',v_visit.doctor_id,'room_id',v_visit.room_id),
    'clinical_start', jsonb_build_object('administrative_override',v_admin_override),
    p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_start_clinical_work',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'previous_status','waiting',
    'new_status','in_consultation',
    'work_session_id',v_work_session_id,
    'queue_entry_id',v_queue.id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_d3_finish_clinical_work(
  p_visit_id uuid,
  p_correlation_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_visit record;
  v_work_session record;
  v_existing_event record;
  v_admin_override boolean := false;
  v_queue_id uuid;
  v_event_id uuid;
  v_position integer;
  v_now timestamptz := now();
  v_timezone text;
  v_operating_date date;
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('patient_flow:clinical')
     OR NOT public.has_effective_permission('sessions:update') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  v_admin_override := public.has_effective_permission('patient_flow:administrative');

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':visit:' || p_visit_id::text, 0)
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':corr:' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'clinical_finished' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_finish_clinical_work',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status','in_consultation',
      'new_status','pending_close',
      'work_session_id',v_existing_event.work_session_id,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'in_consultation' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CLINICAL_FINISH_REQUIRES_IN_CONSULTATION';
  END IF;

  SELECT ws.*
  INTO v_work_session
  FROM public.clinical_work_sessions ws
  WHERE ws.tenant_id = v_tenant_id
    AND ws.visit_id = p_visit_id
    AND ws.status = 'active'
  ORDER BY ws.sequence_no DESC
  LIMIT 1
  FOR UPDATE;

  IF v_work_session.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTIVE_WORK_SESSION_REQUIRED';
  END IF;

  IF NOT v_admin_override AND v_work_session.performed_by_clinic_user_id <> v_actor_id THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='WORK_SESSION_OWNER_REQUIRED';
  END IF;

  SELECT timezone INTO v_timezone
  FROM public.master_tenants
  WHERE id = v_tenant_id;

  IF v_timezone IS NULL OR trim(v_timezone) = '' THEN
    v_timezone := 'UTC';
  END IF;

  v_operating_date := (v_now AT TIME ZONE v_timezone)::date;

  UPDATE public.clinical_work_sessions
  SET status = 'finished',
      ended_at = v_now,
      outcome = 'finish',
      version = version + 1,
      updated_at = v_now
  WHERE id = v_work_session.id
    AND tenant_id = v_tenant_id
    AND status = 'active';

  UPDATE public.clinic_visit_sessions
  SET session_status = 'pending_close',
      session_ended_at = COALESCE(session_ended_at, v_now),
      lock_holder_id = NULL,
      lock_timestamp = NULL,
      updated_at = v_now
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id;

  SELECT COALESCE(MAX(q.position),0) + 1
  INTO v_position
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.operating_date = v_operating_date
    AND q.lane_key = 'general'
    AND q.exited_at IS NULL;

  INSERT INTO public.patient_flow_queue_entries (
    tenant_id, visit_id, operating_date, lane_key, priority_class, position,
    entered_at, entry_reason, routing_target, created_by_clinic_user_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_operating_date, 'general', 'normal', v_position,
    v_now, 'clinical_finished', 'reception', v_actor_id
  )
  RETURNING id INTO v_queue_id;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, work_session_id, queue_entry_id, event_type,
    actor_clinic_user_id, actor_context, occurred_at, source_context,
    destination_context, reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_work_session.id, v_queue_id, 'clinical_finished',
    v_actor_id, 'clinical', v_now,
    jsonb_build_object('status','in_consultation','work_session_id',v_work_session.id),
    jsonb_build_object('status','pending_close','routing_target','reception'),
    'finish', jsonb_build_object('administrative_override',v_admin_override),
    p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_finish_clinical_work',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'previous_status','in_consultation',
    'new_status','pending_close',
    'work_session_id',v_work_session.id,
    'queue_entry_id',v_queue_id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_d3_complete_reception(
  p_visit_id uuid,
  p_correlation_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_visit record;
  v_queue record;
  v_existing_event record;
  v_event_id uuid;
  v_now timestamptz := now();
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('patient_flow:operations')
     OR NOT public.has_effective_permission('sessions:close') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':visit:' || p_visit_id::text, 0)
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':corr:' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'reception_completed' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_complete_reception',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status','pending_close',
      'new_status','completed',
      'work_session_id',NULL,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'pending_close' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='RECEPTION_CLOSE_REQUIRES_PENDING_CLOSE';
  END IF;

  SELECT q.*
  INTO v_queue
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.visit_id = p_visit_id
    AND q.exited_at IS NULL
    AND q.routing_target = 'reception'
  ORDER BY q.entered_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_queue.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTIVE_RECEPTION_QUEUE_ENTRY_REQUIRED';
  END IF;

  UPDATE public.patient_flow_queue_entries
  SET exited_at = v_now,
      exit_reason = 'reception_completed',
      updated_at = v_now
  WHERE id = v_queue.id
    AND tenant_id = v_tenant_id;

  UPDATE public.clinic_visit_sessions
  SET session_status = 'completed',
      visit_closed_at = COALESCE(visit_closed_at, v_now),
      lock_holder_id = NULL,
      lock_timestamp = NULL,
      updated_at = v_now
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, queue_entry_id, event_type, actor_clinic_user_id,
    actor_context, occurred_at, source_context, destination_context,
    reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_queue.id, 'reception_completed', v_actor_id,
    'operations', v_now,
    jsonb_build_object('status','pending_close','routing_target','reception'),
    jsonb_build_object('status','completed'),
    'finish_reception', '{}'::jsonb, p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_complete_reception',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'previous_status','pending_close',
    'new_status','completed',
    'work_session_id',NULL,
    'queue_entry_id',v_queue.id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_d3_cancel_patient_flow(
  p_visit_id uuid,
  p_reason text DEFAULT NULL,
  p_correlation_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_visit record;
  v_queue record;
  v_work_session record;
  v_existing_event record;
  v_event_id uuid;
  v_admin_override boolean := false;
  v_queue_id uuid;
  v_work_session_id uuid;
  v_previous_status text;
  v_now timestamptz := now();
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('sessions:update') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  v_admin_override := public.has_effective_permission('patient_flow:administrative');

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':visit:' || p_visit_id::text, 0)
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':corr:' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'cancelled' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_cancel_patient_flow',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status',COALESCE(v_existing_event.source_context->>'status','unknown'),
      'new_status','cancelled',
      'work_session_id',v_existing_event.work_session_id,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  v_previous_status := v_visit.session_status;

  IF v_previous_status NOT IN ('waiting','in_consultation','pending_close') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='INVALID_CANCEL_STATE';
  END IF;

  IF v_previous_status = 'in_consultation'
     AND NOT v_admin_override
     AND NOT public.has_effective_permission('patient_flow:clinical') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  IF v_previous_status IN ('waiting','pending_close')
     AND NOT v_admin_override
     AND NOT public.has_effective_permission('patient_flow:operations') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  SELECT q.*
  INTO v_queue
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.visit_id = p_visit_id
    AND q.exited_at IS NULL
  ORDER BY q.entered_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_previous_status = 'in_consultation' THEN
    SELECT ws.*
    INTO v_work_session
    FROM public.clinical_work_sessions ws
    WHERE ws.tenant_id = v_tenant_id
      AND ws.visit_id = p_visit_id
      AND ws.status = 'active'
    ORDER BY ws.sequence_no DESC
    LIMIT 1
    FOR UPDATE;

    IF v_work_session.id IS NOT NULL THEN
      IF NOT v_admin_override
         AND v_work_session.performed_by_clinic_user_id <> v_actor_id THEN
        RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='WORK_SESSION_OWNER_REQUIRED';
      END IF;

      UPDATE public.clinical_work_sessions
      SET status = 'cancelled',
          ended_at = v_now,
          outcome = 'cancelled',
          version = version + 1,
          updated_at = v_now
      WHERE id = v_work_session.id
        AND tenant_id = v_tenant_id;

      v_work_session_id := v_work_session.id;
    END IF;
  END IF;

  IF v_queue.id IS NOT NULL THEN
    UPDATE public.patient_flow_queue_entries
    SET exited_at = v_now,
        exit_reason = 'cancelled',
        updated_at = v_now
    WHERE id = v_queue.id
      AND tenant_id = v_tenant_id;

    v_queue_id := v_queue.id;
  END IF;

  UPDATE public.clinic_visit_sessions
  SET session_status = 'cancelled',
      session_ended_at = CASE WHEN v_previous_status='in_consultation' THEN COALESCE(session_ended_at,v_now) ELSE session_ended_at END,
      lock_holder_id = NULL,
      lock_timestamp = NULL,
      updated_at = v_now
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, work_session_id, queue_entry_id, event_type,
    actor_clinic_user_id, actor_context, occurred_at, source_context,
    destination_context, reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_work_session_id, v_queue_id, 'cancelled',
    v_actor_id,
    CASE WHEN v_previous_status='in_consultation' THEN 'clinical' ELSE 'operations' END,
    v_now,
    jsonb_build_object('status',v_previous_status),
    jsonb_build_object('status','cancelled'),
    p_reason, jsonb_build_object('administrative_override',v_admin_override),
    p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_cancel_patient_flow',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'previous_status',v_previous_status,
    'new_status','cancelled',
    'work_session_id',v_work_session_id,
    'queue_entry_id',v_queue_id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_d3_mark_no_show(
  p_visit_id uuid,
  p_reason text DEFAULT NULL,
  p_correlation_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor_id uuid;
  v_tenant_id uuid;
  v_visit record;
  v_queue record;
  v_existing_event record;
  v_event_id uuid;
  v_now timestamptz := now();
BEGIN
  IF p_correlation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_REQUIRED';
  END IF;

  SELECT cu.id, cu.tenant_id
  INTO v_actor_id, v_tenant_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTOR_NOT_FOUND';
  END IF;

  IF NOT public.has_effective_permission('patient_flow:operations')
     OR NOT public.has_effective_permission('sessions:update') THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='PERMISSION_DENIED';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':visit:' || p_visit_id::text, 0)
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_tenant_id::text || ':corr:' || p_correlation_id::text, 0)
  );

  SELECT e.*
  INTO v_existing_event
  FROM public.patient_flow_events e
  WHERE e.tenant_id = v_tenant_id
    AND e.correlation_id = p_correlation_id
  ORDER BY e.occurred_at DESC, e.created_at DESC
  LIMIT 1;

  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.event_type <> 'no_show' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_d3_mark_no_show',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'previous_status','waiting',
      'new_status','no_show',
      'work_session_id',NULL,
      'queue_entry_id',v_existing_event.queue_entry_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'waiting' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='NO_SHOW_REQUIRES_WAITING';
  END IF;

  SELECT q.*
  INTO v_queue
  FROM public.patient_flow_queue_entries q
  WHERE q.tenant_id = v_tenant_id
    AND q.visit_id = p_visit_id
    AND q.exited_at IS NULL
  ORDER BY q.entered_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_queue.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTIVE_WAITING_QUEUE_ENTRY_REQUIRED';
  END IF;

  UPDATE public.patient_flow_queue_entries
  SET exited_at = v_now,
      exit_reason = 'no_show',
      updated_at = v_now
  WHERE id = v_queue.id
    AND tenant_id = v_tenant_id;

  UPDATE public.clinic_visit_sessions
  SET session_status = 'no_show',
      lock_holder_id = NULL,
      lock_timestamp = NULL,
      updated_at = v_now
  WHERE id = p_visit_id
    AND tenant_id = v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id, visit_id, queue_entry_id, event_type, actor_clinic_user_id,
    actor_context, occurred_at, source_context, destination_context,
    reason, metadata, correlation_id
  )
  VALUES (
    v_tenant_id, p_visit_id, v_queue.id, 'no_show', v_actor_id,
    'operations', v_now,
    jsonb_build_object('status','waiting'),
    jsonb_build_object('status','no_show'),
    p_reason, '{}'::jsonb, p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_d3_mark_no_show',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'previous_status','waiting',
    'new_status','no_show',
    'work_session_id',NULL,
    'queue_entry_id',v_queue.id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id
  );
END;
$function$;

-- Application-facing D3 RPCs are deliberate authenticated APIs; no anonymous/public
-- execution is allowed. Internal authorization remains inside the functions.
REVOKE ALL ON FUNCTION public.csapi_d3_enter_waiting(uuid,text,text,text,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.csapi_d3_reorder_waiting(uuid,integer,text,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.csapi_d3_start_clinical_work(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.csapi_d3_finish_clinical_work(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.csapi_d3_complete_reception(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.csapi_d3_cancel_patient_flow(uuid,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.csapi_d3_mark_no_show(uuid,text,uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.csapi_d3_enter_waiting(uuid,text,text,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_d3_reorder_waiting(uuid,integer,text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_d3_start_clinical_work(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_d3_finish_clinical_work(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_d3_complete_reception(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_d3_cancel_patient_flow(uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_d3_mark_no_show(uuid,text,uuid) TO authenticated;

COMMIT;
