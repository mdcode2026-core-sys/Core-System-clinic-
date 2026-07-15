export interface Patient {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  phone_primary: string;
  patient_status: "active" | "inactive" | "vip" | "blocked";
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PatientInsert {
  tenant_id: string;
  first_name: string;
  last_name: string;
  phone_primary: string;
  patient_status?: "active" | "inactive" | "vip" | "blocked";
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  phone_primary?: string;
  patient_status?: "active" | "inactive" | "vip" | "blocked";
}
