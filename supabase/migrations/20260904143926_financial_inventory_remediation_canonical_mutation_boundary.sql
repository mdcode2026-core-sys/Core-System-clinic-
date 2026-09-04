-- Canonical stock mutation boundary: direct current_stock writes are blocked.
begin;
create or replace function public.guard_inventory_stock_write() returns trigger language plpgsql set search_path to 'public' as $function$
begin
 if new.current_stock is distinct from old.current_stock and coalesce(current_setting('core.inventory_stock_mutation',true),'')<>'1' then raise exception 'Current stock is controlled by the canonical inventory movement operation'; end if;
 return new;
end;
$function$;
drop trigger if exists trg_guard_inventory_stock_write on public.inventory_items;
create trigger trg_guard_inventory_stock_write before update on public.inventory_items for each row execute function public.guard_inventory_stock_write();
create or replace function public.adjust_inventory_stock(p_item_id uuid,p_tenant_id uuid,p_delta integer,p_movement_type text default null,p_source_type text default null,p_source_id uuid default null,p_procedure_id uuid default null,p_session_id uuid default null,p_treatment_plan_item_id uuid default null,p_actor_id uuid default null,p_reason text default null) returns integer language plpgsql security definer set search_path to 'public' as $function$
declare v_new_stock integer; v_actor uuid; v_consumption_type varchar; v_unit_cost integer;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then raise exception 'Tenant mismatch'; end if;
 if not public.has_tenant_permission(p_tenant_id,'inventory:adjust') then raise exception 'Permission denied'; end if;
 if p_delta=0 then raise exception 'Inventory delta must not be zero'; end if;
 v_actor:=coalesce(p_actor_id,auth.uid()); if v_actor is not null and not exists(select 1 from public.clinic_users where id=v_actor and tenant_id=p_tenant_id and is_active and deleted_at is null) then raise exception 'Actor does not belong to tenant'; end if;
 if p_source_type is not null and p_source_type not in ('purchase_receipt','purchase_return','procedure_session','treatment_plan_item','unused_return','manual_adjustment','legacy_untraceable') then raise exception 'Invalid inventory source type'; end if;
 p_source_type:=coalesce(p_source_type,'manual_adjustment');
 p_movement_type:=coalesce(p_movement_type,case when p_source_type='purchase_receipt' then 'purchase_receipt' when p_source_type='purchase_return' then 'purchase_return' when p_source_type in ('procedure_session','treatment_plan_item') then 'procedure_consumption' when p_source_type='unused_return' then 'unused_return' else 'adjustment' end);
 if p_movement_type not in ('purchase_receipt','purchase_return','procedure_consumption','unused_return','adjustment') then raise exception 'Invalid inventory movement type'; end if;
 select valuation_cost_subunits into v_unit_cost from public.inventory_items where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null for update; if not found then raise exception 'Inventory item not found'; end if;
 perform set_config('core.inventory_stock_mutation','1',true);
 update public.inventory_items set current_stock=current_stock+p_delta,updated_at=now() where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null and current_stock+p_delta>=0 returning current_stock into v_new_stock;
 if v_new_stock is null then raise exception 'Insufficient stock: adjustment would result in negative stock'; end if;
 v_consumption_type:=case when p_movement_type='purchase_receipt' then 'purchase' when p_movement_type='purchase_return' then 'purchase_return' when p_movement_type='procedure_consumption' then 'doctor_request' when p_movement_type='unused_return' then 'unused_return' when p_delta>0 then 'inventory_adjustment_increase' else 'inventory_adjustment_decrease' end;
 insert into public.inventory_ledger(tenant_id,item_id,procedure_id,material_name,quantity_consumed,consumption_type,logged_by,session_id,notes,treatment_plan_item_id,quantity_delta,movement_type,source_type,source_id,unit_cost_subunits,cost_total_subunits) select p_tenant_id,p_item_id,p_procedure_id,i.name,abs(p_delta)::numeric,v_consumption_type,v_actor,p_session_id,p_reason,p_treatment_plan_item_id,p_delta,p_movement_type,p_source_type,p_source_id,v_unit_cost,case when v_unit_cost is null then null else abs(p_delta)*v_unit_cost end from public.inventory_items i where i.id=p_item_id and i.tenant_id=p_tenant_id;
 return v_new_stock;
end;
$function$;
revoke insert,update,delete,truncate,references,trigger on public.inventory_ledger from anon,authenticated;
revoke insert,update,delete,truncate,references,trigger on public.invoice_payments from anon,authenticated;
commit;
