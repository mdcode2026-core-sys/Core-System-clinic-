/**
 * Agenda Module — Conflict Engine
 * Isolated service. No UI logic. No Server Actions logic.
 * Rules: Doctor, Room, Patient only.
 * Phase 3 scope — no Availability Engine.
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
 */
export async function checkConflicts(
  input: ConflictCheckInput
): Promise<ConflictResult> {
  const { tenantId, doctorId, roomId, patientId, scheduledStart, scheduledEnd, excludeEventId } = input;

  // Validate input
  if (!tenantId || !doctorId || !patientId || !scheduledStart || !scheduledEnd) {
    return {
      hasConflict: false,
      rule: null,
      conflictingEventId: null,
      message: "",
    };
  }

  // Query overlapping events
  const overlappingEvents = await getOverlappingEvents(
    tenantId,
    scheduledStart,
    scheduledEnd,
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
// HELPER: Get overlapping events
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
      `and(scheduled_start.lte.${end},scheduled_end.gte.${start}),` +
      `and(scheduled_start.gte.${start},scheduled_start.lt.${end}),` +
      `and(scheduled_end.gt.${start},scheduled_end.lte.${end})`
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
