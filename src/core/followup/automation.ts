import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Rule = { id: string; rule_key: string; delay_minutes: number; followup_type: string; action_type: string; channel: string | null; message_template: string | null; priority: number; };
type Tenant = { id: string; clinic_name: string; subscription_tier: string; timezone: string; };

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function renderMessage(template: string | null, patient: { first_name?: string | null; last_name?: string | null } | null) {
  if (!template) return null;
  const name = [patient?.first_name, patient?.last_name].filter(Boolean).join(" ") || "المريض";
  return template.replaceAll("{{patient_name}}", name);
}

async function enabled(supabase: SupabaseClient, tenant: Tenant) {
  const { data, error } = await supabase.rpc("followup_automation_enabled", { p_tenant_id: tenant.id });
  if (error) throw error;
  return data === true;
}

async function rulesForTenant(supabase: SupabaseClient, tenantId: string): Promise<Rule[]> {
  const { data, error } = await supabase.from("followup_automation_rules").select("id,tenant_id,rule_key,delay_minutes,followup_type,action_type,channel,message_template,priority").eq("is_enabled", true).or(`tenant_id.eq.${tenantId},tenant_id.is.null`).order("tenant_id", { ascending: true, nullsFirst: true });
  if (error) throw error;
  const selected = new Map<string, Rule>();
  for (const row of (data ?? []) as Array<Rule & { tenant_id: string | null }>) selected.set(row.rule_key, row);
  for (const row of (data ?? []) as Array<Rule & { tenant_id: string | null }>) if (row.tenant_id === tenantId) selected.set(row.rule_key, row);
  return [...selected.values()];
}

async function createForSession(supabase: SupabaseClient, tenant: Tenant, rule: Rule, session: any) {
  const sourceKey = `session:${session.id}:rule:${rule.rule_key}`;
  const scheduledFor = new Date(new Date(session.visit_closed_at ?? session.session_ended_at ?? session.created_at).getTime() + rule.delay_minutes * 60_000).toISOString();
  const messageBody = renderMessage(rule.message_template, session.patient);
  await supabase.from("retention_followups").upsert({ tenant_id: tenant.id, patient_id: session.patient_id, session_id: session.id, scheduled_for: scheduledFor, followup_type: rule.followup_type, action_type: rule.action_type, execution_mode: "automated", status: "open", channel: rule.channel, message_body: messageBody, delivery_status: rule.channel ? "pending" : null, automation_rule_id: rule.id, automation_source_key: sourceKey }, { onConflict: "automation_source_key", ignoreDuplicates: true });
}

async function createReactivation(supabase: SupabaseClient, tenant: Tenant, rule: Rule, session: any, patient: any) {
  const sourceKey = `patient:${patient.id}:session:${session.id}:rule:${rule.rule_key}`;
  const base = new Date(session.visit_closed_at ?? session.session_ended_at ?? session.created_at).getTime();
  const scheduledFor = new Date(base + rule.delay_minutes * 60_000).toISOString();
  const messageBody = renderMessage(rule.message_template, patient);
  await supabase.from("retention_followups").upsert({ tenant_id: tenant.id, patient_id: patient.id, session_id: session.id, scheduled_for: scheduledFor, followup_type: rule.followup_type, action_type: rule.action_type, execution_mode: "automated", status: "open", channel: rule.channel, message_body: messageBody, delivery_status: rule.channel ? "pending" : null, automation_rule_id: rule.id, automation_source_key: sourceKey }, { onConflict: "automation_source_key", ignoreDuplicates: true });
}

async function materializeTenant(supabase: SupabaseClient, tenant: Tenant) {
  if (!(await enabled(supabase, tenant))) return { tenantId: tenant.id, skipped: true, created: 0 };
  const rules = await rulesForTenant(supabase, tenant.id);
  const { data: sessions, error: sessionsError } = await supabase.from("clinic_visit_sessions").select("id,tenant_id,patient_id,visit_closed_at,session_ended_at,created_at,follow_up_required,follow_up_date,patient:patient_id(id,first_name,last_name)").eq("tenant_id", tenant.id).not("visit_closed_at", "is", null).gte("visit_closed_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()).order("visit_closed_at", { ascending: false }).limit(5000);
  if (sessionsError) throw sessionsError;
  const rows = sessions ?? [];
  const latest = new Map<string, any>();
  for (const session of rows) if (!latest.has(session.patient_id)) latest.set(session.patient_id, session);
  let created = 0;
  for (const rule of rules) {
    if (rule.rule_key.startsWith("post_visit_")) {
      for (const session of rows) await createForSession(supabase, tenant, rule, session);
    }
    if (rule.rule_key.startsWith("reactivation_")) {
      const threshold = rule.delay_minutes * 60_000;
      const now = Date.now();
      const upper = rule.rule_key === "reactivation_30d" ? 60 * 86400000 : rule.rule_key === "reactivation_60d" ? 90 * 86400000 : Infinity;
      for (const session of latest.values()) {
        const age = now - new Date(session.visit_closed_at).getTime();
        if (age >= threshold && age < upper) await createReactivation(supabase, tenant, rule, session, session.patient);
      }
    }
    if (rule.rule_key === "post_visit_24h") {
      for (const session of rows) if (session.follow_up_required && session.follow_up_date) {
        const sourceKey = `session:${session.id}:explicit_followup`;
        const messageBody = renderMessage(rule.message_template, session.patient);
        await supabase.from("retention_followups").upsert({ tenant_id: tenant.id, patient_id: session.patient_id, session_id: session.id, scheduled_for: new Date(`${session.follow_up_date}T09:00:00Z`).toISOString(), followup_type: "custom", action_type: rule.action_type, execution_mode: "automated", status: "open", channel: rule.channel, message_body: messageBody, delivery_status: rule.channel ? "pending" : null, automation_rule_id: rule.id, automation_source_key: sourceKey }, { onConflict: "automation_source_key", ignoreDuplicates: true });
      }
    }
  }
  return { tenantId: tenant.id, skipped: false, created };
}

async function enqueueDue(supabase: SupabaseClient) {
  const now = new Date().toISOString();
  const { data: due, error } = await supabase.from("retention_followups").select("id,tenant_id,patient_id,channel,message_body,scheduled_for,followup_type,automation_rule_id").eq("execution_mode", "automated").eq("status", "open").lte("scheduled_for", now).not("channel", "is", null).in("delivery_status", ["pending", "failed"] ).limit(500);
  if (error) throw error;
  let queued = 0;
  for (const item of due ?? []) {
    const { data: existing, error: existingError } = await supabase.from("notification_queue").select("id,status").eq("tenant_id", item.tenant_id).contains("metadata", { followup_id: item.id }).limit(1);
    if (existingError) throw existingError;
    if (existing?.length) continue;
    const { error: insertError } = await supabase.from("notification_queue").insert({ tenant_id: item.tenant_id, recipient_type: "patient", recipient_id: item.patient_id, channel: item.channel, message_body: item.message_body ?? "", priority: 5, status: "pending", retry_count: 0, max_retries: 3, scheduled_at: item.scheduled_for, metadata: { followup_id: item.id, followup_type: item.followup_type, automation_rule_id: item.automation_rule_id, execution_mode: "automated", manual_review_fallback: true } });
    if (insertError) throw insertError;
    queued++;
  }
  return queued;
}

export async function runFollowupAutomation() {
  const supabase = adminClient();
  const { data: tenants, error } = await supabase.from("master_tenants").select("id,clinic_name,subscription_tier,timezone").eq("is_active", true).is("deleted_at", null);
  if (error) throw error;
  const results = [];
  for (const tenant of (tenants ?? []) as Tenant[]) results.push(await materializeTenant(supabase, tenant));
  const queued = await enqueueDue(supabase);
  return { processedTenants: results.length, tenants: results, queued };
}
