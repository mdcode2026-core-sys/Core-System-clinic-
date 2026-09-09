-- CORE SYSTEM Stage 19/20 — Supplier payment balance synchronization
-- Forward-only. Existing supplier payment rows are authoritative when they exist.
-- Historical obligation balances with no payment rows are intentionally NOT rewritten.

BEGIN;

CREATE OR REPLACE FUNCTION public.sync_supplier_obligation_from_payments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_obligation_id uuid;
  v_tenant_id uuid;
  v_total integer;
  v_amount integer;
BEGIN
  v_obligation_id := COALESCE(NEW.supplier_obligation_id, OLD.supplier_obligation_id);
  v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);

  SELECT o.amount_subunits
    INTO v_amount
  FROM public.supplier_obligations o
  WHERE o.id = v_obligation_id
    AND o.tenant_id = v_tenant_id
  FOR UPDATE;

  IF v_amount IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COALESCE(SUM(p.amount_subunits), 0)
    INTO v_total
  FROM public.supplier_payments p
  WHERE p.tenant_id = v_tenant_id
    AND p.supplier_obligation_id = v_obligation_id;

  v_total := LEAST(v_total, v_amount);

  UPDATE public.supplier_obligations
  SET amount_paid_subunits = v_total,
      status = CASE
        WHEN v_total >= v_amount THEN 'paid'
        WHEN v_total > 0 THEN 'partially_paid'
        ELSE 'open'
      END,
      updated_at = now()
  WHERE id = v_obligation_id
    AND tenant_id = v_tenant_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_supplier_payment_obligation_sync ON public.supplier_payments;
CREATE TRIGGER trg_supplier_payment_obligation_sync
AFTER INSERT OR UPDATE OF supplier_obligation_id, tenant_id, amount_subunits OR DELETE
ON public.supplier_payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_supplier_obligation_from_payments();

WITH payment_totals AS (
  SELECT p.tenant_id, p.supplier_obligation_id,
         LEAST(SUM(p.amount_subunits), MAX(o.amount_subunits)) AS paid
  FROM public.supplier_payments p
  JOIN public.supplier_obligations o
    ON o.id = p.supplier_obligation_id
   AND o.tenant_id = p.tenant_id
  GROUP BY p.tenant_id, p.supplier_obligation_id
)
UPDATE public.supplier_obligations o
SET amount_paid_subunits = pt.paid,
    status = CASE
      WHEN pt.paid >= o.amount_subunits THEN 'paid'
      WHEN pt.paid > 0 THEN 'partially_paid'
      ELSE 'open'
    END,
    updated_at = now()
FROM payment_totals pt
WHERE o.id = pt.supplier_obligation_id
  AND o.tenant_id = pt.tenant_id;

COMMIT;
