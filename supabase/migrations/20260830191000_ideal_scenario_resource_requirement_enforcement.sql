-- Enforce Procedure -> Required Resource at the canonical Agenda persistence boundary.
create or replace function public.enforce_procedure_resource_requirement()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_required integer; v_matches integer;
begin
 if new.procedure_id is null then return new; end if;
 select count(*) into v_required from clinic_procedure_resources where tenant_id=new.tenant_id and procedure_id=new.procedure_id and required;
 if v_required=0 then return new; end if;
 if new.resource_id is null then raise exception 'AGENDA_RESOURCE_REQUIRED: procedure requires a configured resource'; end if;
 select count(*) into v_matches from clinic_procedure_resources where tenant_id=new.tenant_id and procedure_id=new.procedure_id and resource_id=new.resource_id and required;
 if v_matches<>v_required then raise exception 'AGENDA_RESOURCE_MISMATCH: selected resource does not satisfy procedure requirements'; end if;
 return new;
end; $$;
drop trigger if exists trg_enforce_procedure_resource_requirement on master_agenda_events;
create trigger trg_enforce_procedure_resource_requirement before insert or update of procedure_id,resource_id on master_agenda_events for each row execute function public.enforce_procedure_resource_requirement();
