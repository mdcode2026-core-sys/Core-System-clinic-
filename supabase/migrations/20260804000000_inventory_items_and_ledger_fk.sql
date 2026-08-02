-- Migration: Inventory Module Schema — Package 3.1.6 (Revision 2)
-- Date: 2026-08-04
-- Changes:
--   1. Create inventory_items (product catalog + stock level)
--   2. Add item_id FK to inventory_ledger linking ledger entries to catalog items
--   3. Atomic stock adjustment function (adjust_inventory_stock)
--   4. RLS policies for tenant isolation on inventory_items
--   5. Grant usage to authenticated role

-- ============================================
-- 1. inventory_items — Product Catalog + Stock
-- ============================================
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  name text not null,
  name_ar text,
  unit text not null default 'piece',
  reorder_threshold integer not null default 0,
  current_stock integer not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tenant-scoped unique index on active items
create unique index if not exists idx_inventory_items_tenant_name_active
  on public.inventory_items(tenant_id, name)
  where deleted_at is null;

create index if not exists idx_inventory_items_tenant_id
  on public.inventory_items(tenant_id);

create index if not exists idx_inventory_items_low_stock
  on public.inventory_items(tenant_id, current_stock, reorder_threshold)
  where deleted_at is null and is_active = true;

-- ============================================
-- 2. inventory_ledger — Add item_id FK
-- ============================================
alter table public.inventory_ledger
  add column if not exists item_id uuid null references public.inventory_items(id) on delete set null;

create index if not exists idx_inventory_ledger_item_id
  on public.inventory_ledger(item_id);

-- ============================================
-- 3. Atomic stock adjustment function
-- ============================================
create or replace function public.adjust_inventory_stock(
  p_item_id uuid,
  p_tenant_id uuid,
  p_delta integer
)
returns integer
language plpgsql
security definer
as $$
declare
  v_new_stock integer;
begin
  -- Atomic update with guard against negative stock
  update public.inventory_items
  set current_stock = current_stock + p_delta,
      updated_at = now()
  where id = p_item_id
    and tenant_id = p_tenant_id
    and deleted_at is null
    and (current_stock + p_delta) >= 0
  returning current_stock into v_new_stock;

  if v_new_stock is null then
    raise exception 'Insufficient stock: adjustment would result in negative stock';
  end if;

  return v_new_stock;
end;
$$;

-- Lock down function execution
revoke all on function public.adjust_inventory_stock(uuid, uuid, integer) from public;
grant execute on function public.adjust_inventory_stock(uuid, uuid, integer) to authenticated;

-- ============================================
-- 4. RLS on inventory_items
-- ============================================
alter table public.inventory_items enable row level security;

-- Select: tenant-scoped
create policy if not exists rls_inventory_items_read
  on public.inventory_items
  for select
  to authenticated
  using (tenant_id = public.get_current_tenant_id());

-- Insert: users with inventory:create (FIX #4: added 'accounting')
create policy if not exists rls_inventory_items_insert
  on public.inventory_items
  for insert
  to authenticated
  with check (
    tenant_id = public.get_current_tenant_id()
    and public.get_current_user_role() in ('super_admin', 'clinic_admin', 'receptionist', 'accounting')
  );

-- Update: users with inventory:update (FIX #4: added 'accounting')
create policy if not exists rls_inventory_items_update
  on public.inventory_items
  for update
  to authenticated
  using (
    tenant_id = public.get_current_tenant_id()
    and public.get_current_user_role() in ('super_admin', 'clinic_admin', 'receptionist', 'accounting')
  )
  with check (tenant_id = public.get_current_tenant_id());

-- ============================================
-- 5. Grants
-- ============================================
grant select, insert, update on public.inventory_items to authenticated;
