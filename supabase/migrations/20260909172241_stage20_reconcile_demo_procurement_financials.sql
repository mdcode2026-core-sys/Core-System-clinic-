BEGIN;

-- CORE SYSTEM Stage 20/19 — reconcile current Demo procurement financials.
-- No historical rows are deleted. Payment events are preserved.
-- Canonical PO value = sum of item line totals + tax.
-- Canonical no-bill supplier obligation = net received value at PO-item cost.

WITH item_totals AS (
  SELECT
    po.id,
    COALESCE(SUM(poi.line_total_subunits), 0)::integer AS subtotal_value
  FROM public.purchase_orders po
  JOIN public.purchase_order_items poi
    ON poi.purchase_order_id = po.id
   AND poi.tenant_id = po.tenant_id
  WHERE po.deleted_at IS NULL
    AND po.order_number IN ('PO-SYN-2026-001','PO-SYN-2026-002','PO-SYN-2026-003','PO-SYN-2026-004','PO-SYN-2026-005')
  GROUP BY po.id
)
UPDATE public.purchase_orders po
SET
  subtotal_subunits = it.subtotal_value,
  total_subunits = it.subtotal_value + COALESCE(po.tax_subunits, 0),
  updated_at = now()
FROM item_totals it
WHERE po.id = it.id
  AND (po.subtotal_subunits IS DISTINCT FROM it.subtotal_value
       OR po.total_subunits IS DISTINCT FROM it.subtotal_value + COALESCE(po.tax_subunits,0));

WITH received_values AS (
  SELECT
    po.id AS purchase_order_id,
    po.tenant_id,
    COALESCE(SUM((pri.quantity_received - pri.quantity_returned) * poi.unit_cost_subunits), 0)::integer AS received_value
  FROM public.purchase_orders po
  JOIN public.purchase_receipts pr
    ON pr.purchase_order_id = po.id
   AND pr.tenant_id = po.tenant_id
   AND pr.deleted_at IS NULL
  JOIN public.purchase_receipt_items pri
    ON pri.receipt_id = pr.id
   AND pri.tenant_id = po.tenant_id
  JOIN public.purchase_order_items poi
    ON poi.id = pri.purchase_order_item_id
   AND poi.purchase_order_id = po.id
   AND poi.tenant_id = po.tenant_id
  WHERE po.deleted_at IS NULL
    AND po.order_number IN ('PO-SYN-2026-001','PO-SYN-2026-002','PO-SYN-2026-003','PO-SYN-2026-004','PO-SYN-2026-005')
  GROUP BY po.id, po.tenant_id
)
UPDATE public.supplier_obligations so
SET
  amount_subunits = rv.received_value,
  amount_paid_subunits = LEAST(COALESCE(so.amount_paid_subunits,0), rv.received_value),
  status = CASE
    WHEN LEAST(COALESCE(so.amount_paid_subunits,0), rv.received_value) >= rv.received_value THEN 'paid'
    WHEN LEAST(COALESCE(so.amount_paid_subunits,0), rv.received_value) > 0 THEN 'partially_paid'
    ELSE 'open'
  END,
  updated_at = now()
FROM received_values rv
WHERE so.purchase_order_id = rv.purchase_order_id
  AND so.tenant_id = rv.tenant_id
  AND so.supplier_bill_id IS NULL
  AND (
    so.amount_subunits IS DISTINCT FROM rv.received_value
    OR so.amount_paid_subunits IS DISTINCT FROM LEAST(COALESCE(so.amount_paid_subunits,0), rv.received_value)
  );

COMMIT;
