UPDATE public.retention_followups
SET status = CASE
  WHEN delivery_status = 'cancelled' THEN 'cancelled'
  WHEN delivery_status IN ('sent','delivered','read') THEN 'completed'
  ELSE 'open'
END,
    action_type = CASE
      WHEN channel = 'whatsapp' THEN 'whatsapp'
      WHEN channel = 'sms' THEN 'sms'
      WHEN channel = 'email' THEN 'email'
      ELSE 'general'
    END,
    completed_at = CASE
      WHEN delivery_status IN ('sent','delivered','read') THEN COALESCE(sent_at, updated_at, created_at)
      ELSE completed_at
    END,
    cancelled_at = CASE
      WHEN delivery_status = 'cancelled' THEN COALESCE(updated_at, created_at)
      ELSE cancelled_at
    END
WHERE true;
