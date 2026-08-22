export type ClinicalVisitData = {
  examination: string;
  findings: string;
  decision: string;
};

export type VisitProcedure = {
  id: string;
  procedure_id: string;
  procedure_name: string;
  quantity: number;
  notes: string | null;
  performed_at: string | null;
};

export type ClinicalVisitRecord = {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string;
  room_id: string | null;
  agenda_event_id: string | null;
  session_status: string;
  session_started_at: string | null;
  session_ended_at: string | null;
  visit_closed_at: string | null;
  doctor_name: string | null;
  room_name: string | null;
  patient_name: string | null;
  patient_file_number: string | null;
  patient_phone: string | null;
  examination: string;
  findings: string;
  decision: string;
  procedures: VisitProcedure[];
};

export type ActiveClinicalProvider = {
  id: string;
  full_name: string;
  specialization: string | null;
};
