#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

const timeout = Number(process.env.GATE04_DATABASE_TIMEOUT_MS || 900000);
let started = false;
let originalSupabaseConfig = null;
let createdSupabaseConfig = false;
const supabaseConfigPath = "supabase/config.toml";
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

function runAsync(command, args, { timeoutMs = timeout } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      shell: false,
      env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ...result, stdout, stderr });
    };
    const timer = setTimeout(() => {
      stderr += "\\nGATE04_CONCURRENCY_CHILD_TIMEOUT";
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => finish({ status: null, error: error.message }));
    child.on("close", (code, signal) => finish({
      status: code,
      signal,
      error: code === null ? `child terminated by ${signal || "unknown signal"}` : undefined,
    }));
  });
}

try {
  if (!process.env.CI) {
    throw new Error("This destructive database replay verifier is CI-only; refusing to run outside CI.");
  }
  if (!existsSync(supabaseConfigPath)) {
    createdSupabaseConfig = true;
    requireSuccess("initialize-local-supabase-config", "npx", ["--yes", "supabase@latest", "init"]);
  }
  originalSupabaseConfig = readFileSync(supabaseConfigPath, "utf8");
  if (!/^project_id\s*=.*$/m.test(originalSupabaseConfig)) {
    throw new Error("GATE04_DATABASE_CONFIG_INVALID: project_id missing from supabase/config.toml");
  }
  writeFileSync(supabaseConfigPath, originalSupabaseConfig.replace(/^project_id\s*=.*$/m, 'project_id = "core-system-gate04-ci"'));
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
    audit_read_policy_check AS (
      SELECT
        NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'audit_trail'
            AND policyname = 'rls_breaches_isolation' AND cmd = 'ALL'
        )
        AND EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'audit_trail'
            AND policyname = 'rls_audit_read' AND cmd = 'SELECT'
        )
        AND EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'audit_trail'
            AND policyname = 'rls_audit_insert_isolation' AND cmd = 'INSERT'
        )
        AND EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'audit_trail'
            AND policyname = 'rls_audit_update_isolation' AND cmd = 'UPDATE'
        )
        AND EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'audit_trail'
            AND policyname = 'rls_audit_delete_isolation' AND cmd = 'DELETE'
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
      'audit_read_policy_boundary', (SELECT ok FROM audit_read_policy_check),
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
  const commandFlowSql = `
    BEGIN;
    DO $gate04_seed$
    DECLARE
      v_tenant_id uuid := 'd4000000-0000-4000-8000-000000000001';
      v_auth_user_id uuid := 'd4000000-0000-4000-8000-000000000002';
      v_clinic_user_id uuid := 'd4000000-0000-4000-8000-000000000003';
      v_patient_id uuid := 'd4000000-0000-4000-8000-000000000004';
      v_role_id uuid := 'd4000000-0000-4000-8000-000000000005';
      v_patient_doctor_probe_id uuid := 'd4000000-0000-4000-8000-000000000009';
      v_patient_room_probe_id uuid := 'd4000000-0000-4000-8000-00000000000a';
      v_patient_resource_probe_id uuid := 'd4000000-0000-4000-8000-00000000000b';
      v_room_id uuid := 'd4000000-0000-4000-8000-00000000000c';
      v_resource_id uuid := 'd4000000-0000-4000-8000-00000000000d';
      v_plan_id uuid := 'd4000000-0000-4000-8000-000000000006';
      v_limited_auth_user_id uuid := 'd4000000-0000-4000-8000-000000000015';
      v_limited_clinic_user_id uuid := 'd4000000-0000-4000-8000-000000000016';
      v_limited_role_id uuid := 'd4000000-0000-4000-8000-000000000017';
      v_permission_id uuid;
      v_permission_key text;
      v_suffix text := replace(gen_random_uuid()::text, '-', '');
    BEGIN
      INSERT INTO auth.users (id, aud, role, email, created_at, updated_at)
      VALUES (v_auth_user_id, 'authenticated', 'authenticated',
        'gate04-ci-' || v_suffix || '@example.test', now(), now());
      INSERT INTO public.master_tenants (id, clinic_name, license_key, timezone)
      VALUES (v_tenant_id, 'Gate 04 local test', 'GATE04-CI-' || v_suffix, 'Asia/Amman');
      INSERT INTO public.roles (id, role_key, role_name, tenant_id, is_system_role)
      VALUES (v_role_id, 'gate04_ci_' || v_suffix, 'Gate 04 local test role', v_tenant_id, false);
      INSERT INTO public.subscription_plans (id, plan_key, plan_name, modules, is_active)
      VALUES (v_plan_id, 'gate04-ci-' || v_suffix, 'Gate 04 local test plan', '["basic"]'::jsonb, true);
      INSERT INTO public.subscriptions (tenant_id, plan_id, status, started_at)
      VALUES (v_tenant_id, v_plan_id, 'active', now());
      INSERT INTO public.clinic_users (
        id, tenant_id, full_name, role, employee_code, pin_code, role_id, auth_user_id, is_active
      ) VALUES (v_clinic_user_id, v_tenant_id, 'Gate 04 local test actor', 'gate04_ci',
        'G4-' || substr(v_suffix, 1, 12), '1234', v_role_id, v_auth_user_id, true);

      -- This valid in-tenant actor deliberately has no role/direct/override grants.
      INSERT INTO auth.users (id, aud, role, email, created_at, updated_at)
      VALUES (v_limited_auth_user_id, 'authenticated', 'authenticated',
        'gate04-limited-' || v_suffix || '@example.test', now(), now());
      INSERT INTO public.roles (id, role_key, role_name, tenant_id, is_system_role)
      VALUES (v_limited_role_id, 'gate04_limited_' || v_suffix,
        'Gate 04 limited test role', v_tenant_id, false);
      INSERT INTO public.clinic_users (
        id, tenant_id, full_name, role, employee_code, pin_code, role_id, auth_user_id, is_active
      ) VALUES (
        v_limited_clinic_user_id, v_tenant_id, 'Gate 04 limited test actor', 'gate04_limited',
        'G4L-' || substr(v_suffix, 1, 12), '1234', v_limited_role_id, v_limited_auth_user_id, true
      );

      INSERT INTO public.clinic_patients (id, tenant_id, first_name, last_name, phone_primary)
      VALUES (v_patient_id, v_tenant_id, 'Gate', 'Four',
        '+96279' || lpad((random() * 9999999)::integer::text, 7, '0'));

      -- A second tenant/patient proves command-level reference isolation.
      INSERT INTO public.master_tenants (id, clinic_name, license_key, timezone)
      VALUES ('d4000000-0000-4000-8000-000000000007', 'Gate 04 other tenant',
        'GATE04-CI-OTHER-' || v_suffix, 'Asia/Amman');
      INSERT INTO public.clinic_patients (id, tenant_id, first_name, last_name, phone_primary)
      VALUES ('d4000000-0000-4000-8000-000000000008',
        'd4000000-0000-4000-8000-000000000007', 'Other', 'Tenant',
        '+96278' || lpad((random() * 9999999)::integer::text, 7, '0'));

      -- A real active clinic user in the other tenant makes the provider-isolation
      -- negative probe independent of missing/random identifiers.
      INSERT INTO auth.users (id, aud, role, email, created_at, updated_at)
      VALUES ('d4000000-0000-4000-8000-000000000012', 'authenticated', 'authenticated',
        'gate04-other-provider-' || v_suffix || '@example.test', now(), now());
      INSERT INTO public.roles (id, role_key, role_name, tenant_id, is_system_role)
      VALUES ('d4000000-0000-4000-8000-000000000014',
        'gate04_other_ci_' || v_suffix, 'Gate 04 other tenant role',
        'd4000000-0000-4000-8000-000000000007', false);
      INSERT INTO public.clinic_users (
        id, tenant_id, full_name, role, employee_code, pin_code, role_id, auth_user_id, is_active
      ) VALUES (
        'd4000000-0000-4000-8000-000000000013',
        'd4000000-0000-4000-8000-000000000007',
        'Gate 04 other tenant provider', 'gate04_other_ci',
        'G4O-' || substr(v_suffix, 1, 12), '1234',
        'd4000000-0000-4000-8000-000000000014',
        'd4000000-0000-4000-8000-000000000012', true
      );

      -- Real room/resource references in the other tenant exercise tenant guards,
      -- rather than relying on random UUIDs that do not exist anywhere.
      INSERT INTO public.clinic_rooms (
        id, tenant_id, room_name, room_type, floor_number, capacity, is_active
      ) VALUES (
        'd4000000-0000-4000-8000-000000000010',
        'd4000000-0000-4000-8000-000000000007',
        'Gate 04 other-tenant room', 'procedure', 1, 1, true
      );
      INSERT INTO public.clinic_resources (
        id, tenant_id, resource_name, resource_type, status
      ) VALUES (
        'd4000000-0000-4000-8000-000000000011',
        'd4000000-0000-4000-8000-000000000007',
        'Gate 04 other-tenant device', 'laser_device', 'active'
      );

      -- Dedicated patients keep dimension-specific conflicts independent of patient overlap.
      INSERT INTO public.clinic_patients (id, tenant_id, first_name, last_name, phone_primary)
      VALUES
        ('d4000000-0000-4000-8000-000000000009', v_tenant_id, 'Doctor', 'Probe', '+96279' || lpad((random() * 9999999)::integer::text, 7, '0')),
        ('d4000000-0000-4000-8000-00000000000a', v_tenant_id, 'Room', 'Probe', '+96279' || lpad((random() * 9999999)::integer::text, 7, '0')),
        ('d4000000-0000-4000-8000-00000000000b', v_tenant_id, 'Resource', 'Probe', '+96279' || lpad((random() * 9999999)::integer::text, 7, '0'));
      INSERT INTO public.clinic_rooms (id, tenant_id, room_name, room_type, floor_number, capacity, is_active)
      VALUES (v_room_id, v_tenant_id, 'Gate 04 conflict probe room', 'procedure', 1, 1, true);
      INSERT INTO public.clinic_resources (id, tenant_id, resource_name, resource_type, status)
      VALUES (v_resource_id, v_tenant_id, 'Gate 04 conflict probe device', 'laser_device', 'active');

      SELECT id INTO v_permission_id FROM public.permissions
        WHERE permission_key = 'agenda:create' AND deleted_at IS NULL LIMIT 1;
      IF v_permission_id IS NULL THEN RAISE EXCEPTION 'GATE04_TEST_PERMISSION_MISSING=agenda:create'; END IF;
      INSERT INTO public.clinic_user_permission_overrides (tenant_id, user_id, permission_id, granted)
      VALUES (v_tenant_id, v_clinic_user_id, v_permission_id, true);

      SELECT id INTO v_permission_id FROM public.permissions
        WHERE permission_key = 'agenda:update' AND deleted_at IS NULL LIMIT 1;
      IF v_permission_id IS NULL THEN RAISE EXCEPTION 'GATE04_TEST_PERMISSION_MISSING=agenda:update'; END IF;
      INSERT INTO public.clinic_user_permission_overrides (tenant_id, user_id, permission_id, granted)
      VALUES (v_tenant_id, v_clinic_user_id, v_permission_id, true);

      -- Grant only the existing Visit/Patient Flow permissions needed to prove
      -- Agenda-owned booking -> Visit reference -> D3 Patient Flow arrival.
      -- This is a local rollback-only fixture; no role catalogue or policy changes.
      FOR v_permission_key IN
        SELECT unnest(ARRAY['agenda:read','sessions:read','sessions:create','sessions:update','patient_flow:operations']::text[])
      LOOP
        SELECT id INTO v_permission_id
        FROM public.permissions
        WHERE permission_key = v_permission_key AND deleted_at IS NULL
        LIMIT 1;
        IF v_permission_id IS NULL THEN
          RAISE EXCEPTION 'GATE04_TEST_PERMISSION_MISSING=%', v_permission_key;
        END IF;
        INSERT INTO public.clinic_user_permission_overrides (tenant_id, user_id, permission_id, granted)
        VALUES (v_tenant_id, v_clinic_user_id, v_permission_id, true);
      END LOOP;
    END;
    $gate04_seed$;

    SELECT set_config('request.jwt.claim.role', 'authenticated', true);
    SELECT set_config('request.jwt.claim.sub', 'd4000000-0000-4000-8000-000000000002', true);
    SELECT set_config('request.jwt.claims',
      '{"sub":"d4000000-0000-4000-8000-000000000002","role":"authenticated","aud":"authenticated"}', true);
    SET LOCAL ROLE authenticated;

    DO $gate04_negative$
    BEGIN
      BEGIN
        PERFORM public.agenda_create_appointment(
          'd4000000-0000-4000-8000-000000000001',
          'd4000000-0000-4000-8000-000000000003',
          'd4000000-0000-4000-8000-000000000004',
          NULL, NULL, NULL, NULL, NULL,
          now() + interval '1 day',
          now() + interval '1 day 30 minutes',
          now() + interval '1 day 30 minutes',
          'browser direct RPC probe'
        );
        RAISE EXCEPTION 'GATE04_CLIENT_RPC_WAS_ALLOWED';
      EXCEPTION WHEN insufficient_privilege THEN NULL;
      END;

      BEGIN
        INSERT INTO public.master_agenda_events (id) VALUES (gen_random_uuid());
        RAISE EXCEPTION 'GATE04_DIRECT_TABLE_WRITE_WAS_ALLOWED';
      EXCEPTION WHEN insufficient_privilege THEN NULL;
      END;
    END;
    $gate04_negative$;

    RESET ROLE;
    SELECT set_config('request.jwt.claim.role', 'service_role', true);
    SET LOCAL ROLE service_role;

    DO $gate04_flow$
    DECLARE
      v_tenant_id uuid := 'd4000000-0000-4000-8000-000000000001';
      v_clinic_user_id uuid := 'd4000000-0000-4000-8000-000000000003';
      v_patient_id uuid := 'd4000000-0000-4000-8000-000000000004';
      v_other_patient_id uuid := 'd4000000-0000-4000-8000-000000000008';
      v_patient_doctor_probe_id uuid := 'd4000000-0000-4000-8000-000000000009';
      v_patient_room_probe_id uuid := 'd4000000-0000-4000-8000-00000000000a';
      v_patient_resource_probe_id uuid := 'd4000000-0000-4000-8000-00000000000b';
      v_room_id uuid := 'd4000000-0000-4000-8000-00000000000c';
      v_resource_id uuid := 'd4000000-0000-4000-8000-00000000000d';
      v_limited_auth_user_id uuid := 'd4000000-0000-4000-8000-000000000015';
      v_limited_clinic_user_id uuid := 'd4000000-0000-4000-8000-000000000016';
      v_event public.master_agenda_events%ROWTYPE;
      v_no_show_event public.master_agenda_events%ROWTYPE;
      v_no_show_overlap public.master_agenda_events%ROWTYPE;
      v_reschedule_event public.master_agenda_events%ROWTYPE;
      v_buffer_event public.master_agenda_events%ROWTYPE;
      v_buffer_after_event public.master_agenda_events%ROWTYPE;
      v_late_event public.master_agenda_events%ROWTYPE;
      v_overrun_event public.master_agenda_events%ROWTYPE;
      v_workforce_event public.master_agenda_events%ROWTYPE;
      v_workforce_planned_start timestamptz;
      v_workforce_planned_end timestamptz;
      v_workforce_event_count integer;
      v_workforce_booking_rejected boolean := false;
      v_planned_start timestamptz;
      v_planned_end timestamptz;
      v_count integer;
      v_status text;
    BEGIN
      -- Reject a patient belonging to a different tenant before persistence.
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_other_patient_id,
          NULL, NULL, NULL, NULL, NULL,
          now() + interval '3 days',
          now() + interval '3 days 30 minutes',
          now() + interval '3 days 30 minutes',
          'gate04 cross-tenant patient probe'
        );
        RAISE EXCEPTION 'GATE04_CROSS_TENANT_PATIENT_WAS_ACCEPTED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_CROSS_TENANT_PATIENT_WAS_ACCEPTED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_PATIENT_NOT_FOUND_IN_TENANT%' THEN RAISE; END IF;
      END;

      -- An active provider belonging to another tenant must not be accepted.
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_id,
          'd4000000-0000-4000-8000-000000000013', NULL, NULL, NULL, NULL,
          now() + interval '3 days',
          now() + interval '3 days 30 minutes',
          now() + interval '3 days 30 minutes',
          'gate04 cross-tenant provider probe'
        );
        RAISE EXCEPTION 'GATE04_CROSS_TENANT_PROVIDER_WAS_ACCEPTED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_CROSS_TENANT_PROVIDER_WAS_ACCEPTED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_PROVIDER_NOT_FOUND_IN_TENANT%' THEN RAISE; END IF;
      END;

      -- Existing references from another tenant must be rejected even when they are real active rows.
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_id,
          NULL, 'd4000000-0000-4000-8000-000000000010', NULL, NULL, NULL,
          now() + interval '4 days',
          now() + interval '4 days 30 minutes',
          now() + interval '4 days 30 minutes',
          'gate04 cross-tenant room probe'
        );
        RAISE EXCEPTION 'GATE04_CROSS_TENANT_ROOM_WAS_ACCEPTED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_CROSS_TENANT_ROOM_WAS_ACCEPTED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_ROOM_NOT_AVAILABLE%' THEN RAISE; END IF;
      END;

      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_id,
          NULL, NULL, 'd4000000-0000-4000-8000-000000000011', NULL, NULL,
          now() + interval '5 days',
          now() + interval '5 days 30 minutes',
          now() + interval '5 days 30 minutes',
          'gate04 cross-tenant resource probe'
        );
        RAISE EXCEPTION 'GATE04_CROSS_TENANT_RESOURCE_WAS_ACCEPTED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_CROSS_TENANT_RESOURCE_WAS_ACCEPTED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_RESOURCE_UNAVAILABLE%' THEN RAISE; END IF;
      END;

      SELECT * INTO v_event
      FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_id,
        NULL, NULL, NULL, NULL, NULL,
        now() + interval '1 day',
        now() + interval '1 day 30 minutes',
        now() + interval '1 day 30 minutes',
        'gate04 authenticated command test'
      );
      IF v_event.id IS NULL OR v_event.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_CREATE_COMMAND_FAILED';
      END IF;

      -- A valid tenant member without agenda:create must be rejected by the canonical command.
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_limited_clinic_user_id, v_patient_id,
          NULL, NULL, NULL, NULL, NULL,
          now() + interval '2 days',
          now() + interval '2 days 30 minutes',
          now() + interval '2 days 30 minutes',
          'gate04 denied create probe'
        );
        RAISE EXCEPTION 'GATE04_CREATE_WITHOUT_PERMISSION_WAS_ALLOWED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_CREATE_WITHOUT_PERMISSION_WAS_ALLOWED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_PERMISSION_DENIED%' THEN
          RAISE EXCEPTION 'GATE04_CREATE_PERMISSION_DENIAL_UNEXPECTED_ERROR=%', SQLERRM;
        END IF;
      END;

      -- The same unprivileged actor must not update an existing appointment without agenda:update.
      BEGIN
        PERFORM public.agenda_update_appointment(
          v_tenant_id, v_limited_clinic_user_id, v_event.id, 'scheduled',
          v_patient_id, NULL, NULL, NULL, NULL,
          v_event.scheduled_start, v_event.scheduled_end, v_event.buffer_end,
          v_event.booking_notes, false
        );
        RAISE EXCEPTION 'GATE04_UPDATE_WITHOUT_PERMISSION_WAS_ALLOWED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_UPDATE_WITHOUT_PERMISSION_WAS_ALLOWED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_PERMISSION_DENIED%' THEN
          RAISE EXCEPTION 'GATE04_UPDATE_PERMISSION_DENIAL_UNEXPECTED_ERROR=%', SQLERRM;
        END IF;
      END;

      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_event.id AND action = 'CREATE'
        AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_CREATE_AUDIT_FAILED count=%', v_count; END IF;

      -- Exercise a normal update separately from lifecycle transition/reschedule.
      PERFORM public.agenda_update_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled',
        v_patient_id, NULL, NULL, NULL, NULL,
        now() + interval '1 day 5 minutes',
        now() + interval '1 day 35 minutes',
        now() + interval '1 day 35 minutes',
        'gate04 normal update probe', false
      );
      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_event.id AND action = 'UPDATE'
        AND reason = 'appointment_updated'
        AND new_values ->> 'booking_notes' = 'gate04 normal update probe'
        AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_UPDATE_AUDIT_FAILED count=%', v_count; END IF;

      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled', 'confirmed'
      );
      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_event.id AND action = 'STATUS_CHANGE'
        AND new_values ->> 'status' = 'confirmed' AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_STATUS_AUDIT_FAILED count=%', v_count; END IF;

      -- A stale client expectation must not override the persisted status.
      BEGIN
        PERFORM public.agenda_transition_appointment(
          v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled', 'cancelled'
        );
        RAISE EXCEPTION 'GATE04_STALE_EXPECTED_STATUS_WAS_ACCEPTED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_STALE_EXPECTED_STATUS_WAS_ACCEPTED' THEN RAISE; END IF;
        IF SQLERRM NOT LIKE '%AGENDA_STATE_CONFLICT%' THEN RAISE; END IF;
      END;

      PERFORM public.agenda_cancel_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'confirmed', 'gate04 cancellation probe'
      );
      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_event.id AND action = 'CANCEL'
        AND reason = 'gate04 cancellation probe' AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_CANCEL_AUDIT_FAILED count=%', v_count; END IF;

      -- Rebooking a cancelled appointment restores the same appointment to scheduled.
      PERFORM public.agenda_update_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'cancelled',
        v_patient_id, NULL, NULL, NULL, NULL,
        now() + interval '2 days',
        now() + interval '2 days 30 minutes',
        now() + interval '2 days 30 minutes',
        'gate04 rebooking probe', true
      );
      SELECT status INTO v_status
      FROM public.master_agenda_events WHERE id = v_event.id AND tenant_id = v_tenant_id;
      IF v_status IS DISTINCT FROM 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_REBOOK_STATUS_FAILED status=%', v_status;
      END IF;
      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_event.id AND action = 'RESCHEDULE'
        AND old_values ->> 'status' = 'cancelled'
        AND new_values ->> 'status' = 'scheduled'
        AND reason = 'appointment_rescheduled'
        AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_REBOOK_AUDIT_FAILED count=%', v_count; END IF;

      -- A normal reschedule of a confirmed appointment is a distinct audited mutation.
      SELECT * INTO v_reschedule_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_resource_probe_id, NULL, NULL, NULL, NULL, NULL,
        now() + interval '8 days', now() + interval '8 days 30 minutes', now() + interval '8 days 30 minutes',
        'gate04 normal reschedule original');
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_reschedule_event.id, 'scheduled', 'confirmed');
      SELECT * INTO v_reschedule_event FROM public.agenda_update_appointment(
        v_tenant_id, v_clinic_user_id, v_reschedule_event.id, 'confirmed',
        v_patient_resource_probe_id, NULL, NULL, NULL, NULL,
        now() + interval '8 days 2 hours',
        now() + interval '8 days 2 hours 30 minutes',
        now() + interval '8 days 2 hours 30 minutes',
        'gate04 normal reschedule moved', true);
      IF v_reschedule_event.status IS DISTINCT FROM 'rescheduled' THEN
        RAISE EXCEPTION 'GATE04_NORMAL_RESCHEDULE_STATUS_FAILED status=%', v_reschedule_event.status;
      END IF;
      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_reschedule_event.id AND action = 'RESCHEDULE'
        AND old_values ->> 'status' = 'confirmed'
        AND new_values ->> 'status' = 'rescheduled'
        AND reason = 'appointment_rescheduled'
        AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_NORMAL_RESCHEDULE_AUDIT_FAILED count=%', v_count; END IF;
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_reschedule_event.id, 'rescheduled', 'scheduled');
      SELECT status INTO v_status FROM public.master_agenda_events
      WHERE id = v_reschedule_event.id AND tenant_id = v_tenant_id;
      IF v_status IS DISTINCT FROM 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_RESCHEDULED_REBOOK_STATUS_FAILED status=%', v_status;
      END IF;

      -- No-show is a permitted status transition, is audited, and releases provider overlap.
      SELECT * INTO v_no_show_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_doctor_probe_id, v_clinic_user_id, NULL, NULL, NULL, NULL,
        now() + interval '7 days', now() + interval '7 days 30 minutes', now() + interval '7 days 30 minutes',
        'gate04 no-show transition original');
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_no_show_event.id, 'scheduled', 'confirmed');
      SELECT * INTO v_no_show_event FROM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_no_show_event.id, 'confirmed', 'no_show');
      IF v_no_show_event.status IS DISTINCT FROM 'no_show' THEN
        RAISE EXCEPTION 'GATE04_NO_SHOW_STATUS_FAILED status=%', v_no_show_event.status;
      END IF;
      SELECT count(*) INTO v_count
      FROM public.audit_trail
      WHERE tenant_id = v_tenant_id AND table_name = 'master_agenda_events'
        AND record_id = v_no_show_event.id AND action = 'STATUS_CHANGE'
        AND new_values ->> 'status' = 'no_show'
        AND actor_id = v_clinic_user_id;
      IF v_count <> 1 THEN RAISE EXCEPTION 'GATE04_NO_SHOW_AUDIT_FAILED count=%', v_count; END IF;
      SELECT * INTO v_no_show_overlap FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_room_probe_id, v_clinic_user_id, NULL, NULL, NULL, NULL,
        now() + interval '7 days 5 minutes', now() + interval '7 days 35 minutes', now() + interval '7 days 35 minutes',
        'gate04 no-show provider interval released');
      IF v_no_show_overlap.id IS NULL OR v_no_show_overlap.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_NO_SHOW_PROVIDER_INTERVAL_STILL_BLOCKS';
      END IF;

      -- Buffer time is exclusive capacity: a booking inside the buffer is rejected,
      -- while a booking starting after the buffer end is accepted.
      SELECT * INTO v_buffer_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_id, NULL, NULL, v_resource_id, NULL, NULL,
        now() + interval '10 days',
        now() + interval '10 days 30 minutes',
        now() + interval '10 days 45 minutes',
        'gate04 buffer owner');
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_doctor_probe_id, NULL, NULL, v_resource_id, NULL, NULL,
          now() + interval '10 days 35 minutes',
          now() + interval '10 days 65 minutes',
          now() + interval '10 days 65 minutes',
          'gate04 booking inside buffer must fail');
        RAISE EXCEPTION 'GATE04_BUFFER_CONFLICT_WAS_ACCEPTED';
      EXCEPTION WHEN exclusion_violation THEN
        NULL;
      END;
      SELECT * INTO v_buffer_after_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_room_probe_id, NULL, NULL, v_resource_id, NULL, NULL,
        now() + interval '10 days 50 minutes',
        now() + interval '10 days 80 minutes',
        now() + interval '10 days 80 minutes',
        'gate04 booking after buffer accepted');
      IF v_buffer_after_event.id IS NULL OR v_buffer_after_event.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_BOOKING_AFTER_BUFFER_FAILED';
      END IF;

      -- Arrival records lifecycle progress but never rewrites the planned appointment time.
      SELECT * INTO v_late_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_resource_probe_id, v_clinic_user_id, NULL, NULL, NULL, NULL,
        now() + interval '11 days',
        now() + interval '11 days 30 minutes',
        now() + interval '11 days 30 minutes',
        'gate04 late arrival preserves planned time');
      v_planned_start := v_late_event.scheduled_start;
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_late_event.id, 'scheduled', 'confirmed');
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_late_event.id, 'confirmed', 'arrived');
      SELECT scheduled_start INTO v_planned_start
      FROM public.master_agenda_events
      WHERE id = v_late_event.id AND tenant_id = v_tenant_id;
      IF v_planned_start IS DISTINCT FROM v_late_event.scheduled_start THEN
        RAISE EXCEPTION 'GATE04_LATE_ARRIVAL_CHANGED_PLANNED_TIME';
      END IF;

      -- Scenario 19: an appointment that is still in session after its planned end
      -- remains the same Agenda record; overrun does not create a second scheduler state.
      SELECT * INTO v_overrun_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_resource_probe_id, NULL, NULL, NULL, NULL, NULL,
        now() - interval '60 minutes',
        now() - interval '30 minutes',
        now() - interval '30 minutes',
        'gate04 scenario 19 overrun preserves one planned appointment');
      IF v_overrun_event.id IS NULL OR v_overrun_event.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_OVERRUN_SETUP_FAILED';
      END IF;
      v_planned_start := v_overrun_event.scheduled_start;
      v_planned_end := v_overrun_event.scheduled_end;
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_overrun_event.id, 'scheduled', 'confirmed');
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_overrun_event.id, 'confirmed', 'arrived');
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_overrun_event.id, 'arrived', 'in_session');
      SELECT count(*) INTO v_count
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id
        AND id = v_overrun_event.id
        AND patient_id = v_patient_resource_probe_id;
      IF v_count <> 1 THEN
        RAISE EXCEPTION 'GATE04_OVERRUN_CREATED_DUPLICATE_APPOINTMENT count=%', v_count;
      END IF;
      SELECT scheduled_start, scheduled_end, status
      INTO v_planned_start, v_planned_end, v_status
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id AND id = v_overrun_event.id;
      IF v_planned_start IS DISTINCT FROM v_overrun_event.scheduled_start
        OR v_planned_end IS DISTINCT FROM v_overrun_event.scheduled_end THEN
        RAISE EXCEPTION 'GATE04_OVERRUN_MUTATED_PLANNED_TIME';
      END IF;
      IF v_status <> 'in_session' THEN
        RAISE EXCEPTION 'GATE04_OVERRUN_DID_NOT_REMAIN_IN_SINGLE_LIFECYCLE status=%', v_status;
      END IF;

      -- Scenario 22: an approved Workforce absence is a new availability constraint.
      -- It must not silently delete, reschedule, or mutate an appointment already booked.
      INSERT INTO public.workforce_employees (
        id, tenant_id, user_id, first_name, last_name, status
      ) VALUES (
        'd4000000-0000-4000-8000-00000000000e',
        v_tenant_id, v_clinic_user_id, 'Gate', 'Four Workforce Probe', 'active'
      );

      SELECT * INTO v_workforce_event
      FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_resource_probe_id,
        v_clinic_user_id, NULL, NULL, NULL, NULL,
        now() + interval '15 days',
        now() + interval '15 days 30 minutes',
        now() + interval '15 days 30 minutes',
        'gate04 scenario 22 existing appointment before workforce change'
      );
      IF v_workforce_event.id IS NULL OR v_workforce_event.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_WORKFORCE_EXISTING_APPOINTMENT_SETUP_FAILED';
      END IF;
      v_workforce_planned_start := v_workforce_event.scheduled_start;
      v_workforce_planned_end := v_workforce_event.scheduled_end;

      INSERT INTO public.workforce_unavailability_blocks (
        tenant_id, employee_id, absence_type, starts_at, ends_at, reason, status, created_by
      ) VALUES (
        v_tenant_id, 'd4000000-0000-4000-8000-00000000000e',
        'leave', v_workforce_planned_start - interval '5 minutes',
        v_workforce_planned_end + interval '15 minutes',
        'gate04 scenario 22 preserve existing appointment', 'approved', v_clinic_user_id
      );

      SELECT count(*) INTO v_workforce_event_count
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id
        AND id = v_workforce_event.id
        AND patient_id = v_patient_resource_probe_id;
      IF v_workforce_event_count <> 1 THEN
        RAISE EXCEPTION 'GATE04_WORKFORCE_CHANGE_DELETED_OR_DUPLICATED_EXISTING_APPOINTMENT count=%',
          v_workforce_event_count;
      END IF;

      SELECT scheduled_start, scheduled_end, status
      INTO v_workforce_planned_start, v_workforce_planned_end, v_status
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id AND id = v_workforce_event.id;
      IF v_workforce_planned_start IS DISTINCT FROM v_workforce_event.scheduled_start
        OR v_workforce_planned_end IS DISTINCT FROM v_workforce_event.scheduled_end
        OR v_status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_WORKFORCE_CHANGE_MUTATED_OR_REBOOKED_EXISTING_APPOINTMENT';
      END IF;

      -- New overlapping bookings must still respect the newly approved absence.
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_doctor_probe_id,
          v_clinic_user_id, NULL, NULL, NULL, NULL,
          v_workforce_event.scheduled_start,
          v_workforce_event.scheduled_end,
          v_workforce_event.buffer_end,
          'gate04 scenario 22 new booking during approved absence must fail'
        );
        RAISE EXCEPTION 'GATE04_WORKFORCE_UNAVAILABLE_BOOKING_WAS_ACCEPTED';
      EXCEPTION WHEN OTHERS THEN
        IF SQLERRM = 'GATE04_WORKFORCE_UNAVAILABLE_BOOKING_WAS_ACCEPTED' THEN
          RAISE;
        END IF;
        IF SQLERRM NOT ILIKE '%unavailable%' THEN
          RAISE EXCEPTION 'GATE04_WORKFORCE_REJECTION_WRONG_CAUSE: %', SQLERRM;
        END IF;
        v_workforce_booking_rejected := true;
      END;
      IF NOT v_workforce_booking_rejected THEN
        RAISE EXCEPTION 'GATE04_WORKFORCE_UNAVAILABLE_BOOKING_WAS_ACCEPTED';
      END IF;

      SELECT count(*) INTO v_workforce_event_count
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id
        AND patient_id = v_patient_doctor_probe_id
        AND booking_notes = 'gate04 scenario 22 new booking during approved absence must fail';
      IF v_workforce_event_count <> 0 THEN
        RAISE EXCEPTION 'GATE04_WORKFORCE_REJECTED_BOOKING_WAS_PERSISTED count=%',
          v_workforce_event_count;
      END IF;

      -- Complete the first appointment through the permitted lifecycle.
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled', 'confirmed'
      );
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'confirmed', 'arrived'
      );
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'arrived', 'in_session'
      );
      PERFORM public.agenda_transition_appointment(
        v_tenant_id, v_clinic_user_id, v_event.id, 'in_session', 'completed'
      );

      -- A completed appointment must release the patient conflict interval.
      SELECT * INTO v_event
      FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_id,
        NULL, NULL, NULL, NULL, NULL,
        now() + interval '2 days 10 minutes',
        now() + interval '2 days 40 minutes',
        now() + interval '2 days 40 minutes',
        'gate04 completed interval released'
      );
      IF v_event.id IS NULL OR v_event.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_COMPLETED_INTERVAL_STILL_BLOCKS_BOOKING';
      END IF;

      -- The new active appointment must still exclude another active booking.
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_id,
          NULL, NULL, NULL, NULL, NULL,
          now() + interval '2 days 15 minutes',
          now() + interval '2 days 45 minutes',
          now() + interval '2 days 45 minutes',
          'gate04 active competing interval'
        );
        RAISE EXCEPTION 'GATE04_ACTIVE_PATIENT_CONFLICT_WAS_ACCEPTED';
      EXCEPTION WHEN exclusion_violation THEN
        NULL;
      END;

      -- Provider dimension: completed releases provider capacity; active overlaps remain forbidden.
      SELECT * INTO v_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_id, v_clinic_user_id, NULL, NULL, NULL, NULL,
        now() + interval '4 days', now() + interval '4 days 30 minutes', now() + interval '4 days 30 minutes',
        'gate04 completed provider interval');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled', 'confirmed');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'confirmed', 'arrived');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'arrived', 'in_session');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'in_session', 'completed');
      SELECT * INTO v_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_doctor_probe_id, v_clinic_user_id, NULL, NULL, NULL, NULL,
        now() + interval '4 days 5 minutes', now() + interval '4 days 35 minutes', now() + interval '4 days 35 minutes',
        'gate04 provider released after completion');
      IF v_event.id IS NULL THEN RAISE EXCEPTION 'GATE04_COMPLETED_PROVIDER_STILL_BLOCKS'; END IF;
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_room_probe_id, v_clinic_user_id, NULL, NULL, NULL, NULL,
          now() + interval '4 days 10 minutes', now() + interval '4 days 40 minutes', now() + interval '4 days 40 minutes',
          'gate04 active competing provider interval');
        RAISE EXCEPTION 'GATE04_ACTIVE_PROVIDER_CONFLICT_WAS_ACCEPTED';
      EXCEPTION WHEN exclusion_violation THEN NULL;
      END;

      -- Room dimension: completed releases the room; active overlaps remain forbidden.
      SELECT * INTO v_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_id, NULL, v_room_id, NULL, NULL, NULL,
        now() + interval '5 days', now() + interval '5 days 30 minutes', now() + interval '5 days 30 minutes',
        'gate04 completed room interval');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled', 'confirmed');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'confirmed', 'arrived');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'arrived', 'in_session');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'in_session', 'completed');
      SELECT * INTO v_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_room_probe_id, NULL, v_room_id, NULL, NULL, NULL,
        now() + interval '5 days 5 minutes', now() + interval '5 days 35 minutes', now() + interval '5 days 35 minutes',
        'gate04 room released after completion');
      IF v_event.id IS NULL THEN RAISE EXCEPTION 'GATE04_COMPLETED_ROOM_STILL_BLOCKS'; END IF;
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_resource_probe_id, NULL, v_room_id, NULL, NULL, NULL,
          now() + interval '5 days 10 minutes', now() + interval '5 days 40 minutes', now() + interval '5 days 40 minutes',
          'gate04 active competing room interval');
        RAISE EXCEPTION 'GATE04_ACTIVE_ROOM_CONFLICT_WAS_ACCEPTED';
      EXCEPTION WHEN exclusion_violation THEN NULL;
      END;

      -- Resource/device dimension: completed releases the resource; active overlaps remain forbidden.
      SELECT * INTO v_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_id, NULL, NULL, v_resource_id, NULL, NULL,
        now() + interval '6 days', now() + interval '6 days 30 minutes', now() + interval '6 days 30 minutes',
        'gate04 completed resource interval');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'scheduled', 'confirmed');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'confirmed', 'arrived');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'arrived', 'in_session');
      PERFORM public.agenda_transition_appointment(v_tenant_id, v_clinic_user_id, v_event.id, 'in_session', 'completed');
      SELECT * INTO v_event FROM public.agenda_create_appointment(
        v_tenant_id, v_clinic_user_id, v_patient_resource_probe_id, NULL, NULL, v_resource_id, NULL, NULL,
        now() + interval '6 days 5 minutes', now() + interval '6 days 35 minutes', now() + interval '6 days 35 minutes',
        'gate04 resource released after completion');
      IF v_event.id IS NULL THEN RAISE EXCEPTION 'GATE04_COMPLETED_RESOURCE_STILL_BLOCKS'; END IF;
      BEGIN
        PERFORM public.agenda_create_appointment(
          v_tenant_id, v_clinic_user_id, v_patient_doctor_probe_id, NULL, NULL, v_resource_id, NULL, NULL,
          now() + interval '6 days 10 minutes', now() + interval '6 days 40 minutes', now() + interval '6 days 40 minutes',
          'gate04 active competing resource interval');
        RAISE EXCEPTION 'GATE04_ACTIVE_RESOURCE_CONFLICT_WAS_ACCEPTED';
      EXCEPTION WHEN exclusion_violation THEN NULL;
      END;

      -- All four canonical database conflict predicates must agree on lifecycle.
      IF (
        SELECT count(*) FROM pg_constraint
        WHERE conrelid = 'public.master_agenda_events'::regclass
          AND conname IN ('no_doctor_overlap','no_patient_overlap','no_room_overlap','no_resource_overlap')
          AND pg_get_constraintdef(oid) ILIKE '%completed%'
          AND pg_get_constraintdef(oid) ILIKE '%cancelled%'
          AND pg_get_constraintdef(oid) ILIKE '%no_show%'
      ) <> 4 THEN
        RAISE EXCEPTION 'GATE04_CONFLICT_CONSTRAINT_POLICY_MISMATCH';
      END IF;
    END;
    $gate04_flow$;

    -- Gate 04 scenario 33: a pre-booked Agenda event enters Visit/Patient Flow
    -- through the existing Reception adapter and canonical D3 authority. This is
    -- deliberately local-only; it does not run the broad Gate 02 E2E suite.
    RESET ROLE;
    SELECT set_config('request.jwt.claim.role', 'service_role', true);
    SELECT set_config('request.jwt.claim.sub', 'd4000000-0000-4000-8000-000000000002', true);
    SELECT set_config('request.jwt.claims',
      '{"sub":"d4000000-0000-4000-8000-000000000002","role":"service_role","aud":"service_role"}', true);
    SET LOCAL ROLE service_role;

    DO $gate04_seed_pf_agenda$
    DECLARE
      v_event public.master_agenda_events%ROWTYPE;
    BEGIN
      SELECT * INTO v_event
      FROM public.agenda_create_appointment(
        'd4000000-0000-4000-8000-000000000001',
        'd4000000-0000-4000-8000-000000000003',
        'd4000000-0000-4000-8000-000000000004',
        'd4000000-0000-4000-8000-000000000003',
        NULL, NULL, NULL, NULL,
        now() + interval '8 days',
        now() + interval '8 days 30 minutes',
        now() + interval '8 days 30 minutes',
        'GATE04-PF-BRIDGE'
      );
      IF v_event.id IS NULL OR v_event.status <> 'scheduled'
         OR v_event.patient_id <> 'd4000000-0000-4000-8000-000000000004' THEN
        RAISE EXCEPTION 'GATE04_PATIENT_FLOW_AGENDA_SEED_FAILED';
      END IF;
    END;
    $gate04_seed_pf_agenda$;

    RESET ROLE;
    SELECT set_config('request.jwt.claim.role', 'authenticated', true);
    SELECT set_config('request.jwt.claim.sub', 'd4000000-0000-4000-8000-000000000002', true);
    SELECT set_config('request.jwt.claims',
      '{"sub":"d4000000-0000-4000-8000-000000000002","role":"authenticated","aud":"authenticated","user_role":"gate04_ci","user_metadata":{"tenant_id":"d4000000-0000-4000-8000-000000000001","user_role":"gate04_ci"}}',
      true);
    SET LOCAL ROLE authenticated;

    DO $gate04_patient_flow_agenda_bridge$
    DECLARE
      v_tenant_id uuid := 'd4000000-0000-4000-8000-000000000001';
      v_clinic_user_id uuid := 'd4000000-0000-4000-8000-000000000003';
      v_agenda public.master_agenda_events%ROWTYPE;
      v_visit_id uuid;
      v_result jsonb;
      v_count integer;
    BEGIN
      SELECT * INTO v_agenda
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id AND booking_notes = 'GATE04-PF-BRIDGE';
      IF NOT FOUND OR v_agenda.status <> 'scheduled' THEN
        RAISE EXCEPTION 'GATE04_PATIENT_FLOW_AGENDA_EVENT_NOT_FOUND';
      END IF;

      INSERT INTO public.clinic_visit_sessions (
        tenant_id, patient_id, doctor_id, room_id, agenda_event_id,
        initialized_by_receptionist, session_status, created_at, updated_at
      ) VALUES (
        v_tenant_id, v_agenda.patient_id, v_agenda.doctor_id, v_agenda.room_id, v_agenda.id,
        v_clinic_user_id, 'waiting', now(), now()
      )
      RETURNING id INTO v_visit_id;

      v_result := public.csapi_d3_enter_waiting(
        v_visit_id, 'general', 'normal', 'arrival', NULL, gen_random_uuid()
      );
      IF v_result->>'command' IS DISTINCT FROM 'csapi_d3_enter_waiting'
         OR v_result->>'visit_id' IS DISTINCT FROM v_visit_id::text
         OR NULLIF(v_result->>'queue_entry_id','') IS NULL
         OR NULLIF(v_result->>'event_id','') IS NULL THEN
        RAISE EXCEPTION 'GATE04_PATIENT_FLOW_D3_RESULT_INVALID result=%', v_result;
      END IF;

      SELECT count(*) INTO v_count
      FROM public.patient_flow_queue_entries q
      JOIN public.clinic_visit_sessions v
        ON v.tenant_id = q.tenant_id AND v.id = q.visit_id
      JOIN public.master_agenda_events a
        ON a.tenant_id = v.tenant_id AND a.id = v.agenda_event_id
      JOIN public.patient_flow_events e
        ON e.tenant_id = q.tenant_id
       AND e.visit_id = q.visit_id
       AND e.queue_entry_id = q.id
      WHERE q.tenant_id = v_tenant_id
        AND q.id = (v_result->>'queue_entry_id')::uuid
        AND q.exited_at IS NULL
        AND e.id = (v_result->>'event_id')::uuid
        AND e.event_type = 'waiting_entered'
        AND e.correlation_id = (v_result->>'correlation_id')::uuid
        AND v.id = v_visit_id
        AND v.session_status = 'waiting'
        AND v.arrived_at IS NOT NULL
        AND v.patient_id = a.patient_id
        AND v.doctor_id IS NOT DISTINCT FROM a.doctor_id
        AND v.room_id IS NOT DISTINCT FROM a.room_id
        AND a.id = v_agenda.id
        AND a.status = 'scheduled'
        AND a.booking_notes = 'GATE04-PF-BRIDGE';
      IF v_count <> 1 THEN
        RAISE EXCEPTION 'GATE04_PATIENT_FLOW_AGENDA_BRIDGE_NOT_RECONSTRUCTIBLE count=%', v_count;
      END IF;

      SELECT count(*) INTO v_count
      FROM public.master_agenda_events
      WHERE tenant_id = v_tenant_id AND booking_notes = 'GATE04-PF-BRIDGE';
      IF v_count <> 1 THEN
        RAISE EXCEPTION 'GATE04_PATIENT_FLOW_MUST_NOT_CREATE_OR_DUPLICATE_APPOINTMENT count=%', v_count;
      END IF;
    END;
    $gate04_patient_flow_agenda_bridge$;
    SELECT 'GATE04_PATIENT_FLOW_AGENDA_BRIDGE=PASS';

    -- Exercise audit row visibility as a real same-tenant authenticated member without audit rights.
    RESET ROLE;
    SELECT set_config('request.jwt.claim.role', 'authenticated', true);
    SELECT set_config('request.jwt.claim.sub', 'd4000000-0000-4000-8000-000000000015', true);
    SELECT set_config('request.jwt.claims',
      '{"sub":"d4000000-0000-4000-8000-000000000015","role":"authenticated","aud":"authenticated","user_role":"gate04_limited","user_metadata":{"tenant_id":"d4000000-0000-4000-8000-000000000001","user_role":"gate04_limited"}}',
      true);
    SET LOCAL ROLE authenticated;
    DO $gate04_audit_confidentiality$
    DECLARE
      v_visible_rows integer;
    BEGIN
      SELECT count(*) INTO v_visible_rows
      FROM public.audit_trail
      WHERE tenant_id = 'd4000000-0000-4000-8000-000000000001';
      IF v_visible_rows <> 0 THEN
        RAISE EXCEPTION 'GATE04_UNAUTHORIZED_AUDIT_DETAIL_VISIBLE count=%', v_visible_rows;
      END IF;
    END;
    $gate04_audit_confidentiality$;

    ROLLBACK;
  `;
  const commandFlowResult = requireSuccess("authenticated-agenda-command-audit-flow", "psql", [
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "-v", "ON_ERROR_STOP=1", "-c", commandFlowSql,
  ], { capture: true });
  log("authenticated-agenda-command-audit-flow", "PASS");
  if (!(commandFlowResult.stdout || "").includes("GATE04_PATIENT_FLOW_AGENDA_BRIDGE=PASS")) {
    throw new Error("GATE04_PATIENT_FLOW_AGENDA_BRIDGE_MARKER_MISSING");
  }
  log("agenda-to-patient-flow-visit-bridge", "PASS",
    "pre-booked Agenda event persisted into the same-tenant Visit; canonical D3 created one waiting Queue Entry/event; Agenda appointment remained scheduled and was not duplicated");

  // Run two independent authenticated command transactions concurrently against
  // one exclusive resource. A winner keeps the uncommitted range lock briefly;
  // the competing transaction must then receive the canonical exclusion conflict.
  const concurrentTenant = "d7000000-0000-4000-8000-000000000001";
  const concurrentAuthUser = "d7000000-0000-4000-8000-000000000002";
  const concurrentActor = "d7000000-0000-4000-8000-000000000003";
  const concurrentRole = "d7000000-0000-4000-8000-000000000004";
  const concurrentPlan = "d7000000-0000-4000-8000-000000000005";
  const concurrentPatientA = "d7000000-0000-4000-8000-000000000006";
  const concurrentPatientB = "d7000000-0000-4000-8000-000000000007";
  const concurrentResource = "d7000000-0000-4000-8000-000000000008";
  let concurrentFixtureSeeded = false;
  const concurrentSeedSql = `
    DO $gate04_concurrent_seed$
    DECLARE
      v_suffix text := replace(gen_random_uuid()::text, '-', '');
      v_permission_id uuid;
    BEGIN
      INSERT INTO public.master_tenants (id, clinic_name, license_key, timezone)
      VALUES ('${concurrentTenant}', 'Gate04 concurrency ' || v_suffix,
        'GATE04-CONCURRENT-' || v_suffix, 'Asia/Amman');

      INSERT INTO auth.users (id, aud, role, email, created_at, updated_at)
      VALUES ('${concurrentAuthUser}', 'authenticated', 'authenticated',
        'gate04-concurrent-' || v_suffix || '@example.test', now(), now());

      INSERT INTO public.roles (id, role_key, role_name, tenant_id, is_system_role)
      VALUES ('${concurrentRole}', 'gate04_concurrent_' || v_suffix,
        'Gate04 concurrency test role', '${concurrentTenant}', false);

      INSERT INTO public.subscription_plans (id, plan_key, plan_name, modules, is_active)
      VALUES ('${concurrentPlan}', 'gate04-concurrent-' || v_suffix,
        'Gate04 concurrency test plan', '["basic"]'::jsonb, true);

      INSERT INTO public.subscriptions (tenant_id, plan_id, status, started_at)
      VALUES ('${concurrentTenant}', '${concurrentPlan}', 'active', now());

      INSERT INTO public.clinic_users (
        id, tenant_id, full_name, role, employee_code, pin_code, role_id, auth_user_id, is_active
      ) VALUES (
        '${concurrentActor}', '${concurrentTenant}', 'Gate04 concurrency actor',
        'gate04_concurrent', 'G4C-' || substr(v_suffix, 1, 12), '1234',
        '${concurrentRole}', '${concurrentAuthUser}', true
      );

      INSERT INTO public.clinic_patients (id, tenant_id, first_name, last_name, phone_primary)
      VALUES
        ('${concurrentPatientA}', '${concurrentTenant}', 'Race', 'A',
          '+96279' || lpad((random() * 9999999)::integer::text, 7, '0')),
        ('${concurrentPatientB}', '${concurrentTenant}', 'Race', 'B',
          '+96278' || lpad((random() * 9999999)::integer::text, 7, '0'));

      INSERT INTO public.clinic_resources (id, tenant_id, resource_name, resource_type, status)
      VALUES ('${concurrentResource}', '${concurrentTenant}',
        'Gate04 concurrent exclusive device', 'laser_device', 'active');

      SELECT id INTO v_permission_id FROM public.permissions
      WHERE permission_key = 'agenda:create' AND deleted_at IS NULL LIMIT 1;
      IF v_permission_id IS NULL THEN
        RAISE EXCEPTION 'GATE04_CONCURRENT_PERMISSION_MISSING=agenda:create';
      END IF;
      INSERT INTO public.clinic_user_permission_overrides (tenant_id, user_id, permission_id, granted)
      VALUES ('${concurrentTenant}', '${concurrentActor}', v_permission_id, true);

      SELECT id INTO v_permission_id FROM public.permissions
      WHERE permission_key = 'agenda:update' AND deleted_at IS NULL LIMIT 1;
      IF v_permission_id IS NULL THEN
        RAISE EXCEPTION 'GATE04_CONCURRENT_PERMISSION_MISSING=agenda:update';
      END IF;
      INSERT INTO public.clinic_user_permission_overrides (tenant_id, user_id, permission_id, granted)
      VALUES ('${concurrentTenant}', '${concurrentActor}', v_permission_id, true);
    END;
    $gate04_concurrent_seed$;
  `;

  const concurrentCleanupSql = `
    BEGIN;
    SELECT set_config('request.jwt.claim.role', 'service_role', true);
    SELECT set_config('request.jwt.claim.sub', '${concurrentAuthUser}', true);
    SELECT set_config('request.jwt.claims',
      '{"sub":"${concurrentAuthUser}","role":"service_role","aud":"service_role"}', true);
    SET LOCAL ROLE service_role;
    DO $gate04_concurrent_cancel$
    DECLARE
      v_event record;
    BEGIN
      FOR v_event IN
        SELECT id, status
        FROM public.master_agenda_events
        WHERE tenant_id = '${concurrentTenant}'
          AND booking_notes IN ('GATE04-RACE-A', 'GATE04-RACE-B')
          AND status NOT IN ('cancelled', 'completed', 'no_show')
      LOOP
        PERFORM public.agenda_cancel_appointment(
          '${concurrentTenant}', '${concurrentActor}', v_event.id, v_event.status,
          'Gate 04 local concurrency verifier cleanup'
        );
      END LOOP;
    END;
    $gate04_concurrent_cancel$;
    RESET ROLE;
    -- The audit trail has an actor FK, and AJM-1 audit triggers fire on DELETE.
    -- Clear existing audit rows, suppress only those local cleanup triggers while
    -- removing the disposable fixture actors/roles/overrides, then clear any
    -- remaining tenant audit rows before deleting the tenant fixture.
    DELETE FROM public.audit_trail WHERE tenant_id = '${concurrentTenant}';
    DELETE FROM public.master_agenda_events WHERE tenant_id = '${concurrentTenant}';
    ALTER TABLE public.clinic_user_permission_overrides DISABLE TRIGGER trg_ajm1_audit;
    ALTER TABLE public.clinic_users DISABLE TRIGGER trg_ajm1_audit;
    ALTER TABLE public.roles DISABLE TRIGGER trg_ajm1_audit;
    DELETE FROM public.clinic_user_permission_overrides WHERE tenant_id = '${concurrentTenant}';
    DELETE FROM public.clinic_patients WHERE tenant_id = '${concurrentTenant}';
    DELETE FROM public.clinic_resources WHERE tenant_id = '${concurrentTenant}';
    DELETE FROM public.subscriptions WHERE tenant_id = '${concurrentTenant}';
    DELETE FROM public.clinic_users WHERE id = '${concurrentActor}';
    DELETE FROM public.roles WHERE id = '${concurrentRole}';
    ALTER TABLE public.clinic_user_permission_overrides ENABLE TRIGGER trg_ajm1_audit;
    ALTER TABLE public.clinic_users ENABLE TRIGGER trg_ajm1_audit;
    ALTER TABLE public.roles ENABLE TRIGGER trg_ajm1_audit;
    DELETE FROM public.audit_trail WHERE tenant_id = '${concurrentTenant}';
    DELETE FROM public.subscription_plans WHERE id = '${concurrentPlan}';
    DELETE FROM public.master_tenants WHERE id = '${concurrentTenant}';
    DELETE FROM auth.users WHERE id = '${concurrentAuthUser}';
    COMMIT;
  `;

  try {
    requireSuccess("seed-concurrent-booking-fixture", "psql", [
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      "-v", "ON_ERROR_STOP=1", "-c", concurrentSeedSql,
    ], { capture: true });
    concurrentFixtureSeeded = true;

    const makeRaceSql = (patientId, bookingLabel, preInsertDelaySeconds, holdAfterInsertSeconds) => `
      SELECT set_config('request.jwt.claim.role', 'service_role', false);
      SELECT set_config('request.jwt.claim.sub', '${concurrentAuthUser}', false);
      SELECT set_config('request.jwt.claims',
        '{"sub":"${concurrentAuthUser}","role":"service_role","aud":"service_role"}', false);
      SET ROLE service_role;
      DO $gate04_concurrent_race$
      DECLARE
        v_event_id uuid;
      BEGIN
        -- A starts first and holds the uncommitted resource range; B starts shortly
        -- afterward so only B waits on A, avoiding a mutual-insert deadlock while
        -- still exercising two overlapping database transactions.
        PERFORM pg_catalog.pg_sleep(${preInsertDelaySeconds});
        BEGIN
          SELECT id INTO v_event_id
          FROM public.agenda_create_appointment(
            '${concurrentTenant}', '${concurrentActor}', '${patientId}',
            NULL, NULL, '${concurrentResource}', NULL, NULL,
            now() + interval '7 days',
            now() + interval '7 days 30 minutes',
            now() + interval '7 days 30 minutes',
            'GATE04-RACE-${bookingLabel}'
          );
          PERFORM pg_catalog.pg_sleep(${holdAfterInsertSeconds});
          RAISE NOTICE 'GATE04_RACE_WINNER=${bookingLabel} event_id=%', v_event_id;
        EXCEPTION WHEN exclusion_violation THEN
          RAISE NOTICE 'GATE04_RACE_CONFLICT=${bookingLabel}';
        END;
      END;
      $gate04_concurrent_race$;
    `;

    const concurrentResults = await Promise.all([
      runAsync("psql", [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "-v", "ON_ERROR_STOP=1", "-At", "-c", makeRaceSql(concurrentPatientA, "A", 0, 3.0),
      ], { timeoutMs: 60000 }),
      runAsync("psql", [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "-v", "ON_ERROR_STOP=1", "-At", "-c", makeRaceSql(concurrentPatientB, "B", 0.5, 0),
      ], { timeoutMs: 60000 }),
    ]);

    if (concurrentResults.some((result) => result.status !== 0)) {
      const details = concurrentResults.map((result, index) =>
        `session${index + 1}: exit=${result.status}; ${(result.stderr || result.stdout || result.error || "").slice(-900)}`
      ).join(" | ");
      throw new Error(`GATE04_CONCURRENT_BOOKING_SESSION_FAILED ${details}`);
    }

    const combinedOutput = concurrentResults.map(result => result.stdout + "\\n" + result.stderr).join("\\n");
    const winners = (combinedOutput.match(/GATE04_RACE_WINNER=/g) || []).length;
    const conflicts = (combinedOutput.match(/GATE04_RACE_CONFLICT=/g) || []).length;
    if (winners !== 1 || conflicts !== 1) {
      throw new Error(`GATE04_CONCURRENT_BOOKING_EXPECTED_ONE_WINNER_ONE_CONFLICT winners=${winners} conflicts=${conflicts} output=${combinedOutput.slice(-1800)}`);
    }

    const persisted = requireSuccess("verify-concurrent-booking-single-persisted-row", "psql", [
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      "-v", "ON_ERROR_STOP=1", "-At", "-c",
      `SELECT count(*) FROM public.master_agenda_events WHERE tenant_id = '${concurrentTenant}' AND booking_notes IN ('GATE04-RACE-A', 'GATE04-RACE-B');`,
    ], { capture: true });
    const persistedCount = (persisted.stdout || "").trim().split("\\n").at(-1);
    if (persistedCount !== "1") {
      throw new Error(`GATE04_CONCURRENT_BOOKING_PERSISTED_ROW_COUNT=${persistedCount || "missing"}`);
    }
    log("concurrent-exclusive-resource-booking", "PASS",
      "two independent service-role command sessions: one winner, one exclusion conflict, exactly one persisted appointment");
  } catch (error) {
    log("concurrent-exclusive-resource-booking", "FAIL",
      error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    if (concurrentFixtureSeeded) {
      requireSuccess("cleanup-concurrent-booking-fixture", "psql", [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "-v", "ON_ERROR_STOP=1", "-c", concurrentCleanupSql,
      ], { capture: true });
    }
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
  try {
    if (createdSupabaseConfig && existsSync(supabaseConfigPath)) unlinkSync(supabaseConfigPath);
    else if (originalSupabaseConfig !== null) writeFileSync(supabaseConfigPath, originalSupabaseConfig);
    log("restore-supabase-config", "PASS");
  } catch (error) {
    log("restore-supabase-config", "FAIL", error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
  const failures = checks.filter((item) => item.status === "FAIL");
  console.log(JSON.stringify({
    audit: "csapi-gate04-database-verification",
    completed_at: new Date().toISOString(),
    status: failures.length ? "FAIL" : "PASS",
    checks,
  }, null, 2));
}
