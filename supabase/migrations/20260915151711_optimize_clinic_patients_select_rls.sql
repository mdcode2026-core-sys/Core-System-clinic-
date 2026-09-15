-- CORE SYSTEM — Performance remediation — 2026-09-15
-- Root cause: clinic_patients SELECT RLS evaluated has_tenant_permission()
-- per candidate row, causing PostgREST statement timeouts (~8s role timeout).
-- Keep the same tenant and permission semantics; cache both stable values once
-- per statement using init-plan scalar subqueries.

ALTER POLICY rls_clinic_patients_select
ON public.clinic_patients
USING (
  tenant_id = (SELECT public.get_current_tenant_id())
  AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'patients:read'))
);
