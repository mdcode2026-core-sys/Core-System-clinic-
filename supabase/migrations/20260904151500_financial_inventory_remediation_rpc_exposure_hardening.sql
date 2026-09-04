-- CORE SYSTEM Financial & Inventory RPC exposure hardening
-- Contract: docs/FINANCIAL-INVENTORY-REMEDIATION-CONTRACT-2026-09-04.md
begin;
revoke execute on function public.adjust_inventory_stock(uuid,uuid,integer,text,text,uuid,uuid,uuid,uuid,uuid,text) from public,anon;
grant execute on function public.adjust_inventory_stock(uuid,uuid,integer,text,text,uuid,uuid,uuid,uuid,uuid,text) to authenticated;
revoke execute on function public.adjust_inventory_stock(uuid,uuid,integer) from authenticated,anon,public;
revoke execute on function public.apply_payment_to_installment(uuid,uuid,integer,text,text,uuid) from public,anon;
grant execute on function public.apply_payment_to_installment(uuid,uuid,integer,text,text,uuid) to authenticated;
commit;
