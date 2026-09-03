-- 1.3 correction: restore the operational direct-activation capability.
-- This does NOT store passwords in clinic tables. Password handling remains Supabase Auth only.
-- The server-side action is responsible for authorization and tenant/user mapping.
-- No change is made to RBAC/RLS canonicalization.

-- This migration is intentionally additive: it documents the Auth boundary required by
-- the restored User Management direct-activation path. The actual Auth password operation
-- must execute server-side with the service-role credential and must never expose the
-- credential or password to the browser/database tables.

COMMENT ON TABLE public.clinic_users IS
'Clinic user identity/profile table. Authentication credentials are owned by Supabase Auth; direct activation must never persist passwords here.';
