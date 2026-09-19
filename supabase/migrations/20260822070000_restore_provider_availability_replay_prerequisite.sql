-- Replay prerequisite restored from the connected production schema.
-- The historical PJ Stage 4 migration that defined clinic_provider_availability
-- is absent from this repository. Later PJ migrations and the agenda engine
-- still depend on this legacy-compatible table.

CREATE TABLE IF NOT EXISTS public.clinic_provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.master_tenants(id),
  doctor_id uuid NOT NULL REFERENCES public.clinic_users(id),
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  valid_from date,
  valid_until date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_availability_time_range CHECK (end_time > start_time),
  CONSTRAINT chk_availability_valid_range CHECK (
    valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from
  )
);

CREATE INDEX IF NOT EXISTS idx_clinic_provider_availability_doctor_id
  ON public.clinic_provider_availability (doctor_id);

CREATE INDEX IF NOT EXISTS idx_provider_availability_tenant_doctor
  ON public.clinic_provider_availability (tenant_id, doctor_id, day_of_week);

ALTER TABLE public.clinic_provider_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_provider_availability_isolation
  ON public.clinic_provider_availability;

CREATE POLICY rls_provider_availability_isolation
  ON public.clinic_provider_availability
  FOR ALL
  TO public
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());
