#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const timeout = Number(process.env.GATE04_DATABASE_TIMEOUT_MS || 900000);
let started = false;
const checks = [];
function log(name, status, detail = "") {
  checks.push({ name, status, detail });
  console.log(`GATE04_DB_CHECK=${name} STATUS=${status}${detail ? " DETAIL=" + detail : ""}`);
}
function run(command, args, { capture = false, timeoutMs = timeout } = {}) {
  return spawnSync(command, args, {
    shell: false,
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
    encoding: capture ? "utf8" : undefined,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    timeout: timeoutMs,
    killSignal: "SIGTERM",
  });
}
function requireSuccess(name, command, args, options = {}) {
  const result = run(command, args, options);
  const code = result.status ?? 1;
  if (code !== 0) {
    const detail = `${command} ${args.join(" ")} exited ${code}: ${(result.stderr || result.stdout || "").slice(-1800)}`;
    log(name, "FAIL", detail.replace(/\s+/g, " "));
    throw new Error(`GATE04_DATABASE_CHECK_FAILED=${name}`);
  }
  log(name, "PASS");
  return result;
}

try {
  if (!process.env.CI) {
    throw new Error("This destructive database replay verifier is CI-only; refusing to run outside CI.");
  }
  started = true;
  requireSuccess("local-supabase-start", "npx", ["--yes", "supabase@latest", "start", "--debug"], { capture: true });

  const statusResult = requireSuccess("local-supabase-status", "npx", ["--yes", "supabase@latest", "status", "-o", "json"], { capture: true });
  const info = JSON.parse(statusResult.stdout);
  if (!info.API_URL || !/localhost|127\.0\.0\.1/.test(info.API_URL) || /supabase\.co/i.test(info.API_URL)) {
    throw new Error(`GATE04_DATABASE_SAFETY_GUARD_FAILED API_URL=${info.API_URL || "missing"}`);
  }
  log("local-database-target-verified", "PASS", info.API_URL);

  requireSuccess("clean-local-migration-replay", "npx", ["--yes", "supabase@latest", "db", "reset", "--local", "--no-seed"]);

  const sql = `
    WITH command_functions AS (
      SELECT p.oid, p.proname, p.prosecdef, p.proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname IN (
          'agenda_create_appointment',
          'agenda_update_appointment',
          'agenda_transition_appointment',
          'agenda_cancel_appointment'
        )
    ),
    function_check AS (
      SELECT
        count(*) = 4
        AND bool_and(prosecdef)
        AND bool_and(array_to_string(proconfig, ',') LIKE '%search_path=pg_catalog, public%')
        AND bool_and(NOT has_function_privilege('anon', oid, 'EXECUTE'))
        AND bool_and(NOT has_function_privilege('authenticated', oid, 'EXECUTE'))
        AND bool_and(has_function_privilege('service_role', oid, 'EXECUTE')) AS ok
      FROM command_functions
    ),
    acl_check AS (
      SELECT
        NOT has_table_privilege('anon', 'public.master_agenda_events', 'INSERT')
        AND NOT has_table_privilege('anon', 'public.master_agenda_events', 'UPDATE')
        AND NOT has_table_privilege('anon', 'public.master_agenda_events', 'DELETE')
        AND NOT has_table_privilege('authenticated', 'public.master_agenda_events', 'INSERT')
        AND NOT has_table_privilege('authenticated', 'public.master_agenda_events', 'UPDATE')
        AND NOT has_table_privilege('authenticated', 'public.master_agenda_events', 'DELETE')
        AND NOT has_table_privilege('service_role', 'public.master_agenda_events', 'INSERT')
        AND NOT has_table_privilege('service_role', 'public.master_agenda_events', 'UPDATE')
        AND NOT has_table_privilege('service_role', 'public.master_agenda_events', 'DELETE') AS ok
    ),
    audit_check AS (
      SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_schema = 'public'
          AND event_object_table = 'master_agenda_events'
          AND trigger_name = 'tr_audit_agenda'
          AND action_timing = 'AFTER'
          AND event_manipulation = 'INSERT'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_schema = 'public'
          AND event_object_table = 'master_agenda_events'
          AND trigger_name = 'tr_audit_agenda'
          AND event_manipulation = 'UPDATE'
      ) AS ok
    ),
    rls_check AS (
      SELECT c.relrowsecurity AS ok
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'master_agenda_events'
    )
    SELECT json_build_object(
      'command_boundary', (SELECT ok FROM function_check),
      'table_write_acl', (SELECT ok FROM acl_check),
      'agenda_audit_trigger', (SELECT ok FROM audit_check),
      'agenda_rls_enabled', (SELECT ok FROM rls_check)
    )::text;
  `;
  const psql = requireSuccess("inspect-local-schema-security", "psql", [
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "-v", "ON_ERROR_STOP=1", "-At", "-c", sql,
  ], { capture: true });
  const lastLine = (psql.stdout || "").trim().split("\n").filter(Boolean).at(-1);
  const result = JSON.parse(lastLine || "{}");
  for (const [key, value] of Object.entries(result)) log(key, value ? "PASS" : "FAIL");
  if (Object.values(result).some((value) => value !== true)) {
    throw new Error("GATE04_DATABASE_SECURITY_ASSERTIONS_FAILED");
  }
} catch (error) {
  log("database-verifier", "FAIL", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (started) {
    const stopped = run("npx", ["--yes", "supabase@latest", "stop", "--no-backup"], { timeoutMs: 180000 });
    if ((stopped.status ?? 1) === 0) log("local-supabase-stop", "PASS");
    else {
      log("local-supabase-stop", "FAIL", `exit ${stopped.status ?? "unknown"}`);
      process.exitCode = 1;
    }
  }
  const failures = checks.filter((item) => item.status === "FAIL");
  console.log(JSON.stringify({
    audit: "csapi-gate04-database-verification",
    completed_at: new Date().toISOString(),
    status: failures.length ? "FAIL" : "PASS",
    checks,
  }, null, 2));
}
