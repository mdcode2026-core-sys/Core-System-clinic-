ALTER TABLE public.retention_followups
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS action_type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS execution_mode text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS result text,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_action_type text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

ALTER TABLE public.retention_followups
  ADD CONSTRAINT retention_followups_status_check CHECK (status IN ('open','in_progress','completed','cancelled','skipped')),
  ADD CONSTRAINT retention_followups_action_type_check CHECK (action_type IN ('call','whatsapp','sms','email','appointment','review','general')),
  ADD CONSTRAINT retention_followups_execution_mode_check CHECK (execution_mode IN ('manual','automated'));

ALTER TABLE public.retention_followups
  ADD CONSTRAINT retention_followups_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.clinic_users(id),
  ADD CONSTRAINT retention_followups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.clinic_users(id),
  ADD CONSTRAINT retention_followups_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.clinic_users(id);

CREATE INDEX IF NOT EXISTS idx_retention_followups_tenant_status_scheduled
  ON public.retention_followups (tenant_id, status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_retention_followups_tenant_assignee_status
  ON public.retention_followups (tenant_id, assigned_to, status);

CREATE OR REPLACE FUNCTION public.fn_audit_followup_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  SELECT cu.id INTO v_actor_id
  FROM public.clinic_users cu
  WHERE cu.auth_user_id = auth.uid()
  LIMIT 1;

  INSERT INTO public.audit_trail (
    tenant_id, actor_id, actor_role, action, table_name, record_id, new_values
  ) VALUES (
    NEW.tenant_id, v_actor_id, get_current_user_role(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_followups_audit_insert ON public.retention_followups;
CREATE TRIGGER tr_followups_audit_insert
AFTER INSERT ON public.retention_followups
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_followup_insert();

DROP TRIGGER IF EXISTS tr_followups_audit_update ON public.retention_followups;
CREATE TRIGGER tr_followups_audit_update
AFTER UPDATE ON public.retention_followups
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_changes();

INSERT INTO public.feature_flags (tenant_id, flag_key, flag_name, description, is_enabled, allowed_tiers, config_json)
SELECT NULL, 'followup_automation', 'Follow-up Automation', 'Tenant-level automated follow-up capability. Enabled per tenant by platform administration.', false, ARRAY['enterprise']::text[], '{}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.feature_flags WHERE flag_key = 'followup_automation' AND tenant_id IS NULL
);
