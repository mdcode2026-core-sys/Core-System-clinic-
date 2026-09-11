BEGIN;

-- Primary Work Context is an administrative assignment, not a personal preference.
-- Keep the existing permission/RBAC authority; do not introduce a new permission.
DROP POLICY IF EXISTS ajm1_uw_write ON public.clinic_user_workspaces;
CREATE POLICY ajm1_uw_write
  ON public.clinic_user_workspaces
  FOR ALL
  TO authenticated
  USING (
    tenant_id = get_current_tenant_id()
    AND has_tenant_permission(get_current_tenant_id(), 'users:update')
  )
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND has_tenant_permission(get_current_tenant_id(), 'users:update')
  );

-- `default_workspace` remains stored for backward-compatible data preservation,
-- but it is no longer writable through the personal settings action and must not
-- participate in workspace resolution.
COMMENT ON COLUMN public.clinic_user_settings.default_workspace IS
  'Legacy preserved data only. Not an authorization source, Primary Work Context assignment, or Role Workspace source. Canonical assignment is public.clinic_user_workspaces.';

COMMIT;
