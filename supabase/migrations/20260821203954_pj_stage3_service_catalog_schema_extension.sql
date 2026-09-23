-- PJ Stage 3 — Clinic Service Catalog Foundation
-- Medical Master Library / Service Catalog
-- Date: 2026-08-21
-- Scope: Extend clinic_procedures with specialty-agnostic fields

-- ============================================================
-- 1. SCHEMA EXTENSION
-- ============================================================

-- specialty: free-text extensible field for medical specialty association
ALTER TABLE clinic_procedures
ADD COLUMN IF NOT EXISTS specialty text;

-- service_type: categorizes the service (procedure, consultation, package)
ALTER TABLE clinic_procedures
ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'procedure';

-- provider_type: hints at required provider (doctor, nurse, therapist, any)
ALTER TABLE clinic_procedures
ADD COLUMN IF NOT EXISTS provider_type text DEFAULT 'doctor';

-- display_order: controls catalog listing order
ALTER TABLE clinic_procedures
ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_clinic_procedures_specialty_active
ON clinic_procedures(tenant_id, specialty, is_active);

CREATE INDEX IF NOT EXISTS idx_clinic_procedures_category_active
ON clinic_procedures(tenant_id, category, is_active);

CREATE INDEX IF NOT EXISTS idx_clinic_procedures_display_order
ON clinic_procedures(tenant_id, display_order);

-- ============================================================
-- 3. RLS VERIFICATION
-- ============================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE clinic_procedures ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. COMMENT
-- ============================================================

COMMENT ON TABLE clinic_procedures IS 'Clinic Service Catalog — canonical tenant-owned procedure/service definition. Consumed by Agenda, Invoicing, Inventory, Visit. PJ Stage 3 foundation.';
