-- Migration: Sync inventory definitions with live database
-- Date: 2026-08-03
-- Architect corrections applied directly on live DB:
--   - adjust_inventory_stock() hardened (SECURITY DEFINER removed, tenant_id enforced)
--   - inventory_items table created
--   - inventory_ledger.item_id column added
-- This migration documents the actual live state in the repository.

-- ============================================
-- 1. inventory_items TABLE
-- ============================================
-- The live database has an inventory_items table referenced by adjust_inventory_stock().
-- This table was created by the Architect directly and was NOT in the repo schema.

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    procedure_id uuid REFERENCES public.clinic_procedures(id) ON DELETE SET NULL,
    current_stock integer NOT NULL DEFAULT 0,
    deleted_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS policy for tenant isolation
CREATE POLICY IF NOT EXISTS "rls_inventory_items_isolation"
ON public.inventory_items
USING (tenant_id = public.get_current_tenant_id());

-- ============================================
-- 2. inventory_ledger COLUMN: item_id
-- ============================================
-- The live database has item_id (uuid, nullable) on inventory_ledger.
-- This column links to inventory_items.id.
-- It was added by the Architect and was NOT in the original repo schema.

ALTER TABLE public.inventory_ledger
ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL;

-- ============================================
-- 3. adjust_inventory_stock() — LIVE DEFINITION
-- ============================================
-- Live state: NOT SECURITY DEFINER (invoker rights)
-- Live state: Updates inventory_items (not inventory_ledger)
-- Live state: Has tenant_id check built-in via WHERE clause
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
-- 4. GRANTS
-- ============================================
GRANT EXECUTE ON FUNCTION public.adjust_inventory_stock(uuid, uuid, numeric) TO authenticated;

COMMENT ON FUNCTION public.adjust_inventory_stock IS 
'Inventory stock adjustment — invoker rights, tenant-checked via WHERE clause.
Updates inventory_items.current_stock. Positive delta = increase, negative = decrease.
Hardened by Architect on live DB: SECURITY DEFINER removed, tenant_id enforced.';
