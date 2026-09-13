-- Complete Header Chat functional repair: reuse active 1:1 conversations.
-- Communications remains the authoritative storage and permission boundary.

BEGIN;

CREATE OR REPLACE FUNCTION public.create_communication_conversation(
  p_subject text DEFAULT NULL,
  p_recipient_user_ids uuid[] DEFAULT '{}',
  p_clinic_patient_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_tenant_id uuid;
  v_creator_id uuid;
  v_conversation_id uuid;
  v_recipient_ids uuid[];
  v_recipient_id uuid;
BEGIN
  v_tenant_id := public.get_current_tenant_id();

  SELECT cu.id INTO v_creator_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.tenant_id = v_tenant_id
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_creator_id IS NULL THEN RAISE EXCEPTION 'COMMUNICATIONS_CLINIC_USER_REQUIRED'; END IF;
  IF NOT public.has_tenant_permission(v_tenant_id, 'communications:send') THEN RAISE EXCEPTION 'COMMUNICATIONS_SEND_PERMISSION_REQUIRED'; END IF;

  v_recipient_ids := ARRAY(
    SELECT DISTINCT recipient_id
    FROM unnest(COALESCE(p_recipient_user_ids, '{}'::uuid[])) AS recipient_id
    WHERE recipient_id <> v_creator_id
  );

  IF p_clinic_patient_id IS NULL AND COALESCE(array_length(v_recipient_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'COMMUNICATIONS_RECIPIENT_REQUIRED';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(v_recipient_ids) AS requested(id)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.clinic_users cu
      WHERE cu.id = requested.id AND cu.tenant_id = v_tenant_id AND cu.is_active = true AND cu.deleted_at IS NULL
    )
  ) THEN RAISE EXCEPTION 'COMMUNICATIONS_RECIPIENT_TENANT_OR_STATUS_INVALID'; END IF;

  IF p_clinic_patient_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clinic_patients cp
    WHERE cp.id = p_clinic_patient_id AND cp.tenant_id = v_tenant_id AND cp.deleted_at IS NULL
  ) THEN RAISE EXCEPTION 'COMMUNICATIONS_PATIENT_TENANT_OR_STATUS_INVALID'; END IF;

  -- Reuse an active direct internal conversation only for exactly one recipient.
  -- A transaction advisory lock prevents two concurrent first-open actions from
  -- creating two separate 1:1 conversations for the same pair.
  IF p_clinic_patient_id IS NULL AND COALESCE(array_length(v_recipient_ids, 1), 0) = 1 THEN
    v_recipient_id := v_recipient_ids[1];
    PERFORM pg_advisory_xact_lock(hashtextextended(v_tenant_id::text || ':' || LEAST(v_creator_id::text, v_recipient_id::text) || ':' || GREATEST(v_creator_id::text, v_recipient_id::text), 0));

    SELECT cc.id INTO v_conversation_id
    FROM public.communication_conversations cc
    WHERE cc.tenant_id = v_tenant_id
      AND cc.kind = 'internal'
      AND cc.status <> 'archived'
      AND (SELECT count(*) FROM public.communication_conversation_participants cp WHERE cp.tenant_id = v_tenant_id AND cp.conversation_id = cc.id) = 2
      AND EXISTS (SELECT 1 FROM public.communication_conversation_participants cp WHERE cp.tenant_id = v_tenant_id AND cp.conversation_id = cc.id AND cp.clinic_user_id = v_creator_id)
      AND EXISTS (SELECT 1 FROM public.communication_conversation_participants cp WHERE cp.tenant_id = v_tenant_id AND cp.conversation_id = cc.id AND cp.clinic_user_id = v_recipient_id)
    ORDER BY cc.updated_at DESC, cc.created_at DESC
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN RETURN v_conversation_id; END IF;
  END IF;

  INSERT INTO public.communication_conversations (tenant_id, kind, subject, clinic_patient_id, created_by)
  VALUES (v_tenant_id, CASE WHEN p_clinic_patient_id IS NULL THEN 'internal' ELSE 'patient' END, NULLIF(btrim(p_subject), ''), p_clinic_patient_id, v_creator_id)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.communication_conversation_participants (tenant_id, conversation_id, clinic_user_id, role)
  VALUES (v_tenant_id, v_conversation_id, v_creator_id, 'owner');

  INSERT INTO public.communication_conversation_participants (tenant_id, conversation_id, clinic_user_id, role)
  SELECT v_tenant_id, v_conversation_id, requested.id, 'participant'
  FROM unnest(v_recipient_ids) AS requested(id);

  RETURN v_conversation_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_communication_conversation(text, uuid[], uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_communication_conversation(text, uuid[], uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_communication_conversation(text, uuid[], uuid) TO authenticated;

-- Remove only demonstrably empty duplicate 1:1 conversations produced by the
-- broken pre-reuse flow. Conversations containing messages are never touched.
WITH pairs AS (
  SELECT cc.id,
         row_number() OVER (
           PARTITION BY cc.tenant_id,
             (SELECT array_agg(cp.clinic_user_id ORDER BY cp.clinic_user_id) FROM public.communication_conversation_participants cp WHERE cp.conversation_id = cc.id)
           ORDER BY cc.updated_at DESC, cc.created_at DESC
         ) AS rn
  FROM public.communication_conversations cc
  WHERE cc.kind = 'internal'
    AND cc.status <> 'archived'
    AND NOT EXISTS (SELECT 1 FROM public.communication_messages cm WHERE cm.conversation_id = cc.id)
)
DELETE FROM public.communication_conversations cc
USING pairs p
WHERE cc.id = p.id AND p.rn > 1;

COMMIT;
