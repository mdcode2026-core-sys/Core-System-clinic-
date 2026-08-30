revoke all on function public.consume_procedure_inventory(uuid,uuid,uuid,uuid,numeric,uuid,text) from public,anon;
revoke all on function public.create_operational_work_from_domain_event(uuid,text,text,uuid,uuid,text,text,uuid) from public,anon;
revoke all on function public.execute_commercial_sale(uuid,uuid,uuid,uuid,uuid,uuid,uuid) from public,anon;
revoke all on function public.reconcile_insurance_claim(uuid,uuid,integer,integer,uuid) from public,anon;
grant execute on function public.consume_procedure_inventory(uuid,uuid,uuid,uuid,numeric,uuid,text) to authenticated,service_role;
grant execute on function public.create_operational_work_from_domain_event(uuid,text,text,uuid,uuid,text,text,uuid) to authenticated,service_role;
grant execute on function public.execute_commercial_sale(uuid,uuid,uuid,uuid,uuid,uuid,uuid) to authenticated,service_role;
grant execute on function public.reconcile_insurance_claim(uuid,uuid,integer,integer,uuid) to authenticated,service_role;
