begin;

select plan(32);

select has_table('public', 'clinical_work_sessions', 'clinical Work Session table exists');
select has_table('public', 'patient_flow_queue_entries', 'Patient Flow queue entry table exists');
select has_table('public', 'patient_flow_events', 'Patient Flow event table exists');

select has_index('public', 'clinical_work_sessions', 'clinical_work_sessions_one_active_per_visit_idx', 'one active Work Session index exists');
select has_index('public', 'patient_flow_queue_entries', 'patient_flow_queue_entries_one_active_per_visit_idx', 'one active Queue Entry index exists');

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.clinical_work_sessions'::regclass
      and conname = 'clinical_work_sessions_visit_same_tenant_fk'
  ),
  'Work Session has tenant-safe Visit foreign key'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.patient_flow_queue_entries'::regclass
      and conname = 'patient_flow_queue_entries_visit_same_tenant_fk'
  ),
  'Queue Entry has tenant-safe Visit foreign key'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.patient_flow_events'::regclass
      and conname = 'patient_flow_events_visit_same_tenant_fk'
  ),
  'Patient Flow Event has tenant-safe Visit foreign key'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinical_work_sessions'
      and policyname = 'patient_flow_work_sessions_read'
      and cmd = 'SELECT'
  ),
  'Work Session read RLS policy exists'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_flow_queue_entries'
      and policyname = 'patient_flow_queue_entries_read'
      and cmd = 'SELECT'
  ),
  'Queue Entry read RLS policy exists'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'patient_flow_events'
      and policyname = 'patient_flow_events_read'
      and cmd = 'SELECT'
  ),
  'Patient Flow Event read RLS policy exists'
);

select ok(has_table_privilege('authenticated', 'public.clinical_work_sessions', 'SELECT'), 'Authenticated role has Work Session SELECT privilege');
select ok(has_table_privilege('authenticated', 'public.patient_flow_queue_entries', 'SELECT'), 'Authenticated role has Queue Entry SELECT privilege');
select ok(has_table_privilege('authenticated', 'public.patient_flow_events', 'SELECT'), 'Authenticated role has Event SELECT privilege');

select ok(not has_table_privilege('authenticated', 'public.clinical_work_sessions', 'INSERT'), 'Authenticated role has no Work Session INSERT privilege in D2');
select ok(not has_table_privilege('authenticated', 'public.patient_flow_queue_entries', 'INSERT'), 'Authenticated role has no Queue Entry INSERT privilege in D2');
select ok(not has_table_privilege('authenticated', 'public.patient_flow_events', 'INSERT'), 'Authenticated role has no Event INSERT privilege in D2');

select ok(not exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'clinical_work_sessions' and cmd in ('INSERT','UPDATE','DELETE')
), 'Work Session has no lifecycle write policies in D2');
select ok(not exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'patient_flow_queue_entries' and cmd in ('INSERT','UPDATE','DELETE')
), 'Queue Entry has no lifecycle write policies in D2');
select ok(not exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'patient_flow_events' and cmd in ('INSERT','UPDATE','DELETE')
), 'Event has no lifecycle write policies in D2');

-- Deterministic fixtures; the surrounding test transaction rolls everything back.
insert into public.roles (id, role_key, role_name, role_name_ar, is_system_role)
values ('00000000-0000-0000-0000-00000000d201', 'csapi_d2_test_role', 'CSAPI D2 Test Role', 'CSAPI D2 Test Role', false);

insert into public.master_tenants (
  id, clinic_name, license_key, subscription_tier, max_devices, timezone, currency,
  currency_subunit, is_active, language, direction
)
values
  ('00000000-0000-0000-0000-00000000d202', 'CSAPI D2 Test Tenant A', 'CSAPI-D2-TEST-A', 'trial', 2, 'Asia/Amman', 'JOD', 100, true, 'en', 'ltr'),
  ('00000000-0000-0000-0000-00000000d203', 'CSAPI D2 Test Tenant B', 'CSAPI-D2-TEST-B', 'trial', 2, 'Asia/Amman', 'JOD', 100, true, 'en', 'ltr');

insert into public.clinic_users (
  id, tenant_id, full_name, role, employee_code, pin_code, role_id, account_status, is_active
)
values
  ('00000000-0000-0000-0000-00000000d204', '00000000-0000-0000-0000-00000000d202', 'D2 Test User A', 'doctor', 'D2-A', '0000', '00000000-0000-0000-0000-00000000d201', 'active', true),
  ('00000000-0000-0000-0000-00000000d205', '00000000-0000-0000-0000-00000000d203', 'D2 Test User B', 'doctor', 'D2-B', '0001', '00000000-0000-0000-0000-00000000d201', 'active', true);

insert into public.clinic_patients (
  id, tenant_id, first_name, last_name, phone_primary
)
values
  ('00000000-0000-0000-0000-00000000d206', '00000000-0000-0000-0000-00000000d202', 'Patient', 'A', '000000001'),
  ('00000000-0000-0000-0000-00000000d207', '00000000-0000-0000-0000-00000000d203', 'Patient', 'B', '000000002');

insert into public.clinic_visit_sessions (
  id, tenant_id, patient_id, doctor_id, session_status
)
values
  ('00000000-0000-0000-0000-00000000d208', '00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d206', '00000000-0000-0000-0000-00000000d204', 'waiting'),
  ('00000000-0000-0000-0000-00000000d209', '00000000-0000-0000-0000-00000000d203', '00000000-0000-0000-0000-00000000d207', '00000000-0000-0000-0000-00000000d205', 'waiting');

insert into public.clinical_work_sessions (
  id, tenant_id, visit_id, sequence_no, status, performed_by_clinic_user_id
)
values
  ('00000000-0000-0000-0000-00000000d210', '00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', 1, 'active', '00000000-0000-0000-0000-00000000d204'),
  ('00000000-0000-0000-0000-00000000d211', '00000000-0000-0000-0000-00000000d203', '00000000-0000-0000-0000-00000000d209', 1, 'active', '00000000-0000-0000-0000-00000000d205');

insert into public.patient_flow_queue_entries (
  id, tenant_id, visit_id, operating_date, lane_key, priority_class, position, created_by_clinic_user_id
)
values
  ('00000000-0000-0000-0000-00000000d212', '00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', current_date, 'clinical', 'normal', 1, '00000000-0000-0000-0000-00000000d204'),
  ('00000000-0000-0000-0000-00000000d213', '00000000-0000-0000-0000-00000000d203', '00000000-0000-0000-0000-00000000d209', current_date, 'clinical', 'normal', 1, '00000000-0000-0000-0000-00000000d205');

insert into public.patient_flow_events (
  id, tenant_id, visit_id, work_session_id, queue_entry_id, event_type, actor_clinic_user_id
)
values
  ('00000000-0000-0000-0000-00000000d214', '00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', '00000000-0000-0000-0000-00000000d210', '00000000-0000-0000-0000-00000000d212', 'waiting_entered', '00000000-0000-0000-0000-00000000d204'),
  ('00000000-0000-0000-0000-00000000d215', '00000000-0000-0000-0000-00000000d203', '00000000-0000-0000-0000-00000000d209', '00000000-0000-0000-0000-00000000d211', '00000000-0000-0000-0000-00000000d213', 'waiting_entered', '00000000-0000-0000-0000-00000000d205');

select throws_ok($sql$
  insert into public.clinical_work_sessions
    (tenant_id, visit_id, sequence_no, status, performed_by_clinic_user_id)
  values
    ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', 2, 'active', '00000000-0000-0000-0000-00000000d204')
$sql$, '23505', null, 'duplicate active Work Session for one Visit is rejected');

select throws_ok($sql$
  insert into public.patient_flow_queue_entries
    (tenant_id, visit_id, operating_date, lane_key, priority_class, position, created_by_clinic_user_id)
  values
    ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', current_date, 'clinical', 'high', 2, '00000000-0000-0000-0000-00000000d204')
$sql$, '23505', null, 'duplicate active Queue Entry for one Visit is rejected');

select throws_ok($sql$
  insert into public.clinical_work_sessions
    (tenant_id, visit_id, sequence_no, status, performed_by_clinic_user_id)
  values
    ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d209', 2, 'active', '00000000-0000-0000-0000-00000000d204')
$sql$, '23503', null, 'Work Session rejects a cross-tenant Visit reference');

select throws_ok($sql$
  insert into public.patient_flow_queue_entries
    (tenant_id, visit_id, operating_date, lane_key, priority_class, position, created_by_clinic_user_id)
  values
    ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d209', current_date, 'clinical', 'high', 2, '00000000-0000-0000-0000-00000000d204')
$sql$, '23503', null, 'Queue Entry rejects a cross-tenant Visit reference');

select throws_ok($sql$
  insert into public.patient_flow_events
    (tenant_id, visit_id, work_session_id, queue_entry_id, event_type, actor_clinic_user_id)
  values
    ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', '00000000-0000-0000-0000-00000000d211', '00000000-0000-0000-0000-00000000d212', 'cross_tenant_test', '00000000-0000-0000-0000-00000000d204')
$sql$, '23503', null, 'Event rejects a cross-tenant Work Session reference');

select throws_ok($sql$
  insert into public.patient_flow_events
    (tenant_id, visit_id, work_session_id, queue_entry_id, event_type, actor_clinic_user_id)
  values
    ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-00000000d208', '00000000-0000-0000-0000-00000000d210', '00000000-0000-0000-0000-00000000d213', 'cross_tenant_test', '00000000-0000-0000-0000-00000000d204')
$sql$, '23503', null, 'Event rejects a cross-tenant Queue Entry reference');

set local role authenticated;
select set_config('request.jwt.claims', '{"app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d202"}}', true);

select is((select count(*)::int from public.clinical_work_sessions), 1, 'Tenant A sees only its Work Session');
select is((select count(*)::int from public.patient_flow_queue_entries), 1, 'Tenant A sees only its Queue Entry');
select is((select count(*)::int from public.patient_flow_events), 1, 'Tenant A sees only its Event');

select set_config('request.jwt.claims', '{"app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d203"}}', true);

select is((select count(*)::int from public.clinical_work_sessions), 1, 'Tenant B sees only its Work Session');
select is((select count(*)::int from public.patient_flow_queue_entries), 1, 'Tenant B sees only its Queue Entry');
select is((select count(*)::int from public.patient_flow_events), 1, 'Tenant B sees only its Event');

select * from finish();
rollback;
