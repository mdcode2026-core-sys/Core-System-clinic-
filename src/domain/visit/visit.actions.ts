"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { transitionToPendingReception } from "@/domain/queue/workspace.actions";
import type { ClinicalVisitData, ClinicalVisitRecord, VisitProcedure } from "./visit.types";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("NOT_AUTHENTICATED");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("NO_TENANT");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  return { supabase: supabase as any, user, tenantId, permissions };
}

function requirePermission(permissions: string[], key: string) {
  if (!permissions.includes(key)) throw new Error("PERMISSION_DENIED");
}

export async function getClinicalVisit(sessionId: string): Promise<ClinicalVisitRecord | null> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:clinical");
  requirePermission(permissions, "visits:read");
  const { data, error } = await supabase.from("clinic_visit_sessions").select(`id,tenant_id,patient_id,doctor_id,room_id,agenda_event_id,session_status,session_started_at,session_ended_at,visit_closed_at,examination,findings,decision,clinic_patients(first_name,last_name,phone_primary,file_number),clinic_users!clinic_visit_sessions_doctor_id_fkey(full_name),clinic_rooms(room_name),clinic_visit_procedures(id,procedure_id,quantity,notes,performed_at,clinic_procedures(procedure_name))`).eq("id", sessionId).eq("tenant_id", tenantId).single();
  if (error || !data) return null;
  const row = data as any;
  return { id: row.id, tenant_id: row.tenant_id, patient_id: row.patient_id, doctor_id: row.doctor_id, room_id: row.room_id, agenda_event_id: row.agenda_event_id, session_status: row.session_status, session_started_at: row.session_started_at, session_ended_at: row.session_ended_at, visit_closed_at: row.visit_closed_at, doctor_name: row.clinic_users?.full_name ?? null, room_name: row.clinic_rooms?.room_name ?? null, patient_name: row.clinic_patients ? `${row.clinic_patients.first_name} ${row.clinic_patients.last_name}` : null, patient_file_number: row.clinic_patients?.file_number ?? null, patient_phone: row.clinic_patients?.phone_primary ?? null, examination: typeof row.examination === "string" ? row.examination : row.examination?.text ?? "", findings: typeof row.findings === "string" ? row.findings : row.findings?.text ?? "", decision: typeof row.decision === "string" ? row.decision : row.decision?.text ?? "", procedures: (row.clinic_visit_procedures ?? []).map((p: any) => ({ id: p.id, procedure_id: p.procedure_id, procedure_name: p.clinic_procedures?.procedure_name ?? "", quantity: p.quantity, notes: p.notes ?? null, performed_at: p.performed_at ?? null })) as VisitProcedure[] };
}

export async function getClinicalProcedures() {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:clinical");
  requirePermission(permissions, "visits:read");
  const { data, error } = await supabase.from("clinic_procedures").select("id,procedure_name,procedure_name_ar").eq("tenant_id", tenantId).eq("is_active", true).order("display_order", { ascending: true, nullsFirst: false }).order("procedure_name");
  if (error) throw new Error("PROCEDURE_FETCH_FAILED");
  return (data ?? []) as { id: string; procedure_name: string; procedure_name_ar: string | null }[];
}

export async function saveClinicalVisit(sessionId: string, input: ClinicalVisitData): Promise<void> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:clinical");
  requirePermission(permissions, "visits:update");
  const examination = input.examination.trim(); const findings = input.findings.trim(); const decision = input.decision.trim();
  if (!examination && !findings && !decision) throw new Error("EMPTY_DOCUMENTATION");
  const { error } = await supabase.from("clinic_visit_sessions").update({ examination: examination ? { text: examination } : null, findings: findings ? { text: findings } : null, decision: decision ? { text: decision } : null, clinical_notes: findings || null, doctor_notes: decision || null, updated_at: new Date().toISOString() }).eq("id", sessionId).eq("tenant_id", tenantId).eq("session_status", "in_consultation");
  if (error) throw new Error("VISIT_SAVE_FAILED");
  revalidatePath("/(dashboard)/clinical");
}

export async function addVisitProcedure(sessionId: string, procedureId: string, quantity = 1, notes?: string): Promise<void> {
  const { supabase, user, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:clinical"); requirePermission(permissions, "visits:update");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("INVALID_QUANTITY");
  const { data: session, error: sessionError } = await supabase.from("clinic_visit_sessions").select("id,session_status").eq("id", sessionId).eq("tenant_id", tenantId).single();
  if (sessionError || !session || session.session_status !== "in_consultation") throw new Error("VISIT_NOT_ACTIVE");
  const { error } = await supabase.from("clinic_visit_procedures").upsert({ tenant_id: tenantId, visit_id: sessionId, procedure_id: procedureId, quantity, notes: notes?.trim() || null, performed_at: new Date().toISOString(), created_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "visit_id,procedure_id" });
  if (error) throw new Error("PROCEDURE_SAVE_FAILED");
  revalidatePath("/(dashboard)/clinical");
}

export async function removeVisitProcedure(procedureRowId: string): Promise<void> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "workspace:clinical"); requirePermission(permissions, "visits:update");
  const { error } = await supabase.from("clinic_visit_procedures").delete().eq("id", procedureRowId).eq("tenant_id", tenantId);
  if (error) throw new Error("PROCEDURE_REMOVE_FAILED");
  revalidatePath("/(dashboard)/clinical");
}

export async function finishClinicalVisit(sessionId: string, input: ClinicalVisitData): Promise<void> {
  await saveClinicalVisit(sessionId, input); await transitionToPendingReception(sessionId); revalidatePath("/(dashboard)/operation"); revalidatePath("/(dashboard)/clinical");
}
