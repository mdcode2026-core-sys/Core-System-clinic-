-- AJM acceptance-cycle security hardening.
-- Revoke direct API execution from anonymous callers and from trigger-only audit functions.
-- Authenticated execution remains for application RPCs that are intentionally used by the server/data layer.
revoke execute on function public.fn_audit_ajm1_changes() from anon, authenticated;
revoke execute on function public.fn_audit_followup_insert() from anon, authenticated;
revoke execute on function public.receive_purchase_order(uuid, uuid, uuid, jsonb) from anon;
revoke execute on function public.set_role_permissions(uuid, uuid[]) from anon;
