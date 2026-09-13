"use server";

import { createClient } from "@/infrastructure/supabase/server";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("id,tenant_id,is_active,deleted_at,full_name,email,role")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!clinicUser) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

export async function searchCommunicationUsers(query = "") {
  const ctx = await getContext();
  if (!ctx) throw new Error("COMMUNICATIONS_AUTH_REQUIRED");
  const value = query.trim();
  let request = ctx.supabase
    .from("clinic_users")
    .select("id,full_name,email,role")
    .eq("tenant_id", ctx.tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .neq("id", ctx.clinicUser.id)
    .order("full_name", { ascending: true })
    .limit(20);
  if (value) request = request.or(`full_name.ilike.%${value}%,email.ilike.%${value}%`);
  const { data, error } = await request;
  if (error) {
    console.error("Communications directory query failed", { code: error.code, message: error.message });
    throw new Error("COMMUNICATIONS_DIRECTORY_UNAVAILABLE");
  }
  return (data ?? []).map(item => ({
    id: item.id as string,
    full_name: (item.full_name as string | null) ?? "",
    email: (item.email as string | null) ?? "",
    role: (item.role as string | null) ?? "",
  }));
}

export async function getCommunicationsHeaderFeed() {
  const ctx = await getContext();
  if (!ctx) return { unread: [], requests: [] };
  const { data: participations } = await ctx.supabase.from("communication_conversation_participants").select("conversation_id").eq("tenant_id", ctx.tenantId).eq("clinic_user_id", ctx.clinicUser.id);
  const conversationIds = Array.from(new Set((participations ?? []).map(row => row.conversation_id).filter(Boolean)));
  let unread: Array<{ id:string; conversation_id:string; body:string; message_kind:string; created_at:string }> = [];
  if (conversationIds.length) {
    const { data: messages } = await ctx.supabase.from("communication_messages").select("id,conversation_id,body,message_kind,created_at").eq("tenant_id", ctx.tenantId).in("conversation_id", conversationIds).in("message_kind", ["message","internal_note"]).neq("sender_clinic_user_id", ctx.clinicUser.id).order("created_at", { ascending:false }).limit(50);
    const messageIds = (messages ?? []).map(message => message.id);
    const { data: reads } = messageIds.length ? await ctx.supabase.from("communication_message_reads").select("message_id").eq("tenant_id", ctx.tenantId).eq("clinic_user_id", ctx.clinicUser.id).in("message_id", messageIds) : { data: [] };
    const readIds = new Set((reads ?? []).map(row => row.message_id));
    unread = (messages ?? []).filter(message => !readIds.has(message.id)).slice(0, 12) as typeof unread;
  }
  const { data: requests } = await ctx.supabase.from("communication_requests").select("id,title,priority,status,due_at,updated_at").eq("tenant_id", ctx.tenantId).eq("assignee_clinic_user_id", ctx.clinicUser.id).in("status", ["open","accepted","in_progress"]).order("updated_at", { ascending:false }).limit(8);
  return {
    unread,
    requests: (requests ?? []).map(request => ({ id: request.id as string, title: request.title as string, priority: request.priority as string, status: request.status as string, due_at: request.due_at as string | null }))
  };
}
