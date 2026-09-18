-- CORE SYSTEM Financial & Inventory RPC exposure hardening.
begin;
revoke execute on function public.adjust_inventory_stock(uuid,uuid,integer,text,text,uuid,uuid,uuid,uuid,uuid,text) from public,anon;
grant execute on function public.adjust_inventory_stock(uuid,uuid,integer,text,text,uuid,uuid,uuid,uuid,uuid,text) to authenticated;
do $ begin
  if to_regprocedure('public.adjust_inventory_stock(uuid,uuid,integer)') is not null then
    revoke execute on function public.adjust_inventory_stock(uuid,uuid,integer) from authenticated,anon,public;
  end if;
end $;
revoke execute on function public.apply_payment_to_installment(uuid,uuid,integer,text,text,uuid) from public,anon;
grant execute on function public.apply_payment_to_installment(uuid,uuid,integer,text,text,uuid) to authenticated;
commit;
