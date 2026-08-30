create or replace function public.enforce_followup_tenant_integrity()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from clinic_patients where id=new.patient_id and tenant_id=new.tenant_id and deleted_at is null) then raise exception 'FOLLOWUP_PATIENT_TENANT_MISMATCH'; end if;
 if new.session_id is not null and not exists(select 1 from clinic_visit_sessions where id=new.session_id and tenant_id=new.tenant_id and patient_id=new.patient_id and deleted_at is null) then raise exception 'FOLLOWUP_SESSION_TENANT_MISMATCH'; end if;
 if new.assigned_to is not null and not exists(select 1 from clinic_users where id=new.assigned_to and tenant_id=new.tenant_id and is_active and deleted_at is null) then raise exception 'FOLLOWUP_ASSIGNEE_TENANT_MISMATCH'; end if;
 if new.created_by is not null and not exists(select 1 from clinic_users where id=new.created_by and tenant_id=new.tenant_id and is_active and deleted_at is null) then raise exception 'FOLLOWUP_CREATOR_TENANT_MISMATCH'; end if;
 if new.updated_by is not null and not exists(select 1 from clinic_users where id=new.updated_by and tenant_id=new.tenant_id and is_active and deleted_at is null) then raise exception 'FOLLOWUP_UPDATER_TENANT_MISMATCH'; end if;
 return new;
end; $$;
drop trigger if exists trg_enforce_followup_tenant_integrity on retention_followups;
create trigger trg_enforce_followup_tenant_integrity before insert or update of patient_id,session_id,assigned_to,created_by,updated_by,tenant_id on retention_followups for each row execute function public.enforce_followup_tenant_integrity();

create or replace function public.bridge_completed_followup_to_next_action()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_work_id uuid;
begin
 if new.status<>'completed' or new.next_action_at is null and new.next_action_type is null then return new; end if;
 if tg_op='UPDATE' and old.status='completed' and old.next_action_at is not distinct from new.next_action_at and old.next_action_type is not distinct from new.next_action_type then return new; end if;
 select id into v_work_id from operational_work_items where tenant_id=new.tenant_id and source_type='retention_followup' and source_id=new.id and kind='next_action' and status not in('completed','cancelled') limit 1;
 if v_work_id is not null then return new; end if;
 insert into operational_work_items(tenant_id,kind,title,details,requester_clinic_user_id,patient_id,source_type,source_id,priority,status,due_at)
 values(new.tenant_id,'next_action','Follow-up next action',coalesce(new.next_action_type,'Continue patient journey'),new.updated_by,new.patient_id,'retention_followup',new.id,'normal','open',new.next_action_at) returning id into v_work_id;
 insert into operational_work_history(tenant_id,work_item_id,actor_clinic_user_id,from_status,to_status,note) values(new.tenant_id,v_work_id,new.updated_by,null,'open','created_from_completed_followup');
 return new;
end; $$;
drop trigger if exists trg_bridge_completed_followup_next_action on retention_followups;
create trigger trg_bridge_completed_followup_next_action after insert or update of status,next_action_at,next_action_type on retention_followups for each row execute function public.bridge_completed_followup_to_next_action();
