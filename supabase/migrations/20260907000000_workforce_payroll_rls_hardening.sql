-- Workforce Payroll RLS hardening: payroll/legal data must never be readable anonymously.
DROP POLICY IF EXISTS workforce_payroll_country_rules_select ON public.workforce_payroll_country_rules;
CREATE POLICY workforce_payroll_country_rules_select
  ON public.workforce_payroll_country_rules
  FOR SELECT TO authenticated
  USING ((tenant_id IS NULL) OR (tenant_id = public.get_current_tenant_id()));
