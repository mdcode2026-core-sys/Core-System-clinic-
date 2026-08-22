-- Permission resolution uses role templates first, with a compatibility fallback for
-- active users that predate role_template_id population. User overrides remain authoritative.
create or replace function public.has_effective_permission(p_permission_key text, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  with u as (
    select cu.id, cu.auth_user_id, cu.tenant_id, cu.role_template_id, cu.role
    from public.clinic_users cu
    where (cu.id = p_user_id or cu.auth_user_id = p_user_id)
      and cu.deleted_at is null
      and cu.is_active = true
    limit 1
  ), base as (
    select p.permission_key
    from u
    join public.roles r on (
      (r.id = u.role_template_id and (r.is_system_role or r.tenant_id = u.tenant_id))
      or (u.role_template_id is null and r.role_key = u.role)
    )
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where p.permission_key = p_permission_key
  ), override as (
    select o.granted
    from u
    join public.clinic_user_permission_overrides o on o.user_id = u.id and o.tenant_id = u.tenant_id
    join public.permissions p on p.id = o.permission_id
    where p.permission_key = p_permission_key
    order by o.updated_at desc
    limit 1
  )
  select coalesce((select granted from override), exists(select 1 from base));
$$;

revoke all on function public.has_effective_permission(text, uuid) from public;
grant execute on function public.has_effective_permission(text, uuid) to authenticated;
