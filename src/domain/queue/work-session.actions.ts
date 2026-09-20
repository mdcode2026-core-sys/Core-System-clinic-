"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { EnrichedSession } from "./queue.types";

async function getContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  return { supabase, tenantId, user, permissions };
}

function requirePermission(permissions: string[], key: string) {
  if (!permissions.includes(key)) throw new Error(`Permission denied: ${key} required`);
}

async function clinicUserId(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string, authUserId: string) {
  const { data, error } = await supabase
    .from("clinic_users")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("auth_user_id", authUserId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) throw new Error("Clinic user not resolved");
  return data.id;
}

function revalidateQueuePaths() {
  revalidatePath("/(dashboard)/queue");
  revalidatePath("/(dashboard)/patient-flow");
  revalidatePath("/(dashboard)/operation");
  revalidatePath("/(dashboard)/clinical");
}

export async function holdClinicalWorkSession(
  visitId: string,
  reason?: string | null,
  correlationId?: string,
): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "sessions:update");
  requirePermission(permissions, "patient_flow:clinical");
  const { data, error } = await supabase.rpc("csapi_work_session_hold", {
    p_visit_id: visitId,
    p_reason: reason ?? null,
    p_correlation_id: correlationId ?? crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidateQueuePaths();
  const { data: session, error: sessionError } = await supabase
    .from("clinic_visit_sessions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", visitId)
    .single();
  if (sessionError || !session) throw new Error(sessionError?.message ?? "Session not found");
  return session as EnrichedSession;
}

export async function resumeClinicalWorkSession(
  visitId: string,
  correlationId?: string,
): Promise<EnrichedSession> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "sessions:update");
  requirePermission(permissions, "patient_flow:clinical");
  const { data, error } = await supabase.rpc("csapi_work_session_resume", {
    p_visit_id: visitId,
    p_correlation_id: correlationId ?? crypto.randomUUID(),
  });
  if (error) throw new Error(error.message);
  revalidateQueuePaths();
  const { data: session, error: sessionError } = await supabase
    .from("clinic_visit_sessions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", visitId)
    .single();
  if (sessionError || !session) throw new Error(sessionError?.message ?? "Session not found");
  return session as EnrichedSession;
}
