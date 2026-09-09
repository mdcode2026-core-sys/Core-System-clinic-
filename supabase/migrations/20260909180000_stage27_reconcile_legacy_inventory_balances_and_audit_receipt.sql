-- Stage 27 / inventory provenance reconciliation.
-- Forward-only: no current_stock mutation and no deletion.
-- The eight listed legacy balances were present before the canonical ledger path.
-- Chemical Peel Solution additionally has an audited receipt whose stock effect
-- already exists in current_stock but whose ledger provenance is missing.

WITH opening_balances(item_id, opening_delta) AS (
  VALUES
    ('9bf31efd-9c0c-4d7b-983d-5bc56e83edfc'::uuid, 12::numeric),
    ('ccc3760a-398a-4c2b-abe6-8b345bda9c92'::uuid, 8::numeric),
    ('e3700059-c0c8-49de-8d04-94ea94e82c15'::uuid, 15::numeric),
    ('0d80656a-1ccc-42bf-84b3-9491e9123bf9'::uuid, 100::numeric),
    ('369f2f4e-c1dc-4d27-907f-f4aa4e3f5ec9'::uuid, 50::numeric),
    ('06bdbc61-5cd5-4ad6-a5fa-07ca4c4f24c2'::uuid, 20::numeric),
    ('5cc15bb9-0bd7-4c18-ac18-fa4356710264'::uuid, 60::numeric),
    ('f4934c1c-4924-4656-ac2e-62da9bb48266'::uuid, 25::numeric)
)
INSERT INTO public.inventory_ledger (
  tenant_id, item_id, material_name, quantity_consumed, consumption_type,
  notes, created_at, quantity_delta, movement_type, source_type,
  unit_cost_subunits, cost_total_subunits
)
SELECT
  i.tenant_id,
  i.id,
  i.name,
  ob.opening_delta,
  'inventory_adjustment_increase',
  'Historical opening balance reconciliation: pre-canonical inventory state recorded explicitly; no stock quantity changed.',
  i.created_at,
  ob.opening_delta,
  'adjustment',
  'legacy_untraceable',
  i.valuation_cost_subunits,
  CASE WHEN i.valuation_cost_subunits IS NULL THEN NULL ELSE (ob.opening_delta * i.valuation_cost_subunits)::integer END
FROM public.inventory_items i
JOIN opening_balances ob ON ob.item_id=i.id
WHERE i.tenant_id='2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
  AND i.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.inventory_ledger prior
    WHERE prior.tenant_id=i.tenant_id
      AND prior.item_id=i.id
      AND prior.source_type='legacy_untraceable'
      AND prior.notes='Historical opening balance reconciliation: pre-canonical inventory state recorded explicitly; no stock quantity changed.'
      AND prior.deleted_at IS NULL
  );

UPDATE public.purchase_orders po
SET status='received', updated_at=now()
WHERE po.id='a7000000-0000-4000-8000-000000000001'::uuid
  AND po.tenant_id='2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
  AND po.status <> 'received'
  AND NOT EXISTS (
    SELECT 1 FROM public.purchase_order_items poi
    WHERE poi.purchase_order_id=po.id
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
  SELECT 1 FROM public.inventory_ledger il
  WHERE il.tenant_id='2fa98983-8069-420f-9c27-7c36ef96ef6e'::uuid
    AND il.source_type='purchase_receipt'
    AND il.source_id='a7200000-0000-4000-8000-000000000001'::uuid
    AND il.item_id='ccc3760a-398a-4c2b-abe6-8b345bda9c92'::uuid
    AND il.deleted_at IS NULL
);
