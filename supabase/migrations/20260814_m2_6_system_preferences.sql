-- Migration: 20260814_m2_6_system_preferences.sql
-- M2.6: Add language and direction columns to master_tenants
-- Author: M2.6 Implementation
-- Date: 2026-08-14

-- Add language column with default 'ar' for existing tenants
ALTER TABLE master_tenants
ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'ar';

-- Add direction column with CHECK constraint
ALTER TABLE master_tenants
ADD COLUMN IF NOT EXISTS direction VARCHAR(3) NOT NULL DEFAULT 'rtl';

-- Add CHECK constraint separately (idempotent pattern)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'master_tenants_direction_check'
        AND conrelid = 'master_tenants'::regclass
    ) THEN
        ALTER TABLE master_tenants
        ADD CONSTRAINT master_tenants_direction_check
        CHECK (direction IN ('rtl', 'ltr'));
    END IF;
END $$;

-- Update existing rows to have explicit values (non-destructive)
UPDATE master_tenants
SET language = COALESCE(language, 'ar'),
    direction = COALESCE(direction, 'rtl')
WHERE language IS NULL OR direction IS NULL;

-- Comments for documentation
COMMENT ON COLUMN master_tenants.language IS 'Tenant preferred UI language: ar | en';
COMMENT ON COLUMN master_tenants.direction IS 'Tenant UI text direction: rtl | ltr';
