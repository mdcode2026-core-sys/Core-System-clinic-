import { createClient } from "@/infrastructure/supabase/server";
import { checkConflicts, isValidTimeRange } from "./conflict.engine";
import { checkAvailability } from "./availability.engine";
import { AgendaEventInsert, AgendaEventStatus, AgendaEventUpdate } from "./agenda.types";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { tenantLocalToUtc } from "@/shared/utils/dateTime";

const DATABASE_ERROR = "AGENDA_DATABASE_ERROR";
const TENANT_MISSING = "AGENDA_TENANT_MISSING";
const PERMISSION_DENIED = "AGENDA_PERMISSION_DENIED";

export interface AgendaMutationInput {
  patientId: string;
  doctorId: string;
  roomId: string | null;
  resourceId: string | null;
  procedureId: string | null;
  inquiryId?: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string | null;
}

export interface AgendaUpdateInput extends AgendaMutationInput {
  eventId: string;
  reschedule?: boolean;
}

async function resolveContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: clinicUser, error: clinicUserError } = await supabase
    .from("clinic_users")
    .select("id, tenant_id, is_active")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (clinicUserError || !clinicUser) return null;
  const permissions = await getEffectivePermissions(user.id, clinicUser.tenant_id);
  const { data: tenant } = await supabase
    .from("master_tenants")
    .select("timezone")
    .eq("id", clinicUser.tenant_id)
    .maybeSingle();
  return {
    supabase,
    clinicUser,
    tenantId: clinicUser.tenant_id,
    tenantTimezone: tenant?.timezone || "UTC",
    permissions,
  };
}

function can(permissions: string[], key: string) {
  return permissions.includes(key);
}

async function resolveBufferEnd(supabase: Awaited<ReturnType<typeof createClient>>, procedureId: string | null, scheduledEnd: string) {
  if (!procedureId) return scheduledEnd;
  const { data } = await supabase
    .from("clinic_procedures")
    .select("buffer_time_minutes")
    .eq("id", procedureId)
    .is("deleted_at", null)
    .maybeSingle();
  const bufferMinutes = Number(data?.buffer_time_minutes ?? 0);
  if (!Number.isFinite(bufferMinutes) || bufferMinutes <= 0) return scheduledEnd;
  const end = new Date(scheduledEnd);
  end.setMinutes(end.getMinutes() + Math.min(bufferMinutes, 120));
  return end.toISOString();
}

async function validateResource(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string, resourceId: string | null) {
  if (!resourceId) return true;
  const { data } = await (supabase as any)
    .from("clinic_resources")
    .select("id")
    .eq("id", resourceId)
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();
  return !!data;
}

async function validateAvailability(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  input: AgendaMutationInput,
  bufferEnd: string,
) {
  return checkAvailability({
    tenantId,
    doctorId: input.doctorId,
    roomId: input.roomId,
    procedureId: input.procedureId,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    bufferEnd,
  }, supabase as any);
}

function normalizeScheduleTimes(input: AgendaMutationInput, tenantTimezone: string) {
  return {
    ...input,
    scheduledStart: tenantLocalToUtc(input.scheduledStart, tenantTimezone),
    scheduledEnd: tenantLocalToUtc(input.scheduledEnd, tenantTimezone),
  };
}

export async function createAgendaEventMutation(input: AgendaMutationInput) {
  const ctx = await resolveContext();
  if (!ctx) return { error: TENANT_MISSING };
  if (!can(ctx.permissions, "agenda:create")) return { error: PERMISSION_DENIED };

  let normalized: AgendaMutationInput;
  try {
    normalized = normalizeScheduleTimes(input, ctx.tenantTimezone);
  } catch {
    return { error: "AGENDA_INVALID_TIME_RANGE" };
  }
  const timeValidation = isValidTimeRange(normalized.scheduledStart, normalized.scheduledEnd);
  if (!timeValidation.valid) return { error: timeValidation.message };
  if (!(await validateResource(ctx.supabase, ctx.tenantId, normalized.resourceId))) return { error: "AGENDA_RESOURCE_UNAVAILABLE" };

  const bufferEnd = await resolveBufferEnd(ctx.supabase, normalized.procedureId, normalized.scheduledEnd);
  const availability = await validateAvailability(ctx.supabase, ctx.tenantId, normalized, bufferEnd);
  if (!availability.isAvailable) return { error: `AGENDA_UNAVAILABLE|${availability.reason || "requested capacity is unavailable"}` };

  const conflictResult = await checkConflicts(ctx.supabase, {
    tenantId: ctx.tenantId,
    doctorId: normalized.doctorId,
    roomId: normalized.roomId,
    resourceId: normalized.resourceId,
    patientId: normalized.patientId,
    scheduledStart: normalized.scheduledStart,
    scheduledEnd: normalized.scheduledEnd,
    bufferEnd,
  });
  if (conflictResult.hasConflict) return { error: conflictResult.message };

  const event: AgendaEventInsert = {
    tenant_id: ctx.tenantId,
    patient_id: normalized.patientId,
    doctor_id: normalized.doctorId,
    room_id: normalized.roomId,
    resource_id: normalized.resourceId,
    procedure_id: normalized.procedureId,
    inquiry_id: normalized.inquiryId ?? null,
    created_by: ctx.clinicUser.id,
    scheduled_start: normalized.scheduledStart,
    scheduled_end: normalized.scheduledEnd,
    buffer_end: bufferEnd,
    event_type: "appointment",
    status: AgendaEventStatus.SCHEDULED,
  };
  const { data, error } = await ctx.supabase.from("master_agenda_events").insert(event).select().single();
  if (error) {
    console.error("[createAgendaEvent] error:", error.message);
    return { error: DATABASE_ERROR };
  }
  return { data };
}

export async function updateAgendaEventMutation(input: AgendaUpdateInput) {
  const ctx = await resolveContext();
  if (!ctx) return { error: TENANT_MISSING };
  if (!can(ctx.permissions, "agenda:update")) return { error: PERMISSION_DENIED };

  let normalized: AgendaMutationInput;
  try {
    normalized = normalizeScheduleTimes(input, ctx.tenantTimezone);
  } catch {
    return { error: "AGENDA_INVALID_TIME_RANGE" };
  }
  const timeValidation = isValidTimeRange(normalized.scheduledStart, normalized.scheduledEnd);
  if (!timeValidation.valid) return { error: timeValidation.message };
  if (!(await validateResource(ctx.supabase, ctx.tenantId, normalized.resourceId))) return { error: "AGENDA_RESOURCE_UNAVAILABLE" };

  const bufferEnd = await resolveBufferEnd(ctx.supabase, normalized.procedureId, normalized.scheduledEnd);
  const availability = await validateAvailability(ctx.supabase, ctx.tenantId, normalized, bufferEnd);
  if (!availability.isAvailable) return { error: `AGENDA_UNAVAILABLE|${availability.reason || "requested capacity is unavailable"}` };

  const conflictResult = await checkConflicts(ctx.supabase, {
    tenantId: ctx.tenantId,
    doctorId: normalized.doctorId,
    roomId: normalized.roomId,
    resourceId: normalized.resourceId,
    patientId: normalized.patientId,
    scheduledStart: normalized.scheduledStart,
    scheduledEnd: normalized.scheduledEnd,
    bufferEnd,
    excludeEventId: input.eventId,
  });
  if (conflictResult.hasConflict) return { error: conflictResult.message };

  const updates: AgendaEventUpdate = {
    patient_id: normalized.patientId,
    doctor_id: normalized.doctorId,
    room_id: normalized.roomId,
    resource_id: normalized.resourceId,
    procedure_id: normalized.procedureId,
    scheduled_start: normalized.scheduledStart,
    scheduled_end: normalized.scheduledEnd,
    buffer_end: bufferEnd,
    booking_notes: normalized.notes ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.reschedule) updates.status = AgendaEventStatus.RESCHEDULED;

  const { data, error } = await ctx.supabase
    .from("master_agenda_events")
    .update(updates)
    .eq("id", input.eventId)
    .eq("tenant_id", ctx.tenantId)
    .select()
    .single();
  if (error) {
    console.error("[updateAgendaEvent] error:", error.message);
    return { error: DATABASE_ERROR };
  }
  return { data };
}
