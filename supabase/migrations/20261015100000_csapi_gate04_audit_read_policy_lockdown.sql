-- CSAPI Gate 04 / WP-7: enforce the explicit audit-read boundary.
-- The legacy rls_breaches_isolation policy was FOR ALL, so its tenant-wide USING
-- predicate also authorized SELECT and bypassed the stricter rls_audit_read policy
-- through PostgreSQL's permissive-policy OR semantics.
-- Preserve tenant-scoped write-policy semantics, while making audit reads follow
-- the explicit clinic-admin / platform-admin contract.

BEGIN;

DROP POLICY IF EXISTS rls_breaches_isolation ON public.audit_trail;
DROP POLICY IF EXISTS rls_audit_read ON public.audit_trail;
DROP POLICY IF EXISTS rls_audit_insert_isolation ON public.audit_trail;
DROP POLICY IF EXISTS rls_audit_update_isolation ON public.audit_trail;
DROP POLICY IF EXISTS rls_audit_delete_isolation ON public.audit_trail;

CREATE POLICY rls_audit_read
  ON public.audit_trail
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_role() = 'super_admin'
    OR (
      tenant_id = public.get_current_tenant_id()
      AND public.get_current_user_role() = 'clinic_admin'
    )
  );

CREATE POLICY rls_audit_insert_isolation
  ON public.audit_trail
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() = 'super_admin'
    OR tenant_id = public.get_current_tenant_id()
  );

CREATE POLICY rls_audit_update_isolation
  ON public.audit_trail
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() = 'super_admin'
    OR tenant_id = public.get_current_tenant_id()
  )
  WITH CHECK (
    public.get_current_user_role() = 'super_admin'
    OR tenant_id = public.get_current_tenant_id()
  );

CREATE POLICY rls_audit_delete_isolation
  ON public.audit_trail
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    public.get_current_user_role() = 'super_admin'
    OR tenant_id = public.get_current_tenant_id()
  );

COMMIT;
