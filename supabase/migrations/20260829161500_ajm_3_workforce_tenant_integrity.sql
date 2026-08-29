-- AJM-3 tenant integrity hardening.
-- Cross-tenant references must be impossible at the database boundary, not only by UI/query convention.

alter table public.workforce_positions add constraint workforce_positions_tenant_id_id_key unique (tenant_id,id);
alter table public.workforce_employees add constraint workforce_employees_tenant_id_id_key unique (tenant_id,id);
alter table public.workforce_leave_types add constraint workforce_leave_types_tenant_id_id_key unique (tenant_id,id);
alter table public.workforce_payroll_periods add constraint workforce_payroll_periods_tenant_id_id_key unique (tenant_id,id);
alter table public.workforce_commission_rules add constraint workforce_commission_rules_tenant_id_id_key unique (tenant_id,id);
alter table public.workforce_staffing_needs add constraint workforce_staffing_needs_tenant_id_id_key unique (tenant_id,id);

alter table public.workforce_employees
  add constraint workforce_employees_position_same_tenant_fk
  foreign key (tenant_id,position_id) references public.workforce_positions(tenant_id,id);

alter table public.workforce_employees
  add constraint workforce_employees_user_same_tenant_fk
  foreign key (tenant_id,user_id) references public.clinic_users(tenant_id,id);

alter table public.workforce_employment_records
  add constraint workforce_employment_records_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_employment_records
  add constraint workforce_employment_records_position_same_tenant_fk
  foreign key (tenant_id,position_id) references public.workforce_positions(tenant_id,id);

alter table public.workforce_staff_schedules
  add constraint workforce_staff_schedules_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_attendance
  add constraint workforce_attendance_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_leave_requests
  add constraint workforce_leave_requests_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_leave_requests
  add constraint workforce_leave_requests_leave_type_same_tenant_fk
  foreign key (tenant_id,leave_type_id) references public.workforce_leave_types(tenant_id,id);

alter table public.workforce_payroll_entries
  add constraint workforce_payroll_entries_period_same_tenant_fk
  foreign key (tenant_id,payroll_period_id) references public.workforce_payroll_periods(tenant_id,id);

alter table public.workforce_payroll_entries
  add constraint workforce_payroll_entries_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_benefits
  add constraint workforce_benefits_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_commission_entries
  add constraint workforce_commission_entries_employee_same_tenant_fk
  foreign key (tenant_id,employee_id) references public.workforce_employees(tenant_id,id);

alter table public.workforce_commission_entries
  add constraint workforce_commission_entries_rule_same_tenant_fk
  foreign key (tenant_id,commission_rule_id) references public.workforce_commission_rules(tenant_id,id);

alter table public.workforce_staffing_needs
  add constraint workforce_staffing_needs_position_same_tenant_fk
  foreign key (tenant_id,position_id) references public.workforce_positions(tenant_id,id);

alter table public.workforce_candidates
  add constraint workforce_candidates_need_same_tenant_fk
  foreign key (tenant_id,staffing_need_id) references public.workforce_staffing_needs(tenant_id,id);
