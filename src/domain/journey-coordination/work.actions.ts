"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active || clinicUser.deleted_at) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

export async function createWorkItem(input: { kind?: "task" | "request" | "handoff" | "next_action" | "escalation"; title: string; details?: string; assigneeId?: string | null; patientId?: string | null; sourceType?: string | null; sourceId?: string | null; priority?: "low" | "normal" | "high" | "urgent"; dueAt?: string | null }) {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "work:create")) || !input.title.trim()) return;
  const { data: item } = await ctx.supabase.from("operational_work_items").insert({ tenant_id: ctx.tenantId, kind: input.kind || "task", title: input.title.trim(), details: input.details?.trim() || null, requester_clinic_user_id: ctx.clinicUser.id, assignee_clinic_user_id: input.assigneeId || null, patient_id: input.patientId || null, source_type: input.sourceType || null, source_id: input.sourceId || null, priority: input.priority || "normal", due_at: input.dueAt || null }).select("id").single();
  if (item) await ctx.supabase.from("operational_work_history").insert({ tenant_id: ctx.tenantId, work_item_id: item.id, actor_clinic_user_id: ctx.clinicUser.id, from_status: null, to_status: "open", note: "created" });
  revalidatePath("/work-center");
}

export async function updateWorkItem(input: { id: string; status: "accepted" | "in_progress" | "blocked" | "completed" | "rejected" | "cancelled"; outcome?: string | null }) {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "work:manage"))) return;
  const { data: current } = await ctx.supabase.from("operational_work_items").select("status").eq("tenant_id", ctx.tenantId).eq("id", input.id).maybeSingle();
  if (!current) return;
  await ctx.supabase.from("operational_work_items").update({ status: input.status, outcome: input.outcome?.trim() || null, completed_at: input.status === "completed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("tenant_id", ctx.tenantId).eq("id", input.id);
  await ctx.supabase.from("operational_work_history").insert({ tenant_id: ctx.tenantId, work_item_id: input.id, actor_clinic_user_id: ctx.clinicUser.id, from_status: current.status, to_status: input.status, note: input.outcome?.trim() || null });
  revalidatePath("/work-center");
}
