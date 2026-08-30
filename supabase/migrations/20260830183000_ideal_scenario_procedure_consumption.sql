-- Procedure -> consumable inventory bridge for Scenario 40.
create or replace function public.consume_procedure_inventory(
 p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity numeric,p_consumed_by uuid,p_reason text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_stock numeric; v_new numeric;
begin
 if p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 if not exists(select 1 from clinic_visit_sessions where id=p_visit_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Visit not found'); end if;
 select current_stock into v_stock from inventory_items where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if v_stock is null then return jsonb_build_object('success',false,'error','Inventory item not found'); end if;
 if v_stock<p_quantity then return jsonb_build_object('success',false,'error','Insufficient stock'); end if;
 v_new:=v_stock-p_quantity;
 update inventory_items set current_stock=v_new,updated_at=now() where id=p_item_id and tenant_id=p_tenant_id;
 insert into inventory_ledger(tenant_id,item_id,material_name,quantity_consumed,consumption_type,notes,logged_by) select p_tenant_id,p_item_id,coalesce(p_reason,'procedure consumption'),p_quantity,'doctor_request',p_reason,p_consumed_by;
 return jsonb_build_object('success',true,'new_stock',v_new,'visit_id',p_visit_id,'treatment_plan_item_id',p_treatment_plan_item_id);
end;$$;
grant execute on function public.consume_procedure_inventory(uuid,uuid,uuid,uuid,numeric,uuid,text) to authenticated,service_role;
