/**
 * Agenda Module — Availability Engine (Stage 4 Synchronized)
 * Reads persistent provider availability from:
 *   public.clinic_provider_availability
 * Reads block/break periods from:
 *   public.master_agenda_events (event_type = 'block' | 'break')
 * Room conflict protection is database-level (no_room_overlap constraint).
 * Tenant isolation via get_current_tenant_id().
 */

import { createClient } from "@/infrastructure/supabase/client";
import type {
  AvailabilityCheckInput,
  AvailabilityResult,
  WorkingHours,
} from "./agenda.types";

const supabase = createClient();

// ─────────────────────────────────────────
// FALLBACK DEFAULTS (when no persistent data)
// These are NOT the production authority.
// Production authority = clinic_provider_availability table.
// ─────────────────────────────────────────

export const DefaultWorkingHours: WorkingHours[] = [
  { day: 0, start: "09:00", end: "17:00", isWorking: true },
  { day: 1, start: "09:00", end: "17:00", isWorking: true },
  { day: 2, start: "09:00", end: "17:00", isWorking: true },
  { day: 3, start: "09:00", end: "17:00", isWorking: true },
  { day: 4, start: "09:00", end: "17:00", isWorking: true },
  { day: 5, start: "09:00", end: "14:00", isWorking: true },
  { day: 6, start: "00:00", end: "00:00", isWorking: false },
];

// ─────────────────────────────────────────
// FETCH PERSISTENT PROVIDER AVAILABILITY
// ─────────────────────────────────────────

/**
 * Load provider working hours from the persistent table.
 * Falls back to DefaultWorkingHours if no records exist.
 */
export async function loadProviderAvailability(
  tenantId: string,
  doctorId: string
): Promise<WorkingHours[]> {
  const { data, error } = await supabase
    .from("clinic_provider_availability")
    .select("day_of_week, start_time, end_time, is_active")
    .eq("tenant_id", tenantId)
    .eq("doctor_id", doctorId)
    .eq("is_active", true)
    .or(`valid_from.is.null,valid_from.lte.${new Date().toISOString()}`)
    .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Availability Engine — Load error:", error);
    return DefaultWorkingHours;
  }

  if (!data || data.length === 0) {
    return DefaultWorkingHours;
  }

  return data.map((row) => ({
    day: row.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    start: row.start_time,
    end: row.end_time,
    isWorking: row.is_active,
  }));
}

// ─────────────────────────────────────────
// FETCH BLOCK/BREAK PERIODS FROM AGENDA
// ─────────────────────────────────────────

/**
 * Load block/break periods from master_agenda_events.
 * Canonical source for specific blocked/break periods.
 */
export async function loadBlockedPeriods(
  tenantId: string,
  doctorId?: string,
  roomId?: string | null
): Promise<Array<{ start: string; end: string; title: string }>> {
  let query = supabase
    .from("master_agenda_events")
    .select("scheduled_start, scheduled_end, buffer_end, booking_notes, event_type, doctor_id, room_id")
    .eq("tenant_id", tenantId)
    .in("event_type", ["block", "break"])
    .not("status", "in", "(cancelled,no_show,completed)");

  if (doctorId) {
    query = query.eq("doctor_id", doctorId);
  }
  if (roomId) {
    query = query.eq("room_id", roomId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Availability Engine — Block load error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    start: row.scheduled_start,
    end: row.buffer_end || row.scheduled_end,
    title: row.booking_notes || row.event_type,
  }));
}

// ─────────────────────────────────────────
// MAIN AVAILABILITY CHECK
// ─────────────────────────────────────────

export async function checkAvailability(
  input: AvailabilityCheckInput
): Promise<AvailabilityResult> {
  const {
    tenantId,
    doctorId,
    roomId,
    scheduledStart,
    scheduledEnd,
    bufferEnd,
  } = input;

  const startDate = new Date(scheduledStart);
  const endDate = new Date(bufferEnd || scheduledEnd);

  // 1. Load persistent provider availability
  const workingHours = await loadProviderAvailability(tenantId, doctorId);

  // 2. Check working hours
  const withinWorkingHours = isWithinWorkingHours(startDate, endDate, workingHours);

  // 3. Load block/break periods from agenda
  const blockedPeriods = await loadBlockedPeriods(tenantId, doctorId, roomId);

  // 4. Check blocked periods
  const notBlocked = !isBlocked(startDate, endDate, blockedPeriods);

  // 5. Check existing events (doctor) — application-level validation
  const doctorAvailable = await isDoctorAvailable(tenantId, doctorId, scheduledStart, bufferEnd || scheduledEnd);

  // 6. Check existing events (room) — application-level validation
  // Database-level protection exists via no_room_overlap constraint.
  const roomAvailable = roomId
    ? await isRoomAvailable(tenantId, roomId, scheduledStart, bufferEnd || scheduledEnd)
    : true;

  const isAvailable = withinWorkingHours && notBlocked && doctorAvailable && roomAvailable;

  let reason: string | null = null;
  if (!withinWorkingHours) {
    reason = "الموعد خارج ساعات العمل";
  } else if (!notBlocked) {
    reason = "الفترة محجوزة كوقت محظور أو استراحة";
  } else if (!doctorAvailable) {
    reason = "الطبيب غير متاح في هذا الوقت";
  } else if (!roomAvailable) {
    reason = "الغرفة غير متاحة في هذا الوقت";
  }

  return {
    isAvailable,
    reason,
    details: {
      doctorAvailable,
      roomAvailable,
      withinWorkingHours,
      notBlocked,
    },
  };
}

// ─────────────────────────────────────────
// WORKING HOURS CHECK
// ─────────────────────────────────────────

function isWithinWorkingHours(
  start: Date,
  end: Date,
  workingHours: WorkingHours[]
): boolean {
  const dayOfWeek = start.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const dayConfig = workingHours.find((wh) => wh.day === dayOfWeek);

  if (!dayConfig || !dayConfig.isWorking) {
    return false;
  }

  const [startHour, startMinute] = dayConfig.start.split(":").map(Number);
  const [endHour, endMinute] = dayConfig.end.split(":").map(Number);

  const workStart = new Date(start);
  workStart.setHours(startHour, startMinute, 0, 0);

  const workEnd = new Date(start);
  workEnd.setHours(endHour, endMinute, 0, 0);

  return start >= workStart && end <= workEnd;
}

// ─────────────────────────────────────────
// BLOCKED PERIODS CHECK (from agenda events)
// ─────────────────────────────────────────

function isBlocked(
  start: Date,
  end: Date,
  blockedPeriods: Array<{ start: string; end: string }>
): boolean {
  for (const period of blockedPeriods) {
    const blockStart = new Date(period.start);
    const blockEnd = new Date(period.end);
    const overlaps = start < blockEnd && end > blockStart;
    if (overlaps) return true;
  }
  return false;
}

// ─────────────────────────────────────────
// DOCTOR AVAILABILITY (application-level check)
// ─────────────────────────────────────────

async function isDoctorAvailable(
  tenantId: string,
  doctorId: string,
  start: string,
  end: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("master_agenda_events")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("doctor_id", doctorId)
    .not("status", "in", "(cancelled,no_show,completed)")
    .or(
      `and(scheduled_start.lte.${end},buffer_end.gte.${start}),` +
      `and(scheduled_start.gte.${start},scheduled_start.lt.${end})`
    )
    .limit(1);

  if (error) {
    console.error("Availability Engine — Doctor check error:", error);
    return false;
  }

  return (data ?? []).length === 0;
}

// ─────────────────────────────────────────
// ROOM AVAILABILITY (application-level check)
// Database-level protection: no_room_overlap constraint
// ─────────────────────────────────────────

async function isRoomAvailable(
  tenantId: string,
  roomId: string,
  start: string,
  end: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("master_agenda_events")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("room_id", roomId)
    .not("status", "in", "(cancelled,no_show,completed)")
    .or(
      `and(scheduled_start.lte.${end},buffer_end.gte.${start}),` +
      `and(scheduled_start.gte.${start},scheduled_start.lt.${end})`
    )
    .limit(1);

  if (error) {
    console.error("Availability Engine — Room check error:", error);
    return false;
  }

  return (data ?? []).length === 0;
}

// ─────────────────────────────────────────
// BATCH AVAILABILITY CHECK
// ─────────────────────────────────────────

export async function checkAvailabilityBatch(
  inputs: AvailabilityCheckInput[]
): Promise<AvailabilityResult[]> {
  const results: AvailabilityResult[] = [];
  for (const input of inputs) {
    const result = await checkAvailability(input);
    results.push(result);
  }
  return results;
}

// ─────────────────────────────────────────
// BUFFER TIME HELPERS
// ─────────────────────────────────────────

export function calculateBufferEnd(
  scheduledEnd: string,
  bufferMinutes: number
): string {
  const endDate = new Date(scheduledEnd);
  endDate.setMinutes(endDate.getMinutes() + bufferMinutes);
  return endDate.toISOString();
}

export function getEffectiveEnd(
  scheduledEnd: string,
  bufferEnd?: string | null
): string {
  return bufferEnd || scheduledEnd;
}
