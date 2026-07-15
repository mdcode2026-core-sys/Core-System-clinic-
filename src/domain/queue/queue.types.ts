export interface QueueSession {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string;
  room_id?: string;
  agenda_event_id?: string;
  session_status: "waiting" | "in_consultation" | "pending_close" | "completed" | "cancelled";
  lock_holder_id?: string;
  lock_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionLock {
  sessionId: string;
  userId: string;
  acquiredAt: string;
}
