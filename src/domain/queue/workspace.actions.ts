"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { queueEngine } from "./queue.engine";
import type { EnrichedSession, SessionStatus } from "./queue.types";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  return { supabase, user, tenantId, permissions };
}

function requirePermission(permissions: string[], permission: string) {
  if (!permissions.includes(permission)) throw new Error(`Permission denied: ${permission} required`);
}

export async function registerPatientArrival(data: { sessionId?: string; patient_id: string; doctor_id?: string; room_id?: string; agenda_event_id?: string }): Promise<EnrichedSession> {
  const { supabase, user, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:operation");
  requirePermission(permissions, "sessions:update");
  if (data.sessionId) {
    const { data: session, error } = await supabase.from("clinic_visit_sessions").update({ arrived_at: new Date().toISOString(), session_status: "waiting", initialized_by_receptionist: user.id, updated_at: new Date().toISOString() }).eq("id", data.sessionId).eq("tenant_id", tenantId).select().single();
    if (error) throw new Error(`Arrival failed: ${error.message}`);
    revalidateWorkspacePaths();
    return session as EnrichedSession;
  }
  requirePermission(permissions, "sessions:create");
  const { data: session, error } = await supabase.from("clinic_visit_sessions").insert({ tenant_id: tenantId, patient_id: data.patient_id, doctor_id: data.doctor_id ?? null, room_id: data.room_id ?? null, agenda_event_id: data.agenda_event_id ?? null, arrived_at: new Date().toISOString(), initialized_by_receptionist: user.id, session_status: "waiting", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
  if (error) throw new Error(`Arrival failed: ${error.message}`);
  revalidateWorkspacePaths();
  return session as EnrichedSession;
}

export async function transitionToClinical(sessionId: string): Promise<EnrichedSession> {
  return transitionSession(sessionId, "in_consultation", "clinical");
}

export async function transitionToPendingReception(sessionId: string): Promise<EnrichedSession> {
  const { supabase, user, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:clinical");
  requirePermission(permissions, "sessions:update");
  const { data: current, error: readError } = await supabase.from("clinic_visit_sessions").select("session_status, doctor_id, lock_holder_id").eq("id", sessionId).eq("tenant_id", tenantId).single();
  if (readError || !current) throw new Error("Session not found");
  if (current.doctor_id !== user.id && current.lock_holder_id !== user.id && !permissions.includes("workspace:administration")) throw new Error("This clinical session is not assigned to the current user");
  const validation = queueEngine.validateTransition(current.session_status as SessionStatus, "pending_close");
  if (!validation.valid) throw new Error(validation.reason);
  const { data: session, error } = await supabase.from("clinic_visit_sessions").update({ session_status: "pending_close", session_ended_at: new Date().toISOString(), lock_holder_id: null, lock_timestamp: null, updated_at: new Date().toISOString() }).eq("id", sessionId).eq("tenant_id", tenantId).select().single();
  if (error) throw new Error(`Clinical handoff failed: ${error.message}`);
  revalidateWorkspacePaths();
  return session as EnrichedSession;
}

export async function completeFromReception(sessionId: string): Promise<EnrichedSession> { return transitionSession(sessionId, "completed", "operation"); }
export async function markNoShowFromReception(sessionId: string): Promise<EnrichedSession> { return transitionSession(sessionId, "no_show", "operation"); }
export async function cancelFromReception(sessionId: string): Promise<EnrichedSession> { return transitionSession(sessionId, "cancelled", "operation"); }

export async function moveFromOperation(sessionId: string, target: SessionStatus): Promise<EnrichedSession> {
  if (!["waiting", "in_consultation", "pending_close", "completed", "cancelled", "no_show"].includes(target)) throw new Error("Invalid workflow target");
  return transitionSession(sessionId, target, "operation");
}

async function transitionSession(sessionId: string, target: SessionStatus, workspace: "operation" | "clinical") {
  const { supabase, user, tenantId, permissions } = await getContext();
  requirePermission(permissions, `workspace:${workspace}`);
  requirePermission(permissions, "sessions:update");
  const { data: current, error: readError } = await supabase.from("clinic_visit_sessions").select("session_status, doctor_id, lock_holder_id").eq("id", sessionId).eq("tenant_id", tenantId).single();
  if (readError || !current) throw new Error("Session not found");
  if (workspace === "clinical" && current.doctor_id !== user.id && current.lock_holder_id !== user.id && !permissions.includes("workspace:administration")) throw new Error("This clinical session is not assigned to the current user");
  const validation = queueEngine.validateTransition(current.session_status as SessionStatus, target);
  if (!validation.valid) throw new Error(validation.reason);
  if (target === "in_consultation" && !current.doctor_id) throw new Error("A provider must be assigned before clinical handoff");

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { session_status: target, updated_at: now };
  if (target === "in_consultation") {
    update.lock_holder_id = current.doctor_id;
    update.lock_timestamp = now;
    update.session_started_at = now;
  }
  if (target === "completed") {
    update.lock_holder_id = null;
    update.lock_timestamp = null;
    update.visit_closed_at = now;
  }
  if (target === "cancelled" || target === "no_show") {
    update.lock_holder_id = null;
    update.lock_timestamp = null;
  }
  const { data: session, error } = await supabase.from("clinic_visit_sessions").update(update).eq("id", sessionId).eq("tenant_id", tenantId).select().single();
  if (error) throw new Error(`Workflow transition failed: ${error.message}`);
  revalidateWorkspacePaths();
  return session as EnrichedSession;
}

function revalidateWorkspacePaths() {
  revalidatePath("/(dashboard)/operation");
  revalidatePath("/(dashboard)/clinical");
  revalidatePath("/(dashboard)/queue");
}
