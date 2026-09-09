-- Stage 16: Inventory Canonical Repair
-- Goal: eliminate the legacy 3-argument stock mutation path, keep all stock changes
-- atomic through the existing canonical RPC, and prevent direct current_stock writes.

-- The 11-argument SECURITY DEFINER overload is the canonical mutation path.
-- Remove legacy overloads so callers cannot bypass permission, tenant and ledger rules.
DROP FUNCTION IF EXISTS public.adjust_inventory_stock(uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.adjust_inventory_stock(uuid, uuid, numeric);

-- current_stock is an operational balance, not editable item metadata.
-- New inventory items must start at zero; opening balance is recorded as a
-- canonical inventory movement. Existing rows may change current_stock only
-- inside the canonical mutation RPC, which sets core.inventory_stock_mutation.
CREATE OR REPLACE FUNCTION public.guard_inventory_stock_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.current_stock, 0) <> 0 THEN
      RAISE EXCEPTION 'Current stock must start at zero; use the canonical inventory movement operation for opening balance';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.current_stock IS DISTINCT FROM OLD.current_stock
     AND COALESCE(current_setting('core.inventory_stock_mutation', true), '') <> '1' THEN
    RAISE EXCEPTION 'Current stock is controlled by the canonical inventory movement operation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_inventory_stock_write ON public.inventory_items;
CREATE TRIGGER trg_guard_inventory_stock_write
BEFORE INSERT OR UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.guard_inventory_stock_write();

COMMENT ON FUNCTION public.guard_inventory_stock_write() IS
'Protects inventory stock: inserts must start at zero and current_stock updates require the canonical inventory movement context.';
