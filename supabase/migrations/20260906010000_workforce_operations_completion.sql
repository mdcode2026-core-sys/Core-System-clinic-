-- Workforce & Operations completion: leave approval bridge, recruitment promotion, Agenda enforcement.
-- Runtime was applied to the connected production Supabase project before this migration was committed.

create or replace function public.approve_workforce_leave_request(p_tenant_id uuid,p_leave_request_id uuid,p_decision text)
returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_request public.workforce_leave_requests%rowtype; v_clinic_user_id uuid; v_timezone text; v_block_id uuid;
begin
 select cu.id into v_clinic_user_id from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=p_tenant_id and cu.is_active=true and cu.deleted_at is null limit 1;
 if v_clinic_user_id is null then raise exception 'Unauthorized'; end if;
 if not public.has_tenant_permission(p_tenant_id,'workforce:leave') and not public.has_tenant_permission(p_tenant_id,'workforce:manage') then raise exception 'Permission denied'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid leave decision'; end if;
 select * into v_request from public.workforce_leave_requests where id=p_leave_request_id and tenant_id=p_tenant_id for update;
 if not found then raise exception 'Leave request not found'; end if;
 if v_request.status <> 'pending' then raise exception 'Leave request is already decided'; end if;
 update public.workforce_leave_requests set status=p_decision, approved_by=case when p_decision='approved' then v_clinic_user_id else null end, approved_at=case when p_decision='approved' then now() else null end, updated_at=now() where id=v_request.id and tenant_id=p_tenant_id;
 if p_decision='approved' then
   select coalesce(mt.timezone,'UTC') into v_timezone from public.master_tenants mt where mt.id=p_tenant_id;
   insert into public.workforce_unavailability_blocks(tenant_id,employee_id,absence_type,starts_at,ends_at,reason,status,created_by)
   values(p_tenant_id,v_request.employee_id,'leave',((v_request.starts_on::text||' 00:00:00')::timestamp at time zone coalesce(v_timezone,'UTC')),(((v_request.ends_on + 1)::text||' 00:00:00')::timestamp at time zone coalesce(v_timezone,'UTC')),v_request.reason,'approved',v_clinic_user_id)
   returning id into v_block_id;
 end if;
 return jsonb_build_object('success',true,'status',p_decision,'unavailability_block_id',v_block_id);
end; $$;
revoke all on function public.approve_workforce_leave_request(uuid,uuid,text) from public;
grant execute on function public.approve_workforce_leave_request(uuid,uuid,text) to authenticated;

create or replace function public.promote_workforce_candidate_to_employee(p_tenant_id uuid,p_candidate_id uuid,p_position_id uuid default null,p_hire_date date default current_date)
returns jsonb language plpgsql security definer set search_path=public,pg_catalog as $$
declare v_candidate public.workforce_candidates%rowtype; v_employee_id uuid; v_clinic_user_id uuid;
begin
 select cu.id into v_clinic_user_id from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=p_tenant_id and cu.is_active=true and cu.deleted_at is null limit 1;
 if v_clinic_user_id is null then raise exception 'Unauthorized'; end if;
 if not public.has_tenant_permission(p_tenant_id,'workforce:recruitment') and not public.has_tenant_permission(p_tenant_id,'workforce:manage') then raise exception 'Permission denied'; end if;
 select * into v_candidate from public.workforce_candidates where id=p_candidate_id and tenant_id=p_tenant_id for update;
 if not found then raise exception 'Candidate not found'; end if;
 if v_candidate.stage='hired' then raise exception 'Candidate already hired'; end if;
 insert into public.workforce_employees(tenant_id,first_name,last_name,phone,email,position_id,hire_date,status,created_by)
 values(p_tenant_id,v_candidate.first_name,v_candidate.last_name,v_candidate.phone,v_candidate.email,p_position_id,p_hire_date,'active',v_clinic_user_id)
 returning id into v_employee_id;
 update public.workforce_candidates set stage='hired',updated_at=now() where id=v_candidate.id and tenant_id=p_tenant_id;
 return jsonb_build_object('success',true,'employee_id',v_employee_id);
end; $$;
revoke all on function public.promote_workforce_candidate_to_employee(uuid,uuid,uuid,date) from public;
grant execute on function public.promote_workforce_candidate_to_employee(uuid,uuid,uuid,date) to authenticated;

create or replace function public.prevent_agenda_during_workforce_unavailability()
returns trigger language plpgsql security definer set search_path=public,pg_catalog as $$
begin
 if new.doctor_id is not null and new.deleted_at is null and coalesce(new.status,'') not in ('cancelled','canceled') then
   if exists(select 1 from public.workforce_employees e join public.workforce_unavailability_blocks b on b.employee_id=e.id where e.tenant_id=new.tenant_id and e.user_id=new.doctor_id and b.tenant_id=new.tenant_id and b.status='approved' and b.starts_at < coalesce(new.buffer_end,new.scheduled_end) and b.ends_at > new.scheduled_start) then
     raise exception 'Doctor is unavailable during the selected time because of an approved workforce absence';
   end if;
 end if;
 return new;
end; $$;
drop trigger if exists trg_agenda_workforce_unavailability on public.master_agenda_events;
create trigger trg_agenda_workforce_unavailability before insert or update of doctor_id,scheduled_start,scheduled_end,buffer_end,status,deleted_at on public.master_agenda_events for each row execute function public.prevent_agenda_during_workforce_unavailability();
