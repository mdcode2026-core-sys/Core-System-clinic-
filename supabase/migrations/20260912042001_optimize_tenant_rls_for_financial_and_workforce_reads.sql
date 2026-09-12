-- CORE SYSTEM — RLS performance hardening for tenant-scoped Financial + Workforce reads.
-- Security semantics are unchanged: the tenant is still enforced first and
-- permission evaluation still uses the authenticated actor's effective permissions.
-- The helper calls are statement-scoped so PostgreSQL does not re-run the same
-- security-definer authorization calculation once per returned row.

DROP POLICY IF EXISTS financial_plans_select ON public.financial_plans;
CREATE POLICY financial_plans_select
  ON public.financial_plans
  FOR SELECT
  USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:read'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:update'))
    )
  );

DROP POLICY IF EXISTS financial_plans_write ON public.financial_plans;
CREATE POLICY financial_plans_write
  ON public.financial_plans
  FOR ALL
  USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:update'))
  )
  WITH CHECK (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:update'))
  );

DROP POLICY IF EXISTS workforce_read ON public.workforce_employees;
CREATE POLICY workforce_read
  ON public.workforce_employees
  FOR SELECT
  USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:read'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
    )
  );

DROP POLICY IF EXISTS workforce_manage ON public.workforce_employees;
CREATE POLICY workforce_manage
  ON public.workforce_employees
  FOR ALL
  USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
  )
  WITH CHECK (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
  );
