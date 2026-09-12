-- CORE SYSTEM — cross-domain RLS runtime performance hardening.
-- Preserve authorization semantics while making row-independent authorization
-- helpers statement-scoped. This is required for tenant-wide reconciliation
-- reads over populated operational tables.

DROP POLICY IF EXISTS rls_retention_followups_select ON public.retention_followups;
CREATE POLICY rls_retention_followups_select ON public.retention_followups
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'followup:read'))
  );

DROP POLICY IF EXISTS rls_invoices_select ON public.clinic_invoices;
CREATE POLICY rls_invoices_select ON public.clinic_invoices
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:read'))
  );

DROP POLICY IF EXISTS rls_invoice_items_select ON public.invoice_items;
CREATE POLICY rls_invoice_items_select ON public.invoice_items
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:read'))
  );

DROP POLICY IF EXISTS financial_installments_select ON public.financial_installments;
CREATE POLICY financial_installments_select ON public.financial_installments
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:read'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'invoices:update'))
    )
  );

DROP POLICY IF EXISTS rls_sessions_select ON public.clinic_visit_sessions;
CREATE POLICY rls_sessions_select ON public.clinic_visit_sessions
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_effective_permission('sessions:read'))
      OR (SELECT public.has_effective_permission('visits:read'))
    )
  );

DROP POLICY IF EXISTS rls_inventory_ledger_select ON public.inventory_ledger;
CREATE POLICY rls_inventory_ledger_select ON public.inventory_ledger
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'inventory:read'))
  );

DROP POLICY IF EXISTS communications_requests_access ON public.communication_requests;
CREATE POLICY communications_requests_access ON public.communication_requests
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'communications:manage'))
      OR requester_clinic_user_id = (SELECT cu.id FROM public.clinic_users cu WHERE cu.auth_user_id = (SELECT auth.uid()) AND cu.tenant_id = communication_requests.tenant_id LIMIT 1)
      OR assignee_clinic_user_id = (SELECT cu.id FROM public.clinic_users cu WHERE cu.auth_user_id = (SELECT auth.uid()) AND cu.tenant_id = communication_requests.tenant_id LIMIT 1)
    )
  );

DROP POLICY IF EXISTS work_items_read ON public.operational_work_items;
CREATE POLICY work_items_read ON public.operational_work_items
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'work:manage'))
      OR requester_clinic_user_id = (SELECT cu.id FROM public.clinic_users cu WHERE cu.auth_user_id = (SELECT auth.uid()) AND cu.tenant_id = operational_work_items.tenant_id LIMIT 1)
      OR assignee_clinic_user_id = (SELECT cu.id FROM public.clinic_users cu WHERE cu.auth_user_id = (SELECT auth.uid()) AND cu.tenant_id = operational_work_items.tenant_id LIMIT 1)
    )
  );

DROP POLICY IF EXISTS purchase_receipts_select ON public.purchase_receipts;
CREATE POLICY purchase_receipts_select ON public.purchase_receipts
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'purchasing:read'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'purchasing:manage'))
    )
  );

DROP POLICY IF EXISTS supplier_payments_access ON public.supplier_payments;
CREATE POLICY supplier_payments_access ON public.supplier_payments
  FOR ALL USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'purchasing:manage'))
  ) WITH CHECK (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'purchasing:manage'))
  );

DROP POLICY IF EXISTS patient_packages_select ON public.patient_packages;
CREATE POLICY patient_packages_select ON public.patient_packages
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'packages:read'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'packages:sell'))
    )
  );

DROP POLICY IF EXISTS workforce_read ON public.workforce_staff_schedules;
CREATE POLICY workforce_read ON public.workforce_staff_schedules
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:read'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
    )
  );

DROP POLICY IF EXISTS workforce_manage ON public.workforce_staff_schedules;
CREATE POLICY workforce_manage ON public.workforce_staff_schedules
  FOR ALL USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
  ) WITH CHECK (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
  );

DROP POLICY IF EXISTS workforce_commission ON public.workforce_commission_entries;
CREATE POLICY workforce_commission ON public.workforce_commission_entries
  FOR ALL USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:commission'))
  ) WITH CHECK (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:commission'))
  );

DROP POLICY IF EXISTS workforce_commission_read ON public.workforce_commission_entries;
CREATE POLICY workforce_commission_read ON public.workforce_commission_entries
  FOR SELECT USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (
      (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:commission'))
      OR (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
    )
  );

DROP POLICY IF EXISTS workforce_manage ON public.workforce_commission_entries;
CREATE POLICY workforce_manage ON public.workforce_commission_entries
  FOR ALL USING (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
  ) WITH CHECK (
    tenant_id = (SELECT public.get_current_tenant_id())
    AND (SELECT public.has_tenant_permission((SELECT public.get_current_tenant_id()), 'workforce:manage'))
  );
