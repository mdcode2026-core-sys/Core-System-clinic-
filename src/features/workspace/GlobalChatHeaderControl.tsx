"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Grip, Loader2, MessageCircle, Minus, Paperclip, Plus, Search, Send, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { createCommunicationAttachmentUpload, createConversation, markConversationRead, sendInternalMessage } from "@/domain/communications/communications.actions";
import { searchCommunicationUsers } from "@/domain/communications/communications.header.actions";

interface Conversation { id: string; subject: string | null; kind: string; updated_at: string; }
interface ChatAttachment { id: string; message_id: string; file_name: string; mime_type: string; byte_size: number; }
interface ChatMessage { id: string; body: string; sender_clinic_user_id: string | null; created_at: string; message_kind: string; }
interface DirectoryUser { id: string; full_name: string; email: string; role: string; }
interface PanelGeometry { x: number; y: number; width: number; height: number; }
interface MiniPosition { x: number; y: number; }
interface DragState { mode: "panel" | "resize" | "mini"; pointerId: number; startX: number; startY: number; originX: number; originY: number; originWidth: number; originHeight: number; moved: boolean; }

const PANEL_MIN_WIDTH = 300;
const PANEL_MIN_HEIGHT = 320;
const PANEL_GAP = 12;
const PANEL_TOP_GAP = 68;
const MINI_SIZE = 58;
const STORAGE_PREFIX = "core-system-global-chat-layout-v2";

function getDefaultGeometry(): PanelGeometry {
  if (typeof window === "undefined") return { x: 12, y: 68, width: 520, height: 560 };
  const mobile = window.innerWidth < 768;
  const width = mobile ? Math.max(PANEL_MIN_WIDTH, window.innerWidth - PANEL_GAP * 2) : Math.min(520, window.innerWidth - PANEL_GAP * 2);
  const height = mobile ? Math.max(PANEL_MIN_HEIGHT, window.innerHeight - PANEL_TOP_GAP - PANEL_GAP) : Math.min(560, window.innerHeight - PANEL_TOP_GAP - PANEL_GAP);
  return { x: mobile ? PANEL_GAP : Math.max(PANEL_GAP, window.innerWidth - width - PANEL_GAP), y: mobile ? PANEL_TOP_GAP : Math.max(PANEL_TOP_GAP, Math.round((window.innerHeight - height) / 2)), width, height };
}

function getDefaultMini(): MiniPosition {
  if (typeof window === "undefined") return { x: 24, y: 80 };
  return { x: Math.max(12, window.innerWidth - MINI_SIZE - 18), y: Math.max(72, window.innerHeight - MINI_SIZE - 24) };
}

function normalizeGeometry(value: PanelGeometry): PanelGeometry {
  if (typeof window === "undefined") return value;
  const maxWidth = Math.max(PANEL_MIN_WIDTH, window.innerWidth - PANEL_GAP * 2);
  const maxHeight = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - PANEL_TOP_GAP - PANEL_GAP);
  const width = Math.min(value.width, maxWidth);
  const height = Math.min(value.height, maxHeight);
  return { x: Math.min(value.x, window.innerWidth - 24), y: Math.min(value.y, window.innerHeight - 24), width, height };
}

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<Record<string, ChatAttachment[]>>({});
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [geometry, setGeometry] = useState<PanelGeometry>(() => getDefaultGeometry());
  const [miniPosition, setMiniPosition] = useState<MiniPosition>(() => getDefaultMini());
  const [directoryOpen, setDirectoryOpen] = useState(true);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressMiniClickRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const storageKey = currentUserId ? `${STORAGE_PREFIX}:${currentUserId}` : null;

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
    const { data: incoming } = await supabase.from("communication_messages").select("id").eq("tenant_id", clinicUser.tenant_id).in("conversation_id", ids).in("message_kind", ["message", "internal_note"]).neq("sender_clinic_user_id", clinicUser.id).order("created_at", { ascending: false }).limit(200);
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
    const { data } = await supabase.from("communication_conversations").select("id,subject,kind,updated_at").eq("tenant_id", clinicUser.tenant_id).in("id", ids).neq("status", "archived").order("updated_at", { ascending: false }).limit(30);
    setConversations((data ?? []) as Conversation[]);
    setLoading(false);
  }, []);

  const loadDirectory = useCallback(async (query: string) => {
    setDirectoryLoading(true);
    const users = await searchCommunicationUsers(query);
    setDirectoryUsers(users as DirectoryUser[]);
    setDirectoryLoading(false);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clinicUser } = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (!clinicUser) return;
    const { data } = await supabase.from("communication_messages").select("id,body,sender_clinic_user_id,created_at,message_kind").eq("tenant_id", clinicUser.tenant_id).eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(100);
    const nextMessages = (data ?? []) as ChatMessage[];
    setMessages(nextMessages);
    const ids = nextMessages.map((message) => message.id);
    if (ids.length) {
      const { data: nextAttachments } = await supabase.from("communication_message_attachments").select("id,message_id,file_name,mime_type,byte_size").eq("tenant_id", clinicUser.tenant_id).in("message_id", ids);
      const grouped: Record<string, ChatAttachment[]> = {};
      for (const attachment of nextAttachments ?? []) {
        const item = attachment as ChatAttachment;
        grouped[item.message_id] = [...(grouped[item.message_id] ?? []), item];
      }
      setAttachments(grouped);
    } else setAttachments({});
    await markConversationRead(conversationId);
    void loadUnread();
  }, [loadUnread]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUnread(), 0);
    const refresh = () => void loadUnread();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const interval = window.setInterval(refresh, 15000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [loadUnread]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { geometry?: PanelGeometry; miniPosition?: MiniPosition };
      if (parsed.geometry) setGeometry(normalizeGeometry(parsed.geometry));
      if (parsed.miniPosition) setMiniPosition(parsed.miniPosition);
    } catch { /* ignore malformed local UI preferences */ }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(storageKey, JSON.stringify({ geometry, miniPosition })); } catch { /* ignore storage failures */ }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [storageKey, geometry, miniPosition]);

  useEffect(() => {
    if (!open || minimized) return;
    const timer = window.setTimeout(() => void loadConversations(), 0);
    return () => window.clearTimeout(timer);
  }, [open, minimized, loadConversations]);

  useEffect(() => {
    if (!open || minimized || !directoryOpen) return;
    const timer = window.setTimeout(() => void loadDirectory(directoryQuery), 120);
    return () => window.clearTimeout(timer);
  }, [open, minimized, directoryOpen, directoryQuery, loadDirectory]);

  useEffect(() => {
    if (!open || minimized || !selectedId) return;
    const timer = window.setTimeout(() => void loadMessages(selectedId), 0);
    return () => window.clearTimeout(timer);
  }, [open, minimized, selectedId, loadMessages]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (drag.mode === "panel") setGeometry((current) => ({ ...current, x: drag.originX + dx, y: drag.originY + dy }));
      else if (drag.mode === "resize") setGeometry((current) => ({ ...current, width: Math.max(PANEL_MIN_WIDTH, drag.originWidth + dx), height: Math.max(PANEL_MIN_HEIGHT, drag.originHeight + dy) }));
      else setMiniPosition({ x: drag.originX + dx, y: drag.originY + dy });
    };
    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.mode === "mini") {
        suppressMiniClickRef.current = drag.moved;
        const rect = { left: miniPosition.x, top: miniPosition.y, right: miniPosition.x + MINI_SIZE, bottom: miniPosition.y + MINI_SIZE };
        if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) { setOpen(false); setMinimized(false); setSelectedId(null); }
      }
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => { window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); window.removeEventListener("pointercancel", onPointerUp); };
  }, [miniPosition]);

  const openChat = () => { setOpen(true); setMinimized(false); setDirectoryOpen(true); setErrorMessage(null); };
  const closeChat = () => { setOpen(false); setMinimized(false); setSelectedFile(null); setDraft(""); triggerRef.current?.focus(); };
  const minimizeChat = () => setMinimized(true);
  const restoreChat = () => { setMinimized(false); setOpen(true); };

  const startPanelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { mode: "panel", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: geometry.x, originY: geometry.y, originWidth: geometry.width, originHeight: geometry.height, moved: false };
  };

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { mode: "resize", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: geometry.x, originY: geometry.y, originWidth: geometry.width, originHeight: geometry.height, moved: false };
  };

  const startMiniDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { mode: "mini", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: miniPosition.x, originY: miniPosition.y, originWidth: MINI_SIZE, originHeight: MINI_SIZE, moved: false };
    suppressMiniClickRef.current = false;
  };

  const startConversation = async (user: DirectoryUser) => {
    setErrorMessage(null);
    const conversationId = await createConversation({ subject: user.full_name || user.email, recipientUserId: user.id });
    if (!conversationId) { setErrorMessage(isArabic ? "تعذر إنشاء المحادثة. تحقق من صلاحية المراسلة." : "Unable to create the conversation. Check messaging permission."); return; }
    setSelectedId(conversationId);
    setDirectoryOpen(false);
    setDirectoryQuery("");
    await loadConversations();
  };

  const send = async () => {
    if (!selectedId || !draft.trim() || sending || uploading) return;
    setSending(true);
    setErrorMessage(null);
    const body = draft.trim();
    const messageId = await sendInternalMessage({ conversationId: selectedId, body });
    if (!messageId) { setSending(false); setErrorMessage(isArabic ? "تعذر إرسال الرسالة." : "Unable to send the message."); return; }
    setDraft("");
    if (selectedFile) {
      setUploading(true);
      const file = selectedFile;
      const upload = await createCommunicationAttachmentUpload({ messageId, fileName: file.name, mimeType: file.type, byteSize: file.size });
      if (upload) {
        const supabase = createClient();
        const { error } = await supabase.storage.from(upload.attachment.storage_bucket).uploadToSignedUrl(upload.path, upload.uploadToken, file);
        if (error) setErrorMessage(isArabic ? "تم إرسال الرسالة، لكن تعذر رفع الملف." : "Message sent, but the file upload failed.");
      }
      setUploading(false);
      setSelectedFile(null);
    }
    setSending(false);
    await loadMessages(selectedId);
    await loadConversations();
  };

  const selectFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setErrorMessage(isArabic ? "الحد الأقصى لحجم الملف 25 ميجابايت." : "Maximum file size is 25 MB."); return; }
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);

  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={openChat} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1" aria-label={isArabic ? "المحادثة" : "Chat"} title={isArabic ? "المحادثة" : "Chat"} data-testid="global-header-chat">
        <MessageCircle className="h-[19px] w-[19px]" aria-hidden="true" />
        {unread > 0 ? <span className="absolute -end-0.5 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-slate-50">{unread > 99 ? "99+" : unread}</span> : null}
      </button>

      {open && minimized ? <button type="button" onPointerDown={startMiniDrag} onClick={() => { if (!suppressMiniClickRef.current) restoreChat(); suppressMiniClickRef.current = false; }} style={{ left: miniPosition.x, top: miniPosition.y, width: MINI_SIZE, height: MINI_SIZE }} className="fixed z-[100] inline-flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-2xl ring-1 ring-black/5 touch-none" aria-label={isArabic ? "استعادة المحادثة" : "Restore chat"}>
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
        {unread > 0 ? <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-5 text-white">{unread > 99 ? "99+" : unread}</span> : null}
      </button> : null}

      {open && !minimized ? <section style={{ left: geometry.x, top: geometry.y, width: geometry.width, height: geometry.height }} className="fixed z-[100] flex max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-label={isArabic ? "المحادثة" : "Chat"}>
        <div onPointerDown={startPanelDrag} className="flex h-12 shrink-0 cursor-move items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 touch-none">
          <MessageCircle className="h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
          <strong className="min-w-0 flex-1 truncate text-sm text-slate-900">{selectedConversation?.subject || (isArabic ? "المحادثة" : "Chat")}</strong>
          <div className="ms-auto flex shrink-0 items-center gap-1">
            <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={minimizeChat} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900" aria-label={isArabic ? "تصغير" : "Minimize"}><Minus className="h-4 w-4" /></button>
            <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={closeChat} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900" aria-label={isArabic ? "إغلاق" : "Close"}><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className={cn("shrink-0 border-b border-slate-200 md:h-full md:w-56 md:border-b-0 md:border-e", directoryOpen ? "flex max-h-44 flex-col md:max-h-none" : "hidden md:flex md:flex-col")}>
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 p-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder={isArabic ? "ابحث عن مستخدم" : "Search users"} className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-slate-400" aria-label={isArabic ? "البحث عن مستخدم" : "Search users"} />
              <button type="button" onClick={() => setDirectoryOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 md:hidden" aria-label={isArabic ? "إغلاق المستخدمين" : "Close users"}><X className="h-4 w-4" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
              {directoryLoading ? <p className="p-3 text-xs text-slate-500">{isArabic ? "جارٍ البحث..." : "Searching..."}</p> : directoryUsers.map((user) => <button key={user.id} type="button" onClick={() => void startConversation(user)} className="flex w-full min-w-0 items-start gap-2 rounded-xl px-2.5 py-2 text-start hover:bg-slate-50"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{(user.full_name || user.email).slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{user.full_name || user.email}</span><span className="block truncate text-[11px] text-slate-500">{user.role || user.email}</span></span></button>)}
              {!directoryLoading && directoryUsers.length === 0 ? <p className="p-3 text-xs text-slate-500">{isArabic ? "لا يوجد مستخدمون مطابقون." : "No matching users."}</p> : null}
              {conversations.length > 0 ? <div className="mt-2 border-t border-slate-100 pt-2"><div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{isArabic ? "المحادثات" : "Conversations"}</div>{conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => { setSelectedId(conversation.id); setDirectoryOpen(false); }} className={cn("flex w-full min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-start", selectedId === conversation.id ? "bg-slate-100" : "hover:bg-slate-50")}><MessageCircle className="h-4 w-4 shrink-0 text-slate-400" /><span className="min-w-0 truncate text-xs font-medium text-slate-800">{conversation.subject || (conversation.kind === "follow_up" ? (isArabic ? "متابعة آلية" : "Automated follow-up") : isArabic ? "محادثة" : "Conversation")}</span></button>)}</div> : null}
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-slate-100 px-2.5 md:hidden">
              {!directoryOpen ? <button type="button" onClick={() => setDirectoryOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-600 hover:bg-slate-100"><Plus className="h-4 w-4" />{isArabic ? "مستخدم / محادثة" : "User / conversation"}</button> : null}
              {selectedConversation ? <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{selectedConversation.subject}</span> : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {!selectedId ? <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-slate-500">{isArabic ? "اختر مستخدماً لبدء محادثة." : "Choose a user to start a conversation."}</div> : messages.length === 0 ? <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-slate-500">{isArabic ? "لا توجد رسائل بعد." : "No messages yet."}</div> : <div className="space-y-2">{messages.map((message) => <div key={message.id} className={cn("max-w-[88%] rounded-2xl px-3 py-2", message.sender_clinic_user_id === currentUserId ? "ms-auto bg-slate-100" : "me-auto bg-blue-50")}><p className="whitespace-pre-wrap break-words text-sm text-slate-800">{message.body}</p>{attachments[message.id]?.length ? <div className="mt-2 space-y-1">{attachments[message.id].map((attachment) => <div key={attachment.id} className="flex items-center gap-2 rounded-lg bg-white/70 px-2 py-1.5 text-xs text-slate-600"><FileText className="h-3.5 w-3.5" />{attachment.file_name}</div>)}</div> : null}<time className="mt-1 block text-[10px] text-slate-400">{new Intl.DateTimeFormat(isArabic ? "ar" : "en", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.created_at))}</time></div>)}</div>}
            </div>

            {errorMessage ? <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">{errorMessage}</p> : null}
            <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="shrink-0 border-t border-slate-200 bg-white p-2.5">
              {selectedFile ? <div className="mb-2 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5 shrink-0" /><span className="min-w-0 flex-1 truncate">{selectedFile.name}</span><button type="button" onClick={() => setSelectedFile(null)} className="shrink-0 text-slate-400 hover:text-slate-700" aria-label={isArabic ? "إزالة الملف" : "Remove file"}><X className="h-4 w-4" /></button></div> : null}
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={selectedId ? (isArabic ? "اكتب رسالتك..." : "Write a message...") : (isArabic ? "اختر محادثة أولاً" : "Choose a conversation first")} disabled={!selectedId || sending || uploading} rows={2} className="block min-h-14 max-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60" />
              <div className="mt-2 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><input ref={fileInputRef} type="file" className="hidden" onChange={(event) => { selectFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} accept="image/*,application/pdf,text/plain,.doc,.docx,.xls,.xlsx" /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={!selectedId || sending || uploading} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40" aria-label={isArabic ? "رفع ملف" : "Attach file"}><Paperclip className="h-4 w-4" /></button><span className="truncate text-[11px] text-slate-400">{uploading ? (isArabic ? "جارٍ رفع الملف..." : "Uploading...") : isArabic ? "حد الملف 25 ميجابايت" : "25 MB max"}</span></div><button type="submit" disabled={!selectedId || !draft.trim() || sending || uploading} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}{isArabic ? "إرسال" : "Send"}</button></div>
            </form>
          </div>
        </div>
        <div onPointerDown={startResize} className="absolute bottom-1 end-1 z-10 flex h-5 w-5 cursor-se-resize items-center justify-center rounded-md text-slate-300 hover:text-slate-600 rtl:cursor-sw-resize touch-none" aria-hidden="true"><Grip className="h-3.5 w-3.5" /></div>
      </section> : null}
    </div>
  );
}
