-- PJ Stage 14: repair defects discovered during End-to-End validation.
-- 1) Restore canonical global automation rules when the prior seed is absent.
-- 2) Make the partial unique index usable by the automation function.
-- 3) Use the notification_queue status value accepted by its CHECK constraint.

insert into public.followup_automation_rules (
  tenant_id, rule_key, rule_name, delay_minutes, followup_type,
  action_type, channel, message_template, priority
)
values
  (null, 'post_visit_24h', 'Post-visit 24 hour follow-up', 1440, 'post_visit_24h', 'whatsapp', 'whatsapp', 'مرحباً {{patient_name}}، نود الاطمئنان عليك بعد زيارتك للعيادة. كيف حالك اليوم؟', 5),
  (null, 'post_visit_7d', 'Post-visit 7 day follow-up', 10080, 'post_visit_7d', 'appointment', null, 'مرحباً {{patient_name}}، حان وقت المتابعة بعد زيارتك السابقة. هل ترغب في تنسيق موعد مناسب؟', 5),
  (null, 'reactivation_30d', 'Reactivation 30 day follow-up', 43200, 'reactivation_30d', 'whatsapp', 'whatsapp', 'مرحباً {{patient_name}}، يسعدنا الاطمئنان عليك. إذا كنت بحاجة إلى متابعة أو موعد جديد فنحن جاهزون لخدمتك.', 6),
  (null, 'reactivation_60d', 'Reactivation 60 day follow-up', 86400, 'reactivation_60d', 'whatsapp', 'whatsapp', 'مرحباً {{patient_name}}، نود الاطمئنان عليك ودعوتك للتواصل معنا إذا رغبت في متابعة رعايتك.', 7),
  (null, 'reactivation_90d', 'Reactivation 90 day follow-up', 129600, 'reactivation_90d', 'call', null, null, 8)
on conflict (tenant_id, rule_key) do update set
  rule_name = excluded.rule_name,
  delay_minutes = excluded.delay_minutes,
  followup_type = excluded.followup_type,
  action_type = excluded.action_type,
  channel = excluded.channel,
  message_template = excluded.message_template,
  priority = excluded.priority,
  is_enabled = true,
  updated_at = now();

do $$
declare
  definition text;
begin
  select pg_get_functiondef(p.oid)
    into definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'run_followup_automation'
    and p.pronargs = 0;

  if definition is not null then
    definition := replace(
      definition,
      'on conflict (automation_source_key) do nothing',
      'on conflict (automation_source_key) where automation_source_key is not null do nothing'
    );
    definition := replace(
      definition,
      '''pending'', 0, 3, rf.scheduled_for',
      '''queued'', 0, 3, rf.scheduled_for'
    );
    execute definition;
  end if;
end $$;
