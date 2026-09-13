"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { markConversationRead } from "@/domain/communications/communications.actions";

export interface InternalChatContact {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  conversationId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface InternalChatMessage {
  id: string;
  body: string;
  senderClinicUserId: string | null;
  createdAt: string;
  messageKind: string;
}

export async function getInternalChatDirectory(query = "") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("COMMUNICATIONS_AUTH_REQUIRED");

  const { data, error } = await supabase.rpc("get_internal_chat_directory", {
    p_query: query.trim(),
  });
  if (error) {
    console.error("Internal chat directory failed", { code: error.code, message: error.message });
    throw new Error("COMMUNICATIONS_DIRECTORY_UNAVAILABLE");
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map(row => ({
    userId: String(row.user_id),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    role: String(row.role ?? ""),
    conversationId: row.conversation_id ? String(row.conversation_id) : null,
    lastMessage: row.last_message ? String(row.last_message) : null,
    lastMessageAt: row.last_message_at ? String(row.last_message_at) : null,
    unreadCount: Number(row.unread_count ?? 0),
  })) as InternalChatContact[];
}

export async function getInternalChatMessages(conversationId: string) {
  const id = conversationId.trim();
  if (!id) return [] as InternalChatMessage[];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("COMMUNICATIONS_AUTH_REQUIRED");

  const { data, error } = await supabase
    .from("communication_messages")
    .select("id,body,sender_clinic_user_id,created_at,message_kind")
    .eq("conversation_id", id)
    .eq("message_kind", "message")
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) {
    console.error("Internal chat messages failed", { code: error.code, message: error.message });
    throw new Error("COMMUNICATIONS_MESSAGES_UNAVAILABLE");
  }

  return (data ?? []).map(message => ({
    id: String(message.id),
    body: String(message.body ?? ""),
    senderClinicUserId: message.sender_clinic_user_id ? String(message.sender_clinic_user_id) : null,
    createdAt: String(message.created_at),
    messageKind: String(message.message_kind),
  })) as InternalChatMessage[];
}

export async function markInternalChatRead(conversationId: string) {
  const id = conversationId.trim();
  if (!id) return;
  await markConversationRead(id);
}
