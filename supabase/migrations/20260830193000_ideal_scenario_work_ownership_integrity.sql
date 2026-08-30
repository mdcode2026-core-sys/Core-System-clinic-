create or replace function public.enforce_operational_work_ownership()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.assignee_clinic_user_id is not null and not exists(select 1 from clinic_users where id=new.assignee_clinic_user_id and tenant_id=new.tenant_id and is_active and deleted_at is null) then raise exception 'WORK_ASSIGNEE_TENANT_MISMATCH'; end if;
 if new.requester_clinic_user_id is not null and not exists(select 1 from clinic_users where id=new.requester_clinic_user_id and tenant_id=new.tenant_id and is_active and deleted_at is null) then raise exception 'WORK_REQUESTER_TENANT_MISMATCH'; end if;
 if new.patient_id is not null and not exists(select 1 from clinic_patients where id=new.patient_id and tenant_id=new.tenant_id and deleted_at is null) then raise exception 'WORK_PATIENT_TENANT_MISMATCH'; end if;
 return new;
end; $$;
drop trigger if exists trg_enforce_operational_work_ownership on operational_work_items;
create trigger trg_enforce_operational_work_ownership before insert or update of assignee_clinic_user_id,requester_clinic_user_id,patient_id,tenant_id on operational_work_items for each row execute function public.enforce_operational_work_ownership();
