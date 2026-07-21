export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_daily_snapshots: {
        Row: {
          avg_session_duration_minutes: number | null
          avg_wait_time_minutes: number | null
          conversion_rate: number | null
          created_at: string
          hot_leads_count: number | null
          id: string
          snapshot_date: string
          snapshot_metadata: Json | null
          tenant_id: string
          total_cancellations: number | null
          total_discounts_subunits: number | null
          total_new_patients: number | null
          total_no_shows: number | null
          total_returning_patients: number | null
          total_revenue_subunits: number | null
          total_visits: number | null
        }
        Insert: {
          avg_session_duration_minutes?: number | null
          avg_wait_time_minutes?: number | null
          conversion_rate?: number | null
          created_at?: string
          hot_leads_count?: number | null
          id?: string
          snapshot_date: string
          snapshot_metadata?: Json | null
          tenant_id: string
          total_cancellations?: number | null
          total_discounts_subunits?: number | null
          total_new_patients?: number | null
          total_no_shows?: number | null
          total_returning_patients?: number | null
          total_revenue_subunits?: number | null
          total_visits?: number | null
        }
        Update: {
          avg_session_duration_minutes?: number | null
          avg_wait_time_minutes?: number | null
          conversion_rate?: number | null
          created_at?: string
          hot_leads_count?: number | null
          id?: string
          snapshot_date?: string
          snapshot_metadata?: Json | null
          tenant_id?: string
          total_cancellations?: number | null
          total_discounts_subunits?: number | null
          total_new_patients?: number | null
          total_no_shows?: number | null
          total_returning_patients?: number | null
          total_revenue_subunits?: number | null
          total_visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_daily_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          record_id: string | null
          table_name: string
          tenant_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string | null
          table_name: string
          tenant_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          activated_by: string | null
          activation_notes: string | null
          amount_subunits: number | null
          created_at: string
          event_metadata: Json | null
          event_type: string
          id: string
          is_manual: boolean | null
          new_tier: string | null
          previous_tier: string | null
          tenant_id: string | null
        }
        Insert: {
          activated_by?: string | null
          activation_notes?: string | null
          amount_subunits?: number | null
          created_at?: string
          event_metadata?: Json | null
          event_type: string
          id?: string
          is_manual?: boolean | null
          new_tier?: string | null
          previous_tier?: string | null
          tenant_id?: string | null
        }
        Update: {
          activated_by?: string | null
          activation_notes?: string | null
          amount_subunits?: number | null
          created_at?: string
          event_metadata?: Json | null
          event_type?: string
          id?: string
          is_manual?: boolean | null
          new_tier?: string | null
          previous_tier?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_inquiries: {
        Row: {
          created_at: string
          handled_by: string | null
          id: string
          inquiry_reason: string | null
          inquiry_type: string
          notes: string | null
          patient_id: string | null
          procedures_requested: string[] | null
          status: string | null
          temp_patient_name: string | null
          temp_phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          handled_by?: string | null
          id?: string
          inquiry_reason?: string | null
          inquiry_type: string
          notes?: string | null
          patient_id?: string | null
          procedures_requested?: string[] | null
          status?: string | null
          temp_patient_name?: string | null
          temp_phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          handled_by?: string | null
          id?: string
          inquiry_reason?: string | null
          inquiry_type?: string
          notes?: string | null
          patient_id?: string | null
          procedures_requested?: string[] | null
          status?: string | null
          temp_patient_name?: string | null
          temp_phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_inquiries_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_inquiries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_invoices: {
        Row: {
          amount_due_subunits: number | null
          amount_paid_subunits: number
          collected_by: string | null
          created_at: string
          discount_approved_by: string | null
          discount_reason: string | null
          discount_subunits: number
          id: string
          invoice_date: string
          invoice_status: string | null
          patient_id: string
          payment_method: string | null
          session_id: string
          subtotal_subunits: number
          tax_subunits: number
          tenant_id: string
          total_subunits: number
          updated_at: string
        }
        Insert: {
          amount_due_subunits?: number | null
          amount_paid_subunits?: number
          collected_by?: string | null
          created_at?: string
          discount_approved_by?: string | null
          discount_reason?: string | null
          discount_subunits?: number
          id?: string
          invoice_date?: string
          invoice_status?: string | null
          patient_id: string
          payment_method?: string | null
          session_id: string
          subtotal_subunits?: number
          tax_subunits?: number
          tenant_id: string
          total_subunits?: number
          updated_at?: string
        }
        Update: {
          amount_due_subunits?: number | null
          amount_paid_subunits?: number
          collected_by?: string | null
          created_at?: string
          discount_approved_by?: string | null
          discount_reason?: string | null
          discount_subunits?: number
          id?: string
          invoice_date?: string
          invoice_status?: string | null
          patient_id?: string
          payment_method?: string | null
          session_id?: string
          subtotal_subunits?: number
          tax_subunits?: number
          tenant_id?: string
          total_subunits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_invoices_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invoices_discount_approved_by_fkey"
            columns: ["discount_approved_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invoices_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_patients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          first_name: string
          first_name_ar: string | null
          first_visit_date: string | null
          gender: string | null
          id: string
          last_name: string
          last_name_ar: string | null
          notes: string | null
          patient_status: string | null
          phone_primary: string
          phone_secondary: string | null
          preferred_channel: string | null
          referral_source: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name: string
          first_name_ar?: string | null
          first_visit_date?: string | null
          gender?: string | null
          id?: string
          last_name: string
          last_name_ar?: string | null
          notes?: string | null
          patient_status?: string | null
          phone_primary: string
          phone_secondary?: string | null
          preferred_channel?: string | null
          referral_source?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          first_name_ar?: string | null
          first_visit_date?: string | null
          gender?: string | null
          id?: string
          last_name?: string
          last_name_ar?: string | null
          notes?: string | null
          patient_status?: string | null
          phone_primary?: string
          phone_secondary?: string | null
          preferred_channel?: string | null
          referral_source?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_procedures: {
        Row: {
          base_price_subunits: number
          buffer_time_minutes: number
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          procedure_name: string
          procedure_name_ar: string | null
          standard_duration_minutes: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_price_subunits?: number
          buffer_time_minutes?: number
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          procedure_name: string
          procedure_name_ar?: string | null
          standard_duration_minutes?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_price_subunits?: number
          buffer_time_minutes?: number
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          procedure_name?: string
          procedure_name_ar?: string | null
          standard_duration_minutes?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_procedures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_rooms: {
        Row: {
          capacity: number | null
          created_at: string
          floor_number: number | null
          id: string
          is_active: boolean
          room_name: string
          room_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          floor_number?: number | null
          id?: string
          is_active?: boolean
          room_name: string
          room_type: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          floor_number?: number | null
          id?: string
          is_active?: boolean
          room_name?: string
          room_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          employee_code: string
          full_name: string
          full_name_ar: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
          pin_code: string
          role: string
          specialization: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          employee_code: string
          full_name: string
          full_name_ar?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          pin_code: string
          role: string
          specialization?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          employee_code?: string
          full_name?: string
          full_name_ar?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          pin_code?: string
          role?: string
          specialization?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_visit_sessions: {
        Row: {
          agenda_event_id: string | null
          arrived_at: string | null
          auto_close_at: string | null
          buffer_window_expires_at: string | null
          clinical_notes: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          doctor_notes: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          initialized_by_receptionist: string | null
          is_insured: boolean
          lock_holder_id: string | null
          lock_timestamp: string | null
          patient_feedback: string | null
          patient_id: string
          patient_satisfaction_score: number | null
          room_id: string | null
          session_duration_minutes: number | null
          session_ended_at: string | null
          session_started_at: string | null
          session_status: string
          tenant_id: string
          treatment_performed: string | null
          updated_at: string
          visit_closed_at: string | null
          waiting_time_minutes: number | null
        }
        Insert: {
          agenda_event_id?: string | null
          arrived_at?: string | null
          auto_close_at?: string | null
          buffer_window_expires_at?: string | null
          clinical_notes?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          doctor_notes?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          initialized_by_receptionist?: string | null
          is_insured?: boolean
          lock_holder_id?: string | null
          lock_timestamp?: string | null
          patient_feedback?: string | null
          patient_id: string
          patient_satisfaction_score?: number | null
          room_id?: string | null
          session_duration_minutes?: number | null
          session_ended_at?: string | null
          session_started_at?: string | null
          session_status?: string
          tenant_id: string
          treatment_performed?: string | null
          updated_at?: string
          visit_closed_at?: string | null
          waiting_time_minutes?: number | null
        }
        Update: {
          agenda_event_id?: string | null
          arrived_at?: string | null
          auto_close_at?: string | null
          buffer_window_expires_at?: string | null
          clinical_notes?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          initialized_by_receptionist?: string | null
          is_insured?: boolean
          lock_holder_id?: string | null
          lock_timestamp?: string | null
          patient_feedback?: string | null
          patient_id?: string
          patient_satisfaction_score?: number | null
          room_id?: string | null
          session_duration_minutes?: number | null
          session_ended_at?: string | null
          session_started_at?: string | null
          session_status?: string
          tenant_id?: string
          treatment_performed?: string | null
          updated_at?: string
          visit_closed_at?: string | null
          waiting_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_visit_sessions_agenda_event_id_fkey"
            columns: ["agenda_event_id"]
            isOneToOne: false
            referencedRelation: "master_agenda_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_sessions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_sessions_initialized_by_receptionist_fkey"
            columns: ["initialized_by_receptionist"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_sessions_lock_holder_id_fkey"
            columns: ["lock_holder_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "clinic_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          allowed_tiers: string[] | null
          config_json: Json | null
          created_at: string
          description: string | null
          flag_key: string
          flag_name: string
          id: string
          is_enabled: boolean
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          allowed_tiers?: string[] | null
          config_json?: Json | null
          created_at?: string
          description?: string | null
          flag_key: string
          flag_name: string
          id?: string
          is_enabled?: boolean
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          allowed_tiers?: string[] | null
          config_json?: Json | null
          created_at?: string
          description?: string | null
          flag_key?: string
          flag_name?: string
          id?: string
          is_enabled?: boolean
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_ledger: {
        Row: {
          consumption_type: string
          created_at: string
          id: string
          logged_by: string | null
          material_name: string
          notes: string | null
          procedure_id: string | null
          quantity_consumed: number
          session_id: string | null
          tenant_id: string
        }
        Insert: {
          consumption_type: string
          created_at?: string
          id?: string
          logged_by?: string | null
          material_name: string
          notes?: string | null
          procedure_id?: string | null
          quantity_consumed: number
          session_id?: string | null
          tenant_id: string
        }
        Update: {
          consumption_type?: string
          created_at?: string
          id?: string
          logged_by?: string | null
          material_name?: string
          notes?: string | null
          procedure_id?: string | null
          quantity_consumed?: number
          session_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      master_agenda_events: {
        Row: {
          booking_notes: string | null
          buffer_end: string
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          doctor_id: string | null
          event_type: string
          id: string
          inquiry_id: string | null
          patient_id: string | null
          procedure_id: string | null
          reminder_sent_24h: boolean | null
          reminder_sent_2h: boolean | null
          room_id: string | null
          scheduled_end: string
          scheduled_start: string
          status: string | null
          tenant_id: string
          updated_at: string
          visit_type: string | null
        }
        Insert: {
          booking_notes?: string | null
          buffer_end: string
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          event_type: string
          id?: string
          inquiry_id?: string | null
          patient_id?: string | null
          procedure_id?: string | null
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          room_id?: string | null
          scheduled_end: string
          scheduled_start: string
          status?: string | null
          tenant_id: string
          updated_at?: string
          visit_type?: string | null
        }
        Update: {
          booking_notes?: string | null
          buffer_end?: string
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          event_type?: string
          id?: string
          inquiry_id?: string | null
          patient_id?: string | null
          procedure_id?: string | null
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          room_id?: string | null
          scheduled_end?: string
          scheduled_start?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_agenda_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_agenda_events_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_agenda_events_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "clinic_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_agenda_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_agenda_events_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_agenda_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "clinic_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_agenda_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      master_tenants: {
        Row: {
          address: string | null
          clinic_name: string
          clinic_name_ar: string | null
          country_code: string | null
          created_at: string
          currency: string
          currency_subunit: number
          deleted_at: string | null
          id: string
          is_active: boolean
          license_key: string
          logo_url: string | null
          max_devices: number
          primary_color: string | null
          primary_phone: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string
          timezone: string
          trial_started_at: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          clinic_name: string
          clinic_name_ar?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string
          currency_subunit?: number
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          license_key: string
          logo_url?: string | null
          max_devices?: number
          primary_color?: string | null
          primary_phone?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          timezone?: string
          trial_started_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          clinic_name?: string
          clinic_name_ar?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string
          currency_subunit?: number
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          license_key?: string
          logo_url?: string | null
          max_devices?: number
          primary_color?: string | null
          primary_phone?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          timezone?: string
          trial_started_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          max_retries: number | null
          message_body: string
          metadata: Json | null
          priority: number | null
          recipient_email: string | null
          recipient_id: string | null
          recipient_phone: string | null
          recipient_type: string
          retry_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          message_body: string
          metadata?: Json | null
          priority?: number | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_phone?: string | null
          recipient_type: string
          retry_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          message_body?: string
          metadata?: Json | null
          priority?: number | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_phone?: string | null
          recipient_type?: string
          retry_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_history: {
        Row: {
          created_at: string
          id: string
          last_calculated_at: string | null
          last_visit_date: string | null
          loyalty_tier: string | null
          next_scheduled_visit: string | null
          patient_id: string
          tenant_id: string
          total_cancellations: number | null
          total_completed_visits: number | null
          total_no_shows: number | null
          total_revenue_subunits: number | null
          total_visits: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          last_visit_date?: string | null
          loyalty_tier?: string | null
          next_scheduled_visit?: string | null
          patient_id: string
          tenant_id: string
          total_cancellations?: number | null
          total_completed_visits?: number | null
          total_no_shows?: number | null
          total_revenue_subunits?: number | null
          total_visits?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_calculated_at?: string | null
          last_visit_date?: string | null
          loyalty_tier?: string | null
          next_scheduled_visit?: string | null
          patient_id?: string
          tenant_id?: string
          total_cancellations?: number | null
          total_completed_visits?: number | null
          total_no_shows?: number | null
          total_revenue_subunits?: number | null
          total_visits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          permission_key: string
          permission_name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          permission_key: string
          permission_name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          permission_key?: string
          permission_name?: string
          resource?: string
        }
        Relationships: []
      }
      retention_followups: {
        Row: {
          channel: string | null
          created_at: string
          delivered_at: string | null
          delivery_status: string | null
          followup_type: string
          id: string
          message_body: string | null
          patient_id: string
          response_received: boolean | null
          scheduled_for: string
          sent_at: string | null
          sent_by: string | null
          session_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          followup_type: string
          id?: string
          message_body?: string | null
          patient_id: string
          response_received?: boolean | null
          scheduled_for: string
          sent_at?: string | null
          sent_by?: string | null
          session_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          followup_type?: string
          id?: string
          message_body?: string | null
          patient_id?: string
          response_received?: boolean | null
          scheduled_for?: string
          sent_at?: string | null
          sent_by?: string | null
          session_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retention_followups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_followups_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_followups_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_followups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          role_key: string
          role_name: string
          role_name_ar: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          role_key: string
          role_name: string
          role_name_ar?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          role_key?: string
          role_name?: string
          role_name_ar?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          new_plan_id: string | null
          new_status: string | null
          previous_plan_id: string | null
          previous_status: string | null
          reason: string | null
          subscription_id: string
          tenant_id: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          new_plan_id?: string | null
          new_status?: string | null
          previous_plan_id?: string | null
          previous_status?: string | null
          reason?: string | null
          subscription_id: string
          tenant_id: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          new_plan_id?: string | null
          new_status?: string | null
          previous_plan_id?: string | null
          previous_status?: string | null
          reason?: string | null
          subscription_id?: string
          tenant_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ai_limits: Json | null
          api_rate_limit: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_branches: number
          max_devices: number
          max_users: number
          modules: Json | null
          plan_key: string
          plan_name: string
          plan_name_ar: string | null
          storage_gb: number | null
        }
        Insert: {
          ai_limits?: Json | null
          api_rate_limit?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_branches?: number
          max_devices?: number
          max_users?: number
          modules?: Json | null
          plan_key: string
          plan_name: string
          plan_name_ar?: string | null
          storage_gb?: number | null
        }
        Update: {
          ai_limits?: Json | null
          api_rate_limit?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_branches?: number
          max_devices?: number
          max_users?: number
          modules?: Json | null
          plan_key?: string
          plan_name?: string
          plan_name_ar?: string | null
          storage_gb?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          discount_code: string | null
          ends_at: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan_id: string
          started_at: string | null
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          discount_code?: string | null
          ends_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_id: string
          started_at?: string | null
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          discount_code?: string | null
          ends_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_id?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_devices: {
        Row: {
          browser_info: string | null
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          os_info: string | null
          registered_at: string
          tenant_id: string
        }
        Insert: {
          browser_info?: string | null
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          os_info?: string | null
          registered_at?: string
          tenant_id: string
        }
        Update: {
          browser_info?: string | null
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          os_info?: string | null
          registered_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          clinic_name: string
          clinic_name_ar: string | null
          country_code: string | null
          created_at: string | null
          currency: string | null
          currency_subunit: number | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          license_key: string
          logo_url: string | null
          primary_color: string | null
          primary_phone: string | null
          timezone: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          clinic_name: string
          clinic_name_ar?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          currency_subunit?: number | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          license_key: string
          logo_url?: string | null
          primary_color?: string | null
          primary_phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          clinic_name?: string
          clinic_name_ar?: string | null
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          currency_subunit?: number | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          license_key?: string
          logo_url?: string | null
          primary_color?: string | null
          primary_phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          employee_code: string | null
          full_name: string
          full_name_ar: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          phone: string | null
          pin_code: string | null
          role_id: string
          specialization: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          employee_code?: string | null
          full_name: string
          full_name_ar?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          pin_code?: string | null
          role_id: string
          specialization?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          employee_code?: string | null
          full_name?: string
          full_name_ar?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          pin_code?: string | null
          role_id?: string
          specialization?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tenant_with_subscription: {
        Args: {
          p_auth_user_id: string
          p_clinic_name: string
          p_clinic_name_ar?: string
          p_country_code?: string
          p_currency?: string
          p_email: string
          p_full_name: string
          p_license_key?: string
          p_plan_key?: string
          p_timezone?: string
        }
        Returns: Json
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_current_tenant_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      set_tenant_id: { Args: { tenant_id: string }; Returns: undefined }
      test_jwt_claims: {
        Args: { p_user_id: string }
        Returns: {
          claim_name: string
          claim_value: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
