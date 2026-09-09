-- Stage 27 / inventory provenance reconciliation.
-- This forward-only migration does not change current_stock or delete evidence.
-- It records pre-canonical legacy balances explicitly in the ledger and closes
-- one audited receipt whose stock effect already exists in current_stock.

WITH mismatches AS (
  SELECT i.id AS item_id,
         i.tenant_id,
         i.name,
         i.current_stock - COALESCE(SUM(il.quantity_delta), 0)::numeric AS opening_delta,
         i.valuation_cost_subunits
  FROM public.inventory_items i
  LEFT JOIN public.inventory_ledger il
    ON il.item_id = i.id
   AND il.tenant_id = i.tenant_id
   AND il.deleted_at IS NULL
  WHERE i.tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND i.deleted_at IS NULL
  GROUP BY i.id, i.tenant_id, i.name, i.current_stock, i.valuation_cost_subunits
  HAVING i.current_stock - COALESCE(SUM(il.quantity_delta), 0)::numeric > 0
), classified AS (
  SELECT m.*
  FROM mismatches m
  WHERE m.item_id IN (
    '9bf31efd-9c0c-4d7b-983d-5bc56e83edfc'::uuid,
    'ccc3760a-398a-4c2b-abe6-8b345bda9c92'::uuid,
    'e3700059-c0c8-49de-8d04-94ea94e82c15'::uuid,
    '0d80656a-1ccc-42bf-84b3-9491e9123bf9'::uuid,
    '369f2f4e-c1dc-4d27-907f-f4aa4e3f5ec9'::uuid,
    '06bdbc61-5cd5-4ad6-a5fa-07ca4c4f24c2'::uuid,
    '5cc15bb9-0bd7-4c18-ac18-fa4356710264'::uuid,
    'f4934c1c-4924-4656-ac2e-62da9bb48266'::uuid
  )
), opening_inserts AS (
  INSERT INTO public.inventory_ledger (
    tenant_id, item_id, material_name, quantity_consumed, consumption_type,
    notes, created_at, quantity_delta, movement_type, source_type,
    unit_cost_subunits, cost_total_subunits
  )
  SELECT tenant_id,
         item_id,
         name,
         opening_delta,
         'inventory_adjustment_increase',
         'Historical opening balance reconciliation: pre-canonical inventory state recorded explicitly; no stock quantity changed.',
         TIMESTAMPTZ '2026-09-01 11:11:52.429887+00',
         opening_delta,
         'adjustment',
         'legacy_untraceable',
         valuation_cost_subunits,
         CASE WHEN valuation_cost_subunits IS NULL THEN NULL ELSE (opening_delta * valuation_cost_subunits)::integer END
  FROM classified
  WHERE opening_delta > 0
    AND NOT EXISTS (
      SELECT 1
      FROM public.inventory_ledger prior
      WHERE prior.tenant_id = classified.tenant_id
        AND prior.item_id = classified.item_id
        AND prior.source_type = 'legacy_untraceable'
        AND prior.notes = 'Historical opening balance reconciliation: pre-canonical inventory state recorded explicitly; no stock quantity changed.'
        AND prior.deleted_at IS NULL
    )
  RETURNING id
)
UPDATE public.purchase_orders po
SET status = 'received',
    updated_at = now()
WHERE po.id = 'a7000000-0000-4000-8000-000000000001'::uuid
  AND po.tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
  AND po.status <> 'received'
  AND NOT EXISTS (
    SELECT 1
    FROM public.purchase_order_items poi
    WHERE poi.purchase_order_id = po.id
      AND poi.quantity_received < poi.quantity_ordered
  );

INSERT INTO public.inventory_ledger (
  tenant_id, item_id, material_name, quantity_consumed, consumption_type,
  logged_by, notes, created_at, quantity_delta, movement_type, source_type,
  source_id, unit_cost_subunits, cost_total_subunits
)
SELECT
  '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid,
  'ccc3760a-398a-4c2b-abe6-8b345bda9c92'::uuid,
  'Chemical Peel Solution',
  10,
  'purchase',
  '0e6e6030-121b-4e1a-bf14-ebbd18c19e4f'::uuid,
  'Historical AUDIT-PO-001 receipt reconciliation: receipt 10/10 existed and current stock already included the quantity; ledger provenance restored without changing stock.',
  '2026-09-07 10:27:42.052108+00'::timestamptz,
  10,
  'purchase_receipt',
  'purchase_receipt',
  'a7200000-0000-4000-8000-000000000001'::uuid,
  2200,
  22000
WHERE NOT EXISTS (
  SELECT 1
  FROM public.inventory_ledger il
  WHERE il.tenant_id = '2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND il.source_type = 'purchase_receipt'
    AND il.source_id = 'a7200000-0000-4000-8000-000000000001'::uuid
    AND il.item_id = 'ccc3760a-398a-4c2b-abe6-8b345bda9c92'::uuid
    AND il.deleted_at IS NULL
);
