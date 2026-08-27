-- AJM-2 closure hardening: avoid feature flag RLS dependency on get_current_user_role().
-- The previous policy called a helper function from the RLS predicate and was
-- producing production permission-denied errors during authenticated dashboard requests.
drop policy if exists rls_flags_read on public.feature_flags;

create policy rls_flags_read on public.feature_flags
for select to authenticated
using (
  exists (
    select 1
    from public.clinic_users cu
    where cu.auth_user_id = auth.uid()
      and cu.is_active = true
      and cu.deleted_at is null
      and cu.role = 'super_admin'
  )
  or tenant_id = public.get_current_tenant_id()
  or tenant_id is null
);
