-- R08/R07 security boundary: supplier payment is an authenticated clinic operation.
revoke execute on function public.record_supplier_payment(uuid,uuid,integer,text,text,uuid) from anon;
grant execute on function public.record_supplier_payment(uuid,uuid,integer,text,text,uuid) to authenticated;
