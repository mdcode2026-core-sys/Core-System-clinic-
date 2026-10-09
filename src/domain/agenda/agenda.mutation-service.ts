import { createClient } from "@/infrastructure/supabase/server";
import { createAgendaCommandClient } from "@/infrastructure/supabase/agenda-command";
import { checkConflicts, isValidTimeRange } from "./conflict.engine";
import { checkAvailability } from "./availability.engine";
import { AgendaEventStatus, ValidStateTransitions, type AgendaEventStatusValue } from "./agenda.types";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { tenantLocalToUtc } from "@/shared/utils/dateTime";
import { resolveBookingRequirements } from "./procedure-resource-requirements";

const DATABASE_ERROR = "AGENDA_DATABASE_ERROR";
const TENANT_MISSING = "AGENDA_TENANT_MISSING";
const PERMISSION_DENIED = "AGENDA_PERMISSION_DENIED";

export interface AgendaMutationInput {
  patientId: string;
  doctorId: string | null;
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
    .is("deleted_at", null)
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

async function resolveBufferEnd(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string, procedureId: string | null, scheduledEnd: string) {
  if (!procedureId) return scheduledEnd;
  const { data } = await supabase
    .from("clinic_procedures")
    .select("buffer_time_minutes")
    .eq("id", procedureId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
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
  providerRequired: boolean,
  excludeEventId?: string,
) {
  return checkAvailability({
    tenantId,
    doctorId: input.doctorId,
    providerRequired,
    roomId: input.roomId,
    resourceId: input.resourceId,
    procedureId: input.procedureId,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    bufferEnd,
    excludeEventId,
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
  if (!input.patientId) return { error: "AGENDA_PATIENT_REQUIRED" };
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

  let bookingRequirements;
  try {
    bookingRequirements = await resolveBookingRequirements(ctx.supabase as any, ctx.tenantId, normalized.procedureId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message.includes("AGENDA_PROCEDURE_NOT_AVAILABLE") ? "AGENDA_PROCEDURE_NOT_AVAILABLE" : "AGENDA_BOOKING_REQUIREMENTS_UNAVAILABLE" };
  }
  if (bookingRequirements.provider.required && !normalized.doctorId) return { error: "AGENDA_PROVIDER_REQUIRED" };

  const bufferEnd = await resolveBufferEnd(ctx.supabase, ctx.tenantId, normalized.procedureId, normalized.scheduledEnd);
  const availability = await validateAvailability(ctx.supabase, ctx.tenantId, normalized, bufferEnd, bookingRequirements.provider.required);
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

  const result = await invokeAgendaCommand("agenda_create_appointment", {
    p_tenant_id: ctx.tenantId,
    p_actor_clinic_user_id: ctx.clinicUser.id,
    p_patient_id: normalized.patientId,
    p_doctor_id: normalized.doctorId || null,
    p_room_id: normalized.roomId,
    p_resource_id: normalized.resourceId,
    p_procedure_id: normalized.procedureId,
    p_inquiry_id: normalized.inquiryId ?? null,
    p_scheduled_start: normalized.scheduledStart,
    p_scheduled_end: normalized.scheduledEnd,
    p_buffer_end: bufferEnd,
    p_booking_notes: normalized.notes ?? null,
  });
  return result;
}

export async function updateAgendaEventMutation(input: AgendaUpdateInput) {
  if (!input.eventId || !input.patientId) return { error: "AGENDA_EVENT_OR_PATIENT_REQUIRED" };
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

  let bookingRequirements;
  try {
    bookingRequirements = await resolveBookingRequirements(ctx.supabase as any, ctx.tenantId, normalized.procedureId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message.includes("AGENDA_PROCEDURE_NOT_AVAILABLE") ? "AGENDA_PROCEDURE_NOT_AVAILABLE" : "AGENDA_BOOKING_REQUIREMENTS_UNAVAILABLE" };
  }
  if (bookingRequirements.provider.required && !normalized.doctorId) return { error: "AGENDA_PROVIDER_REQUIRED" };

  const bufferEnd = await resolveBufferEnd(ctx.supabase, ctx.tenantId, normalized.procedureId, normalized.scheduledEnd);
  const availability = await validateAvailability(ctx.supabase, ctx.tenantId, normalized, bufferEnd, bookingRequirements.provider.required, input.eventId);
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

  const { data: currentEvent, error: currentEventError } = await ctx.supabase
    .from("master_agenda_events")
    .select("id,status")
    .eq("id", input.eventId)
    .eq("tenant_id", ctx.tenantId)
    .is("deleted_at", null)
    .maybeSingle();
  if (currentEventError || !currentEvent) {
    return { error: currentEventError ? DATABASE_ERROR : "AGENDA_EVENT_NOT_FOUND" };
  }

  return invokeAgendaCommand("agenda_update_appointment", {
    p_tenant_id: ctx.tenantId,
    p_actor_clinic_user_id: ctx.clinicUser.id,
    p_event_id: input.eventId,
    p_expected_status: currentEvent.status,
    p_patient_id: normalized.patientId,
    p_doctor_id: normalized.doctorId || null,
    p_room_id: normalized.roomId,
    p_resource_id: normalized.resourceId,
    p_procedure_id: normalized.procedureId,
    p_scheduled_start: normalized.scheduledStart,
    p_scheduled_end: normalized.scheduledEnd,
    p_buffer_end: bufferEnd,
    p_booking_notes: normalized.notes ?? null,
    p_reschedule: input.reschedule === true,
  });
}

export async function updateAgendaEventStatusMutation(
  eventId: string,
  newStatus: AgendaEventStatusValue,
  expectedCurrentStatus: AgendaEventStatusValue,
) {
  const ctx = await resolveContext();
  if (!ctx) return { error: TENANT_MISSING };
  if (!can(ctx.permissions, "agenda:update")) return { error: PERMISSION_DENIED };

  const allowedTransitions = ValidStateTransitions[expectedCurrentStatus];
  if (!eventId || !allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return { error: `AGENDA_INVALID_STATUS_TRANSITION|${expectedCurrentStatus}|${newStatus}` };
  }

  return invokeAgendaCommand("agenda_transition_appointment", {
    p_tenant_id: ctx.tenantId,
    p_actor_clinic_user_id: ctx.clinicUser.id,
    p_event_id: eventId,
    p_expected_status: expectedCurrentStatus,
    p_new_status: newStatus,
  });
}

export async function cancelAgendaEventMutation(
  eventId: string,
  expectedCurrentStatus: AgendaEventStatusValue,
  reason: string | null,
) {
  const ctx = await resolveContext();
  if (!ctx) return { error: TENANT_MISSING };
  if (!can(ctx.permissions, "agenda:update")) return { error: PERMISSION_DENIED };

  const cancellableStates: AgendaEventStatusValue[] = [
    AgendaEventStatus.SCHEDULED,
    AgendaEventStatus.CONFIRMED,
    AgendaEventStatus.ARRIVED,
    AgendaEventStatus.IN_SESSION,
  ];
  if (!eventId || !cancellableStates.includes(expectedCurrentStatus)) {
    return { error: `AGENDA_INVALID_CANCELLATION|${expectedCurrentStatus}` };
  }

  return invokeAgendaCommand("agenda_cancel_appointment", {
    p_tenant_id: ctx.tenantId,
    p_actor_clinic_user_id: ctx.clinicUser.id,
    p_event_id: eventId,
    p_expected_status: expectedCurrentStatus,
    p_reason: reason,
  });
}

type AgendaCommandError = { message?: string; code?: string };
function mapAgendaCommandError(error: AgendaCommandError | null | undefined) {
  const message = error?.message ?? "";
  if (error?.code === "23P01") return "AGENDA_CONFLICT";
  const knownCodes = [
    "AGENDA_ACTOR_OR_TENANT_MISSING",
    "AGENDA_ACTOR_TENANT_OR_EVENT_MISSING",
    "AGENDA_ACTOR_NOT_ACTIVE_IN_TENANT",
    "AGENDA_PERMISSION_DENIED",
    "AGENDA_TENANT_MISSING",
    "AGENDA_PATIENT_NOT_FOUND_IN_TENANT",
    "AGENDA_PROVIDER_NOT_FOUND_IN_TENANT",
    "AGENDA_ROOM_NOT_AVAILABLE",
    "AGENDA_RESOURCE_UNAVAILABLE",
    "AGENDA_PROCEDURE_NOT_AVAILABLE",
    "AGENDA_INQUIRY_NOT_FOUND_IN_TENANT",
    "AGENDA_INVALID_TIME_RANGE",
    "AGENDA_EVENT_NOT_FOUND",
    "AGENDA_STATE_CONFLICT",
    "AGENDA_INVALID_STATUS_TRANSITION",
    "AGENDA_INVALID_CANCELLATION",
    "AGENDA_PATIENT_REQUIRED",
    "AGENDA_EVENT_OR_PATIENT_REQUIRED",
    "AGENDA_COMMAND_CONFIGURATION_MISSING",
  ];
  const known = knownCodes.find((code) => message.includes(code));
  if (known === "AGENDA_ACTOR_OR_TENANT_MISSING" || known === "AGENDA_ACTOR_TENANT_OR_EVENT_MISSING" ||
      known === "AGENDA_ACTOR_NOT_ACTIVE_IN_TENANT") return TENANT_MISSING;
  if (known) return known;
  if (/unavailable during the selected time|approved workforce absence/i.test(message)) {
    return "AGENDA_UNAVAILABLE|WORKFORCE_UNAVAILABILITY";
  }
  return DATABASE_ERROR;
}

async function invokeAgendaCommand(
  functionName: "agenda_create_appointment" | "agenda_update_appointment" | "agenda_transition_appointment" | "agenda_cancel_appointment",
  args: Record<string, unknown>,
) {
  try {
    const commandClient = createAgendaCommandClient() as any;
    const { data, error } = await commandClient.rpc(functionName, args);
    if (error) {
      console.error("[AgendaCommand] command failed:", functionName, error.code ?? "UNKNOWN");
      return { error: mapAgendaCommandError(error) };
    }
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error("[AgendaCommand] invocation failed");
    return { error: message.includes("AGENDA_COMMAND_CONFIGURATION_MISSING") ? "AGENDA_COMMAND_CONFIGURATION_MISSING" : DATABASE_ERROR };
  }
}
