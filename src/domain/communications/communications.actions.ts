"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import { createWorkItem } from "@/domain/journey-coordination/work.actions";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id,is_active,deleted_at").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active || clinicUser.deleted_at) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

export async function createConversation(input: { subject?: string; recipientUserId?: string; recipientUserIds?: string[]; clinicPatientId?: string | null }) {
  const ctx = await getContext();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:send"))) return;
  const recipientIds = Array.from(new Set([...(input.recipientUserIds ?? []), ...(input.recipientUserId ? [input.recipientUserId] : [])].filter(Boolean))).filter((id) => id !== ctx.clinicUser.id);
  if (!input.clinicPatientId && recipientIds.length === 0) return;

  const { data: conversation } = await ctx.supabase.from("communication_conversations").insert({
    tenant_id: ctx.tenantId,
    kind: input.clinicPatientId ? "patient" : "internal",
    subject: input.subject?.trim() || null,
    clinic_patient_id: input.clinicPatientId || null,
    created_by: ctx.clinicUser.id,
  }).select("id").single();
  if (!conversation) return;

  const participants = [
    { tenant_id: ctx.tenantId, conversation_id: conversation.id, clinic_user_id: ctx.clinicUser.id, role: "owner" },
    ...recipientIds.map((clinicUserId) => ({ tenant_id: ctx.tenantId, conversation_id: conversation.id, clinic_user_id: clinicUserId, role: "participant" })),
  ];
  if (participants.length) await ctx.supabase.from("communication_conversation_participants").insert(participants);
  revalidatePath("/communications");
}

export async function addConversationParticipant(input: { conversationId: string; clinicUserId: string }) {
  const ctx = await getContext();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:manage"))) return;
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id,kind,status").eq("tenant_id", ctx.tenantId).eq("id", input.conversationId).maybeSingle();
  if (!conversation || conversation.kind !== "internal" || conversation.status === "archived") return;
  const { data: target } = await ctx.supabase.from("clinic_users").select("id").eq("tenant_id", ctx.tenantId).eq("id", input.clinicUserId).eq("is_active", true).is("deleted_at", null).maybeSingle();
  if (!target) return;
  await ctx.supabase.from("communication_conversation_participants").upsert({ tenant_id: ctx.tenantId, conversation_id: conversation.id, clinic_user_id: target.id, role: "participant" }, { onConflict: "tenant_id,conversation_id,clinic_user_id" });
  revalidatePath("/communications");
}

export async function removeConversationParticipant(input: { conversationId: string; clinicUserId: string }) {
  const ctx = await getContext();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:manage"))) return;
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id,kind,status,created_by").eq("tenant_id", ctx.tenantId).eq("id", input.conversationId).maybeSingle();
  if (!conversation || conversation.kind !== "internal" || conversation.status === "archived") return;
  if (conversation.created_by === input.clinicUserId) return;
  await ctx.supabase.from("communication_conversation_participants").delete().eq("tenant_id", ctx.tenantId).eq("conversation_id", input.conversationId).eq("clinic_user_id", input.clinicUserId);
  revalidatePath("/communications");
}

export async function archiveConversation(conversationId: string) {
  const ctx = await getContext();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:manage"))) return;
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id,kind,created_by").eq("tenant_id", ctx.tenantId).eq("id", conversationId).maybeSingle();
  if (!conversation) return;
  await ctx.supabase.from("communication_conversations").update({ status: "archived", updated_at: new Date().toISOString() }).eq("tenant_id", ctx.tenantId).eq("id", conversation.id);
  revalidatePath("/communications");
}

export async function sendInternalMessage(input: { conversationId: string; body: string; internalNote?: boolean; relatedType?: string | null; relatedId?: string | null }) {
  const ctx = await getContext();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:send")) || !input.body.trim()) return;

  const { data: conversation } = await ctx.supabase
    .from("communication_conversations")
    .select("id,kind")
    .eq("tenant_id", ctx.tenantId)
    .eq("id", input.conversationId)
    .maybeSingle();
  if (!conversation) return;

  const { data: participant } = await ctx.supabase.from("communication_conversation_participants").select("id").eq("tenant_id", ctx.tenantId).eq("conversation_id", input.conversationId).eq("clinic_user_id", ctx.clinicUser.id).maybeSingle();
  const canSendTenantPatientReply = conversation.kind === "patient" && await hasEffectivePermission(ctx.user.id, "communications:send");
  if (!participant && !canSendTenantPatientReply) return;

  await ctx.supabase.from("communication_messages").insert({
    tenant_id: ctx.tenantId,
    conversation_id: input.conversationId,
    sender_clinic_user_id: ctx.clinicUser.id,
    sender_type: "clinic",
    sender_patient_identity_id: null,
    body: input.body.trim(),
    message_kind: input.internalNote ? "internal_note" : "message",
    related_type: input.relatedType || null,
    related_id: input.relatedId || null,
  });
  revalidatePath("/communications");
}

/** Personal clinic-user read authority: communication_message_reads. */
export async function markConversationRead(conversationId: string) {
  const ctx = await getContext();
  if (!ctx) return;

  const canRead = await hasEffectivePermission(ctx.user.id, "communications:read");
  const { data: conversation } = await ctx.supabase
    .from("communication_conversations")
    .select("id,kind")
    .eq("tenant_id", ctx.tenantId)
    .eq("id", conversationId)
    .maybeSingle();
  if (!conversation || !canRead) return;

  const { data: participant } = await ctx.supabase
    .from("communication_conversation_participants")
    .select("id")
    .eq("tenant_id", ctx.tenantId)
    .eq("conversation_id", conversationId)
    .eq("clinic_user_id", ctx.clinicUser.id)
    .maybeSingle();
  if (!participant && conversation.kind === "internal") return;

  const { data: messages } = await ctx.supabase
    .from("communication_messages")
    .select("id")
    .eq("tenant_id", ctx.tenantId)
    .eq("conversation_id", conversationId);

  if (messages?.length) {
    await ctx.supabase.from("communication_message_reads").upsert(
      messages.map((message) => ({ tenant_id: ctx.tenantId, message_id: message.id, clinic_user_id: ctx.clinicUser.id, read_at: new Date().toISOString() })),
      { onConflict: "tenant_id,message_id,clinic_user_id" },
    );
  }
  revalidatePath("/communications");
}

export async function createCommunicationRequest(input: { title: string; details?: string; assigneeUserId?: string | null; clinicPatientId?: string | null; priority?: "low" | "normal" | "high" | "urgent"; category?: string; dueAt?: string | null; conversationId?: string | null }) {
  const ctx = await getContext(); if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:request")) || !input.title.trim()) return;
  const { data } = await ctx.supabase.from("communication_requests").insert({ tenant_id: ctx.tenantId, conversation_id: input.conversationId || null, requester_clinic_user_id: ctx.clinicUser.id, assignee_clinic_user_id: input.assigneeUserId || null, clinic_patient_id: input.clinicPatientId || null, title: input.title.trim(), details: input.details?.trim() || null, priority: input.priority || "normal", category: input.category?.trim() || "general", due_at: input.dueAt || null }).select("id").single();
  if (data && input.assigneeUserId) await createWorkItem({ kind: "request", title: input.title, details: input.details, assigneeId: input.assigneeUserId, patientId: input.clinicPatientId, sourceType: "communication_request", sourceId: data.id, priority: input.priority || "normal", dueAt: input.dueAt || null });
  revalidatePath("/communications"); revalidatePath("/work-center");
}

export async function updateCommunicationRequest(input: { id: string; status: "accepted" | "in_progress" | "completed" | "rejected" | "cancelled"; outcome?: string | null }) {
  const ctx = await getContext(); if (!ctx || (!(await hasEffectivePermission(ctx.user.id, "communications:manage")) && !(await hasEffectivePermission(ctx.user.id, "communications:request")))) return;
  await ctx.supabase.from("communication_requests").update({ status: input.status, outcome: input.outcome?.trim() || null, completed_at: input.status === "completed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", input.id).eq("tenant_id", ctx.tenantId);
  revalidatePath("/communications");
}
