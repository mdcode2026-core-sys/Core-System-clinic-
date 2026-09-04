create table if not exists public.insurance_providers (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  name text not null, name_ar text, contract_code text, contact_name text, phone text, email text, address text,
  status text not null default 'active' check (status in ('active','inactive')),
  notes text, created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index if not exists idx_insurance_providers_tenant on public.insurance_providers(tenant_id);
create table if not exists public.insurance_contracts (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  provider_id uuid not null references public.insurance_providers(id) on delete restrict,
  contract_number text not null, starts_on date not null, ends_on date,
  coverage_rules text, default_coverage_percent numeric(5,2) check (default_coverage_percent >= 0 and default_coverage_percent <= 100),
  patient_responsibility_percent numeric(5,2) check (patient_responsibility_percent >= 0 and patient_responsibility_percent <= 100),
  claim_method text, claim_requirements text, status text not null default 'active' check (status in ('draft','active','expired','suspended')),
  notes text, created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique (tenant_id, contract_number), constraint insurance_contracts_end_after_start check (ends_on is null or ends_on >= starts_on)
);
create index if not exists idx_insurance_contracts_tenant_provider on public.insurance_contracts(tenant_id, provider_id);
alter table public.patient_insurance_profiles add column if not exists contract_id uuid;
alter table public.patient_insurance_profiles add constraint patient_insurance_profiles_contract_fk foreign key (contract_id) references public.insurance_contracts(id) on delete set null;
alter table public.inventory_items add column if not exists sku text;
alter table public.inventory_items add column if not exists category text;
alter table public.inventory_items add column if not exists description text;
alter table public.inventory_items add column if not exists manufacturer text;
create unique index if not exists uq_inventory_items_tenant_sku on public.inventory_items(tenant_id, sku) where sku is not null and deleted_at is null;
create table if not exists public.supplier_bills (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  bill_number text not null, bill_date date not null default current_date, due_date date,
  subtotal_subunits integer not null default 0 check (subtotal_subunits >= 0), tax_subunits integer not null default 0 check (tax_subunits >= 0),
  total_subunits integer not null default 0 check (total_subunits >= 0), amount_paid_subunits integer not null default 0 check (amount_paid_subunits >= 0),
  status text not null default 'open' check (status in ('draft','open','partially_paid','paid','void')),
  notes text, created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique (tenant_id, supplier_id, bill_number), constraint supplier_bills_paid_not_over_total check (amount_paid_subunits <= total_subunits)
);
create index if not exists idx_supplier_bills_tenant_status on public.supplier_bills(tenant_id,status);
alter table public.insurance_providers enable row level security;
alter table public.insurance_contracts enable row level security;
alter table public.supplier_bills enable row level security;
drop policy if exists insurance_providers_tenant_select on public.insurance_providers;
create policy insurance_providers_tenant_select on public.insurance_providers for select using (tenant_id = public.get_current_tenant_id());
drop policy if exists insurance_providers_tenant_write on public.insurance_providers;
create policy insurance_providers_tenant_write on public.insurance_providers for all using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());
drop policy if exists insurance_contracts_tenant_select on public.insurance_contracts;
create policy insurance_contracts_tenant_select on public.insurance_contracts for select using (tenant_id = public.get_current_tenant_id());
drop policy if exists insurance_contracts_tenant_write on public.insurance_contracts;
create policy insurance_contracts_tenant_write on public.insurance_contracts for all using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());
drop policy if exists supplier_bills_tenant_select on public.supplier_bills;
create policy supplier_bills_tenant_select on public.supplier_bills for select using (tenant_id = public.get_current_tenant_id());
drop policy if exists supplier_bills_tenant_write on public.supplier_bills;
create policy supplier_bills_tenant_write on public.supplier_bills for all using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());
