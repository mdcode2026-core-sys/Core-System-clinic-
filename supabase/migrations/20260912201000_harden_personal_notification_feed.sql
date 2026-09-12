-- Harden personal notification feed RPC: rely on RLS as the authorization boundary.
create or replace function public.get_personal_notification_feed(p_limit integer default 8)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tenant_id uuid := public.get_current_tenant_id();
  v_clinic_user_id uuid;
  v_limit integer := greatest(1, least(coalesce(p_limit, 8), 25));
  v_unread_count integer;
  v_items jsonb;
begin
  if auth.uid() is null or v_tenant_id is null then
    return jsonb_build_object('unread_count', 0, 'items', '[]'::jsonb);
  end if;
  select cu.id into v_clinic_user_id
  from public.clinic_users cu
  where cu.auth_user_id = auth.uid()
    and cu.tenant_id = v_tenant_id
    and cu.is_active = true
    and cu.deleted_at is null
  limit 1;
  if v_clinic_user_id is null then
    return jsonb_build_object('unread_count', 0, 'items', '[]'::jsonb);
  end if;
  select count(*)::integer into v_unread_count
  from public.notification_queue nq
  where nq.tenant_id = v_tenant_id
    and nq.channel = 'in_app'
    and nq.recipient_type = 'clinic_user'
    and nq.recipient_id = v_clinic_user_id
    and coalesce(nq.scheduled_at, nq.created_at, now()) <= now()
    and coalesce(nq.status, 'queued') not in ('failed', 'cancelled')
    and not exists (
      select 1 from public.notification_queue_read_receipts rr
      where rr.tenant_id = v_tenant_id
        and rr.notification_id = nq.id
        and rr.clinic_user_id = v_clinic_user_id
    );
  select coalesce(jsonb_agg(item order by item->>'created_at' desc), '[]'::jsonb)
  into v_items
  from (
    select jsonb_build_object(
      'id', nq.id,
      'title', coalesce(nq.metadata->>'title', nq.metadata->>'type', 'Notification'),
      'message', nq.message_body,
      'created_at', coalesce(nq.created_at, nq.scheduled_at, now()),
      'is_read', exists (
        select 1 from public.notification_queue_read_receipts rr
        where rr.tenant_id = v_tenant_id
          and rr.notification_id = nq.id
          and rr.clinic_user_id = v_clinic_user_id
      )
    ) as item
    from public.notification_queue nq
    where nq.tenant_id = v_tenant_id
      and nq.channel = 'in_app'
      and nq.recipient_type = 'clinic_user'
      and nq.recipient_id = v_clinic_user_id
      and coalesce(nq.scheduled_at, nq.created_at, now()) <= now()
      and coalesce(nq.status, 'queued') not in ('failed', 'cancelled')
    order by coalesce(nq.created_at, nq.scheduled_at, now()) desc
    limit v_limit
  ) recent;
  return jsonb_build_object('unread_count', v_unread_count, 'items', v_items);
end;
$$;

revoke execute on function public.get_personal_notification_feed(integer) from public;
grant execute on function public.get_personal_notification_feed(integer) to authenticated;
