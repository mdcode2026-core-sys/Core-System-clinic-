-- CORE SYSTEM is globally available from launch; currency is a tenant business preference.
-- USD is the neutral platform fallback for newly created tenants. Existing tenant currency preferences are preserved.
ALTER TABLE public.master_tenants
  ALTER COLUMN currency SET DEFAULT 'USD';
