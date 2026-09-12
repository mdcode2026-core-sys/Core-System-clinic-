-- Wave A / Phase 2-4: Communications is tenant-wide for reading.
-- Action-level permissions continue to govern send/manage operations.
-- Internal notes remain participant-scoped through the existing participant branch.

DROP POLICY IF EXISTS communications_messages_read ON public.communication_messages;

CREATE POLICY communications_messages_read
ON public.communication_messages
FOR SELECT
TO authenticated
USING (
  tenant_id = get_current_tenant_id()
  AND (
    (
      message_kind = 'message'
      AND EXISTS (
        SELECT 1
        FROM clinic_users cu
        WHERE cu.auth_user_id = auth.uid()
          AND cu.tenant_id = communication_messages.tenant_id
          AND cu.is_active = true
          AND cu.deleted_at IS NULL
      )
    )
    OR (
      EXISTS (
        SELECT 1
        FROM communication_conversation_participants cp
        WHERE cp.tenant_id = communication_messages.tenant_id
          AND cp.conversation_id = communication_messages.conversation_id
          AND cp.clinic_user_id = (
            SELECT clinic_users.id
            FROM clinic_users
            WHERE clinic_users.auth_user_id = auth.uid()
              AND clinic_users.tenant_id = communication_messages.tenant_id
            LIMIT 1
          )
      )
    )
    OR (
      message_kind = 'message'
      AND EXISTS (
        SELECT 1
        FROM patient_identities pi
        JOIN patient_clinic_relationships pcr
          ON pcr.patient_identity_id = pi.id
        JOIN communication_conversations cc
          ON cc.tenant_id = pcr.tenant_id
         AND cc.clinic_patient_id = pcr.clinic_patient_id
         AND cc.id = communication_messages.conversation_id
        WHERE pi.auth_user_id = auth.uid()
          AND pi.status = 'active'
          AND pcr.tenant_id = communication_messages.tenant_id
          AND pcr.status = 'active'
          AND pcr.deleted_at IS NULL
      )
    )
  )
);
