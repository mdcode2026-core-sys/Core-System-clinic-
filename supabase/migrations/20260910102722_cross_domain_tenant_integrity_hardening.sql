-- CORE SYSTEM — Cross-Domain Tenant Integrity Hardening
-- Applied live as migration version 20260910102722.
-- Purpose: enforce same-tenant relationships at the database boundary.
-- Pattern: reuse the existing (tenant_id, referenced_id) composite-FK pattern
-- already used successfully by Financial & Resources / Communications.
-- Intentional exclusions: Patient Identity rows may be shared across clinics via
-- clinic-specific relationship records; patient-facing portal experience and
-- platform-owner tables are outside this migration's scope.

create unique index if not exists uq_cdi_clinic_rooms_tenant_id_id on public.clinic_rooms (tenant_id, id);
create unique index if not exists uq_cdi_clinic_resources_tenant_id_id on public.clinic_resources (tenant_id, id);
create unique index if not exists uq_cdi_clinic_inquiries_tenant_id_id on public.clinic_inquiries (tenant_id, id);
create unique index if not exists uq_cdi_master_agenda_events_tenant_id_id on public.master_agenda_events (tenant_id, id);
create unique index if not exists uq_cdi_clinic_treatment_plans_tenant_id_id on public.clinic_treatment_plans (tenant_id, id);
create unique index if not exists uq_cdi_clinic_treatment_plan_items_tenant_id_id on public.clinic_treatment_plan_items (tenant_id, id);
create unique index if not exists uq_cdi_patient_insurance_profiles_tenant_id_id on public.patient_insurance_profiles (tenant_id, id);
create unique index if not exists uq_cdi_patient_packages_tenant_id_id on public.patient_packages (tenant_id, id);
create unique index if not exists uq_cdi_clinic_packages_tenant_id_id on public.clinic_packages (tenant_id, id);
create unique index if not exists uq_cdi_clinic_services_tenant_id_id on public.clinic_services (tenant_id, id);
create unique index if not exists uq_cdi_insurance_contracts_tenant_id_id on public.insurance_contracts (tenant_id, id);

alter table public.master_agenda_events
  add constraint fk_cdi_agenda_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_agenda_procedure_same_tenant foreign key (tenant_id, procedure_id) references public.clinic_procedures (tenant_id, id),
  add constraint fk_cdi_agenda_room_same_tenant foreign key (tenant_id, room_id) references public.clinic_rooms (tenant_id, id),
  add constraint fk_cdi_agenda_inquiry_same_tenant foreign key (tenant_id, inquiry_id) references public.clinic_inquiries (tenant_id, id),
  add constraint fk_cdi_agenda_resource_same_tenant foreign key (tenant_id, resource_id) references public.clinic_resources (tenant_id, id),
  add constraint fk_cdi_agenda_doctor_same_tenant foreign key (tenant_id, doctor_id) references public.clinic_users (tenant_id, id),
  add constraint fk_cdi_agenda_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id);

alter table public.clinic_inquiries
  add constraint fk_cdi_inquiry_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_inquiry_handler_same_tenant foreign key (tenant_id, handled_by) references public.clinic_users (tenant_id, id);

alter table public.clinic_visit_sessions
  add constraint fk_cdi_visit_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_visit_room_same_tenant foreign key (tenant_id, room_id) references public.clinic_rooms (tenant_id, id),
  add constraint fk_cdi_visit_agenda_same_tenant foreign key (tenant_id, agenda_event_id) references public.master_agenda_events (tenant_id, id),
  add constraint fk_cdi_visit_doctor_same_tenant foreign key (tenant_id, doctor_id) references public.clinic_users (tenant_id, id),
  add constraint fk_cdi_visit_initialized_by_same_tenant foreign key (tenant_id, initialized_by_receptionist) references public.clinic_users (tenant_id, id),
  add constraint fk_cdi_visit_lock_holder_same_tenant foreign key (tenant_id, lock_holder_id) references public.clinic_users (tenant_id, id);

alter table public.clinic_treatment_plans
  add constraint fk_cdi_treatment_plan_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_treatment_plan_source_visit_same_tenant foreign key (tenant_id, source_visit_id) references public.clinic_visit_sessions (tenant_id, id),
  add constraint fk_cdi_treatment_plan_creator_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id),
  add constraint fk_cdi_treatment_plan_package_same_tenant foreign key (tenant_id, package_id) references public.clinic_packages (tenant_id, id);

alter table public.clinic_treatment_plan_visits
  add constraint fk_cdi_treatment_plan_visit_plan_same_tenant foreign key (tenant_id, treatment_plan_id) references public.clinic_treatment_plans (tenant_id, id),
  add constraint fk_cdi_treatment_plan_visit_visit_same_tenant foreign key (tenant_id, visit_id) references public.clinic_visit_sessions (tenant_id, id),
  add constraint fk_cdi_treatment_plan_visit_item_same_tenant foreign key (tenant_id, treatment_plan_item_id) references public.clinic_treatment_plan_items (tenant_id, id),
  add constraint fk_cdi_treatment_plan_visit_linked_by_same_tenant foreign key (tenant_id, linked_by) references public.clinic_users (tenant_id, id);

alter table public.medical_files
  add constraint fk_cdi_medical_file_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_medical_file_visit_same_tenant foreign key (tenant_id, visit_id) references public.clinic_visit_sessions (tenant_id, id),
  add constraint fk_cdi_medical_file_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id),
  add constraint fk_cdi_medical_file_archived_by_same_tenant foreign key (tenant_id, archived_by) references public.clinic_users (tenant_id, id);

alter table public.financial_plans
  add constraint fk_cdi_financial_plan_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_financial_plan_treatment_same_tenant foreign key (tenant_id, treatment_plan_id) references public.clinic_treatment_plans (tenant_id, id),
  add constraint fk_cdi_financial_plan_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id);

alter table public.patient_insurance_profiles
  add constraint fk_cdi_patient_insurance_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_patient_insurance_contract_same_tenant foreign key (tenant_id, contract_id) references public.insurance_contracts (tenant_id, id),
  add constraint fk_cdi_patient_insurance_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id);

alter table public.insurance_claims
  add constraint fk_cdi_insurance_claim_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_insurance_claim_profile_same_tenant foreign key (tenant_id, insurance_profile_id) references public.patient_insurance_profiles (tenant_id, id),
  add constraint fk_cdi_insurance_claim_invoice_same_tenant foreign key (tenant_id, invoice_id) references public.clinic_invoices (tenant_id, id),
  add constraint fk_cdi_insurance_claim_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id);

alter table public.inventory_ledger
  add constraint fk_cdi_inventory_ledger_procedure_same_tenant foreign key (tenant_id, procedure_id) references public.clinic_procedures (tenant_id, id),
  add constraint fk_cdi_inventory_ledger_session_same_tenant foreign key (tenant_id, session_id) references public.clinic_visit_sessions (tenant_id, id),
  add constraint fk_cdi_inventory_ledger_logged_by_same_tenant foreign key (tenant_id, logged_by) references public.clinic_users (tenant_id, id);

alter table public.patient_packages
  add constraint fk_cdi_patient_package_patient_same_tenant foreign key (tenant_id, patient_id) references public.clinic_patients (tenant_id, id),
  add constraint fk_cdi_patient_package_financial_plan_same_tenant foreign key (tenant_id, financial_plan_id) references public.financial_plans (tenant_id, id),
  add constraint fk_cdi_patient_package_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id),
  add constraint fk_cdi_patient_package_definition_same_tenant foreign key (tenant_id, package_id) references public.clinic_packages (tenant_id, id);

alter table public.patient_package_consumptions
  add constraint fk_cdi_package_consumption_package_same_tenant foreign key (tenant_id, patient_package_id) references public.patient_packages (tenant_id, id),
  add constraint fk_cdi_package_consumption_item_same_tenant foreign key (tenant_id, treatment_plan_item_id) references public.clinic_treatment_plan_items (tenant_id, id),
  add constraint fk_cdi_package_consumption_visit_same_tenant foreign key (tenant_id, visit_id) references public.clinic_visit_sessions (tenant_id, id),
  add constraint fk_cdi_package_consumption_consumed_by_same_tenant foreign key (tenant_id, consumed_by) references public.clinic_users (tenant_id, id);

alter table public.workforce_commission_entries
  add constraint fk_cdi_commission_source_payment_same_tenant foreign key (tenant_id, source_payment_id) references public.invoice_payments (tenant_id, id);

alter table public.workforce_procedure_capabilities
  add constraint fk_cdi_workforce_procedure_same_tenant foreign key (tenant_id, procedure_id) references public.clinic_procedures (tenant_id, id),
  add constraint fk_cdi_workforce_procedure_enabled_by_same_tenant foreign key (tenant_id, enabled_by) references public.clinic_users (tenant_id, id);

alter table public.clinic_offers
  add constraint fk_cdi_offer_package_same_tenant foreign key (tenant_id, package_id) references public.clinic_packages (tenant_id, id),
  add constraint fk_cdi_offer_service_same_tenant foreign key (tenant_id, service_id) references public.clinic_services (tenant_id, id),
  add constraint fk_cdi_offer_created_by_same_tenant foreign key (tenant_id, created_by) references public.clinic_users (tenant_id, id);

alter table public.clinic_package_items
  add constraint fk_cdi_package_item_package_same_tenant foreign key (tenant_id, package_id) references public.clinic_packages (tenant_id, id),
  add constraint fk_cdi_package_item_service_same_tenant foreign key (tenant_id, service_id) references public.clinic_services (tenant_id, id);
