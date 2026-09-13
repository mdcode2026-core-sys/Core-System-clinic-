"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Minus, Send, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { markConversationRead, sendInternalMessage } from "@/domain/communications/communications.actions";

interface Conversation { id: string; subject: string | null; kind: string; updated_at: string; }
interface ChatMessage { id: string; body: string; sender_clinic_user_id: string | null; created_at: string; message_kind: string; }

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadUnread = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (!clinicUser) return;
    setCurrentUserId(clinicUser.id);
    const { data: participations } = await supabase.from("communication_conversation_participants").select("conversation_id").eq("tenant_id", clinicUser.tenant_id).eq("clinic_user_id", clinicUser.id);
    const ids = Array.from(new Set((participations ?? []).map((row) => row.conversation_id).filter(Boolean)));
    if (!ids.length) { setUnread(0); return; }
    const { data: incoming } = await supabase.from("communication_messages").select("id").eq("tenant_id", clinicUser.tenant_id).in("conversation_id", ids).eq("message_kind", "message").neq("sender_clinic_user_id", clinicUser.id).order("created_at", { ascending: false }).limit(200);
    const messageIds = (incoming ?? []).map((row) => row.id);
    if (!messageIds.length) { setUnread(0); return; }
    const { data: reads } = await supabase.from("communication_message_reads").select("message_id").eq("tenant_id", clinicUser.tenant_id).eq("clinic_user_id", clinicUser.id).in("message_id", messageIds);
    const readIds = new Set((reads ?? []).map((row) => row.message_id));
    setUnread(messageIds.filter((id) => !readIds.has(id)).length);
  }, []);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (!clinicUser) { setLoading(false); return; }
    setCurrentUserId(clinicUser.id);
    const { data: participations } = await supabase.from("communication_conversation_participants").select("conversation_id").eq("tenant_id", clinicUser.tenant_id).eq("clinic_user_id", clinicUser.id);
    const ids = Array.from(new Set((participations ?? []).map((row) => row.conversation_id).filter(Boolean)));
    if (!ids.length) { setConversations([]); setLoading(false); return; }
    const { data } = await supabase.from("communication_conversations").select("id,subject,kind,updated_at").eq("tenant_id", clinicUser.tenant_id).in("id", ids).neq("status", "archived").order("updated_at", { ascending: false }).limit(20);
    setConversations((data ?? []) as Conversation[]);
    if (!selectedId && data?.[0]?.id) setSelectedId(data[0].id);
    setLoading(false);
  }, [selectedId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (!clinicUser) return;
    const { data } = await supabase.from("communication_messages").select("id,body,sender_clinic_user_id,created_at,message_kind").eq("tenant_id", clinicUser.tenant_id).eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(50);
    setMessages((data ?? []) as ChatMessage[]);
    await markConversationRead(conversationId);
    void loadUnread();
  }, [loadUnread]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await loadUnread();
    };
    void run();
    const refresh = () => void loadUnread();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const interval = window.setInterval(() => { void loadUnread(); }, 15000);
    return () => { cancelled = true; window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.clearInterval(interval); };
  }, [loadUnread]);

  useEffect(() => {
    if (!open || minimized) return;
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await loadConversations();
    };
    void run();
    return () => { cancelled = true; };
  }, [open, minimized, loadConversations]);

  useEffect(() => {
    if (!open || minimized || !selectedId) return;
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await loadMessages(selectedId);
    };
    void run();
    return () => { cancelled = true; };
  }, [open, minimized, selectedId, loadMessages]);

  const openChat = () => { setOpen(true); setMinimized(false); };
  const closeChat = () => { setOpen(false); setMinimized(false); setSelectedId(null); };
  const send = async () => {
    if (!selectedId || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    await sendInternalMessage({ conversationId: selectedId, body });
    await loadMessages(selectedId);
    await loadConversations();
  };

  return (
    <div className="relative">
      <button type="button" onClick={openChat} className="relative inline-flex h-10 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:px-3" aria-label={isArabic ? "المحادثات" : "Chat"} title={isArabic ? "المحادثات" : "Chat"} aria-expanded={open && !minimized} data-testid="global-header-chat">
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <span className="hidden xl:inline">{isArabic ? "المحادثات" : "Chat"}</span>
        {unread > 0 && <span className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white" aria-label={isArabic ? `${unread} غير مقروءة` : `${unread} unread`}>{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && !minimized ? (
        <section role="dialog" aria-label={isArabic ? "المحادثات" : "Chat"} className={cn("fixed inset-x-3 bottom-3 z-[60] flex h-[min(38rem,calc(100vh-5rem))] overflow-hidden rounded-2xl border bg-white shadow-2xl md:absolute md:inset-x-auto md:bottom-auto md:top-12 md:h-[34rem] md:w-[32rem]", isArabic ? "md:left-0" : "md:right-0")} data-testid="global-chat-panel">
          <div className="flex w-36 shrink-0 flex-col border-e bg-gray-50 md:w-44">
            <div className="flex items-center justify-between border-b px-3 py-3"><strong className="text-sm">{isArabic ? "المحادثات" : "Chat"}</strong><button type="button" onClick={() => setMinimized(true)} className="rounded p-1.5 hover:bg-gray-200" aria-label={isArabic ? "تصغير" : "Minimize"}><Minus className="h-4 w-4" /></button></div>
            <div className="flex-1 overflow-y-auto p-1.5">{loading ? <p className="p-3 text-xs text-gray-500">{isArabic ? "جارٍ التحميل..." : "Loading..."}</p> : conversations.length ? conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={cn("w-full rounded-lg px-2.5 py-2 text-start text-xs", selectedId === conversation.id ? "bg-white font-semibold shadow-sm" : "hover:bg-white/80")}>{conversation.subject || (conversation.kind === "patient" ? (isArabic ? "محادثة مريض" : "Patient conversation") : (isArabic ? "محادثة داخلية" : "Internal conversation"))}</button>) : <p className="p-3 text-xs text-gray-500">{isArabic ? "لا توجد محادثات" : "No conversations"}</p>}</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-3 py-3"><strong className="truncate text-sm">{conversations.find((item) => item.id === selectedId)?.subject || (isArabic ? "محادثة" : "Conversation")}</strong><button type="button" onClick={closeChat} className="rounded p-1.5 hover:bg-gray-100" aria-label={isArabic ? "إغلاق" : "Close"}><X className="h-4 w-4" /></button></div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">{selectedId && messages.length ? messages.map((message) => <div key={message.id} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", message.sender_clinic_user_id === currentUserId ? "ms-auto bg-blue-600 text-white" : "bg-gray-100 text-gray-800")}><p className="whitespace-pre-wrap break-words">{message.body}</p></div>) : <p className="py-8 text-center text-sm text-gray-500">{isArabic ? "اختر محادثة لبدء العمل" : "Select a conversation to start"}</p>}</div>
            {selectedId ? <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex items-end gap-2 border-t p-3"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} className="min-h-10 flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder={isArabic ? "اكتب رسالة..." : "Write a message..."} aria-label={isArabic ? "نص الرسالة" : "Message"} /><button type="submit" disabled={!draft.trim()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40" aria-label={isArabic ? "إرسال" : "Send"}><Send className="h-4 w-4" /></button></form> : null}
          </div>
        </section>
      ) : null}
      {open && minimized ? <button type="button" onClick={() => setMinimized(false)} className="fixed bottom-3 end-3 z-[60] rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-xl md:absolute md:top-12 md:bottom-auto" aria-label={isArabic ? "فتح المحادثات" : "Open Chat"}>{isArabic ? "المحادثات" : "Chat"}{unread > 0 ? ` (${unread})` : ""}</button> : null}
    </div>
  );
}
