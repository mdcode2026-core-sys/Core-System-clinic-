// src/domain/followup/followup.queries.ts
// PJ Stage 9 — Follow-up Work Management server actions

"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import type { CreateFollowupInput, FollowupListFilters, FollowupPatientOption, FollowupRecord, UpdateFollowupInput } from "./followup.types";

async function getContext(requiredPermission?: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("Tenant not resolved");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (requiredPermission && !permissions.includes(requiredPermission)) throw new Error("Permission denied");
  const { data: clinicUser, error: clinicUserError } = await supabase.from("clinic_users").select("id").eq("auth_user_id", user.id).eq("tenant_id", tenantId).maybeSingle();
  if (clinicUserError || !clinicUser?.id) throw new Error("Clinic user not resolved");
  return { supabase, user, tenantId, clinicUserId: clinicUser.id };
}

function enrich(rows: any[]): FollowupRecord[] {
  return rows.map((row) => ({
    ...row,
    patient_name: row.patient ? `${row.patient.first_name} ${row.patient.last_name}` : undefined,
    patient_phone: row.patient?.phone_primary ?? null,
    assigned_to_name: row.assignee?.full_name ?? null,
    created_by_name: row.creator?.full_name ?? null,
  }));
}

export async function listFollowups(filters: FollowupListFilters = {}): Promise<{ success: true; data: FollowupRecord[] } | { success: false; error: string }> {
  try {
    const { supabase, tenantId } = await getContext("followup:read");
    let query = (supabase as any).from("retention_followups").select(`*, patient:patient_id(first_name, last_name, phone_primary), assignee:assigned_to(full_name), creator:created_by(full_name)`).eq("tenant_id", tenantId).order("scheduled_for", { ascending: true });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.type) query = query.eq("followup_type", filters.type);
    if (filters.action_type) query = query.eq("action_type", filters.action_type);
    if (filters.patient_id) query = query.eq("patient_id", filters.patient_id);
    if (filters.date_from) query = query.gte("scheduled_for", `${filters.date_from}T00:00:00`);
    if (filters.date_to) query = query.lte("scheduled_for", `${filters.date_to}T23:59:59`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { success: true, data: enrich(data ?? []) };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : String(err) }; }
}

export async function getFollowupWorkQueue(): Promise<{ success: true; data: FollowupRecord[] } | { success: false; error: string }> {
  try {
    const { supabase, tenantId } = await getContext("followup:read");
    const { data, error } = await (supabase as any).from("retention_followups").select(`*, patient:patient_id(first_name, last_name, phone_primary), assignee:assigned_to(full_name), creator:created_by(full_name)`).eq("tenant_id", tenantId).in("status", ["open", "in_progress"]).order("scheduled_for", { ascending: true });
    if (error) throw new Error(error.message);
    return { success: true, data: enrich(data ?? []) };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : String(err) }; }
}

export async function listFollowupPatients(search = ""): Promise<{ success: true; data: FollowupPatientOption[] } | { success: false; error: string }> {
  try {
    const { supabase, tenantId } = await getContext("followup:create");
    let query = supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", tenantId).is("deleted_at", null).order("first_name", { ascending: true }).limit(100);
    const term = search.trim();
    if (term) query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone_primary.ilike.%${term}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { success: true, data: (data ?? []).map((patient) => ({ id: patient.id, name: `${patient.first_name} ${patient.last_name}`, phone: patient.phone_primary })) };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : String(err) }; }
}

export async function createFollowup(input: CreateFollowupInput): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
  try {
    const { supabase, tenantId, clinicUserId } = await getContext("followup:create");
    if (!input.patient_id || !input.scheduled_for || !input.followup_type || !input.action_type) throw new Error("Patient, scheduled time, follow-up type, and action are required");
    const { data: patient, error: patientError } = await supabase.from("clinic_patients").select("id").eq("id", input.patient_id).eq("tenant_id", tenantId).is("deleted_at", null).maybeSingle();
    if (patientError || !patient) throw new Error("Patient not found or access denied");
    if (input.session_id) {
      const { data: session, error: sessionError } = await supabase.from("clinic_visit_sessions").select("id").eq("id", input.session_id).eq("tenant_id", tenantId).eq("patient_id", input.patient_id).maybeSingle();
      if (sessionError || !session) throw new Error("Visit context not found or access denied");
    }
    const payload = {
      tenant_id: tenantId, patient_id: input.patient_id, session_id: input.session_id ?? null, scheduled_for: input.scheduled_for,
      followup_type: input.followup_type, action_type: input.action_type, execution_mode: "manual", status: "open",
      assigned_to: input.assigned_to ?? null, created_by: clinicUserId, updated_by: clinicUserId, reason: input.reason ?? null,
      channel: input.channel ?? null, message_body: input.message_body ?? null,
    };
    const { data, error } = await (supabase as any).from("retention_followups").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { success: true, data: { id: data.id } };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : String(err) }; }
}

export async function updateFollowup(input: UpdateFollowupInput): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { supabase, tenantId, clinicUserId } = await getContext("followup:update");
    const { data: existing, error: existingError } = await (supabase as any).from("retention_followups").select("id,status").eq("id", input.followup_id).eq("tenant_id", tenantId).maybeSingle();
    if (existingError || !existing) throw new Error("Follow-up not found or access denied");
    const payload: Record<string, unknown> = { updated_by: clinicUserId };
    if (input.status !== undefined) {
      payload.status = input.status;
      if (input.status === "completed") payload.completed_at = new Date().toISOString();
      if (input.status === "cancelled") payload.cancelled_at = new Date().toISOString();
    }
    if (input.assigned_to !== undefined) payload.assigned_to = input.assigned_to;
    if (input.scheduled_for !== undefined) payload.scheduled_for = input.scheduled_for;
    if (input.reason !== undefined) payload.reason = input.reason;
    if (input.result !== undefined) payload.result = input.result;
    if (input.outcome !== undefined) payload.outcome = input.outcome;
    if (input.next_action_at !== undefined) payload.next_action_at = input.next_action_at;
    if (input.next_action_type !== undefined) payload.next_action_type = input.next_action_type;
    if (input.message_body !== undefined) payload.message_body = input.message_body;
    if (input.channel !== undefined) payload.channel = input.channel;
    const { error } = await (supabase as any).from("retention_followups").update(payload).eq("id", input.followup_id).eq("tenant_id", tenantId);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err) { return { success: false, error: err instanceof Error ? err.message : String(err) }; }
}

export async function completeFollowup(input: { followup_id: string; result: string; outcome?: string | null; next_action_at?: string | null; next_action_type?: string | null }): Promise<{ success: true } | { success: false; error: string }> {
  return updateFollowup({ followup_id: input.followup_id, status: "completed", result: input.result, outcome: input.outcome ?? null, next_action_at: input.next_action_at ?? null, next_action_type: input.next_action_type ?? null });
}
