/**
 * Agenda Module — Server Actions
 * Business logic lives here. No logic in UI.
 * Validates: Conflicts, State Transitions, Multi-Tenant.
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { checkConflicts, isValidTimeRange } from "./conflict.engine";
import {
  AgendaEventInsert,
  AgendaEventUpdate,
  AgendaEventStatusValue,
  ValidStateTransitions,
  AgendaEventStatus,
} from "./agenda.types";

// ─────────────────────────────────────────
// 1. CREATE EVENT
// ─────────────────────────────────────────

export async function createAgendaEvent(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  // Set tenant for RLS
  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  // Extract form data
  const patientId = String(formData.get("patient_id"));
  const doctorId = String(formData.get("doctor_id"));
  const roomId = formData.get("room_id")
    ? String(formData.get("room_id"))
    : null;
  const procedureId = formData.get("procedure_id")
    ? String(formData.get("procedure_id"))
    : null;
  const inquiryId = formData.get("inquiry_id")
    ? String(formData.get("inquiry_id"))
    : null;
  const scheduledStart = String(formData.get("scheduled_start"));
  const scheduledEnd = String(formData.get("scheduled_end"));
  const notes = formData.get("notes")
    ? String(formData.get("notes"))
    : null;
  const createdBy = String(formData.get("created_by"));

  // Validate time range
  const timeValidation = isValidTimeRange(scheduledStart, scheduledEnd);
  if (!timeValidation.valid) {
    return { error: timeValidation.message };
  }

  // Check conflicts
  const conflictResult = await checkConflicts({
    tenantId,
    doctorId,
    roomId,
    patientId,
    scheduledStart,
    scheduledEnd,
  });

  if (conflictResult.hasConflict) {
    return { error: conflictResult.message };
  }

  // Build insert object
  const event: AgendaEventInsert = {
    tenant_id: tenantId,
    patient_id: patientId,
    doctor_id: doctorId,
    room_id: roomId,
    procedure_id: procedureId,
    inquiry_id: inquiryId,
    created_by: createdBy,
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
    status: AgendaEventStatus.SCHEDULED,
    notes,
  };

  const { data, error } = await supabase
    .from("master_agenda_events")
    .insert(event)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/agenda");
  return { data };
}

// ─────────────────────────────────────────
// 2. UPDATE EVENT
// ─────────────────────────────────────────

export async function updateAgendaEvent(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  const eventId = String(formData.get("id"));
  const patientId = String(formData.get("patient_id"));
  const doctorId = String(formData.get("doctor_id"));
  const roomId = formData.get("room_id")
    ? String(formData.get("room_id"))
    : null;
  const procedureId = formData.get("procedure_id")
    ? String(formData.get("procedure_id"))
    : null;
  const scheduledStart = String(formData.get("scheduled_start"));
  const scheduledEnd = String(formData.get("scheduled_end"));
  const notes = formData.get("notes")
    ? String(formData.get("notes"))
    : null;

  // Validate time range
  const timeValidation = isValidTimeRange(scheduledStart, scheduledEnd);
  if (!timeValidation.valid) {
    return { error: timeValidation.message };
  }

  // Check conflicts (exclude self)
  const conflictResult = await checkConflicts({
    tenantId,
    doctorId,
    roomId,
    patientId,
    scheduledStart,
    scheduledEnd,
    excludeEventId: eventId,
  });

  if (conflictResult.hasConflict) {
    return { error: conflictResult.message };
  }

  // Build update object
  const updates: AgendaEventUpdate = {
    patient_id: patientId,
    doctor_id: doctorId,
    room_id: roomId,
    procedure_id: procedureId,
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
    notes,
    updated_at: new Date().toISOString(),
  };

  // Remove undefined/null values
  Object.keys(updates).forEach((key) => {
    const k = key as keyof AgendaEventUpdate;
    if (updates[k] === undefined || updates[k] === null) {
      delete updates[k];
    }
  });

  const { data, error } = await supabase
    .from("master_agenda_events")
    .update(updates)
    .eq("id", eventId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/agenda");
  return { data };
}

// ─────────────────────────────────────────
// 3. UPDATE EVENT STATUS
// ─────────────────────────────────────────

export async function updateAgendaEventStatus(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  const eventId = String(formData.get("id"));
  const newStatus = String(formData.get("status")) as AgendaEventStatusValue;
  const currentStatus = String(formData.get("current_status")) as AgendaEventStatusValue;

  // Validate state transition
  const allowedTransitions = ValidStateTransitions[currentStatus];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return {
      error: `لا يمكن تغيير الحالة من "${currentStatus}" إلى "${newStatus}"`,
    };
  }

  const { data, error } = await supabase
    .from("master_agenda_events")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/agenda");
  return { data };
}

// ─────────────────────────────────────────
// 4. CANCEL EVENT
// ─────────────────────────────────────────

export async function cancelAgendaEvent(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) {
    return { error: "لم يتم التعرف على العيادة" };
  }

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  const eventId = String(formData.get("id"));
  const currentStatus = String(formData.get("current_status")) as AgendaEventStatusValue;

  // Validate: can only cancel from certain states
  const cancellableStates = [
    AgendaEventStatus.SCHEDULED,
    AgendaEventStatus.CONFIRMED,
    AgendaEventStatus.ARRIVED,
    AgendaEventStatus.IN_SESSION,
  ];

  if (!cancellableStates.includes(currentStatus)) {
    return {
      error: `لا يمكن إلغاء موعد في حالة "${currentStatus}"`,
    };
  }

  const { data, error } = await supabase
    .from("master_agenda_events")
    .update({
      status: AgendaEventStatus.CANCELLED,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/agenda");
  return { data };
}
