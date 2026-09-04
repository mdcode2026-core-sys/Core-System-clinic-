-- CORE SYSTEM Financial & Inventory remediation: immutable invoice items after issue.
begin;
create or replace function public.guard_invoice_item_mutation() returns trigger language plpgsql set search_path to 'public' as $function$
declare v_invoice_id uuid; v_status text;
begin
 v_invoice_id:=case when tg_op='DELETE' then old.invoice_id else new.invoice_id end;
 select invoice_status into v_status from public.clinic_invoices where id=v_invoice_id;
 if v_status is null then raise exception 'Invoice not found'; end if;
 if v_status<>'draft' then raise exception 'Invoice items are immutable after issue; use an approved lifecycle operation'; end if;
 if tg_op='UPDATE' and old.invoice_id is distinct from new.invoice_id then raise exception 'Invoice item cannot be moved between invoices'; end if;
 return case when tg_op='DELETE' then old else new end;
end;
$function$;
drop trigger if exists trg_guard_invoice_item_mutation on public.invoice_items;
create trigger trg_guard_invoice_item_mutation before insert or update or delete on public.invoice_items for each row execute function public.guard_invoice_item_mutation();
commit;
