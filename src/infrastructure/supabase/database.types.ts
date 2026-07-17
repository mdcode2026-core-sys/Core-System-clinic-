export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      master_tenants: {
        Row: {
          id: string;
          clinic_name: string;
          subscription_tier: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_name: string;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          clinic_name?: string;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
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
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      clinic_patients: {
        Row: {
          id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          phone_primary: string;
          patient_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          phone_primary: string;
          patient_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          first_name?: string;
          last_name?: string;
          phone_primary?: string;
          patient_status?: string;
          created_at?: string;
        };
      };
      master_agenda_events: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string | null;
          doctor_id: string | null;
          room_id: string | null;
          procedure_id: string | null;
          scheduled_start: string;
          scheduled_end: string;
          event_type: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id?: string | null;
          doctor_id?: string | null;
          room_id?: string | null;
          procedure_id?: string | null;
          scheduled_start: string;
          scheduled_end: string;
          event_type?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string | null;
          doctor_id?: string | null;
          room_id?: string | null;
          procedure_id?: string | null;
          scheduled_start?: string;
          scheduled_end?: string;
          event_type?: string;
          status?: string;
          created_at?: string;
        };
      };
      clinic_visit_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          patient_id: string;
          doctor_id: string;
          room_id: string | null;
          agenda_event_id: string | null;
          session_status: string;
          lock_holder_id: string | null;
          lock_timestamp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          patient_id: string;
          doctor_id: string;
          room_id?: string | null;
          agenda_event_id?: string | null;
          session_status?: string;
          lock_holder_id?: string | null;
          lock_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          patient_id?: string;
          doctor_id?: string;
          room_id?: string | null;
          agenda_event_id?: string | null;
          session_status?: string;
          lock_holder_id?: string | null;
          lock_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clinic_invoices: {
        Row: {
          id: string;
          tenant_id: string;
          session_id: string;
          patient_id: string;
          subtotal_subunits: number;
          total_subunits: number;
          amount_paid_subunits: number;
          amount_due_subunits: number;
          invoice_status: string;
          invoice_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          session_id: string;
          patient_id: string;
          subtotal_subunits: number;
          total_subunits: number;
          amount_paid_subunits?: number;
          invoice_status?: string;
          invoice_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          session_id?: string;
          patient_id?: string;
          subtotal_subunits?: number;
          total_subunits?: number;
          amount_paid_subunits?: number;
          amount_due_subunits?: number;
          invoice_status?: string;
          invoice_date?: string;
          created_at?: string;
        };
      };
      analytics_daily_snapshots: {
        Row: {
          id: string;
          tenant_id: string;
          snapshot_date: string;
          total_visits: number;
          total_new_patients: number;
          avg_wait_time_minutes: number;
          avg_session_duration_minutes: number;
          total_revenue_subunits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          snapshot_date: string;
          total_visits?: number;
          total_new_patients?: number;
          avg_wait_time_minutes?: number;
          avg_session_duration_minutes?: number;
          total_revenue_subunits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          snapshot_date?: string;
          total_visits?: number;
          total_new_patients?: number;
          avg_wait_time_minutes?: number;
          avg_session_duration_minutes?: number;
          total_revenue_subunits?: number;
          created_at?: string;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          tenant_id: string | null;
          flag_key: string;
          flag_name: string;
          is_enabled: boolean;
          allowed_tiers: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          flag_key: string;
          flag_name: string;
          is_enabled?: boolean;
          allowed_tiers?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          flag_key?: string;
          flag_name?: string;
          is_enabled?: boolean;
          allowed_tiers?: string[];
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
