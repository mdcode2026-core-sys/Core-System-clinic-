alter table public.subscription_plans add column if not exists medical_file_cloud_mode text not null default 'local_first' check (medical_file_cloud_mode in ('local_first','hybrid'));
update public.subscription_plans set medical_file_cloud_mode = case when plan_key in ('pro','enterprise') then 'hybrid' else 'local_first' end;
update public.feature_flags set allowed_tiers=array['trial','basic','pro','enterprise'], updated_at=now() where tenant_id is null and flag_key='medical_files';
