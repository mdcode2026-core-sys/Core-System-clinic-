// src/domain/queue/queue.types.ts
// Phase 4 — Queue Management Module

export type SessionStatus = "waiting" | "in_consultation" | "pending_close" | "completed" | "cancelled" | "no_show";

export enum VisitPriority { NORMAL = 0, HIGH = 1, URGENT = 2 }
export enum QueueLane { GENERAL = "general", DOCTOR = "doctor", URGENT = "urgent" }

export interface QueueSession {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string;
  room_id?: string;
  agenda_event_id?: string;
  session_status: SessionStatus;
  lock_holder_id?: string;
  lock_timestamp?: string;
  session_started_at?: string;
  session_duration_minutes?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SessionLock { sessionId: string; userId: string; acquiredAt: string; }

export interface EnrichedSession extends QueueSession {
  patient_name?: string;
  patient_phone?: string;
  patient_file_number?: string;
  doctor_name?: string;
  room_name?: string;
  procedure_name?: string;
  estimated_duration_minutes?: number | null;
  wait_time_minutes?: number;
  priority?: VisitPriority;
  lane?: QueueLane;
  notes?: string | null;
  queue_position?: number;
}

export interface QueueStats { total_waiting: number; total_in_consultation: number; total_completed_today: number; total_no_show_today: number; avg_wait_time_minutes: number; longest_wait_minutes: number; }
export interface QueueFilters { status?: SessionStatus[]; doctor_id?: string; lane?: QueueLane; search?: string; }
export interface SessionActionResult { success: boolean; session?: EnrichedSession; error?: string; }
