create unique index if not exists uq_supplier_bills_tenant_id on public.supplier_bills(tenant_id,id);

create table if not exists public.supplier_bill_items (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 supplier_bill_id uuid not null,
 inventory_item_id uuid,
 description text,
 quantity integer not null default 1 check (quantity > 0),
 unit_cost_subunits integer not null default 0 check (unit_cost_subunits >= 0),
 line_total_subunits integer not null default 0 check (line_total_subunits >= 0),
 created_by uuid,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint supplier_bill_items_bill_tenant_fk foreign key (tenant_id, supplier_bill_id) references public.supplier_bills(tenant_id, id) on delete cascade,
 constraint supplier_bill_items_item_tenant_fk foreign key (tenant_id, inventory_item_id) references public.inventory_items(tenant_id, id) on delete restrict
);
create index if not exists idx_supplier_bill_items_bill on public.supplier_bill_items(tenant_id, supplier_bill_id);
create index if not exists idx_supplier_bill_items_item on public.supplier_bill_items(tenant_id, inventory_item_id);
alter table public.supplier_bill_items enable row level security;
create policy supplier_bill_items_select_tenant on public.supplier_bill_items for select to authenticated using (tenant_id = public.get_current_tenant_id());
create policy supplier_bill_items_insert_tenant on public.supplier_bill_items for insert to authenticated with check (tenant_id = public.get_current_tenant_id());
create policy supplier_bill_items_update_tenant on public.supplier_bill_items for update to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());
revoke all on public.supplier_bill_items from anon;
grant select,insert,update on public.supplier_bill_items to authenticated;
