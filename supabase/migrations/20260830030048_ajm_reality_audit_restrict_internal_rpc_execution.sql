-- Restrict internal SECURITY DEFINER RPCs that are not application-facing APIs.
-- These functions are called by trusted SQL/server flows and must not be directly invocable by signed-in users.
revoke execute on function public.run_followup_automation() from authenticated, anon;
revoke execute on function public.followup_automation_enabled(uuid) from authenticated, anon;
revoke execute on function public.has_effective_permission(text, uuid) from authenticated, anon;
revoke execute on function public.get_current_user_role() from authenticated, anon;
