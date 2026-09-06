"use server";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { AgendaEventStatusValue, ValidStateTransitions, AgendaEventStatus } from "./agenda.types";
import { createAgendaEventMutation, updateAgendaEventMutation } from "./agenda.mutation-service";

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
  return { supabase, tenantId: clinicUser.tenant_id, permissions };
}
function can(permissions: string[], key: string) { return permissions.includes(key); }

export async function createAgendaEvent(formData: FormData) {
  const patientId = String(formData.get("patient_id") || "");
  const doctorId = String(formData.get("doctor_id") || "");
  const roomId = formData.get("room_id") ? String(formData.get("room_id")) : null;
  const resourceId = formData.get("resource_id") ? String(formData.get("resource_id")) : null;
  const procedureId = formData.get("procedure_id") ? String(formData.get("procedure_id")) : null;
  const inquiryId = formData.get("inquiry_id") ? String(formData.get("inquiry_id")) : null;
  const scheduledStart = String(formData.get("scheduled_start") || "");
  const scheduledEnd = String(formData.get("scheduled_end") || "");
  return createAgendaEventMutation({ patientId, doctorId, roomId, resourceId, procedureId, inquiryId, scheduledStart, scheduledEnd, notes: String(formData.get("notes") || "") || null });
}

export async function updateAgendaEvent(formData: FormData) {
  const eventId = String(formData.get("id") || "");
  const patientId = String(formData.get("patient_id") || "");
  const doctorId = String(formData.get("doctor_id") || "");
  const roomId = formData.get("room_id") ? String(formData.get("room_id")) : null;
  const resourceId = formData.get("resource_id") ? String(formData.get("resource_id")) : null;
  const procedureId = formData.get("procedure_id") ? String(formData.get("procedure_id")) : null;
  const scheduledStart = String(formData.get("scheduled_start") || "");
  const scheduledEnd = String(formData.get("scheduled_end") || "");
  return updateAgendaEventMutation({ eventId, patientId, doctorId, roomId, resourceId, procedureId, scheduledStart, scheduledEnd, reschedule: formData.get("reschedule") === "true", notes: String(formData.get("notes") || "") || null });
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
