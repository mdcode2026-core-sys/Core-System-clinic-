-- Workforce Payroll RLS hardening.
-- Payroll, advances, deductions, earnings, payslips and country rules are never anonymously readable.
DO $$
BEGIN
  DROP POLICY IF EXISTS workforce_advance_installments_tenant_select ON public.workforce_advance_installments;
  CREATE POLICY workforce_advance_installments_tenant_select
    ON public.workforce_advance_installments FOR SELECT TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

  DROP POLICY IF EXISTS workforce_employee_advances_tenant_select ON public.workforce_employee_advances;
  CREATE POLICY workforce_employee_advances_tenant_select
    ON public.workforce_employee_advances FOR SELECT TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

  DROP POLICY IF EXISTS workforce_payroll_deductions_tenant_select ON public.workforce_payroll_deductions;
  CREATE POLICY workforce_payroll_deductions_tenant_select
    ON public.workforce_payroll_deductions FOR SELECT TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

  DROP POLICY IF EXISTS workforce_payroll_earnings_tenant_select ON public.workforce_payroll_earnings;
  CREATE POLICY workforce_payroll_earnings_tenant_select
    ON public.workforce_payroll_earnings FOR SELECT TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

  DROP POLICY IF EXISTS workforce_payslips_tenant_select ON public.workforce_payslips;
  CREATE POLICY workforce_payslips_tenant_select
    ON public.workforce_payslips FOR SELECT TO authenticated
    USING (tenant_id = public.get_current_tenant_id());

  DROP POLICY IF EXISTS workforce_payroll_country_rules_select ON public.workforce_payroll_country_rules;
  CREATE POLICY workforce_payroll_country_rules_select
    ON public.workforce_payroll_country_rules FOR SELECT TO authenticated
    USING ((tenant_id IS NULL) OR (tenant_id = public.get_current_tenant_id()));
END $$;
