-- Communications/Chat production QA repair.
-- The previous 20260913204348 repair introduced a cross-policy RLS recursion:
-- participant INSERT inspected conversations, while conversation SELECT inspected participants.
-- It also left participant INSERT broadly available to communications:send users.
-- Use one narrow transactional Communications mutation boundary instead.

DROP POLICY IF EXISTS communications_conversations_create ON public.communication_conversations;
DROP POLICY IF EXISTS communications_participants_create ON public.communication_conversation_participants;
DROP POLICY IF EXISTS communications_participants_access ON public.communication_conversation_participants;

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
BEGIN
  v_tenant_id := public.get_current_tenant_id();

  SELECT cu.id
  INTO v_creator_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
    AND cu.tenant_id = v_tenant_id
    AND cu.is_active = true
    AND cu.deleted_at IS NULL
  LIMIT 1;

  IF v_creator_id IS NULL THEN
    RAISE EXCEPTION 'COMMUNICATIONS_CLINIC_USER_REQUIRED';
  END IF;

  IF NOT public.has_tenant_permission(v_tenant_id, 'communications:send') THEN
    RAISE EXCEPTION 'COMMUNICATIONS_SEND_PERMISSION_REQUIRED';
  END IF;

  v_recipient_ids := ARRAY(
    SELECT DISTINCT recipient_id
    FROM unnest(COALESCE(p_recipient_user_ids, '{}'::uuid[])) AS recipient_id
    WHERE recipient_id <> v_creator_id
  );

  IF p_clinic_patient_id IS NULL
     AND COALESCE(array_length(v_recipient_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'COMMUNICATIONS_RECIPIENT_REQUIRED';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(v_recipient_ids) AS requested(id)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.clinic_users cu
      WHERE cu.id = requested.id
        AND cu.tenant_id = v_tenant_id
        AND cu.is_active = true
        AND cu.deleted_at IS NULL
    )
  ) THEN
    RAISE EXCEPTION 'COMMUNICATIONS_RECIPIENT_TENANT_OR_STATUS_INVALID';
  END IF;

  IF p_clinic_patient_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM public.clinic_patients cp
       WHERE cp.id = p_clinic_patient_id
         AND cp.tenant_id = v_tenant_id
         AND cp.deleted_at IS NULL
     ) THEN
    RAISE EXCEPTION 'COMMUNICATIONS_PATIENT_TENANT_OR_STATUS_INVALID';
  END IF;

  INSERT INTO public.communication_conversations (
    tenant_id,
    kind,
    subject,
    clinic_patient_id,
    created_by
  ) VALUES (
    v_tenant_id,
    CASE WHEN p_clinic_patient_id IS NULL THEN 'internal' ELSE 'patient' END,
    NULLIF(btrim(p_subject), ''),
    p_clinic_patient_id,
    v_creator_id
  )
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.communication_conversation_participants (
    tenant_id,
    conversation_id,
    clinic_user_id,
    role
  )
  VALUES (
    v_tenant_id,
    v_conversation_id,
    v_creator_id,
    'owner'
  );

  INSERT INTO public.communication_conversation_participants (
    tenant_id,
    conversation_id,
    clinic_user_id,
    role
  )
  SELECT
    v_tenant_id,
    v_conversation_id,
    requested.id,
    'participant'
  FROM unnest(v_recipient_ids) AS requested(id);

  RETURN v_conversation_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_communication_conversation(text, uuid[], uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_communication_conversation(text, uuid[], uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_communication_conversation(text, uuid[], uuid) TO authenticated;

-- Participant membership remains visible to the current participant and to
-- communications:manage users. Direct inserts are reserved for management;
-- authorized sender creation is performed transactionally by the function above.
CREATE POLICY communications_participants_access
ON public.communication_conversation_participants
FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_current_tenant_id()
  AND (
    public.has_tenant_permission(tenant_id, 'communications:manage')
    OR clinic_user_id = (
      SELECT cu.id
      FROM public.clinic_users cu
      WHERE cu.auth_user_id = auth.uid()
        AND cu.tenant_id = communication_conversation_participants.tenant_id
        AND cu.is_active = true
        AND cu.deleted_at IS NULL
      LIMIT 1
    )
  )
);

CREATE POLICY communications_participants_manage_insert
ON public.communication_conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = public.get_current_tenant_id()
  AND public.has_tenant_permission(tenant_id, 'communications:manage')
);

CREATE POLICY communications_participants_manage_update
ON public.communication_conversation_participants
FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_current_tenant_id()
  AND public.has_tenant_permission(tenant_id, 'communications:manage')
)
WITH CHECK (
  tenant_id = public.get_current_tenant_id()
  AND public.has_tenant_permission(tenant_id, 'communications:manage')
);

CREATE POLICY communications_participants_self_update
ON public.communication_conversation_participants
FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_current_tenant_id()
  AND clinic_user_id = (
    SELECT cu.id
    FROM public.clinic_users cu
    WHERE cu.auth_user_id = auth.uid()
      AND cu.tenant_id = communication_conversation_participants.tenant_id
      AND cu.is_active = true
      AND cu.deleted_at IS NULL
    LIMIT 1
  )
)
WITH CHECK (
  tenant_id = public.get_current_tenant_id()
  AND clinic_user_id = (
    SELECT cu.id
    FROM public.clinic_users cu
    WHERE cu.auth_user_id = auth.uid()
      AND cu.tenant_id = communication_conversation_participants.tenant_id
      AND cu.is_active = true
      AND cu.deleted_at IS NULL
    LIMIT 1
  )
);

CREATE POLICY communications_participants_manage_delete
ON public.communication_conversation_participants
FOR DELETE
TO authenticated
USING (
  tenant_id = public.get_current_tenant_id()
  AND public.has_tenant_permission(tenant_id, 'communications:manage')
);

CREATE POLICY communications_participants_self_delete
ON public.communication_conversation_participants
FOR DELETE
TO authenticated
USING (
  tenant_id = public.get_current_tenant_id()
  AND clinic_user_id = (
    SELECT cu.id
    FROM public.clinic_users cu
    WHERE cu.auth_user_id = auth.uid()
      AND cu.tenant_id = communication_conversation_participants.tenant_id
      AND cu.is_active = true
      AND cu.deleted_at IS NULL
    LIMIT 1
  )
);
