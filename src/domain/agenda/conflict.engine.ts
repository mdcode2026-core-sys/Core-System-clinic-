/**
 * Agenda Module — Conflict Engine (Stage 4 Synchronized)
 *
 * Database-level protection exists:
 * - no_doctor_overlap: GiST exclusion constraint (doctor + scheduled_start/buffer_end)
 * - no_room_overlap: GiST exclusion constraint (room + scheduled_start/buffer_end)
 *
 * This engine provides application-level validation for user-facing feedback.
 * It must remain consistent with the database constraints.
 */

import { createClient } from "@/infrastructure/supabase/client";
import type {
  ConflictCheckInput,
  ConflictResult,
  ConflictRuleValue,
  AgendaEventRow,
} from "./agenda.types";

const supabase = createClient();

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const CONFLICT_RULES: ConflictRuleValue[] = ["doctor", "room", "patient"];

// ─────────────────────────────────────────
// MAIN CHECK FUNCTION
// ─────────────────────────────────────────

/**
 * Check for scheduling conflicts.
 * Returns the FIRST conflict found (order: doctor → room → patient).
 * Stage 4: Now buffer-aware — uses buffer_end for overlap detection.
 */
export async function checkConflicts(
  input: ConflictCheckInput
): Promise<ConflictResult> {
  const { tenantId, doctorId, roomId, patientId, scheduledStart, scheduledEnd, bufferEnd, excludeEventId } = input;

  // Validate input
  if (!tenantId || !doctorId || !patientId || !scheduledStart || !scheduledEnd) {
    return {
      hasConflict: false,
      rule: null,
      conflictingEventId: null,
      message: "",
    };
  }

  // Use buffer_end for conflict detection if provided
  const effectiveEnd = bufferEnd || scheduledEnd;

  // Query overlapping events (buffer-aware)
  const overlappingEvents = await getOverlappingEvents(
    tenantId,
    scheduledStart,
    effectiveEnd,
    excludeEventId
  );

  if (!overlappingEvents || overlappingEvents.length === 0) {
    return {
      hasConflict: false,
      rule: null,
      conflictingEventId: null,
      message: "",
    };
  }

  // Check each rule in order
  for (const rule of CONFLICT_RULES) {
    const conflict = findConflict(overlappingEvents, rule, {
      doctorId,
      roomId,
      patientId,
    });

    if (conflict) {
      return {
        hasConflict: true,
        rule,
        conflictingEventId: conflict.id,
        message: getConflictMessage(rule, conflict),
      };
    }
  }

  // No conflicts found
  return {
    hasConflict: false,
    rule: null,
    conflictingEventId: null,
    message: "",
  };
}

// ─────────────────────────────────────────
// HELPER: Get overlapping events (BUFFER-AWARE)
// Stage 4: Uses buffer_end for overlap detection
// ─────────────────────────────────────────

async function getOverlappingEvents(
  tenantId: string,
  start: string,
  end: string,
  excludeEventId?: string
): Promise<AgendaEventRow[]> {
  let query = supabase
    .from("master_agenda_events")
    .select("*")
    .eq("tenant_id", tenantId)
    .not("status", "in", "(cancelled,no_show,completed)")
    .or(
      `and(scheduled_start.lte.${end},buffer_end.gte.${start}),` +
      `and(scheduled_start.gte.${start},scheduled_start.lt.${end}),` +
      `and(buffer_end.gt.${start},buffer_end.lte.${end})`
    );

  if (excludeEventId) {
    query = query.neq("id", excludeEventId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Conflict Engine — Query Error:", error);
    return [];
  }

  return (data ?? []) as AgendaEventRow[];
}

// ─────────────────────────────────────────
// HELPER: Find conflict by rule
// ─────────────────────────────────────────

function findConflict(
  events: AgendaEventRow[],
  rule: ConflictRuleValue,
  ids: { doctorId: string; roomId: string | null; patientId: string }
): AgendaEventRow | null {
  for (const event of events) {
    switch (rule) {
      case "doctor":
        if (event.doctor_id === ids.doctorId) {
          return event;
        }
        break;
      case "room":
        if (ids.roomId && event.room_id === ids.roomId) {
          return event;
        }
        break;
      case "patient":
        if (event.patient_id === ids.patientId) {
          return event;
        }
        break;
    }
  }
  return null;
}

// ─────────────────────────────────────────
// HELPER: Conflict message
// ─────────────────────────────────────────

function getConflictMessage(
  rule: ConflictRuleValue,
  event: AgendaEventRow
): string {
  const startTime = new Date(event.scheduled_start).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  switch (rule) {
    case "doctor":
      return `الطبيب لديه موعد آخر الساعة ${startTime}`;
    case "room":
      return `الغرفة محجوزة الساعة ${startTime}`;
    case "patient":
      return `المريض لديه موعد آخر الساعة ${startTime}`;
    default:
      return "يوجد تعارض في الجدول";
  }
}

// ─────────────────────────────────────────
// BATCH CHECK (for bulk operations)
// ─────────────────────────────────────────

export async function checkConflictsBatch(
  inputs: ConflictCheckInput[]
): Promise<ConflictResult[]> {
  const results: ConflictResult[] = [];

  for (const input of inputs) {
    const result = await checkConflicts(input);
    results.push(result);
  }

  return results;
}

// ─────────────────────────────────────────
// VALIDATION: Is time range valid?
// ─────────────────────────────────────────

export function isValidTimeRange(
  start: string,
  end: string
): { valid: boolean; message?: string } {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, message: "التاريخ غير صالح" };
  }

  if (endDate <= startDate) {
    return { valid: false, message: "وقت النهاية يجب أن يكون بعد وقت البداية" };
  }

  const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  if (durationMinutes < 5) {
    return { valid: false, message: "الموعد يجب أن يكون 5 دقائق على الأقل" };
  }

  if (durationMinutes > 480) {
    return { valid: false, message: "الموعد يجب أن لا يتجاوز 8 ساعات" };
  }

  return { valid: true };
}

// ─────────────────────────────────────────
// BUFFER TIME VALIDATION (Stage 4)
// ─────────────────────────────────────────

export function validateBufferTime(
  scheduledEnd: string,
  bufferEnd: string
): { valid: boolean; message?: string } {
  const end = new Date(scheduledEnd);
  const buffer = new Date(bufferEnd);

  if (isNaN(end.getTime()) || isNaN(buffer.getTime())) {
    return { valid: false, message: "وقت الـ buffer غير صالح" };
  }

  if (buffer < end) {
    return { valid: false, message: "وقت الـ buffer يجب أن يكون بعد وقت النهاية" };
  }

  const bufferMinutes = (buffer.getTime() - end.getTime()) / (1000 * 60);
  if (bufferMinutes > 120) {
    return { valid: false, message: "الـ buffer يجب أن لا يتجاوز ساعتين" };
  }

  return { valid: true };
}
