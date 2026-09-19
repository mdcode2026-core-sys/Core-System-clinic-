-- Historical migration-history reconciliation.
-- Production migration version 20260829092150 is present in the live migration ledger as the
-- soft-delete phase-one foundation. The repository snapshot was missing that migration file.
-- Recreate the additive deleted_at columns only where the table already exists at this point
-- in the migration chain. Later-created tables are left to their own creation migrations.
DO $soft_delete$
DECLARE
  v_table text;
  v_tables text[] := ARRAY[
    'analytics_daily_snapshots',
    'branches',
    'capabilities',
    'clinic_inquiries',
    'clinic_invoices',
    'clinic_patients',
    'clinic_procedures',
    'clinic_provider_availability',
    'clinic_resources',
    'clinic_rooms',
    'clinic_treatment_plan_items',
    'clinic_treatment_plan_visits',
    'clinic_treatment_plans',
    'clinic_user_permission_overrides',
    'clinic_user_permissions',
    'clinic_user_settings',
    'clinic_user_workspaces',
    'clinic_users',
    'clinic_visit_sessions',
    'entitlement_capabilities',
    'entitlements',
    'feature_flags',
    'financial_installments',
    'financial_plans',
    'followup_automation_rules',
    'insurance_claims',
    'insurance_contracts',
    'insurance_providers',
    'inventory_items',
    'inventory_ledger',
    'inventory_lots',
    'invoice_refunds',
    'master_agenda_events',
    'master_tenants',
    'medical_file_ai_results',
    'medical_file_annotations',
    'medical_file_measurements',
    'medical_file_storage_locations',
    'medical_files',
    'patient_clinic_relationships',
    'patient_history',
    'patient_identities',
    'patient_insurance_profiles',
    'patient_portal_invitations',
    'patient_portal_medical_file_releases',
    'patient_portal_messages',
    'permission_bundle_items',
    'permission_bundles',
    'permissions',
    'purchase_orders',
    'purchase_receipts',
    'retention_followups',
    'role_permissions',
    'role_template_permissions',
    'role_templates',
    'roles',
    'subscription_plans',
    'subscriptions',
    'supplier_bills',
    'suppliers',
    'tenant_devices',
    'tenant_entitlements',
    'tenant_notification_channel_prefs',
    'workforce_procedure_capabilities'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted_at timestamptz', v_table);
    END IF;
  END LOOP;
END
$soft_delete$;
