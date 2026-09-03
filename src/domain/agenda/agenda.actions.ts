"use server";
import { createClient } from "@/infrastructure/supabase/server";
import { checkConflicts, isValidTimeRange } from "./conflict.engine";
import { checkAvailability } from "./availability.engine";
import { AgendaEventInsert, AgendaEventStatusValue, ValidStateTransitions, AgendaEventStatus, AgendaEventUpdate } from "./agenda.types";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

const DATABASE_ERROR = "AGENDA_DATABASE_ERROR";
const TENANT_MISSING = "AGENDA_TENANT_MISSING";
const PERMISSION_DENIED = "AGENDA_PERMISSION_DENIED";
const STATE_CONFLICT = "AGENDA_STATE_CONFLICT";

async function resolveContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: clinicUser, error: clinicUserError } = await supabase.from("clinic_users").select("id, tenant_id, is_active").eq("auth_user_id", user.id).eq("is_active", true).maybeSingle();
  if (clinicUserError || !clinicUser) return null;
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id, permissions };
}
function can(permissions: string[], key: string) { return permissions.includes(key); }
async function resolveBufferEnd(supabase: Awaited<ReturnType<typeof createClient>>, procedureId: string | null, scheduledEnd: string) {
  if (!procedureId) return scheduledEnd;
  const { data } = await supabase.from("clinic_procedures").select("buffer_time_minutes").eq("id", procedureId).is("deleted_at", null).maybeSingle();
  const bufferMinutes = Number(data?.buffer_time_minutes ?? 0);
  if (!Number.isFinite(bufferMinutes) || bufferMinutes <= 0) return scheduledEnd;
  const end = new Date(scheduledEnd);
  end.setMinutes(end.getMinutes() + Math.min(bufferMinutes, 120));
  return end.toISOString();
}
async function validateResource(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string, resourceId: string | null) {
  if (!resourceId) return true;
  const { data } = await (supabase as any).from("clinic_resources").select("id").eq("id", resourceId).eq("tenant_id", tenantId).eq("status", "active").is("deleted_at", null).maybeSingle();
  return !!data;
}
async function validateAvailability(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string, doctorId: string, roomId: string | null, procedureId: string | null, scheduledStart: string, scheduledEnd: string, bufferEnd: string) {
  return checkAvailability({ tenantId, doctorId, roomId, procedureId, scheduledStart, scheduledEnd, bufferEnd }, supabase as any);
}

export async function createAgendaEvent(formData: FormData) {
  const ctx = await resolveContext(); if (!ctx) return { error: TENANT_MISSING }; if (!can(ctx.permissions, "agenda:create")) return { error: PERMISSION_DENIED };
  const patientId = String(formData.get("patient_id") || ""); const doctorId = String(formData.get("doctor_id") || ""); const roomId = formData.get("room_id") ? String(formData.get("room_id")) : null; const resourceId = formData.get("resource_id") ? String(formData.get("resource_id")) : null; const procedureId = formData.get("procedure_id") ? String(formData.get("procedure_id")) : null; const inquiryId = formData.get("inquiry_id") ? String(formData.get("inquiry_id")) : null; const scheduledStart = String(formData.get("scheduled_start") || ""); const scheduledEnd = String(formData.get("scheduled_end") || "");
  const timeValidation = isValidTimeRange(scheduledStart, scheduledEnd); if (!timeValidation.valid) return { error: timeValidation.message }; if (!(await validateResource(ctx.supabase, ctx.tenantId, resourceId))) return { error: "AGENDA_RESOURCE_UNAVAILABLE" };
  const bufferEnd = await resolveBufferEnd(ctx.supabase, procedureId, scheduledEnd); const availability = await validateAvailability(ctx.supabase, ctx.tenantId, doctorId, roomId, procedureId, scheduledStart, scheduledEnd, bufferEnd); if (!availability.isAvailable) return { error: `AGENDA_UNAVAILABLE|${availability.reason || "requested capacity is unavailable"}` };
  const conflictResult = await checkConflicts(ctx.supabase, { tenantId: ctx.tenantId, doctorId, roomId, resourceId, patientId, scheduledStart, scheduledEnd, bufferEnd }); if (conflictResult.hasConflict) return { error: conflictResult.message };
  const event: AgendaEventInsert = { tenant_id: ctx.tenantId, patient_id: patientId, doctor_id: doctorId, room_id: roomId, resource_id: resourceId, procedure_id: procedureId, inquiry_id: inquiryId, created_by: ctx.clinicUser.id, scheduled_start: scheduledStart, scheduled_end: scheduledEnd, buffer_end: bufferEnd, event_type: "appointment", status: AgendaEventStatus.SCHEDULED };
  const { data, error } = await ctx.supabase.from("master_agenda_events").insert(event).select().single(); if (error) { console.error("[createAgendaEvent] error:", error.message); return { error: DATABASE_ERROR }; } return { data };
}

export async function updateAgendaEvent(formData: FormData) {
  const ctx = await resolveContext(); if (!ctx) return { error: TENANT_MISSING }; if (!can(ctx.permissions, "agenda:update")) return { error: PERMISSION_DENIED };
  const eventId = String(formData.get("id") || ""); const patientId = String(formData.get("patient_id") || ""); const doctorId = String(formData.get("doctor_id") || ""); const roomId = formData.get("room_id") ? String(formData.get("room_id")) : null; const resourceId = formData.get("resource_id") ? String(formData.get("resource_id")) : null; const procedureId = formData.get("procedure_id") ? String(formData.get("procedure_id")) : null; const scheduledStart = String(formData.get("scheduled_start") || ""); const scheduledEnd = String(formData.get("scheduled_end") || "");
  const timeValidation = isValidTimeRange(scheduledStart, scheduledEnd); if (!timeValidation.valid) return { error: timeValidation.message }; if (!(await validateResource(ctx.supabase, ctx.tenantId, resourceId))) return { error: "AGENDA_RESOURCE_UNAVAILABLE" };
  const bufferEnd = await resolveBufferEnd(ctx.supabase, procedureId, scheduledEnd); const availability = await validateAvailability(ctx.supabase, ctx.tenantId, doctorId, roomId, procedureId, scheduledStart, scheduledEnd, bufferEnd); if (!availability.isAvailable) return { error: `AGENDA_UNAVAILABLE|${availability.reason || "requested capacity is unavailable"}` };
  const conflictResult = await checkConflicts(ctx.supabase, { tenantId: ctx.tenantId, doctorId, roomId, resourceId, patientId, scheduledStart, scheduledEnd, bufferEnd, excludeEventId: eventId }); if (conflictResult.hasConflict) return { error: conflictResult.message };
  const updates: AgendaEventUpdate = { patient_id: patientId, doctor_id: doctorId, room_id: roomId, resource_id: resourceId, procedure_id: procedureId, scheduled_start: scheduledStart, scheduled_end: scheduledEnd, buffer_end: bufferEnd, booking_notes: String(formData.get("notes") || "") || null, updated_at: new Date().toISOString() }; if (formData.get("reschedule") === "true") updates.status = AgendaEventStatus.RESCHEDULED;
  const { data, error } = await ctx.supabase.from("master_agenda_events").update(updates).eq("id", eventId).eq("tenant_id", ctx.tenantId).select().single(); if (error) { console.error("[updateAgendaEvent] error:", error.message); return { error: DATABASE_ERROR }; } return { data };
}

/** Atomic state transition: the submitted current_status is only the expected state, never the authoritative state. */
export async function updateAgendaEventStatus(formData: FormData) {
  const ctx = await resolveContext(); if (!ctx) return { error: TENANT_MISSING }; if (!can(ctx.permissions, "agenda:update")) return { error: PERMISSION_DENIED };
  const eventId = String(formData.get("id") || ""); const newStatus = String(formData.get("status") || "") as AgendaEventStatusValue; const expectedCurrentStatus = String(formData.get("current_status") || "") as AgendaEventStatusValue;
  const allowedTransitions = ValidStateTransitions[expectedCurrentStatus]; if (!allowedTransitions || !allowedTransitions.includes(newStatus)) return { error: `AGENDA_INVALID_STATUS_TRANSITION|${expectedCurrentStatus}|${newStatus}` };
  const { data, error } = await ctx.supabase.from("master_agenda_events").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", eventId).eq("tenant_id", ctx.tenantId).eq("status", expectedCurrentStatus).select().maybeSingle();
  if (error) { console.error("[updateAgendaEventStatus] error:", error.message); return { error: DATABASE_ERROR }; }
  if (!data) return { error: STATE_CONFLICT };
  return { data };
}

/** Atomic cancellation: the submitted current_status is only the expected state. */
export async function cancelAgendaEvent(formData: FormData) {
  const ctx = await resolveContext(); if (!ctx) return { error: TENANT_MISSING }; if (!can(ctx.permissions, "agenda:update")) return { error: PERMISSION_DENIED };
  const eventId = String(formData.get("id") || ""); const expectedCurrentStatus = String(formData.get("current_status") || "") as AgendaEventStatusValue; const cancellableStates: AgendaEventStatusValue[] = ["scheduled", "confirmed", "arrived", "in_session"];
  if (!cancellableStates.includes(expectedCurrentStatus)) return { error: `AGENDA_INVALID_CANCELLATION|${expectedCurrentStatus}` };
  const cancellationReason = String(formData.get("cancellation_reason") || "") || null;
  const { data, error } = await ctx.supabase.from("master_agenda_events").update({ status: AgendaEventStatus.CANCELLED, cancellation_reason: cancellationReason, updated_at: new Date().toISOString() }).eq("id", eventId).eq("tenant_id", ctx.tenantId).eq("status", expectedCurrentStatus).select().maybeSingle();
  if (error) { console.error("[cancelAgendaEvent] error:", error.message); return { error: DATABASE_ERROR }; }
  if (!data) return { error: STATE_CONFLICT };
  return { data };
}
