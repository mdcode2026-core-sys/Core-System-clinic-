-- Migration: Inventory Transaction Types — Architecture Correction
-- Date: 2026-08-04
-- Replaces generic consumption_type with approved Transaction Types

-- 1. Drop old CHECK constraint
ALTER TABLE inventory_ledger
DROP CONSTRAINT IF EXISTS inventory_ledger_consumption_type_check;

-- 2. Rename column to transaction_type (clearer semantics)
-- Note: column already exists as consumption_type, we keep the name
-- but change the allowed values to match approved Transaction Types

-- 3. Add new CHECK constraint with approved Transaction Types
ALTER TABLE inventory_ledger
ADD CONSTRAINT inventory_ledger_transaction_type_check
CHECK (consumption_type IN (
  'purchase',
  'purchase_return',
  'doctor_request',
  'unused_return',
  'inventory_adjustment_increase',
  'inventory_adjustment_decrease'
));

-- 4. Update function signature comment (no code change needed)
COMMENT ON TABLE inventory_ledger IS 'Inventory transaction log: purchase (+), purchase_return (-), doctor_request (-), unused_return (+), inventory_adjustment_increase (+), inventory_adjustment_decrease (-)';
