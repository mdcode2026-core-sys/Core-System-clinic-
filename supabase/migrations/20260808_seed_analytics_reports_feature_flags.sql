-- Migration: Seed globally-enabled feature_flags for 'analytics' and 'reports'
-- Date: 2026-08-08
-- Session: Session 11 Recovery (Workspace Architecture)
--
-- WORKSPACE_ARCHITECTURE_SPECIFICATION.md §9 lists 'analytics' and 'reports'
-- as valid moduleKey values alongside the 6 already seeded in
-- seed_feature_flags.sql (2026-08-04, Package 3.1.7). Those two were missing
-- from that seed, causing AnalyticsOverviewWidget (Session 11) to be
-- permanently hidden for every tenant regardless of subscription.
--
-- Same pattern as the existing 6 rows: globally-enabled (tenant_id = NULL),
-- preserves current behavior (every tenant sees every module they already
-- have permission for). Not a schema change — data only, per ADR-007.
--
-- NOTE: this INSERT was already applied directly against the live database
-- (project core-system-clinic / qaslsjyxjwvdoiczmhgq) during Session 11
-- Recovery. This file is the permanent migration record for it, matching
-- repo convention — running it again is a no-op (ON CONFLICT DO UPDATE).

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
  (NULL, 'analytics', 'Analytics', 'Analytics overview module', true, NULL, NULL),
  (NULL, 'reports',   'Reports',   'Reports module',            true, NULL, NULL)
ON CONFLICT (tenant_id, flag_key) DO UPDATE
  SET is_enabled = true,
      flag_name = EXCLUDED.flag_name,
      description = EXCLUDED.description;
