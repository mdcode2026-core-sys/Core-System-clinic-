/** Agenda conflict and time validation engine. Domain layer returns stable codes; UI localizes them. */
import type { createClient } from "@/infrastructure/supabase/server";
import type { ConflictCheckInput, ConflictResult, ConflictRuleValue, AgendaEventRow } from "./agenda.types";
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
const CONFLICT_RULES: ConflictRuleValue[] = ["doctor", "room", "resource", "patient"];

export async function checkConflicts(supabase: SupabaseServerClient, input: ConflictCheckInput): Promise<ConflictResult> {
  const { tenantId, doctorId, roomId, resourceId, patientId, scheduledStart, scheduledEnd, bufferEnd, excludeEventId } = input;
  if (!tenantId || !doctorId || !patientId || !scheduledStart || !scheduledEnd) return { hasConflict: false, rule: null, conflictingEventId: null, message: "" };
  const overlappingEvents = await getOverlappingEvents(supabase, tenantId, scheduledStart, bufferEnd || scheduledEnd, excludeEventId);
  if (!overlappingEvents?.length) return { hasConflict: false, rule: null, conflictingEventId: null, message: "" };
  for (const rule of CONFLICT_RULES) {
    const conflict = findConflict(overlappingEvents, rule, { doctorId, roomId, resourceId: resourceId ?? null, patientId });
    if (conflict) return { hasConflict: true, rule, conflictingEventId: conflict.id, message: getConflictMessage(rule, conflict) };
  }
  return { hasConflict: false, rule: null, conflictingEventId: null, message: "" };
}

async function getOverlappingEvents(supabase: SupabaseServerClient, tenantId: string, start: string, end: string, excludeEventId?: string): Promise<AgendaEventRow[]> {
  let query = supabase.from("master_agenda_events").select("*").eq("tenant_id", tenantId).not("status", "in", "(cancelled,no_show,completed)").or(`and(scheduled_start.lte.${end},buffer_end.gte.${start}),and(scheduled_start.gte.${start},scheduled_start.lt.${end}),and(buffer_end.gt.${start},buffer_end.lte.${end})`);
  if (excludeEventId) query = query.neq("id", excludeEventId);
  const { data, error } = await query;
  if (error) { console.error("Conflict Engine — Query Error:", error); return []; }
  return (data ?? []) as AgendaEventRow[];
}

function findConflict(events: AgendaEventRow[], rule: ConflictRuleValue, ids: { doctorId: string; roomId: string | null; resourceId: string | null; patientId: string }): AgendaEventRow | null {
  for (const event of events) {
    if (rule === "doctor" && event.doctor_id === ids.doctorId) return event;
    if (rule === "room" && ids.roomId && event.room_id === ids.roomId) return event;
    if (rule === "resource" && ids.resourceId && event.resource_id === ids.resourceId) return event;
    if (rule === "patient" && event.patient_id === ids.patientId) return event;
  }
  return null;
}

function getConflictMessage(rule: ConflictRuleValue, event: AgendaEventRow): string {
  const startTime = new Date(event.scheduled_start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, numberingSystem: "latn" });
  return `AGENDA_CONFLICT_${rule.toUpperCase()}|${startTime}`;
}

export async function checkConflictsBatch(supabase: SupabaseServerClient, inputs: ConflictCheckInput[]): Promise<ConflictResult[]> {
  const results: ConflictResult[] = [];
  for (const input of inputs) results.push(await checkConflicts(supabase, input));
  return results;
}

export function isValidTimeRange(start: string, end: string): { valid: boolean; message?: string } {
  const startDate = new Date(start); const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return { valid: false, message: "AGENDA_INVALID_TIME_RANGE" };
  const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
  if (endDate <= startDate) return { valid: false, message: "AGENDA_INVALID_TIME_RANGE" };
  if (durationMinutes < 5) return { valid: false, message: "AGENDA_DURATION_TOO_SHORT" };
  if (durationMinutes > 480) return { valid: false, message: "AGENDA_DURATION_TOO_LONG" };
  return { valid: true };
}

export function validateBufferTime(scheduledEnd: string, bufferEnd: string): { valid: boolean; message?: string } {
  const end = new Date(scheduledEnd); const buffer = new Date(bufferEnd);
  if (isNaN(end.getTime()) || isNaN(buffer.getTime())) return { valid: false, message: "AGENDA_INVALID_BUFFER" };
  if (buffer < end) return { valid: false, message: "AGENDA_BUFFER_BEFORE_END" };
  const bufferMinutes = (buffer.getTime() - end.getTime()) / 60000;
  if (bufferMinutes > 120) return { valid: false, message: "AGENDA_BUFFER_TOO_LONG" };
  return { valid: true };
}
