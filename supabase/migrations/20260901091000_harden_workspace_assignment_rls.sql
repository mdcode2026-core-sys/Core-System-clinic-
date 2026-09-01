BEGIN;

DROP POLICY IF EXISTS ajm1_uw_select ON public.clinic_user_workspaces;
DROP POLICY IF EXISTS ajm1_uw_write ON public.clinic_user_workspaces;

CREATE POLICY workspace_assignment_select
ON public.clinic_user_workspaces
FOR SELECT TO authenticated
USING (
  tenant_id = get_current_tenant_id()
  AND (
    EXISTS (
      SELECT 1 FROM public.clinic_users cu
      WHERE cu.id = clinic_user_workspaces.user_id
        AND cu.auth_user_id = auth.uid()
        AND cu.tenant_id = clinic_user_workspaces.tenant_id
    )
    OR public.has_effective_permission('users:read')
    OR public.has_effective_permission('users:update')
  )
);

CREATE POLICY workspace_assignment_insert
ON public.clinic_user_workspaces
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = get_current_tenant_id()
  AND (public.has_effective_permission('users:create') OR public.has_effective_permission('users:update'))
);

CREATE POLICY workspace_assignment_update
ON public.clinic_user_workspaces
FOR UPDATE TO authenticated
USING (
  tenant_id = get_current_tenant_id()
  AND public.has_effective_permission('users:update')
)
WITH CHECK (
  tenant_id = get_current_tenant_id()
  AND public.has_effective_permission('users:update')
);

CREATE POLICY workspace_assignment_delete
ON public.clinic_user_workspaces
FOR DELETE TO authenticated
USING (
  tenant_id = get_current_tenant_id()
  AND public.has_effective_permission('users:update')
);

COMMIT;
