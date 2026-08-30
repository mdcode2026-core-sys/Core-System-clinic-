create or replace function public.validate_procedure_resources_for_booking(p_tenant_id uuid,p_procedure_id uuid,p_resource_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_required integer; v_matches integer;
begin
 select count(*) into v_required from clinic_procedure_resources where tenant_id=p_tenant_id and procedure_id=p_procedure_id and required;
 if v_required=0 then return jsonb_build_object('valid',true,'required_count',0); end if;
 if p_resource_id is null then return jsonb_build_object('valid',false,'error','Required procedure resource missing','required_count',v_required); end if;
 select count(*) into v_matches from clinic_procedure_resources where tenant_id=p_tenant_id and procedure_id=p_procedure_id and resource_id=p_resource_id and required;
 return jsonb_build_object('valid',v_matches=v_required,'required_count',v_required,'matched_count',v_matches);
end;$$;
grant execute on function public.validate_procedure_resources_for_booking(uuid,uuid,uuid) to authenticated,service_role;
