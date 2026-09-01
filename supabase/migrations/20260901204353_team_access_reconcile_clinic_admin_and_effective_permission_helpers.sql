create or replace function public.has_effective_permission(p_permission_key text, p_user_id uuid default auth.uid()) returns boolean language sql stable security definer set search_path to 'public' as $function$
with u as (
  select cu.id, cu.tenant_id, cu.role_template_id, cu.role from public.clinic_users cu
  where cu.auth_user_id = auth.uid() and (cu.id = p_user_id or cu.auth_user_id = p_user_id) and cu.deleted_at is null and cu.is_active = true limit 1
), base as (
  select p.permission_key from u join public.roles r on ((r.id=u.role_template_id and (r.is_system_role or r.tenant_id=u.tenant_id)) or (u.role_template_id is null and r.role_key=u.role)) join public.role_permissions rp on rp.role_id=r.id join public.permissions p on p.id=rp.permission_id where p.permission_key=p_permission_key
), direct as (
  select p.permission_key from u join public.clinic_user_permissions up on up.user_id=u.id and up.tenant_id=u.tenant_id and up.granted and up.deleted_at is null join public.permissions p on p.id=up.permission_id where p.permission_key=p_permission_key
), overrides as (
  select o.granted from u join public.clinic_user_permission_overrides o on o.user_id=u.id and o.tenant_id=u.tenant_id and o.deleted_at is null join public.permissions p on p.id=o.permission_id where p.permission_key=p_permission_key order by o.updated_at desc nulls last, o.created_at desc limit 1
), subject as (select * from u)
select case when exists(select 1 from subject where role='clinic_admin') then true when exists(select 1 from overrides where granted=false) then false else exists(select 1 from base) or exists(select 1 from direct) or exists(select 1 from overrides where granted=true) end;
$function$;

create or replace function public.has_tenant_permission(p_tenant_id uuid, p_permission_key text) returns boolean language sql stable security definer set search_path to 'public' as $function$
with u as (
  select cu.id,cu.tenant_id,cu.role,cu.role_template_id from public.clinic_users cu where cu.auth_user_id=auth.uid() and cu.tenant_id=p_tenant_id and cu.is_active and cu.deleted_at is null limit 1
), base as (
  select 1 from u join public.roles r on ((r.id=u.role_template_id and (r.is_system_role or r.tenant_id=u.tenant_id)) or (u.role_template_id is null and r.role_key=u.role)) join public.role_permissions rp on rp.role_id=r.id join public.permissions p on p.id=rp.permission_id where p.permission_key=p_permission_key limit 1
), direct as (
  select 1 from u join public.clinic_user_permissions up on up.user_id=u.id and up.tenant_id=u.tenant_id and up.granted and up.deleted_at is null join public.permissions p on p.id=up.permission_id where p.permission_key=p_permission_key limit 1
), override as (
  select o.granted from u join public.clinic_user_permission_overrides o on o.user_id=u.id and o.tenant_id=u.tenant_id and o.deleted_at is null join public.permissions p on p.id=o.permission_id where p.permission_key=p_permission_key order by o.updated_at desc nulls last,o.created_at desc limit 1
)
select case when exists(select 1 from u where role='clinic_admin') then true when exists(select 1 from override where granted=false) then false else exists(select 1 from base) or exists(select 1 from direct) or exists(select 1 from override where granted=true) end;
$function$;
