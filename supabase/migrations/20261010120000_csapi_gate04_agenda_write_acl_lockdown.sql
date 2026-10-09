-- CSAPI Gate 04 / WP-5: remove direct appointment table-write bypasses.
-- Active application writers have been routed through the server action + protected DB command boundary.

BEGIN;

DROP POLICY IF EXISTS rls_master_agenda_events_insert ON public.master_agenda_events;
DROP POLICY IF EXISTS rls_master_agenda_events_update ON public.master_agenda_events;
DROP POLICY IF EXISTS rls_master_agenda_events_delete ON public.master_agenda_events;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.master_agenda_events
  FROM PUBLIC, anon, authenticated, service_role;

-- Reads remain available only to the authenticated application and trusted server,
-- and remain governed by the existing SELECT RLS policies.
GRANT SELECT ON TABLE public.master_agenda_events TO authenticated, service_role;

COMMIT;
