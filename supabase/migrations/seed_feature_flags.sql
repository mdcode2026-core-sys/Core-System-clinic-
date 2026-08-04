-- Migration: Seed globally-enabled feature_flags for all 6 modules
-- Date: 2026-08-04
-- Package: 3.1.7 — Reports Module (Task 2)
-- Per ADR-007: preserves current behavior — every tenant sees every module
-- they already have permission for, while making the check real rather than hardcoded.

INSERT INTO feature_flags (
  tenant_id,
  flag_key,
  flag_name,
  description,
  is_enabled,
  allowed_tiers,
  config_json
)
VALUES
  (NULL, 'patients',    'Patients',    'Patient management module',           true, NULL, NULL),
  (NULL, 'agenda',      'Agenda',      'Appointments and scheduling module',  true, NULL, NULL),
  (NULL, 'queue',       'Queue',       'Patient queue management module',     true, NULL, NULL),
  (NULL, 'billing',     'Billing',     'Invoicing and billing module',        true, NULL, NULL),
  (NULL, 'inventory',   'Inventory',   'Stock and inventory module',          true, NULL, NULL),
  (NULL, 'followup',    'Follow-up',   'Patient follow-up module',            true, NULL, NULL)
ON CONFLICT (tenant_id, flag_key) DO UPDATE
  SET is_enabled = true,
      flag_name = EXCLUDED.flag_name,
      description = EXCLUDED.description;
