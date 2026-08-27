-- AJM-2 purchasing/receiving and inventory security

drop policy if exists rls_inventory_isolation on public.inventory_ledger;
create policy rls_inventory_ledger_select on public.inventory_ledger for select to authenticated using(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:read'));
create policy rls_inventory_ledger_insert on public.inventory_ledger for insert to authenticated with check(tenant_id=public.get_current_tenant_id() and public.has_tenant_permission(tenant_id,'inventory:adjust'));

create or replace function public.receive_purchase_order(p_tenant_id uuid,p_purchase_order_id uuid,p_received_by uuid,p_items jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_order record; v_receipt_id uuid; v_item jsonb; v_poi record; v_qty integer; v_remaining integer; v_status text;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if not public.has_tenant_permission(p_tenant_id,'purchasing:manage') then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 select * into v_order from public.purchase_orders where id=p_purchase_order_id and tenant_id=p_tenant_id for update;
 if not found then return jsonb_build_object('success',false,'error','Purchase order not found'); end if;
 if v_order.status in('cancelled','received') then return jsonb_build_object('success',false,'error','Purchase order cannot receive in current status'); end if;
 insert into public.purchase_receipts(tenant_id,purchase_order_id,received_by) values(p_tenant_id,p_purchase_order_id,p_received_by) returning id into v_receipt_id;
 for v_item in select * from jsonb_array_elements(p_items) loop
   v_qty:=(v_item->>'quantity')::integer;
   if v_qty<=0 then raise exception 'Received quantity must be positive'; end if;
   select * into v_poi from public.purchase_order_items where id=(v_item->>'purchase_order_item_id')::uuid and purchase_order_id=p_purchase_order_id and tenant_id=p_tenant_id for update;
   if not found then raise exception 'Purchase order item not found'; end if;
   if v_poi.quantity_received+v_qty>v_poi.quantity_ordered then raise exception 'Received quantity exceeds ordered quantity'; end if;
   insert into public.purchase_receipt_items(tenant_id,receipt_id,purchase_order_item_id,inventory_item_id,quantity_received) values(p_tenant_id,v_receipt_id,v_poi.id,v_poi.inventory_item_id,v_qty);
   update public.purchase_order_items set quantity_received=quantity_received+v_qty,updated_at=now() where id=v_poi.id;
   perform public.adjust_inventory_stock(v_poi.inventory_item_id,p_tenant_id,v_qty);
   insert into public.inventory_ledger(tenant_id,item_id,material_name,quantity_consumed,consumption_type,notes,logged_by) values(p_tenant_id,v_poi.inventory_item_id,'Purchase receipt',v_qty,'purchase','Purchase order '||coalesce(v_order.order_number,v_order.id::text),p_received_by);
 end loop;
 select count(*) filter(where quantity_received<quantity_ordered) into v_remaining from public.purchase_order_items where purchase_order_id=p_purchase_order_id;
 v_status:=case when v_remaining=0 then 'received' else 'partially_received' end;
 update public.purchase_orders set status=v_status,updated_at=now() where id=p_purchase_order_id;
 return jsonb_build_object('success',true,'receipt_id',v_receipt_id,'status',v_status);
exception when others then return jsonb_build_object('success',false,'error',sqlerrm);
end; $$;
