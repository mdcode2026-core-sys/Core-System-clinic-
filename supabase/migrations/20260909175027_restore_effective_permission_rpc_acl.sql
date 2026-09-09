-- Restore the canonical authenticated permission-resolution RPC after ACL hardening.
-- Keep public/anon execution revoked; application clients require authenticated execution.
GRANT EXECUTE ON FUNCTION public.get_effective_permissions(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_effective_permissions(uuid, uuid) FROM anon, public;
