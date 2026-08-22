/**
 * Agenda Module — Types
 * Compatible with: database.types.ts → master_agenda_events
 * Stage 4: Extended with Availability Engine, Buffer Time, and Workflow types
 */

import type { Database } from "@/infrastructure/supabase/database.types";

export type AgendaEventRow = Database["public"]["Tables"]["master_agenda_events"]["Row"];
export type AgendaEventInsert = Database["public"]["Tables"]["master_agenda_events"]["Insert"];
export type AgendaEventUpdate = Database["public"]["Tables"]["master_agenda_events"]["Update"];

export const AgendaEventType = {
  APPOINTMENT: "appointment",
  BLOCK: "block",
  BREAK: "break",
  EMERGENCY: "emergency",
} as const;

export type AgendaEventTypeValue = typeof AgendaEventType[keyof typeof AgendaEventType];

export const AgendaEventStatus = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  ARRIVED: "arrived",
  IN_SESSION: "in_session",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
} as const;

export type AgendaEventStatusValue = typeof AgendaEventStatus[keyof typeof AgendaEventStatus];

export const ValidStateTransitions: Record<string, AgendaEventStatusValue[]> = {
  [AgendaEventStatus.SCHEDULED]: [AgendaEventStatus.CONFIRMED, AgendaEventStatus.CANCELLED, AgendaEventStatus.RESCHEDULED],
  [AgendaEventStatus.CONFIRMED]: [AgendaEventStatus.ARRIVED, AgendaEventStatus.NO_SHOW, AgendaEventStatus.CANCELLED, AgendaEventStatus.RESCHEDULED],
  [AgendaEventStatus.ARRIVED]: [AgendaEventStatus.IN_SESSION, AgendaEventStatus.NO_SHOW, AgendaEventStatus.CANCELLED],
  [AgendaEventStatus.IN_SESSION]: [AgendaEventStatus.COMPLETED, AgendaEventStatus.CANCELLED],
  [AgendaEventStatus.COMPLETED]: [],
  [AgendaEventStatus.NO_SHOW]: [AgendaEventStatus.RESCHEDULED],
  [AgendaEventStatus.CANCELLED]: [AgendaEventStatus.SCHEDULED],
  [AgendaEventStatus.RESCHEDULED]: [AgendaEventStatus.SCHEDULED],
};

export const ConflictRule = {
  DOCTOR: "doctor",
  ROOM: "room",
  PATIENT: "patient",
} as const;

export type ConflictRuleValue = typeof ConflictRule[keyof typeof ConflictRule];

export interface ConflictCheckInput {
  tenantId: string;
  doctorId: string;
  roomId: string | null;
  patientId: string;
  scheduledStart: string;
  scheduledEnd: string;
  bufferEnd?: string;
  excludeEventId?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  rule: ConflictRuleValue | null;
  conflictingEventId: string | null;
  message: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ProviderAvailabilityRow {
  id: string;
  tenant_id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  day: DayOfWeek;
  start: string;
  end: string;
  isWorking: boolean;
}

export interface AvailabilityCheckInput {
  tenantId: string;
  doctorId: string;
  roomId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  bufferEnd?: string;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  reason: string | null;
  details: {
    doctorAvailable: boolean;
    roomAvailable: boolean;
    withinWorkingHours: boolean;
    notBlocked: boolean;
  };
}

export interface BufferTimeConfig {
  enabled: boolean;
  bufferMinutes: number;
}

export interface ScheduledRange {
  scheduledStart: string;
  scheduledEnd: string;
  bufferEnd: string;
  effectiveDurationMinutes: number;
  bufferDurationMinutes: number;
}

export interface AgendaEventWithRelations extends AgendaEventRow {
  status: AgendaEventStatusValue;
  notes: string | null;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone_primary: string;
  } | null;
  doctor?: {
    id: string;
    full_name: string;
    full_name_ar: string | null;
    specialization: string | null;
  } | null;
  room?: {
    id: string;
    room_name: string;
  } | null;
  procedure?: {
    id: string;
    procedure_name: string;
    standard_duration_minutes: number;
    buffer_time_minutes: number;
  } | null;
}

export type CalendarViewMode = "day" | "week" | "month";

export interface CalendarRange {
  start: string;
  end: string;
}

export interface AgendaEventFormData {
  patient_id: string;
  doctor_id: string;
  room_id: string | null;
  procedure_id: string | null;
  inquiry_id: string | null;
  scheduled_start: string;
  scheduled_end: string;
  buffer_end: string;
  notes: string | null;
  event_type: AgendaEventTypeValue;
}

export interface AgendaEventFilters {
  doctorId?: string;
  roomId?: string;
  status?: AgendaEventStatusValue;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  eventType?: AgendaEventTypeValue;
}

export interface RescheduleInput {
  eventId: string;
  tenantId: string;
  newStart: string;
  newEnd: string;
  newBufferEnd?: string;
  reason?: string;
}

export interface ArrivalInput {
  eventId: string;
  tenantId: string;
  arrivedAt?: string;
}

export interface NoShowInput {
  eventId: string;
  tenantId: string;
  reason?: string;
}

export interface ConfirmationInput {
  eventId: string;
  tenantId: string;
  confirmedBy?: string;
}
