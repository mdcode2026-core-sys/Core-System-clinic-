-- AJM-2 Financial & Resources Foundation
insert into public.permissions(permission_key,permission_name,description,resource,action) values
('invoices:issue','Issue Invoices','Issue draft invoices','invoices','issue'),
('invoices:payment','Record Invoice Payments','Record and allocate invoice payments','invoices','payment'),
('invoices:discount','Approve Invoice Discounts','Approve invoice discounts','invoices','discount'),
('invoices:cancel','Cancel Invoices','Cancel eligible invoices','invoices','cancel'),
('inventory:adjust','Adjust Inventory','Perform controlled inventory adjustments','inventory','adjust'),
('purchasing:read','View Purchasing','View suppliers and purchasing records','purchasing','read'),
('purchasing:manage','Manage Purchasing','Create and manage suppliers and purchase orders','purchasing','manage'),
('insurance:read','View Insurance','View patient insurance context','insurance','read'),
('insurance:manage','Manage Insurance','Manage patient insurance and claim-ready records','insurance','manage')
on conflict(permission_key) do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.role_key in('clinic_admin','accounting','receptionist') and p.permission_key in('invoices:issue','invoices:payment','invoices:discount','invoices:cancel','inventory:adjust','purchasing:read','purchasing:manage','insurance:read','insurance:manage') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.role_key='doctor' and p.permission_key='insurance:read' on conflict do nothing;

alter table public.invoice_payments add column if not exists financial_plan_id uuid, add column if not exists installment_id uuid;

create table if not exists public.financial_plans(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 patient_id uuid not null references public.clinic_patients(id),treatment_plan_id uuid references public.clinic_treatment_plans(id) on delete set null,
 total_amount_subunits integer not null default 0 check(total_amount_subunits>=0),insurance_covered_subunits integer not null default 0 check(insurance_covered_subunits>=0),
 patient_responsibility_subunits integer not null default 0 check(patient_responsibility_subunits>=0),currency text,status text not null default 'draft' check(status in('draft','active','completed','cancelled')),
 notes text,created_by uuid references public.clinic_users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.financial_installments(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 financial_plan_id uuid not null references public.financial_plans(id) on delete cascade,installment_no integer not null check(installment_no>0),due_date date not null,
 amount_subunits integer not null check(amount_subunits>=0),amount_paid_subunits integer not null default 0 check(amount_paid_subunits>=0),
 status text not null default 'scheduled' check(status in('scheduled','due','partial','paid','overdue','cancelled')),invoice_id uuid references public.clinic_invoices(id) on delete set null,
 notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(financial_plan_id,installment_no));
alter table public.invoice_payments add constraint invoice_payments_financial_plan_fk foreign key(financial_plan_id) references public.financial_plans(id) on delete set null;
alter table public.invoice_payments add constraint invoice_payments_installment_fk foreign key(installment_id) references public.financial_installments(id) on delete set null;
create index if not exists financial_plans_tenant_patient_idx on public.financial_plans(tenant_id,patient_id);
create index if not exists financial_installments_tenant_due_idx on public.financial_installments(tenant_id,due_date);

create table if not exists public.patient_insurance_profiles(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,patient_id uuid not null references public.clinic_patients(id) on delete cascade,
 payer_name text not null,policy_number text,member_number text,coverage_summary text,patient_responsibility_subunits integer,
 status text not null default 'active' check(status in('active','inactive','expired','pending')),claim_ready boolean not null default false,
 reconciliation_status text not null default 'not_started' check(reconciliation_status in('not_started','ready','in_progress','reconciled','exception')),
 effective_from date,effective_to date,notes text,created_by uuid references public.clinic_users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.insurance_claims(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,patient_id uuid not null references public.clinic_patients(id),
 insurance_profile_id uuid not null references public.patient_insurance_profiles(id) on delete restrict,invoice_id uuid references public.clinic_invoices(id) on delete set null,
 claim_reference text,amount_claimed_subunits integer not null default 0 check(amount_claimed_subunits>=0),amount_reconciled_subunits integer not null default 0 check(amount_reconciled_subunits>=0),
 status text not null default 'prepared' check(status in('prepared','submitted','paid','rejected','reconciled','exception')),prepared_at timestamptz,reconciled_at timestamptz,notes text,
 created_by uuid references public.clinic_users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index if not exists patient_insurance_tenant_patient_idx on public.patient_insurance_profiles(tenant_id,patient_id);
create index if not exists insurance_claims_tenant_patient_idx on public.insurance_claims(tenant_id,patient_id);

create table if not exists public.suppliers(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,name text not null,name_ar text,contact_name text,phone text,email text,address text,tax_identifier text,
 status text not null default 'active' check(status in('active','inactive')),notes text,created_by uuid references public.clinic_users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.purchase_orders(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,supplier_id uuid not null references public.suppliers(id),order_number text,
 status text not null default 'draft' check(status in('draft','ordered','partially_received','received','cancelled')),order_date date not null default current_date,expected_date date,
 subtotal_subunits integer not null default 0 check(subtotal_subunits>=0),tax_subunits integer not null default 0 check(tax_subunits>=0),total_subunits integer not null default 0 check(total_subunits>=0),notes text,
 created_by uuid references public.clinic_users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.purchase_order_items(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
 inventory_item_id uuid not null references public.inventory_items(id),quantity_ordered integer not null check(quantity_ordered>0),quantity_received integer not null default 0 check(quantity_received>=0),unit_cost_subunits integer not null default 0 check(unit_cost_subunits>=0),line_total_subunits integer not null default 0 check(line_total_subunits>=0),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.purchase_receipts(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,purchase_order_id uuid not null references public.purchase_orders(id),receipt_number text,received_at timestamptz not null default now(),received_by uuid references public.clinic_users(id) on delete set null,notes text,created_at timestamptz not null default now());
create table if not exists public.purchase_receipt_items(
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.master_tenants(id) on delete cascade,receipt_id uuid not null references public.purchase_receipts(id) on delete cascade,
 purchase_order_item_id uuid not null references public.purchase_order_items(id),inventory_item_id uuid not null references public.inventory_items(id),quantity_received integer not null check(quantity_received>0),created_at timestamptz not null default now());

alter table public.financial_plans enable row level security; alter table public.financial_installments enable row level security; alter table public.patient_insurance_profiles enable row level security; alter table public.insurance_claims enable row level security; alter table public.suppliers enable row level security; alter table public.purchase_orders enable row level security; alter table public.purchase_order_items enable row level security; alter table public.purchase_receipts enable row level security; alter table public.purchase_receipt_items enable row level security;

create policy financial_plans_select on public.financial_plans for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'invoices:read') or public.has_tenant_permission(tenant_id,'invoices:update')));
create policy financial_plans_write on public.financial_plans for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update'));
create policy financial_installments_select on public.financial_installments for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'invoices:read') or public.has_tenant_permission(tenant_id,'invoices:update')));
create policy financial_installments_write on public.financial_installments for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update'));
create policy insurance_profiles_select on public.patient_insurance_profiles for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'insurance:read') or public.has_tenant_permission(tenant_id,'insurance:manage')));
create policy insurance_profiles_write on public.patient_insurance_profiles for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'insurance:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'insurance:manage'));
create policy insurance_claims_select on public.insurance_claims for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'insurance:read') or public.has_tenant_permission(tenant_id,'insurance:manage')));
create policy insurance_claims_write on public.insurance_claims for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'insurance:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'insurance:manage'));
create policy suppliers_select on public.suppliers for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'purchasing:read') or public.has_tenant_permission(tenant_id,'purchasing:manage')));
create policy suppliers_write on public.suppliers for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage'));
create policy purchase_orders_select on public.purchase_orders for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'purchasing:read') or public.has_tenant_permission(tenant_id,'purchasing:manage')));
create policy purchase_orders_write on public.purchase_orders for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage'));
create policy purchase_order_items_select on public.purchase_order_items for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'purchasing:read') or public.has_tenant_permission(tenant_id,'purchasing:manage')));
create policy purchase_order_items_write on public.purchase_order_items for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage'));
create policy purchase_receipts_select on public.purchase_receipts for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'purchasing:read') or public.has_tenant_permission(tenant_id,'purchasing:manage')));
create policy purchase_receipts_write on public.purchase_receipts for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage'));
create policy purchase_receipt_items_select on public.purchase_receipt_items for select to authenticated using(tenant_id=public.get_current_tenant_id() and(public.has_tenant_permission(tenant_id,'purchasing:read') or public.has_tenant_permission(tenant_id,'purchasing:manage')));
create policy purchase_receipt_items_write on public.purchase_receipt_items for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'purchasing:manage'));

-- Invoice policies: reconcile retired role literals and missing mutation policies.
drop policy if exists rls_invoice_items_insert on public.invoice_items; drop policy if exists rls_invoice_items_update on public.invoice_items; drop policy if exists rls_invoice_items_delete on public.invoice_items; drop policy if exists rls_invoice_items_select on public.invoice_items;
create policy rls_invoice_items_select on public.invoice_items for select to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:read'));
create policy rls_invoice_items_insert on public.invoice_items for insert to authenticated with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:create'));
create policy rls_invoice_items_update on public.invoice_items for update to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update'));
create policy rls_invoice_items_delete on public.invoice_items for delete to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update'));
drop policy if exists rls_invoice_payments_insert on public.invoice_payments; drop policy if exists rls_invoice_payments_update on public.invoice_payments; drop policy if exists rls_invoice_payments_delete on public.invoice_payments; drop policy if exists rls_invoice_payments_select on public.invoice_payments;
create policy rls_invoice_payments_select on public.invoice_payments for select to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:read'));
create policy rls_invoice_payments_insert on public.invoice_payments for insert to authenticated with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:payment'));
create policy rls_invoice_payments_update on public.invoice_payments for update to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:payment')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:payment'));
create policy rls_invoice_payments_delete on public.invoice_payments for delete to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:cancel'));
drop policy if exists rls_invoices_select on public.clinic_invoices; drop policy if exists rls_invoices_insert on public.clinic_invoices; drop policy if exists rls_invoices_update on public.clinic_invoices; drop policy if exists rls_invoices_delete on public.clinic_invoices;
create policy rls_invoices_select on public.clinic_invoices for select to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:read'));
create policy rls_invoices_insert on public.clinic_invoices for insert to authenticated with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:create'));
create policy rls_invoices_update on public.clinic_invoices for update to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:update'));
create policy rls_invoices_delete on public.clinic_invoices for delete to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'invoices:cancel'));

drop policy if exists rls_inventory_items_insert on public.inventory_items; drop policy if exists rls_inventory_items_update on public.inventory_items;
create policy rls_inventory_items_insert on public.inventory_items for insert to authenticated with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:create'));
create policy rls_inventory_items_update on public.inventory_items for update to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:update')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:update'));
