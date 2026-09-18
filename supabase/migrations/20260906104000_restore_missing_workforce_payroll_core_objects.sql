BEGIN;

-- Migration-history reconciliation:
-- The connected production project contains Workforce Payroll core objects that were
-- referenced by later repository migrations but had no replayable migration file in
-- this repository. Restore the existing production-compatible structure here so a
-- clean local migration replay reaches the canonical later hardening migrations.
-- This migration does not alter the hosted database.

CREATE TABLE IF NOT EXISTS public.workforce_payroll_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  payroll_period_id uuid NOT NULL REFERENCES public.workforce_payroll_periods(id) ON DELETE RESTRICT,
  employee_id uuid NOT NULL REFERENCES public.workforce_employees(id) ON DELETE RESTRICT,
  earning_type text NOT NULL CHECK (earning_type IN ('base_salary','allowance','overtime','bonus','commission','other_earning')),
  amount_subunits integer NOT NULL CHECK (amount_subunits > 0),
  currency text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('employment','attendance','leave','commission','bonus','manual')),
  source_id uuid,
  reason text,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('draft','approved','void')),
  created_by uuid REFERENCES public.clinic_users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES public.clinic_users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workforce_payroll_earnings_period_employee
  ON public.workforce_payroll_earnings (tenant_id, payroll_period_id, employee_id, status);

CREATE TABLE IF NOT EXISTS public.workforce_payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  payroll_entry_id uuid NOT NULL REFERENCES public.workforce_payroll_entries(id) ON DELETE RESTRICT,
  employee_id uuid NOT NULL REFERENCES public.workforce_employees(id) ON DELETE RESTRICT,
  payroll_period_id uuid NOT NULL REFERENCES public.workforce_payroll_periods(id) ON DELETE RESTRICT,
  currency text NOT NULL,
  gross_subunits integer NOT NULL DEFAULT 0,
  deductions_subunits integer NOT NULL DEFAULT 0,
  net_subunits integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','issued','paid','void')),
  issued_at timestamptz,
  created_by uuid REFERENCES public.clinic_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workforce_payslips_payroll_entry_id_key UNIQUE (payroll_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_workforce_payslips_employee_period
  ON public.workforce_payslips (tenant_id, employee_id, payroll_period_id);

CREATE TABLE IF NOT EXISTS public.workforce_payroll_country_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  country_code text NOT NULL,
  name text NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  tax_enabled boolean NOT NULL DEFAULT false,
  social_security_enabled boolean NOT NULL DEFAULT false,
  employee_rate numeric NOT NULL DEFAULT 0,
  employer_rate numeric NOT NULL DEFAULT 0,
  tax_method text,
  tax_exemptions_subunits integer NOT NULL DEFAULT 0 CHECK (tax_exemptions_subunits >= 0),
  maximum_contribution_basis_subunits integer,
  currency text NOT NULL,
  notes text,
  source text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','inactive')),
  created_by uuid REFERENCES public.clinic_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  rule_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_url text,
  CONSTRAINT workforce_payroll_country_rules_check CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT workforce_payroll_country_rules_check1 CHECK (employee_rate >= 0 AND employer_rate >= 0)
);

CREATE INDEX IF NOT EXISTS idx_workforce_country_rules_country_effective
  ON public.workforce_payroll_country_rules (tenant_id, country_code, effective_from, effective_to, status);

ALTER TABLE public.workforce_payroll_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_payroll_country_rules ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.workforce_payroll_earnings FROM anon;
REVOKE ALL ON TABLE public.workforce_payslips FROM anon;
REVOKE ALL ON TABLE public.workforce_payroll_country_rules FROM anon;
REVOKE ALL ON TABLE public.workforce_payroll_earnings FROM authenticated;
REVOKE ALL ON TABLE public.workforce_payslips FROM authenticated;
REVOKE ALL ON TABLE public.workforce_payroll_country_rules FROM authenticated;
GRANT SELECT ON TABLE public.workforce_payroll_earnings TO authenticated;
GRANT SELECT ON TABLE public.workforce_payslips TO authenticated;
GRANT SELECT ON TABLE public.workforce_payroll_country_rules TO authenticated;

CREATE OR REPLACE FUNCTION public.create_workforce_payroll_earning(
  p_tenant_id uuid,
  p_employee_id uuid,
  p_payroll_period_id uuid,
  p_earning_type text,
  p_amount_subunits integer,
  p_currency text,
  p_source_type text,
  p_source_id uuid DEFAULT NULL,
  p_reason text DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor uuid;
  v_id uuid;
BEGIN
  IF public.get_current_tenant_id() IS DISTINCT FROM p_tenant_id
     OR NOT public.has_tenant_permission(p_tenant_id, 'workforce:payroll') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;

  v_actor := COALESCE(p_created_by, auth.uid());
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.clinic_users
    WHERE id = v_actor AND tenant_id = p_tenant_id AND is_active AND deleted_at IS NULL
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Actor does not belong to tenant');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workforce_employees
    WHERE id = p_employee_id AND tenant_id = p_tenant_id AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Employee not found or inactive');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workforce_payroll_periods
    WHERE id = p_payroll_period_id AND tenant_id = p_tenant_id AND status IN ('open','processing')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payroll period is not open');
  END IF;

  IF p_amount_subunits <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Earning amount must be positive');
  END IF;

  INSERT INTO public.workforce_payroll_earnings(
    tenant_id,payroll_period_id,employee_id,earning_type,amount_subunits,currency,
    source_type,source_id,reason,status,created_by,approved_by,approved_at
  ) VALUES (
    p_tenant_id,p_payroll_period_id,p_employee_id,p_earning_type,p_amount_subunits,p_currency,
    p_source_type,p_source_id,p_reason,'approved',v_actor,v_actor,now()
  ) RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'earning_id', v_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_workforce_payslip_for_entry(
  p_tenant_id uuid,
  p_payroll_entry_id uuid,
  p_created_by uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  v_actor uuid;
  v_entry record;
  v_existing uuid;
  v_gross integer;
  v_id uuid;
  v_currency text;
BEGIN
  IF public.get_current_tenant_id() IS DISTINCT FROM p_tenant_id
     OR NOT public.has_tenant_permission(p_tenant_id, 'workforce:payroll') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;

  v_actor := COALESCE(p_created_by, auth.uid());
  IF v_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.clinic_users
    WHERE id = v_actor AND tenant_id = p_tenant_id AND is_active AND deleted_at IS NULL
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Actor does not belong to tenant');
  END IF;

  SELECT * INTO v_entry
  FROM public.workforce_payroll_entries
  WHERE id = p_payroll_entry_id AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payroll entry not found');
  END IF;

  IF v_entry.status NOT IN ('approved','paid') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payslip requires an approved or paid payroll entry');
  END IF;

  SELECT id INTO v_existing
  FROM public.workforce_payslips
  WHERE payroll_entry_id = p_payroll_entry_id;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'payslip_id', v_existing, 'idempotent', true);
  END IF;

  v_gross := v_entry.base_salary_subunits
    + v_entry.allowances_subunits
    + v_entry.overtime_subunits
    + v_entry.bonuses_subunits
    + v_entry.commissions_subunits;

  SELECT currency INTO v_currency
  FROM public.workforce_payroll_periods
  WHERE id = v_entry.payroll_period_id AND tenant_id = p_tenant_id;

  IF v_currency IS NULL THEN
    SELECT currency INTO v_currency
    FROM public.workforce_employment_records
    WHERE tenant_id = p_tenant_id
      AND employee_id = v_entry.employee_id
      AND status = 'active'
    ORDER BY effective_from DESC
    LIMIT 1;
  END IF;

  v_currency := COALESCE(v_currency, 'JOD');

  INSERT INTO public.workforce_payslips(
    tenant_id,payroll_entry_id,employee_id,payroll_period_id,currency,
    gross_subunits,deductions_subunits,net_subunits,status,issued_at,created_by
  ) VALUES (
    p_tenant_id,v_entry.id,v_entry.employee_id,v_entry.payroll_period_id,v_currency,
    v_gross,v_entry.deductions_subunits,v_entry.net_subunits,'issued',now(),v_actor
  ) RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'success', true,
    'payslip_id', v_id,
    'gross_subunits', v_gross,
    'deductions_subunits', v_entry.deductions_subunits,
    'net_subunits', v_entry.net_subunits
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

REVOKE ALL ON FUNCTION public.create_workforce_payroll_earning(uuid,uuid,uuid,text,integer,text,text,uuid,text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_workforce_payroll_earning(uuid,uuid,uuid,text,integer,text,text,uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.create_workforce_payslip_for_entry(uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_workforce_payslip_for_entry(uuid,uuid,uuid) TO authenticated;

COMMIT;
