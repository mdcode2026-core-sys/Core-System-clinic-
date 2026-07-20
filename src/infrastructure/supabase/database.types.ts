/**
 * ClinicSaaS™ — Supabase Database Types
 * Generated: 2026-07-20
 * Based on: supabase Data info(1).md
 * 
 * IMPORTANT:
 * - master_tenants is the canonical tenants table
 * - clinic_users is the canonical users table
 * - users (old) and tenants (old) kept for backward compatibility
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ─────────────────────────────────────────
      // MASTER / CORE TABLES
      // ─────────────────────────────────────────

      master_tenants: {
        Row: {
          id: string;
          clinic_name: string;
          clinic_name_ar: string | null;
          license_key: string;
          timezone: string | null;
          currency: string | null;
          country_code: string | null;
          subscription_tier: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          clinic_name: string;
          clinic_name_ar?: string | null;
          license_key?: string;
          timezone?: string | null;
          currency?: string | null;
          country_code?: string | null;
          subscription_tier?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          clinic_name?: string;
          clinic_name_ar?: string | null;
          license_key?: string;
          timezone?: string | null;
          currency?: string | null;
          country_code?: string | null;
          subscription_tier?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      clinic_users: {
        Row: {
          id: string;
          tenant_id: string;
          auth_user_id: string | null;
          full_name: string;
          full_name_ar: string | null;
          role: string;
          specialization: string | null;
          employee_code: string;
          pin_code: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          auth_user_id?: string | null;
          full_name: string;
          full_name_ar?: string | null;
          role: string;
          specialization?: string | null;
          employee_code: string;
          pin_code: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          auth_user_id?: string | null;
          full_name?: string;
          full_name_ar?: string | null;
          role?: string;
          specialization?: string | null;
          employee_code?: string;
          pin_code?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      // ─────────────────────────────────────────
      // PATIENTS
      // ─────────────────────────────────────────

      clinic_patients: {
        Row: {
          id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          first_name_ar: string | null;
          last_name_ar: string | null;
          date_of_birth: string | null;
          gender: string | null;
          phone_primary: string;
          phone_secondary: string | null;
          email: string | null;
          preferred_channel: string;
          first_visit_date: string | null;
          referral_source: string | null;
          patient_status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          first_name_ar?: string | null;
          last_name_ar?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          phone_primary: string;
          phone_secondary?: string | null;
          email?: string | null;
          preferred_channel?: string;
          first_visit_date?: string | null;
          referral_source?: string | null;
          patient_status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          first_name?: string;
          last_name?: string;
          first_name_ar?: string | null;
          last_name_ar?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          phone_primary?: string;
          phone_secondary?: string | null;
          email?: string | null;
          preferred_channel?: string;
          first_visit_date?: string | null;
          referral_source?: string | null;
          patient_status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      patient_history: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          last_visit_date: string | null;
          total_visits: number | null;
          total_spent_subunits: number | null;
          preferred_procedure: string | null;
          satisfaction_score: number | null;
          retention_risk: string | null;
          next_followup_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          last_visit_date?: string | null;
          total_visits?: number | null;
          total_spent_subunits?: number | null;
          preferred_procedure?: string | null;
          satisfaction_score?: number | null;
          retention_risk?: string | null;
          next_followup_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          last_visit_date?: string | null;
          total_visits?: number | null;
          total_spent_subunits?: number | null;
          preferred_procedure?: string | null;
          satisfaction_score?: number | null;
          retention_risk?: string | null;
          next_followup_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // AGENDA & SCHEDULING
      // ─────────────────────────────────────────

      master_agenda_events: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          doctor_id: string;
          room_id: string | null;
          procedure_id: string | null;
          inquiry_id: string | null;
          created_by: string;
          scheduled_start: string;
          scheduled_end: string;
          buffer_end: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          doctor_id: string;
          room_id?: string | null;
          procedure_id?: string | null;
          inquiry_id?: string | null;
          created_by: string;
          scheduled_start: string;
          scheduled_end: string;
          buffer_end?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          doctor_id?: string;
          room_id?: string | null;
          procedure_id?: string | null;
          inquiry_id?: string | null;
          created_by?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          buffer_end?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      clinic_visit_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          doctor_id: string | null;
          room_id: string | null;
          agenda_event_id: string | null;
          lock_holder_id: string | null;
          initialized_by_receptionist: string | null;
          session_status: string;
          check_in_at: string | null;
          session_started_at: string | null;
          session_ended_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          doctor_id?: string | null;
          room_id?: string | null;
          agenda_event_id?: string | null;
          lock_holder_id?: string | null;
          initialized_by_receptionist?: string | null;
          session_status?: string;
          check_in_at?: string | null;
          session_started_at?: string | null;
          session_ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          room_id?: string | null;
          agenda_event_id?: string | null;
          lock_holder_id?: string | null;
          initialized_by_receptionist?: string | null;
          session_status?: string;
          check_in_at?: string | null;
          session_started_at?: string | null;
          session_ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // INVOICING
      // ─────────────────────────────────────────

      clinic_invoices: {
        Row: {
          id: string;
          tenant_id: string;
          session_id: string;
          patient_id: string;
          subtotal_subunits: number;
          discount_subunits: number;
          discount_reason: string | null;
          discount_approved_by: string | null;
          tax_subunits: number;
          total_subunits: number;
          amount_paid_subunits: number;
          amount_due_subunits: number | null;
          payment_method: string | null;
          invoice_status: string;
          collected_by: string | null;
          invoice_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          session_id: string;
          patient_id: string;
          subtotal_subunits?: number;
          discount_subunits?: number;
          discount_reason?: string | null;
          discount_approved_by?: string | null;
          tax_subunits?: number;
          total_subunits?: number;
          amount_paid_subunits?: number;
          amount_due_subunits?: number | null;
          payment_method?: string | null;
          invoice_status?: string;
          collected_by?: string | null;
          invoice_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          patient_id?: string;
          subtotal_subunits?: number;
          discount_subunits?: number;
          discount_reason?: string | null;
          discount_approved_by?: string | null;
          tax_subunits?: number;
          total_subunits?: number;
          amount_paid_subunits?: number;
          amount_due_subunits?: number | null;
          payment_method?: string | null;
          invoice_status?: string;
          collected_by?: string | null;
          invoice_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // CLINIC CONFIGURATION
      // ─────────────────────────────────────────

      clinic_procedures: {
        Row: {
          id: string;
          tenant_id: string;
          procedure_name: string;
          procedure_name_ar: string | null;
          category: string | null;
          standard_duration_minutes: number;
          buffer_time_minutes: number;
          base_price_subunits: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          procedure_name: string;
          procedure_name_ar?: string | null;
          category?: string | null;
          standard_duration_minutes?: number;
          buffer_time_minutes?: number;
          base_price_subunits?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          procedure_name?: string;
          procedure_name_ar?: string | null;
          category?: string | null;
          standard_duration_minutes?: number;
          buffer_time_minutes?: number;
          base_price_subunits?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      clinic_rooms: {
        Row: {
          id: string;
          tenant_id: string;
          room_name: string;
          room_name_ar: string | null;
          room_type: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          room_name: string;
          room_name_ar?: string | null;
          room_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          room_name?: string;
          room_name_ar?: string | null;
          room_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      clinic_inquiries: {
        Row: {
          id: string;
          tenant_id: string;
          inquiry_type: string;
          patient_id: string | null;
          temp_patient_name: string | null;
          temp_phone: string | null;
          inquiry_reason: string | null;
          procedures_requested: string[] | null;
          status: string;
          handled_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          inquiry_type: string;
          patient_id?: string | null;
          temp_patient_name?: string | null;
          temp_phone?: string | null;
          inquiry_reason?: string | null;
          procedures_requested?: string[] | null;
          status?: string;
          handled_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          inquiry_type?: string;
          patient_id?: string | null;
          temp_patient_name?: string | null;
          temp_phone?: string | null;
          inquiry_reason?: string | null;
          procedures_requested?: string[] | null;
          status?: string;
          handled_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // SUBSCRIPTION & BILLING
      // ─────────────────────────────────────────

      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string;
          status: string;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plan_id: string;
          status: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          plan_id?: string;
          status?: string;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      subscription_plans: {
        Row: {
          id: string;
          plan_key: string;
          plan_name: string;
          plan_name_ar: string | null;
          description: string | null;
          price_monthly_subunits: number;
          price_yearly_subunits: number;
          features: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_key: string;
          plan_name: string;
          plan_name_ar?: string | null;
          description?: string | null;
          price_monthly_subunits?: number;
          price_yearly_subunits?: number;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_key?: string;
          plan_name?: string;
          plan_name_ar?: string | null;
          description?: string | null;
          price_monthly_subunits?: number;
          price_yearly_subunits?: number;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };

      subscription_events: {
        Row: {
          id: string;
          subscription_id: string;
          tenant_id: string;
          event_type: string;
          previous_status: string | null;
          new_status: string | null;
          previous_plan_id: string | null;
          new_plan_id: string | null;
          reason: string | null;
          event_metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          tenant_id: string;
          event_type: string;
          previous_status?: string | null;
          new_status?: string | null;
          previous_plan_id?: string | null;
          new_plan_id?: string | null;
          reason?: string | null;
          event_metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          tenant_id?: string;
          event_type?: string;
          previous_status?: string | null;
          new_status?: string | null;
          previous_plan_id?: string | null;
          new_plan_id?: string | null;
          reason?: string | null;
          event_metadata?: Json;
          created_at?: string;
        };
      };

      billing_events: {
        Row: {
          id: string;
          tenant_id: string;
          event_type: string;
          previous_tier: string | null;
          new_tier: string | null;
          amount_subunits: number;
          is_manual: boolean;
          activated_by: string | null;
          activation_notes: string | null;
          event_metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          event_type: string;
          previous_tier?: string | null;
          new_tier?: string | null;
          amount_subunits?: number;
          is_manual?: boolean;
          activated_by?: string | null;
          activation_notes?: string | null;
          event_metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          event_type?: string;
          previous_tier?: string | null;
          new_tier?: string | null;
          amount_subunits?: number;
          is_manual?: boolean;
          activated_by?: string | null;
          activation_notes?: string | null;
          event_metadata?: Json;
          created_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // ANALYTICS & AUDIT
      // ─────────────────────────────────────────

      analytics_daily_snapshots: {
        Row: {
          id: string;
          tenant_id: string;
          snapshot_date: string;
          total_visits: number;
          total_new_patients: number;
          total_returning_patients: number;
          total_no_shows: number;
          total_cancellations: number;
          avg_wait_time_minutes: number;
          avg_session_duration_minutes: number;
          total_revenue_subunits: number;
          total_discounts_subunits: number;
          hot_leads_count: number;
          conversion_rate: number;
          snapshot_metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          snapshot_date: string;
          total_visits?: number;
          total_new_patients?: number;
          total_returning_patients?: number;
          total_no_shows?: number;
          total_cancellations?: number;
          avg_wait_time_minutes?: number;
          avg_session_duration_minutes?: number;
          total_revenue_subunits?: number;
          total_discounts_subunits?: number;
          hot_leads_count?: number;
          conversion_rate?: number;
          snapshot_metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          snapshot_date?: string;
          total_visits?: number;
          total_new_patients?: number;
          total_returning_patients?: number;
          total_no_shows?: number;
          total_cancellations?: number;
          avg_wait_time_minutes?: number;
          avg_session_duration_minutes?: number;
          total_revenue_subunits?: number;
          total_discounts_subunits?: number;
          hot_leads_count?: number;
          conversion_rate?: number;
          snapshot_metadata?: Json;
          created_at?: string;
        };
      };

      audit_trail: {
        Row: {
          id: string;
          tenant_id: string;
          actor_id: string | null;
          actor_role: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          reason: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          actor_id?: string | null;
          actor_role?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          reason?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          actor_id?: string | null;
          actor_role?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          reason?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // NOTIFICATIONS & RETENTION
      // ─────────────────────────────────────────

      notification_queue: {
        Row: {
          id: string;
          tenant_id: string;
          recipient_type: string;
          recipient_id: string;
          channel: string;
          template_key: string;
          payload: Json;
          scheduled_at: string;
          sent_at: string | null;
          status: string;
          priority: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          recipient_type: string;
          recipient_id: string;
          channel: string;
          template_key: string;
          payload?: Json;
          scheduled_at: string;
          sent_at?: string | null;
          status?: string;
          priority?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          recipient_type?: string;
          recipient_id?: string;
          channel?: string;
          template_key?: string;
          payload?: Json;
          scheduled_at?: string;
          sent_at?: string | null;
          status?: string;
          priority?: number;
          error_message?: string | null;
          created_at?: string;
        };
      };

      retention_followups: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          session_id: string | null;
          followup_type: string;
          scheduled_for: string;
          sent_at: string | null;
          delivery_status: string;
          sent_by: string | null;
          content: string | null;
          response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          session_id?: string | null;
          followup_type: string;
          scheduled_for: string;
          sent_at?: string | null;
          delivery_status?: string;
          sent_by?: string | null;
          content?: string | null;
          response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          session_id?: string | null;
          followup_type?: string;
          scheduled_for?: string;
          sent_at?: string | null;
          delivery_status?: string;
          sent_by?: string | null;
          content?: string | null;
          response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // INVENTORY
      // ─────────────────────────────────────────

      inventory_ledger: {
        Row: {
          id: string;
          tenant_id: string;
          procedure_id: string | null;
          session_id: string | null;
          item_name: string;
          quantity_used: number;
          unit_cost_subunits: number | null;
          logged_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          procedure_id?: string | null;
          session_id?: string | null;
          item_name: string;
          quantity_used: number;
          unit_cost_subunits?: number | null;
          logged_by: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          procedure_id?: string | null;
          session_id?: string | null;
          item_name?: string;
          quantity_used?: number;
          unit_cost_subunits?: number | null;
          logged_by?: string;
          notes?: string | null;
          created_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // FEATURE FLAGS & DEVICES
      // ─────────────────────────────────────────

      feature_flags: {
        Row: {
          id: string;
          tenant_id: string | null;
          flag_key: string;
          flag_value: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          flag_key: string;
          flag_value?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          flag_key?: string;
          flag_value?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      tenant_devices: {
        Row: {
          id: string;
          tenant_id: string;
          device_fingerprint: string;
          device_type: string | null;
          device_name: string | null;
          last_seen_at: string | null;
          is_trusted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          device_fingerprint: string;
          device_type?: string | null;
          device_name?: string | null;
          last_seen_at?: string | null;
          is_trusted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          device_fingerprint?: string;
          device_type?: string | null;
          device_name?: string | null;
          last_seen_at?: string | null;
          is_trusted?: boolean;
          created_at?: string;
        };
      };

      // ─────────────────────────────────────────
      // LEGACY TABLES (Backward Compatibility)
      // ─────────────────────────────────────────
      // These tables are kept for backward compatibility
      // New code should use master_tenants and clinic_users

      tenants: {
        Row: {
          id: string;
          clinic_name: string;
          clinic_name_ar: string | null;
          license_key: string;
          timezone: string | null;
          currency: string | null;
          country_code: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          clinic_name: string;
          clinic_name_ar?: string | null;
          license_key?: string;
          timezone?: string | null;
          currency?: string | null;
          country_code?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          clinic_name?: string;
          clinic_name_ar?: string | null;
          license_key?: string;
          timezone?: string | null;
          currency?: string | null;
          country_code?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      users: {
        Row: {
          id: string;
          tenant_id: string;
          auth_user_id: string;
          full_name: string;
          full_name_ar: string | null;
          role_id: string;
          email: string | null;
          phone: string | null;
          employee_code: string | null;
          pin_code: string | null;
          specialization: string | null;
          avatar_url: string | null;
          is_active: boolean | null;
          last_login_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          auth_user_id: string;
          full_name: string;
          full_name_ar?: string | null;
          role_id: string;
          email?: string | null;
          phone?: string | null;
          employee_code?: string | null;
          pin_code?: string | null;
          specialization?: string | null;
          avatar_url?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          auth_user_id?: string;
          full_name?: string;
          full_name_ar?: string | null;
          role_id?: string;
          email?: string | null;
          phone?: string | null;
          employee_code?: string | null;
          pin_code?: string | null;
          specialization?: string | null;
          avatar_url?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };

      roles: {
        Row: {
          id: string;
          role_key: string;
          role_name: string;
          role_name_ar: string | null;
          description: string | null;
          is_system_role: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_key: string;
          role_name: string;
          role_name_ar?: string | null;
          description?: string | null;
          is_system_role?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_key?: string;
          role_name?: string;
          role_name_ar?: string | null;
          description?: string | null;
          is_system_role?: boolean;
          created_at?: string;
        };
      };

      permissions: {
        Row: {
          id: string;
          permission_key: string;
          permission_name: string;
          permission_name_ar: string | null;
          description: string | null;
          resource: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          permission_key: string;
          permission_name: string;
          permission_name_ar?: string | null;
          description?: string | null;
          resource: string;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          permission_key?: string;
          permission_name?: string;
          permission_name_ar?: string | null;
          description?: string | null;
          resource?: string;
          action?: string;
          created_at?: string;
        };
      };

      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      create_tenant_with_subscription: {
        Args: {
          p_clinic_name: string;
          p_clinic_name_ar?: string;
          p_license_key?: string;
          p_timezone?: string;
          p_currency?: string;
          p_country_code?: string;
          p_plan_key?: string;
          p_auth_user_id: string;
          p_full_name: string;
          p_email: string;
        };
        Returns: Json;
      };
      custom_access_token_hook: {
        Args: {
          event: Json;
        };
        Returns: Json;
      };
      set_tenant_id: {
        Args: {
          tenant_id: string;
        };
        Returns: undefined;
      };
      fn_audit_changes: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      fn_log_subscription_change: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      fn_set_auto_close: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      fn_set_session_buffer: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      fn_set_updated_at: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ─────────────────────────────────────────
// HELPER TYPES
// ─────────────────────────────────────────

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience aliases for canonical tables
export type MasterTenant = Tables<"master_tenants">;
export type ClinicUser = Tables<"clinic_users">;
export type ClinicPatient = Tables<"clinic_patients">;
export type ClinicInvoice = Tables<"clinic_invoices">;
export type ClinicProcedure = Tables<"clinic_procedures">;
export type ClinicRoom = Tables<"clinic_rooms">;
export type MasterAgendaEvent = Tables<"master_agenda_events">;
export type ClinicVisitSession = Tables<"clinic_visit_sessions">;
export type PatientHistory = Tables<"patient_history">;
export type Subscription = Tables<"subscriptions">;
export type SubscriptionPlan = Tables<"subscription_plans">;
export type AuditTrail = Tables<"audit_trail">;
export type AnalyticsSnapshot = Tables<"analytics_daily_snapshots">;
