-- Team & Access integrity: one active account per email within a tenant.
-- This does not modify PIN schema or PIN data.
create unique index if not exists uq_clinic_users_tenant_email_active
  on public.clinic_users (tenant_id, lower(email))
  where deleted_at is null and email is not null;
