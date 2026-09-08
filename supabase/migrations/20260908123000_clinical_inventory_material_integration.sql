-- CORE: Procedure -> Inventory Material integration.
-- A preparation/issue is a reservation; actual consumption changes physical stock.

create table public.clinic_procedure_inventory_requirements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  procedure_id uuid not null references public.clinic_procedures(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  standard_quantity integer not null check (standard_quantity > 0),
  required boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, procedure_id, inventory_item_id)
);
create index clinic_proc_inv_req_proc_idx on public.clinic_procedure_inventory_requirements(tenant_id, procedure_id);
create index clinic_proc_inv_req_item_idx on public.clinic_procedure_inventory_requirements(tenant_id, inventory_item_id);
alter table public.clinic_procedure_inventory_requirements enable row level security;
revoke all on table public.clinic_procedure_inventory_requirements from anon;
grant select,insert,update,delete on public.clinic_procedure_inventory_requirements to authenticated;
grant all on public.clinic_procedure_inventory_requirements to service_role;
create policy clinic_proc_inv_req_select on public.clinic_procedure_inventory_requirements for select to authenticated using (tenant_id=public.get_current_tenant_id());
create policy clinic_proc_inv_req_insert on public.clinic_procedure_inventory_requirements for insert to authenticated with check (tenant_id=public.get_current_tenant_id());
create policy clinic_proc_inv_req_update on public.clinic_procedure_inventory_requirements for update to authenticated using (tenant_id=public.get_current_tenant_id()) with check (tenant_id=public.get_current_tenant_id());
create policy clinic_proc_inv_req_delete on public.clinic_procedure_inventory_requirements for delete to authenticated using (tenant_id=public.get_current_tenant_id());

create table public.inventory_procedure_issues (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.master_tenants(id) on delete cascade,
  visit_id uuid not null references public.clinic_visit_sessions(id) on delete restrict,
  treatment_plan_item_id uuid references public.clinic_treatment_plan_items(id) on delete restrict,
  procedure_id uuid references public.clinic_procedures(id) on delete restrict,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity_issued integer not null check (quantity_issued>0),
  quantity_consumed integer not null default 0 check (quantity_consumed>=0),
  quantity_returned integer not null default 0 check (quantity_returned>=0),
  status text not null default 'issued' check (status in ('issued','partially_used','returned','closed')),
  issued_by uuid not null references public.clinic_users(id),
  issued_at timestamptz not null default now(),
  closed_at timestamptz,
  returned_by uuid references public.clinic_users(id),
  returned_at timestamptz,
  notes text,
  constraint inventory_issue_balance_check check (quantity_consumed+quantity_returned<=quantity_issued)
);
create index inventory_proc_issue_visit_idx on public.inventory_procedure_issues(tenant_id,visit_id);
create index inventory_proc_issue_item_idx on public.inventory_procedure_issues(tenant_id,inventory_item_id,status);
alter table public.inventory_procedure_issues enable row level security;
revoke all on public.inventory_procedure_issues from anon;
grant select,insert,update on public.inventory_procedure_issues to authenticated;
grant all on public.inventory_procedure_issues to service_role;
create policy inventory_proc_issue_select on public.inventory_procedure_issues for select to authenticated using (tenant_id=public.get_current_tenant_id());
create policy inventory_proc_issue_insert on public.inventory_procedure_issues for insert to authenticated with check (tenant_id=public.get_current_tenant_id());
create policy inventory_proc_issue_update on public.inventory_procedure_issues for update to authenticated using (tenant_id=public.get_current_tenant_id()) with check (tenant_id=public.get_current_tenant_id());

alter table public.inventory_ledger drop constraint if exists inventory_ledger_movement_type_check;
alter table public.inventory_ledger add constraint inventory_ledger_movement_type_check check (movement_type=any(array['purchase_receipt','purchase_return','procedure_issue','procedure_consumption','unused_return','adjustment','legacy_unclassified']));

create or replace function public.issue_procedure_inventory(p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity integer,p_issued_by uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_item public.inventory_items%rowtype; v_visit public.clinic_visit_sessions%rowtype; v_procedure_id uuid; v_available integer; v_issue_id uuid; v_actor uuid;
begin
 select cu.id into v_actor from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=p_tenant_id and cu.is_active and cu.deleted_at is null limit 1;
 if v_actor is null or not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 select * into v_visit from public.clinic_visit_sessions where id=p_visit_id and tenant_id=p_tenant_id and deleted_at is null;
 if not found then return jsonb_build_object('success',false,'error','Visit not found'); end if;
 select * into v_item from public.inventory_items where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if not found then return jsonb_build_object('success',false,'error','Inventory item not found'); end if;
 if not v_item.is_procedure_material then return jsonb_build_object('success',false,'error','Item is not configured as a procedure material'); end if;
 v_available:=v_item.current_stock-coalesce((select sum(quantity_issued-quantity_consumed-quantity_returned) from public.inventory_procedure_issues where tenant_id=p_tenant_id and inventory_item_id=p_item_id and status in ('issued','partially_used')),0);
 if v_available<p_quantity then return jsonb_build_object('success',false,'error','Insufficient available stock'); end if;
 if p_treatment_plan_item_id is not null then select procedure_id into v_procedure_id from public.clinic_treatment_plan_items where id=p_treatment_plan_item_id and tenant_id=p_tenant_id and deleted_at is null; else select procedure_id into v_procedure_id from public.master_agenda_events where id=v_visit.agenda_event_id and tenant_id=p_tenant_id; end if;
 insert into public.inventory_procedure_issues(tenant_id,visit_id,treatment_plan_item_id,procedure_id,inventory_item_id,quantity_issued,issued_by,notes) values(p_tenant_id,p_visit_id,p_treatment_plan_item_id,v_procedure_id,p_item_id,p_quantity,v_actor,nullif(trim(p_reason),'')) returning id into v_issue_id;
 insert into public.inventory_ledger(tenant_id,item_id,procedure_id,material_name,quantity_consumed,consumption_type,logged_by,session_id,treatment_plan_item_id,quantity_delta,movement_type,source_type,source_id,notes) values(p_tenant_id,p_item_id,v_procedure_id,v_item.name,p_quantity,'doctor_request',v_actor,p_visit_id,p_treatment_plan_item_id,0,'procedure_issue','procedure_session',v_issue_id,nullif(trim(p_reason),''));
 return jsonb_build_object('success',true,'issue_id',v_issue_id,'available_after',v_available-p_quantity);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

create or replace function public.consume_issued_procedure_inventory(p_tenant_id uuid,p_issue_id uuid,p_quantity integer,p_consumed_by uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_issue public.inventory_procedure_issues%rowtype; v_item public.inventory_items%rowtype; v_remaining integer; v_new_stock integer; v_actor uuid; v_ledger_id uuid;
begin
 select cu.id into v_actor from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=p_tenant_id and cu.is_active and cu.deleted_at is null limit 1;
 if v_actor is null or not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 select * into v_issue from public.inventory_procedure_issues where id=p_issue_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Issue not found'); end if;
 v_remaining:=v_issue.quantity_issued-v_issue.quantity_consumed-v_issue.quantity_returned;
 if p_quantity>v_remaining then return jsonb_build_object('success',false,'error','Quantity exceeds issued remainder'); end if;
 select * into v_item from public.inventory_items where id=v_issue.inventory_item_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if not found or v_item.current_stock<p_quantity then return jsonb_build_object('success',false,'error','Insufficient stock'); end if;
 v_new_stock:=v_item.current_stock-p_quantity; perform set_config('core.inventory_stock_mutation','1',true);
 update public.inventory_items set current_stock=v_new_stock,updated_at=now() where id=v_item.id and tenant_id=p_tenant_id;
 update public.inventory_procedure_issues set quantity_consumed=quantity_consumed+p_quantity,status=case when quantity_consumed+p_quantity+quantity_returned=quantity_issued then 'closed' else 'partially_used' end,closed_at=case when quantity_consumed+p_quantity+quantity_returned=quantity_issued then now() else null end where id=p_issue_id and tenant_id=p_tenant_id;
 insert into public.inventory_ledger(tenant_id,item_id,procedure_id,material_name,quantity_consumed,consumption_type,logged_by,session_id,treatment_plan_item_id,quantity_delta,movement_type,source_type,source_id,notes,unit_cost_subunits,cost_total_subunits) values(p_tenant_id,v_item.id,v_issue.procedure_id,v_item.name,p_quantity,'doctor_request',v_actor,v_issue.visit_id,v_issue.treatment_plan_item_id,-p_quantity,'procedure_consumption','procedure_session',p_issue_id,nullif(trim(p_reason),''),v_item.valuation_cost_subunits,coalesce(v_item.valuation_cost_subunits,0)*p_quantity) returning id into v_ledger_id;
 return jsonb_build_object('success',true,'ledger_id',v_ledger_id,'new_stock',v_new_stock);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

create or replace function public.return_unused_procedure_inventory(p_tenant_id uuid,p_issue_id uuid,p_quantity integer,p_returned_by uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_issue public.inventory_procedure_issues%rowtype; v_item public.inventory_items%rowtype; v_remaining integer; v_actor uuid; v_ledger_id uuid;
begin
 select cu.id into v_actor from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=p_tenant_id and cu.is_active and cu.deleted_at is null limit 1;
 if v_actor is null or not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 select * into v_issue from public.inventory_procedure_issues where id=p_issue_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Issue not found'); end if;
 v_remaining:=v_issue.quantity_issued-v_issue.quantity_consumed-v_issue.quantity_returned;
 if p_quantity>v_remaining then return jsonb_build_object('success',false,'error','Return exceeds unused issued quantity'); end if;
 select * into v_item from public.inventory_items where id=v_issue.inventory_item_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if not found then return jsonb_build_object('success',false,'error','Inventory item not found'); end if;
 update public.inventory_procedure_issues set quantity_returned=quantity_returned+p_quantity,returned_by=v_actor,returned_at=now(),status=case when quantity_consumed+quantity_returned+p_quantity=quantity_issued then 'returned' else 'partially_used' end,closed_at=case when quantity_consumed+quantity_returned+p_quantity=quantity_issued then now() else closed_at end where id=p_issue_id and tenant_id=p_tenant_id;
 insert into public.inventory_ledger(tenant_id,item_id,procedure_id,material_name,quantity_consumed,consumption_type,logged_by,session_id,treatment_plan_item_id,quantity_delta,movement_type,source_type,source_id,notes,unit_cost_subunits,cost_total_subunits) values(p_tenant_id,v_item.id,v_issue.procedure_id,v_item.name,p_quantity,'unused_return',v_actor,v_issue.visit_id,v_issue.treatment_plan_item_id,p_quantity,'unused_return','unused_return',p_issue_id,nullif(trim(p_reason),''),v_item.valuation_cost_subunits,coalesce(v_item.valuation_cost_subunits,0)*p_quantity) returning id into v_ledger_id;
 return jsonb_build_object('success',true,'ledger_id',v_ledger_id,'returned',p_quantity);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm); end; $$;

revoke execute on function public.issue_procedure_inventory(uuid,uuid,uuid,uuid,integer,uuid,text) from public,anon;
revoke execute on function public.consume_issued_procedure_inventory(uuid,uuid,integer,uuid,text) from public,anon;
revoke execute on function public.return_unused_procedure_inventory(uuid,uuid,integer,uuid,text) from public,anon;
grant execute on function public.issue_procedure_inventory(uuid,uuid,uuid,uuid,integer,uuid,text) to authenticated,service_role;
grant execute on function public.consume_issued_procedure_inventory(uuid,uuid,integer,uuid,text) to authenticated,service_role;
grant execute on function public.return_unused_procedure_inventory(uuid,uuid,integer,uuid,text) to authenticated,service_role;
