-- Migration: Sync inventory definitions with live database
-- Date: 2026-08-03
-- Architect corrections: adjust_inventory_stock() already hardened on live DB
-- This migration documents the actual live state in the repository

-- ============================================
-- 1. inventory_items TABLE (missing from repo)
-- ============================================
-- The live database has an inventory_items table referenced by adjust_inventory_stock().
-- This table was created by the Architect directly and is NOT in the repo schema.
-- 
-- Expected structure (verify with \d inventory_items):
--   id uuid PK
--   tenant_id uuid NOT NULL
--   procedure_id uuid (FK to clinic_procedures)
--   current_stock integer
--   deleted_at timestamptz
--   updated_at timestamptz
--
-- ACTION REQUIRED: Owner must verify and add CREATE TABLE if this table
-- does not exist in a separate migration. This migration only documents
-- the live state.

-- ============================================
-- 2. inventory_ledger COLUMN: item_id
-- ============================================
-- The live database has item_id (uuid, nullable) on inventory_ledger.
-- This column links to inventory_items.id.
-- It is NOT in the original repo schema.
--
-- If item_id is missing, add it:
ALTER TABLE public.inventory_ledger
ADD COLUMN IF NOT EXISTS item_id uuid;

-- ============================================
-- 3. adjust_inventory_stock() — LIVE DEFINITION
-- ============================================
-- Live state: NOT SECURITY DEFINER (invoker rights)
-- Live state: Updates inventory_items (not inventory_ledger)
-- Live state: Has tenant_id check built-in
--
-- Drop and recreate to match live definition exactly:

DROP FUNCTION IF EXISTS public.adjust_inventory_stock(uuid, uuid, numeric);

CREATE OR REPLACE FUNCTION public.adjust_inventory_stock(
  p_item_id uuid,
  p_tenant_id uuid,
  p_delta numeric
) RETURNS integer
LANGUAGE plpgsql
-- NO SECURITY DEFINER — runs with caller's privileges (matches live DB)
AS $$
DECLARE
  v_new_stock integer;
BEGIN
  UPDATE public.inventory_items
  SET current_stock = current_stock + p_delta,
      updated_at = now()
  WHERE id = p_item_id
    AND tenant_id = p_tenant_id
    AND deleted_at IS NULL
    AND (current_stock + p_delta) >= 0
  RETURNING current_stock INTO v_new_stock;

  IF v_new_stock IS NULL THEN
    RAISE EXCEPTION 'Insufficient stock: adjustment would result in negative stock';
  END IF;

  RETURN v_new_stock;
END;
$$;

-- ============================================
-- 4. RLS POLICY — already correct on live DB
-- ============================================
-- Live state: rls_inventory_isolation exists with tenant_id check
-- No change needed. Verified:
--   qual: (tenant_id = get_current_tenant_id())

-- ============================================
-- 5. GRANTS
-- ============================================
GRANT EXECUTE ON FUNCTION public.adjust_inventory_stock(uuid, uuid, numeric) TO authenticated;

COMMENT ON FUNCTION public.adjust_inventory_stock IS 
'Inventory stock adjustment — invoker rights, tenant-checked via WHERE clause.
Updates inventory_items.current_stock. Positive delta = increase, negative = decrease.
Hardened by Architect on live DB: SECURITY DEFINER removed, tenant_id enforced.';
