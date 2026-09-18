-- Sensitive clinic operations and tenant-scoped diagnostics must not be callable anonymously.
revoke execute on function public.apply_payment_to_installment(uuid,uuid,integer) from anon;
revoke execute on function public.create_financial_plan_with_installments(uuid,uuid,uuid,integer,integer,integer,text,text,uuid,jsonb) from anon;
revoke execute on function public.create_manual_invoice(uuid,uuid,uuid,date,text,text,uuid,jsonb) from anon;
revoke execute on function public.create_purchase_order_with_items(uuid,uuid,text,date,date,text,uuid,jsonb) from anon;
revoke execute on function public.get_workforce_unavailability(uuid,uuid,timestamp with time zone,timestamp with time zone) from anon;
revoke execute on function public.record_invoice_payment_with_installment(uuid,uuid,integer,text,text,text,uuid,uuid) from anon;
revoke execute on function public.validate_ajm2_tenant_integrity() from anon;
revoke execute on function public.validate_procedure_resources_for_booking(uuid,uuid,uuid) from anon;
