-- Chat/Communications RLS repair.
-- communications:send is an action permission, not a manage permission.
-- Authorized senders must be able to create a conversation and add its participants
-- through the existing Communications engine without gaining manage access.

create policy communications_conversations_create
on public.communication_conversations
for insert
to authenticated
with check (
  tenant_id = public.get_current_tenant_id()
  and public.has_tenant_permission(tenant_id, 'communications:send')
  and created_by = (
    select id
    from public.clinic_users
    where auth_user_id = auth.uid()
      and tenant_id = communication_conversations.tenant_id
      and is_active = true
      and deleted_at is null
    limit 1
  )
);

create policy communications_participants_create
on public.communication_conversation_participants
for insert
to authenticated
with check (
  tenant_id = public.get_current_tenant_id()
  and public.has_tenant_permission(tenant_id, 'communications:send')
  and exists (
    select 1
    from public.communication_conversations c
    where c.tenant_id = communication_conversation_participants.tenant_id
      and c.id = communication_conversation_participants.conversation_id
      and c.created_by = (
        select id
        from public.clinic_users
        where auth_user_id = auth.uid()
          and tenant_id = communication_conversation_participants.tenant_id
          and is_active = true
          and deleted_at is null
        limit 1
      )
      and c.status <> 'archived'
  )
);
