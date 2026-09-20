BEGIN;

-- CSAPI Gate 01 / D3 follow-up:
-- Make Hold/Resume canonical Work Session mutations rather than direct Visit-lock writes.
-- Strengthen the Visit table boundary so authenticated clients cannot bypass the D3/D2
-- authority model through PostgREST updates to lifecycle, lock, or Reception-owned identity fields.

CREATE OR REPLACE FUNCTION public.csapi_guard_visit_lifecycle_writes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $function$
BEGIN
  -- Migrations/service-role fixtures and the canonical SECURITY DEFINER command layer
  -- are trusted database writers. Authenticated application clients are not.
  IF current_user NOT IN ('postgres','service_role') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.session_status <> 'waiting'
         OR NOT public.has_effective_permission('patient_flow:operations') THEN
        RAISE EXCEPTION USING
          ERRCODE='P0001',
          MESSAGE='D3_LIFECYCLE_AUTHORITY_REQUIRED';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF (
        NEW.session_status IS DISTINCT FROM OLD.session_status
        OR NEW.arrived_at IS DISTINCT FROM OLD.arrived_at
        OR NEW.session_started_at IS DISTINCT FROM OLD.session_started_at
        OR NEW.session_ended_at IS DISTINCT FROM OLD.session_ended_at
        OR NEW.visit_closed_at IS DISTINCT FROM OLD.visit_closed_at
        OR NEW.lock_holder_id IS DISTINCT FROM OLD.lock_holder_id
        OR NEW.lock_timestamp IS DISTINCT FROM OLD.lock_timestamp
      ) THEN
        RAISE EXCEPTION USING
          ERRCODE='P0001',
          MESSAGE='D3_LIFECYCLE_AUTHORITY_REQUIRED';
      END IF;

      IF (
        NEW.patient_id IS DISTINCT FROM OLD.patient_id
        OR NEW.doctor_id IS DISTINCT FROM OLD.doctor_id
        OR NEW.room_id IS DISTINCT FROM OLD.room_id
        OR NEW.agenda_event_id IS DISTINCT FROM OLD.agenda_event_id
        OR NEW.initialized_by_receptionist IS DISTINCT FROM OLD.initialized_by_receptionist
      )
      AND NOT public.has_effective_permission('patient_flow:operations') THEN
        RAISE EXCEPTION USING
          ERRCODE='P0001',
          MESSAGE='PATIENT_FLOW_OPERATIONS_AUTHORITY_REQUIRED';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.csapi_work_session_hold(uuid,text,uuid);
DROP FUNCTION IF EXISTS public.csapi_work_session_resume(uuid,uuid);

CREATE OR REPLACE FUNCTION public.csapi_work_session_hold(
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
  v_work_session record;
  v_existing_event record;
  v_event_id uuid;
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

  IF NOT public.has_effective_permission('sessions:update')
     OR NOT public.has_effective_permission('patient_flow:clinical') THEN
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
    IF v_existing_event.event_type <> 'work_session_held' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_work_session_hold',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'work_session_id',v_existing_event.work_session_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id,
      'status','held'
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id=p_visit_id
    AND tenant_id=v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'in_consultation' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='HOLD_REQUIRES_IN_CONSULTATION';
  END IF;

  SELECT *
  INTO v_work_session
  FROM public.clinical_work_sessions
  WHERE tenant_id=v_tenant_id
    AND visit_id=p_visit_id
    AND status='active'
  ORDER BY sequence_no DESC
  LIMIT 1
  FOR UPDATE;

  IF v_work_session.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='ACTIVE_WORK_SESSION_REQUIRED';
  END IF;

  IF NOT v_admin_override AND v_work_session.performed_by_clinic_user_id <> v_actor_id THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='WORK_SESSION_OWNER_REQUIRED';
  END IF;

  IF NOT v_admin_override
     AND v_visit.lock_holder_id IS DISTINCT FROM v_actor_id THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_LOCK_OWNER_REQUIRED';
  END IF;

  UPDATE public.clinical_work_sessions
  SET status='held',
      outcome='hold',
      hold_reason=NULLIF(trim(p_reason),''),
      version=version+1,
      updated_at=v_now
  WHERE id=v_work_session.id
    AND tenant_id=v_tenant_id
    AND status='active';

  UPDATE public.clinic_visit_sessions
  SET lock_holder_id=NULL,
      lock_timestamp=NULL,
      updated_at=v_now
  WHERE id=p_visit_id
    AND tenant_id=v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id,visit_id,work_session_id,event_type,actor_clinic_user_id,
    actor_context,occurred_at,source_context,destination_context,
    reason,metadata,correlation_id
  )
  VALUES (
    v_tenant_id,p_visit_id,v_work_session.id,'work_session_held',v_actor_id,
    'clinical',v_now,
    jsonb_build_object('visit_status','in_consultation','work_session_status','active'),
    jsonb_build_object('visit_status','in_consultation','work_session_status','held'),
    NULLIF(trim(p_reason),''),jsonb_build_object('administrative_override',v_admin_override),
    p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_work_session_hold',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'work_session_id',v_work_session.id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id,
    'status','held'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.csapi_work_session_resume(
  p_visit_id uuid,
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
  v_work_session record;
  v_existing_event record;
  v_event_id uuid;
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

  IF NOT public.has_effective_permission('sessions:update')
     OR NOT public.has_effective_permission('patient_flow:clinical') THEN
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
    IF v_existing_event.event_type <> 'work_session_resumed' THEN
      RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='CORRELATION_ID_ALREADY_USED';
    END IF;
    RETURN jsonb_build_object(
      'command','csapi_work_session_resume',
      'tenant_id',v_tenant_id,
      'visit_id',v_existing_event.visit_id,
      'work_session_id',v_existing_event.work_session_id,
      'event_id',v_existing_event.id,
      'correlation_id',p_correlation_id,
      'status','active'
    );
  END IF;

  SELECT *
  INTO v_visit
  FROM public.clinic_visit_sessions
  WHERE id=p_visit_id
    AND tenant_id=v_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_visit.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_NOT_FOUND';
  END IF;

  IF v_visit.session_status <> 'in_consultation' THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='RESUME_REQUIRES_IN_CONSULTATION';
  END IF;

  IF v_visit.lock_holder_id IS NOT NULL
     AND v_visit.lock_holder_id IS DISTINCT FROM v_actor_id
     AND NOT v_admin_override THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='VISIT_ALREADY_LOCKED';
  END IF;

  SELECT *
  INTO v_work_session
  FROM public.clinical_work_sessions
  WHERE tenant_id=v_tenant_id
    AND visit_id=p_visit_id
    AND status='held'
  ORDER BY sequence_no DESC
  LIMIT 1
  FOR UPDATE;

  IF v_work_session.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='HELD_WORK_SESSION_REQUIRED';
  END IF;

  IF NOT v_admin_override AND v_work_session.performed_by_clinic_user_id <> v_actor_id THEN
    RAISE EXCEPTION USING ERRCODE='P0001', MESSAGE='WORK_SESSION_OWNER_REQUIRED';
  END IF;

  UPDATE public.clinical_work_sessions
  SET status='active',
      outcome=NULL,
      version=version+1,
      updated_at=v_now
  WHERE id=v_work_session.id
    AND tenant_id=v_tenant_id
    AND status='held';

  UPDATE public.clinic_visit_sessions
  SET lock_holder_id=v_actor_id,
      lock_timestamp=v_now,
      updated_at=v_now
  WHERE id=p_visit_id
    AND tenant_id=v_tenant_id;

  INSERT INTO public.patient_flow_events (
    tenant_id,visit_id,work_session_id,event_type,actor_clinic_user_id,
    actor_context,occurred_at,source_context,destination_context,
    reason,metadata,correlation_id
  )
  VALUES (
    v_tenant_id,p_visit_id,v_work_session.id,'work_session_resumed',v_actor_id,
    'clinical',v_now,
    jsonb_build_object('visit_status','in_consultation','work_session_status','held'),
    jsonb_build_object('visit_status','in_consultation','work_session_status','active'),
    'resume',jsonb_build_object('administrative_override',v_admin_override),
    p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'command','csapi_work_session_resume',
    'tenant_id',v_tenant_id,
    'visit_id',p_visit_id,
    'work_session_id',v_work_session.id,
    'event_id',v_event_id,
    'correlation_id',p_correlation_id,
    'status','active'
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.csapi_work_session_hold(uuid,text,uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.csapi_work_session_resume(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.csapi_work_session_hold(uuid,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.csapi_work_session_resume(uuid,uuid) TO authenticated;

COMMIT;
