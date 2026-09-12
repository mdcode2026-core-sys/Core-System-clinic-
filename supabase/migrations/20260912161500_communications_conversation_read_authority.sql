-- Wave A / Phase 4: patient Communications conversations are tenant-readable;
-- internal conversations remain participant-readable.

DROP POLICY IF EXISTS communications_conversations_read ON public.communication_conversations;

CREATE POLICY communications_conversations_read
ON public.communication_conversations
FOR SELECT
TO authenticated
USING (
  tenant_id = get_current_tenant_id()
  AND (
    (
      kind = 'patient'
      AND EXISTS (
        SELECT 1 FROM clinic_users cu
        WHERE cu.auth_user_id = auth.uid()
          AND cu.tenant_id = communication_conversations.tenant_id
          AND cu.is_active = true
          AND cu.deleted_at IS NULL
      )
    )
    OR (
      EXISTS (
        SELECT 1 FROM communication_conversation_participants cp
        WHERE cp.tenant_id = communication_conversations.tenant_id
          AND cp.conversation_id = communication_conversations.id
          AND cp.clinic_user_id = (
            SELECT clinic_users.id FROM clinic_users
            WHERE clinic_users.auth_user_id = auth.uid()
              AND clinic_users.tenant_id = communication_conversations.tenant_id
            LIMIT 1
          )
      )
    )
    OR (
      kind = 'patient'
      AND EXISTS (
        SELECT 1
        FROM patient_identities pi
        JOIN patient_clinic_relationships pcr ON pcr.patient_identity_id = pi.id
        WHERE pi.auth_user_id = auth.uid()
          AND pi.status = 'active'
          AND pcr.tenant_id = communication_conversations.tenant_id
          AND pcr.clinic_patient_id = communication_conversations.clinic_patient_id
          AND pcr.status = 'active'
          AND pcr.deleted_at IS NULL
      )
    )
  )
);
