"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { EnrichedSession, SessionStatus } from "./queue.types";
import {
  d3CancelPatientFlow,
  d3CompleteReception,
  d3EnterWaiting,
  d3FinishClinicalWork,
  d3MarkNoShow,
  d3StartClinicalWork,
} from "./d3.actions";

type PatientFlowContext = "operations" | "clinical" | "administrative";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const { data: clinicUser, error: clinicUserError } = await supabase
    .from("clinic_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .maybeSingle();
  if (clinicUserError || !clinicUser) throw new Error("Clinic user not resolved");
  return { supabase, user, tenantId, clinicUserId: clinicUser.id, permissions };
}

function requirePermission(permissions: readonly string[], permission: string) {
  if (!permissions.includes(permission)) throw new Error(`Permission denied: ${permission} required`);
}

function revalidateWorkspacePaths() {
  revalidatePath("/(dashboard)/operation");
  revalidatePath("/(dashboard)/clinical");
  revalidatePath("/(dashboard)/administration");
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  revalidatePath("/(dashboard)/patient-flow/administrative");
}

/**
 * D6: when an agenda event is supplied, patient/doctor/room identity is authoritative
 * from master_agenda_events. The separate Walk-in path remains unchanged.
 */
export async function registerPatientArrival(
  data: { sessionId?: string; patient_id: string; doctor_id?: string; room_id?: string; agenda_event_id?: string },
): Promise<EnrichedSession> {
  const { supabase, user, tenantId, clinicUserId, permissions } = await getContext();
  requirePermission(permissions, "sessions:update");

  let patientId = data.patient_id;
  let doctorId = data.doctor_id ?? null;
  let roomId = data.room_id ?? null;
  let agendaEventId = data.agenda_event_id ?? null;

  if (data.agenda_event_id) {
    const { data: agenda, error: agendaError } = await supabase
      .from("master_agenda_events")
      .select("id,tenant_id,patient_id,doctor_id,room_id,status")
      .eq("id", data.agenda_event_id)
      .eq("tenant_id", tenantId)
      .single();
    if (agendaError || !agenda) throw new Error("Agenda event not found");
    if (!agenda.patient_id) throw new Error("Agenda event has no patient");
    patientId = agenda.patient_id;
    doctorId = agenda.doctor_id;
    roomId = agenda.room_id;
    agendaEventId = agenda.id;
  }

  if (data.sessionId) {
    const { data: current, error: readError } = await supabase
      .from("clinic_visit_sessions")
      .select("id,session_status,patient_id,doctor_id,room_id,agenda_event_id")
      .eq("id", data.sessionId)
      .eq("tenant_id", tenantId)
      .single();
    if (readError || !current) throw new Error("Session not found");
    if (current.session_status !== "waiting") throw new Error("Patient must be waiting before arrival is registered");

    patientId = data.patient_id ?? current.patient_id;
    doctorId = data.doctor_id ?? current.doctor_id;
    roomId = data.room_id ?? current.room_id;
    agendaEventId = data.agenda_event_id ?? current.agenda_event_id;

    if (!doctorId) throw new Error("Waiting session is missing a doctor");

    const { error } = await supabase
      .from("clinic_visit_sessions")
      .update({
        patient_id: patientId,
        doctor_id: doctorId,
        room_id: roomId,
        agenda_event_id: agendaEventId,
        arrived_at: new Date().toISOString(),
        initialized_by_receptionist: clinicUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.sessionId)
      .eq("tenant_id", tenantId)
      .eq("session_status", "waiting");
    if (error) throw new Error(`Arrival failed: ${error.message}`);

    return d3EnterWaiting({
      visitId: data.sessionId,
      entryReason: "arrival",
      correlationId: crypto.randomUUID(),
    });
  }

  requirePermission(permissions, "sessions:create");
  const now = new Date().toISOString();
  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .insert({
      tenant_id: tenantId,
      patient_id: patientId,
      doctor_id: doctorId,
      room_id: roomId,
      agenda_event_id: agendaEventId,
      arrived_at: now,
      initialized_by_receptionist: clinicUserId,
      session_status: "waiting",
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (error || !session) throw new Error(`Arrival failed: ${error?.message ?? "visit creation failed"}`);

  return d3EnterWaiting({
    visitId: session.id,
    entryReason: "arrival",
    correlationId: crypto.randomUUID(),
  });
}

export async function transitionToClinical(sessionId: string): Promise<EnrichedSession> {
  return d3StartClinicalWork(sessionId);
}

export async function transitionToPendingReception(sessionId: string): Promise<EnrichedSession> {
  return d3FinishClinicalWork(sessionId);
}

export async function completeFromReception(sessionId: string): Promise<EnrichedSession> {
  return d3CompleteReception(sessionId);
}

export async function markNoShowFromReception(sessionId: string): Promise<EnrichedSession> {
  return d3MarkNoShow(sessionId);
}

export async function cancelFromReception(sessionId: string): Promise<EnrichedSession> {
  return d3CancelPatientFlow(sessionId);
}

export async function moveFromOperation(sessionId: string, target: SessionStatus): Promise<EnrichedSession> {
  switch (target) {
    case "in_consultation":
      return d3StartClinicalWork(sessionId);
    case "completed":
      return d3CompleteReception(sessionId);
    case "cancelled":
      return d3CancelPatientFlow(sessionId);
    case "no_show":
      return d3MarkNoShow(sessionId);
    default:
      throw new Error("Invalid workflow target");
  }
}

export async function moveFromPatientFlow(
  sessionId: string,
  target: SessionStatus,
  _context: PatientFlowContext,
): Promise<EnrichedSession> {
  switch (target) {
    case "in_consultation":
      return d3StartClinicalWork(sessionId);
    case "pending_close":
      return d3FinishClinicalWork(sessionId);
    case "completed":
      return d3CompleteReception(sessionId);
    case "cancelled":
      return d3CancelPatientFlow(sessionId);
    case "no_show":
      return d3MarkNoShow(sessionId);
    case "waiting":
      throw new Error("Use waiting entry/reorder command for waiting state");
    default:
      throw new Error("Invalid workflow target");
  }
}

// D1/D6 bounded-context contract:
// Agenda ↔ Visit integration remains separate from D3 lifecycle ownership.
// D3 mutates Visit + Patient Flow Queue/Event + Work Session projection only.
