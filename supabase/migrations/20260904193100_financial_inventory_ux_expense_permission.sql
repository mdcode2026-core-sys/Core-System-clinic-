insert into public.permissions(permission_key, permission_name, resource, action, description)
select 'expenses:manage','Manage Operating Expenses','expenses','manage','Create and manage clinic operating expenses'
where not exists (select 1 from public.permissions where permission_key='expenses:manage');
insert into public.role_template_permissions(template_id, permission_id)
select rt.id, p.id from public.role_templates rt cross join public.permissions p
where rt.template_key in ('clinic_admin','accounting') and p.permission_key='expenses:manage'
  and not exists (select 1 from public.role_template_permissions rtp where rtp.template_id=rt.id and rtp.permission_id=p.id);