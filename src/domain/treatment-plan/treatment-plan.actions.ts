"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { AddTreatmentPlanItemInput, CreateTreatmentPlanInput, TreatmentPlanRecord } from "./treatment-plan.types";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("No tenant assigned");
  const { data: clinicUser, error: clinicUserError } = await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id", user.id).eq("tenant_id", tenantId).maybeSingle();
  if (clinicUserError || !clinicUser?.is_active || clinicUser.deleted_at) throw new Error("Clinic user context unavailable");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  return { supabase: supabase as any, user, clinicUser, tenantId, permissions };
}

function requirePermission(permissions: string[], key: string) {
  if (!permissions.includes(key)) throw new Error(`Permission denied: ${key} required`);
}

async function ensureNextAction(supabase: any, tenantId: string, clinicUserId: string, planId: string, patientId: string) {
  const { data: nextItem } = await supabase.from("clinic_treatment_plan_items").select("id,title,description,planned_date,sequence_no,status").eq("tenant_id", tenantId).eq("treatment_plan_id", planId).in("status", ["planned", "pending", "scheduled"]).order("sequence_no", { ascending: true }).limit(1).maybeSingle();
  if (!nextItem) return null;
  const sourceId = nextItem.id as string;
  const { data: existing } = await supabase.from("operational_work_items").select("id,status").eq("tenant_id", tenantId).eq("kind", "next_action").eq("source_type", "treatment_plan_item").eq("source_id", sourceId).in("status", ["open", "accepted", "in_progress", "blocked"]).limit(1).maybeSingle();
  if (existing) return existing.id;
  const needsBooking = Boolean(nextItem.planned_date);
  const title = needsBooking ? `Book next treatment stage: ${nextItem.title}` : `Execute next treatment stage: ${nextItem.title}`;
  const details = [`Treatment plan ${planId}`, `Stage ${nextItem.sequence_no}`, nextItem.description || null, needsBooking ? `Booking required for planned date ${nextItem.planned_date}` : "Booking requirement to be determined by the authorized operational actor"].filter(Boolean).join(" · ");
  const { data: workItem, error } = await supabase.from("operational_work_items").insert({ tenant_id: tenantId, kind: "next_action", title, details, requester_clinic_user_id: clinicUserId, assignee_clinic_user_id: null, patient_id: patientId, source_type: "treatment_plan_item", source_id: sourceId, priority: "normal", due_at: nextItem.planned_date ? `${nextItem.planned_date}T09:00:00` : null }).select("id").single();
  if (error) throw new Error(`Treatment next-action creation failed: ${error.message}`);
  await supabase.from("operational_work_history").insert({ tenant_id: tenantId, work_item_id: workItem.id, actor_clinic_user_id: clinicUserId, from_status: null, to_status: "open", note: "created_from_treatment_plan_stage" });
  return workItem.id as string;
}

async function loadPlan(supabase: any, tenantId: string, planId: string): Promise<TreatmentPlanRecord | null> {
  const { data, error } = await supabase.from("clinic_treatment_plans").select(`id,patient_id,source_visit_id,title,diagnosis_summary,goals,status,start_date,target_end_date,completed_at,created_at,updated_at,clinic_patients(first_name,last_name),clinic_treatment_plan_items(id,treatment_plan_id,procedure_id,title,description,sequence_no,planned_date,quantity,status,completed_at,notes,clinic_procedures(procedure_name)),clinic_treatment_plan_visits(id,treatment_plan_item_id,visit_id,linked_at)`).eq("id", planId).eq("tenant_id", tenantId).single();
  if (error || !data) return null;
  const row = data as any;
  return { id: row.id, patient_id: row.patient_id, patient_name: row.clinic_patients ? `${row.clinic_patients.first_name} ${row.clinic_patients.last_name}` : null, source_visit_id: row.source_visit_id, title: row.title, diagnosis_summary: row.diagnosis_summary, goals: row.goals, status: row.status, start_date: row.start_date, target_end_date: row.target_end_date, completed_at: row.completed_at, created_at: row.created_at, updated_at: row.updated_at, items: (row.clinic_treatment_plan_items ?? []).sort((a: any, b: any) => a.sequence_no - b.sequence_no).map((item: any) => ({ id: item.id, treatment_plan_id: item.treatment_plan_id, procedure_id: item.procedure_id, procedure_name: item.clinic_procedures?.procedure_name ?? null, title: item.title, description: item.description, sequence_no: item.sequence_no, planned_date: item.planned_date, quantity: item.quantity, status: item.status, completed_at: item.completed_at, notes: item.notes })), visits: row.clinic_treatment_plan_visits ?? [] };
}

export async function getTreatmentPlans(patientId?: string): Promise<TreatmentPlanRecord[]> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:read");
  let query = supabase.from("clinic_treatment_plans").select("id").eq("tenant_id", tenantId).order("created_at", { ascending: false });
  if (patientId) query = query.eq("patient_id", patientId);
  const { data, error } = await query;
  if (error) throw new Error(`Treatment plans fetch failed: ${error.message}`);
  const plans = await Promise.all((data ?? []).map((row: any) => loadPlan(supabase, tenantId, row.id)));
  return plans.filter(Boolean) as TreatmentPlanRecord[];
}

export async function getTreatmentPlan(planId: string): Promise<TreatmentPlanRecord | null> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:read");
  return loadPlan(supabase, tenantId, planId);
}

export async function createTreatmentPlan(input: CreateTreatmentPlanInput): Promise<string> {
  const { supabase, user, clinicUser, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:create");
  const title = input.title.trim();
  if (!title) throw new Error("Treatment plan title is required");
  const { data: patient, error: patientError } = await supabase.from("clinic_patients").select("id").eq("id", input.patientId).eq("tenant_id", tenantId).single();
  if (patientError || !patient) throw new Error("Patient not found");
  if (input.sourceVisitId) {
    const { data: visit, error: visitError } = await supabase.from("clinic_visit_sessions").select("id,patient_id,tenant_id").eq("id", input.sourceVisitId).eq("tenant_id", tenantId).single();
    if (visitError || !visit || visit.patient_id !== input.patientId) throw new Error("Source visit does not belong to this patient");
  }
  const { data, error } = await supabase.from("clinic_treatment_plans").insert({ tenant_id: tenantId, patient_id: input.patientId, source_visit_id: input.sourceVisitId ?? null, title, diagnosis_summary: input.diagnosisSummary?.trim() || null, goals: input.goals?.trim() || null, start_date: input.startDate || null, target_end_date: input.targetEndDate || null, created_by: clinicUser.id }).select("id").single();
  if (error) throw new Error(`Treatment plan creation failed: ${error.message}`);
  revalidatePath("/(dashboard)/treatment-plans");
  return data.id;
}

export async function updateTreatmentPlan(planId: string, input: Partial<CreateTreatmentPlanInput> & { status?: TreatmentPlanRecord["status"] }): Promise<void> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:update");
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) update.title = input.title.trim();
  if (input.diagnosisSummary !== undefined) update.diagnosis_summary = input.diagnosisSummary.trim() || null;
  if (input.goals !== undefined) update.goals = input.goals.trim() || null;
  if (input.startDate !== undefined) update.start_date = input.startDate || null;
  if (input.targetEndDate !== undefined) update.target_end_date = input.targetEndDate || null;
  if (input.status !== undefined) { update.status = input.status; update.completed_at = input.status === "completed" ? new Date().toISOString() : null; }
  const { error } = await supabase.from("clinic_treatment_plans").update(update).eq("id", planId).eq("tenant_id", tenantId);
  if (error) throw new Error(`Treatment plan update failed: ${error.message}`);
  revalidatePath("/(dashboard)/treatment-plans");
}

export async function addTreatmentPlanItem(input: AddTreatmentPlanItemInput): Promise<void> {
  const { supabase, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:update");
  const title = input.title.trim();
  if (!title) throw new Error("Activity title is required");
  if (!Number.isInteger(input.quantity ?? 1) || (input.quantity ?? 1) < 1) throw new Error("Quantity must be a positive integer");
  const { data: plan, error: planError } = await supabase.from("clinic_treatment_plans").select("id").eq("id", input.treatmentPlanId).eq("tenant_id", tenantId).single();
  if (planError || !plan) throw new Error("Treatment plan not found");
  const { data: last } = await supabase.from("clinic_treatment_plan_items").select("sequence_no").eq("treatment_plan_id", input.treatmentPlanId).eq("tenant_id", tenantId).order("sequence_no", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("clinic_treatment_plan_items").insert({ tenant_id: tenantId, treatment_plan_id: input.treatmentPlanId, procedure_id: input.procedureId || null, title, description: input.description?.trim() || null, sequence_no: (last?.sequence_no ?? 0) + 1, planned_date: input.plannedDate || null, quantity: input.quantity ?? 1, notes: input.notes?.trim() || null });
  if (error) throw new Error(`Treatment plan activity creation failed: ${error.message}`);
  revalidatePath("/(dashboard)/treatment-plans");
}

export async function updateTreatmentPlanItem(itemId: string, update: { status?: TreatmentPlanRecord["items"][number]["status"]; plannedDate?: string | null; notes?: string | null; quantity?: number }): Promise<void> {
  const { supabase, clinicUser, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:update");
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (update.status !== undefined) { payload.status = update.status; payload.completed_at = update.status === "completed" ? new Date().toISOString() : null; }
  if (update.plannedDate !== undefined) payload.planned_date = update.plannedDate || null;
  if (update.notes !== undefined) payload.notes = update.notes?.trim() || null;
  if (update.quantity !== undefined) { if (!Number.isInteger(update.quantity) || update.quantity < 1) throw new Error("Quantity must be a positive integer"); payload.quantity = update.quantity; }
  const { error } = await supabase.from("clinic_treatment_plan_items").update(payload).eq("id", itemId).eq("tenant_id", tenantId);
  if (error) throw new Error(`Treatment plan activity update failed: ${error.message}`);
  if (update.status === "completed") {
    const { data: currentItem, error: itemError } = await supabase.from("clinic_treatment_plan_items").select("treatment_plan_id").eq("id", itemId).eq("tenant_id", tenantId).single();
    if (itemError || !currentItem) throw new Error("Completed treatment activity could not be reloaded");
    const { data: plan, error: planError } = await supabase.from("clinic_treatment_plans").select("id,patient_id").eq("id", currentItem.treatment_plan_id).eq("tenant_id", tenantId).single();
    if (planError || !plan) throw new Error("Treatment plan could not be reloaded");
    await ensureNextAction(supabase, tenantId, clinicUser.id, plan.id, plan.patient_id);
  }
  revalidatePath("/(dashboard)/treatment-plans");
}

export async function linkVisitToTreatmentPlan(planId: string, visitId: string, treatmentPlanItemId?: string | null): Promise<void> {
  const { supabase, clinicUser, tenantId, permissions } = await getContext();
  requirePermission(permissions, "treatment_plans:update");
  const { data: plan, error: planError } = await supabase.from("clinic_treatment_plans").select("id,patient_id").eq("id", planId).eq("tenant_id", tenantId).single();
  const { data: visit, error: visitError } = await supabase.from("clinic_visit_sessions").select("id,patient_id,tenant_id").eq("id", visitId).eq("tenant_id", tenantId).single();
  if (planError || !plan || visitError || !visit || plan.patient_id !== visit.patient_id) throw new Error("Plan and visit must belong to the same patient");
  if (treatmentPlanItemId) {
    const { data: item, error: itemError } = await supabase.from("clinic_treatment_plan_items").select("id,treatment_plan_id").eq("id", treatmentPlanItemId).eq("treatment_plan_id", planId).eq("tenant_id", tenantId).single();
    if (itemError || !item) throw new Error("Treatment plan activity not found");
  }
  const { error } = await supabase.from("clinic_treatment_plan_visits").insert({ tenant_id: tenantId, treatment_plan_id: planId, treatment_plan_item_id: treatmentPlanItemId ?? null, visit_id: visitId, linked_by: clinicUser.id });
  if (error && !String(error.message).toLowerCase().includes("duplicate")) throw new Error(`Visit link failed: ${error.message}`);
  if (treatmentPlanItemId) await updateTreatmentPlanItem(treatmentPlanItemId, { status: "completed" });
  revalidatePath("/(dashboard)/treatment-plans");
}
