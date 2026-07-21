


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_tenant_with_subscription"("p_clinic_name" "text", "p_full_name" "text", "p_email" "text", "p_auth_user_id" "uuid", "p_clinic_name_ar" "text" DEFAULT NULL::"text", "p_license_key" "text" DEFAULT NULL::"text", "p_plan_key" "text" DEFAULT 'trial'::"text", "p_timezone" "text" DEFAULT 'Asia/Amman'::"text", "p_currency" "text" DEFAULT 'JOD'::"text", "p_country_code" "text" DEFAULT 'JO'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_tenant_id UUID;
    v_plan_id UUID;
    v_role_id UUID;
    v_user_id UUID;
    v_subscription_id UUID;
    v_license TEXT;
BEGIN
    v_license := COALESCE(p_license_key, 'LIC-' || EXTRACT(EPOCH FROM NOW())::BIGINT);

    SELECT id INTO v_plan_id FROM subscription_plans WHERE plan_key = p_plan_key;
    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plan not found: %', p_plan_key;
    END IF;

    SELECT id INTO v_role_id FROM roles WHERE role_key = 'clinic_owner';
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Role not found: clinic_owner';
    END IF;

    INSERT INTO tenants (clinic_name, clinic_name_ar, license_key, timezone, currency, country_code)
    VALUES (p_clinic_name, p_clinic_name_ar, v_license, p_timezone, p_currency, p_country_code)
    RETURNING id INTO v_tenant_id;

    INSERT INTO subscriptions (tenant_id, plan_id, status, trial_ends_at)
    VALUES (
        v_tenant_id,
        v_plan_id,
        'trial',
        CASE WHEN p_plan_key = 'trial' THEN NOW() + INTERVAL '14 days' ELSE NULL END
    )
    RETURNING id INTO v_subscription_id;

    INSERT INTO subscription_events (subscription_id, tenant_id, event_type, new_status, new_plan_id, reason)
    VALUES (v_subscription_id, v_tenant_id, 'created', 'trial', v_plan_id, 'Tenant created via signUp');

    INSERT INTO users (tenant_id, auth_user_id, full_name, email, role_id, employee_code, pin_code)
    VALUES (
        v_tenant_id,
        p_auth_user_id,
        p_full_name,
        p_email,
        v_role_id,
        'EMP-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
    )
    RETURNING id INTO v_user_id;

    RETURN jsonb_build_object(
        'tenant_id', v_tenant_id,
        'subscription_id', v_subscription_id,
        'user_id', v_user_id,
        'license_key', v_license
    );
END;
$$;


ALTER FUNCTION "public"."create_tenant_with_subscription"("p_clinic_name" "text", "p_full_name" "text", "p_email" "text", "p_auth_user_id" "uuid", "p_clinic_name_ar" "text", "p_license_key" "text", "p_plan_key" "text", "p_timezone" "text", "p_currency" "text", "p_country_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
    v_role_key TEXT;
BEGIN
    v_user_id := (event->>'user_id')::UUID;
    
    -- البحث في clinic_users أولاً (الجديد)
    SELECT cu.tenant_id, cu.role
    INTO v_tenant_id, v_role_key
    FROM public.clinic_users cu
    WHERE cu.auth_user_id = v_user_id;
    
    -- إذا لم يجد، البحث في users (القديم - للتوافق)
    IF v_tenant_id IS NULL THEN
        SELECT u.tenant_id, r.role_key
        INTO v_tenant_id, v_role_key
        FROM public.users u
        JOIN public.roles r ON r.id = u.role_id
        WHERE u.auth_user_id = v_user_id;
    END IF;

    IF v_tenant_id IS NOT NULL THEN
        event := jsonb_set(
            event, 
            '{app_metadata}', 
            COALESCE(event->'app_metadata', '{}'::jsonb) || 
            jsonb_build_object(
                'tenant_id', v_tenant_id::text,
                'user_role', v_role_key
            )
        );
    END IF;

    RETURN event;
END;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_audit_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (
            tenant_id, actor_id, actor_role, action, table_name, record_id,
            old_values, new_values
        ) VALUES (
            COALESCE(NEW.tenant_id, OLD.tenant_id),
            auth.uid(),
            get_current_user_role(),
            'UPDATE',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_audit_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_log_subscription_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO subscription_events (
            subscription_id, tenant_id, event_type,
            previous_status, new_status, previous_plan_id, new_plan_id, reason
        ) VALUES (
            NEW.id, NEW.tenant_id, 'status_changed',
            OLD.status, NEW.status, OLD.plan_id, NEW.plan_id,
            COALESCE(NEW.metadata->>'change_reason', 'Status updated')
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_log_subscription_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_set_auto_close"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.visit_closed_at IS NOT NULL AND OLD.visit_closed_at IS NULL AND NEW.session_status = 'pending_close' THEN
        NEW.auto_close_at = NEW.visit_closed_at + INTERVAL '60 minutes';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_set_auto_close"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_set_session_buffer"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.session_ended_at IS NOT NULL AND OLD.session_ended_at IS NULL THEN
        NEW.session_status = 'pending_close';
        NEW.buffer_window_expires_at = NEW.session_ended_at + INTERVAL '5 minutes';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_set_session_buffer"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- محاولة قراءة من JWT (app_metadata)
    v_tenant_id := (auth.jwt()->'app_metadata'->>'tenant_id')::UUID;
    
    -- إذا لم تكن في app_metadata، تحقق من user_metadata
    IF v_tenant_id IS NULL THEN
        v_tenant_id := (auth.jwt()->'user_metadata'->>'tenant_id')::UUID;
    END IF;
    
    -- إذا فشلت JWT، اقرأ من current_setting (لـ Server Actions)
    IF v_tenant_id IS NULL THEN
        BEGIN
            v_tenant_id := current_setting('app.current_tenant_id', true)::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_tenant_id := NULL;
        END;
    END IF;
    
    RETURN v_tenant_id;
END;
$$;


ALTER FUNCTION "public"."get_current_tenant_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT auth.jwt() ->> 'user_role';
$$;


ALTER FUNCTION "public"."get_current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_tenant_id UUID;
    v_role_key TEXT;
BEGIN
    -- البحث عن المستخدم في جدول users
    SELECT u.tenant_id, r.role_key
    INTO v_tenant_id, v_role_key
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.auth_user_id = NEW.id;

    -- إذا وجدنا المستخدم، نُضيف Claims
    IF v_tenant_id IS NOT NULL THEN
        NEW.raw_user_meta_data = jsonb_set(
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
            '{tenant_id}',
            to_jsonb(v_tenant_id::text)
        );
        NEW.raw_user_meta_data = jsonb_set(
            NEW.raw_user_meta_data,
            '{user_role}',
            to_jsonb(v_role_key)
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tenant_id"("tenant_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
END;
$$;


ALTER FUNCTION "public"."set_tenant_id"("tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_jwt_claims"("p_user_id" "uuid") RETURNS TABLE("claim_name" "text", "claim_value" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_tenant_id UUID;
    v_role_key TEXT;
BEGIN
    -- البحث في users
    SELECT u.tenant_id, r.role_key
    INTO v_tenant_id, v_role_key
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.auth_user_id = p_user_id;

    RETURN QUERY SELECT 'tenant_id'::TEXT, v_tenant_id::TEXT;
    RETURN QUERY SELECT 'user_role'::TEXT, v_role_key;
END;
$$;


ALTER FUNCTION "public"."test_jwt_claims"("p_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics_daily_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "snapshot_date" "date" NOT NULL,
    "total_visits" integer DEFAULT 0,
    "total_new_patients" integer DEFAULT 0,
    "total_returning_patients" integer DEFAULT 0,
    "total_no_shows" integer DEFAULT 0,
    "total_cancellations" integer DEFAULT 0,
    "avg_wait_time_minutes" numeric(5,1) DEFAULT 0,
    "avg_session_duration_minutes" numeric(5,1) DEFAULT 0,
    "total_revenue_subunits" bigint DEFAULT 0,
    "total_discounts_subunits" integer DEFAULT 0,
    "hot_leads_count" integer DEFAULT 0,
    "conversion_rate" numeric(5,2) DEFAULT 0,
    "snapshot_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."analytics_daily_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_trail" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "actor_role" character varying(50),
    "action" character varying(100) NOT NULL,
    "table_name" character varying(100) NOT NULL,
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "reason" "text",
    "ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_trail" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."billing_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "event_type" character varying(50) NOT NULL,
    "previous_tier" character varying(50),
    "new_tier" character varying(50),
    "amount_subunits" integer DEFAULT 0,
    "is_manual" boolean DEFAULT false,
    "activated_by" "uuid",
    "activation_notes" "text",
    "event_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "billing_events_event_type_check" CHECK ((("event_type")::"text" = ANY ((ARRAY['trial_started'::character varying, 'trial_expired'::character varying, 'subscription_created'::character varying, 'subscription_upgraded'::character varying, 'subscription_downgraded'::character varying, 'subscription_cancelled'::character varying, 'manual_activation'::character varying, 'tier_override_by_admin'::character varying, 'feature_flag_toggled'::character varying])::"text"[])))
);


ALTER TABLE "public"."billing_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_inquiries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "inquiry_type" character varying(30) NOT NULL,
    "patient_id" "uuid",
    "temp_patient_name" character varying(255),
    "temp_phone" character varying(20),
    "inquiry_reason" character varying(255),
    "procedures_requested" "text"[],
    "status" character varying(30) DEFAULT 'pending'::character varying,
    "handled_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "clinic_inquiries_inquiry_type_check" CHECK ((("inquiry_type")::"text" = ANY ((ARRAY['walk_in'::character varying, 'appointment'::character varying, 'callback'::character varying, 'online'::character varying])::"text"[]))),
    CONSTRAINT "clinic_inquiries_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'converted_to_session'::character varying, 'cancelled'::character varying, 'rescheduled'::character varying, 'no_show'::character varying])::"text"[])))
);


ALTER TABLE "public"."clinic_inquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "subtotal_subunits" integer DEFAULT 0 NOT NULL,
    "discount_subunits" integer DEFAULT 0 NOT NULL,
    "discount_reason" character varying(100),
    "discount_approved_by" "uuid",
    "tax_subunits" integer DEFAULT 0 NOT NULL,
    "total_subunits" integer DEFAULT 0 NOT NULL,
    "amount_paid_subunits" integer DEFAULT 0 NOT NULL,
    "amount_due_subunits" integer GENERATED ALWAYS AS (("total_subunits" - "amount_paid_subunits")) STORED,
    "payment_method" character varying(30),
    "invoice_status" character varying(20) DEFAULT 'draft'::character varying,
    "collected_by" "uuid",
    "invoice_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "clinic_invoices_invoice_status_check" CHECK ((("invoice_status")::"text" = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'paid'::character varying, 'partial'::character varying, 'cancelled'::character varying, 'refunded'::character varying])::"text"[]))),
    CONSTRAINT "clinic_invoices_payment_method_check" CHECK ((("payment_method")::"text" = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'bank_transfer'::character varying, 'installment'::character varying, 'mixed'::character varying, NULL::character varying])::"text"[])))
);


ALTER TABLE "public"."clinic_invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_patients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "first_name" character varying(100) NOT NULL,
    "last_name" character varying(100) NOT NULL,
    "first_name_ar" character varying(100),
    "last_name_ar" character varying(100),
    "date_of_birth" "date",
    "gender" character varying(10),
    "phone_primary" character varying(20) NOT NULL,
    "phone_secondary" character varying(20),
    "email" character varying(255),
    "preferred_channel" character varying(20) DEFAULT 'whatsapp'::character varying,
    "first_visit_date" "date",
    "referral_source" character varying(100),
    "patient_status" character varying(30) DEFAULT 'active'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "clinic_patients_gender_check" CHECK ((("gender")::"text" = ANY ((ARRAY['male'::character varying, 'female'::character varying])::"text"[]))),
    CONSTRAINT "clinic_patients_patient_status_check" CHECK ((("patient_status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'vip'::character varying, 'blocked'::character varying])::"text"[]))),
    CONSTRAINT "clinic_patients_preferred_channel_check" CHECK ((("preferred_channel")::"text" = ANY ((ARRAY['whatsapp'::character varying, 'sms'::character varying, 'email'::character varying])::"text"[])))
);


ALTER TABLE "public"."clinic_patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "procedure_name" character varying(255) NOT NULL,
    "procedure_name_ar" character varying(255),
    "category" character varying(100),
    "standard_duration_minutes" smallint DEFAULT 30 NOT NULL,
    "buffer_time_minutes" smallint DEFAULT 10 NOT NULL,
    "base_price_subunits" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."clinic_procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "room_name" character varying(100) NOT NULL,
    "room_type" character varying(50) NOT NULL,
    "floor_number" smallint DEFAULT 1,
    "capacity" smallint DEFAULT 1,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "clinic_rooms_room_type_check" CHECK ((("room_type")::"text" = ANY ((ARRAY['consultation'::character varying, 'procedure'::character varying, 'waiting'::character varying, 'reception'::character varying])::"text"[])))
);


ALTER TABLE "public"."clinic_rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_users" (
    "id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "full_name_ar" character varying(255),
    "role" character varying(50) NOT NULL,
    "specialization" character varying(100),
    "employee_code" character varying(20) NOT NULL,
    "pin_code" character varying(4) NOT NULL,
    "phone" character varying(20),
    "is_active" boolean DEFAULT true NOT NULL,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "auth_user_id" "uuid",
    "email" character varying,
    "avatar_url" "text",
    CONSTRAINT "clinic_users_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['super_admin'::character varying, 'clinic_admin'::character varying, 'doctor'::character varying, 'receptionist'::character varying])::"text"[])))
);


ALTER TABLE "public"."clinic_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_visit_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "room_id" "uuid",
    "agenda_event_id" "uuid",
    "arrived_at" timestamp with time zone,
    "session_started_at" timestamp with time zone,
    "session_ended_at" timestamp with time zone,
    "visit_closed_at" timestamp with time zone,
    "lock_holder_id" "uuid",
    "lock_timestamp" timestamp with time zone,
    "initialized_by_receptionist" "uuid",
    "is_insured" boolean DEFAULT false NOT NULL,
    "waiting_time_minutes" smallint,
    "session_duration_minutes" smallint,
    "doctor_notes" "text",
    "clinical_notes" "text",
    "diagnosis" "text",
    "treatment_performed" "text",
    "follow_up_required" boolean DEFAULT false,
    "follow_up_date" "date",
    "patient_feedback" "text",
    "patient_satisfaction_score" smallint,
    "session_status" character varying(30) DEFAULT 'waiting'::character varying NOT NULL,
    "buffer_window_expires_at" timestamp with time zone,
    "auto_close_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "clinic_visit_sessions_patient_satisfaction_score_check" CHECK ((("patient_satisfaction_score" >= 1) AND ("patient_satisfaction_score" <= 5))),
    CONSTRAINT "clinic_visit_sessions_session_status_check" CHECK ((("session_status")::"text" = ANY ((ARRAY['waiting'::character varying, 'in_consultation'::character varying, 'pending_close'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."clinic_visit_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "flag_key" character varying(100) NOT NULL,
    "flag_name" character varying(255) NOT NULL,
    "description" "text",
    "is_enabled" boolean DEFAULT false NOT NULL,
    "allowed_tiers" "text"[] DEFAULT ARRAY['enterprise'::"text"],
    "config_json" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_ledger" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "procedure_id" "uuid",
    "material_name" character varying(150) NOT NULL,
    "quantity_consumed" numeric(10,2) NOT NULL,
    "consumption_type" character varying(50) NOT NULL,
    "logged_by" "uuid",
    "session_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "inventory_ledger_consumption_type_check" CHECK ((("consumption_type")::"text" = ANY ((ARRAY['standard_clinical'::character varying, 'operational_waste'::character varying])::"text"[])))
);


ALTER TABLE "public"."inventory_ledger" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."master_agenda_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "patient_id" "uuid",
    "doctor_id" "uuid",
    "room_id" "uuid",
    "procedure_id" "uuid",
    "inquiry_id" "uuid",
    "scheduled_start" timestamp with time zone NOT NULL,
    "scheduled_end" timestamp with time zone NOT NULL,
    "buffer_end" timestamp with time zone NOT NULL,
    "event_type" character varying(30) NOT NULL,
    "visit_type" character varying(20),
    "status" character varying(30) DEFAULT 'scheduled'::character varying,
    "cancellation_reason" character varying(100),
    "reminder_sent_24h" boolean DEFAULT false,
    "reminder_sent_2h" boolean DEFAULT false,
    "booking_notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "master_agenda_events_cancellation_reason_check" CHECK ((("cancellation_reason")::"text" = ANY ((ARRAY['patient_request'::character varying, 'doctor_unavailable'::character varying, 'emergency'::character varying, 'duplicate'::character varying, 'financial'::character varying, 'other'::character varying, NULL::character varying])::"text"[]))),
    CONSTRAINT "master_agenda_events_event_type_check" CHECK ((("event_type")::"text" = ANY ((ARRAY['appointment'::character varying, 'block'::character varying, 'break'::character varying, 'emergency'::character varying])::"text"[]))),
    CONSTRAINT "master_agenda_events_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['scheduled'::character varying, 'confirmed'::character varying, 'arrived'::character varying, 'in_session'::character varying, 'completed'::character varying, 'no_show'::character varying, 'cancelled'::character varying, 'rescheduled'::character varying])::"text"[]))),
    CONSTRAINT "master_agenda_events_visit_type_check" CHECK ((("visit_type")::"text" = ANY ((ARRAY['first_time'::character varying, 'follow_up'::character varying, 'emergency'::character varying, 'consultation'::character varying])::"text"[])))
);


ALTER TABLE "public"."master_agenda_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."master_tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_name" character varying(255) NOT NULL,
    "clinic_name_ar" character varying(255),
    "license_key" character varying(100) NOT NULL,
    "subscription_tier" character varying(50) DEFAULT 'trial'::character varying NOT NULL,
    "max_devices" smallint DEFAULT 2 NOT NULL,
    "subscription_start" timestamp with time zone,
    "subscription_end" timestamp with time zone,
    "trial_started_at" timestamp with time zone DEFAULT "now"(),
    "timezone" character varying(50) DEFAULT 'Asia/Amman'::character varying NOT NULL,
    "currency" character varying(10) DEFAULT 'JOD'::character varying NOT NULL,
    "currency_subunit" integer DEFAULT 1000 NOT NULL,
    "logo_url" "text",
    "primary_color" character varying(7) DEFAULT '#1B2A4A'::character varying,
    "primary_phone" character varying(20),
    "whatsapp_number" character varying(20),
    "address" "text",
    "country_code" character varying(5) DEFAULT 'JO'::character varying,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "master_tenants_subscription_tier_check" CHECK ((("subscription_tier")::"text" = ANY ((ARRAY['trial'::character varying, 'essential'::character varying, 'professional'::character varying, 'enterprise'::character varying, 'suspended'::character varying])::"text"[])))
);


ALTER TABLE "public"."master_tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "recipient_type" character varying(30) NOT NULL,
    "recipient_id" "uuid",
    "recipient_phone" character varying(20),
    "recipient_email" character varying(255),
    "channel" character varying(20) NOT NULL,
    "message_body" "text" NOT NULL,
    "priority" smallint DEFAULT 5,
    "status" character varying(20) DEFAULT 'queued'::character varying,
    "retry_count" smallint DEFAULT 0,
    "max_retries" smallint DEFAULT 3,
    "scheduled_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "error_message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_queue_channel_check" CHECK ((("channel")::"text" = ANY ((ARRAY['whatsapp'::character varying, 'sms'::character varying, 'email'::character varying, 'in_app'::character varying])::"text"[]))),
    CONSTRAINT "notification_queue_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 10))),
    CONSTRAINT "notification_queue_recipient_type_check" CHECK ((("recipient_type")::"text" = ANY ((ARRAY['patient'::character varying, 'staff'::character varying, 'admin'::character varying])::"text"[]))),
    CONSTRAINT "notification_queue_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['queued'::character varying, 'processing'::character varying, 'sent'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."notification_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patient_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "total_visits" integer DEFAULT 0,
    "total_completed_visits" integer DEFAULT 0,
    "total_no_shows" integer DEFAULT 0,
    "total_cancellations" integer DEFAULT 0,
    "total_revenue_subunits" bigint DEFAULT 0,
    "last_visit_date" "date",
    "next_scheduled_visit" "date",
    "loyalty_tier" character varying(20) DEFAULT 'standard'::character varying,
    "last_calculated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "patient_history_loyalty_tier_check" CHECK ((("loyalty_tier")::"text" = ANY ((ARRAY['standard'::character varying, 'silver'::character varying, 'gold'::character varying, 'vip'::character varying])::"text"[])))
);


ALTER TABLE "public"."patient_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "permission_key" character varying(100) NOT NULL,
    "permission_name" character varying(200) NOT NULL,
    "description" "text",
    "resource" character varying(50) NOT NULL,
    "action" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retention_followups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "scheduled_for" timestamp with time zone NOT NULL,
    "followup_type" character varying(50) NOT NULL,
    "channel" character varying(20) DEFAULT 'whatsapp'::character varying,
    "message_body" "text",
    "delivery_status" character varying(20) DEFAULT 'pending'::character varying,
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "response_received" boolean DEFAULT false,
    "sent_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "retention_followups_channel_check" CHECK ((("channel")::"text" = ANY ((ARRAY['whatsapp'::character varying, 'sms'::character varying, 'email'::character varying, 'in_app'::character varying])::"text"[]))),
    CONSTRAINT "retention_followups_delivery_status_check" CHECK ((("delivery_status")::"text" = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'read'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[]))),
    CONSTRAINT "retention_followups_followup_type_check" CHECK ((("followup_type")::"text" = ANY ((ARRAY['post_visit_24h'::character varying, 'post_visit_7d'::character varying, 'reactivation_30d'::character varying, 'reactivation_60d'::character varying, 'reactivation_90d'::character varying, 'appointment_reminder_24h'::character varying, 'appointment_reminder_2h'::character varying, 'birthday'::character varying, 'custom'::character varying])::"text"[])))
);


ALTER TABLE "public"."retention_followups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_key" character varying(50) NOT NULL,
    "role_name" character varying(100) NOT NULL,
    "role_name_ar" character varying(100),
    "description" "text",
    "is_system_role" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "event_type" character varying(50) NOT NULL,
    "previous_status" character varying(50),
    "new_status" character varying(50),
    "previous_plan_id" "uuid",
    "new_plan_id" "uuid",
    "triggered_by" "uuid",
    "reason" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_key" character varying(50) NOT NULL,
    "plan_name" character varying(100) NOT NULL,
    "plan_name_ar" character varying(100),
    "max_users" integer DEFAULT 3 NOT NULL,
    "max_devices" integer DEFAULT 2 NOT NULL,
    "max_branches" integer DEFAULT 1 NOT NULL,
    "modules" "jsonb" DEFAULT '["basic"]'::"jsonb",
    "ai_limits" "jsonb" DEFAULT '{}'::"jsonb",
    "storage_gb" integer DEFAULT 5,
    "api_rate_limit" integer DEFAULT 100,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "status" character varying(50) DEFAULT 'trial'::character varying NOT NULL,
    "billing_cycle" character varying(20) DEFAULT 'monthly'::character varying,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "ends_at" timestamp with time zone,
    "trial_ends_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "auto_renew" boolean DEFAULT true,
    "payment_method" character varying(50),
    "discount_code" character varying(100),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_devices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "device_fingerprint" character varying(255) NOT NULL,
    "device_name" character varying(100),
    "device_type" character varying(30),
    "os_info" character varying(100),
    "browser_info" character varying(100),
    "is_active" boolean DEFAULT true,
    "last_seen_at" timestamp with time zone,
    "registered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tenant_devices_device_type_check" CHECK ((("device_type")::"text" = ANY ((ARRAY['reception_desktop'::character varying, 'doctor_tablet'::character varying, 'admin_laptop'::character varying, 'mobile'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."tenant_devices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_name" character varying(200) NOT NULL,
    "clinic_name_ar" character varying(200),
    "license_key" character varying(100) NOT NULL,
    "timezone" character varying(50) DEFAULT 'Asia/Amman'::character varying,
    "currency" character varying(10) DEFAULT 'JOD'::character varying,
    "currency_subunit" integer DEFAULT 1000,
    "logo_url" "text",
    "primary_color" character varying(20) DEFAULT '#1B2A4A'::character varying,
    "primary_phone" character varying(50),
    "whatsapp_number" character varying(50),
    "address" "text",
    "country_code" character varying(10) DEFAULT 'JO'::character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "auth_user_id" "uuid",
    "full_name" character varying(200) NOT NULL,
    "full_name_ar" character varying(200),
    "role_id" "uuid" NOT NULL,
    "email" character varying(255),
    "phone" character varying(50),
    "employee_code" character varying(50),
    "pin_code" character varying(10),
    "specialization" character varying(100),
    "avatar_url" "text",
    "is_active" boolean DEFAULT true,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."analytics_daily_snapshots"
    ADD CONSTRAINT "analytics_daily_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_trail"
    ADD CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."billing_events"
    ADD CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_inquiries"
    ADD CONSTRAINT "clinic_inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_invoices"
    ADD CONSTRAINT "clinic_invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_patients"
    ADD CONSTRAINT "clinic_patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_procedures"
    ADD CONSTRAINT "clinic_procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_rooms"
    ADD CONSTRAINT "clinic_rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_users"
    ADD CONSTRAINT "clinic_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_tenants"
    ADD CONSTRAINT "master_tenants_license_key_key" UNIQUE ("license_key");



ALTER TABLE ONLY "public"."master_tenants"
    ADD CONSTRAINT "master_tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "no_doctor_overlap" EXCLUDE USING "gist" ("doctor_id" WITH =, "tstzrange"("scheduled_start", "buffer_end") WITH &&) WHERE ((("status")::"text" <> ALL ((ARRAY['cancelled'::character varying, 'no_show'::character varying])::"text"[])));



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_history"
    ADD CONSTRAINT "patient_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_permission_key_key" UNIQUE ("permission_key");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retention_followups"
    ADD CONSTRAINT "retention_followups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_permission_id_key" UNIQUE ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_role_key_key" UNIQUE ("role_key");



ALTER TABLE ONLY "public"."subscription_events"
    ADD CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_plan_key_key" UNIQUE ("plan_key");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_devices"
    ADD CONSTRAINT "tenant_devices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_license_key_key" UNIQUE ("license_key");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_daily_snapshots"
    ADD CONSTRAINT "uq_daily_snapshot" UNIQUE ("tenant_id", "snapshot_date");



ALTER TABLE ONLY "public"."tenant_devices"
    ADD CONSTRAINT "uq_device_per_tenant" UNIQUE ("tenant_id", "device_fingerprint");



ALTER TABLE ONLY "public"."clinic_users"
    ADD CONSTRAINT "uq_employee_code" UNIQUE ("tenant_id", "employee_code");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "uq_feature_flag" UNIQUE ("tenant_id", "flag_key");



ALTER TABLE ONLY "public"."patient_history"
    ADD CONSTRAINT "uq_patient_history" UNIQUE ("tenant_id", "patient_id");



ALTER TABLE ONLY "public"."clinic_patients"
    ADD CONSTRAINT "uq_patient_phone" UNIQUE ("tenant_id", "phone_primary");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_employee_code_key" UNIQUE ("employee_code");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_agenda_doctor_date" ON "public"."master_agenda_events" USING "btree" ("doctor_id", "scheduled_start") WHERE (("status")::"text" <> ALL ((ARRAY['cancelled'::character varying, 'no_show'::character varying])::"text"[]));



CREATE INDEX "idx_agenda_patient" ON "public"."master_agenda_events" USING "btree" ("patient_id");



CREATE INDEX "idx_agenda_tenant_date" ON "public"."master_agenda_events" USING "btree" ("tenant_id", "scheduled_start");



CREATE INDEX "idx_audit_actor" ON "public"."audit_trail" USING "btree" ("actor_id", "created_at" DESC);



CREATE INDEX "idx_audit_table" ON "public"."audit_trail" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_audit_tenant" ON "public"."audit_trail" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_billing_events_tenant" ON "public"."billing_events" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_clinic_users_auth_user_id" ON "public"."clinic_users" USING "btree" ("auth_user_id");



CREATE INDEX "idx_followups_scheduled" ON "public"."retention_followups" USING "btree" ("tenant_id", "scheduled_for") WHERE (("delivery_status")::"text" = 'pending'::"text");



CREATE INDEX "idx_history_last_visit" ON "public"."patient_history" USING "btree" ("tenant_id", "last_visit_date");



CREATE INDEX "idx_history_patient" ON "public"."patient_history" USING "btree" ("patient_id");



CREATE INDEX "idx_inquiries_status" ON "public"."clinic_inquiries" USING "btree" ("tenant_id", "status") WHERE (("status")::"text" = 'pending'::"text");



CREATE INDEX "idx_inquiries_tenant" ON "public"."clinic_inquiries" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_inventory_procedure" ON "public"."inventory_ledger" USING "btree" ("procedure_id");



CREATE INDEX "idx_inventory_tenant" ON "public"."inventory_ledger" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_invoices_date" ON "public"."clinic_invoices" USING "btree" ("tenant_id", "invoice_date" DESC);



CREATE INDEX "idx_invoices_patient" ON "public"."clinic_invoices" USING "btree" ("patient_id");



CREATE INDEX "idx_invoices_session" ON "public"."clinic_invoices" USING "btree" ("session_id");



CREATE INDEX "idx_invoices_status" ON "public"."clinic_invoices" USING "btree" ("tenant_id", "invoice_status");



CREATE INDEX "idx_notif_queue_pending" ON "public"."notification_queue" USING "btree" ("scheduled_at", "priority" DESC) WHERE (("status")::"text" = 'queued'::"text");



CREATE INDEX "idx_patients_phone" ON "public"."clinic_patients" USING "btree" ("tenant_id", "phone_primary");



CREATE INDEX "idx_patients_status" ON "public"."clinic_patients" USING "btree" ("tenant_id", "patient_status");



CREATE INDEX "idx_patients_tenant" ON "public"."clinic_patients" USING "btree" ("tenant_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_procedures_tenant" ON "public"."clinic_procedures" USING "btree" ("tenant_id") WHERE ("is_active" = true);



CREATE INDEX "idx_rooms_tenant" ON "public"."clinic_rooms" USING "btree" ("tenant_id") WHERE ("is_active" = true);



CREATE INDEX "idx_sessions_created" ON "public"."clinic_visit_sessions" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_sessions_doctor" ON "public"."clinic_visit_sessions" USING "btree" ("doctor_id");



CREATE INDEX "idx_sessions_patient" ON "public"."clinic_visit_sessions" USING "btree" ("patient_id");



CREATE INDEX "idx_sessions_status" ON "public"."clinic_visit_sessions" USING "btree" ("tenant_id", "session_status") WHERE (("session_status")::"text" <> ALL ((ARRAY['completed'::character varying, 'cancelled'::character varying])::"text"[]));



CREATE INDEX "idx_sessions_tenant" ON "public"."clinic_visit_sessions" USING "btree" ("tenant_id");



CREATE INDEX "idx_snapshots_tenant_date" ON "public"."analytics_daily_snapshots" USING "btree" ("tenant_id", "snapshot_date" DESC);



CREATE INDEX "idx_subscription_events_subscription_id" ON "public"."subscription_events" USING "btree" ("subscription_id");



CREATE INDEX "idx_subscription_events_tenant_id" ON "public"."subscription_events" USING "btree" ("tenant_id");



CREATE INDEX "idx_subscriptions_tenant_id" ON "public"."subscriptions" USING "btree" ("tenant_id");



CREATE INDEX "idx_tenants_active" ON "public"."master_tenants" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_tenants_license" ON "public"."master_tenants" USING "btree" ("license_key") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_tenants_tier" ON "public"."master_tenants" USING "btree" ("subscription_tier") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_users_auth_user_id" ON "public"."users" USING "btree" ("auth_user_id");



CREATE INDEX "idx_users_role" ON "public"."clinic_users" USING "btree" ("tenant_id", "role") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_users_tenant" ON "public"."clinic_users" USING "btree" ("tenant_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_users_tenant_id" ON "public"."users" USING "btree" ("tenant_id");



CREATE OR REPLACE TRIGGER "tr_agenda_updated" BEFORE UPDATE ON "public"."master_agenda_events" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_audit_invoices" AFTER UPDATE ON "public"."clinic_invoices" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_changes"();



CREATE OR REPLACE TRIGGER "tr_audit_sessions" AFTER UPDATE ON "public"."clinic_visit_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_changes"();



CREATE OR REPLACE TRIGGER "tr_audit_tenants" AFTER UPDATE ON "public"."master_tenants" FOR EACH ROW EXECUTE FUNCTION "public"."fn_audit_changes"();



CREATE OR REPLACE TRIGGER "tr_auto_close_timer" BEFORE UPDATE ON "public"."clinic_visit_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_auto_close"();



CREATE OR REPLACE TRIGGER "tr_flags_updated" BEFORE UPDATE ON "public"."feature_flags" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_followups_updated" BEFORE UPDATE ON "public"."retention_followups" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_history_updated" BEFORE UPDATE ON "public"."patient_history" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_inquiries_updated" BEFORE UPDATE ON "public"."clinic_inquiries" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_invoices_updated" BEFORE UPDATE ON "public"."clinic_invoices" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_patients_updated" BEFORE UPDATE ON "public"."clinic_patients" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_procedures_updated" BEFORE UPDATE ON "public"."clinic_procedures" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_rooms_updated" BEFORE UPDATE ON "public"."clinic_rooms" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_session_buffer" BEFORE UPDATE ON "public"."clinic_visit_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_session_buffer"();



CREATE OR REPLACE TRIGGER "tr_sessions_updated" BEFORE UPDATE ON "public"."clinic_visit_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_subscription_events" AFTER UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_log_subscription_change"();



CREATE OR REPLACE TRIGGER "tr_subscriptions_updated" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_tenants_updated" BEFORE UPDATE ON "public"."master_tenants" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_tenants_updated" BEFORE UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_users_updated" BEFORE UPDATE ON "public"."clinic_users" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_users_updated" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_updated_at"();



ALTER TABLE ONLY "public"."analytics_daily_snapshots"
    ADD CONSTRAINT "analytics_daily_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."audit_trail"
    ADD CONSTRAINT "audit_trail_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."audit_trail"
    ADD CONSTRAINT "audit_trail_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."billing_events"
    ADD CONSTRAINT "billing_events_activated_by_fkey" FOREIGN KEY ("activated_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."billing_events"
    ADD CONSTRAINT "billing_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_inquiries"
    ADD CONSTRAINT "clinic_inquiries_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."clinic_inquiries"
    ADD CONSTRAINT "clinic_inquiries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."clinic_patients"("id");



ALTER TABLE ONLY "public"."clinic_inquiries"
    ADD CONSTRAINT "clinic_inquiries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_invoices"
    ADD CONSTRAINT "clinic_invoices_collected_by_fkey" FOREIGN KEY ("collected_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."clinic_invoices"
    ADD CONSTRAINT "clinic_invoices_discount_approved_by_fkey" FOREIGN KEY ("discount_approved_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."clinic_invoices"
    ADD CONSTRAINT "clinic_invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."clinic_patients"("id");



ALTER TABLE ONLY "public"."clinic_invoices"
    ADD CONSTRAINT "clinic_invoices_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."clinic_visit_sessions"("id");



ALTER TABLE ONLY "public"."clinic_invoices"
    ADD CONSTRAINT "clinic_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_patients"
    ADD CONSTRAINT "clinic_patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_procedures"
    ADD CONSTRAINT "clinic_procedures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_rooms"
    ADD CONSTRAINT "clinic_rooms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_users"
    ADD CONSTRAINT "clinic_users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."clinic_users"
    ADD CONSTRAINT "clinic_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_agenda_event_id_fkey" FOREIGN KEY ("agenda_event_id") REFERENCES "public"."master_agenda_events"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_initialized_by_receptionist_fkey" FOREIGN KEY ("initialized_by_receptionist") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_lock_holder_id_fkey" FOREIGN KEY ("lock_holder_id") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."clinic_patients"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."clinic_rooms"("id");



ALTER TABLE ONLY "public"."clinic_visit_sessions"
    ADD CONSTRAINT "clinic_visit_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_logged_by_fkey" FOREIGN KEY ("logged_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."clinic_procedures"("id");



ALTER TABLE ONLY "public"."inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."clinic_visit_sessions"("id");



ALTER TABLE ONLY "public"."inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "public"."clinic_inquiries"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."clinic_patients"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."clinic_procedures"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."clinic_rooms"("id");



ALTER TABLE ONLY "public"."master_agenda_events"
    ADD CONSTRAINT "master_agenda_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."patient_history"
    ADD CONSTRAINT "patient_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."clinic_patients"("id");



ALTER TABLE ONLY "public"."patient_history"
    ADD CONSTRAINT "patient_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."retention_followups"
    ADD CONSTRAINT "retention_followups_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."clinic_patients"("id");



ALTER TABLE ONLY "public"."retention_followups"
    ADD CONSTRAINT "retention_followups_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "public"."clinic_users"("id");



ALTER TABLE ONLY "public"."retention_followups"
    ADD CONSTRAINT "retention_followups_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."clinic_visit_sessions"("id");



ALTER TABLE ONLY "public"."retention_followups"
    ADD CONSTRAINT "retention_followups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_events"
    ADD CONSTRAINT "subscription_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_events"
    ADD CONSTRAINT "subscription_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_devices"
    ADD CONSTRAINT "tenant_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."master_tenants"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE "public"."analytics_daily_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_trail" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."billing_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_inquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_visit_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_ledger" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_agenda_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retention_followups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rls_agenda_isolation" ON "public"."master_agenda_events" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_audit_read" ON "public"."audit_trail" FOR SELECT USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND ("public"."get_current_user_role"() = ANY (ARRAY['clinic_admin'::"text", 'super_admin'::"text"]))));



CREATE POLICY "rls_billing_isolation" ON "public"."billing_events" USING ((("tenant_id" = "public"."get_current_tenant_id"()) OR ("public"."get_current_user_role"() = 'super_admin'::"text")));



CREATE POLICY "rls_breaches_isolation" ON "public"."audit_trail" USING ((("public"."get_current_user_role"() = 'super_admin'::"text") OR ("tenant_id" = "public"."get_current_tenant_id"())));



CREATE POLICY "rls_devices_isolation" ON "public"."tenant_devices" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_events_isolation" ON "public"."subscription_events" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_events_super_admin" ON "public"."subscription_events" USING (("public"."get_current_user_role"() = 'super_admin'::"text"));



CREATE POLICY "rls_flags_read" ON "public"."feature_flags" FOR SELECT USING ((("public"."get_current_user_role"() = 'super_admin'::"text") OR ("tenant_id" = "public"."get_current_tenant_id"()) OR ("tenant_id" IS NULL)));



CREATE POLICY "rls_flags_write" ON "public"."feature_flags" USING (("public"."get_current_user_role"() = 'super_admin'::"text"));



CREATE POLICY "rls_followups_isolation" ON "public"."retention_followups" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_history_isolation" ON "public"."patient_history" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_inquiries_isolation" ON "public"."clinic_inquiries" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_inventory_isolation" ON "public"."inventory_ledger" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_invoices_no_doctor" ON "public"."clinic_invoices" USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND ("public"."get_current_user_role"() <> 'doctor'::"text")));



CREATE POLICY "rls_notifications_isolation" ON "public"."notification_queue" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_patients_isolation" ON "public"."clinic_patients" USING (("tenant_id" = "public"."get_current_tenant_id"())) WITH CHECK (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_permissions_read" ON "public"."permissions" FOR SELECT USING (true);



CREATE POLICY "rls_procedures_isolation" ON "public"."clinic_procedures" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_role_permissions_read" ON "public"."role_permissions" FOR SELECT USING (true);



CREATE POLICY "rls_roles_read" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "rls_rooms_isolation" ON "public"."clinic_rooms" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_sessions_select" ON "public"."clinic_visit_sessions" FOR SELECT USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['clinic_admin'::"text", 'super_admin'::"text", 'receptionist'::"text"])) OR ("doctor_id" = "auth"."uid"()))));



CREATE POLICY "rls_sessions_update" ON "public"."clinic_visit_sessions" FOR UPDATE USING ((("tenant_id" = "public"."get_current_tenant_id"()) AND (("public"."get_current_user_role"() = ANY (ARRAY['clinic_admin'::"text", 'super_admin'::"text"])) OR (("public"."get_current_user_role"() = 'doctor'::"text") AND ("doctor_id" = "auth"."uid"())) OR ("public"."get_current_user_role"() = 'receptionist'::"text"))));



CREATE POLICY "rls_sessions_write" ON "public"."clinic_visit_sessions" FOR INSERT WITH CHECK (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_snapshots_isolation" ON "public"."analytics_daily_snapshots" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_subscriptions_isolation" ON "public"."subscriptions" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_subscriptions_super_admin" ON "public"."subscriptions" USING (("public"."get_current_user_role"() = 'super_admin'::"text"));



CREATE POLICY "rls_tenants_isolation" ON "public"."master_tenants" USING (("id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_tenants_isolation" ON "public"."tenants" USING (("id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_tenants_super_admin" ON "public"."master_tenants" USING (("public"."get_current_user_role"() = 'super_admin'::"text"));



CREATE POLICY "rls_tenants_super_admin" ON "public"."tenants" USING (("public"."get_current_user_role"() = 'super_admin'::"text"));



CREATE POLICY "rls_users_isolation" ON "public"."clinic_users" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_users_isolation" ON "public"."users" USING (("tenant_id" = "public"."get_current_tenant_id"()));



CREATE POLICY "rls_users_super_admin" ON "public"."users" USING (("public"."get_current_user_role"() = 'super_admin'::"text"));



ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_devices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";






GRANT ALL ON FUNCTION "public"."gbtreekey16_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey16_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey16_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey16_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey16_out"("public"."gbtreekey16") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey16_out"("public"."gbtreekey16") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey16_out"("public"."gbtreekey16") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey16_out"("public"."gbtreekey16") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey2_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey2_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey2_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey2_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey2_out"("public"."gbtreekey2") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey2_out"("public"."gbtreekey2") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey2_out"("public"."gbtreekey2") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey2_out"("public"."gbtreekey2") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey32_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey32_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey32_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey32_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey32_out"("public"."gbtreekey32") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey32_out"("public"."gbtreekey32") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey32_out"("public"."gbtreekey32") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey32_out"("public"."gbtreekey32") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey4_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey4_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey4_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey4_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey4_out"("public"."gbtreekey4") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey4_out"("public"."gbtreekey4") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey4_out"("public"."gbtreekey4") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey4_out"("public"."gbtreekey4") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey8_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey8_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey8_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey8_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey8_out"("public"."gbtreekey8") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey8_out"("public"."gbtreekey8") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey8_out"("public"."gbtreekey8") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey8_out"("public"."gbtreekey8") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey_var_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey_var_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey_var_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey_var_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbtreekey_var_out"("public"."gbtreekey_var") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbtreekey_var_out"("public"."gbtreekey_var") TO "anon";
GRANT ALL ON FUNCTION "public"."gbtreekey_var_out"("public"."gbtreekey_var") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbtreekey_var_out"("public"."gbtreekey_var") TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."cash_dist"("money", "money") TO "postgres";
GRANT ALL ON FUNCTION "public"."cash_dist"("money", "money") TO "anon";
GRANT ALL ON FUNCTION "public"."cash_dist"("money", "money") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cash_dist"("money", "money") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_tenant_with_subscription"("p_clinic_name" "text", "p_full_name" "text", "p_email" "text", "p_auth_user_id" "uuid", "p_clinic_name_ar" "text", "p_license_key" "text", "p_plan_key" "text", "p_timezone" "text", "p_currency" "text", "p_country_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_tenant_with_subscription"("p_clinic_name" "text", "p_full_name" "text", "p_email" "text", "p_auth_user_id" "uuid", "p_clinic_name_ar" "text", "p_license_key" "text", "p_plan_key" "text", "p_timezone" "text", "p_currency" "text", "p_country_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_tenant_with_subscription"("p_clinic_name" "text", "p_full_name" "text", "p_email" "text", "p_auth_user_id" "uuid", "p_clinic_name_ar" "text", "p_license_key" "text", "p_plan_key" "text", "p_timezone" "text", "p_currency" "text", "p_country_code" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."date_dist"("date", "date") TO "postgres";
GRANT ALL ON FUNCTION "public"."date_dist"("date", "date") TO "anon";
GRANT ALL ON FUNCTION "public"."date_dist"("date", "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."date_dist"("date", "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."float4_dist"(real, real) TO "postgres";
GRANT ALL ON FUNCTION "public"."float4_dist"(real, real) TO "anon";
GRANT ALL ON FUNCTION "public"."float4_dist"(real, real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."float4_dist"(real, real) TO "service_role";



GRANT ALL ON FUNCTION "public"."float8_dist"(double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."float8_dist"(double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."float8_dist"(double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."float8_dist"(double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_audit_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_audit_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_audit_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_log_subscription_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_log_subscription_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_log_subscription_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_set_auto_close"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_set_auto_close"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_set_auto_close"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_set_session_buffer"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_set_session_buffer"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_set_session_buffer"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bit_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bit_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bit_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bit_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bit_consistent"("internal", bit, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bit_consistent"("internal", bit, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bit_consistent"("internal", bit, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bit_consistent"("internal", bit, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bit_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bit_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bit_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bit_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bit_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bit_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bit_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bit_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bit_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bit_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bit_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bit_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bit_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bit_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bit_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bit_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_consistent"("internal", boolean, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_consistent"("internal", boolean, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_consistent"("internal", boolean, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_consistent"("internal", boolean, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_same"("public"."gbtreekey2", "public"."gbtreekey2", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_same"("public"."gbtreekey2", "public"."gbtreekey2", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_same"("public"."gbtreekey2", "public"."gbtreekey2", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_same"("public"."gbtreekey2", "public"."gbtreekey2", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bool_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bool_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bool_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bool_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bpchar_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bpchar_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bpchar_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bpchar_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bpchar_consistent"("internal", character, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bpchar_consistent"("internal", character, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bpchar_consistent"("internal", character, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bpchar_consistent"("internal", character, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bytea_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bytea_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bytea_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bytea_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bytea_consistent"("internal", "bytea", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bytea_consistent"("internal", "bytea", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bytea_consistent"("internal", "bytea", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bytea_consistent"("internal", "bytea", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bytea_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bytea_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bytea_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bytea_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bytea_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bytea_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bytea_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bytea_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bytea_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bytea_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bytea_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bytea_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_bytea_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_bytea_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_bytea_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_bytea_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_consistent"("internal", "money", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_consistent"("internal", "money", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_consistent"("internal", "money", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_consistent"("internal", "money", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_distance"("internal", "money", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_distance"("internal", "money", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_distance"("internal", "money", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_distance"("internal", "money", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_cash_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_cash_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_cash_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_cash_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_consistent"("internal", "date", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_consistent"("internal", "date", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_consistent"("internal", "date", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_consistent"("internal", "date", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_distance"("internal", "date", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_distance"("internal", "date", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_distance"("internal", "date", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_distance"("internal", "date", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_date_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_date_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_date_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_date_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_consistent"("internal", "anyenum", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_consistent"("internal", "anyenum", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_consistent"("internal", "anyenum", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_consistent"("internal", "anyenum", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_enum_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_enum_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_enum_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_enum_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_consistent"("internal", real, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_consistent"("internal", real, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_consistent"("internal", real, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_consistent"("internal", real, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_distance"("internal", real, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_distance"("internal", real, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_distance"("internal", real, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_distance"("internal", real, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float4_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float4_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float4_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float4_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_consistent"("internal", double precision, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_consistent"("internal", double precision, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_consistent"("internal", double precision, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_consistent"("internal", double precision, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_distance"("internal", double precision, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_distance"("internal", double precision, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_distance"("internal", double precision, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_distance"("internal", double precision, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_float8_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_float8_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_float8_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_float8_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_inet_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_inet_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_inet_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_inet_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_inet_consistent"("internal", "inet", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_inet_consistent"("internal", "inet", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_inet_consistent"("internal", "inet", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_inet_consistent"("internal", "inet", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_inet_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_inet_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_inet_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_inet_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_inet_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_inet_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_inet_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_inet_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_inet_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_inet_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_inet_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_inet_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_inet_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_inet_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_inet_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_inet_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_consistent"("internal", smallint, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_consistent"("internal", smallint, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_consistent"("internal", smallint, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_consistent"("internal", smallint, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_distance"("internal", smallint, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_distance"("internal", smallint, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_distance"("internal", smallint, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_distance"("internal", smallint, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_same"("public"."gbtreekey4", "public"."gbtreekey4", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_same"("public"."gbtreekey4", "public"."gbtreekey4", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_same"("public"."gbtreekey4", "public"."gbtreekey4", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_same"("public"."gbtreekey4", "public"."gbtreekey4", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int2_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int2_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int2_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int2_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_consistent"("internal", integer, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_consistent"("internal", integer, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_consistent"("internal", integer, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_consistent"("internal", integer, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_distance"("internal", integer, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_distance"("internal", integer, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_distance"("internal", integer, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_distance"("internal", integer, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int4_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int4_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int4_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int4_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_consistent"("internal", bigint, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_consistent"("internal", bigint, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_consistent"("internal", bigint, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_consistent"("internal", bigint, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_distance"("internal", bigint, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_distance"("internal", bigint, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_distance"("internal", bigint, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_distance"("internal", bigint, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_int8_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_int8_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_int8_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_int8_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_consistent"("internal", interval, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_consistent"("internal", interval, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_consistent"("internal", interval, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_consistent"("internal", interval, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_distance"("internal", interval, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_distance"("internal", interval, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_distance"("internal", interval, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_distance"("internal", interval, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_intv_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_intv_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_intv_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_intv_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_consistent"("internal", "macaddr8", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_consistent"("internal", "macaddr8", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_consistent"("internal", "macaddr8", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_consistent"("internal", "macaddr8", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad8_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad8_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad8_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad8_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_consistent"("internal", "macaddr", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_consistent"("internal", "macaddr", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_consistent"("internal", "macaddr", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_consistent"("internal", "macaddr", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_macad_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_macad_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_macad_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_macad_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_numeric_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_numeric_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_numeric_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_numeric_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_numeric_consistent"("internal", numeric, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_numeric_consistent"("internal", numeric, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_numeric_consistent"("internal", numeric, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_numeric_consistent"("internal", numeric, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_numeric_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_numeric_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_numeric_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_numeric_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_numeric_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_numeric_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_numeric_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_numeric_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_numeric_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_numeric_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_numeric_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_numeric_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_numeric_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_numeric_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_numeric_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_numeric_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_consistent"("internal", "oid", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_consistent"("internal", "oid", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_consistent"("internal", "oid", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_consistent"("internal", "oid", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_distance"("internal", "oid", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_distance"("internal", "oid", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_distance"("internal", "oid", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_distance"("internal", "oid", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_same"("public"."gbtreekey8", "public"."gbtreekey8", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_oid_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_oid_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_oid_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_oid_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_text_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_text_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_text_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_text_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_text_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_text_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_text_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_text_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_text_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_text_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_text_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_text_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_text_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_text_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_text_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_text_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_text_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_text_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_text_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_text_same"("public"."gbtreekey_var", "public"."gbtreekey_var", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_text_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_text_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_text_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_text_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_consistent"("internal", time without time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_consistent"("internal", time without time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_consistent"("internal", time without time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_consistent"("internal", time without time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_distance"("internal", time without time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_distance"("internal", time without time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_distance"("internal", time without time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_distance"("internal", time without time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_time_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_time_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_time_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_time_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_timetz_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_timetz_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_timetz_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_timetz_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_timetz_consistent"("internal", time with time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_timetz_consistent"("internal", time with time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_timetz_consistent"("internal", time with time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_timetz_consistent"("internal", time with time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_consistent"("internal", timestamp without time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_consistent"("internal", timestamp without time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_consistent"("internal", timestamp without time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_consistent"("internal", timestamp without time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_distance"("internal", timestamp without time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_distance"("internal", timestamp without time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_distance"("internal", timestamp without time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_distance"("internal", timestamp without time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_same"("public"."gbtreekey16", "public"."gbtreekey16", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_ts_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_ts_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_ts_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_ts_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_tstz_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_tstz_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_tstz_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_tstz_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_tstz_consistent"("internal", timestamp with time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_tstz_consistent"("internal", timestamp with time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_tstz_consistent"("internal", timestamp with time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_tstz_consistent"("internal", timestamp with time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_tstz_distance"("internal", timestamp with time zone, smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_tstz_distance"("internal", timestamp with time zone, smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_tstz_distance"("internal", timestamp with time zone, smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_tstz_distance"("internal", timestamp with time zone, smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_consistent"("internal", "uuid", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_consistent"("internal", "uuid", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_consistent"("internal", "uuid", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_consistent"("internal", "uuid", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_same"("public"."gbtreekey32", "public"."gbtreekey32", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_uuid_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_uuid_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_uuid_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_uuid_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_var_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_var_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_var_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_var_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gbt_var_fetch"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gbt_var_fetch"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gbt_var_fetch"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gbt_var_fetch"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_tenant_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."int2_dist"(smallint, smallint) TO "postgres";
GRANT ALL ON FUNCTION "public"."int2_dist"(smallint, smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."int2_dist"(smallint, smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."int2_dist"(smallint, smallint) TO "service_role";



GRANT ALL ON FUNCTION "public"."int4_dist"(integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."int4_dist"(integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."int4_dist"(integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."int4_dist"(integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."int8_dist"(bigint, bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."int8_dist"(bigint, bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."int8_dist"(bigint, bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."int8_dist"(bigint, bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."interval_dist"(interval, interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."interval_dist"(interval, interval) TO "anon";
GRANT ALL ON FUNCTION "public"."interval_dist"(interval, interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."interval_dist"(interval, interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."oid_dist"("oid", "oid") TO "postgres";
GRANT ALL ON FUNCTION "public"."oid_dist"("oid", "oid") TO "anon";
GRANT ALL ON FUNCTION "public"."oid_dist"("oid", "oid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."oid_dist"("oid", "oid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tenant_id"("tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_tenant_id"("tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tenant_id"("tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."test_jwt_claims"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."test_jwt_claims"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_jwt_claims"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."time_dist"(time without time zone, time without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_dist"(time without time zone, time without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_dist"(time without time zone, time without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_dist"(time without time zone, time without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."ts_dist"(timestamp without time zone, timestamp without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."ts_dist"(timestamp without time zone, timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."ts_dist"(timestamp without time zone, timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ts_dist"(timestamp without time zone, timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."tstz_dist"(timestamp with time zone, timestamp with time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."tstz_dist"(timestamp with time zone, timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."tstz_dist"(timestamp with time zone, timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."tstz_dist"(timestamp with time zone, timestamp with time zone) TO "service_role";


















GRANT ALL ON TABLE "public"."analytics_daily_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."analytics_daily_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_daily_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."audit_trail" TO "anon";
GRANT ALL ON TABLE "public"."audit_trail" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_trail" TO "service_role";



GRANT ALL ON TABLE "public"."billing_events" TO "anon";
GRANT ALL ON TABLE "public"."billing_events" TO "authenticated";
GRANT ALL ON TABLE "public"."billing_events" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."clinic_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_invoices" TO "anon";
GRANT ALL ON TABLE "public"."clinic_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_invoices" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_patients" TO "anon";
GRANT ALL ON TABLE "public"."clinic_patients" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_patients" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_procedures" TO "anon";
GRANT ALL ON TABLE "public"."clinic_procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_procedures" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_rooms" TO "anon";
GRANT ALL ON TABLE "public"."clinic_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_rooms" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_users" TO "anon";
GRANT ALL ON TABLE "public"."clinic_users" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_users" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_visit_sessions" TO "anon";
GRANT ALL ON TABLE "public"."clinic_visit_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_visit_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_flags" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_ledger" TO "anon";
GRANT ALL ON TABLE "public"."inventory_ledger" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_ledger" TO "service_role";



GRANT ALL ON TABLE "public"."master_agenda_events" TO "anon";
GRANT ALL ON TABLE "public"."master_agenda_events" TO "authenticated";
GRANT ALL ON TABLE "public"."master_agenda_events" TO "service_role";



GRANT ALL ON TABLE "public"."master_tenants" TO "anon";
GRANT ALL ON TABLE "public"."master_tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."master_tenants" TO "service_role";



GRANT ALL ON TABLE "public"."notification_queue" TO "anon";
GRANT ALL ON TABLE "public"."notification_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_queue" TO "service_role";



GRANT ALL ON TABLE "public"."patient_history" TO "anon";
GRANT ALL ON TABLE "public"."patient_history" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_history" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."retention_followups" TO "anon";
GRANT ALL ON TABLE "public"."retention_followups" TO "authenticated";
GRANT ALL ON TABLE "public"."retention_followups" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_events" TO "anon";
GRANT ALL ON TABLE "public"."subscription_events" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_events" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_devices" TO "anon";
GRANT ALL ON TABLE "public"."tenant_devices" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_devices" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

create extension if not exists "pg_net" with schema "public";

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

CREATE TRIGGER on_auth_user_created BEFORE INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


