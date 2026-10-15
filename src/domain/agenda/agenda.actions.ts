"use server";

import {
  cancelAgendaEventMutation,
  createAgendaEventMutation,
  updateAgendaEventMutation,
  updateAgendaEventStatusMutation,
} from "./agenda.mutation-service";
import type { AgendaEventStatusValue } from "./agenda.types";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value);
}

function formNullableString(formData: FormData, key: string) {
  const value = formString(formData, key).trim();
  return value || null;
}

/** Thin input adapter. Identity, tenant, permission and persistence are server-derived downstream. */
export async function createAgendaEvent(formData: FormData) {
  return createAgendaEventMutation({
    patientId: formString(formData, "patient_id"),
    doctorId: formString(formData, "doctor_id") || null,
    roomId: formNullableString(formData, "room_id"),
    resourceId: formNullableString(formData, "resource_id"),
    procedureId: formNullableString(formData, "procedure_id"),
    inquiryId: formNullableString(formData, "inquiry_id"),
    scheduledStart: formString(formData, "scheduled_start"),
    scheduledEnd: formString(formData, "scheduled_end"),
    notes: formNullableString(formData, "notes"),
  });
}

/** Thin input adapter for update/reschedule; client-supplied tenant/actor values are ignored. */
export async function updateAgendaEvent(formData: FormData) {
  return updateAgendaEventMutation({
    eventId: formString(formData, "id"),
    patientId: formString(formData, "patient_id"),
    doctorId: formString(formData, "doctor_id"),
    roomId: formNullableString(formData, "room_id"),
    resourceId: formNullableString(formData, "resource_id"),
    procedureId: formNullableString(formData, "procedure_id"),
    scheduledStart: formString(formData, "scheduled_start"),
    scheduledEnd: formString(formData, "scheduled_end"),
    reschedule: formString(formData, "reschedule") === "true",
    notes: formNullableString(formData, "notes"),
  });
}

/** The submitted current_status is an expected version, never the authoritative row state. */
export async function updateAgendaEventStatus(formData: FormData) {
  return updateAgendaEventStatusMutation(
    formString(formData, "id"),
    formString(formData, "status") as AgendaEventStatusValue,
    formString(formData, "current_status") as AgendaEventStatusValue,
  );
}

/** Cancellation uses the same canonical command boundary as every other appointment mutation. */
export async function cancelAgendaEvent(formData: FormData) {
  return cancelAgendaEventMutation(
    formString(formData, "id"),
    formString(formData, "current_status") as AgendaEventStatusValue,
    formNullableString(formData, "cancellation_reason"),
  );
}
