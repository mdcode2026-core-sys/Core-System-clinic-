# DATABASE_SCHEMA.md

## Current Status

**Classification:** Current structural reference
**Last reconciled:** 2026-08-30
**Source:** Live Supabase project `qaslsjyxjwvdoiczmhgq`

This document is a structural reference, not a substitute for live verification. The 2026-08-30 implementation pass added commercial, workforce eligibility and operational-finance foundations; those additions are reflected below.

## Authority

When this document conflicts with live Supabase, live Supabase is authoritative. When implementation changes the schema, update the repository migration history and refresh this document.

## Active Tenant/User Model

The active application model is:

- `master_tenants` — active tenant source of truth.
- `clinic_users` — active clinic-user source of truth.
- `roles`, `permissions`, `role_permissions`, `clinic_user_permission_overrides` — permission model.

Legacy tables may still physically exist for historical/compatibility reasons and must not be treated as the active application model without an explicit architectural decision.

## Current Public Schema Catalog

### Tenant / platform

- `master_tenants`
- `branches`
- `clinic_users`
- `roles`
- `permissions`
- `role_permissions`
- `clinic_user_permission_overrides`
- `capabilities`
- `entitlements`
- `entitlement_capabilities`
- `tenant_entitlements`
- `tenant_devices`
- `feature_flags`
- `subscription_plans`
- `subscriptions`
- `subscription_events`
- `billing_events`

### Patients / identity

- `clinic_patients`
- `patient_identities`
- `patient_clinic_relationships`
- `patient_history`
- `clinic_inquiries`

### Scheduling / clinical journey

- `master_agenda_events`
- `clinic_provider_availability`
- `clinic_rooms`
- `clinic_resources`
- `clinic_visit_sessions`
- `clinic_visit_procedures`
- `clinic_procedures`
- `clinic_treatment_plans`
- `clinic_treatment_plan_items`
- `clinic_treatment_plan_visits`
- `clinic_services`
- `clinic_service_procedures`
- `clinic_packages`
- `clinic_package_items`
- `clinic_offers`
- `patient_packages`
- `patient_package_consumptions`

### Workforce / eligibility

- `workforce_employees`
- `workforce_positions`
- `workforce_employment_records`
- `workforce_staff_schedules`
- `workforce_leave_requests`
- `workforce_attendance`
- `workforce_skills`
- `workforce_employee_skills`
- `workforce_qualifications`
- `workforce_employee_qualifications`
- `clinic_procedure_skill_requirements`
- `clinic_procedure_qualification_requirements`
- `workforce_commission_rules`
- `workforce_commission_entries`
- `workforce_payroll_periods`
- `workforce_payroll_entries`

### Medical files

- `medical_files`
- `medical_file_storage_locations`
- `medical_file_sync_events`
- `medical_file_annotations`
- `medical_file_measurements`
- `medical_file_ai_results`

### Follow-up / notifications / coordination

- `retention_followups`
- `followup_automation_rules`
- `notification_queue`
- `tenant_notification_channel_prefs`
- `operational_work_items`
- `operational_work_history`
- `communication_conversations`
- `communication_messages`
- `communication_requests`

### Billing / procurement / inventory / operating finance

- `clinic_invoices`
- `invoice_items`
- `invoice_payments`
- `financial_plans`
- `financial_installments`
- `patient_insurance_profiles`
- `insurance_claims`
- `suppliers`
- `purchase_orders`
- `purchase_order_items`
- `purchase_receipts`
- `purchase_receipt_items`
- `inventory_items`
- `inventory_ledger`
- `operating_expenses`
- `supplier_obligations`
- `supplier_payments`
- `analytics_daily_snapshots`
- `audit_trail`

### Patient Portal

- `patient_portal_invitations`
- `patient_portal_medical_file_releases`
- `patient_portal_messages`

## Patient Journey Schema Verification Highlights

The live schema confirms the treatment-plan chain:

`clinic_patients` → `clinic_visit_sessions` → `clinic_treatment_plans` → `clinic_treatment_plan_items` / `clinic_treatment_plan_visits` → `clinic_visit_procedures`

Commercial foundations now preserve separate ownership:

`clinic_procedures` → `clinic_services` → `clinic_packages` / `clinic_offers` → `patient_packages` → `financial_plans` / `patient_package_consumptions`

Workforce eligibility is separate from authorization:

`workforce_employees` → skills/qualifications → procedure requirements → Agenda eligibility.

Operational finance is separate from patient revenue:

`operating_expenses` and `supplier_obligations` / `supplier_payments` are distinct from `clinic_invoices` / `invoice_payments`.

## Important Current Columns

### `clinic_patients`

Includes `file_number` in the live schema in addition to identity/contact/status fields.

### `clinic_treatment_plans`

Includes `patient_id`, optional `source_visit_id`, optional `package_id`, `title`, `diagnosis_summary`, `goals`, `status`, `start_date`, `target_end_date`, `completed_at` and creator/timestamp fields.

### `clinic_treatment_plan_items`

Includes `treatment_plan_id`, optional `procedure_id`, ordered `sequence_no`, `planned_date`, `quantity`, `status`, `completed_at` and notes.

### `financial_plans`

Includes the optional `package_id` link introduced for the commercial-to-financial boundary.

### `clinic_services` / `clinic_packages` / `clinic_offers`

These tables are the distinct commercial/service configuration layer introduced for R01/R03. They do not replace the Medical Master Procedure truth.

## Schema-sensitive Rule

Do not infer columns from an older copy of this document. Before changing SQL, RLS, functions or TypeScript database types, verify the live schema and repository migrations together.
