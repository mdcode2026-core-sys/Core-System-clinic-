-- AJM-8 security hardening for the newly introduced coordination/communication paths.

-- A sender may add a participant inside the same tenant; this is collaboration, not permission escalation.
drop policy if exists communications_participants_access on public.communication_conversation_participants;
create policy communications_participants_access on public.communication_conversation_participants for all to authenticated using (
 tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'communications:manage') or clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=communication_conversation_participants.tenant_id limit 1))
) with check (tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'communications:send'));

-- Work history is append-only audit data. Creation is restricted to users allowed to create/manage work.
drop policy if exists work_history_create on public.operational_work_history;
create policy work_history_create on public.operational_work_history for insert to authenticated with check (
 tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'work:create') or public.has_tenant_permission(tenant_id,'work:manage')) and actor_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_history.tenant_id and is_active=true and deleted_at is null limit 1)
);

-- Existing users with direct/assigned work may transition their own work; admins retain full management.
drop policy if exists work_items_manage on public.operational_work_items;
create policy work_items_manage on public.operational_work_items for update to authenticated using (
 tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'work:manage') or assignee_clinic_user_id=(select id from public.clinic_users where auth_user_id=auth.uid() and tenant_id=operational_work_items.tenant_id limit 1))
) with check (tenant_id=public.get_current_tenant_id());

-- Payroll/commission/attendance are sensitive: workforce:read must not silently grant access to them.
DO $$ declare t text; begin
  foreach t in array array['workforce_attendance','workforce_payroll_periods','workforce_payroll_entries','workforce_commission_entries'] loop
    execute format('drop policy if exists workforce_read on public.%I',t);
  end loop;
end $$;

create policy workforce_attendance_read on public.workforce_attendance for select to authenticated using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'workforce:attendance') or public.has_tenant_permission(tenant_id,'workforce:manage')));
create policy workforce_payroll_read on public.workforce_payroll_periods for select to authenticated using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'workforce:payroll') or public.has_tenant_permission(tenant_id,'workforce:manage')));
create policy workforce_payroll_entries_read on public.workforce_payroll_entries for select to authenticated using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'workforce:payroll') or public.has_tenant_permission(tenant_id,'workforce:manage')));
create policy workforce_commission_read on public.workforce_commission_entries for select to authenticated using (tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'workforce:commission') or public.has_tenant_permission(tenant_id,'workforce:manage')));
