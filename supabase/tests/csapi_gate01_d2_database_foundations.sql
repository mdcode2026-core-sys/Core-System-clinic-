begin;

select plan(10);

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
  ),
  'Queue Entry read RLS policy exists'
);

select * from finish();
rollback;
