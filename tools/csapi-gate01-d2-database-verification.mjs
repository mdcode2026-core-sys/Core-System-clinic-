#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const container = "csapi-gate01-d2-postgres";
const baseline = [
  "supabase/migrations/20260721100539_remote_schema.sql",
  "supabase/migrations/20260721112514_remote_schema.sql",
];
const migration = "supabase/migrations/20260917192500_csapi_gate01_patient_flow_d2_foundations.sql";
const test = "supabase/tests/csapi_gate01_d2_database_foundations.sql";

function docker(args, input) {
  return execFileSync("docker", args, { input, stdio: input === undefined ? "inherit" : ["pipe", "inherit", "inherit"], encoding: "utf8" });
}
function psql(sql, user = "postgres") {
  return docker(["exec", "-i", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", user, "-d", "postgres"], sql);
}
function applyFile(path, user) {
  psql(readFileSync(path, "utf8"), user);
}

try {
  docker(["run", "-d", "--name", container, "--shm-size=64m", "-e", "POSTGRES_PASSWORD=postgres", "-e", "POSTGRES_DB=postgres", "-p", "54322:5432", "ghcr.io/supabase/postgres:17.6.1.141", "-c", "shared_preload_libraries=pg_net", "-c", "shared_buffers=32MB", "-c", "max_connections=20", "-c", "work_mem=1MB", "-c", "maintenance_work_mem=16MB"]);

  for (let i = 0; i < 60; i += 1) {
    try {
      docker(["exec", container, "pg_isready", "-U", "postgres", "-d", "postgres"], undefined);
      break;
    } catch {
      if (i === 59) throw new Error("Postgres did not become ready within 120 seconds");
      execFileSync("sleep", ["2"]);
    }
  }

  psql("do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if; end $$;\ndo $$ begin if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if; end $$;\ncreate extension if not exists pgtap;\n");
  for (const file of baseline) applyFile(file, "supabase_admin");
  psql("create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;\ncreate or replace function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;\ngrant execute on function auth.jwt() to anon, authenticated;\ngrant execute on function auth.uid() to anon, authenticated;\n");
  applyFile(migration, "postgres");

  const tap = execFileSync("docker", ["exec", "-i", container, "psql", "-X", "-v", "ON_ERROR_STOP=1", "-t", "-A", "-U", "postgres", "-d", "postgres"], { input: readFileSync(test, "utf8"), encoding: "utf8" });
  process.stdout.write(tap);
  if (/^not ok/m.test(tap)) throw new Error("D2 pgTAP reported one or more failing assertions");
  if (!/^1\.\.35$/m.test(tap)) throw new Error("D2 pgTAP plan did not report exactly 35 assertions");

  psql("select to_regclass('public.clinical_work_sessions'), to_regclass('public.patient_flow_queue_entries'), to_regclass('public.patient_flow_events');");
  console.log("D2_DATABASE_VERIFICATION=PASS assertions=35");
} finally {
  try { docker(["rm", "-f", container], undefined); } catch {}
}
