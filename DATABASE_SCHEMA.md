# DATABASE_SCHEMA.md

## Current Status

**Classification:** Current structural reference
**Last reconciled:** 2026-08-24
**Source:** Live Supabase project `qaslsjyxjwvdoiczmhgq`

This document is a structural reference, not a substitute for live verification. It was reconciled against `information_schema.columns` on 2026-08-24 after the Patient Journey stages and Patient Portal schema were implemented.

## Authority

When this document conflicts with live Supabase, live Supabase is authoritative. When implementation changes the schema, update the repository migration history and refresh this document.

## Active Tenant/User Model

The active application model is:

- `master_tenants` — active tenant source of truth.
- `clinic_users` — active clinic-user source of truth.
- `roles`, `permissions`, `role_permissions`, `clinic_user_permission_overrides` — permission model.

Legacy tables may still physically exist for historical/compatibility reasons and must not be treated as the active application model without an explicit architectural decision.

## Current Public Schema Catalog

The live public schema includes the following major table groups. The list is intentionally grouped by function so this document remains maintainable while the full column definition remains verifiable from Supabase `information_schema`.

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
- `clinic_visit_sessions`
- `clinic_visit_procedures`
- `clinic_procedures`
- `clinic_treatment_plans`
- `clinic_treatment_plan_items`
- `clinic_treatment_plan_visits`

### Medical files

- `medical_files`
- `medical_file_storage_locations`
- `medical_file_sync_events`
- `medical_file_annotations`
- `medical_file_measurements`
- `medical_file_ai_results`

### Follow-up / notifications

- `retention_followups`
- `followup_automation_rules`
- `notification_queue`
- `tenant_notification_channel_prefs`

### Billing / inventory / reporting

- `clinic_invoices`
- `invoice_items`
- `invoice_payments`
- `inventory_items`
- `inventory_ledger`
- `analytics_daily_snapshots`
- `audit_trail`

### Patient Portal

- `patient_portal_invitations`
- `patient_portal_medical_file_releases`
- `patient_portal_messages`

## Patient Journey Schema Verification Highlights

The live schema confirms the treatment-plan chain:

`clinic_patients` → `clinic_visit_sessions` → `clinic_treatment_plans` → `clinic_treatment_plan_items` / `clinic_treatment_plan_visits` → `clinic_visit_procedures`

Medical-file continuity is represented by `medical_files` and its storage/sync/annotation/measurement/AI companion tables.

Follow-up continuity is represented by `retention_followups`, `followup_automation_rules` and `notification_queue`.

Patient Portal continuity is represented by the invitation, release and message tables listed above.

## Important Current Columns

### `clinic_patients`

Includes `file_number` in the live schema in addition to identity/contact/status fields.

### `clinic_treatment_plans`

Includes `patient_id`, optional `source_visit_id`, `title`, `diagnosis_summary`, `goals`, `status`, `start_date`, `target_end_date`, `completed_at` and creator/timestamp fields.

### `clinic_treatment_plan_items`

Includes `treatment_plan_id`, optional `procedure_id`, ordered `sequence_no`, `planned_date`, `quantity`, `status`, `completed_at` and notes.

### `clinic_treatment_plan_visits`

Links treatment plans and visits and may additionally link a treatment-plan item.

### `medical_files`

Includes patient/visit linkage, file kind, filename/type/size, storage provider/path/status, availability and metadata, creator and archive fields.

### `patient_portal_invitations`

Includes tenant/patient linkage, channel/destination, token hash, status, fallback channel, expiry and claim/send timestamps.

## Schema-sensitive Rule

Do not infer columns from an older copy of this document. Before changing SQL, RLS, functions or TypeScript database types, verify the live schema and repository migrations together.
