-- Correct lot identity: one item may have multiple lots; identity is tenant + item + lot number.
drop index if exists public.uq_inventory_lots_tenant_item;
drop index if exists public.uq_inventory_lots_tenant_item_lot;
create unique index if not exists uq_inventory_lots_tenant_item_lot on public.inventory_lots(tenant_id,inventory_item_id,lot_number) where deleted_at is null;
