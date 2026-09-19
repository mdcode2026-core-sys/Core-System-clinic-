BEGIN;

SELECT plan(32);

CREATE TEMP TABLE d3_test_ids (
  key text primary key,
  id uuid not null
) ON COMMIT DROP;

INSERT INTO d3_test_ids(key,id) VALUES
 ('tenant_a','00000000-0000-0000-0000-00000000d301'),
 ('tenant_b','00000000-0000-0000-0000-00000000d302'),
 ('doctor_auth','00000000-0000-0000-0000-00000000d303'),
 ('doctor_clinic','00000000-0000-0000-0000-00000000d304'),
 ('reception_auth','00000000-0000-0000-0000-00000000d305'),
 ('reception_clinic','00000000-0000-0000-0000-00000000d306'),
 ('unauthorized_auth','00000000-0000-0000-0000-00000000d307'),
 ('unauthorized_clinic','00000000-0000-0000-0000-00000000d308'),
 ('patient_a','00000000-0000-0000-0000-00000000d309'),
 ('visit_a','00000000-0000-0000-0000-00000000d310'),
 ('visit_b','00000000-0000-0000-0000-00000000d311'),
 ('visit_cancel','00000000-0000-0000-0000-00000000d312'),
 ('visit_noshow','00000000-0000-0000-0000-00000000d313');

SELECT ok(
  has_function_privilege('authenticated','public.csapi_d3_start_clinical_work(uuid,uuid)','EXECUTE'),
  'authenticated can execute D3 start command'
);
SELECT ok(
  NOT has_function_privilege('anon','public.csapi_d3_start_clinical_work(uuid,uuid)','EXECUTE'),
  'anon cannot execute D3 start command'
);
SELECT ok(
  has_function_privilege('authenticated','public.csapi_d3_enter_waiting(uuid,text,text,text,text,uuid)','EXECUTE'),
  'authenticated can execute D3 waiting command'
);
INSERT INTO public.master_tenants(id,clinic_name,license_key,timezone,currency,country_code)
VALUES
 ('00000000-0000-0000-0000-00000000d301','CSAPI D3 Tenant A','CSAPI-D3-A','Asia/Amman','JOD','JO'),
 ('00000000-0000-0000-0000-00000000d302','CSAPI D3 Tenant B','CSAPI-D3-B','Asia/Amman','JOD','JO');

INSERT INTO public.clinic_users(
 id,tenant_id,auth_user_id,full_name,role,role_id,employee_code,pin_code,is_active,account_status
)
VALUES
 ('00000000-0000-0000-0000-00000000d304','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d303','D3 Doctor','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1),'D3-D','0000',true,'active'),
 ('00000000-0000-0000-0000-00000000d306','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d305','D3 Reception','receptionist',(SELECT id FROM public.roles WHERE role_key='receptionist' AND is_system_role=true LIMIT 1),'D3-R','0001',true,'active'),
 ('00000000-0000-0000-0000-00000000d308','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d307','D3 Unauthorized','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1),'D3-U','0002',true,'active'),
 ('00000000-0000-0000-0000-00000000d314','00000000-0000-0000-0000-00000000d302','00000000-0000-0000-0000-00000000d315','D3 Tenant B Doctor','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1),'D3-B','0003',true,'active');

INSERT INTO public.clinic_user_permission_overrides(tenant_id,user_id,permission_id,granted,created_by)
SELECT '00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d304',p.id,true,'00000000-0000-0000-0000-00000000d306'
FROM public.permissions p
WHERE p.permission_key IN ('patient_flow:clinical','sessions:update');

INSERT INTO public.clinic_user_permission_overrides(tenant_id,user_id,permission_id,granted,created_by)
SELECT '00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d306',p.id,true,'00000000-0000-0000-0000-00000000d306'
FROM public.permissions p
WHERE p.permission_key IN ('patient_flow:operations','sessions:update','sessions:close');

INSERT INTO public.clinic_patients(id,tenant_id,first_name,last_name,phone_primary,file_number)
VALUES
 ('00000000-0000-0000-0000-00000000d309','00000000-0000-0000-0000-00000000d301','D3','Patient A','0799000001','D3-A'),
 ('00000000-0000-0000-0000-00000000d316','00000000-0000-0000-0000-00000000d302','D3','Patient B','0799000002','D3-B');

INSERT INTO public.clinic_visit_sessions(id,tenant_id,patient_id,doctor_id,session_status,created_at,updated_at)
VALUES
 ('00000000-0000-0000-0000-00000000d310','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d309','00000000-0000-0000-0000-00000000d304','waiting',now(),now()),
 ('00000000-0000-0000-0000-00000000d311','00000000-0000-0000-0000-00000000d302','00000000-0000-0000-0000-00000000d316','00000000-0000-0000-0000-00000000d314','waiting',now(),now()),
 ('00000000-0000-0000-0000-00000000d312','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d309','00000000-0000-0000-0000-00000000d304','waiting',now(),now()),
 ('00000000-0000-0000-0000-00000000d313','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d309','00000000-0000-0000-0000-00000000d304','waiting',now(),now());

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305"}',true);

SELECT ok(
  (public.csapi_d3_enter_waiting(
    '00000000-0000-0000-0000-00000000d310',
    'general','normal','arrival',null,'00000000-0000-0000-0000-00000000e301'
  )->>'new_status')='waiting',
  'Enter Waiting returns waiting'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_queue_entries WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND exited_at IS NULL),
  1,
  'Enter Waiting creates one active Queue Entry'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND event_type='waiting_entered'),
  1,
  'Enter Waiting emits waiting_entered'
);

SELECT ok(
  (public.csapi_d3_enter_waiting(
    '00000000-0000-0000-0000-00000000d310',
    'general','normal','arrival',null,'00000000-0000-0000-0000-00000000e301'
  )->>'event_id') IS NOT NULL,
  'same correlation returns existing Enter Waiting outcome'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND event_type='waiting_entered'),
  1,
  'same Enter Waiting correlation does not duplicate the event'
);

SELECT ok(
  (public.csapi_d3_reorder_waiting(
    (SELECT id FROM public.patient_flow_queue_entries WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND exited_at IS NULL),
    1,'urgent','clinical','00000000-0000-0000-0000-00000000e302'
  )->>'new_status')='waiting',
  'Reorder Waiting keeps Visit waiting'
);
SELECT is(
  (SELECT position FROM public.patient_flow_queue_entries WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND exited_at IS NULL),
  1,
  'Reorder Waiting persists target position'
);
SELECT is(
  (SELECT count(*)::int FROM public.clinical_work_sessions WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND status='active'),
  0,
  'Reorder Waiting does not create Work Session'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND event_type='waiting_reordered'),
  1,
  'Reorder Waiting emits waiting_reordered'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d303"}',true);

SELECT ok(
  (public.csapi_d3_start_clinical_work(
    '00000000-0000-0000-0000-00000000d310',
    '00000000-0000-0000-0000-00000000e303'
  )->>'new_status')='in_consultation',
  'Start Clinical Work moves Visit to in_consultation'
);
SELECT is(
  (SELECT count(*)::int FROM public.clinical_work_sessions WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND status='active'),
  1,
  'Start Clinical Work creates exactly one active Work Session'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_queue_entries WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND exited_at IS NULL),
  0,
  'Start Clinical Work closes Waiting Queue Entry'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND event_type='clinical_started'),
  1,
  'Start Clinical Work emits clinical_started'
);

SELECT throws_ok(
  $sql$SELECT public.csapi_d3_start_clinical_work('00000000-0000-0000-0000-00000000d310','00000000-0000-0000-0000-00000000e304')$sql$,
  'P0001',
  NULL,
  'second clinical start is rejected'
);

SELECT ok(
  (public.csapi_d3_finish_clinical_work(
    '00000000-0000-0000-0000-00000000d310',
    '00000000-0000-0000-0000-00000000e305'
  )->>'new_status')='pending_close',
  'Finish Clinical Work moves Visit to pending_close'
);
SELECT is(
  (SELECT count(*)::int FROM public.clinical_work_sessions WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND status='finished' AND outcome='finish'),
  1,
  'Finish Clinical Work closes the Work Session normally'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_queue_entries WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND exited_at IS NULL AND routing_target='reception'),
  1,
  'Finish Clinical Work creates reception handoff Queue Entry'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND event_type='clinical_finished'),
  1,
  'Finish Clinical Work emits clinical_finished'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d303"}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_complete_reception('00000000-0000-0000-0000-00000000d310','00000000-0000-0000-0000-00000000e306')$sql$,
  'P0001',
  NULL,
  'clinical actor cannot complete reception-owned close'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305"}',true);
SELECT ok(
  (public.csapi_d3_complete_reception(
    '00000000-0000-0000-0000-00000000d310',
    '00000000-0000-0000-0000-00000000e307'
  )->>'new_status')='completed',
  'Complete Reception moves Visit to completed'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_queue_entries WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND exited_at IS NULL),
  0,
  'Complete Reception closes the active reception Queue Entry'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d310' AND event_type='reception_completed'),
  1,
  'Complete Reception emits reception_completed'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305"}',true);
SELECT public.csapi_d3_enter_waiting('00000000-0000-0000-0000-00000000d312','general','normal','arrival',null,'00000000-0000-0000-0000-00000000e308');
SELECT ok(
  (public.csapi_d3_mark_no_show('00000000-0000-0000-0000-00000000d312','no show','00000000-0000-0000-0000-00000000e309')->>'new_status')='no_show',
  'Mark No-show moves waiting Visit to no_show'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d312' AND event_type='no_show'),
  1,
  'Mark No-show emits no_show'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305"}',true);
SELECT public.csapi_d3_enter_waiting('00000000-0000-0000-0000-00000000d313','general','high','arrival',null,'00000000-0000-0000-0000-00000000e310');
SELECT ok(
  (public.csapi_d3_cancel_patient_flow('00000000-0000-0000-0000-00000000d313','reception cancel','00000000-0000-0000-0000-00000000e311')->>'new_status')='cancelled',
  'Cancel from Waiting moves Visit to cancelled'
);
SELECT is(
  (SELECT count(*)::int FROM public.patient_flow_events WHERE tenant_id='00000000-0000-0000-0000-00000000d301' AND visit_id='00000000-0000-0000-0000-00000000d313' AND event_type='cancelled'),
  1,
  'Cancel emits cancelled event'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d303"}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_start_clinical_work('00000000-0000-0000-0000-00000000d311','00000000-0000-0000-0000-00000000e312')$sql$,
  'P0001',
  NULL,
  'cross-tenant Visit is rejected'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d307"}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_mark_no_show('00000000-0000-0000-0000-00000000d310','unauthorized','00000000-0000-0000-0000-00000000e313')$sql$,
  'P0001',
  NULL,
  'unauthorized actor is rejected'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305"}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_mark_no_show('00000000-0000-0000-0000-00000000d312','mismatch','00000000-0000-0000-0000-00000000e301')$sql$,
  'P0001',
  NULL,
  'correlation key cannot be reused for another command type'
);

SELECT * FROM finish();
ROLLBACK;
