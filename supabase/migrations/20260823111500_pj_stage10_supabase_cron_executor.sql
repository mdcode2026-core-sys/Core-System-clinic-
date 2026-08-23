create extension if not exists pg_cron;

create or replace function public.run_followup_automation()
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_tenant record;
  v_rule record;
  v_session record;
  v_latest record;
  v_created integer := 0;
  v_queued integer := 0;
  v_source_key text;
  v_scheduled timestamptz;
  v_message text;
  v_age interval;
  v_upper interval;
begin
  for v_tenant in select id from public.master_tenants where is_active=true and deleted_at is null loop
    if not public.followup_automation_enabled(v_tenant.id) then continue; end if;
    for v_rule in select distinct on (rule_key) id, rule_key, delay_minutes, followup_type, action_type, channel, message_template from public.followup_automation_rules where is_enabled=true and (tenant_id=v_tenant.id or tenant_id is null) order by rule_key, (tenant_id is not null) desc loop
      if v_rule.rule_key like 'post_visit_%' then
        for v_session in select s.id, s.patient_id, s.visit_closed_at, s.session_ended_at, s.created_at, p.first_name, p.last_name from public.clinic_visit_sessions s join public.clinic_patients p on p.id=s.patient_id where s.tenant_id=v_tenant.id and s.visit_closed_at is not null and s.visit_closed_at >= now() - interval '365 days' loop
          v_source_key := 'session:' || v_session.id || ':rule:' || v_rule.rule_key;
          v_scheduled := coalesce(v_session.visit_closed_at, v_session.session_ended_at, v_session.created_at) + make_interval(mins => v_rule.delay_minutes);
          v_message := case when v_rule.message_template is null then null else replace(v_rule.message_template, '{{patient_name}}', trim(coalesce(v_session.first_name,'') || ' ' || coalesce(v_session.last_name,''))) end;
          insert into public.retention_followups (tenant_id, patient_id, session_id, scheduled_for, followup_type, action_type, execution_mode, status, channel, message_body, delivery_status, automation_rule_id, automation_source_key) values (v_tenant.id, v_session.patient_id, v_session.id, v_scheduled, v_rule.followup_type, v_rule.action_type, 'automated', 'open', v_rule.channel, v_message, case when v_rule.channel is null then null else 'pending' end, v_rule.id, v_source_key) on conflict (automation_source_key) do nothing;
          if found then v_created := v_created + 1; end if;
        end loop;
      elsif v_rule.rule_key like 'reactivation_%' then
        v_upper := case when v_rule.rule_key='reactivation_30d' then interval '60 days' when v_rule.rule_key='reactivation_60d' then interval '90 days' else null end;
        for v_latest in select distinct on (s.patient_id) s.id, s.patient_id, s.visit_closed_at, p.first_name, p.last_name from public.clinic_visit_sessions s join public.clinic_patients p on p.id=s.patient_id where s.tenant_id=v_tenant.id and s.visit_closed_at is not null order by s.patient_id, s.visit_closed_at desc loop
          v_age := now() - v_latest.visit_closed_at;
          if v_age >= make_interval(mins => v_rule.delay_minutes) and (v_upper is null or v_age < v_upper) then
            v_source_key := 'patient:' || v_latest.patient_id || ':session:' || v_latest.id || ':rule:' || v_rule.rule_key;
            v_scheduled := v_latest.visit_closed_at + make_interval(mins => v_rule.delay_minutes);
            v_message := case when v_rule.message_template is null then null else replace(v_rule.message_template, '{{patient_name}}', trim(coalesce(v_latest.first_name,'') || ' ' || coalesce(v_latest.last_name,''))) end;
            insert into public.retention_followups (tenant_id, patient_id, session_id, scheduled_for, followup_type, action_type, execution_mode, status, channel, message_body, delivery_status, automation_rule_id, automation_source_key) values (v_tenant.id, v_latest.patient_id, v_latest.id, v_scheduled, v_rule.followup_type, v_rule.action_type, 'automated', 'open', v_rule.channel, v_message, case when v_rule.channel is null then null else 'pending' end, v_rule.id, v_source_key) on conflict (automation_source_key) do nothing;
            if found then v_created := v_created + 1; end if;
          end if;
        end loop;
      end if;
    end loop;
  end loop;

  insert into public.notification_queue (tenant_id, recipient_type, recipient_id, channel, message_body, priority, status, retry_count, max_retries, scheduled_at, metadata)
  select rf.tenant_id, 'patient', rf.patient_id, rf.channel, coalesce(rf.message_body,''), 5, 'pending', 0, 3, rf.scheduled_for, jsonb_build_object('followup_id', rf.id, 'followup_type', rf.followup_type, 'automation_rule_id', rf.automation_rule_id, 'execution_mode', 'automated', 'manual_review_fallback', true)
  from public.retention_followups rf where rf.execution_mode='automated' and rf.status='open' and rf.scheduled_for <= now() and rf.channel is not null and rf.delivery_status in ('pending','failed') and not exists (select 1 from public.notification_queue nq where nq.tenant_id=rf.tenant_id and nq.metadata->>'followup_id'=rf.id::text);
  get diagnostics v_queued = row_count;
  return jsonb_build_object('created_followups', v_created, 'queued_notifications', v_queued, 'ran_at', now());
end;
$$;

select cron.unschedule(jobid) from cron.job where jobname='pj-stage10-followup-automation';
select cron.schedule('pj-stage10-followup-automation', '*/15 * * * *', $$select public.run_followup_automation();$$);
