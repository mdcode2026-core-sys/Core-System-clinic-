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
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id").eq("tenant_id", ctx.tenantId).eq("id", conversationId).maybeSingle();
  if (!conversation) return;
  await ctx.supabase.from("communication_conversations").update({ status: "archived", updated_at: new Date().toISOString() }).eq("tenant_id", ctx.tenantId).eq("id", conversation.id);
  revalidatePath("/communications");
}

export async function createCommunicationAttachmentUpload(input: { messageId: string; fileName: string; mimeType: string; byteSize: number }) {
  const ctx = await getContext();
  if (!ctx || !input.fileName.trim() || input.byteSize < 1 || input.byteSize > 25 * 1024 * 1024) return;
  const safeName = input.fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
  const allowedMime = /^(image\/(jpeg|png|webp|gif)|application\/pdf|text\/plain|application\/msword|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation))$/;
  if (!allowedMime.test(input.mimeType)) return;

  const { data: message } = await ctx.supabase.from("communication_messages").select("id,conversation_id,message_kind").eq("tenant_id", ctx.tenantId).eq("id", input.messageId).maybeSingle();
  if (!message) return;
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id,kind,clinic_patient_id").eq("tenant_id", ctx.tenantId).eq("id", message.conversation_id).maybeSingle();
  if (!conversation) return;

  let uploader: { clinicUserId: string | null; patientIdentityId: string | null } = { clinicUserId: null, patientIdentityId: null };
  const canSend = await hasEffectivePermission(ctx.user.id, "communications:send");
  if (canSend) {
    const { data: participant } = await ctx.supabase.from("communication_conversation_participants").select("id").eq("tenant_id", ctx.tenantId).eq("conversation_id", conversation.id).eq("clinic_user_id", ctx.clinicUser.id).maybeSingle();
    if (participant || conversation.kind === "patient") uploader = { clinicUserId: ctx.clinicUser.id, patientIdentityId: null };
  }

  if (!uploader.clinicUserId && conversation.kind === "patient" && message.message_kind === "message") {
    const { data: identity } = await ctx.supabase.from("patient_identities").select("id").eq("auth_user_id", ctx.user.id).eq("status", "active").maybeSingle();
    const { data: relationship } = identity && conversation.clinic_patient_id ? await ctx.supabase.from("patient_clinic_relationships").select("clinic_patient_id").eq("patient_identity_id", identity.id).eq("tenant_id", ctx.tenantId).eq("clinic_patient_id", conversation.clinic_patient_id).eq("status", "active").maybeSingle() : { data: null };
    if (identity && relationship) uploader = { clinicUserId: null, patientIdentityId: identity.id };
  }
  if (!uploader.clinicUserId && !uploader.patientIdentityId) return;
  if (uploader.patientIdentityId && message.message_kind !== "message") return;

  const path = `${ctx.tenantId}/${conversation.id}/${message.id}/${crypto.randomUUID()}-${safeName}`;
  const { data: attachment, error: attachmentError } = await ctx.supabase.from("communication_message_attachments").insert({
    tenant_id: ctx.tenantId,
    message_id: message.id,
    storage_bucket: "communications",
    storage_path: path,
    file_name: safeName,
    mime_type: input.mimeType,
    byte_size: input.byteSize,
    uploaded_by_clinic_user_id: uploader.clinicUserId,
    uploaded_by_patient_identity_id: uploader.patientIdentityId,
  }).select("id,storage_path,storage_bucket,file_name,mime_type,byte_size").single();
  if (attachmentError || !attachment) return;

  const { data: signed, error: signedError } = await ctx.supabase.storage.from("communications").createSignedUploadUrl(path);
  if (signedError || !signed) {
    await ctx.supabase.from("communication_message_attachments").delete().eq("tenant_id", ctx.tenantId).eq("id", attachment.id);
    return;
  }
  return { attachment, uploadToken: signed.token, path };
}

export async function deleteCommunicationAttachment(attachmentId: string) {
  const ctx = await getContext();
  if (!ctx) return;
  const { data: attachment } = await ctx.supabase.from("communication_message_attachments").select("id,storage_bucket,storage_path,uploaded_by_clinic_user_id,uploaded_by_patient_identity_id").eq("tenant_id", ctx.tenantId).eq("id", attachmentId).maybeSingle();
  if (!attachment) return;
  const canManage = await hasEffectivePermission(ctx.user.id, "communications:manage");
  const isClinicUploader = attachment.uploaded_by_clinic_user_id === ctx.clinicUser.id;
  const { data: identity } = await ctx.supabase.from("patient_identities").select("id").eq("auth_user_id", ctx.user.id).eq("status", "active").maybeSingle();
  const isPatientUploader = !!identity && attachment.uploaded_by_patient_identity_id === identity.id;
  if (!canManage && !isClinicUploader && !isPatientUploader) return;
  const { error: storageError } = await ctx.supabase.storage.from(attachment.storage_bucket).remove([attachment.storage_path]);
  if (storageError) return;
  await ctx.supabase.from("communication_message_attachments").delete().eq("tenant_id", ctx.tenantId).eq("id", attachment.id);
  revalidatePath("/communications");
}

export async function sendInternalMessage(input: { conversationId: string; body: string; internalNote?: boolean; relatedType?: string | null; relatedId?: string | null }) {
  const ctx = await getContext();
  if (!ctx || !(await hasEffectivePermission(ctx.user.id, "communications:send")) || !input.body.trim()) return;
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id,kind").eq("tenant_id", ctx.tenantId).eq("id", input.conversationId).maybeSingle();
  if (!conversation) return;
  const { data: participant } = await ctx.supabase.from("communication_conversation_participants").select("id").eq("tenant_id", ctx.tenantId).eq("conversation_id", input.conversationId).eq("clinic_user_id", ctx.clinicUser.id).maybeSingle();
  const canSendTenantPatientReply = conversation.kind === "patient" && await hasEffectivePermission(ctx.user.id, "communications:send");
  if (!participant && !canSendTenantPatientReply) return;
  await ctx.supabase.from("communication_messages").insert({ tenant_id: ctx.tenantId, conversation_id: input.conversationId, sender_clinic_user_id: ctx.clinicUser.id, sender_type: "clinic", sender_patient_identity_id: null, body: input.body.trim(), message_kind: input.internalNote ? "internal_note" : "message", related_type: input.relatedType || null, related_id: input.relatedId || null });
  revalidatePath("/communications");
}

/** Personal clinic-user read authority: communication_message_reads. */
export async function markConversationRead(conversationId: string) {
  const ctx = await getContext();
  if (!ctx) return;
  const canRead = await hasEffectivePermission(ctx.user.id, "communications:read");
  const { data: conversation } = await ctx.supabase.from("communication_conversations").select("id,kind").eq("tenant_id", ctx.tenantId).eq("id", conversationId).maybeSingle();
  if (!conversation || !canRead) return;
  const { data: participant } = await ctx.supabase.from("communication_conversation_participants").select("id").eq("tenant_id", ctx.tenantId).eq("conversation_id", conversationId).eq("clinic_user_id", ctx.clinicUser.id).maybeSingle();
  if (!participant && conversation.kind === "internal") return;
  const { data: messages } = await ctx.supabase.from("communication_messages").select("id").eq("tenant_id", ctx.tenantId).eq("conversation_id", conversationId);
  if (messages?.length) await ctx.supabase.from("communication_message_reads").upsert(messages.map((message) => ({ tenant_id: ctx.tenantId, message_id: message.id, clinic_user_id: ctx.clinicUser.id, read_at: new Date().toISOString() })), { onConflict: "tenant_id,message_id,clinic_user_id" });
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
