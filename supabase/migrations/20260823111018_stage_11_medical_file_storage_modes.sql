alter table public.subscription_plans add column if not exists medical_file_cloud_mode text not null default 'local_first' check(medical_file_cloud_mode in('local_first','hybrid'));
update public.subscription_plans set medical_file_cloud_mode=case when plan_key in('pro','enterprise') then 'hybrid' else 'local_first' end;
