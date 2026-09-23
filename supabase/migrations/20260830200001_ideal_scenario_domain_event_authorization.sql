create or replace function public.create_operational_work_from_domain_event(p_tenant_id uuid,p_event_type text,p_source_type text,p_source_id uuid,p_patient_id uuid,p_title text,p_required_permission text,p_requested_by uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if public.get_current_tenant_id() is distinct from p_tenant_id then return jsonb_build_object('success',false,'error','Tenant mismatch'); end if;
 if p_required_permission is null or trim(p_required_permission)='' then return jsonb_build_object('success',false,'error','Required permission is missing'); end if;
 if not public.has_tenant_permission(p_tenant_id,p_required_permission) then return jsonb_build_object('success',false,'error','Permission denied'); end if;
 if not exists(select 1 from clinic_users where id=p_requested_by and tenant_id=p_tenant_id and is_active and deleted_at is null) then return jsonb_build_object('success',false,'error','Invalid requester'); end if;
 if p_patient_id is not null and not exists(select 1 from clinic_patients where id=p_patient_id and tenant_id=p_tenant_id and deleted_at is null) then return jsonb_build_object('success',false,'error','Invalid patient'); end if;
 select id into v_id from operational_work_items where tenant_id=p_tenant_id and kind='domain_event' and source_type=p_source_type and source_id=p_source_id and status not in('completed','cancelled') limit 1;
 if v_id is not null then return jsonb_build_object('success',true,'work_item_id',v_id,'idempotent',true); end if;
 insert into operational_work_items(tenant_id,kind,title,details,requester_clinic_user_id,patient_id,source_type,source_id,priority,status)
 values(p_tenant_id,'domain_event',p_title,p_event_type||' · required permission: '||p_required_permission,p_requested_by,p_patient_id,p_source_type,p_source_id,'normal','open') returning id into v_id;
 insert into operational_work_history(tenant_id,work_item_id,actor_clinic_user_id,from_status,to_status,note) values(p_tenant_id,v_id,p_requested_by,null,'open','created_from_domain_event:'||p_event_type);
 return jsonb_build_object('success',true,'work_item_id',v_id,'idempotent',false);
end; $$;
grant execute on function public.create_operational_work_from_domain_event(uuid,text,text,uuid,uuid,text,text,uuid) to authenticated,service_role;
