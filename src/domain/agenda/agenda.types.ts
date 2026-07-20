/**
 * Agenda Module — Types
 * Compatible with: database.types.ts → master_agenda_events
 * No database changes required.
 */

import type { Database } from "@/infrastructure/supabase/database.types";

// ─────────────────────────────────────────
// BASE TYPES (from database)
// ─────────────────────────────────────────

export type AgendaEventRow = Database["public"]["Tables"]["master_agenda_events"]["Row"];
export type AgendaEventInsert = Database["public"]["Tables"]["master_agenda_events"]["Insert"];
export type AgendaEventUpdate = Database["public"]["Tables"]["master_agenda_events"]["Update"];

// ─────────────────────────────────────────
// STATUS ENUMS — Valid states only
// These match the State Transition Matrix
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// VALID STATE TRANSITIONS
// Any transition NOT listed here = FORBIDDEN
// ─────────────────────────────────────────

export const ValidStateTransitions: Record<string, AgendaEventStatusValue[]> = {
  [AgendaEventStatus.SCHEDULED]: [
    AgendaEventStatus.CONFIRMED,
    AgendaEventStatus.CANCELLED,
    AgendaEventStatus.RESCHEDULED,
  ],
  [AgendaEventStatus.CONFIRMED]: [
    AgendaEventStatus.ARRIVED,
    AgendaEventStatus.NO_SHOW,
    AgendaEventStatus.CANCELLED,
    AgendaEventStatus.RESCHEDULED,
  ],
  [AgendaEventStatus.ARRIVED]: [
    AgendaEventStatus.IN_SESSION,
    AgendaEventStatus.NO_SHOW,
    AgendaEventStatus.CANCELLED,
  ],
  [AgendaEventStatus.IN_SESSION]: [
    AgendaEventStatus.COMPLETED,
    AgendaEventStatus.CANCELLED,
  ],
  [AgendaEventStatus.COMPLETED]: [], // Terminal state
  [AgendaEventStatus.NO_SHOW]: [
    AgendaEventStatus.RESCHEDULED,
  ],
  [AgendaEventStatus.CANCELLED]: [
    AgendaEventStatus.SCHEDULED, // Re-booking
  ],
  [AgendaEventStatus.RESCHEDULED]: [
    AgendaEventStatus.SCHEDULED,
  ],
};

// ─────────────────────────────────────────
// CONFLICT RULES
// ─────────────────────────────────────────

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
  excludeEventId?: string; // For updates — exclude self
}

export interface ConflictResult {
  hasConflict: boolean;
  rule: ConflictRuleValue | null;
  conflictingEventId: string | null;
  message: string;
}

// ─────────────────────────────────────────
// EVENT WITH RELATIONS (for UI)
// ─────────────────────────────────────────

export interface AgendaEventWithRelations extends AgendaEventRow {
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
    room_name_ar: string | null;
  } | null;
  procedure?: {
    id: string;
    procedure_name: string;
    standard_duration_minutes: number;
  } | null;
}

// ─────────────────────────────────────────
// CALENDAR VIEW TYPES
// ─────────────────────────────────────────

export type CalendarViewMode = "day" | "week" | "month";

export interface CalendarRange {
  start: string; // ISO date
  end: string;   // ISO date
}

// ─────────────────────────────────────────
// FORM TYPES
// ─────────────────────────────────────────

export interface AgendaEventFormData {
  patient_id: string;
  doctor_id: string;
  room_id: string | null;
  procedure_id: string | null;
  inquiry_id: string | null;
  scheduled_start: string; // ISO datetime
  scheduled_end: string;   // ISO datetime
  notes: string | null;
}

// ─────────────────────────────────────────
// FILTER TYPES
// ─────────────────────────────────────────

export interface AgendaEventFilters {
  doctorId?: string;
  roomId?: string;
  status?: AgendaEventStatusValue;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}
