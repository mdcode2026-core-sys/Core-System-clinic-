export interface Patient {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  first_name_ar?: string;
  last_name_ar?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  preferred_channel?: "whatsapp" | "sms" | "email" | "phone";
  first_visit_date?: string;
  referral_source?: string;
  patient_status: "active" | "inactive" | "archived" | "blocked";
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PatientInsert {
  tenant_id: string;
  first_name: string;
  last_name: string;
  first_name_ar?: string;
  last_name_ar?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  preferred_channel?: "whatsapp" | "sms" | "email" | "phone";
  first_visit_date?: string;
  referral_source?: string;
  patient_status?: "active" | "inactive" | "archived" | "blocked";
  notes?: string;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  first_name_ar?: string;
  last_name_ar?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  preferred_channel?: "whatsapp" | "sms" | "email" | "phone";
  first_visit_date?: string;
  referral_source?: string;
  patient_status?: "active" | "inactive" | "archived" | "blocked";
  notes?: string;
}

export interface PatientHistory {
  id: string;
  tenant_id: string;
  patient_id: string;
  last_visit_date?: string;
  total_visits?: number;
  total_spent_subunits?: number;
  preferred_procedure?: string;
  satisfaction_score?: number;
  retention_risk?: "low" | "medium" | "high";
  next_followup_date?: string;
  created_at: string;
  updated_at: string;
}
