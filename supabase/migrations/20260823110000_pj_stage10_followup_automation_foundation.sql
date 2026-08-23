create table if not exists public.followup_automation_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.master_tenants(id) on delete cascade,
  rule_key text not null,
  rule_name text not null,
  is_enabled boolean not null default true,
  delay_minutes integer not null check (delay_minutes >= 0),
  followup_type text not null,
  action_type text not null,
  channel text,
  message_template text,
  priority smallint not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, rule_key)
);

alter table public.retention_followups add column if not exists automation_rule_id uuid references public.followup_automation_rules(id) on delete set null;
alter table public.retention_followups add column if not exists automation_source_key text;

create unique index if not exists retention_followups_automation_source_key_uidx on public.retention_followups(automation_source_key) where automation_source_key is not null;
create index if not exists followup_automation_rules_tenant_enabled_idx on public.followup_automation_rules(tenant_id, is_enabled);

alter table public.followup_automation_rules enable row level security;

create policy followup_automation_rules_tenant_read on public.followup_automation_rules for select to authenticated using (tenant_id is null or tenant_id = public.get_current_tenant_id());
create policy followup_automation_rules_tenant_write on public.followup_automation_rules for all to authenticated using (tenant_id = public.get_current_tenant_id()) with check (tenant_id = public.get_current_tenant_id());

insert into public.followup_automation_rules (tenant_id, rule_key, rule_name, delay_minutes, followup_type, action_type, channel, message_template, priority)
values
(null, 'post_visit_24h', 'Post-visit 24 hour follow-up', 1440, 'post_visit_24h', 'whatsapp', 'whatsapp', 'مرحباً {{patient_name}}، نود الاطمئنان عليك بعد زيارتك للعيادة. كيف حالك اليوم؟', 5),
(null, 'post_visit_7d', 'Post-visit 7 day follow-up', 10080, 'post_visit_7d', 'appointment', null, 'مرحباً {{patient_name}}، حان وقت المتابعة بعد زيارتك السابقة. هل ترغب في تنسيق موعد مناسب؟', 5),
(null, 'reactivation_30d', 'Reactivation 30 day follow-up', 43200, 'reactivation_30d', 'whatsapp', 'whatsapp', 'مرحباً {{patient_name}}، يسعدنا الاطمئنان عليك. إذا كنت بحاجة إلى متابعة أو موعد جديد فنحن جاهزون لخدمتك.', 6),
(null, 'reactivation_60d', 'Reactivation 60 day follow-up', 86400, 'reactivation_60d', 'whatsapp', 'whatsapp', 'مرحباً {{patient_name}}، نود الاطمئنان عليك ودعوتك للتواصل معنا إذا رغبت في متابعة رعايتك.', 7),
(null, 'reactivation_90d', 'Reactivation 90 day follow-up', 129600, 'reactivation_90d', 'call', null, null, 8)
on conflict (tenant_id, rule_key) do nothing;

insert into public.feature_flags (flag_key, flag_name, description, is_enabled, allowed_tiers, config_json)
values ('followup_automation', 'Follow-up Automation', 'Tenant-level automated follow-up scheduling and execution capability. Super Admin controls tenant activation.', false, array['professional','enterprise'], '{"requires_tenant_activation":true,"execution":"queued","manual_review_fallback":true}'::jsonb)
on conflict (flag_key, tenant_id) do update set allowed_tiers=excluded.allowed_tiers, config_json=excluded.config_json;

create or replace function public.followup_automation_enabled(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce((select f.is_enabled and (f.allowed_tiers is null or lower(t.subscription_tier)=any(select lower(x) from unnest(f.allowed_tiers) x))
    from public.master_tenants t
    join public.feature_flags f on f.flag_key='followup_automation' and (f.tenant_id=p_tenant_id or f.tenant_id is null)
    where t.id=p_tenant_id and t.is_active=true and t.deleted_at is null
    order by (f.tenant_id is not null) desc limit 1), false);
$$;

grant execute on function public.followup_automation_enabled(uuid) to authenticated;
