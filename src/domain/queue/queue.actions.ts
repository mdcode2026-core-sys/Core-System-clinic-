"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { QueueSession, SessionStatus, EnrichedSession } from "./queue.types";
import { queueEngine } from "./queue.engine";
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

// ── 1. تسجيل حضور مريض (Check-in) ─────────────────────────
export async function checkInPatient(data: {
  patient_id: string;
  doctor_id?: string;
  room_id?: string;
  agenda_event_id?: string;
  notes?: string;
}): Promise<EnrichedSession> {
  const { supabase, tenantId, userId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:create");

  const insertData = {
    tenant_id: tenantId,
    patient_id: data.patient_id,
    doctor_id: data.doctor_id || null,
    room_id: data.room_id || null,
    agenda_event_id: data.agenda_event_id || null,
    session_status: "waiting" as SessionStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(`Check-in failed: ${error.message}`);

  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  return session as EnrichedSession;
}

// ── 2. استدعاء مريض (Call Next) ────────────────────────────
export async function callNextPatient(sessionId: string): Promise<EnrichedSession> {
  const { supabase, tenantId, userId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");

  const { data: current } = await supabase
    .from("clinic_visit_sessions")
    .select("session_status")
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .single();

  if (!current) throw new Error("Session not found");

  const validation = queueEngine.validateTransition(current.session_status as SessionStatus, "in_consultation");
  if (!validation.valid) throw new Error(validation.reason);

  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .update({
      session_status: "in_consultation",
      lock_holder_id: userId,
      lock_timestamp: new Date().toISOString(),
      session_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw new Error(`Call patient failed: ${error.message}`);

  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  return session as EnrichedSession;
}

// ── 3. إنهاء كشف (Complete Visit) ─────────────────────────
export async function completeVisit(sessionId: string): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");

  const { data: current } = await supabase
    .from("clinic_visit_sessions")
    .select("session_status")
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .single();

  if (!current) throw new Error("Session not found");

  const validation = queueEngine.validateTransition(current.session_status as SessionStatus, "completed");
  if (!validation.valid) throw new Error(validation.reason);

  const { data: session, error } = await supabase
    .from("clinic_visit_sessions")
    .update({
      session_status: "completed",
      lock_holder_id: null,
      lock_timestamp: null,
      visit_closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw new Error(`Complete failed: ${error.message}`);

  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  revalidatePath("/(dashboard)/invoices");
  return session as EnrichedSession;
}

// ── 4. تعليق كشف (Hold Visit) ──────────────────────────────
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
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  return session as EnrichedSession;
}

// ── 5. استئناف كشف (Resume Visit) ───────────────────────────
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
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  return session as EnrichedSession;
}

// ── 6. لم يحضر (No Show) ───────────────────────────────────
export async function markNoShow(sessionId: string): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");
  return transitionSimple(sessionId, "no_show", supabase, tenantId);
}

// ── 7. إلغاء زيارة (Cancel Visit) ──────────────────────────
export async function cancelVisit(sessionId: string): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");
  return transitionSimple(sessionId, "cancelled", supabase, tenantId);
}

async function transitionSimple(sessionId: string, newStatus: "no_show" | "cancelled", supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string): Promise<EnrichedSession> {
  const { data: current } = await supabase
    .from("clinic_visit_sessions")
    .select("session_status")
    .eq("id", sessionId)
    .eq("tenant_id", tenantId)
    .single();
  if (!current) throw new Error("Session not found");
  const validation = queueEngine.validateTransition(current.session_status as SessionStatus, newStatus);
  if (!validation.valid) throw new Error(validation.reason);
  const { data: session, error } = await supabase.from("clinic_visit_sessions").update({ session_status: newStatus, lock_holder_id: null, lock_timestamp: null, updated_at: new Date().toISOString() }).eq("id", sessionId).eq("tenant_id", tenantId).select().single();
  if (error) throw new Error(`Session update failed: ${error.message}`);
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  return session as EnrichedSession;
}

// ── 8. تحديث حالة يدوياً ───────────────────────────────────
export async function updateSessionStatus(sessionId: string, newStatus: SessionStatus): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getAuthContext();
  requirePermission(permissions, "sessions:update");
  const { data: current } = await supabase.from("clinic_visit_sessions").select("session_status").eq("id", sessionId).eq("tenant_id", tenantId).single();
  if (!current) throw new Error("Session not found");
  const validation = queueEngine.validateTransition(current.session_status as SessionStatus, newStatus);
  if (!validation.valid) throw new Error(validation.reason);
  const { data: session, error } = await supabase.from("clinic_visit_sessions").update({ session_status: newStatus, updated_at: new Date().toISOString() }).eq("id", sessionId).eq("tenant_id", tenantId).select().single();
  if (error) throw new Error(`Update failed: ${error.message}`);
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  return session as EnrichedSession;
}

// ── 9. البحث عن مريض بالهاتف (لـ Kiosk) ────────────────────
export async function findPatientByPhone(phone: string, tenantId: string): Promise<{ id: string; first_name: string; last_name: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const resolvedTenantId = await resolveTenantId(user.id);
  if (!resolvedTenantId || resolvedTenantId !== tenantId) return null;
  const permissions = await getEffectivePermissions(user.id, resolvedTenantId);
  requirePermission(permissions, "patients:read");
  const { data, error } = await supabase.from("clinic_patients").select("id, first_name, last_name").eq("tenant_id", resolvedTenantId).eq("phone_primary", phone).is("deleted_at", null).maybeSingle();
  if (error) return null;
  return data;
}
