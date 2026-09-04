-- Production reconciliation: purchase receipt batch/expiry flags are boolean values.
-- The canonical receive_purchase_order function declares and consumes both flags as boolean.
create or replace function public.receive_purchase_order(p_tenant_id uuid, p_purchase_order_id uuid, p_received_by uuid, p_items jsonb)
returns jsonb language plpgsql security definer set search_path='public' as $function$
declare v_order record; v_receipt_id uuid; v_item jsonb; v_poi record; v_qty integer; v_remaining integer; v_status text; v_obligation_id uuid; v_received_value integer; v_lot_id uuid; v_requires_batch boolean; v_requires_expiry boolean; v_lot_number text; v_expiry date; v_existing_obligation_id uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if not exists(select 1 from public.clinic_users where id=p_received_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Receiver does not belong to tenant'); end if;
 select * into v_order from public.purchase_orders where id=p_purchase_order_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Purchase order not found'); end if;
 if v_order.status in ('cancelled','received') then return jsonb_build_object('success',false,'error','Purchase order cannot receive in current status'); end if;
 if not exists(select 1 from public.suppliers where id=v_order.supplier_id and tenant_id=p_tenant_id) then return jsonb_build_object('success',false,'error','Supplier does not belong to tenant'); end if;
 insert into public.purchase_receipts(tenant_id,purchase_order_id,received_by) values(p_tenant_id,p_purchase_order_id,p_received_by) returning id into v_receipt_id;
 for v_item in select * from jsonb_array_elements(p_items) loop
  v_qty:=(v_item->>'quantity')::integer; if v_qty<=0 then raise exception 'Received quantity must be positive'; end if;
  select * into v_poi from public.purchase_order_items where id=(v_item->>'purchase_order_item_id')::uuid and purchase_order_id=p_purchase_order_id and tenant_id=p_tenant_id for update;
  if not found then raise exception 'Purchase order item not found'; end if;
  if v_poi.quantity_received+v_qty>v_poi.quantity_ordered then raise exception 'Received quantity exceeds ordered quantity'; end if;
  if not exists(select 1 from public.inventory_items where id=v_poi.inventory_item_id and tenant_id=p_tenant_id and deleted_at is null) then raise exception 'Inventory item does not belong to tenant'; end if;
  select requires_batch_tracking,requires_expiry_tracking into v_requires_batch,v_requires_expiry from public.inventory_items where id=v_poi.inventory_item_id and tenant_id=p_tenant_id;
  if (v_requires_batch or v_requires_expiry) and nullif(trim(v_item->>'lot_number'),'') is null then raise exception 'Lot number is required for this inventory item'; end if;
  if v_requires_expiry and nullif(v_item->>'expiry_date','') is null then raise exception 'Expiry date is required for this inventory item'; end if;
  insert into public.purchase_receipt_items(tenant_id,receipt_id,purchase_order_item_id,inventory_item_id,quantity_received) values(p_tenant_id,v_receipt_id,v_poi.id,v_poi.inventory_item_id,v_qty);
  update public.purchase_order_items set quantity_received=quantity_received+v_qty,updated_at=now() where id=v_poi.id;
  if nullif(trim(v_item->>'lot_number'),'') is not null then
   v_lot_number:=trim(v_item->>'lot_number'); v_expiry:=nullif(v_item->>'expiry_date','')::date;
   select id into v_lot_id from public.inventory_lots where tenant_id=p_tenant_id and inventory_item_id=v_poi.inventory_item_id and lot_number=v_lot_number and deleted_at is null for update;
   if v_lot_id is null then insert into public.inventory_lots(tenant_id,inventory_item_id,lot_number,expiry_date,quantity_on_hand,unit_cost_subunits,status) values(p_tenant_id,v_poi.inventory_item_id,v_lot_number,v_expiry,v_qty,v_poi.unit_cost_subunits,'active') returning id into v_lot_id; else update public.inventory_lots set quantity_on_hand=quantity_on_hand+v_qty,expiry_date=coalesce(v_expiry,expiry_date),unit_cost_subunits=coalesce(v_poi.unit_cost_subunits,unit_cost_subunits),status='active',updated_at=now() where id=v_lot_id; end if;
  end if;
  perform public.adjust_inventory_stock(p_item_id:=v_poi.inventory_item_id,p_tenant_id:=p_tenant_id,p_delta:=v_qty,p_movement_type:='purchase_receipt',p_source_type:='purchase_receipt',p_source_id:=v_receipt_id,p_actor_id:=p_received_by,p_reason:='Purchase receipt '||coalesce(v_order.order_number,v_order.id::text)||case when v_lot_id is null then '' else ' · lot '||v_lot_number end);
 end loop;
 select count(*) filter(where quantity_received<quantity_ordered) into v_remaining from public.purchase_order_items where purchase_order_id=p_purchase_order_id;
 v_status:=case when v_remaining=0 then 'received' else 'partially_received' end;
 update public.purchase_orders set status=v_status,updated_at=now() where id=p_purchase_order_id;
 select coalesce(sum(poi.quantity_received*poi.unit_cost_subunits),0) into v_received_value from public.purchase_order_items poi where poi.purchase_order_id=p_purchase_order_id and poi.tenant_id=p_tenant_id;
 if v_received_value>0 then
   select id into v_existing_obligation_id from public.supplier_obligations where tenant_id=p_tenant_id and purchase_order_id=p_purchase_order_id limit 1 for update;
   if v_existing_obligation_id is null then insert into public.supplier_obligations(tenant_id,supplier_id,purchase_order_id,amount_subunits,amount_paid_subunits,due_date,status,created_by) values(p_tenant_id,v_order.supplier_id,p_purchase_order_id,v_received_value,0,v_order.expected_date,'open',p_received_by) returning id into v_obligation_id; else update public.supplier_obligations set amount_subunits=v_received_value,updated_at=now() where id=v_existing_obligation_id returning id into v_obligation_id; end if;
 end if;
 return jsonb_build_object('success',true,'receipt_id',v_receipt_id,'status',v_status,'supplier_obligation_id',v_obligation_id,'received_value_subunits',v_received_value);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm);
end;
$function$;
revoke all on function public.receive_purchase_order(uuid,uuid,uuid,jsonb) from public,anon;
grant execute on function public.receive_purchase_order(uuid,uuid,uuid,jsonb) to authenticated;
