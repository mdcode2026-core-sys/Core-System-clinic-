-- Full clinic operational reality audit: remove PUBLIC RLS policy targets from tenant-scoped operational tables.
-- Tenant resolution and permission checks remain the authorization boundary; anonymous clients must not even be eligible for these policies.

drop policy if exists rls_patients_isolation on public.clinic_patients;
create policy rls_patients_isolation on public.clinic_patients as permissive for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());

drop policy if exists rls_agenda_isolation on public.master_agenda_events;
create policy rls_agenda_isolation on public.master_agenda_events as permissive for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());

drop policy if exists rls_rooms_isolation on public.clinic_rooms;
create policy rls_rooms_isolation on public.clinic_rooms as permissive for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());

drop policy if exists rls_devices_isolation on public.tenant_devices;
create policy rls_devices_isolation on public.tenant_devices as permissive for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());

drop policy if exists rls_followups_isolation on public.retention_followups;
create policy rls_followups_isolation on public.retention_followups as permissive for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());

drop policy if exists rls_sessions_select on public.clinic_visit_sessions;
create policy rls_sessions_select on public.clinic_visit_sessions as permissive for select to authenticated using ((tenant_id = public.get_current_tenant_id()) and (public.has_effective_permission('sessions:read') or public.has_effective_permission('visits:read')));

drop policy if exists rls_sessions_update on public.clinic_visit_sessions;
create policy rls_sessions_update on public.clinic_visit_sessions as permissive for update to authenticated using ((tenant_id = public.get_current_tenant_id()) and (public.has_effective_permission('sessions:update') or public.has_effective_permission('visits:update'))) with check ((tenant_id = public.get_current_tenant_id()) and (public.has_effective_permission('sessions:update') or public.has_effective_permission('visits:update')));

drop policy if exists communications_requests_manage on public.communication_requests;
create policy communications_requests_manage on public.communication_requests as permissive for update to authenticated using ((tenant_id = public.get_current_tenant_id()) and (public.has_tenant_permission(tenant_id, 'communications:manage') or assignee_clinic_user_id = (select clinic_users.id from public.clinic_users where clinic_users.auth_user_id = auth.uid() and clinic_users.tenant_id = communication_requests.tenant_id limit 1))) with check (tenant_id = public.get_current_tenant_id());
