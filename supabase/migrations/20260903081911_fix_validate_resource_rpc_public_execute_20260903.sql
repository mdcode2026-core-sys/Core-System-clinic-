-- 1.6: EXECUTE must be removed from PUBLIC and anon; authenticated only.
REVOKE EXECUTE ON FUNCTION public.validate_procedure_resources_for_booking(uuid,uuid,uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_procedure_resources_for_booking(uuid,uuid,uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_procedure_resources_for_booking(uuid,uuid,uuid) TO authenticated;
