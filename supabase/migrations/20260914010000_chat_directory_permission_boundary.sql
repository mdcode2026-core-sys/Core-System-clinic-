-- Restore the authoritative Communications send-permission boundary on the
-- SECURITY DEFINER chat directory. The directory is a Chat capability surface,
-- so authenticated users without communications:send must not receive staff data.

create or replace function public.get_internal_chat_directory(p_query text default '')
returns table (
  user_id uuid,
  full_name text,
  email text,
  role text,
  conversation_id uuid,
  last_message text,
  last_message_at timestamptz,
  unread_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select cu.id, cu.tenant_id
    from public.clinic_users cu
    where cu.auth_user_id = (select auth.uid())
      and cu.is_active = true
      and cu.deleted_at is null
      and public.has_tenant_permission(cu.tenant_id, 'communications:send')
    limit 1
  ),
  staff as (
    select cu.id, cu.full_name, cu.email, cu.role, me.tenant_id
    from public.clinic_users cu
    cross join me
    where cu.tenant_id = me.tenant_id
      and cu.is_active = true
      and cu.deleted_at is null
      and cu.id <> me.id
      and (
        nullif(trim(p_query), '') is null
        or coalesce(cu.full_name, '') ilike '%' || trim(p_query) || '%'
        or coalesce(cu.email, '') ilike '%' || trim(p_query) || '%'
      )
  )
  select
    staff.id,
    coalesce(staff.full_name, ''),
    coalesce(staff.email, ''),
    coalesce(staff.role, ''),
    chat.conversation_id,
    chat.last_message,
    chat.last_message_at,
    coalesce(chat.unread_count, 0)::integer
  from staff
  left join lateral (
    select
      cc.id as conversation_id,
      lm.body as last_message,
      lm.created_at as last_message_at,
      (
        select count(*)::integer
        from public.communication_messages um
        where um.tenant_id = staff.tenant_id
          and um.conversation_id = cc.id
          and um.message_kind = 'message'
          and um.sender_clinic_user_id <> (select me.id from me)
          and not exists (
            select 1
            from public.communication_message_reads r
            where r.tenant_id = staff.tenant_id
              and r.clinic_user_id = (select me.id from me)
              and r.message_id = um.id
          )
      ) as unread_count
    from public.communication_conversations cc
    left join lateral (
      select m.body, m.created_at
      from public.communication_messages m
      where m.tenant_id = staff.tenant_id
        and m.conversation_id = cc.id
        and m.message_kind = 'message'
      order by m.created_at desc
      limit 1
    ) lm on true
    where cc.tenant_id = staff.tenant_id
      and cc.kind = 'internal'
      and cc.status <> 'archived'
      and exists (
        select 1
        from public.communication_conversation_participants mep
        where mep.tenant_id = staff.tenant_id
          and mep.conversation_id = cc.id
          and mep.clinic_user_id = (select me.id from me)
      )
      and exists (
        select 1
        from public.communication_conversation_participants op
        where op.tenant_id = staff.tenant_id
          and op.conversation_id = cc.id
          and op.clinic_user_id = staff.id
      )
      and (
        select count(*)
        from public.communication_conversation_participants exact_members
        where exact_members.tenant_id = staff.tenant_id
          and exact_members.conversation_id = cc.id
      ) = 2
    order by cc.updated_at desc
    limit 1
  ) chat on true
  order by
    case when chat.conversation_id is null then 1 else 0 end,
    chat.last_message_at desc nulls last,
    lower(coalesce(staff.full_name, staff.email)) asc;
$$;

revoke all on function public.get_internal_chat_directory(text) from public, anon;
grant execute on function public.get_internal_chat_directory(text) to authenticated;
