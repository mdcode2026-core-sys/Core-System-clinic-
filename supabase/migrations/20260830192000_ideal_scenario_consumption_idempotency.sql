alter table inventory_ledger add column if not exists treatment_plan_item_id uuid;
create unique index if not exists uq_inventory_ledger_procedure_consumption on inventory_ledger(tenant_id,session_id,item_id,treatment_plan_item_id) where deleted_at is null and session_id is not null and item_id is not null and treatment_plan_item_id is not null;
create or replace function public.consume_procedure_inventory(p_tenant_id uuid,p_visit_id uuid,p_treatment_plan_item_id uuid,p_item_id uuid,p_quantity numeric,p_consumed_by uuid,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_stock numeric; v_new numeric; v_procedure_id uuid; v_existing uuid; v_patient_id uuid;
begin
 if p_quantity<=0 then return jsonb_build_object('success',false,'error','Quantity must be positive'); end if;
 select patient_id into v_patient_id from clinic_visit_sessions where id=p_visit_id and tenant_id=p_tenant_id and deleted_at is null;
 if not found then return jsonb_build_object('success',false,'error','Visit not found'); end if;
 if p_treatment_plan_item_id is not null then select procedure_id into v_procedure_id from clinic_treatment_plan_items where id=p_treatment_plan_item_id and tenant_id=p_tenant_id; end if;
 select id into v_existing from inventory_ledger where tenant_id=p_tenant_id and session_id=p_visit_id and item_id=p_item_id and treatment_plan_item_id=p_treatment_plan_item_id and deleted_at is null limit 1;
 if v_existing is not null then return jsonb_build_object('success',true,'idempotent',true,'ledger_id',v_existing,'patient_id',v_patient_id,'procedure_id',v_procedure_id); end if;
 select current_stock into v_stock from inventory_items where id=p_item_id and tenant_id=p_tenant_id and deleted_at is null for update;
 if v_stock is null then return jsonb_build_object('success',false,'error','Inventory item not found'); end if;
 if v_stock<p_quantity then return jsonb_build_object('success',false,'error','Insufficient stock'); end if;
 v_new:=v_stock-p_quantity;
 update inventory_items set current_stock=v_new,updated_at=now() where id=p_item_id and tenant_id=p_tenant_id;
 insert into inventory_ledger(tenant_id,item_id,procedure_id,treatment_plan_item_id,material_name,quantity_consumed,consumption_type,notes,logged_by,session_id)
 select p_tenant_id,p_item_id,v_procedure_id,p_treatment_plan_item_id,ii.name,p_quantity,'procedure_consumption',p_reason,p_consumed_by,p_visit_id from inventory_items ii where ii.id=p_item_id and ii.tenant_id=p_tenant_id returning id into v_existing;
 return jsonb_build_object('success',true,'idempotent',false,'ledger_id',v_existing,'new_stock',v_new,'visit_id',p_visit_id,'treatment_plan_item_id',p_treatment_plan_item_id,'patient_id',v_patient_id,'procedure_id',v_procedure_id);
exception when unique_violation then
 select id into v_existing from inventory_ledger where tenant_id=p_tenant_id and session_id=p_visit_id and item_id=p_item_id and treatment_plan_item_id=p_treatment_plan_item_id and deleted_at is null limit 1;
 return jsonb_build_object('success',true,'idempotent',true,'ledger_id',v_existing,'patient_id',v_patient_id,'procedure_id',v_procedure_id);
end; $$;
grant execute on function public.consume_procedure_inventory(uuid,uuid,uuid,uuid,numeric,uuid,text) to authenticated,service_role;
