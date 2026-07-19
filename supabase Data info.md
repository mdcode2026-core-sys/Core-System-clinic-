
A) معلومات الجداول والأعمدة

table_name,ordinal_position,column_name,data_type,is_nullable,column_default
analytics_daily_snapshots,1,id,uuid,NO,gen_random_uuid()
analytics_daily_snapshots,2,tenant_id,uuid,NO,null
analytics_daily_snapshots,3,snapshot_date,date,NO,null
analytics_daily_snapshots,4,total_visits,integer,YES,0
analytics_daily_snapshots,5,total_new_patients,integer,YES,0
analytics_daily_snapshots,6,total_returning_patients,integer,YES,0
analytics_daily_snapshots,7,total_no_shows,integer,YES,0
analytics_daily_snapshots,8,total_cancellations,integer,YES,0
analytics_daily_snapshots,9,avg_wait_time_minutes,numeric,YES,0
analytics_daily_snapshots,10,avg_session_duration_minutes,numeric,YES,0
analytics_daily_snapshots,11,total_revenue_subunits,bigint,YES,0
analytics_daily_snapshots,12,total_discounts_subunits,integer,YES,0
analytics_daily_snapshots,13,hot_leads_count,integer,YES,0
analytics_daily_snapshots,14,conversion_rate,numeric,YES,0
analytics_daily_snapshots,15,snapshot_metadata,jsonb,YES,'{}'::jsonb
analytics_daily_snapshots,16,created_at,timestamp with time zone,NO,now()
audit_trail,1,id,uuid,NO,gen_random_uuid()
audit_trail,2,tenant_id,uuid,NO,null
audit_trail,3,actor_id,uuid,YES,null
audit_trail,4,actor_role,character varying,YES,null
audit_trail,5,action,character varying,NO,null
audit_trail,6,table_name,character varying,NO,null
audit_trail,7,record_id,uuid,YES,null
audit_trail,8,old_values,jsonb,YES,null
audit_trail,9,new_values,jsonb,YES,null
audit_trail,10,reason,text,YES,null
audit_trail,11,ip_address,inet,YES,null
audit_trail,12,created_at,timestamp with time zone,NO,now()
billing_events,1,id,uuid,NO,gen_random_uuid()
billing_events,2,tenant_id,uuid,YES,null
billing_events,3,event_type,character varying,NO,null
billing_events,4,previous_tier,character varying,YES,null
billing_events,5,new_tier,character varying,YES,null
billing_events,6,amount_subunits,integer,YES,0
billing_events,7,is_manual,boolean,YES,false
billing_events,8,activated_by,uuid,YES,null
billing_events,9,activation_notes,text,YES,null
billing_events,10,event_metadata,jsonb,YES,'{}'::jsonb
billing_events,11,created_at,timestamp with time zone,NO,now()
clinic_inquiries,1,id,uuid,NO,gen_random_uuid()
clinic_inquiries,2,tenant_id,uuid,NO,null
clinic_inquiries,3,inquiry_type,character varying,NO,null
clinic_inquiries,4,patient_id,uuid,YES,null
clinic_inquiries,5,temp_patient_name,character varying,YES,null
clinic_inquiries,6,temp_phone,character varying,YES,null
clinic_inquiries,7,inquiry_reason,character varying,YES,null
clinic_inquiries,8,procedures_requested,ARRAY,YES,null
clinic_inquiries,9,status,character varying,YES,'pending'::character varying
clinic_inquiries,10,handled_by,uuid,YES,null
clinic_inquiries,11,notes,text,YES,null
clinic_inquiries,12,created_at,timestamp with time zone,NO,now()
clinic_inquiries,13,updated_at,timestamp with time zone,NO,now()
clinic_invoices,1,id,uuid,NO,gen_random_uuid()
clinic_invoices,2,tenant_id,uuid,NO,null
clinic_invoices,3,session_id,uuid,NO,null
clinic_invoices,4,patient_id,uuid,NO,null
clinic_invoices,5,subtotal_subunits,integer,NO,0
clinic_invoices,6,discount_subunits,integer,NO,0
clinic_invoices,7,discount_reason,character varying,YES,null
clinic_invoices,8,discount_approved_by,uuid,YES,null
clinic_invoices,9,tax_subunits,integer,NO,0
clinic_invoices,10,total_subunits,integer,NO,0
clinic_invoices,11,amount_paid_subunits,integer,NO,0
clinic_invoices,12,amount_due_subunits,integer,YES,null
clinic_invoices,13,payment_method,character varying,YES,null
clinic_invoices,14,invoice_status,character varying,YES,'draft'::character varying
clinic_invoices,15,collected_by,uuid,YES,null
clinic_invoices,16,invoice_date,date,NO,CURRENT_DATE
clinic_invoices,17,created_at,timestamp with time zone,NO,now()
clinic_invoices,18,updated_at,timestamp with time zone,NO,now()
clinic_patients,1,id,uuid,NO,gen_random_uuid()
clinic_patients,2,tenant_id,uuid,NO,null
clinic_patients,3,first_name,character varying,NO,null
clinic_patients,4,last_name,character varying,NO,null
clinic_patients,5,first_name_ar,character varying,YES,null
clinic_patients,6,last_name_ar,character varying,YES,null
clinic_patients,7,date_of_birth,date,YES,null
clinic_patients,8,gender,character varying,YES,null
clinic_patients,9,phone_primary,character varying,NO,null
clinic_patients,10,phone_secondary,character varying,YES,null
clinic_patients,11,email,character varying,YES,null
clinic_patients,12,preferred_channel,character varying,YES,'whatsapp'::character varying
clinic_patients,13,first_visit_date,date,YES,null
clinic_patients,14,referral_source,character varying,YES,null
clinic_patients,15,patient_status,character varying,YES,'active'::character varying
clinic_patients,16,notes,text,YES,null
clinic_patients,17,created_at,timestamp with time zone,NO,now()
clinic_patients,18,updated_at,timestamp with time zone,NO,now()
clinic_patients,19,deleted_at,timestamp with time zone,YES,null
clinic_procedures,1,id,uuid,NO,gen_random_uuid()
clinic_procedures,2,tenant_id,uuid,NO,null
clinic_procedures,3,procedure_name,character varying,NO,null
clinic_procedures,4,procedure_name_ar,character varying,YES,null
clinic_procedures,5,category,character varying,YES,null
clinic_procedures,6,standard_duration_minutes,smallint,NO,30
clinic_procedures,7,buffer_time_minutes,smallint,NO,10
clinic_procedures,8,base_price_subunits,integer,NO,0
clinic_procedures,9,is_active,boolean,NO,true
clinic_procedures,10,created_at,timestamp with time zone,NO,now()
clinic_procedures,11,updated_at,timestamp with time zone,NO,now()


-------

B) العلاقات (Foreign Keys)

table_name,column_name,references_table,references_column
analytics_daily_snapshots,tenant_id,master_tenants,id
audit_trail,actor_id,clinic_users,id
audit_trail,tenant_id,master_tenants,id
billing_events,activated_by,clinic_users,id
billing_events,tenant_id,master_tenants,id
clinic_inquiries,tenant_id,master_tenants,id
clinic_inquiries,patient_id,clinic_patients,id
clinic_inquiries,handled_by,clinic_users,id
clinic_invoices,tenant_id,master_tenants,id
clinic_invoices,discount_approved_by,clinic_users,id
clinic_invoices,collected_by,clinic_users,id
clinic_invoices,session_id,clinic_visit_sessions,id
clinic_invoices,patient_id,clinic_patients,id
clinic_patients,tenant_id,master_tenants,id
clinic_procedures,tenant_id,master_tenants,id
clinic_rooms,tenant_id,master_tenants,id
clinic_users,tenant_id,master_tenants,id
clinic_visit_sessions,tenant_id,master_tenants,id
clinic_visit_sessions,patient_id,clinic_patients,id
clinic_visit_sessions,doctor_id,clinic_users,id
clinic_visit_sessions,room_id,clinic_rooms,id
clinic_visit_sessions,agenda_event_id,master_agenda_events,id
clinic_visit_sessions,lock_holder_id,clinic_users,id
clinic_visit_sessions,initialized_by_receptionist,clinic_users,id
feature_flags,tenant_id,master_tenants,id
inventory_ledger,tenant_id,master_tenants,id
inventory_ledger,procedure_id,clinic_procedures,id
inventory_ledger,logged_by,clinic_users,id
inventory_ledger,session_id,clinic_visit_sessions,id
master_agenda_events,created_by,clinic_users,id
master_agenda_events,room_id,clinic_rooms,id
master_agenda_events,doctor_id,clinic_users,id
master_agenda_events,patient_id,clinic_patients,id
master_agenda_events,tenant_id,master_tenants,id
master_agenda_events,procedure_id,clinic_procedures,id
master_agenda_events,inquiry_id,clinic_inquiries,id
notification_queue,tenant_id,master_tenants,id
patient_history,tenant_id,master_tenants,id
patient_history,patient_id,clinic_patients,id
retention_followups,session_id,clinic_visit_sessions,id
retention_followups,sent_by,clinic_users,id
retention_followups,tenant_id,master_tenants,id
retention_followups,patient_id,clinic_patients,id
role_permissions,role_id,roles,id
role_permissions,permission_id,permissions,id
subscription_events,subscription_id,subscriptions,id
subscription_events,tenant_id,tenants,id
subscriptions,tenant_id,tenants,id
subscriptions,plan_id,subscription_plans,id
tenant_devices,tenant_id,master_tenants,id
users,role_id,roles,id
users,tenant_id,tenants,id

----

C) الدوال (Functions)

routine_name
cash_dist
create_tenant_with_subscription
custom_access_token_hook
date_dist
float4_dist
float8_dist
fn_audit_changes
fn_log_subscription_change
fn_set_auto_close
fn_set_session_buffer
fn_set_updated_at
gbt_bit_compress
gbt_bit_consistent
gbt_bit_penalty
gbt_bit_picksplit
gbt_bit_same
gbt_bit_union
gbt_bool_compress
gbt_bool_consistent
gbt_bool_fetch
gbt_bool_penalty
gbt_bool_picksplit
gbt_bool_same
gbt_bool_union
gbt_bpchar_compress
gbt_bpchar_consistent
gbt_bytea_compress
gbt_bytea_consistent
gbt_bytea_penalty
gbt_bytea_picksplit
gbt_bytea_same
gbt_bytea_union
gbt_cash_compress
gbt_cash_consistent
gbt_cash_distance
gbt_cash_fetch
gbt_cash_penalty
gbt_cash_picksplit
gbt_cash_same
gbt_cash_union
gbt_date_compress
gbt_date_consistent
gbt_date_distance
gbt_date_fetch
gbt_date_penalty
gbt_date_picksplit
gbt_date_same
gbt_date_union
gbt_decompress
gbt_enum_compress
gbt_enum_consistent
gbt_enum_fetch
gbt_enum_penalty
gbt_enum_picksplit
gbt_enum_same
gbt_enum_union
gbt_float4_compress
gbt_float4_consistent
gbt_float4_distance
gbt_float4_fetch
gbt_float4_penalty
gbt_float4_picksplit
gbt_float4_same
gbt_float4_union
gbt_float8_compress
gbt_float8_consistent
gbt_float8_distance
gbt_float8_fetch
gbt_float8_penalty
gbt_float8_picksplit
gbt_float8_same
gbt_float8_union
gbt_inet_compress
gbt_inet_consistent
gbt_inet_penalty
gbt_inet_picksplit
gbt_inet_same
gbt_inet_union
gbt_int2_compress
gbt_int2_consistent
gbt_int2_distance
gbt_int2_fetch
gbt_int2_penalty
gbt_int2_picksplit
gbt_int2_same
gbt_int2_union
gbt_int4_compress
gbt_int4_consistent
gbt_int4_distance
gbt_int4_fetch
gbt_int4_penalty
gbt_int4_picksplit
gbt_int4_same
gbt_int4_union
gbt_int8_compress
gbt_int8_consistent
gbt_int8_distance
gbt_int8_fetch
gbt_int8_penalty
gbt_int8_picksplit

------

D) Triggers

event_object_table,trigger_name
buckets,enforce_bucket_name_length_trigger
buckets,enforce_bucket_name_length_trigger
buckets,protect_buckets_delete
clinic_inquiries,tr_inquiries_updated
clinic_invoices,tr_audit_invoices
clinic_invoices,tr_invoices_updated
clinic_patients,tr_patients_updated
clinic_procedures,tr_procedures_updated
clinic_rooms,tr_rooms_updated
clinic_users,tr_users_updated
clinic_visit_sessions,tr_session_buffer
clinic_visit_sessions,tr_sessions_updated
clinic_visit_sessions,tr_audit_sessions
clinic_visit_sessions,tr_auto_close_timer
feature_flags,tr_flags_updated
master_agenda_events,tr_agenda_updated
master_tenants,tr_audit_tenants
master_tenants,tr_tenants_updated
objects,update_objects_updated_at
objects,protect_objects_delete
patient_history,tr_history_updated
retention_followups,tr_followups_updated
subscription,tr_check_filters
subscription,tr_check_filters
subscriptions,tr_subscriptions_updated
subscriptions,tr_subscription_events
tenants,tr_tenants_updated
users,tr_users_updated
users,on_auth_user_created
users,on_auth_user_created


------

E) RLS

tablename,rowsecurity
analytics_daily_snapshots,true
audit_trail,true
billing_events,true
clinic_inquiries,true
clinic_invoices,true
clinic_patients,true
clinic_procedures,true
clinic_rooms,true
clinic_users,true
clinic_visit_sessions,true
feature_flags,true
inventory_ledger,true
master_agenda_events,true
master_tenants,true
notification_queue,true
patient_history,true
permissions,true
retention_followups,true
role_permissions,true
roles,true
subscription_events,true
subscription_plans,true
subscriptions,true
tenant_devices,true
tenants,true
users,true

----

F) Policies

tablename,policyname,cmd
analytics_daily_snapshots,rls_snapshots_isolation,ALL
audit_trail,rls_breaches_isolation,ALL
audit_trail,rls_audit_read,SELECT
billing_events,rls_billing_isolation,ALL
clinic_inquiries,rls_inquiries_isolation,ALL
clinic_invoices,rls_invoices_no_doctor,ALL
clinic_patients,rls_patients_isolation,ALL
clinic_procedures,rls_procedures_isolation,ALL
clinic_rooms,rls_rooms_isolation,ALL
clinic_users,rls_users_isolation,ALL
clinic_visit_sessions,rls_sessions_update,UPDATE
clinic_visit_sessions,rls_sessions_select,SELECT
clinic_visit_sessions,rls_sessions_write,INSERT
feature_flags,rls_flags_read,SELECT
feature_flags,rls_flags_write,ALL
inventory_ledger,rls_inventory_isolation,ALL
master_agenda_events,rls_agenda_isolation,ALL
master_tenants,rls_tenants_isolation,ALL
master_tenants,rls_tenants_super_admin,ALL
notification_queue,rls_notifications_isolation,ALL
patient_history,rls_history_isolation,ALL
permissions,rls_permissions_read,SELECT
retention_followups,rls_followups_isolation,ALL
role_permissions,rls_role_permissions_read,SELECT
roles,rls_roles_read,SELECT
subscription_events,rls_events_super_admin,ALL
subscription_events,rls_events_isolation,ALL
subscriptions,rls_subscriptions_super_admin,ALL
subscriptions,rls_subscriptions_isolation,ALL
tenant_devices,rls_devices_isolation,ALL
tenants,rls_tenants_isolation,ALL
tenants,rls_tenants_super_admin,ALL
users,rls_users_super_admin,ALL
users,rls_users_isolation,ALL


----

G) ENUM Types

typname,enumlabel
aal_level,aal1
aal_level,aal2
aal_level,aal3
action,INSERT
action,UPDATE
action,DELETE
action,TRUNCATE
action,ERROR
buckettype,STANDARD
buckettype,ANALYTICS
buckettype,VECTOR
code_challenge_method,s256
code_challenge_method,plain
equality_op,eq
equality_op,neq
equality_op,lt
equality_op,lte
equality_op,gt
equality_op,gte
equality_op,in
equality_op,like
equality_op,ilike
equality_op,is
equality_op,match
equality_op,imatch
equality_op,isdistinct
factor_status,unverified
factor_status,verified
factor_type,totp
factor_type,webauthn
factor_type,phone
oauth_authorization_status,pending
oauth_authorization_status,approved
oauth_authorization_status,denied
oauth_authorization_status,expired
oauth_client_type,public
oauth_client_type,confidential
oauth_registration_type,dynamic
oauth_registration_type,manual
oauth_response_type,code
one_time_token_type,confirmation_token
one_time_token_type,reauthentication_token
one_time_token_type,recovery_token
one_time_token_type,email_change_token_new
one_time_token_type,email_change_token_current
one_time_token_type,phone_change_token
request_status,PENDING
request_status,SUCCESS
request_status,ERROR