#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";

const dbUrl = process.env.SUPABASE_DB_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const ids = {
  tenant: "00000000-0000-0000-0000-00000000d340",
  auth: "00000000-0000-0000-0000-00000000d341",
  clinic: "00000000-0000-0000-0000-00000000d342",
  patient: "00000000-0000-0000-0000-00000000d343",
  visit: "00000000-0000-0000-0000-00000000d344",
};

const sqlAPath = "supabase/.ci-d3-concurrency-a.sql";
const sqlBPath = "supabase/.ci-d3-concurrency-b.sql";

function psql(sql, options = {}) {
  return spawnSync("psql", [
    dbUrl,
    "-v", "ON_ERROR_STOP=1",
    "-X",
    "-q",
    ...(options.scalar ? ["-At"] : []),
    "-c", sql,
  ], {
    stdio: options.stdio || "pipe",
    encoding: "utf8",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    timeout: 120000,
  });
}

function writeWorker(path, correlationId) {
  const sql = [
    "BEGIN;",
    "SET LOCAL ROLE authenticated;",
    "SELECT set_config('request.jwt.claims', '{\"sub\":\"" + ids.auth + "\",\"app_metadata\":{\"tenant_id\":\"" + ids.tenant + "\"}}', true);",
    "SELECT public.csapi_d3_start_clinical_work('" + ids.visit + "', '" + correlationId + "');",
    "COMMIT;",
  ].join("\n");
  writeFileSync(path, sql);
}

function runWorker(path) {
  return new Promise((resolve) => {
    const child = spawn("psql", [
      dbUrl,
      "-v", "ON_ERROR_STOP=1",
      "-X",
      "-f", path,
    ], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      resolve({ status: 1, stdout, stderr: stderr + String(error) });
    });
    child.on("close", (status) => resolve({ status: status ?? 1, stdout, stderr }));
  });
}

function cleanupFiles() {
  for (const path of [sqlAPath, sqlBPath]) {
    try { if (existsSync(path)) unlinkSync(path); } catch {}
  }
}

function setup() {
  const sql = [
    "DROP TRIGGER IF EXISTS d3_concurrency_pause_trigger ON public.clinic_visit_sessions;",
    "DROP FUNCTION IF EXISTS public.d3_concurrency_pause();",
    "DELETE FROM public.audit_trail WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.patient_flow_events WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinical_work_sessions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.patient_flow_queue_entries WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_visit_sessions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_patients WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_user_permissions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_user_permission_overrides WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_users WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.subscriptions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.tenants WHERE id='" + ids.tenant + "';",
    "DELETE FROM public.master_tenants WHERE id='" + ids.tenant + "';",
    "DELETE FROM auth.users WHERE id='" + ids.auth + "';",
    "INSERT INTO public.master_tenants(id,clinic_name,license_key,timezone,currency,country_code) VALUES ('" + ids.tenant + "','D3 Concurrency Clinic','D3-CONCURRENCY','Asia/Amman','JOD','JO');",
    "INSERT INTO public.tenants(id,clinic_name,license_key,timezone,currency,country_code,is_active) VALUES ('" + ids.tenant + "','D3 Concurrency Legacy Clinic','D3-CONCURRENCY','Asia/Amman','JOD','JO',true);",
    "INSERT INTO auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous) VALUES ('" + ids.auth + "','authenticated','authenticated','d3-concurrency@example.test',now(),'{}'::jsonb,'{}'::jsonb,now(),now(),false,false);",
    "INSERT INTO public.subscription_plans(id,plan_key,plan_name,plan_name_ar,max_users,max_devices,max_branches,modules,ai_limits,storage_gb,api_rate_limit,is_active) VALUES ('00000000-0000-0000-0000-00000000d34f','enterprise','D3 Concurrency','D3 Concurrency',100,100,100,'[\"all\"]'::jsonb,'{}'::jsonb,100,1000,true) ON CONFLICT (plan_key) DO UPDATE SET is_active=true,deleted_at=NULL;",
    "INSERT INTO public.subscriptions(id,tenant_id,plan_id,status,billing_cycle,started_at) SELECT '00000000-0000-0000-0000-00000000d34e','" + ids.tenant + "',id,'active','monthly',now() FROM public.subscription_plans WHERE plan_key='enterprise';",
    "INSERT INTO public.clinic_users(id,tenant_id,auth_user_id,full_name,role,role_id,employee_code,pin_code,is_active) VALUES ('" + ids.clinic + "','" + ids.tenant + "','" + ids.auth + "','D3 Concurrency Doctor','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1),'D3-C','0042',true);",
    "INSERT INTO public.clinic_user_permissions(tenant_id,user_id,permission_id,granted,created_by) SELECT '" + ids.tenant + "','" + ids.clinic + "',p.id,true,'" + ids.clinic + "' FROM public.permissions p WHERE p.permission_key='sessions:update';",
    "INSERT INTO public.clinic_user_permission_overrides(tenant_id,user_id,permission_id,granted,created_by) SELECT '" + ids.tenant + "','" + ids.clinic + "',p.id,true,'" + ids.clinic + "' FROM public.permissions p WHERE p.permission_key='patient_flow:clinical';",
    "INSERT INTO public.clinic_patients(id,tenant_id,first_name,last_name,phone_primary,file_number) VALUES ('" + ids.patient + "','" + ids.tenant + "','D3','Concurrency','0799000042','D3-CONCURRENCY');",
    "INSERT INTO public.clinic_visit_sessions(id,tenant_id,patient_id,doctor_id,session_status,created_at,updated_at) VALUES ('" + ids.visit + "','" + ids.tenant + "','" + ids.patient + "','" + ids.clinic + "','waiting',now(),now());",
    "INSERT INTO public.patient_flow_queue_entries(tenant_id,visit_id,operating_date,lane_key,priority_class,position,entered_at,entry_reason,routing_target,created_by_clinic_user_id) VALUES ('" + ids.tenant + "','" + ids.visit + "',CURRENT_DATE,'general','normal',1,now(),'arrival',NULL,'" + ids.clinic + "');",
    "CREATE OR REPLACE FUNCTION public.d3_concurrency_pause() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.session_status='waiting' AND NEW.session_status='in_consultation' THEN PERFORM pg_sleep(5); END IF; RETURN NEW; END; $$;",
    "CREATE TRIGGER d3_concurrency_pause_trigger AFTER UPDATE OF session_status ON public.clinic_visit_sessions FOR EACH ROW WHEN (OLD.session_status='waiting' AND NEW.session_status='in_consultation') EXECUTE FUNCTION public.d3_concurrency_pause();",
  ].join("\n");

  const result = psql(sql);
  if (result.status !== 0) throw new Error("D3 concurrency setup failed");
}

function inspect() {
  const result = psql(
    "SELECT (SELECT session_status FROM public.clinic_visit_sessions WHERE id='" + ids.visit + "' AND tenant_id='" + ids.tenant + "') || '|' || " +
    "(SELECT count(*) FROM public.clinical_work_sessions WHERE visit_id='" + ids.visit + "' AND tenant_id='" + ids.tenant + "' AND status='active') || '|' || " +
    "(SELECT count(*) FROM public.patient_flow_events WHERE visit_id='" + ids.visit + "' AND tenant_id='" + ids.tenant + "' AND event_type='clinical_started');",
    { scalar: true }
  );
  if (result.status !== 0) throw new Error("D3 concurrency inspection failed");
  const value = (result.stdout || "").trim();
  if (value !== "in_consultation|1|1") throw new Error("D3 concurrency final invariant failed: " + value);
  console.log("PASS|D3 concurrent starts|exactly one success and one active Work Session");
}

function teardown() {
  const result = psql([
    "DELETE FROM public.audit_trail WHERE tenant_id='" + ids.tenant + "';",

    "DROP TRIGGER IF EXISTS d3_concurrency_pause_trigger ON public.clinic_visit_sessions;",
    "DROP FUNCTION IF EXISTS public.d3_concurrency_pause();",
    "DELETE FROM public.patient_flow_events WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinical_work_sessions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.patient_flow_queue_entries WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_visit_sessions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_patients WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_user_permissions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_user_permission_overrides WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.clinic_users WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.subscriptions WHERE tenant_id='" + ids.tenant + "';",
    "DELETE FROM public.tenants WHERE id='" + ids.tenant + "';",
    "DELETE FROM public.master_tenants WHERE id='" + ids.tenant + "';",
    "DELETE FROM auth.users WHERE id='" + ids.auth + "';",
  ].join("\n"));
  if (result.status !== 0) console.error("D3 concurrency teardown reported a cleanup failure");
}

async function main() {
  console.log("D3_DATABASE_CONCURRENCY=START");
  console.log("TARGET=LOCAL_SUPABASE_ONLY");
  console.log("HOSTED_SUPABASE_MUTATION=NONE");
  console.log("VERCEL=NOT_USED");

  cleanupFiles();
  try {
    setup();
    writeWorker(sqlAPath, "00000000-0000-0000-0000-00000000e341");
    writeWorker(sqlBPath, "00000000-0000-0000-0000-00000000e342");

    const [a, b] = await Promise.all([runWorker(sqlAPath), runWorker(sqlBPath)]);
    const successes = [a, b].filter((result) => result.status === 0).length;
    const failures = [a, b].filter((result) => result.status !== 0).length;

    console.log("D3_CONCURRENCY_WORKER_A_EXIT=" + a.status);
    console.log("D3_CONCURRENCY_WORKER_B_EXIT=" + b.status);

    if (successes !== 1 || failures !== 1) {
      console.error("WORKER_A_STDERR=" + a.stderr.trim());
      console.error("WORKER_B_STDERR=" + b.stderr.trim());
      throw new Error("D3 concurrency expected exactly one success and one failure");
    }

    inspect();
    console.log("D3_DATABASE_CONCURRENCY=PASS");
  } finally {
    teardown();
    cleanupFiles();
  }
}

main().catch((error) => {
  console.error("D3_DATABASE_CONCURRENCY=FAIL " + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
