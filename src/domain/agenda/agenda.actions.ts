"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { checkConflicts, isValidTimeRange } from "./conflict.engine";
import { AgendaEventInsert, AgendaEventStatusValue, ValidStateTransitions, AgendaEventStatus, AgendaEventUpdate } from "./agenda.types";

const DATABASE_ERROR = "AGENDA_DATABASE_ERROR";
const TENANT_MISSING = "AGENDA_TENANT_MISSING";

export async function createAgendaEvent(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) return { error: TENANT_MISSING };
  const patientId = String(formData.get("patient_id")); const doctorId = String(formData.get("doctor_id")); const roomId = formData.get("room_id") ? String(formData.get("room_id")) : null; const procedureId = formData.get("procedure_id") ? String(formData.get("procedure_id")) : null; const inquiryId = formData.get("inquiry_id") ? String(formData.get("inquiry_id")) : null; const scheduledStart = String(formData.get("scheduled_start")); const scheduledEnd = String(formData.get("scheduled_end")); const createdBy = String(formData.get("created_by"));
  const timeValidation = isValidTimeRange(scheduledStart, scheduledEnd); if (!timeValidation.valid) return { error: timeValidation.message };
  const conflictResult = await checkConflicts({ tenantId, doctorId, roomId, patientId, scheduledStart, scheduledEnd }); if (conflictResult.hasConflict) return { error: conflictResult.message };
  const event: AgendaEventInsert = { tenant_id: tenantId, patient_id: patientId, doctor_id: doctorId, room_id: roomId, procedure_id: procedureId, inquiry_id: inquiryId, created_by: createdBy, scheduled_start: scheduledStart, scheduled_end: scheduledEnd, buffer_end: scheduledEnd, event_type: "appointment", status: AgendaEventStatus.SCHEDULED };
  const { data, error } = await supabase.from("master_agenda_events").insert(event).select().single(); if (error) { console.error("[createAgendaEvent] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/agenda"); return { data };
}

export async function updateAgendaEvent(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); if (!tenantId) return { error: TENANT_MISSING };
  const eventId = String(formData.get("id")); const patientId = String(formData.get("patient_id")); const doctorId = String(formData.get("doctor_id")); const roomId = formData.get("room_id") ? String(formData.get("room_id")) : null; const procedureId = formData.get("procedure_id") ? String(formData.get("procedure_id")) : null; const scheduledStart = String(formData.get("scheduled_start")); const scheduledEnd = String(formData.get("scheduled_end"));
  const timeValidation = isValidTimeRange(scheduledStart, scheduledEnd); if (!timeValidation.valid) return { error: timeValidation.message };
  const conflictResult = await checkConflicts({ tenantId, doctorId, roomId, patientId, scheduledStart, scheduledEnd, excludeEventId: eventId }); if (conflictResult.hasConflict) return { error: conflictResult.message };
  const updates: AgendaEventUpdate = { patient_id: patientId, doctor_id: doctorId, room_id: roomId, procedure_id: procedureId, scheduled_start: scheduledStart, scheduled_end: scheduledEnd, buffer_end: scheduledEnd, updated_at: new Date().toISOString() };
  if (formData.get("reschedule") === "true") updates.status = AgendaEventStatus.RESCHEDULED;
  const { data, error } = await supabase.from("master_agenda_events").update(updates).eq("id", eventId).eq("tenant_id", tenantId).select().single(); if (error) { console.error("[updateAgendaEvent] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/agenda"); return { data };
}

export async function updateAgendaEventStatus(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); if (!tenantId) return { error: TENANT_MISSING };
  const eventId = String(formData.get("id")); const newStatus = String(formData.get("status")) as AgendaEventStatusValue; const currentStatus = String(formData.get("current_status")) as AgendaEventStatusValue;
  const allowedTransitions = ValidStateTransitions[currentStatus]; if (!allowedTransitions || !allowedTransitions.includes(newStatus)) return { error: `AGENDA_INVALID_STATUS_TRANSITION|${currentStatus}|${newStatus}` };
  const { data, error } = await supabase.from("master_agenda_events").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", eventId).eq("tenant_id", tenantId).select().single(); if (error) { console.error("[updateAgendaEventStatus] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/agenda"); return { data };
}

export async function cancelAgendaEvent(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); if (!tenantId) return { error: TENANT_MISSING };
  const eventId = String(formData.get("id")); const currentStatus = String(formData.get("current_status")) as AgendaEventStatusValue; const cancellableStates: AgendaEventStatusValue[] = ["scheduled", "confirmed", "arrived", "in_session"];
  if (!cancellableStates.includes(currentStatus)) return { error: `AGENDA_INVALID_CANCELLATION|${currentStatus}` };
  const { data, error } = await supabase.from("master_agenda_events").update({ status: AgendaEventStatus.CANCELLED, updated_at: new Date().toISOString() }).eq("id", eventId).eq("tenant_id", tenantId).select().single(); if (error) { console.error("[cancelAgendaEvent] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/agenda"); return { data };
}
