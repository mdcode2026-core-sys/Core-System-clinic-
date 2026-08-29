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

-- Tenant integrity for references that otherwise use globally unique UUIDs. These constraints
-- ensure a tenant-owned record cannot point at another tenant's user/patient/employee.
alter table public.workforce_employees add constraint workforce_employees_manager_same_tenant_fk foreign key (tenant_id,manager_employee_id) references public.workforce_employees(tenant_id,id);
alter table public.workforce_positions add constraint workforce_positions_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_employees add constraint workforce_employees_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_employment_records add constraint workforce_employment_records_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_staff_schedules add constraint workforce_staff_schedules_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_attendance add constraint workforce_attendance_recorded_by_same_tenant_fk foreign key (tenant_id,recorded_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_leave_types add constraint workforce_leave_types_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_leave_requests add constraint workforce_leave_requests_approved_by_same_tenant_fk foreign key (tenant_id,approved_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_leave_requests add constraint workforce_leave_requests_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_payroll_periods add constraint workforce_payroll_periods_locked_by_same_tenant_fk foreign key (tenant_id,locked_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_payroll_periods add constraint workforce_payroll_periods_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_payroll_entries add constraint workforce_payroll_entries_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_benefits add constraint workforce_benefits_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_commission_rules add constraint workforce_commission_rules_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_commission_entries add constraint workforce_commission_entries_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_staffing_needs add constraint workforce_staffing_needs_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.workforce_candidates add constraint workforce_candidates_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.communication_conversations add constraint communication_conversations_created_by_same_tenant_fk foreign key (tenant_id,created_by) references public.clinic_users(tenant_id,id);
alter table public.communication_conversations add constraint communication_conversations_patient_same_tenant_fk foreign key (tenant_id,clinic_patient_id) references public.clinic_patients(tenant_id,id);
alter table public.communication_messages add constraint communication_messages_sender_same_tenant_fk foreign key (tenant_id,sender_clinic_user_id) references public.clinic_users(tenant_id,id);
alter table public.communication_requests add constraint communication_requests_patient_same_tenant_fk foreign key (tenant_id,clinic_patient_id) references public.clinic_patients(tenant_id,id);
