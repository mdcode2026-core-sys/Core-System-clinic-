-- Harden Workforce sensitive RPC execution.
-- Client-facing mutation RPCs remain available to authenticated callers and
-- enforce tenant membership/permission checks in their function bodies.
-- The internal Agenda trigger function is not directly executable by clients.

revoke execute on function public.approve_workforce_leave_request(uuid, uuid, text) from public, anon;
revoke execute on function public.promote_workforce_candidate_to_employee(uuid, uuid, uuid, date) from public, anon;
revoke execute on function public.prevent_agenda_during_workforce_unavailability() from public, anon, authenticated;

grant execute on function public.approve_workforce_leave_request(uuid, uuid, text) to authenticated;
grant execute on function public.promote_workforce_candidate_to_employee(uuid, uuid, uuid, date) to authenticated;

do $$
begin
  if has_function_privilege('anon', 'public.approve_workforce_leave_request(uuid,uuid,text)', 'EXECUTE') then
    raise exception 'anon execute still granted on approve_workforce_leave_request';
  end if;
  if has_function_privilege('anon', 'public.promote_workforce_candidate_to_employee(uuid,uuid,uuid,date)', 'EXECUTE') then
    raise exception 'anon execute still granted on promote_workforce_candidate_to_employee';
  end if;
  if has_function_privilege('anon', 'public.prevent_agenda_during_workforce_unavailability()', 'EXECUTE') then
    raise exception 'anon execute still granted on prevent_agenda_during_workforce_unavailability';
  end if;
end
$$;
