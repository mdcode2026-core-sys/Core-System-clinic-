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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      branches: {
        Row: {
          address: string | null
          branch_name: string
          branch_name_ar: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          is_default: boolean
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_name: string
          branch_name_ar?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_name?: string
          branch_name_ar?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          is_core: boolean
          key: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          is_core?: boolean
          key: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          is_core?: boolean
          key?: string
        }
        Relationships: []
      }
      clinic_inquiries: {
        Row: {
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_cdi_inquiry_handler_same_tenant"
            columns: ["tenant_id", "handled_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_inquiry_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinic_invoices: {
        Row: {
          amount_due_subunits: number | null
          amount_paid_subunits: number
          collected_by: string | null
          created_at: string
          deleted_at: string | null
          discount_approved_by: string | null
          discount_reason: string | null
          discount_subunits: number
          id: string
          invoice_date: string
          invoice_number: string | null
          invoice_status: string | null
          issued_at: string | null
          notes: string | null
          patient_id: string
          payment_method: string | null
          payment_terms: string
          session_id: string | null
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
          deleted_at?: string | null
          discount_approved_by?: string | null
          discount_reason?: string | null
          discount_subunits?: number
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          invoice_status?: string | null
          issued_at?: string | null
          notes?: string | null
          patient_id: string
          payment_method?: string | null
          payment_terms?: string
          session_id?: string | null
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
          deleted_at?: string | null
          discount_approved_by?: string | null
          discount_reason?: string | null
          discount_subunits?: number
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          invoice_status?: string | null
          issued_at?: string | null
          notes?: string | null
          patient_id?: string
          payment_method?: string | null
          payment_terms?: string
          session_id?: string | null
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
          {
            foreignKeyName: "fk_invoice_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_invoice_session_same_tenant"
            columns: ["tenant_id", "session_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinic_offers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          ends_on: string | null
          id: string
          name: string
          package_id: string | null
          service_id: string | null
          starts_on: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          ends_on?: string | null
          id?: string
          name: string
          package_id?: string | null
          service_id?: string | null
          starts_on?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_on?: string | null
          id?: string
          name?: string
          package_id?: string | null
          service_id?: string | null
          starts_on?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_offers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_offers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_offers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cdi_offer_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_offer_package_same_tenant"
            columns: ["tenant_id", "package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_offer_service_same_tenant"
            columns: ["tenant_id", "service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinic_package_items: {
        Row: {
          created_at: string
          id: string
          package_id: string
          quantity: number
          service_id: string
          session_limit: number | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          quantity?: number
          service_id: string
          session_limit?: number | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          quantity?: number
          service_id?: string
          session_limit?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_package_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_package_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cdi_package_item_package_same_tenant"
            columns: ["tenant_id", "package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_package_item_service_same_tenant"
            columns: ["tenant_id", "service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinic_packages: {
        Row: {
          base_price_subunits: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          session_limit: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_price_subunits?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          session_limit?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_price_subunits?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          session_limit?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_patients: {
        Row: {
          age_at_registration: number | null
          age_reference_date: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          family_name: string | null
          father_name: string | null
          file_number: string | null
          first_name: string
          first_name_ar: string | null
          first_visit_date: string | null
          gender: string | null
          id: string
          last_name: string
          last_name_ar: string | null
          mother_name: string | null
          national_id: string | null
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
          age_at_registration?: number | null
          age_reference_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          family_name?: string | null
          father_name?: string | null
          file_number?: string | null
          first_name: string
          first_name_ar?: string | null
          first_visit_date?: string | null
          gender?: string | null
          id?: string
          last_name: string
          last_name_ar?: string | null
          mother_name?: string | null
          national_id?: string | null
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
          age_at_registration?: number | null
          age_reference_date?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          family_name?: string | null
          father_name?: string | null
          file_number?: string | null
          first_name?: string
          first_name_ar?: string | null
          first_visit_date?: string | null
          gender?: string | null
          id?: string
          last_name?: string
          last_name_ar?: string | null
          mother_name?: string | null
          national_id?: string | null
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
          deleted_at: string | null
          display_order: number | null
          id: string
          is_active: boolean
          procedure_code: string | null
          procedure_name: string
          procedure_name_ar: string | null
          provider_type: string | null
          service_type: string | null
          specialty: string | null
          standard_duration_minutes: number
          tax_included: boolean
          tax_rate_percent: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_price_subunits?: number
          buffer_time_minutes?: number
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          procedure_code?: string | null
          procedure_name: string
          procedure_name_ar?: string | null
          provider_type?: string | null
          service_type?: string | null
          specialty?: string | null
          standard_duration_minutes?: number
          tax_included?: boolean
          tax_rate_percent?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_price_subunits?: number
          buffer_time_minutes?: number
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          procedure_code?: string | null
          procedure_name?: string
          procedure_name_ar?: string | null
          provider_type?: string | null
          service_type?: string | null
          specialty?: string | null
          standard_duration_minutes?: number
          tax_included?: boolean
          tax_rate_percent?: number
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
      clinic_provider_availability: {
        Row: {
          created_at: string
          day_of_week: number
          deleted_at: string | null
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          tenant_id: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: number
          deleted_at?: string | null
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          tenant_id: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number
          deleted_at?: string | null
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          tenant_id?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_provider_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_provider_availability_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_resources: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          resource_name: string
          resource_type: string
          serial_number: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          resource_name: string
          resource_type: string
          serial_number?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          resource_name?: string
          resource_type?: string
          serial_number?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_resources_tenant_id_fkey"
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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      clinic_service_procedures: {
        Row: {
          created_at: string
          id: string
          procedure_id: string
          quantity: number
          service_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          procedure_id: string
          quantity?: number
          service_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          procedure_id?: string
          quantity?: number
          service_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_service_procedures_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_service_procedures_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_service_procedures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          base_price_subunits: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          standard_duration_minutes: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_price_subunits?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          standard_duration_minutes?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_price_subunits?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          standard_duration_minutes?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_treatment_plan_items: {
        Row: {
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          notes: string | null
          planned_date: string | null
          procedure_id: string | null
          quantity: number
          sequence_no: number
          status: string
          tenant_id: string
          title: string
          treatment_plan_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          procedure_id?: string | null
          quantity?: number
          sequence_no?: number
          status?: string
          tenant_id: string
          title: string
          treatment_plan_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          procedure_id?: string | null
          quantity?: number
          sequence_no?: number
          status?: string
          tenant_id?: string
          title?: string
          treatment_plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_treatment_plan_items_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plan_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plan_items_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_treatment_plan_visits: {
        Row: {
          deleted_at: string | null
          id: string
          linked_at: string
          linked_by: string
          tenant_id: string
          treatment_plan_id: string
          treatment_plan_item_id: string | null
          visit_id: string
        }
        Insert: {
          deleted_at?: string | null
          id?: string
          linked_at?: string
          linked_by: string
          tenant_id: string
          treatment_plan_id: string
          treatment_plan_item_id?: string | null
          visit_id: string
        }
        Update: {
          deleted_at?: string | null
          id?: string
          linked_at?: string
          linked_by?: string
          tenant_id?: string
          treatment_plan_id?: string
          treatment_plan_item_id?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_treatment_plan_visits_linked_by_fkey"
            columns: ["linked_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plan_visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plan_visits_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plan_visits_treatment_plan_item_id_fkey"
            columns: ["treatment_plan_item_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plan_visits_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_visit_item_same_tenant"
            columns: ["tenant_id", "treatment_plan_item_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plan_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_visit_linked_by_same_tenant"
            columns: ["tenant_id", "linked_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_visit_plan_same_tenant"
            columns: ["tenant_id", "treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plans"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_visit_visit_same_tenant"
            columns: ["tenant_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinic_treatment_plans: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          diagnosis_summary: string | null
          goals: string | null
          id: string
          package_id: string | null
          patient_id: string
          source_visit_id: string | null
          start_date: string | null
          status: string
          target_end_date: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          diagnosis_summary?: string | null
          goals?: string | null
          id?: string
          package_id?: string | null
          patient_id: string
          source_visit_id?: string | null
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          diagnosis_summary?: string | null
          goals?: string | null
          id?: string
          package_id?: string | null
          patient_id?: string
          source_visit_id?: string | null
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_treatment_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plans_source_visit_id_fkey"
            columns: ["source_visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_treatment_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_creator_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_package_same_tenant"
            columns: ["tenant_id", "package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_treatment_plan_source_visit_same_tenant"
            columns: ["tenant_id", "source_visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinic_user_permission_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          granted: boolean
          id: string
          permission_id: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          granted: boolean
          id?: string
          permission_id: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          granted?: boolean
          id?: string
          permission_id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_user_permission_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_permission_overrides_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_permission_overrides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_permission_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_user_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          granted: boolean
          id: string
          permission_id: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          granted?: boolean
          id?: string
          permission_id: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          granted?: boolean
          id?: string
          permission_id?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_user_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_user_settings: {
        Row: {
          created_at: string
          date_format: string | null
          default_workspace: string | null
          deleted_at: string | null
          id: string
          locale: string | null
          preferences: Json
          sidebar_collapsed: boolean
          tenant_id: string
          time_format: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_format?: string | null
          default_workspace?: string | null
          deleted_at?: string | null
          id?: string
          locale?: string | null
          preferences?: Json
          sidebar_collapsed?: boolean
          tenant_id: string
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_format?: string | null
          default_workspace?: string | null
          deleted_at?: string | null
          id?: string
          locale?: string | null
          preferences?: Json
          sidebar_collapsed?: boolean
          tenant_id?: string
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_user_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_user_workspaces: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_default: boolean
          tenant_id: string
          user_id: string
          workspace: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          tenant_id: string
          user_id: string
          workspace: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          tenant_id?: string
          user_id?: string
          workspace?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_user_workspaces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_user_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_users: {
        Row: {
          account_status: string
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
          pending_email: string | null
          phone: string | null
          pin_code: string
          role: string
          role_id: string
          role_template_id: string | null
          specialization: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          account_status?: string
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
          pending_email?: string | null
          phone?: string | null
          pin_code: string
          role: string
          role_id: string
          role_template_id?: string | null
          specialization?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          account_status?: string
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
          pending_email?: string | null
          phone?: string | null
          pin_code?: string
          role?: string
          role_id?: string
          role_template_id?: string | null
          specialization?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_users_role_template_id_fkey"
            columns: ["role_template_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_visit_procedures: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          performed_at: string | null
          procedure_id: string
          quantity: number
          tenant_id: string
          updated_at: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          performed_at?: string | null
          procedure_id: string
          quantity?: number
          tenant_id: string
          updated_at?: string
          visit_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          performed_at?: string | null
          procedure_id?: string
          quantity?: number
          tenant_id?: string
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_visit_procedures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_procedures_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_procedures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_visit_procedures_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
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
          decision: Json | null
          deleted_at: string | null
          diagnosis: string | null
          doctor_id: string
          doctor_notes: string | null
          examination: Json | null
          findings: Json | null
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
          decision?: Json | null
          deleted_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          doctor_notes?: string | null
          examination?: Json | null
          findings?: Json | null
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
          decision?: Json | null
          deleted_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          examination?: Json | null
          findings?: Json | null
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
          {
            foreignKeyName: "fk_cdi_visit_agenda_same_tenant"
            columns: ["tenant_id", "agenda_event_id"]
            isOneToOne: false
            referencedRelation: "master_agenda_events"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_visit_doctor_same_tenant"
            columns: ["tenant_id", "doctor_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_visit_initialized_by_same_tenant"
            columns: ["tenant_id", "initialized_by_receptionist"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_visit_lock_holder_same_tenant"
            columns: ["tenant_id", "lock_holder_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_visit_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_visit_room_same_tenant"
            columns: ["tenant_id", "room_id"]
            isOneToOne: false
            referencedRelation: "clinic_rooms"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      clinical_work_sessions: {
        Row: {
          clinical_provider_id: string | null
          created_at: string
          ended_at: string | null
          hold_reason: string | null
          id: string
          outcome: string | null
          performed_by_clinic_user_id: string
          room_id: string | null
          sequence_no: number
          started_at: string | null
          status: string
          tenant_id: string
          transfer_reason: string | null
          updated_at: string
          version: number
          visit_id: string
        }
        Insert: {
          clinical_provider_id?: string | null
          created_at?: string
          ended_at?: string | null
          hold_reason?: string | null
          id?: string
          outcome?: string | null
          performed_by_clinic_user_id: string
          room_id?: string | null
          sequence_no: number
          started_at?: string | null
          status?: string
          tenant_id: string
          transfer_reason?: string | null
          updated_at?: string
          version?: number
          visit_id: string
        }
        Update: {
          clinical_provider_id?: string | null
          created_at?: string
          ended_at?: string | null
          hold_reason?: string | null
          id?: string
          outcome?: string | null
          performed_by_clinic_user_id?: string
          room_id?: string | null
          sequence_no?: number
          started_at?: string | null
          status?: string
          tenant_id?: string
          transfer_reason?: string | null
          updated_at?: string
          version?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_work_sessions_actor_same_tenant_fk"
            columns: ["tenant_id", "performed_by_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "clinical_work_sessions_provider_same_tenant_fk"
            columns: ["tenant_id", "clinical_provider_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "clinical_work_sessions_room_same_tenant_fk"
            columns: ["tenant_id", "room_id"]
            isOneToOne: false
            referencedRelation: "clinic_rooms"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "clinical_work_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_work_sessions_visit_same_tenant_fk"
            columns: ["tenant_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      communication_conversation_participants: {
        Row: {
          clinic_user_id: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tenant_id: string
        }
        Insert: {
          clinic_user_id: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
          tenant_id: string
        }
        Update: {
          clinic_user_id?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_conversation_parti_tenant_id_conversation_id_fkey"
            columns: ["tenant_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "communication_conversations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_conversation_partic_tenant_id_clinic_user_id_fkey"
            columns: ["tenant_id", "clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_conversation_participants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_conversations: {
        Row: {
          clinic_patient_id: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: string
          status: string
          subject: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          clinic_patient_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          status?: string
          subject?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          clinic_patient_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          status?: string
          subject?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_conversations_clinic_patient_id_fkey"
            columns: ["clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_conversations_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_conversations_patient_same_tenant_fk"
            columns: ["tenant_id", "clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_message_attachments: {
        Row: {
          byte_size: number
          created_at: string
          file_name: string
          id: string
          message_id: string
          mime_type: string
          storage_bucket: string
          storage_path: string
          tenant_id: string
          uploaded_by_clinic_user_id: string | null
          uploaded_by_patient_identity_id: string | null
        }
        Insert: {
          byte_size: number
          created_at?: string
          file_name: string
          id?: string
          message_id: string
          mime_type: string
          storage_bucket?: string
          storage_path: string
          tenant_id: string
          uploaded_by_clinic_user_id?: string | null
          uploaded_by_patient_identity_id?: string | null
        }
        Update: {
          byte_size?: number
          created_at?: string
          file_name?: string
          id?: string
          message_id?: string
          mime_type?: string
          storage_bucket?: string
          storage_path?: string
          tenant_id?: string
          uploaded_by_clinic_user_id?: string | null
          uploaded_by_patient_identity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_message_attachm_tenant_id_uploaded_by_clinic_fkey"
            columns: ["tenant_id", "uploaded_by_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_message_attachm_uploaded_by_patient_identity_fkey"
            columns: ["uploaded_by_patient_identity_id"]
            isOneToOne: false
            referencedRelation: "patient_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_message_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_message_attachments_tenant_id_message_id_fkey"
            columns: ["tenant_id", "message_id"]
            isOneToOne: false
            referencedRelation: "communication_messages"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      communication_message_reads: {
        Row: {
          clinic_user_id: string
          message_id: string
          read_at: string
          tenant_id: string
        }
        Insert: {
          clinic_user_id: string
          message_id: string
          read_at?: string
          tenant_id: string
        }
        Update: {
          clinic_user_id?: string
          message_id?: string
          read_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_message_reads_clinic_user_id_fkey"
            columns: ["clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "communication_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_message_reads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          legacy_portal_message_id: string | null
          message_kind: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          sender_clinic_user_id: string | null
          sender_patient_identity_id: string | null
          sender_type: string
          tenant_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          legacy_portal_message_id?: string | null
          message_kind?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          sender_clinic_user_id?: string | null
          sender_patient_identity_id?: string | null
          sender_type?: string
          tenant_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          legacy_portal_message_id?: string | null
          message_kind?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          sender_clinic_user_id?: string | null
          sender_patient_identity_id?: string | null
          sender_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_messages_sender_patient_identity_id_fkey"
            columns: ["sender_patient_identity_id"]
            isOneToOne: false
            referencedRelation: "patient_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_messages_tenant_id_conversation_id_fkey"
            columns: ["tenant_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "communication_conversations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_messages_tenant_id_sender_clinic_user_id_fkey"
            columns: ["tenant_id", "sender_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      communication_requests: {
        Row: {
          assignee_clinic_user_id: string | null
          category: string
          clinic_patient_id: string | null
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          details: string | null
          due_at: string | null
          id: string
          outcome: string | null
          priority: string
          related_id: string | null
          related_type: string | null
          requester_clinic_user_id: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
          work_item_id: string | null
        }
        Insert: {
          assignee_clinic_user_id?: string | null
          category?: string
          clinic_patient_id?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          details?: string | null
          due_at?: string | null
          id?: string
          outcome?: string | null
          priority?: string
          related_id?: string | null
          related_type?: string | null
          requester_clinic_user_id: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          work_item_id?: string | null
        }
        Update: {
          assignee_clinic_user_id?: string | null
          category?: string
          clinic_patient_id?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          details?: string | null
          due_at?: string | null
          id?: string
          outcome?: string | null
          priority?: string
          related_id?: string | null
          related_type?: string | null
          requester_clinic_user_id?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_requests_clinic_patient_id_fkey"
            columns: ["clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_requests_patient_same_tenant_fk"
            columns: ["tenant_id", "clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_requests_tenant_id_assignee_clinic_user_id_fkey"
            columns: ["tenant_id", "assignee_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_requests_tenant_id_conversation_id_fkey"
            columns: ["tenant_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "communication_conversations"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_requests_tenant_id_requester_clinic_user_id_fkey"
            columns: ["tenant_id", "requester_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "communication_requests_work_item_same_tenant_fk"
            columns: ["tenant_id", "work_item_id"]
            isOneToOne: false
            referencedRelation: "operational_work_items"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          is_active: boolean
          locale: string
          name: string
          subject: string | null
          tenant_id: string
          updated_at: string
          variables: Json
          version: number
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          is_active?: boolean
          locale?: string
          name: string
          subject?: string | null
          tenant_id: string
          updated_at?: string
          variables?: Json
          version?: number
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          locale?: string
          name?: string
          subject?: string | null
          tenant_id?: string
          updated_at?: string
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlement_capabilities: {
        Row: {
          capability_key: string
          created_at: string
          deleted_at: string | null
          entitlement_key: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          deleted_at?: string | null
          entitlement_key: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          deleted_at?: string | null
          entitlement_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlement_capabilities_capability_key_fkey"
            columns: ["capability_key"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "entitlement_capabilities_entitlement_key_fkey"
            columns: ["entitlement_key"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["key"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          entitlement_type: string
          key: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          entitlement_type?: string
          key: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          entitlement_type?: string
          key?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          allowed_tiers: string[] | null
          config_json: Json | null
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      financial_installments: {
        Row: {
          amount_paid_subunits: number
          amount_subunits: number
          created_at: string
          deleted_at: string | null
          due_date: string
          financial_plan_id: string
          id: string
          installment_no: number
          invoice_id: string | null
          notes: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_paid_subunits?: number
          amount_subunits: number
          created_at?: string
          deleted_at?: string | null
          due_date: string
          financial_plan_id: string
          id?: string
          installment_no: number
          invoice_id?: string | null
          notes?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_paid_subunits?: number
          amount_subunits?: number
          created_at?: string
          deleted_at?: string | null
          due_date?: string
          financial_plan_id?: string
          id?: string
          installment_no?: number
          invoice_id?: string | null
          notes?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_installments_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_installments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "clinic_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_installments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_installment_plan_same_tenant"
            columns: ["tenant_id", "financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      financial_plans: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          deleted_at: string | null
          id: string
          insurance_covered_subunits: number
          notes: string | null
          package_id: string | null
          patient_id: string
          patient_responsibility_subunits: number
          status: string
          tenant_id: string
          total_amount_subunits: number
          treatment_plan_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          id?: string
          insurance_covered_subunits?: number
          notes?: string | null
          package_id?: string | null
          patient_id: string
          patient_responsibility_subunits?: number
          status?: string
          tenant_id: string
          total_amount_subunits?: number
          treatment_plan_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          id?: string
          insurance_covered_subunits?: number
          notes?: string | null
          package_id?: string | null
          patient_id?: string
          patient_responsibility_subunits?: number
          status?: string
          tenant_id?: string
          total_amount_subunits?: number
          treatment_plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_plans_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cdi_financial_plan_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_financial_plan_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_financial_plan_treatment_same_tenant"
            columns: ["tenant_id", "treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plans"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      followup_automation_rules: {
        Row: {
          action_type: string
          channel: string | null
          created_at: string
          delay_minutes: number
          deleted_at: string | null
          followup_type: string
          id: string
          is_enabled: boolean
          message_template: string | null
          priority: number
          rule_key: string
          rule_name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          channel?: string | null
          created_at?: string
          delay_minutes: number
          deleted_at?: string | null
          followup_type: string
          id?: string
          is_enabled?: boolean
          message_template?: string | null
          priority?: number
          rule_key: string
          rule_name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          channel?: string | null
          created_at?: string
          delay_minutes?: number
          deleted_at?: string | null
          followup_type?: string
          id?: string
          is_enabled?: boolean
          message_template?: string | null
          priority?: number
          rule_key?: string
          rule_name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_automation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          amount_claimed_subunits: number
          amount_reconciled_subunits: number
          claim_reference: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          insurance_profile_id: string
          invoice_id: string | null
          notes: string | null
          patient_id: string
          prepared_at: string | null
          reconciled_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_claimed_subunits?: number
          amount_reconciled_subunits?: number
          claim_reference?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          insurance_profile_id: string
          invoice_id?: string | null
          notes?: string | null
          patient_id: string
          prepared_at?: string | null
          reconciled_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_claimed_subunits?: number
          amount_reconciled_subunits?: number
          claim_reference?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          insurance_profile_id?: string
          invoice_id?: string | null
          notes?: string | null
          patient_id?: string
          prepared_at?: string | null
          reconciled_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_insurance_claim_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_insurance_claim_invoice_same_tenant"
            columns: ["tenant_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "clinic_invoices"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_insurance_claim_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_insurance_claim_profile_same_tenant"
            columns: ["tenant_id", "insurance_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance_profiles"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "insurance_claims_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_insurance_profile_id_fkey"
            columns: ["insurance_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "clinic_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_contracts: {
        Row: {
          claim_method: string | null
          claim_requirements: string | null
          contract_number: string
          coverage_rules: string | null
          created_at: string
          created_by: string | null
          default_coverage_percent: number | null
          deleted_at: string | null
          ends_on: string | null
          id: string
          notes: string | null
          patient_responsibility_percent: number | null
          provider_id: string
          starts_on: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          claim_method?: string | null
          claim_requirements?: string | null
          contract_number: string
          coverage_rules?: string | null
          created_at?: string
          created_by?: string | null
          default_coverage_percent?: number | null
          deleted_at?: string | null
          ends_on?: string | null
          id?: string
          notes?: string | null
          patient_responsibility_percent?: number | null
          provider_id: string
          starts_on: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          claim_method?: string | null
          claim_requirements?: string | null
          contract_number?: string
          coverage_rules?: string | null
          created_at?: string
          created_by?: string | null
          default_coverage_percent?: number | null
          deleted_at?: string | null
          ends_on?: string | null
          id?: string
          notes?: string | null
          patient_responsibility_percent?: number | null
          provider_id?: string
          starts_on?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_contracts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "insurance_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_providers: {
        Row: {
          address: string | null
          contact_name: string | null
          contract_code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          name_ar: string | null
          notes: string | null
          phone: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          contract_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          name_ar?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          contract_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          is_operating_consumable: boolean
          is_procedure_material: boolean
          manufacturer: string | null
          name: string
          name_ar: string | null
          purchase_cost_subunits: number | null
          reorder_threshold: number
          requires_batch_tracking: boolean
          requires_expiry_tracking: boolean
          selling_price_subunits: number | null
          sku: string | null
          tenant_id: string
          unit: string
          updated_at: string
          valuation_cost_subunits: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_operating_consumable?: boolean
          is_procedure_material?: boolean
          manufacturer?: string | null
          name: string
          name_ar?: string | null
          purchase_cost_subunits?: number | null
          reorder_threshold?: number
          requires_batch_tracking?: boolean
          requires_expiry_tracking?: boolean
          selling_price_subunits?: number | null
          sku?: string | null
          tenant_id: string
          unit?: string
          updated_at?: string
          valuation_cost_subunits?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_operating_consumable?: boolean
          is_procedure_material?: boolean
          manufacturer?: string | null
          name?: string
          name_ar?: string | null
          purchase_cost_subunits?: number | null
          reorder_threshold?: number
          requires_batch_tracking?: boolean
          requires_expiry_tracking?: boolean
          selling_price_subunits?: number | null
          sku?: string | null
          tenant_id?: string
          unit?: string
          updated_at?: string
          valuation_cost_subunits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
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
          cost_total_subunits: number | null
          created_at: string
          deleted_at: string | null
          id: string
          item_id: string | null
          logged_by: string | null
          material_name: string
          movement_type: string
          notes: string | null
          procedure_id: string | null
          quantity_consumed: number
          quantity_delta: number
          session_id: string | null
          source_id: string | null
          source_type: string | null
          tenant_id: string
          treatment_plan_item_id: string | null
          unit_cost_subunits: number | null
        }
        Insert: {
          consumption_type: string
          cost_total_subunits?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          item_id?: string | null
          logged_by?: string | null
          material_name: string
          movement_type?: string
          notes?: string | null
          procedure_id?: string | null
          quantity_consumed: number
          quantity_delta?: number
          session_id?: string | null
          source_id?: string | null
          source_type?: string | null
          tenant_id: string
          treatment_plan_item_id?: string | null
          unit_cost_subunits?: number | null
        }
        Update: {
          consumption_type?: string
          cost_total_subunits?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          item_id?: string | null
          logged_by?: string | null
          material_name?: string
          movement_type?: string
          notes?: string | null
          procedure_id?: string | null
          quantity_consumed?: number
          quantity_delta?: number
          session_id?: string | null
          source_id?: string | null
          source_type?: string | null
          tenant_id?: string
          treatment_plan_item_id?: string | null
          unit_cost_subunits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_inventory_ledger_logged_by_same_tenant"
            columns: ["tenant_id", "logged_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_inventory_ledger_procedure_same_tenant"
            columns: ["tenant_id", "procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_inventory_ledger_session_same_tenant"
            columns: ["tenant_id", "session_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_inventory_ledger_item_same_tenant"
            columns: ["tenant_id", "item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "inventory_ledger_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
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
      inventory_lots: {
        Row: {
          created_at: string
          deleted_at: string | null
          expiry_date: string | null
          id: string
          inventory_item_id: string
          lot_number: string
          quantity_on_hand: number
          status: string
          tenant_id: string
          unit_cost_subunits: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_item_id: string
          lot_number: string
          quantity_on_hand?: number
          status?: string
          tenant_id: string
          unit_cost_subunits?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_item_id?: string
          lot_number?: string
          quantity_on_hand?: number
          status?: string
          tenant_id?: string
          unit_cost_subunits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_lot_item_same_tenant"
            columns: ["tenant_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          discount_subunits: number
          id: string
          invoice_id: string
          item_description: string
          item_description_ar: string | null
          line_total_subunits: number | null
          procedure_id: string | null
          quantity: number
          sort_order: number
          tax_rate_percent: number
          tax_subunits: number
          tenant_id: string
          unit_price_subunits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_subunits?: number
          id?: string
          invoice_id: string
          item_description: string
          item_description_ar?: string | null
          line_total_subunits?: number | null
          procedure_id?: string | null
          quantity?: number
          sort_order?: number
          tax_rate_percent?: number
          tax_subunits?: number
          tenant_id: string
          unit_price_subunits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_subunits?: number
          id?: string
          invoice_id?: string
          item_description?: string
          item_description_ar?: string | null
          line_total_subunits?: number | null
          procedure_id?: string | null
          quantity?: number
          sort_order?: number
          tax_rate_percent?: number
          tax_subunits?: number
          tenant_id?: string
          unit_price_subunits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_item_invoice_same_tenant"
            columns: ["tenant_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "clinic_invoices"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_invoice_item_procedure_same_tenant"
            columns: ["tenant_id", "procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["tenant_id", "id"]
          },
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
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount_subunits: number
          collected_by: string | null
          created_at: string
          financial_plan_id: string | null
          id: string
          installment_id: string | null
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_reference: string | null
          tenant_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount_subunits: number
          collected_by?: string | null
          created_at?: string
          financial_plan_id?: string | null
          id?: string
          installment_id?: string | null
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string | null
          tenant_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_subunits?: number
          collected_by?: string | null
          created_at?: string
          financial_plan_id?: string | null
          id?: string
          installment_id?: string | null
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string | null
          tenant_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_invoice_same_tenant"
            columns: ["tenant_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "clinic_invoices"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "invoice_payments_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_financial_plan_fk"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_installment_fk"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "financial_installments"
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
          },
        ]
      }
      invoice_refunds: {
        Row: {
          amount_subunits: number
          created_at: string
          deleted_at: string | null
          id: string
          invoice_id: string
          payment_id: string | null
          reason: string
          reference: string | null
          refund_method: string
          refunded_at: string
          refunded_by: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_subunits: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          invoice_id: string
          payment_id?: string | null
          reason: string
          reference?: string | null
          refund_method: string
          refunded_at?: string
          refunded_by: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_subunits?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          invoice_id?: string
          payment_id?: string | null
          reason?: string
          reference?: string | null
          refund_method?: string
          refunded_at?: string
          refunded_by?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_refund_actor_same_tenant"
            columns: ["tenant_id", "refunded_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_refund_invoice_same_tenant"
            columns: ["tenant_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "clinic_invoices"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_refund_payment_same_tenant"
            columns: ["tenant_id", "payment_id"]
            isOneToOne: false
            referencedRelation: "invoice_payments"
            referencedColumns: ["tenant_id", "id"]
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
          deleted_at: string | null
          doctor_id: string | null
          event_type: string
          id: string
          inquiry_id: string | null
          patient_id: string | null
          procedure_id: string | null
          reminder_sent_24h: boolean | null
          reminder_sent_2h: boolean | null
          resource_id: string | null
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
          deleted_at?: string | null
          doctor_id?: string | null
          event_type: string
          id?: string
          inquiry_id?: string | null
          patient_id?: string | null
          procedure_id?: string | null
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          resource_id?: string | null
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
          deleted_at?: string | null
          doctor_id?: string | null
          event_type?: string
          id?: string
          inquiry_id?: string | null
          patient_id?: string | null
          procedure_id?: string | null
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          resource_id?: string | null
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
            foreignKeyName: "fk_cdi_agenda_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_agenda_doctor_same_tenant"
            columns: ["tenant_id", "doctor_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_agenda_inquiry_same_tenant"
            columns: ["tenant_id", "inquiry_id"]
            isOneToOne: false
            referencedRelation: "clinic_inquiries"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_agenda_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_agenda_procedure_same_tenant"
            columns: ["tenant_id", "procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_agenda_resource_same_tenant"
            columns: ["tenant_id", "resource_id"]
            isOneToOne: false
            referencedRelation: "clinic_resources"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_agenda_room_same_tenant"
            columns: ["tenant_id", "room_id"]
            isOneToOne: false
            referencedRelation: "clinic_rooms"
            referencedColumns: ["tenant_id", "id"]
          },
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
            foreignKeyName: "master_agenda_events_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "clinic_resources"
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
          direction: string
          id: string
          is_active: boolean
          language: string
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
          direction?: string
          id?: string
          is_active?: boolean
          language?: string
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
          direction?: string
          id?: string
          is_active?: boolean
          language?: string
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
      medical_file_ai_results: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          medical_file_id: string
          model: string | null
          provider: string
          result: Json
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          medical_file_id: string
          model?: string | null
          provider: string
          result: Json
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          medical_file_id?: string
          model?: string | null
          provider?: string
          result?: Json
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_file_ai_results_medical_file_id_fkey"
            columns: ["medical_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_ai_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_file_annotations: {
        Row: {
          annotation_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          medical_file_id: string
          payload: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          annotation_type: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          medical_file_id: string
          payload: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          annotation_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          medical_file_id?: string
          payload?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_file_annotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_annotations_medical_file_id_fkey"
            columns: ["medical_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_annotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_file_measurements: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          measurement_type: string
          medical_file_id: string
          payload: Json
          tenant_id: string
          unit: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          measurement_type: string
          medical_file_id: string
          payload?: Json
          tenant_id: string
          unit?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          measurement_type?: string
          medical_file_id?: string
          payload?: Json
          tenant_id?: string
          unit?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_file_measurements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_measurements_medical_file_id_fkey"
            columns: ["medical_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_measurements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_file_storage_locations: {
        Row: {
          checksum_sha256: string | null
          created_at: string
          deleted_at: string | null
          device_id: string | null
          id: string
          last_synced_at: string | null
          last_verified_at: string | null
          medical_file_id: string
          object_path: string
          provider: string
          size_bytes: number
          status: string
          tenant_id: string
        }
        Insert: {
          checksum_sha256?: string | null
          created_at?: string
          deleted_at?: string | null
          device_id?: string | null
          id?: string
          last_synced_at?: string | null
          last_verified_at?: string | null
          medical_file_id: string
          object_path: string
          provider: string
          size_bytes?: number
          status?: string
          tenant_id: string
        }
        Update: {
          checksum_sha256?: string | null
          created_at?: string
          deleted_at?: string | null
          device_id?: string | null
          id?: string
          last_synced_at?: string | null
          last_verified_at?: string | null
          medical_file_id?: string
          object_path?: string
          provider?: string
          size_bytes?: number
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_file_storage_locations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "tenant_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_storage_locations_medical_file_id_fkey"
            columns: ["medical_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_storage_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_file_sync_events: {
        Row: {
          bytes_transferred: number
          completed_at: string | null
          created_at: string
          device_id: string | null
          direction: string
          error_message: string | null
          id: string
          medical_file_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          bytes_transferred?: number
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          direction: string
          error_message?: string | null
          id?: string
          medical_file_id: string
          status: string
          tenant_id: string
        }
        Update: {
          bytes_transferred?: number
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          medical_file_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_file_sync_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "tenant_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_sync_events_medical_file_id_fkey"
            columns: ["medical_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_file_sync_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_files: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          availability: Json
          checksum_sha256: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          extension: string | null
          file_kind: string
          id: string
          metadata: Json
          mime_type: string | null
          original_filename: string
          parent_file_id: string | null
          patient_id: string | null
          size_bytes: number
          storage_path: string | null
          storage_provider: string
          storage_status: string
          tenant_id: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          availability?: Json
          checksum_sha256?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          extension?: string | null
          file_kind?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          original_filename: string
          parent_file_id?: string | null
          patient_id?: string | null
          size_bytes?: number
          storage_path?: string | null
          storage_provider?: string
          storage_status?: string
          tenant_id: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          availability?: Json
          checksum_sha256?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          extension?: string | null
          file_kind?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          original_filename?: string
          parent_file_id?: string | null
          patient_id?: string | null
          size_bytes?: number
          storage_path?: string | null
          storage_provider?: string
          storage_status?: string
          tenant_id?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_medical_file_archived_by_same_tenant"
            columns: ["tenant_id", "archived_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_medical_file_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_medical_file_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_medical_file_visit_same_tenant"
            columns: ["tenant_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "medical_files_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_files_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_files_parent_file_id_fkey"
            columns: ["parent_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_files_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      notification_queue_read_receipts: {
        Row: {
          clinic_user_id: string
          created_at: string
          id: string
          notification_id: string
          read_at: string
          tenant_id: string
        }
        Insert: {
          clinic_user_id: string
          created_at?: string
          id?: string
          notification_id: string
          read_at?: string
          tenant_id: string
        }
        Update: {
          clinic_user_id?: string
          created_at?: string
          id?: string
          notification_id?: string
          read_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_read_receipts_clinic_user_id_fkey"
            columns: ["clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_read_receipts_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_read_receipts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_expenses: {
        Row: {
          amount_paid_subunits: number
          amount_subunits: number
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          expense_date: string
          id: string
          payment_status: string
          supplier_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_paid_subunits?: number
          amount_subunits: number
          category: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          payment_status?: string
          supplier_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_paid_subunits?: number
          amount_subunits?: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          payment_status?: string
          supplier_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operating_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_work_history: {
        Row: {
          actor_clinic_user_id: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          tenant_id: string
          to_status: string | null
          work_item_id: string
        }
        Insert: {
          actor_clinic_user_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          tenant_id: string
          to_status?: string | null
          work_item_id: string
        }
        Update: {
          actor_clinic_user_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          tenant_id?: string
          to_status?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_work_history_tenant_id_actor_clinic_user_id_fkey"
            columns: ["tenant_id", "actor_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "operational_work_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_work_history_tenant_id_work_item_id_fkey"
            columns: ["tenant_id", "work_item_id"]
            isOneToOne: false
            referencedRelation: "operational_work_items"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      operational_work_items: {
        Row: {
          assignee_clinic_user_id: string | null
          communication_request_id: string | null
          completed_at: string | null
          created_at: string
          details: string | null
          due_at: string | null
          id: string
          kind: string
          outcome: string | null
          parent_work_item_id: string | null
          patient_id: string | null
          priority: string
          requester_clinic_user_id: string | null
          source_id: string | null
          source_type: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_clinic_user_id?: string | null
          communication_request_id?: string | null
          completed_at?: string | null
          created_at?: string
          details?: string | null
          due_at?: string | null
          id?: string
          kind?: string
          outcome?: string | null
          parent_work_item_id?: string | null
          patient_id?: string | null
          priority?: string
          requester_clinic_user_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_clinic_user_id?: string | null
          communication_request_id?: string | null
          completed_at?: string | null
          created_at?: string
          details?: string | null
          due_at?: string | null
          id?: string
          kind?: string
          outcome?: string | null
          parent_work_item_id?: string | null
          patient_id?: string | null
          priority?: string
          requester_clinic_user_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_work_items_assignee_clinic_user_id_fkey"
            columns: ["assignee_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_work_items_communication_request_same_tenant_fk"
            columns: ["tenant_id", "communication_request_id"]
            isOneToOne: false
            referencedRelation: "communication_requests"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "operational_work_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_work_items_requester_clinic_user_id_fkey"
            columns: ["requester_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_work_items_tenant_id_assignee_clinic_user_id_fkey"
            columns: ["tenant_id", "assignee_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "operational_work_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_work_items_tenant_id_parent_work_item_id_fkey"
            columns: ["tenant_id", "parent_work_item_id"]
            isOneToOne: false
            referencedRelation: "operational_work_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "operational_work_items_tenant_id_patient_id_fkey"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "operational_work_items_tenant_id_requester_clinic_user_id_fkey"
            columns: ["tenant_id", "requester_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      patient_clinic_relationships: {
        Row: {
          clinic_patient_id: string
          consent_scope: Json
          created_at: string
          deleted_at: string | null
          id: string
          patient_identity_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          clinic_patient_id: string
          consent_scope?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          patient_identity_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          clinic_patient_id?: string
          consent_scope?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          patient_identity_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_clinic_relationships_clinic_patient_id_fkey"
            columns: ["clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_clinic_relationships_patient_identity_id_fkey"
            columns: ["patient_identity_id"]
            isOneToOne: false
            referencedRelation: "patient_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_clinic_relationships_tenant_clinic_patient_fk"
            columns: ["tenant_id", "clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_clinic_relationships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_flow_events: {
        Row: {
          actor_clinic_user_id: string | null
          actor_context: string | null
          correlation_id: string | null
          created_at: string
          destination_context: Json
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          queue_entry_id: string | null
          reason: string | null
          source_context: Json
          tenant_id: string
          visit_id: string
          work_session_id: string | null
        }
        Insert: {
          actor_clinic_user_id?: string | null
          actor_context?: string | null
          correlation_id?: string | null
          created_at?: string
          destination_context?: Json
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          queue_entry_id?: string | null
          reason?: string | null
          source_context?: Json
          tenant_id: string
          visit_id: string
          work_session_id?: string | null
        }
        Update: {
          actor_clinic_user_id?: string | null
          actor_context?: string | null
          correlation_id?: string | null
          created_at?: string
          destination_context?: Json
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          queue_entry_id?: string | null
          reason?: string | null
          source_context?: Json
          tenant_id?: string
          visit_id?: string
          work_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_flow_events_actor_same_tenant_fk"
            columns: ["tenant_id", "actor_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_flow_events_queue_entry_same_tenant_fk"
            columns: ["tenant_id", "queue_entry_id"]
            isOneToOne: false
            referencedRelation: "patient_flow_queue_entries"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_flow_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_flow_events_visit_same_tenant_fk"
            columns: ["tenant_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_flow_events_work_session_same_tenant_fk"
            columns: ["tenant_id", "work_session_id"]
            isOneToOne: false
            referencedRelation: "clinical_work_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      patient_flow_queue_entries: {
        Row: {
          created_at: string
          created_by_clinic_user_id: string
          entered_at: string
          entry_reason: string | null
          exit_reason: string | null
          exited_at: string | null
          id: string
          lane_key: string
          operating_date: string
          position: number
          priority_class: string
          routing_target: string | null
          tenant_id: string
          updated_at: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          created_by_clinic_user_id: string
          entered_at?: string
          entry_reason?: string | null
          exit_reason?: string | null
          exited_at?: string | null
          id?: string
          lane_key: string
          operating_date: string
          position: number
          priority_class?: string
          routing_target?: string | null
          tenant_id: string
          updated_at?: string
          visit_id: string
        }
        Update: {
          created_at?: string
          created_by_clinic_user_id?: string
          entered_at?: string
          entry_reason?: string | null
          exit_reason?: string | null
          exited_at?: string | null
          id?: string
          lane_key?: string
          operating_date?: string
          position?: number
          priority_class?: string
          routing_target?: string | null
          tenant_id?: string
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_flow_queue_entries_creator_same_tenant_fk"
            columns: ["tenant_id", "created_by_clinic_user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_flow_queue_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_flow_queue_entries_visit_same_tenant_fk"
            columns: ["tenant_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      patient_history: {
        Row: {
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      patient_identities: {
        Row: {
          auth_user_id: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          email_normalized: string | null
          family_name_normalized: string | null
          father_name_normalized: string | null
          first_name_normalized: string | null
          gender: string | null
          id: string
          identity_state: string
          last_authenticated_at: string | null
          mother_name_normalized: string | null
          phone: string | null
          phone_normalized: string | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          email_normalized?: string | null
          family_name_normalized?: string | null
          father_name_normalized?: string | null
          first_name_normalized?: string | null
          gender?: string | null
          id?: string
          identity_state?: string
          last_authenticated_at?: string | null
          mother_name_normalized?: string | null
          phone?: string | null
          phone_normalized?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          email_normalized?: string | null
          family_name_normalized?: string | null
          father_name_normalized?: string | null
          first_name_normalized?: string | null
          gender?: string | null
          id?: string
          identity_state?: string
          last_authenticated_at?: string | null
          mother_name_normalized?: string | null
          phone?: string | null
          phone_normalized?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      patient_identity_identifiers: {
        Row: {
          created_at: string
          id: string
          identifier_type: string
          patient_identity_id: string
          value_hash: string
          value_last4: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          identifier_type: string
          patient_identity_id: string
          value_hash: string
          value_last4?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          identifier_type?: string
          patient_identity_id?: string
          value_hash?: string
          value_last4?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_identity_identifiers_patient_identity_id_fkey"
            columns: ["patient_identity_id"]
            isOneToOne: false
            referencedRelation: "patient_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_identity_match_audit: {
        Row: {
          actor_user_id: string | null
          candidate_count: number
          created_at: string
          evidence: Json
          id: string
          outcome: string
          patient_identity_id: string | null
          policy_version: string
          score: number
          tenant_id: string
        }
        Insert: {
          actor_user_id?: string | null
          candidate_count?: number
          created_at?: string
          evidence?: Json
          id?: string
          outcome: string
          patient_identity_id?: string | null
          policy_version: string
          score: number
          tenant_id: string
        }
        Update: {
          actor_user_id?: string | null
          candidate_count?: number
          created_at?: string
          evidence?: Json
          id?: string
          outcome?: string
          patient_identity_id?: string | null
          policy_version?: string
          score?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_identity_match_audit_patient_identity_id_fkey"
            columns: ["patient_identity_id"]
            isOneToOne: false
            referencedRelation: "patient_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_identity_match_audit_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurance_profiles: {
        Row: {
          claim_ready: boolean
          contract_id: string | null
          coverage_summary: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          member_number: string | null
          notes: string | null
          patient_id: string
          patient_responsibility_subunits: number | null
          payer_name: string
          policy_number: string | null
          reconciliation_status: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          claim_ready?: boolean
          contract_id?: string | null
          coverage_summary?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          member_number?: string | null
          notes?: string | null
          patient_id: string
          patient_responsibility_subunits?: number | null
          payer_name: string
          policy_number?: string | null
          reconciliation_status?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          claim_ready?: boolean
          contract_id?: string | null
          coverage_summary?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          member_number?: string | null
          notes?: string | null
          patient_id?: string
          patient_responsibility_subunits?: number | null
          payer_name?: string
          policy_number?: string | null
          reconciliation_status?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_patient_insurance_contract_same_tenant"
            columns: ["tenant_id", "contract_id"]
            isOneToOne: false
            referencedRelation: "insurance_contracts"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_patient_insurance_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_patient_insurance_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_insurance_profiles_contract_fk"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "insurance_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_profiles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_package_consumptions: {
        Row: {
          consumed_at: string
          consumed_by: string | null
          id: string
          notes: string | null
          patient_package_id: string
          quantity: number
          tenant_id: string
          treatment_plan_item_id: string | null
          visit_id: string | null
        }
        Insert: {
          consumed_at?: string
          consumed_by?: string | null
          id?: string
          notes?: string | null
          patient_package_id: string
          quantity?: number
          tenant_id: string
          treatment_plan_item_id?: string | null
          visit_id?: string | null
        }
        Update: {
          consumed_at?: string
          consumed_by?: string | null
          id?: string
          notes?: string | null
          patient_package_id?: string
          quantity?: number
          tenant_id?: string
          treatment_plan_item_id?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_package_consumption_consumed_by_same_tenant"
            columns: ["tenant_id", "consumed_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_package_consumption_item_same_tenant"
            columns: ["tenant_id", "treatment_plan_item_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plan_items"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_package_consumption_package_same_tenant"
            columns: ["tenant_id", "patient_package_id"]
            isOneToOne: false
            referencedRelation: "patient_packages"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_package_consumption_visit_same_tenant"
            columns: ["tenant_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_package_consumptions_consumed_by_fkey"
            columns: ["consumed_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_package_consumptions_patient_package_id_fkey"
            columns: ["patient_package_id"]
            isOneToOne: false
            referencedRelation: "patient_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_package_consumptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_package_consumptions_treatment_plan_item_id_fkey"
            columns: ["treatment_plan_item_id"]
            isOneToOne: false
            referencedRelation: "clinic_treatment_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_package_consumptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "clinic_visit_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_packages: {
        Row: {
          consumed_sessions: number
          created_at: string
          created_by: string | null
          financial_plan_id: string | null
          id: string
          package_id: string
          patient_id: string
          purchased_at: string
          purchased_sessions: number | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          consumed_sessions?: number
          created_at?: string
          created_by?: string | null
          financial_plan_id?: string | null
          id?: string
          package_id: string
          patient_id: string
          purchased_at?: string
          purchased_sessions?: number | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          consumed_sessions?: number
          created_at?: string
          created_by?: string | null
          financial_plan_id?: string | null
          id?: string
          package_id?: string
          patient_id?: string
          purchased_at?: string
          purchased_sessions?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_patient_package_created_by_same_tenant"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_patient_package_definition_same_tenant"
            columns: ["tenant_id", "package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_patient_package_financial_plan_same_tenant"
            columns: ["tenant_id", "financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_patient_package_patient_same_tenant"
            columns: ["tenant_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "patient_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_packages_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "clinic_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_packages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_identities: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          last_authenticated_at: string | null
          patient_identity_id: string
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          last_authenticated_at?: string | null
          patient_identity_id: string
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          last_authenticated_at?: string | null
          patient_identity_id?: string
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_identities_patient_identity_id_fkey"
            columns: ["patient_identity_id"]
            isOneToOne: true
            referencedRelation: "patient_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_invitations: {
        Row: {
          channel: string
          claimed_at: string | null
          clinic_patient_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          destination: string
          expires_at: string
          fallback_channel: string | null
          id: string
          metadata: Json
          sent_at: string | null
          status: string
          tenant_id: string
          token_hash: string
        }
        Insert: {
          channel: string
          claimed_at?: string | null
          clinic_patient_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destination: string
          expires_at: string
          fallback_channel?: string | null
          id?: string
          metadata?: Json
          sent_at?: string | null
          status?: string
          tenant_id: string
          token_hash: string
        }
        Update: {
          channel?: string
          claimed_at?: string | null
          clinic_patient_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destination?: string
          expires_at?: string
          fallback_channel?: string | null
          id?: string
          metadata?: Json
          sent_at?: string | null
          status?: string
          tenant_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_invitations_clinic_patient_id_fkey"
            columns: ["clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_portal_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_medical_file_releases: {
        Row: {
          clinic_patient_id: string
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          id: string
          medical_file_id: string
          note: string | null
          released_at: string
          released_by: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          clinic_patient_id: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          medical_file_id: string
          note?: string | null
          released_at?: string
          released_by?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          clinic_patient_id?: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          medical_file_id?: string
          note?: string | null
          released_at?: string
          released_by?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_medical_file_releases_clinic_patient_id_fkey"
            columns: ["clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_portal_medical_file_releases_medical_file_id_fkey"
            columns: ["medical_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_portal_medical_file_releases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_messages: {
        Row: {
          body: string
          clinic_patient_id: string
          created_at: string
          deleted_at: string | null
          id: string
          read_at: string | null
          sender_auth_user_id: string | null
          sender_type: string
          status: string
          tenant_id: string
        }
        Insert: {
          body: string
          clinic_patient_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          read_at?: string | null
          sender_auth_user_id?: string | null
          sender_type: string
          status?: string
          tenant_id: string
        }
        Update: {
          body?: string
          clinic_patient_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          read_at?: string | null
          sender_auth_user_id?: string | null
          sender_type?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_messages_clinic_patient_id_fkey"
            columns: ["clinic_patient_id"]
            isOneToOne: false
            referencedRelation: "clinic_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_portal_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_bundle_items: {
        Row: {
          bundle_id: string
          deleted_at: string | null
          id: string
          permission_id: string
        }
        Insert: {
          bundle_id: string
          deleted_at?: string | null
          id?: string
          permission_id: string
        }
        Update: {
          bundle_id?: string
          deleted_at?: string | null
          id?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "permission_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permission_bundle_items_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_bundles: {
        Row: {
          bundle_key: string
          bundle_name: string
          bundle_name_ar: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_system_bundle: boolean
          tenant_id: string | null
        }
        Insert: {
          bundle_key: string
          bundle_name: string
          bundle_name_ar?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_bundle?: boolean
          tenant_id?: string | null
        }
        Update: {
          bundle_key?: string
          bundle_name?: string
          bundle_name_ar?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_bundle?: boolean
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_bundles_tenant_id_fkey"
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
          deleted_at: string | null
          description: string | null
          id: string
          permission_key: string
          permission_name: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          permission_key: string
          permission_name: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          permission_key?: string
          permission_name?: string
          resource?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          line_total_subunits: number
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number
          tenant_id: string
          unit_cost_subunits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          line_total_subunits?: number
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number
          tenant_id: string
          unit_cost_subunits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          line_total_subunits?: number
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number
          tenant_id?: string
          unit_cost_subunits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string | null
          status: string
          subtotal_subunits: number
          supplier_id: string
          tax_subunits: number
          tenant_id: string
          total_subunits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string | null
          status?: string
          subtotal_subunits?: number
          supplier_id: string
          tax_subunits?: number
          tenant_id: string
          total_subunits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string | null
          status?: string
          subtotal_subunits?: number
          supplier_id?: string
          tax_subunits?: number
          tenant_id?: string
          total_subunits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_order_supplier_same_tenant"
            columns: ["tenant_id", "supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_receipt_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          purchase_order_item_id: string
          quantity_received: number
          quantity_returned: number
          receipt_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          purchase_order_item_id: string
          quantity_received: number
          quantity_returned?: number
          receipt_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          purchase_order_item_id?: string
          quantity_received?: number
          quantity_returned?: number
          receipt_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_receipt_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_receipt_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "purchase_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_receipt_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_receipts: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          purchase_order_id: string
          receipt_number: string | null
          received_at: string
          received_by: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          purchase_order_id: string
          receipt_number?: string | null
          received_at?: string
          received_by?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string
          receipt_number?: string | null
          received_at?: string
          received_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_receipts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_followups: {
        Row: {
          action_type: string
          assigned_to: string | null
          automation_rule_id: string | null
          automation_source_key: string | null
          cancelled_at: string | null
          channel: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          delivered_at: string | null
          delivery_status: string | null
          execution_mode: string
          followup_type: string
          id: string
          message_body: string | null
          next_action_at: string | null
          next_action_type: string | null
          outcome: string | null
          patient_id: string
          reason: string | null
          response_received: boolean | null
          result: string | null
          scheduled_for: string
          sent_at: string | null
          sent_by: string | null
          session_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_type?: string
          assigned_to?: string | null
          automation_rule_id?: string | null
          automation_source_key?: string | null
          cancelled_at?: string | null
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          execution_mode?: string
          followup_type: string
          id?: string
          message_body?: string | null
          next_action_at?: string | null
          next_action_type?: string | null
          outcome?: string | null
          patient_id: string
          reason?: string | null
          response_received?: boolean | null
          result?: string | null
          scheduled_for: string
          sent_at?: string | null
          sent_by?: string | null
          session_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_type?: string
          assigned_to?: string | null
          automation_rule_id?: string | null
          automation_source_key?: string | null
          cancelled_at?: string | null
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          execution_mode?: string
          followup_type?: string
          id?: string
          message_body?: string | null
          next_action_at?: string | null
          next_action_type?: string | null
          outcome?: string | null
          patient_id?: string
          reason?: string | null
          response_received?: boolean | null
          result?: string | null
          scheduled_for?: string
          sent_at?: string | null
          sent_by?: string | null
          session_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_followups_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_followups_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "followup_automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_followups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "retention_followups_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
      role_template_permissions: {
        Row: {
          deleted_at: string | null
          id: string
          permission_id: string
          template_id: string
        }
        Insert: {
          deleted_at?: string | null
          id?: string
          permission_id: string
          template_id: string
        }
        Update: {
          deleted_at?: string | null
          id?: string
          permission_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_template_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_template_permissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "role_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      role_templates: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_system_template: boolean
          source_role_id: string | null
          template_key: string
          template_name: string
          template_name_ar: string | null
          tenant_id: string | null
          workspace: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean
          source_role_id?: string | null
          template_key: string
          template_name: string
          template_name_ar?: string | null
          tenant_id?: string | null
          workspace?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_template?: boolean
          source_role_id?: string | null
          template_key?: string
          template_name?: string
          template_name_ar?: string | null
          tenant_id?: string | null
          workspace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_templates_source_role_id_fkey"
            columns: ["source_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          role_key: string
          role_name: string
          role_name_ar: string | null
          tenant_id: string | null
          workspace: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          role_key: string
          role_name: string
          role_name_ar?: string | null
          tenant_id?: string | null
          workspace?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          role_key?: string
          role_name?: string
          role_name_ar?: string | null
          tenant_id?: string | null
          workspace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ai_limits: Json | null
          api_rate_limit: number | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          max_branches: number
          max_devices: number
          max_users: number
          medical_file_cloud_mode: string
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
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          max_branches?: number
          max_devices?: number
          max_users?: number
          medical_file_cloud_mode?: string
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
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          max_branches?: number
          max_devices?: number
          max_users?: number
          medical_file_cloud_mode?: string
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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_bill_items: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inventory_item_id: string | null
          line_total_subunits: number
          quantity: number
          supplier_bill_id: string
          tenant_id: string
          unit_cost_subunits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inventory_item_id?: string | null
          line_total_subunits?: number
          quantity?: number
          supplier_bill_id: string
          tenant_id: string
          unit_cost_subunits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inventory_item_id?: string | null
          line_total_subunits?: number
          quantity?: number
          supplier_bill_id?: string
          tenant_id?: string
          unit_cost_subunits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_bill_items_bill_tenant_fk"
            columns: ["tenant_id", "supplier_bill_id"]
            isOneToOne: false
            referencedRelation: "supplier_bills"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "supplier_bill_items_item_tenant_fk"
            columns: ["tenant_id", "inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      supplier_bills: {
        Row: {
          amount_paid_subunits: number
          bill_date: string
          bill_number: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          purchase_order_id: string | null
          status: string
          subtotal_subunits: number
          supplier_id: string
          tax_subunits: number
          tenant_id: string
          total_subunits: number
          updated_at: string
        }
        Insert: {
          amount_paid_subunits?: number
          bill_date?: string
          bill_number: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          status?: string
          subtotal_subunits?: number
          supplier_id: string
          tax_subunits?: number
          tenant_id: string
          total_subunits?: number
          updated_at?: string
        }
        Update: {
          amount_paid_subunits?: number
          bill_date?: string
          bill_number?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          status?: string
          subtotal_subunits?: number
          supplier_id?: string
          tax_subunits?: number
          tenant_id?: string
          total_subunits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_bills_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_bills_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_bills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_obligations: {
        Row: {
          amount_paid_subunits: number
          amount_subunits: number
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          purchase_order_id: string | null
          status: string
          supplier_bill_id: string | null
          supplier_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_paid_subunits?: number
          amount_subunits: number
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          purchase_order_id?: string | null
          status?: string
          supplier_bill_id?: string | null
          supplier_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_paid_subunits?: number
          amount_subunits?: number
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          purchase_order_id?: string | null
          status?: string
          supplier_bill_id?: string | null
          supplier_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_obligations_bill_fk"
            columns: ["supplier_bill_id"]
            isOneToOne: false
            referencedRelation: "supplier_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_obligations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_obligations_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_obligations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_obligations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount_subunits: number
          created_by: string | null
          id: string
          paid_at: string
          payment_method: string | null
          reference: string | null
          supplier_obligation_id: string
          tenant_id: string
        }
        Insert: {
          amount_subunits: number
          created_by?: string | null
          id?: string
          paid_at?: string
          payment_method?: string | null
          reference?: string | null
          supplier_obligation_id: string
          tenant_id: string
        }
        Update: {
          amount_subunits?: number
          created_by?: string | null
          id?: string
          paid_at?: string
          payment_method?: string | null
          reference?: string | null
          supplier_obligation_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_obligation_id_fkey"
            columns: ["supplier_obligation_id"]
            isOneToOne: false
            referencedRelation: "supplier_obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          name_ar: string | null
          notes: string | null
          phone: string | null
          status: string
          tax_identifier: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          name_ar?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          tax_identifier?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
          tax_identifier?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_devices: {
        Row: {
          agent_token_hash: string | null
          agent_version: string | null
          browser_info: string | null
          capabilities: Json
          deleted_at: string | null
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          health_status: string
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          last_sync_at: string | null
          os_info: string | null
          registered_at: string
          tenant_id: string
        }
        Insert: {
          agent_token_hash?: string | null
          agent_version?: string | null
          browser_info?: string | null
          capabilities?: Json
          deleted_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          health_status?: string
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          last_sync_at?: string | null
          os_info?: string | null
          registered_at?: string
          tenant_id: string
        }
        Update: {
          agent_token_hash?: string | null
          agent_version?: string | null
          browser_info?: string | null
          capabilities?: Json
          deleted_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          health_status?: string
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          last_sync_at?: string | null
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
      tenant_entitlements: {
        Row: {
          created_at: string
          deleted_at: string | null
          effective_from: string
          effective_until: string | null
          entitlement_key: string
          id: string
          metadata: Json
          source: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          effective_from?: string
          effective_until?: string | null
          entitlement_key: string
          id?: string
          metadata?: Json
          source?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          effective_from?: string
          effective_until?: string | null
          entitlement_key?: string
          id?: string
          metadata?: Json
          source?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_entitlements_entitlement_key_fkey"
            columns: ["entitlement_key"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "tenant_entitlements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_notification_channel_prefs: {
        Row: {
          channel: string
          created_at: string
          deleted_at: string | null
          id: string
          is_enabled: boolean
          tenant_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_enabled?: boolean
          tenant_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_enabled?: boolean
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_notification_channel_prefs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_advance_installments: {
        Row: {
          advance_id: string
          amount_subunits: number
          created_at: string
          due_date: string
          id: string
          installment_no: number
          notes: string | null
          paid_at: string | null
          payroll_entry_id: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          advance_id: string
          amount_subunits: number
          created_at?: string
          due_date: string
          id?: string
          installment_no: number
          notes?: string | null
          paid_at?: string | null
          payroll_entry_id?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          advance_id?: string
          amount_subunits?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_no?: number
          notes?: string | null
          paid_at?: string | null
          payroll_entry_id?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_advance_installments_advance_id_fkey"
            columns: ["advance_id"]
            isOneToOne: false
            referencedRelation: "workforce_employee_advances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_advance_installments_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_attendance: {
        Row: {
          attendance_date: string
          check_in: string | null
          check_out: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          overtime_minutes: number
          recorded_by: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attendance_date: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          overtime_minutes?: number
          recorded_by?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          overtime_minutes?: number
          recorded_by?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_attendance_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_attendance_recorded_by_same_tenant_fk"
            columns: ["tenant_id", "recorded_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_attendance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_benefits: {
        Row: {
          benefit_name: string
          benefit_name_ar: string | null
          created_at: string
          created_by: string | null
          currency: string
          employee_contribution_subunits: number
          employee_id: string
          ends_on: string | null
          id: string
          notes: string | null
          starts_on: string | null
          status: string
          tenant_id: string
          updated_at: string
          value_subunits: number
        }
        Insert: {
          benefit_name: string
          benefit_name_ar?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          employee_contribution_subunits?: number
          employee_id: string
          ends_on?: string | null
          id?: string
          notes?: string | null
          starts_on?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          value_subunits?: number
        }
        Update: {
          benefit_name?: string
          benefit_name_ar?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          employee_contribution_subunits?: number
          employee_id?: string
          ends_on?: string | null
          id?: string
          notes?: string | null
          starts_on?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          value_subunits?: number
        }
        Relationships: [
          {
            foreignKeyName: "workforce_benefits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_benefits_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_benefits_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_benefits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_candidates: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          staffing_need_id: string | null
          stage: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          staffing_need_id?: string | null
          stage?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          staffing_need_id?: string | null
          stage?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_candidates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_candidates_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_candidates_need_same_tenant_fk"
            columns: ["tenant_id", "staffing_need_id"]
            isOneToOne: false
            referencedRelation: "workforce_staffing_needs"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_candidates_staffing_need_id_fkey"
            columns: ["staffing_need_id"]
            isOneToOne: false
            referencedRelation: "workforce_staffing_needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_candidates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_commission_entries: {
        Row: {
          basis_amount_subunits: number
          calculated_at: string
          commission_rule_id: string
          created_at: string
          created_by: string | null
          eligible_amount_subunits: number
          employee_id: string
          id: string
          notes: string | null
          source_id: string | null
          source_payment_id: string | null
          source_type: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          basis_amount_subunits?: number
          calculated_at?: string
          commission_rule_id: string
          created_at?: string
          created_by?: string | null
          eligible_amount_subunits?: number
          employee_id: string
          id?: string
          notes?: string | null
          source_id?: string | null
          source_payment_id?: string | null
          source_type: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          basis_amount_subunits?: number
          calculated_at?: string
          commission_rule_id?: string
          created_at?: string
          created_by?: string | null
          eligible_amount_subunits?: number
          employee_id?: string
          id?: string
          notes?: string | null
          source_id?: string | null
          source_payment_id?: string | null
          source_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_commission_source_payment_same_tenant"
            columns: ["tenant_id", "source_payment_id"]
            isOneToOne: false
            referencedRelation: "invoice_payments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_commission_rule_id_fkey"
            columns: ["commission_rule_id"]
            isOneToOne: false
            referencedRelation: "workforce_commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_rule_same_tenant_fk"
            columns: ["tenant_id", "commission_rule_id"]
            isOneToOne: false
            referencedRelation: "workforce_commission_rules"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_source_payment_id_fkey"
            columns: ["source_payment_id"]
            isOneToOne: false
            referencedRelation: "invoice_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_commission_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_commission_rules: {
        Row: {
          basis: string
          created_at: string
          created_by: string | null
          fixed_amount_subunits: number
          id: string
          name: string
          notes: string | null
          rate: number
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          basis: string
          created_at?: string
          created_by?: string | null
          fixed_amount_subunits?: number
          id?: string
          name: string
          notes?: string | null
          rate?: number
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          basis?: string
          created_at?: string
          created_by?: string | null
          fixed_amount_subunits?: number
          id?: string
          name?: string
          notes?: string | null
          rate?: number
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_commission_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_commission_rules_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_commission_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_employee_advances: {
        Row: {
          advance_type: string
          amount_subunits: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          deduction_payroll_period_id: string | null
          disbursed_on: string
          employee_id: string
          id: string
          installment_amount_subunits: number | null
          installment_frequency: string | null
          installment_start_date: string | null
          notes: string | null
          reason: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          advance_type: string
          amount_subunits: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency: string
          deduction_payroll_period_id?: string | null
          disbursed_on?: string
          employee_id: string
          id?: string
          installment_amount_subunits?: number | null
          installment_frequency?: string | null
          installment_start_date?: string | null
          notes?: string | null
          reason?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          advance_type?: string
          amount_subunits?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deduction_payroll_period_id?: string | null
          disbursed_on?: string
          employee_id?: string
          id?: string
          installment_amount_subunits?: number | null
          installment_frequency?: string | null
          installment_start_date?: string | null
          notes?: string | null
          reason?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_employee_advances_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_advances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_advances_deduction_payroll_period_id_fkey"
            columns: ["deduction_payroll_period_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_employee_qualifications: {
        Row: {
          created_at: string
          credential_number: string | null
          employee_id: string
          expires_on: string | null
          id: string
          issued_on: string | null
          qualification_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          credential_number?: string | null
          employee_id: string
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          qualification_id: string
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          credential_number?: string | null
          employee_id?: string
          expires_on?: string | null
          id?: string
          issued_on?: string | null
          qualification_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_qualifications_qualification_id_fkey"
            columns: ["qualification_id"]
            isOneToOne: false
            referencedRelation: "workforce_qualifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_qualifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_employee_skills: {
        Row: {
          created_at: string
          employee_id: string
          expires_on: string | null
          id: string
          proficiency: string
          skill_id: string
          tenant_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          expires_on?: string | null
          id?: string
          proficiency?: string
          skill_id: string
          tenant_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          expires_on?: string | null
          id?: string
          proficiency?: string
          skill_id?: string
          tenant_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "workforce_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employee_skills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_employees: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          employee_number: string | null
          first_name: string
          first_name_ar: string | null
          hire_date: string | null
          id: string
          last_name: string
          last_name_ar: string | null
          manager_employee_id: string | null
          notes: string | null
          phone: string | null
          position_id: string | null
          status: string
          tenant_id: string
          termination_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          employee_number?: string | null
          first_name: string
          first_name_ar?: string | null
          hire_date?: string | null
          id?: string
          last_name: string
          last_name_ar?: string | null
          manager_employee_id?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          status?: string
          tenant_id: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          employee_number?: string | null
          first_name?: string
          first_name_ar?: string | null
          hire_date?: string | null
          id?: string
          last_name?: string
          last_name_ar?: string | null
          manager_employee_id?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          status?: string
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_employees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employees_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_employees_manager_employee_id_fkey"
            columns: ["manager_employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employees_manager_same_tenant_fk"
            columns: ["tenant_id", "manager_employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "workforce_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employees_position_same_tenant_fk"
            columns: ["tenant_id", "position_id"]
            isOneToOne: false
            referencedRelation: "workforce_positions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employees_user_same_tenant_fk"
            columns: ["tenant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      workforce_employment_records: {
        Row: {
          base_salary_subunits: number
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string
          effective_to: string | null
          employee_id: string
          employment_type: string
          id: string
          notes: string | null
          position_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          working_hours_per_week: number
        }
        Insert: {
          base_salary_subunits?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from: string
          effective_to?: string | null
          employee_id: string
          employment_type?: string
          id?: string
          notes?: string | null
          position_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          working_hours_per_week?: number
        }
        Update: {
          base_salary_subunits?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          employment_type?: string
          id?: string
          notes?: string | null
          position_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          working_hours_per_week?: number
        }
        Relationships: [
          {
            foreignKeyName: "workforce_employment_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employment_records_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_employment_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employment_records_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_employment_records_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "workforce_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_employment_records_position_same_tenant_fk"
            columns: ["tenant_id", "position_id"]
            isOneToOne: false
            referencedRelation: "workforce_positions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_employment_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          days: number
          employee_id: string
          ends_on: string
          id: string
          leave_type_id: string
          reason: string | null
          starts_on: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          days: number
          employee_id: string
          ends_on: string
          id?: string
          leave_type_id: string
          reason?: string | null
          starts_on: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          days?: number
          employee_id?: string
          ends_on?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          starts_on?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_approved_by_same_tenant_fk"
            columns: ["tenant_id", "approved_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "workforce_leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_leave_type_same_tenant_fk"
            columns: ["tenant_id", "leave_type_id"]
            isOneToOne: false
            referencedRelation: "workforce_leave_types"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_leave_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_leave_types: {
        Row: {
          annual_entitlement_days: number
          carry_forward_days: number
          created_at: string
          created_by: string | null
          id: string
          name: string
          name_ar: string | null
          paid: boolean
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          annual_entitlement_days?: number
          carry_forward_days?: number
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          name_ar?: string | null
          paid?: boolean
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          annual_entitlement_days?: number
          carry_forward_days?: number
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          paid?: boolean
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_leave_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_leave_types_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_leave_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_payroll_country_rules: {
        Row: {
          country_code: string
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string
          effective_to: string | null
          employee_rate: number
          employer_rate: number
          id: string
          maximum_contribution_basis_subunits: number | null
          name: string
          notes: string | null
          rule_config: Json
          social_security_enabled: boolean
          source: string | null
          source_url: string | null
          status: string
          tax_enabled: boolean
          tax_exemptions_subunits: number
          tax_method: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          created_by?: string | null
          currency: string
          effective_from: string
          effective_to?: string | null
          employee_rate?: number
          employer_rate?: number
          id?: string
          maximum_contribution_basis_subunits?: number | null
          name: string
          notes?: string | null
          rule_config?: Json
          social_security_enabled?: boolean
          source?: string | null
          source_url?: string | null
          status?: string
          tax_enabled?: boolean
          tax_exemptions_subunits?: number
          tax_method?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_to?: string | null
          employee_rate?: number
          employer_rate?: number
          id?: string
          maximum_contribution_basis_subunits?: number | null
          name?: string
          notes?: string | null
          rule_config?: Json
          social_security_enabled?: boolean
          source?: string | null
          source_url?: string | null
          status?: string
          tax_enabled?: boolean
          tax_exemptions_subunits?: number
          tax_method?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_payroll_country_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_payroll_deductions: {
        Row: {
          amount_subunits: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          deduction_type: string
          employee_id: string
          id: string
          notes: string | null
          payroll_period_id: string
          reason: string | null
          source_id: string | null
          source_type: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_subunits: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency: string
          deduction_type: string
          employee_id: string
          id?: string
          notes?: string | null
          payroll_period_id: string
          reason?: string | null
          source_id?: string | null
          source_type: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_subunits?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deduction_type?: string
          employee_id?: string
          id?: string
          notes?: string | null
          payroll_period_id?: string
          reason?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_payroll_deductions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_deductions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_deductions_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_payroll_earnings: {
        Row: {
          amount_subunits: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          earning_type: string
          employee_id: string
          id: string
          payroll_period_id: string
          reason: string | null
          source_id: string | null
          source_type: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount_subunits: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency: string
          earning_type: string
          employee_id: string
          id?: string
          payroll_period_id: string
          reason?: string | null
          source_id?: string | null
          source_type: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount_subunits?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          earning_type?: string
          employee_id?: string
          id?: string
          payroll_period_id?: string
          reason?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_payroll_earnings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_earnings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_earnings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_earnings_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_payroll_entries: {
        Row: {
          allowances_subunits: number
          approved_at: string | null
          approved_by: string | null
          base_salary_subunits: number
          bonuses_subunits: number
          commissions_subunits: number
          created_at: string
          created_by: string | null
          deductions_subunits: number
          employee_id: string
          id: string
          net_subunits: number
          notes: string | null
          overtime_subunits: number
          paid_at: string | null
          paid_by: string | null
          payroll_period_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowances_subunits?: number
          approved_at?: string | null
          approved_by?: string | null
          base_salary_subunits?: number
          bonuses_subunits?: number
          commissions_subunits?: number
          created_at?: string
          created_by?: string | null
          deductions_subunits?: number
          employee_id: string
          id?: string
          net_subunits?: number
          notes?: string | null
          overtime_subunits?: number
          paid_at?: string | null
          paid_by?: string | null
          payroll_period_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowances_subunits?: number
          approved_at?: string | null
          approved_by?: string | null
          base_salary_subunits?: number
          bonuses_subunits?: number
          commissions_subunits?: number
          created_at?: string
          created_by?: string | null
          deductions_subunits?: number
          employee_id?: string
          id?: string
          net_subunits?: number
          notes?: string | null
          overtime_subunits?: number
          paid_at?: string | null
          paid_by?: string | null
          payroll_period_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_payroll_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_entries_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_entries_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_payroll_entries_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_entries_period_same_tenant_fk"
            columns: ["tenant_id", "payroll_period_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_periods"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_payroll_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_payroll_periods: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          id: string
          locked_at: string | null
          locked_by: string | null
          period_end: string
          period_start: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          period_end: string
          period_start: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          period_end?: string
          period_start?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_payroll_periods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_periods_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_payroll_periods_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payroll_periods_locked_by_same_tenant_fk"
            columns: ["tenant_id", "locked_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_payroll_periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_payslips: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          deductions_subunits: number
          employee_id: string
          gross_subunits: number
          id: string
          issued_at: string | null
          net_subunits: number
          payroll_entry_id: string
          payroll_period_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency: string
          deductions_subunits?: number
          employee_id: string
          gross_subunits?: number
          id?: string
          issued_at?: string | null
          net_subunits?: number
          payroll_entry_id: string
          payroll_period_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions_subunits?: number
          employee_id?: string
          gross_subunits?: number
          id?: string
          issued_at?: string | null
          net_subunits?: number
          payroll_entry_id?: string
          payroll_period_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_payslips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payslips_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: true
            referencedRelation: "workforce_payroll_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_payslips_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "workforce_payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_positions: {
        Row: {
          created_at: string
          created_by: string | null
          default_capacity: number
          department: string | null
          employment_type: string
          id: string
          name: string
          name_ar: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_capacity?: number
          department?: string | null
          employment_type?: string
          id?: string
          name: string
          name_ar?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_capacity?: number
          department?: string | null
          employment_type?: string
          id?: string
          name?: string
          name_ar?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_positions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_positions_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_positions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_procedure_capabilities: {
        Row: {
          deleted_at: string | null
          enabled_at: string
          enabled_by: string
          id: string
          procedure_id: string
          tenant_id: string
          workforce_employee_id: string
        }
        Insert: {
          deleted_at?: string | null
          enabled_at?: string
          enabled_by: string
          id?: string
          procedure_id: string
          tenant_id: string
          workforce_employee_id: string
        }
        Update: {
          deleted_at?: string | null
          enabled_at?: string
          enabled_by?: string
          id?: string
          procedure_id?: string
          tenant_id?: string
          workforce_employee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cdi_workforce_procedure_enabled_by_same_tenant"
            columns: ["tenant_id", "enabled_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "fk_cdi_workforce_procedure_same_tenant"
            columns: ["tenant_id", "procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_procedure_capabilities_employee_same_tenant_fk"
            columns: ["tenant_id", "workforce_employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_procedure_capabilities_enabled_by_fkey"
            columns: ["enabled_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_procedure_capabilities_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "clinic_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_procedure_capabilities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_qualifications: {
        Row: {
          created_at: string
          id: string
          issuing_body: string | null
          name: string
          qualification_key: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issuing_body?: string | null
          name: string
          qualification_key: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issuing_body?: string | null
          name?: string
          qualification_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_qualifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_skills: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          skill_key: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          skill_key: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          skill_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_skills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_staff_schedules: {
        Row: {
          capacity_units: number
          created_at: string
          created_by: string | null
          day_of_week: number
          effective_from: string | null
          effective_to: string | null
          employee_id: string
          ends_at: string
          id: string
          starts_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          capacity_units?: number
          created_at?: string
          created_by?: string | null
          day_of_week: number
          effective_from?: string | null
          effective_to?: string | null
          employee_id: string
          ends_at: string
          id?: string
          starts_at: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          capacity_units?: number
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          effective_from?: string | null
          effective_to?: string | null
          employee_id?: string
          ends_at?: string
          id?: string
          starts_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_staff_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_staff_schedules_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_staff_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_staff_schedules_employee_same_tenant_fk"
            columns: ["tenant_id", "employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_staff_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_staffing_needs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          needed_from: string | null
          needed_to: string | null
          notes: string | null
          position_id: string | null
          quantity: number
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          needed_from?: string | null
          needed_to?: string | null
          notes?: string | null
          position_id?: string | null
          quantity?: number
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          needed_from?: string | null
          needed_to?: string | null
          notes?: string | null
          position_id?: string | null
          quantity?: number
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_staffing_needs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_staffing_needs_created_by_same_tenant_fk"
            columns: ["tenant_id", "created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_staffing_needs_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "workforce_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_staffing_needs_position_same_tenant_fk"
            columns: ["tenant_id", "position_id"]
            isOneToOne: false
            referencedRelation: "workforce_positions"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "workforce_staffing_needs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_unavailability_blocks: {
        Row: {
          absence_type: string
          created_at: string
          created_by: string | null
          employee_id: string | null
          ends_at: string
          id: string
          reason: string | null
          starts_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          absence_type: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          ends_at: string
          id?: string
          reason?: string | null
          starts_at: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          absence_type?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          ends_at?: string
          id?: string
          reason?: string | null
          starts_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_unavailability_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "clinic_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_unavailability_blocks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "workforce_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_unavailability_blocks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "master_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_inventory_stock: {
        Args: {
          p_actor_id?: string
          p_delta: number
          p_item_id: string
          p_movement_type?: string
          p_procedure_id?: string
          p_reason?: string
          p_session_id?: string
          p_source_id?: string
          p_source_type?: string
          p_tenant_id: string
          p_treatment_plan_item_id?: string
        }
        Returns: number
      }
      apply_payment_to_installment:
        | {
            Args: {
              p_amount_subunits: number
              p_installment_id: string
              p_tenant_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_amount_subunits: number
              p_collected_by?: string
              p_installment_id: string
              p_payment_method?: string
              p_payment_reference?: string
              p_tenant_id: string
            }
            Returns: Json
          }
      approve_workforce_leave_request: {
        Args: {
          p_decision: string
          p_leave_request_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      approve_workforce_payroll_entry: {
        Args: {
          p_approved_by?: string
          p_payroll_entry_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      calculate_workforce_commission_from_payment: {
        Args: {
          p_created_by: string
          p_employee_id: string
          p_payment_id: string
          p_rule_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      can_edit_invoice: { Args: { p_invoice_id: string }; Returns: boolean }
      cancel_invoice: { Args: { p_invoice_id: string }; Returns: Json }
      consume_procedure_inventory: {
        Args: {
          p_consumed_by: string
          p_item_id: string
          p_quantity: number
          p_reason: string
          p_tenant_id: string
          p_treatment_plan_item_id: string
          p_visit_id: string
        }
        Returns: Json
      }
      create_communication_conversation: {
        Args: {
          p_clinic_patient_id?: string
          p_recipient_user_ids?: string[]
          p_subject?: string
        }
        Returns: string
      }
      create_financial_plan_with_installments: {
        Args: {
          p_created_by: string
          p_currency: string
          p_installments?: Json
          p_insurance_covered_subunits: number
          p_notes: string
          p_patient_id: string
          p_patient_responsibility_subunits: number
          p_tenant_id: string
          p_total_amount_subunits: number
          p_treatment_plan_id: string
        }
        Returns: Json
      }
      create_invoice_from_session: {
        Args: { p_session_id: string }
        Returns: Json
      }
      create_manual_invoice: {
        Args: {
          p_created_by?: string
          p_invoice_date?: string
          p_items?: Json
          p_notes?: string
          p_patient_id: string
          p_payment_terms?: string
          p_session_id?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      create_operational_work_from_domain_event: {
        Args: {
          p_event_type: string
          p_patient_id: string
          p_requested_by: string
          p_required_permission: string
          p_source_id: string
          p_source_type: string
          p_tenant_id: string
          p_title: string
        }
        Returns: Json
      }
      create_purchase_order_with_items: {
        Args: {
          p_created_by?: string
          p_expected_date?: string
          p_items?: Json
          p_notes?: string
          p_order_date?: string
          p_order_number?: string
          p_supplier_id: string
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
      create_workforce_employee_advance: {
        Args: {
          p_advance_type: string
          p_amount_subunits: number
          p_created_by?: string
          p_currency: string
          p_deduction_payroll_period_id?: string
          p_disbursed_on: string
          p_employee_id: string
          p_installment_amount_subunits?: number
          p_installment_frequency?: string
          p_installment_start_date?: string
          p_reason?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      create_workforce_payroll_deduction: {
        Args: {
          p_amount_subunits: number
          p_created_by?: string
          p_currency: string
          p_deduction_type: string
          p_employee_id: string
          p_payroll_period_id: string
          p_reason?: string
          p_source_id?: string
          p_source_type: string
          p_tenant_id: string
        }
        Returns: Json
      }
      create_workforce_payroll_earning: {
        Args: {
          p_amount_subunits: number
          p_created_by?: string
          p_currency: string
          p_earning_type: string
          p_employee_id: string
          p_payroll_period_id: string
          p_reason?: string
          p_source_id?: string
          p_source_type: string
          p_tenant_id: string
        }
        Returns: Json
      }
      create_workforce_payroll_entry_with_commissions: {
        Args: {
          p_allowances_subunits?: number
          p_bonuses_subunits?: number
          p_created_by?: string
          p_deductions_subunits?: number
          p_employee_id: string
          p_overtime_subunits?: number
          p_payroll_period_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      create_workforce_payslip_for_entry: {
        Args: {
          p_created_by?: string
          p_payroll_entry_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      csapi_d3_cancel_patient_flow: {
        Args: {
          p_correlation_id?: string
          p_reason?: string
          p_visit_id: string
        }
        Returns: Json
      }
      csapi_d3_complete_reception: {
        Args: { p_correlation_id: string; p_visit_id: string }
        Returns: Json
      }
      csapi_d3_enter_waiting: {
        Args: {
          p_correlation_id?: string
          p_entry_reason?: string
          p_lane_key?: string
          p_priority_class?: string
          p_routing_target?: string
          p_visit_id: string
        }
        Returns: Json
      }
      csapi_d3_finish_clinical_work: {
        Args: { p_correlation_id: string; p_visit_id: string }
        Returns: Json
      }
      csapi_d3_mark_no_show: {
        Args: {
          p_correlation_id?: string
          p_reason?: string
          p_visit_id: string
        }
        Returns: Json
      }
      csapi_d3_reorder_waiting: {
        Args: {
          p_correlation_id?: string
          p_queue_entry_id: string
          p_routing_target?: string
          p_target_lane_key?: string
          p_target_position: number
        }
        Returns: Json
      }
      csapi_d3_start_clinical_work: {
        Args: { p_correlation_id: string; p_visit_id: string }
        Returns: Json
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      enqueue_followup_notification: {
        Args: {
          p_automation_rule_id: string
          p_channel: string
          p_followup_id: string
          p_followup_type: string
          p_message_body: string
          p_patient_id: string
          p_scheduled_at: string
          p_tenant_id: string
        }
        Returns: boolean
      }
      execute_commercial_sale: {
        Args: {
          p_created_by?: string
          p_financial_plan_id?: string
          p_offer_id?: string
          p_package_id?: string
          p_patient_id: string
          p_service_id?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      followup_automation_enabled: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      generate_invoice_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_current_tenant_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_effective_permissions: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: string[]
      }
      get_financial_resource_summary: {
        Args: { p_from_date?: string; p_tenant_id: string; p_to_date?: string }
        Returns: Json
      }
      get_internal_chat_directory: {
        Args: { p_query?: string }
        Returns: {
          conversation_id: string
          email: string
          full_name: string
          last_message: string
          last_message_at: string
          role: string
          unread_count: number
          user_id: string
        }[]
      }
      get_personal_notification_feed: {
        Args: { p_limit?: number }
        Returns: Json
      }
      get_workforce_unavailability: {
        Args: {
          p_employee_id: string
          p_end: string
          p_start: string
          p_tenant_id: string
        }
        Returns: {
          absence_type: string
          ends_at: string
          reason: string
          starts_at: string
        }[]
      }
      has_effective_permission: {
        Args: { p_permission_key: string; p_user_id?: string }
        Returns: boolean
      }
      has_tenant_permission: {
        Args: { p_permission_key: string; p_tenant_id: string }
        Returns: boolean
      }
      issue_invoice: { Args: { p_invoice_id: string }; Returns: Json }
      pay_workforce_payroll_entry: {
        Args: {
          p_paid_by?: string
          p_payroll_entry_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      promote_workforce_candidate_to_employee: {
        Args: {
          p_candidate_id: string
          p_hire_date?: string
          p_position_id?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      rebuild_analytics_daily_snapshot: {
        Args: { p_snapshot_date: string; p_tenant_id: string }
        Returns: undefined
      }
      recalculate_invoice_totals: {
        Args: { p_invoice_id: string }
        Returns: undefined
      }
      receive_purchase_order: {
        Args: {
          p_items: Json
          p_purchase_order_id: string
          p_received_by: string
          p_tenant_id: string
        }
        Returns: Json
      }
      reconcile_insurance_claim: {
        Args: {
          p_claim_id: string
          p_patient_responsibility_subunits: number
          p_reconciled_by: string
          p_reconciled_subunits: number
          p_tenant_id: string
        }
        Returns: Json
      }
      record_invoice_payment: {
        Args: {
          p_amount_subunits: number
          p_collected_by?: string
          p_invoice_id: string
          p_notes?: string
          p_payment_method: string
          p_payment_reference?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      record_invoice_payment_with_installment: {
        Args: {
          p_amount_subunits: number
          p_collected_by?: string
          p_installment_id?: string
          p_invoice_id: string
          p_notes?: string
          p_payment_method: string
          p_payment_reference?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      record_supplier_payment: {
        Args: {
          p_amount_subunits: number
          p_created_by?: string
          p_payment_method?: string
          p_reference?: string
          p_supplier_obligation_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      refresh_analytics_daily_snapshots: { Args: never; Returns: undefined }
      refund_invoice_payment: {
        Args: {
          p_amount_subunits: number
          p_invoice_id: string
          p_payment_id?: string
          p_reason: string
          p_reference?: string
          p_refund_method: string
          p_refunded_by: string
          p_tenant_id: string
        }
        Returns: Json
      }
      register_patient_identity: {
        Args: { p_registration: Json; p_tenant_id: string }
        Returns: Json
      }
      resolve_patient_identity_match: {
        Args: {
          p_candidate_identity_id: string
          p_decision: string
          p_registration: Json
          p_tenant_id: string
        }
        Returns: Json
      }
      return_purchase_receipt_item: {
        Args: {
          p_quantity: number
          p_reason: string
          p_receipt_item_id: string
          p_returned_by: string
          p_tenant_id: string
        }
        Returns: Json
      }
      return_unused_inventory: {
        Args: {
          p_item_id: string
          p_quantity: number
          p_reason: string
          p_returned_by: string
          p_tenant_id: string
          p_treatment_plan_item_id: string
          p_visit_id: string
        }
        Returns: Json
      }
      run_followup_automation: { Args: never; Returns: Json }
      search_patient_records: {
        Args: { p_query?: string; p_tenant_id: string }
        Returns: {
          age_at_registration: number | null
          age_reference_date: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          family_name: string | null
          father_name: string | null
          file_number: string | null
          first_name: string
          first_name_ar: string | null
          first_visit_date: string | null
          gender: string | null
          id: string
          last_name: string
          last_name_ar: string | null
          mother_name: string | null
          national_id: string | null
          notes: string | null
          patient_status: string | null
          phone_primary: string
          phone_secondary: string | null
          preferred_channel: string | null
          referral_source: string | null
          tenant_id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "clinic_patients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_config: { Args: { key: string; value: string }; Returns: undefined }
      set_role_permissions: {
        Args: { p_permission_ids: string[]; p_role_id: string }
        Returns: undefined
      }
      set_tenant_id: { Args: { tenant_id: string }; Returns: undefined }
      set_workforce_payroll_period_status: {
        Args: {
          p_actor?: string
          p_payroll_period_id: string
          p_status: string
          p_tenant_id: string
        }
        Returns: Json
      }
      tenant_subscription_allows_permission: {
        Args: { p_permission_key: string; p_tenant_id: string }
        Returns: boolean
      }
      test_jwt_claims: {
        Args: never
        Returns: {
          claim: string
          value: string
        }[]
      }
      test_queue_access: { Args: never; Returns: string }
      update_patient_identity: {
        Args: {
          p_patient_id: string
          p_registration: Json
          p_tenant_id: string
        }
        Returns: Json
      }
      validate_procedure_resources_for_booking: {
        Args: {
          p_procedure_id: string
          p_resource_id: string
          p_tenant_id: string
        }
        Returns: Json
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
