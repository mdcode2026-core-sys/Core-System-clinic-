-- AJM-7 cross-domain links. These references preserve source-domain ownership.

alter table public.communication_requests add column if not exists work_item_id uuid;
alter table public.communication_requests add constraint communication_requests_work_item_same_tenant_fk foreign key (tenant_id,work_item_id) references public.operational_work_items(tenant_id,id) on delete set null;
create index if not exists communication_requests_work_item_idx on public.communication_requests(tenant_id,work_item_id);

alter table public.operational_work_items add column if not exists communication_request_id uuid;
alter table public.operational_work_items add constraint operational_work_items_communication_request_same_tenant_fk foreign key (tenant_id,communication_request_id) references public.communication_requests(tenant_id,id) on delete set null;
create index if not exists operational_work_items_communication_request_idx on public.operational_work_items(tenant_id,communication_request_id);

-- Context references for canonical appointment/treatment/follow-up/financial objects remain polymorphic source_type/source_id; no duplicate business record is created.
