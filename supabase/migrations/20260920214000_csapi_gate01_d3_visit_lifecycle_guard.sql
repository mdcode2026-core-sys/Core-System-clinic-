BEGIN;

-- CSAPI Gate 01 / D3 — database-level lifecycle write boundary.
-- Ordinary authenticated clients may still edit non-lifecycle Visit data, but
-- lifecycle state and arrival/start/end/close timestamps are writable only by the
-- canonical SECURITY DEFINER D3 commands. Work-session lock semantics remain outside
-- the Visit lifecycle guard and are handled by the existing Hold/Resume path.

CREATE OR REPLACE FUNCTION public.csapi_guard_visit_lifecycle_writes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $function$
BEGIN
  IF current_user <> 'postgres' THEN
    IF TG_OP = 'INSERT'
       AND NEW.session_status <> 'waiting' THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'D3_LIFECYCLE_AUTHORITY_REQUIRED';
    END IF;

    IF TG_OP = 'UPDATE'
       AND (
         NEW.session_status IS DISTINCT FROM OLD.session_status
         OR NEW.arrived_at IS DISTINCT FROM OLD.arrived_at
         OR NEW.session_started_at IS DISTINCT FROM OLD.session_started_at
         OR NEW.session_ended_at IS DISTINCT FROM OLD.session_ended_at
         OR NEW.visit_closed_at IS DISTINCT FROM OLD.visit_closed_at
       ) THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'D3_LIFECYCLE_AUTHORITY_REQUIRED';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS csapi_guard_visit_lifecycle_writes
  ON public.clinic_visit_sessions;

CREATE TRIGGER csapi_guard_visit_lifecycle_writes
BEFORE INSERT OR UPDATE ON public.clinic_visit_sessions
FOR EACH ROW
EXECUTE FUNCTION public.csapi_guard_visit_lifecycle_writes();

REVOKE ALL ON FUNCTION public.csapi_guard_visit_lifecycle_writes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.csapi_guard_visit_lifecycle_writes() TO authenticated;

COMMENT ON FUNCTION public.csapi_guard_visit_lifecycle_writes() IS
  'D3 database boundary: authenticated clients cannot directly change Visit lifecycle state or arrival/start/end/close timestamps. Canonical D3 commands are the lifecycle writers.';

COMMIT;