-- CORE SYSTEM Financial & Inventory remediation: lock legacy non-canonical path.
-- Preserve legacy experimental inventory movement; classify it explicitly.
begin;
revoke execute on function public.apply_payment_to_installment(uuid,uuid,integer) from authenticated,anon,public;
update public.inventory_ledger set movement_type='legacy_unclassified' where source_type='legacy_untraceable' and movement_type<>'legacy_unclassified';
commit;
