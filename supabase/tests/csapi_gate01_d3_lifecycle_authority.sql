BEGIN;

SELECT plan(10);

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

INSERT INTO auth.users (
  id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
)
VALUES
 ('00000000-0000-0000-0000-00000000d303','authenticated','authenticated','d3-doctor@example.test',now(),'{}'::jsonb,'{}'::jsonb,now(),now(),false,false),
 ('00000000-0000-0000-0000-00000000d305','authenticated','authenticated','d3-reception@example.test',now(),'{}'::jsonb,'{}'::jsonb,now(),now(),false,false),
 ('00000000-0000-0000-0000-00000000d307','authenticated','authenticated','d3-unauthorized@example.test',now(),'{}'::jsonb,'{}'::jsonb,now(),now(),false,false),
 ('00000000-0000-0000-0000-00000000d315','authenticated','authenticated','d3-tenant-b-doctor@example.test',now(),'{}'::jsonb,'{}'::jsonb,now(),now(),false,false);

INSERT INTO public.subscriptions (
  id,tenant_id,plan_id,status,billing_cycle,started_at,ends_at,trial_ends_at
)
SELECT
  x.id,
  x.tenant_id,
  sp.id,
  'active',
  'monthly',
  now(),
  NULL,
  NULL
FROM (
  VALUES
   ('00000000-0000-0000-0000-00000000d317'::uuid,'00000000-0000-0000-0000-00000000d301'::uuid),
   ('00000000-0000-0000-0000-00000000d318'::uuid,'00000000-0000-0000-0000-00000000d302'::uuid)
) AS x(id,tenant_id)
JOIN public.subscription_plans sp ON sp.plan_key='enterprise'
  AND sp.is_active=true
  AND sp.deleted_at IS NULL;

INSERT INTO public.clinic_users(
 id,tenant_id,auth_user_id,full_name,role,role_id,employee_code,pin_code,is_active
)
VALUES
 ('00000000-0000-0000-0000-00000000d304','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d303','D3 Doctor','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1),'D3-D','0000',true),
 ('00000000-0000-0000-0000-00000000d306','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d305','D3 Reception','receptionist',(SELECT id FROM public.roles WHERE role_key='receptionist' AND is_system_role=true LIMIT 1),'D3-R','0001',true),
 ('00000000-0000-0000-0000-00000000d308','00000000-0000-0000-0000-00000000d301','00000000-0000-0000-0000-00000000d307','D3 Unauthorized','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1) ,'D3-U','0002',true),
 ('00000000-0000-0000-0000-00000000d314','00000000-0000-0000-0000-00000000d302','00000000-0000-0000-0000-00000000d315','D3 Tenant B Doctor','doctor',(SELECT id FROM public.roles WHERE role_key='doctor' AND is_system_role=true LIMIT 1) ,'D3-B','0003',true);

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
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305","app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d301"}}',true);

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

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305","app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d301"}}',true);
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

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d303","app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d301"}}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_start_clinical_work('00000000-0000-0000-0000-00000000d311','00000000-0000-0000-0000-00000000e312')$sql$,
  'P0001',
  NULL,
  'cross-tenant Visit is rejected'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d307","app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d301"}}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_mark_no_show('00000000-0000-0000-0000-00000000d310','unauthorized','00000000-0000-0000-0000-00000000e313')$sql$,
  'P0001',
  NULL,
  'unauthorized actor is rejected'
);

SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000d305","app_metadata":{"tenant_id":"00000000-0000-0000-0000-00000000d301"}}',true);
SELECT throws_ok(
  $sql$SELECT public.csapi_d3_mark_no_show('00000000-0000-0000-0000-00000000d312','mismatch','00000000-0000-0000-0000-00000000e301')$sql$,
  'P0001',
  NULL,
  'correlation key cannot be reused for another command type'
);

SELECT * FROM finish();
ROLLBACK;
