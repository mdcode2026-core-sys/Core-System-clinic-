alter table "public"."billing_events" drop constraint "billing_events_event_type_check";

alter table "public"."clinic_inquiries" drop constraint "clinic_inquiries_inquiry_type_check";

alter table "public"."clinic_inquiries" drop constraint "clinic_inquiries_status_check";

alter table "public"."clinic_invoices" drop constraint "clinic_invoices_invoice_status_check";

alter table "public"."clinic_invoices" drop constraint "clinic_invoices_payment_method_check";

alter table "public"."clinic_patients" drop constraint "clinic_patients_gender_check";

alter table "public"."clinic_patients" drop constraint "clinic_patients_patient_status_check";

alter table "public"."clinic_patients" drop constraint "clinic_patients_preferred_channel_check";

alter table "public"."clinic_rooms" drop constraint "clinic_rooms_room_type_check";

alter table "public"."clinic_users" drop constraint "clinic_users_role_check";

alter table "public"."clinic_visit_sessions" drop constraint "clinic_visit_sessions_session_status_check";

alter table "public"."inventory_ledger" drop constraint "inventory_ledger_consumption_type_check";

alter table "public"."master_agenda_events" drop constraint "master_agenda_events_cancellation_reason_check";

alter table "public"."master_agenda_events" drop constraint "master_agenda_events_event_type_check";

alter table "public"."master_agenda_events" drop constraint "master_agenda_events_status_check";

alter table "public"."master_agenda_events" drop constraint "master_agenda_events_visit_type_check";

alter table "public"."master_agenda_events" drop constraint "no_doctor_overlap";

alter table "public"."master_tenants" drop constraint "master_tenants_subscription_tier_check";

alter table "public"."notification_queue" drop constraint "notification_queue_channel_check";

alter table "public"."notification_queue" drop constraint "notification_queue_recipient_type_check";

alter table "public"."notification_queue" drop constraint "notification_queue_status_check";

alter table "public"."patient_history" drop constraint "patient_history_loyalty_tier_check";

alter table "public"."retention_followups" drop constraint "retention_followups_channel_check";

alter table "public"."retention_followups" drop constraint "retention_followups_delivery_status_check";

alter table "public"."retention_followups" drop constraint "retention_followups_followup_type_check";

alter table "public"."tenant_devices" drop constraint "tenant_devices_device_type_check";

drop index if exists "public"."idx_agenda_doctor_date";

drop index if exists "public"."idx_sessions_status";

select 1; 
-- drop index if exists "public"."no_doctor_overlap";

CREATE INDEX idx_agenda_doctor_date ON public.master_agenda_events USING btree (doctor_id, scheduled_start) WHERE ((status)::text <> ALL ((ARRAY['cancelled'::character varying, 'no_show'::character varying])::text[]));

CREATE INDEX idx_sessions_status ON public.clinic_visit_sessions USING btree (tenant_id, session_status) WHERE ((session_status)::text <> ALL ((ARRAY['completed'::character varying, 'cancelled'::character varying])::text[]));

select 1; 
-- CREATE INDEX no_doctor_overlap ON public.master_agenda_events USING gist (doctor_id, tstzrange(scheduled_start, buffer_end)) WHERE ((status)::text <> ALL ((ARRAY['cancelled'::character varying, 'no_show'::character varying])::text[]));

alter table "public"."billing_events" add constraint "billing_events_event_type_check" CHECK (((event_type)::text = ANY ((ARRAY['trial_started'::character varying, 'trial_expired'::character varying, 'subscription_created'::character varying, 'subscription_upgraded'::character varying, 'subscription_downgraded'::character varying, 'subscription_cancelled'::character varying, 'manual_activation'::character varying, 'tier_override_by_admin'::character varying, 'feature_flag_toggled'::character varying])::text[]))) not valid;

alter table "public"."billing_events" validate constraint "billing_events_event_type_check";

alter table "public"."clinic_inquiries" add constraint "clinic_inquiries_inquiry_type_check" CHECK (((inquiry_type)::text = ANY ((ARRAY['walk_in'::character varying, 'appointment'::character varying, 'callback'::character varying, 'online'::character varying])::text[]))) not valid;

alter table "public"."clinic_inquiries" validate constraint "clinic_inquiries_inquiry_type_check";

alter table "public"."clinic_inquiries" add constraint "clinic_inquiries_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'converted_to_session'::character varying, 'cancelled'::character varying, 'rescheduled'::character varying, 'no_show'::character varying])::text[]))) not valid;

alter table "public"."clinic_inquiries" validate constraint "clinic_inquiries_status_check";

alter table "public"."clinic_invoices" add constraint "clinic_invoices_invoice_status_check" CHECK (((invoice_status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'paid'::character varying, 'partial'::character varying, 'cancelled'::character varying, 'refunded'::character varying])::text[]))) not valid;

alter table "public"."clinic_invoices" validate constraint "clinic_invoices_invoice_status_check";

alter table "public"."clinic_invoices" add constraint "clinic_invoices_payment_method_check" CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'bank_transfer'::character varying, 'installment'::character varying, 'mixed'::character varying, NULL::character varying])::text[]))) not valid;

alter table "public"."clinic_invoices" validate constraint "clinic_invoices_payment_method_check";

alter table "public"."clinic_patients" add constraint "clinic_patients_gender_check" CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[]))) not valid;

alter table "public"."clinic_patients" validate constraint "clinic_patients_gender_check";

alter table "public"."clinic_patients" add constraint "clinic_patients_patient_status_check" CHECK (((patient_status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'vip'::character varying, 'blocked'::character varying])::text[]))) not valid;

alter table "public"."clinic_patients" validate constraint "clinic_patients_patient_status_check";

alter table "public"."clinic_patients" add constraint "clinic_patients_preferred_channel_check" CHECK (((preferred_channel)::text = ANY ((ARRAY['whatsapp'::character varying, 'sms'::character varying, 'email'::character varying])::text[]))) not valid;

alter table "public"."clinic_patients" validate constraint "clinic_patients_preferred_channel_check";

alter table "public"."clinic_rooms" add constraint "clinic_rooms_room_type_check" CHECK (((room_type)::text = ANY ((ARRAY['consultation'::character varying, 'procedure'::character varying, 'waiting'::character varying, 'reception'::character varying])::text[]))) not valid;

alter table "public"."clinic_rooms" validate constraint "clinic_rooms_room_type_check";

alter table "public"."clinic_users" add constraint "clinic_users_role_check" CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'clinic_admin'::character varying, 'doctor'::character varying, 'receptionist'::character varying])::text[]))) not valid;

alter table "public"."clinic_users" validate constraint "clinic_users_role_check";

alter table "public"."clinic_visit_sessions" add constraint "clinic_visit_sessions_session_status_check" CHECK (((session_status)::text = ANY ((ARRAY['waiting'::character varying, 'in_consultation'::character varying, 'pending_close'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."clinic_visit_sessions" validate constraint "clinic_visit_sessions_session_status_check";

alter table "public"."inventory_ledger" add constraint "inventory_ledger_consumption_type_check" CHECK (((consumption_type)::text = ANY ((ARRAY['standard_clinical'::character varying, 'operational_waste'::character varying])::text[]))) not valid;

alter table "public"."inventory_ledger" validate constraint "inventory_ledger_consumption_type_check";

alter table "public"."master_agenda_events" add constraint "master_agenda_events_cancellation_reason_check" CHECK (((cancellation_reason)::text = ANY ((ARRAY['patient_request'::character varying, 'doctor_unavailable'::character varying, 'emergency'::character varying, 'duplicate'::character varying, 'financial'::character varying, 'other'::character varying, NULL::character varying])::text[]))) not valid;

alter table "public"."master_agenda_events" validate constraint "master_agenda_events_cancellation_reason_check";

alter table "public"."master_agenda_events" add constraint "master_agenda_events_event_type_check" CHECK (((event_type)::text = ANY ((ARRAY['appointment'::character varying, 'block'::character varying, 'break'::character varying, 'emergency'::character varying])::text[]))) not valid;

alter table "public"."master_agenda_events" validate constraint "master_agenda_events_event_type_check";

alter table "public"."master_agenda_events" add constraint "master_agenda_events_status_check" CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'confirmed'::character varying, 'arrived'::character varying, 'in_session'::character varying, 'completed'::character varying, 'no_show'::character varying, 'cancelled'::character varying, 'rescheduled'::character varying])::text[]))) not valid;

alter table "public"."master_agenda_events" validate constraint "master_agenda_events_status_check";

alter table "public"."master_agenda_events" add constraint "master_agenda_events_visit_type_check" CHECK (((visit_type)::text = ANY ((ARRAY['first_time'::character varying, 'follow_up'::character varying, 'emergency'::character varying, 'consultation'::character varying])::text[]))) not valid;

alter table "public"."master_agenda_events" validate constraint "master_agenda_events_visit_type_check";

alter table "public"."master_agenda_events" add constraint "no_doctor_overlap" EXCLUDE USING gist (doctor_id WITH =, tstzrange(scheduled_start, buffer_end) WITH &&) WHERE (((status)::text <> ALL ((ARRAY['cancelled'::character varying, 'no_show'::character varying])::text[])));

alter table "public"."master_tenants" add constraint "master_tenants_subscription_tier_check" CHECK (((subscription_tier)::text = ANY ((ARRAY['trial'::character varying, 'essential'::character varying, 'professional'::character varying, 'enterprise'::character varying, 'suspended'::character varying])::text[]))) not valid;

alter table "public"."master_tenants" validate constraint "master_tenants_subscription_tier_check";

alter table "public"."notification_queue" add constraint "notification_queue_channel_check" CHECK (((channel)::text = ANY ((ARRAY['whatsapp'::character varying, 'sms'::character varying, 'email'::character varying, 'in_app'::character varying])::text[]))) not valid;

alter table "public"."notification_queue" validate constraint "notification_queue_channel_check";

alter table "public"."notification_queue" add constraint "notification_queue_recipient_type_check" CHECK (((recipient_type)::text = ANY ((ARRAY['patient'::character varying, 'staff'::character varying, 'admin'::character varying])::text[]))) not valid;

alter table "public"."notification_queue" validate constraint "notification_queue_recipient_type_check";

alter table "public"."notification_queue" add constraint "notification_queue_status_check" CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'processing'::character varying, 'sent'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."notification_queue" validate constraint "notification_queue_status_check";

alter table "public"."patient_history" add constraint "patient_history_loyalty_tier_check" CHECK (((loyalty_tier)::text = ANY ((ARRAY['standard'::character varying, 'silver'::character varying, 'gold'::character varying, 'vip'::character varying])::text[]))) not valid;

alter table "public"."patient_history" validate constraint "patient_history_loyalty_tier_check";

alter table "public"."retention_followups" add constraint "retention_followups_channel_check" CHECK (((channel)::text = ANY ((ARRAY['whatsapp'::character varying, 'sms'::character varying, 'email'::character varying, 'in_app'::character varying])::text[]))) not valid;

alter table "public"."retention_followups" validate constraint "retention_followups_channel_check";

alter table "public"."retention_followups" add constraint "retention_followups_delivery_status_check" CHECK (((delivery_status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'read'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."retention_followups" validate constraint "retention_followups_delivery_status_check";

alter table "public"."retention_followups" add constraint "retention_followups_followup_type_check" CHECK (((followup_type)::text = ANY ((ARRAY['post_visit_24h'::character varying, 'post_visit_7d'::character varying, 'reactivation_30d'::character varying, 'reactivation_60d'::character varying, 'reactivation_90d'::character varying, 'appointment_reminder_24h'::character varying, 'appointment_reminder_2h'::character varying, 'birthday'::character varying, 'custom'::character varying])::text[]))) not valid;

alter table "public"."retention_followups" validate constraint "retention_followups_followup_type_check";

alter table "public"."tenant_devices" add constraint "tenant_devices_device_type_check" CHECK (((device_type)::text = ANY ((ARRAY['reception_desktop'::character varying, 'doctor_tablet'::character varying, 'admin_laptop'::character varying, 'mobile'::character varying, 'other'::character varying])::text[]))) not valid;

alter table "public"."tenant_devices" validate constraint "tenant_devices_device_type_check";


