update public.feature_flags set allowed_tiers=array['trial','basic','pro','enterprise'],updated_at=now() where tenant_id is null and flag_key='medical_files';
