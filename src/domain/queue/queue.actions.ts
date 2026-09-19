"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { EnrichedSession, SessionStatus } from "./queue.types";
import { d3CancelPatientFlow, d3EnterWaiting, d3MarkNoShow, d3StartClinicalWork } from "./d3.actions";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  return { supabase, user, tenantId, userId: user.id, permissions };
}

function requirePermission(permissions: string[], permission: string) {
  if (!permissions.includes(permission)) throw new Error(`Permission denied: ${permission} required`);
}

function revalidateQueuePaths() {
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  revalidatePath("/(dashboard)/operation");
  revalidatePath("/(dashboard)/clinical");
}

export async function checkInPatient(
  data: { patient_id: string; doctor_id?: string; room_id?: string; agenda_event_id?: string; notes?: string },
): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:create");
  requirePermission(permissions, "sessions:update");

  const now = new Date().toISOString();
  const insertData = {
    tenant_id: tenantId,
    patient_id: data.patient_id,
    doctor_id: data.doctor_id || null,
    room_id: data.room_id || null,
    agenda_event_id: data.agenda_event_id || null,
    session_status: "waiting" as SessionStatus,
    created_at: now,
    updated_at: now,
  };
  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .insert(insertData)
    .select("id")
    .single();
  if (error || !session) throw new Error(`Check-in failed: ${error?.message ?? "visit creation failed"}`);

  // Initial Visit creation is separate entity creation; D3 owns the lifecycle projection into Waiting.
  return d3EnterWaiting({
    visitId: session.id,
    entryReason: "arrival",
    correlationId: crypto.randomUUID(),
  });
}

export async function callNextPatient(sessionId: string): Promise<EnrichedSession> {
  return d3StartClinicalWork(sessionId);
}

/**
 * Visit completion is intentionally not exposed here. Clinical authority ends at pending_close;
 * reception owns the subsequent pending_close -> completed transition via workspace.actions.
 */
export async function completeVisit(_sessionId: string): Promise<never> {
  throw new Error("VISIT_COMPLETION_OWNED_BY_RECEPTION");
}

export async function holdVisit(sessionId: string): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");
  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .update({ lock_holder_id: null, lock_timestamp: null, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .eq("session_status", "in_consultation")
    .select()
    .single();
  if (error) throw new Error(`Hold failed: ${error.message}`);
  revalidateQueuePaths();
  return session as EnrichedSession;
}

export async function resumeVisit(sessionId: string): Promise<EnrichedSession> {
  const { supabase, tenantId, userId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");
  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .update({ lock_holder_id: userId, lock_timestamp: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .eq("session_status", "in_consultation")
    .select()
    .single();
  if (error) throw new Error(`Resume failed: ${error.message}`);
  revalidateQueuePaths();
  return session as EnrichedSession;
}

export async function markNoShow(sessionId: string): Promise<EnrichedSession> {
  return d3MarkNoShow(sessionId);
}

export async function cancelVisit(sessionId: string): Promise<EnrichedSession> {
  return d3CancelPatientFlow(sessionId);
}

export async function findPatientByPhone(
  phone: string,
  tenantId: string,
): Promise<{ id: string; first_name: string; last_name: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const resolvedTenantId = await resolveTenantId(user.id);
  if (!resolvedTenantId || resolvedTenantId !== tenantId) return null;
  const permissions = await getEffectivePermissions(user.id, resolvedTenantId);
  requirePermission(permissions, "patients:read");
  const { data, error } = await supabase
    .from("clinic_patients")
    .select("id, first_name, last_name")
    .eq("tenant_id", resolvedTenantId)
    .eq("phone_primary", phone)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return null;
  return data;
}
