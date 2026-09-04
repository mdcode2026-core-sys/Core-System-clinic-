-- ADR-014 remediation: restrict notification_queue to authenticated tenant members.
DROP POLICY IF EXISTS rls_notifications_isolation ON public.notification_queue;
CREATE POLICY rls_notifications_isolation
ON public.notification_queue
FOR ALL
TO authenticated
USING (tenant_id = public.get_current_tenant_id())
WITH CHECK (tenant_id = public.get_current_tenant_id());
