"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active || clinicUser.deleted_at) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

export async function createConversation(input: { subject?: string; recipientUserId?: string; clinicPatientId?: string | null }) {
  const ctx = await getContext();
  if (!ctx) return;
  if (!(await hasEffectivePermission(ctx.user.id, "communications:send"))) return;
  const { data: conversation } = await ctx.supabase.from("communication_conversations").insert({ tenant_id: ctx.tenantId, kind: input.clinicPatientId ? "patient" : "internal", subject: input.subject?.trim() || null, clinic_patient_id: input.clinicPatientId || null, created_by: ctx.clinicUser.id }).select("id").single();
  if (!conversation) return;
  await ctx.supabase.from("communication_conversation_participants").insert({ tenant_id: ctx.tenantId, conversation_id: conversation.id, clinic_user_id: ctx.clinicUser.id, role: "owner" });
  if (input.recipientUserId) await ctx.supabase.from("communication_conversation_participants").insert({ tenant_id: ctx.tenantId, conversation_id: conversation.id, clinic_user_id: input.recipientUserId, role: "participant" });
  revalidatePath("/communications");
}

export async function sendInternalMessage(input: { conversationId: string; body: string; internalNote?: boolean; relatedType?: string | null; relatedId?: string | null }) {
  const ctx = await getContext();
  if (!ctx) return;
  if (!(await hasEffectivePermission(ctx.user.id, "communications:send"))) return;
  if (!input.body.trim()) return;
  const { data: participant } = await ctx.supabase.from("communication_conversation_participants").select("id").eq("tenant_id", ctx.tenantId).eq("conversation_id", input.conversationId).eq("clinic_user_id", ctx.clinicUser.id).maybeSingle();
  if (!participant) return;
  await ctx.supabase.from("communication_messages").insert({ tenant_id: ctx.tenantId, conversation_id: input.conversationId, sender_clinic_user_id: ctx.clinicUser.id, body: input.body.trim(), message_kind: input.internalNote ? "internal_note" : "message", related_type: input.relatedType || null, related_id: input.relatedId || null });
  revalidatePath("/communications");
}

export async function createCommunicationRequest(input: { title: string; details?: string; assigneeUserId?: string | null; clinicPatientId?: string | null; priority?: "low" | "normal" | "high" | "urgent"; category?: string; dueAt?: string | null; conversationId?: string | null }) {
  const ctx = await getContext();
  if (!ctx) return;
  if (!(await hasEffectivePermission(ctx.user.id, "communications:request"))) return;
  if (!input.title.trim()) return;
  await ctx.supabase.from("communication_requests").insert({ tenant_id: ctx.tenantId, conversation_id: input.conversationId || null, requester_clinic_user_id: ctx.clinicUser.id, assignee_clinic_user_id: input.assigneeUserId || null, clinic_patient_id: input.clinicPatientId || null, title: input.title.trim(), details: input.details?.trim() || null, priority: input.priority || "normal", category: input.category?.trim() || "general", due_at: input.dueAt || null });
  revalidatePath("/communications");
}

export async function updateCommunicationRequest(input: { id: string; status: "accepted" | "in_progress" | "completed" | "rejected" | "cancelled"; outcome?: string | null }) {
  const ctx = await getContext();
  if (!ctx) return;
  if (!(await hasEffectivePermission(ctx.user.id, "communications:manage")) && !(await hasEffectivePermission(ctx.user.id, "communications:request"))) return;
  await ctx.supabase.from("communication_requests").update({ status: input.status, outcome: input.outcome?.trim() || null, completed_at: input.status === "completed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", input.id).eq("tenant_id", ctx.tenantId);
  revalidatePath("/communications");
}
