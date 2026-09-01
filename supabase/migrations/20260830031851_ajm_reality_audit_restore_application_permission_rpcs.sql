-- Restore application-facing permission helper execution after runtime verification.
-- These helpers are intentionally callable by authenticated clients because analytics/feature-flag server paths invoke them through the authenticated Supabase session.
grant execute on function public.get_current_user_role() to authenticated;
grant execute on function public.has_effective_permission(text, uuid) to authenticated;
grant execute on function public.has_tenant_permission(uuid, text) to authenticated;
