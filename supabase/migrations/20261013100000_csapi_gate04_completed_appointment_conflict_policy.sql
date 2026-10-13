-- Gate 04: completed appointments must not continue reserving exclusive agenda capacity.
-- Keep the database conflict policy aligned with src/domain/agenda/conflict.engine.ts.
-- This is a forward-only repair; never edit hosted migration history or replay historical migrations.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.master_agenda_events
  DROP CONSTRAINT IF EXISTS no_doctor_overlap;
ALTER TABLE public.master_agenda_events
  ADD CONSTRAINT no_doctor_overlap
  EXCLUDE USING gist (
    doctor_id WITH =,
    tstzrange(scheduled_start, buffer_end) WITH &&
  )
  WHERE (
    doctor_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show', 'completed')
  );

ALTER TABLE public.master_agenda_events
  DROP CONSTRAINT IF EXISTS no_patient_overlap;
ALTER TABLE public.master_agenda_events
  ADD CONSTRAINT no_patient_overlap
  EXCLUDE USING gist (
    patient_id WITH =,
    tstzrange(scheduled_start, buffer_end) WITH &&
  )
  WHERE (
    patient_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show', 'completed')
  );

ALTER TABLE public.master_agenda_events
  DROP CONSTRAINT IF EXISTS no_room_overlap;
ALTER TABLE public.master_agenda_events
  ADD CONSTRAINT no_room_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(scheduled_start, buffer_end) WITH &&
  )
  WHERE (
    room_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show', 'completed')
  );

ALTER TABLE public.master_agenda_events
  DROP CONSTRAINT IF EXISTS no_resource_overlap;
ALTER TABLE public.master_agenda_events
  ADD CONSTRAINT no_resource_overlap
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(scheduled_start, buffer_end) WITH &&
  )
  WHERE (
    resource_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show', 'completed')
  );
