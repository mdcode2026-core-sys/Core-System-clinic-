export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_daily_snapshots: {
        Row: {
          id: string
          tenant_id: string
          snapshot_date: string
          total_visits: number | null
          total_new_patients: number | null
          total_returning_patients: number | null
          total_no_shows: number | null
          total_cancellations: number | null
          avg_wait_time_minutes: number | null
          avg_session_duration_minutes: number | null
          total_revenue_subunits: number | null
          total_discounts_subunits: number | null
          hot_leads_count: number | null
          conversion_rate: number | null
          snapshot_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          snapshot_date: string
          total_visits?: number | null
          total_new_patients?: number | null
          total_returning_patients?: number | null
          total_no_shows?: number | null
          total_cancellations?: number | null
          avg_wait_time_minutes?: number | null
          avg_session_duration_minutes?: number | null
          total_revenue_subunits?: number | null
          total_discounts_subunits?: number | null
          hot_leads_count?: number | null
          conversion_rate?: number | null
          snapshot_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          snapshot_date?: string
          total_visits?: number | null
          total_new_patients?: number | null
          total_returning_patients?: number | null
          total_no_shows?: number | null
          total_cancellations?: number | null
          avg_wait_time_minutes?: number | null
          avg_session_duration_minutes?: number | null
          total_revenue_subunits?: number | null
          total_discounts_subunits?: number | null
          hot_leads_count?: number | null
          conversion_rate?: number | null
          snapshot_metadata?: Json | null
          created_at?: string
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
          id: string
          tenant_id: string
          actor_id: string | null
          actor_role: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          reason: string | null
          ip_address: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          actor_id?: string | null
          actor_role?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          reason?: string | null
          ip_address?: unknown | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          actor_id?: string | null
          actor_role?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          reason?: string | null
          ip_address?: unknown | null
          created_at?: string
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
          id: string
          tenant_id: string | null
          event_type: string
          previous_tier: string | null
          new_tier: string | null
          amount_subunits: number | null
          is_manual: boolean | null
          activated_by: string | null
          activation_notes: string | null
          event_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          event_type: string
          previous_tier?: string | null
          new_tier?: string | null
          amount_subunits?: number | null
          is_manual?: boolean | null
          activated_by?: string | null
          activation_notes?: string | null
          event_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          event_type?: string
          previous_tier?: string | null
          new_tier?: string | null
          amount_subunits?: number | null
          is_manual?: boolean | null
          activated_by?: string | null
          activation_notes?: string | null
          event_metadata?: Json | null
          created_at?: string
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
          id: string
          tenant_id: string
          inquiry_type: string
          patient_id: string | null
          temp_patient_name: string | null
          temp_phone: string | null
          inquiry_reason: string | null
          procedures_requested: string | null
          status: string | null
          handled_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          inquiry_type: string
          patient_id?: string | null
          temp_patient_name?: string | null
          temp_phone?: string | null
          inquiry_reason?: string | null
          procedures_requested?: string | null
          status?: string | null
          handled_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          inquiry_type?: string
          patient_id?: string | null
          temp_patient_name?: string | null
          temp_phone?: string | null
          inquiry_reason?: string | null
          procedures_requested?: string | null
          status?: string | null
          handled_by?: string | null
          notes?: string | null
          created_at?: string
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
          id: string
          tenant_id: string
          session_id: string
          patient_id: string
          subtotal_subunits: number
          discount_subunits: number
          discount_reason: string | null
          discount_approved_by: string | null
          tax_subunits: number
          total_subunits: number
          amount_paid_subunits: number
          amount_due_subunits: number | null
          payment_method: string | null
          invoice_status: string | null
          collected_by: string | null
          invoice_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          session_id: string
          patient_id: string
          subtotal_subunits?: number
          discount_subunits?: number
          discount_reason?: string | null
          discount_approved_by?: string | null
          tax_subunits?: number
          total_subunits?: number
          amount_paid_subunits?: number
          amount_due_subunits?: number | null
          payment_method?: string | null
          invoice_status?: string | null
          collected_by?: string | null
          invoice_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          session_id?: string
          patient_id?: string
          subtotal_subunits?: number
          discount_subunits?: number
          discount_reason?: string | null
          discount_approved_by?: string | null
          tax_subunits?: number
          total_subunits?: number
          amount_paid_subunits?: number
          amount_due_subunits?: number | null
          payment_method?: string | null
          invoice_status?: string | null
          collected_by?: string | null
          invoice_date?: string
          created_at?: string
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
          id: string
          tenant_id: string
          first_name: string
          last_name: string
          first_name_ar: string | null
          last_name_ar: string | null
          date_of_birth: string | null
          gender: string | null
          phone_primary: string
          phone_secondary: string | null
          email: string | null
          preferred_channel: string | null
          first_visit_date: string | null
          referral_source: string | null
          patient_status: string | null
          file_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          first_name: string
          last_name: string
          first_name_ar?: string | null
          last_name_ar?: string | null
          date_of_birth?: string | null
          gender?: string | null
          phone_primary: string
          phone_secondary?: string | null
          email?: string | null
          preferred_channel?: string | null
          first_visit_date?: string | null
          referral_source?: string | null
          patient_status?: string | null
          file_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string
          first_name_ar?: string | null
          last_name_ar?: string | null
          date_of_birth?: string | null
          gender?: string | null
          phone_primary?: string
          phone_secondary?: string | null
          email?: string | null
          preferred_channel?: string | null
          first_visit_date?: string | null
          referral_source?: string | null
          patient_status?: string | null
          file_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
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
          id: string
          tenant_id: string
          procedure_name: string
          procedure_name_ar: string | null
          category: string | null
          standard_duration_minutes: number
          buffer_time_minutes: number
          base_price_subunits: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          procedure_name: string
          procedure_name_ar?: string | null
          category?: string | null
          standard_duration_minutes?: number
          buffer_time_minutes?: number
          base_price_subunits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          procedure_name?: string
          procedure_name_ar?: string | null
          category?: string | null
          standard_duration_minutes?: number
          buffer_time_minutes?: number
          base_price_subunits?: number
          is_active?: boolean
          created_at?: string
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
          id: string
          tenant_id: string
          room_name: string
          room_type: string
          floor_number: number | null
          capacity: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          room_name: string
          room_type: string
          floor_number?: number | null
          capacity?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          room_name?: string
          room_type?: string
          floor_number?: number | null
          capacity?: number | null
          is_active?: boolean
          created_at?: string
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
          id: string
          tenant_id: string
          full_name: string
          full_name_ar: string | null
          role: string
          specialization: string | null
          employee_code: string
          pin_code: string
          phone: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          auth_user_id: string | null
          email: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          full_name: string
          full_name_ar?: string | null
          role: string
          specialization?: string | null
          employee_code: string
          pin_code: string
          phone?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          auth_user_id?: string | null
          email?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          full_name?: string
          full_name_ar?: string | null
          role?: string
          specialization?: string | null
          employee_code?: string
          pin_code?: string
          phone?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          auth_user_id?: string | null
          email?: string | null
          avatar_url?: string | null
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
          id: string
          tenant_id: string
          patient_id: string
          doctor_id: string
          room_id: string | null
          agenda_event_id: string | null
          arrived_at: string | null
          session_started_at: string | null
          session_ended_at: string | null
          visit_closed_at: string | null
          lock_holder_id: string | null
          lock_timestamp: string | null
          initialized_by_receptionist: string | null
          is_insured: boolean
          waiting_time_minutes: number | null
          session_duration_minutes: number | null
          doctor_notes: string | null
          clinical_notes: string | null
          diagnosis: string | null
          treatment_performed: string | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          patient_feedback: string | null
          patient_satisfaction_score: number | null
          session_status: string
          buffer_window_expires_at: string | null
          auto_close_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          patient_id: string
          doctor_id: string
          room_id?: string | null
          agenda_event_id?: string | null
          arrived_at?: string | null
          session_started_at?: string | null
          session_ended_at?: string | null
          visit_closed_at?: string | null
          lock_holder_id?: string | null
          lock_timestamp?: string | null
          initialized_by_receptionist?: string | null
          is_insured?: boolean
          waiting_time_minutes?: number | null
          session_duration_minutes?: number | null
          doctor_notes?: string | null
          clinical_notes?: string | null
          diagnosis?: string | null
          treatment_performed?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          patient_feedback?: string | null
          patient_satisfaction_score?: number | null
          session_status?: string
          buffer_window_expires_at?: string | null
          auto_close_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          patient_id?: string
          doctor_id?: string
          room_id?: string | null
          agenda_event_id?: string | null
          arrived_at?: string | null
          session_started_at?: string | null
          session_ended_at?: string | null
          visit_closed_at?: string | null
          lock_holder_id?: string | null
          lock_timestamp?: string | null
          initialized_by_receptionist?: string | null
          is_insured?: boolean
          waiting_time_minutes?: number | null
          session_duration_minutes?: number | null
          doctor_notes?: string | null
          clinical_notes?: string | null
          diagnosis?: string | null
          treatment_performed?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          patient_feedback?: string | null
          patient_satisfaction_score?: number | null
          session_status?: string
          buffer_window_expires_at?: string | null
          auto_close_at?: string | null
          created_at?: string
          updated_at?: string
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
          id: string
          tenant_id: string | null
          flag_key: string
          flag_name: string
          description: string | null
          is_enabled: boolean
          allowed_tiers: string | null
          config_json: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          flag_key: string
          flag_name: string
          description?: string | null
          is_enabled?: boolean
          allowed_tiers?: string | null
          config_json?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          flag_key?: string
          flag_name?: string
          description?: string | null
          is_enabled?: boolean
          allowed_tiers?: string | null
          config_json?: Json | null
          created_at?: string
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
   invoice_items: {
    Row: {
      id: string
      tenant_id: string
      invoice_id: string
      procedure_id: string | null
      item_description: string
      item_description_ar: string | null
      quantity: number
      unit_price_subunits: number
      discount_subunits: number
      tax_subunits: number
      tax_rate_percent: number
      line_total_subunits: number | null
      sort_order: number
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      tenant_id: string
      invoice_id: string
      procedure_id?: string | null
      item_description: string
      item_description_ar?: string | null
      quantity?: number
      unit_price_subunits?: number
      discount_subunits?: number
      tax_subunits?: number
      tax_rate_percent?: number
      line_total_subunits?: number | null
      sort_order?: number
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      tenant_id?: string
      invoice_id?: string
      procedure_id?: string | null
      item_description?: string
      item_description_ar?: string | null
      quantity?: number
      unit_price_subunits?: number
      discount_subunits?: number
      tax_subunits?: number
      tax_rate_percent?: number
      line_total_subunits?: number | null
      sort_order?: number
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "invoice_items_invoice_id_fkey"
        columns: ["invoice_id"]
        isOneToOne: false
        referencedRelation: "clinic_invoices"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "invoice_items_procedure_id_fkey"
        columns: ["procedure_id"]
        isOneToOne: false
        referencedRelation: "clinic_procedures"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "invoice_items_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "master_tenants"
        referencedColumns: ["id"]
      }
    ]
  }
  invoice_payments: {
    Row: {
      id: string
      tenant_id: string
      invoice_id: string
      amount_subunits: number
      payment_method: string
      payment_reference: string | null
      transaction_id: string | null
      notes: string | null
      collected_by: string | null
      payment_date: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      tenant_id: string
      invoice_id: string
      amount_subunits: number
      payment_method?: string
      payment_reference?: string | null
      transaction_id?: string | null
      notes?: string | null
      collected_by?: string | null
      payment_date?: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      tenant_id?: string
      invoice_id?: string
      amount_subunits?: number
      payment_method?: string
      payment_reference?: string | null
      transaction_id?: string | null
      notes?: string | null
      collected_by?: string | null
      payment_date?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "invoice_payments_collected_by_fkey"
        columns: ["collected_by"]
        isOneToOne: false
        referencedRelation: "clinic_users"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "invoice_payments_invoice_id_fkey"
        columns: ["invoice_id"]
        isOneToOne: false
        referencedRelation: "clinic_invoices"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "invoice_payments_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "master_tenants"
        referencedColumns: ["id"]
      }
    ]
} 
      inventory_ledger: {
        Row: {
          id: string
          tenant_id: string
          procedure_id: string | null
          material_name: string
          quantity_consumed: number
          consumption_type: string
          logged_by: string | null
          session_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          procedure_id?: string | null
          material_name: string
          quantity_consumed: number
          consumption_type: string
          logged_by?: string | null
          session_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          procedure_id?: string | null
          material_name?: string
          quantity_consumed?: number
          consumption_type?: string
          logged_by?: string | null
          session_id?: string | null
          notes?: string | null
          created_at?: string
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
          id: string
          tenant_id: string
          patient_id: string | null
          doctor_id: string | null
          room_id: string | null
          procedure_id: string | null
          inquiry_id: string | null
          scheduled_start: string
          scheduled_end: string
          buffer_end: string
          event_type: string
          visit_type: string | null
          status: string | null
          cancellation_reason: string | null
          reminder_sent_24h: boolean | null
          reminder_sent_2h: boolean | null
          booking_notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          patient_id?: string | null
          doctor_id?: string | null
          room_id?: string | null
          procedure_id?: string | null
          inquiry_id?: string | null
          scheduled_start: string
          scheduled_end: string
          buffer_end: string
          event_type: string
          visit_type?: string | null
          status?: string | null
          cancellation_reason?: string | null
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          booking_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          patient_id?: string | null
          doctor_id?: string | null
          room_id?: string | null
          procedure_id?: string | null
          inquiry_id?: string | null
          scheduled_start?: string
          scheduled_end?: string
          buffer_end?: string
          event_type?: string
          visit_type?: string | null
          status?: string | null
          cancellation_reason?: string | null
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          booking_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
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
          id: string
          clinic_name: string
          clinic_name_ar: string | null
          license_key: string
          subscription_tier: string
          max_devices: number
          subscription_start: string | null
          subscription_end: string | null
          trial_started_at: string | null
          timezone: string
          currency: string
          currency_subunit: number
          logo_url: string | null
          primary_color: string | null
          primary_phone: string | null
          whatsapp_number: string | null
          address: string | null
          country_code: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_name: string
          clinic_name_ar?: string | null
          license_key: string
          subscription_tier?: string
          max_devices?: number
          subscription_start?: string | null
          subscription_end?: string | null
          trial_started_at?: string | null
          timezone?: string
          currency?: string
          currency_subunit?: number
          logo_url?: string | null
          primary_color?: string | null
          primary_phone?: string | null
          whatsapp_number?: string | null
          address?: string | null
          country_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_name?: string
          clinic_name_ar?: string | null
          license_key?: string
          subscription_tier?: string
          max_devices?: number
          subscription_start?: string | null
          subscription_end?: string | null
          trial_started_at?: string | null
          timezone?: string
          currency?: string
          currency_subunit?: number
          logo_url?: string | null
          primary_color?: string | null
          primary_phone?: string | null
          whatsapp_number?: string | null
          address?: string | null
          country_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          id: string
          tenant_id: string
          recipient_type: string
          recipient_id: string | null
          recipient_phone: string | null
          recipient_email: string | null
          channel: string
          message_body: string
          priority: number | null
          status: string | null
          retry_count: number | null
          max_retries: number | null
          scheduled_at: string | null
          sent_at: string | null
          error_message: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          recipient_type: string
          recipient_id?: string | null
          recipient_phone?: string | null
          recipient_email?: string | null
          channel: string
          message_body: string
          priority?: number | null
          status?: string | null
          retry_count?: number | null
          max_retries?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          recipient_type?: string
          recipient_id?: string | null
          recipient_phone?: string | null
          recipient_email?: string | null
          channel?: string
          message_body?: string
          priority?: number | null
          status?: string | null
          retry_count?: number | null
          max_retries?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
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
          id: string
          tenant_id: string
          patient_id: string
          total_visits: number | null
          total_completed_visits: number | null
          total_no_shows: number | null
          total_cancellations: number | null
          total_revenue_subunits: number | null
          last_visit_date: string | null
          next_scheduled_visit: string | null
          loyalty_tier: string | null
          last_calculated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          patient_id: string
          total_visits?: number | null
          total_completed_visits?: number | null
          total_no_shows?: number | null
          total_cancellations?: number | null
          total_revenue_subunits?: number | null
          last_visit_date?: string | null
          next_scheduled_visit?: string | null
          loyalty_tier?: string | null
          last_calculated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          patient_id?: string
          total_visits?: number | null
          total_completed_visits?: number | null
          total_no_shows?: number | null
          total_cancellations?: number | null
          total_revenue_subunits?: number | null
          last_visit_date?: string | null
          next_scheduled_visit?: string | null
          loyalty_tier?: string | null
          last_calculated_at?: string | null
          created_at?: string
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
          id: string
          permission_key: string
          permission_name: string
          description: string | null
          resource: string
          action: string
          created_at: string | null
        }
        Insert: {
          id?: string
          permission_key: string
          permission_name: string
          description?: string | null
          resource: string
          action: string
          created_at?: string | null
        }
        Update: {
          id?: string
          permission_key?: string
          permission_name?: string
          description?: string | null
          resource?: string
          action?: string
          created_at?: string | null
        }
        Relationships: []
      }
      retention_followups: {
        Row: {
          id: string
          tenant_id: string
          patient_id: string
          session_id: string | null
          scheduled_for: string
          followup_type: string
          channel: string | null
          message_body: string | null
          delivery_status: string | null
          sent_at: string | null
          delivered_at: string | null
          response_received: boolean | null
          sent_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          patient_id: string
          session_id?: string | null
          scheduled_for: string
          followup_type: string
          channel?: string | null
          message_body?: string | null
          delivery_status?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          response_received?: boolean | null
          sent_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          patient_id?: string
          session_id?: string | null
          scheduled_for?: string
          followup_type?: string
          channel?: string | null
          message_body?: string | null
          delivery_status?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          response_received?: boolean | null
          sent_by?: string | null
          created_at?: string
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
          id: string
          role_id: string
          permission_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string | null
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
          id: string
          role_key: string
          role_name: string
          role_name_ar: string | null
          description: string | null
          is_system_role: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          role_key: string
          role_name: string
          role_name_ar?: string | null
          description?: string | null
          is_system_role?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          role_key?: string
          role_name?: string
          role_name_ar?: string | null
          description?: string | null
          is_system_role?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          id: string
          subscription_id: string
          tenant_id: string
          event_type: string
          previous_status: string | null
          new_status: string | null
          previous_plan_id: string | null
          new_plan_id: string | null
          triggered_by: string | null
          reason: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          subscription_id: string
          tenant_id: string
          event_type: string
          previous_status?: string | null
          new_status?: string | null
          previous_plan_id?: string | null
          new_plan_id?: string | null
          triggered_by?: string | null
          reason?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          subscription_id?: string
          tenant_id?: string
          event_type?: string
          previous_status?: string | null
          new_status?: string | null
          previous_plan_id?: string | null
          new_plan_id?: string | null
          triggered_by?: string | null
          reason?: string | null
          metadata?: Json | null
          created_at?: string | null
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
          id: string
          plan_key: string
          plan_name: string
          plan_name_ar: string | null
          max_users: number
          max_devices: number
          max_branches: number
          modules: Json | null
          ai_limits: Json | null
          storage_gb: number | null
          api_rate_limit: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          plan_key: string
          plan_name: string
          plan_name_ar?: string | null
          max_users?: number
          max_devices?: number
          max_branches?: number
          modules?: Json | null
          ai_limits?: Json | null
          storage_gb?: number | null
          api_rate_limit?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          plan_key?: string
          plan_name?: string
          plan_name_ar?: string | null
          max_users?: number
          max_devices?: number
          max_branches?: number
          modules?: Json | null
          ai_limits?: Json | null
          storage_gb?: number | null
          api_rate_limit?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: string
          status: string
          billing_cycle: string | null
          started_at: string | null
          ends_at: string | null
          trial_ends_at: string | null
          cancelled_at: string | null
          auto_renew: boolean | null
          payment_method: string | null
          discount_code: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id: string
          status?: string
          billing_cycle?: string | null
          started_at?: string | null
          ends_at?: string | null
          trial_ends_at?: string | null
          cancelled_at?: string | null
          auto_renew?: boolean | null
          payment_method?: string | null
          discount_code?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: string
          status?: string
          billing_cycle?: string | null
          started_at?: string | null
          ends_at?: string | null
          trial_ends_at?: string | null
          cancelled_at?: string | null
          auto_renew?: boolean | null
          payment_method?: string | null
          discount_code?: string | null
          metadata?: Json | null
          created_at?: string | null
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
          id: string
          tenant_id: string
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          os_info: string | null
          browser_info: string | null
          is_active: boolean | null
          last_seen_at: string | null
          registered_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          os_info?: string | null
          browser_info?: string | null
          is_active?: boolean | null
          last_seen_at?: string | null
          registered_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          os_info?: string | null
          browser_info?: string | null
          is_active?: boolean | null
          last_seen_at?: string | null
          registered_at?: string
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
          id: string
          clinic_name: string
          clinic_name_ar: string | null
          license_key: string
          timezone: string | null
          currency: string | null
          currency_subunit: number | null
          logo_url: string | null
          primary_color: string | null
          primary_phone: string | null
          whatsapp_number: string | null
          address: string | null
          country_code: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_name: string
          clinic_name_ar?: string | null
          license_key: string
          timezone?: string | null
          currency?: string | null
          currency_subunit?: number | null
          logo_url?: string | null
          primary_color?: string | null
          primary_phone?: string | null
          whatsapp_number?: string | null
          address?: string | null
          country_code?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_name?: string
          clinic_name_ar?: string | null
          license_key?: string
          timezone?: string | null
          currency?: string | null
          currency_subunit?: number | null
          logo_url?: string | null
          primary_color?: string | null
          primary_phone?: string | null
          whatsapp_number?: string | null
          address?: string | null
          country_code?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          auth_user_id: string | null
          full_name: string
          full_name_ar: string | null
          role_id: string
          email: string | null
          phone: string | null
          employee_code: string | null
          pin_code: string | null
          specialization: string | null
          avatar_url: string | null
          is_active: boolean | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          auth_user_id?: string | null
          full_name: string
          full_name_ar?: string | null
          role_id: string
          email?: string | null
          phone?: string | null
          employee_code?: string | null
          pin_code?: string | null
          specialization?: string | null
          avatar_url?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          auth_user_id?: string | null
          full_name?: string
          full_name_ar?: string | null
          role_id?: string
          email?: string | null
          phone?: string | null
          employee_code?: string | null
          pin_code?: string | null
          specialization?: string | null
          avatar_url?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
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
      can_edit_invoice: {
        Args: {
          p_invoice_id: string
        }
        Returns: boolean
      }
      cancel_invoice: {
        Args: {
          p_invoice_id: string
          p_reason: string
        }
        Returns: Json
      }
      create_invoice_from_session: {
        Args: {
          p_session_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
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
      generate_invoice_number: {
        Args: {
          p_tenant_id: string
        }
        Returns: string
      }
      get_current_tenant_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      issue_invoice: {
        Args: {
          p_invoice_id: string
        }
        Returns: Json
      }
      recalculate_invoice_totals: {
        Args: {
          p_invoice_id: string
        }
        Returns: Json
      }
      record_invoice_payment: {
        Args: {
          p_invoice_id: string
          p_amount_subunits: number
          p_payment_method: string
          p_reference_number?: string
          p_notes?: string
        }
        Returns: Json
      }
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

type DatabaseWithoutInternals = Omit<Database, "public">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">]

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
