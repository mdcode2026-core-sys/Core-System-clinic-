export interface AgendaEvent {
  id: string;
  tenant_id: string;
  patient_id?: string;
  doctor_id?: string;
  room_id?: string;
  procedure_id?: string;
  scheduled_start: string;
  scheduled_end: string;
  event_type: "appointment" | "block" | "break" | "emergency";
  status: "scheduled" | "confirmed" | "arrived" | "in_session" | "completed" | "no_show" | "cancelled" | "rescheduled";
  notes?: string;
  created_at: string;
}

export interface AgendaEventInsert {
  tenant_id: string;
  patient_id?: string;
  doctor_id?: string;
  room_id?: string;
  procedure_id?: string;
  scheduled_start: string;
  scheduled_end: string;
  event_type?: "appointment" | "block" | "break" | "emergency";
  status?: "scheduled" | "confirmed" | "arrived" | "in_session" | "completed" | "no_show" | "cancelled" | "rescheduled";
  notes?: string;
}
