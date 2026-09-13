create or replace function public.get_internal_chat_directory(p_query text default '')
returns table(
  user_id uuid,
  full_name text,
  email text,
  role text,
  conversation_id uuid,
  last_message text,
  last_message_at timestamptz,
  unread_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_current_user_id uuid;
begin
  select cu.tenant_id, cu.id
    into v_tenant_id, v_current_user_id
  from public.clinic_users cu
  where cu.auth_user_id = (select auth.uid())
    and cu.is_active = true
    and cu.deleted_at is null
  limit 1;

  if v_tenant_id is null or v_current_user_id is null then
    raise exception 'ACTIVE_CLINIC_USER_REQUIRED';
  end if;

  if not public.has_tenant_permission(v_tenant_id, 'communications:send') then
    raise exception 'COMMUNICATIONS_SEND_PERMISSION_REQUIRED';
  end if;

  return query
  with staff as (
    select
      cu.id,
      coalesce(nullif(trim(cu.full_name), ''), cu.email) as display_name,
      cu.email,
      coalesce(cu.role, '') as role_name
    from public.clinic_users cu
    where cu.tenant_id = v_tenant_id
      and cu.id <> v_current_user_id
      and cu.is_active = true
      and cu.deleted_at is null
      and (
        coalesce(p_query, '') = ''
        or coalesce(cu.full_name, '') ilike '%' || p_query || '%'
        or coalesce(cu.email, '') ilike '%' || p_query || '%'
      )
  ),
  pairs as (
    select s.*, c.id as cid
    from staff s
    left join lateral (
      select c.id
      from public.communication_conversations c
      join public.communication_participants cp1
        on cp1.conversation_id = c.id
       and cp1.clinic_user_id = v_current_user_id
      join public.communication_participants cp2
        on cp2.conversation_id = c.id
       and cp2.clinic_user_id = s.id
      where c.tenant_id = v_tenant_id
        and c.kind = 'internal'
        and c.is_active = true
      order by c.updated_at desc
      limit 1
    ) c on true
  ),
  lm as (
    select p.*, m.body as last_body, m.created_at as last_created
    from pairs p
    left join lateral (
      select m.body, m.created_at
      from public.communication_messages m
      where m.conversation_id = p.cid
        and m.message_kind = 'message'
      order by m.created_at desc
      limit 1
    ) m on true
  )
  select
    l.id,
    l.display_name,
    l.email,
    l.role_name,
    l.cid,
    l.last_body,
    l.last_created,
    case
      when l.cid is null then 0
      else (
        select count(*)::integer
        from public.communication_messages m
        where m.conversation_id = l.cid
          and m.message_kind = 'message'
          and m.sender_clinic_user_id <> v_current_user_id
          and not exists (
            select 1
            from public.communication_message_reads mr
            where mr.message_id = m.id
              and mr.clinic_user_id = v_current_user_id
          )
      )
    end
  from lm l
  order by coalesce(l.last_created, to_timestamp(0)) desc, l.display_name asc;
end;
$$;

revoke all on function public.get_internal_chat_directory(text) from public, anon;
grant execute on function public.get_internal_chat_directory(text) to authenticated;
