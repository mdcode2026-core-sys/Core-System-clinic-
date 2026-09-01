-- Ideal Scenario implementation foundation: distinct Service, Package, Offer and patient package entitlement.
-- Mirrors the applied production migration 20260830140000_ideal_scenario_commercial_service_package_offer_foundation.

create table if not exists public.clinic_services(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 name text not null, name_ar text, description text, base_price_subunits integer not null default 0 check(base_price_subunits>=0),
 standard_duration_minutes smallint not null default 30 check(standard_duration_minutes>0), is_active boolean not null default true,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,name));
create table if not exists public.clinic_service_procedures(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 service_id uuid not null references public.clinic_services(id) on delete cascade, procedure_id uuid not null references public.clinic_procedures(id) on delete restrict,
 quantity integer not null default 1 check(quantity>0), created_at timestamptz not null default now(), unique(service_id,procedure_id));
create table if not exists public.clinic_packages(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 name text not null, name_ar text, description text, base_price_subunits integer not null default 0 check(base_price_subunits>=0),
 session_limit integer check(session_limit is null or session_limit>0), is_active boolean not null default true,
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(tenant_id,name));
create table if not exists public.clinic_package_items(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 package_id uuid not null references public.clinic_packages(id) on delete cascade, service_id uuid not null references public.clinic_services(id) on delete restrict,
 quantity integer not null default 1 check(quantity>0), session_limit integer check(session_limit is null or session_limit>0), created_at timestamptz not null default now(), unique(package_id,service_id));
create table if not exists public.clinic_offers(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 name text not null, description text, discount_type text not null check(discount_type in('percent','fixed')), discount_value integer not null check(discount_value>=0),
 service_id uuid references public.clinic_services(id) on delete cascade, package_id uuid references public.clinic_packages(id) on delete cascade,
 starts_on date, ends_on date, status text not null default 'active' check(status in('draft','active','inactive','expired')),
 created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(((service_id is not null)::int + (package_id is not null)::int)=1));
create table if not exists public.patient_packages(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 patient_id uuid not null references public.clinic_patients(id) on delete restrict, package_id uuid not null references public.clinic_packages(id) on delete restrict,
 financial_plan_id uuid references public.financial_plans(id) on delete set null, purchased_sessions integer check(purchased_sessions is null or purchased_sessions>0),
 consumed_sessions integer not null default 0 check(consumed_sessions>=0), status text not null default 'active' check(status in('active','completed','cancelled','expired')),
 purchased_at timestamptz not null default now(), created_by uuid references public.clinic_users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(purchased_sessions is null or consumed_sessions<=purchased_sessions));
create table if not exists public.patient_package_consumptions(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.master_tenants(id) on delete cascade,
 patient_package_id uuid not null references public.patient_packages(id) on delete cascade, treatment_plan_item_id uuid references public.clinic_treatment_plan_items(id) on delete set null,
 visit_id uuid references public.clinic_visit_sessions(id) on delete set null, quantity integer not null default 1 check(quantity>0), consumed_at timestamptz not null default now(), consumed_by uuid references public.clinic_users(id) on delete set null, notes text);
alter table public.financial_plans add column if not exists package_id uuid references public.clinic_packages(id) on delete set null;
alter table public.clinic_treatment_plans add column if not exists package_id uuid references public.clinic_packages(id) on delete set null;
create index if not exists clinic_services_tenant_idx on public.clinic_services(tenant_id,is_active);
create index if not exists clinic_service_procedures_service_idx on public.clinic_service_procedures(tenant_id,service_id);
create index if not exists clinic_packages_tenant_idx on public.clinic_packages(tenant_id,is_active);
create index if not exists clinic_package_items_package_idx on public.clinic_package_items(tenant_id,package_id);
create index if not exists clinic_offers_tenant_idx on public.clinic_offers(tenant_id,status);
create index if not exists patient_packages_patient_idx on public.patient_packages(tenant_id,patient_id,status);
create index if not exists patient_package_consumptions_package_idx on public.patient_package_consumptions(tenant_id,patient_package_id);
insert into public.permissions(permission_key,permission_name,description,resource,action) values
('services:read','View Services','View clinic services','services','read'),('services:manage','Manage Services','Configure clinic services and procedure composition','services','manage'),
('packages:read','View Packages','View clinic packages','packages','read'),('packages:manage','Manage Packages','Configure clinic packages','packages','manage'),('packages:sell','Sell Packages','Sell packages and create patient package entitlements','packages','sell'),
('offers:manage','Manage Offers','Configure commercial offers','offers','manage'),('offers:apply','Apply Offers','Apply configured offers to authorized commercial transactions','offers','apply') on conflict(permission_key) do nothing;
insert into public.role_permissions(role_id,permission_id) select r.id,p.id from public.roles r cross join public.permissions p where r.role_key in('clinic_admin','receptionist','accounting') and p.permission_key in('services:read','packages:read','packages:sell','offers:apply') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id) select r.id,p.id from public.roles r cross join public.permissions p where r.role_key='clinic_admin' and p.permission_key in('services:manage','packages:manage','offers:manage') on conflict do nothing;

alter table public.clinic_services enable row level security; alter table public.clinic_service_procedures enable row level security; alter table public.clinic_packages enable row level security;
alter table public.clinic_package_items enable row level security; alter table public.clinic_offers enable row level security; alter table public.patient_packages enable row level security; alter table public.patient_package_consumptions enable row level security;
create policy clinic_services_select on public.clinic_services for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'services:read') or public.has_tenant_permission(tenant_id,'services:manage')));
create policy clinic_services_write on public.clinic_services for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'services:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'services:manage'));
create policy clinic_service_procedures_select on public.clinic_service_procedures for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'services:read') or public.has_tenant_permission(tenant_id,'services:manage')));
create policy clinic_service_procedures_write on public.clinic_service_procedures for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'services:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'services:manage'));
create policy clinic_packages_select on public.clinic_packages for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'packages:read') or public.has_tenant_permission(tenant_id,'packages:manage') or public.has_tenant_permission(tenant_id,'packages:sell')));
create policy clinic_packages_write on public.clinic_packages for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:manage'));
create policy clinic_package_items_select on public.clinic_package_items for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'packages:read') or public.has_tenant_permission(tenant_id,'packages:manage') or public.has_tenant_permission(tenant_id,'packages:sell')));
create policy clinic_package_items_write on public.clinic_package_items for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:manage'));
create policy clinic_offers_select on public.clinic_offers for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'offers:manage') or public.has_tenant_permission(tenant_id,'offers:apply')));
create policy clinic_offers_write on public.clinic_offers for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'offers:manage')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'offers:manage'));
create policy patient_packages_select on public.patient_packages for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'packages:read') or public.has_tenant_permission(tenant_id,'packages:sell')));
create policy patient_packages_write on public.patient_packages for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:sell')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:sell'));
create policy patient_package_consumptions_select on public.patient_package_consumptions for select to authenticated using(tenant_id=public.get_current_tenant_id() and (public.has_tenant_permission(tenant_id,'packages:read') or public.has_tenant_permission(tenant_id,'packages:sell')));
create policy patient_package_consumptions_write on public.patient_package_consumptions for all to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:sell')) with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'packages:sell'));
grant select,insert,update,delete on public.clinic_services,public.clinic_service_procedures,public.clinic_packages,public.clinic_package_items,public.clinic_offers,public.patient_packages,public.patient_package_consumptions to authenticated;
grant all on public.clinic_services,public.clinic_service_procedures,public.clinic_packages,public.clinic_package_items,public.clinic_offers,public.patient_packages,public.patient_package_consumptions to service_role;
