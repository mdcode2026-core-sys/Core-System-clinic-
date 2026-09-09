BEGIN;
REVOKE EXECUTE ON FUNCTION public.sync_supplier_obligation_from_payments() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_supplier_obligation_from_payments() TO service_role;
COMMIT;
