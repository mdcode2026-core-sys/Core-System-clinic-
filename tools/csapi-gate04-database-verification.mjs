#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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
      v_permission_id uuid;
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
      v_event public.master_agenda_events%ROWTYPE;
      v_no_show_event public.master_agenda_events%ROWTYPE;
      v_no_show_overlap public.master_agenda_events%ROWTYPE;
      v_reschedule_event public.master_agenda_events%ROWTYPE;
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

    RESET ROLE;
    ROLLBACK;
  `;
  requireSuccess("authenticated-agenda-command-audit-flow", "psql", [
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "-v", "ON_ERROR_STOP=1", "-c", commandFlowSql,
  ], { capture: true });
  log("authenticated-agenda-command-audit-flow", "PASS");

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
