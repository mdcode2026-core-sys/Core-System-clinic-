-- Keep Stage 6 queue access intact while adding Stage 7 visit permissions.
alter policy rls_sessions_select on public.clinic_visit_sessions
using (tenant_id = public.get_current_tenant_id() and (public.has_effective_permission('sessions:read') or public.has_effective_permission('visits:read')));

alter policy rls_sessions_update on public.clinic_visit_sessions
using (tenant_id = public.get_current_tenant_id() and (public.has_effective_permission('sessions:update') or public.has_effective_permission('visits:update')))
with check (tenant_id = public.get_current_tenant_id() and (public.has_effective_permission('sessions:update') or public.has_effective_permission('visits:update')));
