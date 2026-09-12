-- Keep the personal notification feed RPC authenticated-only.
revoke execute on function public.get_personal_notification_feed(integer) from anon;
revoke execute on function public.get_personal_notification_feed(integer) from public;
grant execute on function public.get_personal_notification_feed(integer) to authenticated;
