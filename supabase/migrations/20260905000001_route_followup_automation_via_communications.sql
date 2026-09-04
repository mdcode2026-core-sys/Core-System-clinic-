-- ADR-014 remediation follow-up.
-- Replaces direct notification_queue insertion in run_followup_automation()
-- with the Communications-owned enqueue_followup_notification() boundary.
-- No existing Follow-up test data is deleted or modified.

CREATE OR REPLACE FUNCTION public.run_followup_automation() RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_tenant record; v_rule record; v_session record; v_latest record; v_event record; v_followup record;
  v_created integer := 0; v_queued integer := 0; v_source_key text;
  v_scheduled timestamptz; v_message text; v_age interval; v_upper interval;
begin
  for v_tenant in select id from public.master_tenants where is_active=true and deleted_at is null loop
    if not public.followup_automation_enabled(v_tenant.id) then continue; end if;
    for v_rule in select distinct on (rule_key) id, rule_key, delay_minutes, followup_type, action_type, channel, message_template from public.followup_automation_rules where is_enabled=true and (tenant_id=v_tenant.id or tenant_id is null) order by rule_key, (tenant_id is not null) desc loop
      if v_rule.rule_key like 'post_visit_%' then
        for v_session in select s.id, s.patient_id, s.visit_closed_at, s.session_ended_at, s.created_at, s.follow_up_required, s.follow_up_date, p.first_name, p.last_name from public.clinic_visit_sessions s join public.clinic_patients p on p.id=s.patient_id where s.tenant_id=v_tenant.id and s.visit_closed_at is not null and s.visit_closed_at >= now() - interval '365 days' loop
          v_source_key := 'session:' || v_session.id || ':rule:' || v_rule.rule_key;
          v_scheduled := coalesce(v_session.visit_closed_at, v_session.session_ended_at, v_session.created_at) + make_interval(mins => v_rule.delay_minutes);
          v_message := case when v_rule.message_template is null then null else replace(v_rule.message_template, '{{patient_name}}', trim(coalesce(v_session.first_name,'') || ' ' || coalesce(v_session.last_name,''))) end;
          insert into public.retention_followups (tenant_id, patient_id, session_id, scheduled_for, followup_type, action_type, execution_mode, status, channel, message_body, delivery_status, automation_rule_id, automation_source_key) values (v_tenant.id, v_session.patient_id, v_session.id, v_scheduled, v_rule.followup_type, v_rule.action_type, 'automated', 'open', v_rule.channel, v_message, case when v_rule.channel is null then null else 'pending' end, v_rule.id, v_source_key) on conflict (automation_source_key) where automation_source_key is not null do nothing;
          if found then v_created := v_created + 1; end if;
          if v_rule.rule_key='post_visit_24h' and v_session.follow_up_required and v_session.follow_up_date is not null then
            v_source_key := 'session:' || v_session.id || ':explicit_followup';
            v_scheduled := v_session.follow_up_date::timestamptz + interval '9 hours';
            insert into public.retention_followups (tenant_id, patient_id, session_id, scheduled_for, followup_type, action_type, execution_mode, status, channel, message_body, delivery_status, automation_rule_id, automation_source_key) values (v_tenant.id, v_session.patient_id, v_session.id, v_scheduled, 'custom', v_rule.action_type, 'automated', 'open', v_rule.channel, v_message, case when v_rule.channel is null then null else 'pending' end, v_rule.id, v_source_key) on conflict (automation_source_key) where automation_source_key is not null do nothing;
            if found then v_created := v_created + 1; end if;
          end if;
        end loop;
      elsif v_rule.rule_key like 'reactivation_%' then
        v_upper := case when v_rule.rule_key='reactivation_30d' then interval '60 days' when v_rule.rule_key='reactivation_60d' then interval '90 days' else null end;
        for v_latest in select distinct on (s.patient_id) s.id, s.patient_id, s.visit_closed_at, p.first_name, p.last_name from public.clinic_visit_sessions s join public.clinic_patients p on p.id=s.patient_id where s.tenant_id=v_tenant.id and s.visit_closed_at is not null order by s.patient_id, s.visit_closed_at desc loop
          v_age := now() - v_latest.visit_closed_at;
          if v_age >= make_interval(mins => v_rule.delay_minutes) and (v_upper is null or v_age < v_upper) then
            v_source_key := 'patient:' || v_latest.patient_id || ':session:' || v_latest.id || ':rule:' || v_rule.rule_key;
            v_scheduled := v_latest.visit_closed_at + make_interval(mins => v_rule.delay_minutes);
            v_message := case when v_rule.message_template is null then null else replace(v_rule.message_template, '{{patient_name}}', trim(coalesce(v_latest.first_name,'') || ' ' || coalesce(v_latest.last_name,''))) end;
            insert into public.retention_followups (tenant_id, patient_id, session_id, scheduled_for, followup_type, action_type, execution_mode, status, channel, message_body, delivery_status, automation_rule_id, automation_source_key) values (v_tenant.id, v_latest.patient_id, v_latest.id, v_scheduled, v_rule.followup_type, v_rule.action_type, 'automated', 'open', v_rule.channel, v_message, case when v_rule.channel is null then null else 'pending' end, v_rule.id, v_source_key) on conflict (automation_source_key) where automation_source_key is not null do nothing;
            if found then v_created := v_created + 1; end if;
          end if;
        end loop;
      elsif v_rule.rule_key like 'appointment_reminder_%' then
        for v_event in select e.id, e.patient_id, e.scheduled_start, p.first_name, p.last_name from public.master_agenda_events e join public.clinic_patients p on p.id=e.patient_id where e.tenant_id=v_tenant.id and e.patient_id is not null and e.scheduled_start is not null and coalesce(e.status,'') not in ('cancelled','canceled','completed') loop
          v_source_key := 'agenda:' || v_event.id || ':rule:' || v_rule.rule_key;
          v_scheduled := v_event.scheduled_start + make_interval(mins => v_rule.delay_minutes);
          if v_scheduled <= now() + interval '30 days' then
            v_message := case when v_rule.message_template is null then null else replace(v_rule.message_template, '{{patient_name}}', trim(coalesce(v_event.first_name,'') || ' ' || coalesce(v_event.last_name,''))) end;
            insert into public.retention_followups (tenant_id, patient_id, scheduled_for, followup_type, action_type, execution_mode, status, channel, message_body, delivery_status, automation_rule_id, automation_source_key) values (v_tenant.id, v_event.patient_id, v_scheduled, v_rule.followup_type, v_rule.action_type, 'automated', 'open', v_rule.channel, v_message, case when v_rule.channel is null then null else 'pending' end, v_rule.id, v_source_key) on conflict (automation_source_key) where automation_source_key is not null do nothing;
            if found then v_created := v_created + 1; end if;
          end if;
        end loop;
      end if;
    end loop;
  end loop;

  for v_followup in
    select rf.id, rf.tenant_id, rf.patient_id, rf.channel, rf.message_body, rf.scheduled_for, rf.followup_type, rf.automation_rule_id
    from public.retention_followups rf
    where rf.execution_mode='automated' and rf.status='open' and rf.scheduled_for <= now()
      and rf.channel is not null and rf.delivery_status in ('pending','failed')
  loop
    if public.enqueue_followup_notification(v_followup.tenant_id, v_followup.id, v_followup.patient_id,
      v_followup.channel, v_followup.message_body, v_followup.scheduled_for,
      v_followup.followup_type, v_followup.automation_rule_id) then
      v_queued := v_queued + 1;
    end if;
  end loop;

  return jsonb_build_object('created_followups', v_created, 'queued_notifications', v_queued, 'ran_at', now());
end;
$$;
