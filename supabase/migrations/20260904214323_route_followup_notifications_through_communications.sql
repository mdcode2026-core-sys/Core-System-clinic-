-- ADR-014 remediation: Follow-up owns continuity; Communications owns delivery orchestration.
-- No existing Follow-up test data is deleted or modified.

CREATE OR REPLACE FUNCTION public.enqueue_followup_notification(
  p_tenant_id uuid,
  p_followup_id uuid,
  p_patient_id uuid,
  p_channel text,
  p_message_body text,
  p_scheduled_at timestamptz,
  p_followup_type text,
  p_automation_rule_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_entitlement_key text;
BEGIN
  IF p_channel IS NULL THEN RETURN false; END IF;
  IF p_channel IN ('email','sms','whatsapp') THEN
    v_entitlement_key := 'communication.' || p_channel;
    IF NOT EXISTS (
      SELECT 1 FROM public.tenant_entitlements te
      WHERE te.tenant_id=p_tenant_id AND te.entitlement_key=v_entitlement_key
        AND te.status='active' AND te.effective_from<=now()
        AND (te.effective_until IS NULL OR te.effective_until>now())
        AND te.deleted_at IS NULL
    ) THEN RETURN false; END IF;
  END IF;
  INSERT INTO public.notification_queue
    (tenant_id, recipient_type, recipient_id, channel, message_body, priority, status,
     retry_count, max_retries, scheduled_at, metadata)
  SELECT rf.tenant_id,'patient',rf.patient_id,rf.channel,coalesce(rf.message_body,''),5,
    'queued',0,3,rf.scheduled_for,
    jsonb_build_object('followup_id',rf.id,'followup_type',rf.followup_type,
      'automation_rule_id',rf.automation_rule_id,'execution_mode','automated',
      'communication_source','followup','manual_review_fallback',true)
  FROM public.retention_followups rf
  WHERE rf.id=p_followup_id AND rf.tenant_id=p_tenant_id AND rf.patient_id=p_patient_id
    AND rf.channel=p_channel AND rf.execution_mode='automated' AND rf.status='open'
    AND rf.scheduled_for<=now() AND rf.delivery_status IN ('pending','failed')
    AND NOT EXISTS (SELECT 1 FROM public.notification_queue nq
      WHERE nq.tenant_id=rf.tenant_id AND nq.metadata->>'followup_id'=rf.id::text);
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_followup_notification(uuid,uuid,uuid,text,text,timestamptz,text,uuid) FROM PUBLIC, anon, authenticated;
