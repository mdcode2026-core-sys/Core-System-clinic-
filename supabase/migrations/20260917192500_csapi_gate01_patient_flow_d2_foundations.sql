BEGIN;

-- CSAPI Gate 01 / D2 — additive Patient Flow database foundations.
-- This migration introduces first-class Work Session, Queue Entry and business-event
-- records without replacing the legacy clinic_visit_sessions lifecycle yet.

CREATE UNIQUE INDEX IF NOT EXISTS clinic_visit_sessions_tenant_id_id_key
  ON public.clinic_visit_sessions (tenant_id, id);

CREATE TABLE IF NOT EXISTS public.clinical_work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL,
  sequence_no integer NOT NULL CHECK (sequence_no > 0),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'finished', 'held', 'transferred', 'cancelled')),
  performed_by_clinic_user_id uuid NOT NULL,
  clinical_provider_id uuid,
  room_id uuid,
  started_at timestamptz,
  ended_at timestamptz,
  outcome text CHECK (outcome IS NULL OR outcome IN ('finish', 'hold', 'transfer', 'cancelled')),
  hold_reason text,
  transfer_reason text,
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinical_work_sessions_tenant_id_key UNIQUE (tenant_id, id),
  CONSTRAINT clinical_work_sessions_visit_same_tenant_fk
    FOREIGN KEY (tenant_id, visit_id)
    REFERENCES public.clinic_visit_sessions (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT clinical_work_sessions_actor_same_tenant_fk
    FOREIGN KEY (tenant_id, performed_by_clinic_user_id)
    REFERENCES public.clinic_users (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT clinical_work_sessions_provider_same_tenant_fk
    FOREIGN KEY (tenant_id, clinical_provider_id)
    REFERENCES public.clinic_users (tenant_id, id)
    ON DELETE SET NULL,
  CONSTRAINT clinical_work_sessions_room_same_tenant_fk
    FOREIGN KEY (tenant_id, room_id)
    REFERENCES public.clinic_rooms (tenant_id, id)
    ON DELETE SET NULL,
  CONSTRAINT clinical_work_sessions_visit_sequence_key UNIQUE (tenant_id, visit_id, sequence_no)
);

CREATE UNIQUE INDEX IF NOT EXISTS clinical_work_sessions_one_active_per_visit_idx
  ON public.clinical_work_sessions (tenant_id, visit_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS clinical_work_sessions_visit_idx
  ON public.clinical_work_sessions (tenant_id, visit_id, sequence_no);

CREATE INDEX IF NOT EXISTS clinical_work_sessions_actor_idx
  ON public.clinical_work_sessions (tenant_id, performed_by_clinic_user_id, status);

CREATE TABLE IF NOT EXISTS public.patient_flow_queue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL,
  operating_date date NOT NULL,
  lane_key text NOT NULL CHECK (length(trim(lane_key)) > 0),
  priority_class text NOT NULL DEFAULT 'normal'
    CHECK (priority_class IN ('low', 'normal', 'high', 'urgent')),
  position integer NOT NULL CHECK (position >= 0),
  entered_at timestamptz NOT NULL DEFAULT now(),
  exited_at timestamptz,
  entry_reason text,
  exit_reason text,
  routing_target text,
  created_by_clinic_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_flow_queue_entries_tenant_id_key UNIQUE (tenant_id, id),
  CONSTRAINT patient_flow_queue_entries_visit_same_tenant_fk
    FOREIGN KEY (tenant_id, visit_id)
    REFERENCES public.clinic_visit_sessions (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT patient_flow_queue_entries_creator_same_tenant_fk
    FOREIGN KEY (tenant_id, created_by_clinic_user_id)
    REFERENCES public.clinic_users (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT patient_flow_queue_entries_exit_after_entry_chk
    CHECK (exited_at IS NULL OR exited_at >= entered_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS patient_flow_queue_entries_one_active_per_visit_idx
  ON public.patient_flow_queue_entries (tenant_id, visit_id)
  WHERE exited_at IS NULL;

CREATE INDEX IF NOT EXISTS patient_flow_queue_entries_board_idx
  ON public.patient_flow_queue_entries (tenant_id, operating_date, lane_key, position)
  WHERE exited_at IS NULL;

CREATE INDEX IF NOT EXISTS patient_flow_queue_entries_visit_history_idx
  ON public.patient_flow_queue_entries (tenant_id, visit_id, entered_at DESC);

CREATE TABLE IF NOT EXISTS public.patient_flow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.master_tenants(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL,
  work_session_id uuid,
  queue_entry_id uuid,
  event_type text NOT NULL,
  actor_clinic_user_id uuid,
  actor_context text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  destination_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_flow_events_tenant_id_key UNIQUE (tenant_id, id),
  CONSTRAINT patient_flow_events_visit_same_tenant_fk
    FOREIGN KEY (tenant_id, visit_id)
    REFERENCES public.clinic_visit_sessions (tenant_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT patient_flow_events_work_session_same_tenant_fk
    FOREIGN KEY (tenant_id, work_session_id)
    REFERENCES public.clinical_work_sessions (tenant_id, id)
    ON DELETE SET NULL,
  CONSTRAINT patient_flow_events_queue_entry_same_tenant_fk
    FOREIGN KEY (tenant_id, queue_entry_id)
    REFERENCES public.patient_flow_queue_entries (tenant_id, id)
    ON DELETE SET NULL,
  CONSTRAINT patient_flow_events_actor_same_tenant_fk
    FOREIGN KEY (tenant_id, actor_clinic_user_id)
    REFERENCES public.clinic_users (tenant_id, id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS patient_flow_events_visit_time_idx
  ON public.patient_flow_events (tenant_id, visit_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS patient_flow_events_correlation_idx
  ON public.patient_flow_events (tenant_id, correlation_id)
  WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS patient_flow_events_type_time_idx
  ON public.patient_flow_events (tenant_id, event_type, occurred_at DESC);

ALTER TABLE public.clinical_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_flow_queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_flow_events ENABLE ROW LEVEL SECURITY;

-- D2 exposes tenant-scoped reads only. Explicit grants make the Data API surface
-- intentional and keep lifecycle writes unavailable until D3 owns command authority.
REVOKE ALL ON TABLE public.clinical_work_sessions, public.patient_flow_queue_entries, public.patient_flow_events FROM anon;
REVOKE ALL ON TABLE public.clinical_work_sessions, public.patient_flow_queue_entries, public.patient_flow_events FROM authenticated;
GRANT SELECT ON TABLE public.clinical_work_sessions, public.patient_flow_queue_entries, public.patient_flow_events TO authenticated;

DROP POLICY IF EXISTS patient_flow_work_sessions_read ON public.clinical_work_sessions;
CREATE POLICY patient_flow_work_sessions_read
  ON public.clinical_work_sessions
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_tenant_id());

DROP POLICY IF EXISTS patient_flow_queue_entries_read ON public.patient_flow_queue_entries;
CREATE POLICY patient_flow_queue_entries_read
  ON public.patient_flow_queue_entries
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_tenant_id());

DROP POLICY IF EXISTS patient_flow_events_read ON public.patient_flow_events;
CREATE POLICY patient_flow_events_read
  ON public.patient_flow_events
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_current_tenant_id());

COMMIT;
