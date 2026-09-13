"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Grip, Loader2, MessageCircle, Minus, Paperclip, Plus, Search, Send, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { createCommunicationAttachmentUpload, createConversation, markConversationRead, sendInternalMessage } from "@/domain/communications/communications.actions";
import { searchCommunicationUsers } from "@/domain/communications/communications.header.actions";

interface Conversation { id: string; subject: string | null; kind: string; updated_at: string; }
interface ChatAttachment { id: string; file_name: string; mime_type: string; byte_size: number; }
interface ChatMessage { id: string; body: string; sender_clinic_user_id: string | null; created_at: string; message_kind: string; }
interface DirectoryUser { id: string; full_name: string; email: string; role: string; }
interface PanelGeometry { x: number; y: number; width: number; height: number; }
interface MiniPosition { x: number; y: number; }
interface DragState { mode: "panel" | "resize" | "mini"; pointerId: number; startX: number; startY: number; originX: number; originY: number; originWidth: number; originHeight: number; moved: boolean; }

const PANEL_MIN_WIDTH = 300;
const PANEL_MIN_HEIGHT = 300;
const PANEL_GAP = 12;
const PANEL_TOP_GAP = 68;
const MINI_SIZE = 58;

function getInitialPanelGeometry(): PanelGeometry {
  if (typeof window === "undefined") return { x: PANEL_GAP, y: PANEL_TOP_GAP, width: 520, height: 560 };
  const mobile = window.innerWidth < 768;
  const width = mobile ? Math.max(PANEL_MIN_WIDTH, window.innerWidth - PANEL_GAP * 2) : Math.min(520, window.innerWidth - PANEL_GAP * 2);
  const height = mobile ? Math.max(PANEL_MIN_HEIGHT, window.innerHeight - PANEL_TOP_GAP - PANEL_GAP) : Math.min(560, window.innerHeight - PANEL_TOP_GAP - PANEL_GAP);
  const x = mobile ? PANEL_GAP : Math.max(PANEL_GAP, window.innerWidth - width - PANEL_GAP);
  const y = mobile ? PANEL_TOP_GAP : Math.max(PANEL_TOP_GAP, Math.round((window.innerHeight - height) / 2));
  return { x, y, width, height };
}

function getInitialMiniPosition(): MiniPosition {
  if (typeof window === "undefined") return { x: 24, y: 80 };
  return { x: Math.max(12, window.innerWidth - MINI_SIZE - 18), y: Math.max(72, window.innerHeight - MINI_SIZE - 24) };
}

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<Record<string, ChatAttachment[]>>({});
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [geometry, setGeometry] = useState<PanelGeometry>(() => getInitialPanelGeometry());
  const [miniPosition, setMiniPosition] = useState<MiniPosition>(() => getInitialMiniPosition());
  const [dragging, setDragging] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(true);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressMiniClickRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!ids.length) { setConversations([]); setSelectedId(null); setLoading(false); return; }
    const { data } = await supabase.from("communication_conversations").select("id,subject,kind,updated_at").eq("tenant_id", clinicUser.tenant_id).in("id", ids).neq("status", "archived").order("updated_at", { ascending: false }).limit(30);
    setConversations((data ?? []) as Conversation[]);
    if (!selectedId && data?.[0]?.id) setSelectedId(data[0].id);
    setLoading(false);
  }, [selectedId]);

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
        const item = attachment as ChatAttachment & { message_id: string };
        grouped[item.message_id] = [...(grouped[item.message_id] ?? []), item];
      }
      setAttachments(grouped);
    } else {
      setAttachments({});
    }
    await markConversationRead(conversationId);
    void loadUnread();
  }, [loadUnread]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUnread(); }, 0);
    const refresh = () => void loadUnread();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const interval = window.setInterval(refresh, 15000);
    return () => { window.clearTimeout(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.clearInterval(interval); };
  }, [loadUnread]);

  useEffect(() => {
    if (!open || minimized) return;
    const timer = window.setTimeout(() => { void loadConversations(); }, 0);
    return () => window.clearTimeout(timer);
  }, [open, minimized, loadConversations]);

  useEffect(() => {
    if (!open || minimized) return;
    const timer = window.setTimeout(() => { void loadDirectory(directoryQuery); }, 120);
    return () => window.clearTimeout(timer);
  }, [open, minimized, directoryQuery, loadDirectory]);

  useEffect(() => {
    if (!open || minimized || !selectedId) return;
    const timer = window.setTimeout(() => { void loadMessages(selectedId); }, 0);
    return () => window.clearTimeout(timer);
  }, [open, minimized, selectedId, loadMessages]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (drag.mode === "panel") {
        setGeometry((current) => ({ ...current, x: drag.originX + dx, y: drag.originY + dy }));
      } else if (drag.mode === "resize") {
        setGeometry((current) => ({ ...current, width: Math.max(PANEL_MIN_WIDTH, drag.originWidth + dx), height: Math.max(PANEL_MIN_HEIGHT, drag.originHeight + dy) }));
      } else {
        setMiniPosition({ x: drag.originX + dx, y: drag.originY + dy });
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.mode === "mini") {
        suppressMiniClickRef.current = drag.moved;
        const rect = { left: miniPosition.x, top: miniPosition.y, right: miniPosition.x + MINI_SIZE, bottom: miniPosition.y + MINI_SIZE };
        if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
          setOpen(false);
          setMinimized(false);
          setSelectedId(null);
        }
      }
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => { window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); window.removeEventListener("pointercancel", onPointerUp); };
  }, [miniPosition]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      setMinimized(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeChat = () => { setOpen(false); setMinimized(false); setSelectedId(null); setSelectedFile(null); triggerRef.current?.focus(); };

  const openChat = () => {
    setGeometry(getInitialPanelGeometry());
    setOpen(true);
    setMinimized(false);
    setDirectoryOpen(true);
  };

  const startPanelDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { mode: "panel", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: geometry.x, originY: geometry.y, originWidth: geometry.width, originHeight: geometry.height, moved: false };
    setDragging(true);
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { mode: "resize", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: geometry.x, originY: geometry.y, originWidth: geometry.width, originHeight: geometry.height, moved: false };
    setDragging(true);
  };

  const startMiniDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { mode: "mini", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: miniPosition.x, originY: miniPosition.y, originWidth: MINI_SIZE, originHeight: MINI_SIZE, moved: false };
    suppressMiniClickRef.current = false;
    setDragging(true);
  };

  const startConversation = async (user: DirectoryUser) => {
    const conversationId = await createConversation({ subject: user.full_name || user.email, recipientUserId: user.id });
    if (!conversationId) return;
    setDirectoryOpen(false);
    setDirectoryQuery("");
    await loadConversations();
    setSelectedId(conversationId);
  };

  const send = async () => {
    if (!selectedId || !draft.trim() || uploading) return;
    const body = draft.trim();
    setDraft("");
    const messageId = await sendInternalMessage({ conversationId: selectedId, body });
    if (messageId && selectedFile) {
      setUploading(true);
      const file = selectedFile;
      const upload = await createCommunicationAttachmentUpload({ messageId, fileName: file.name, mimeType: file.type, byteSize: file.size });
      if (upload) {
        const supabase = createClient();
        const { error } = await supabase.storage.from(upload.attachment.storage_bucket).uploadToSignedUrl(upload.path, upload.uploadToken, file);
        if (error) setSelectedFile(null);
      }
      setUploading(false);
      setSelectedFile(null);
    }
    await loadMessages(selectedId);
    await loadConversations();
  };

  const selectFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return;
    setSelectedFile(file);
  };

  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={openChat} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1" aria-label={isArabic ? "المحادثة" : "Chat"} title={isArabic ? "المحادثة" : "Chat"} aria-expanded={open && !minimized} data-testid="global-header-chat">
        <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        {unread > 0 && <span className="absolute -end-0.5 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-slate-50">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && !minimized ? (
        <section role="dialog" aria-label={isArabic ? "المحادثة" : "Chat"} className="fixed z-[60] flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" style={{ left: geometry.x, top: geometry.y, width: Math.min(geometry.width, Math.max(PANEL_MIN_WIDTH, typeof window !== "undefined" ? window.innerWidth - PANEL_GAP * 2 : geometry.width)), height: Math.min(geometry.height, Math.max(PANEL_MIN_HEIGHT, typeof window !== "undefined" ? window.innerHeight - PANEL_TOP_GAP : geometry.height)) }} data-testid="global-chat-panel">
          <div className="flex w-40 shrink-0 flex-col border-e border-slate-200 bg-slate-50 sm:w-48">
            <div className={cn("flex items-center gap-2 border-b border-slate-200 px-3 py-3.5 touch-none", dragging && "cursor-grabbing", "cursor-grab")} onPointerDown={startPanelDrag}>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Grip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <strong className="min-w-0 truncate text-sm text-slate-900">{isArabic ? "المحادثة" : "Chat"}</strong>
              </div>
              <div className="ms-auto flex shrink-0 items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
                <button type="button" onClick={() => { setMinimized(true); setMiniPosition(getInitialMiniPosition()); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "تصغير" : "Minimize"} title={isArabic ? "تصغير" : "Minimize"}><Minus className="h-4 w-4" /></button>
                <button type="button" onClick={closeChat} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "إغلاق" : "Close"} title={isArabic ? "إغلاق" : "Close"}><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="border-b border-slate-200 p-2">
              <button type="button" onClick={() => setDirectoryOpen((value) => !value)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-start text-xs font-semibold text-slate-700 hover:bg-white" aria-expanded={directoryOpen}>
                <span>{isArabic ? "مستخدمو العيادة" : "Clinic users"}</span>
                <Plus className={cn("h-4 w-4 transition-transform", directoryOpen && "rotate-45")} aria-hidden="true" />
              </button>
              {directoryOpen ? (
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2">
                    <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} className="h-8 min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder={isArabic ? "ابحث عن مستخدم..." : "Search users..."} aria-label={isArabic ? "البحث عن مستخدم" : "Search clinic users"} />
                  </div>
                  <div className="max-h-32 overflow-y-auto rounded-lg bg-white">
                    {directoryLoading ? <div className="flex items-center justify-center p-3"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div> : directoryUsers.length ? directoryUsers.map((user) => <button key={user.id} type="button" onClick={() => void startConversation(user)} className="w-full px-2.5 py-2 text-start hover:bg-slate-50"><span className="block truncate text-xs font-medium text-slate-900">{user.full_name || user.email}</span><span className="block truncate text-[10px] text-slate-400">{user.email}</span></button>) : <p className="p-3 text-center text-[11px] text-slate-400">{isArabic ? "لا يوجد مستخدمون" : "No users found"}</p>}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto p-1.5">
              {loading ? <p className="p-3 text-xs text-slate-500">{isArabic ? "جارٍ التحميل..." : "Loading..."}</p> : conversations.length ? conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => { setSelectedId(conversation.id); setDirectoryOpen(false); }} className={cn("w-full rounded-lg px-2.5 py-2.5 text-start text-xs transition-colors", selectedId === conversation.id ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/80")}>{conversation.subject || (conversation.kind === "patient" ? (isArabic ? "محادثة مريض" : "Patient conversation") : (isArabic ? "محادثة داخلية" : "Internal conversation"))}</button>) : <p className="p-3 text-xs text-slate-500">{isArabic ? "لا توجد محادثات" : "No conversations"}</p>}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 items-center gap-2 border-b border-slate-100 px-3 py-3.5"><strong className="min-w-0 flex-1 truncate text-sm text-slate-900">{conversations.find((item) => item.id === selectedId)?.subject || (isArabic ? "محادثة" : "Conversation")}</strong></div>
            <div className="flex-1 space-y-2 overflow-y-auto bg-white p-3" aria-live="polite">{selectedId && messages.length ? messages.map((message) => <div key={message.id} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", message.sender_clinic_user_id === currentUserId ? "ms-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-800")}><p className="whitespace-pre-wrap break-words">{message.body}</p>{attachments[message.id]?.length ? <div className="mt-2 space-y-1 border-t border-white/20 pt-2">{attachments[message.id].map((attachment) => <div key={attachment.id} className="flex items-center gap-2 text-xs"><Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="min-w-0 truncate">{attachment.file_name}</span></div>)}</div> : null}</div>) : <p className="py-8 text-center text-sm text-slate-500">{selectedId ? (isArabic ? "لا توجد رسائل بعد" : "No messages yet") : (isArabic ? "اختر محادثة أو ابدأ محادثة جديدة" : "Select a conversation or start a new chat")}</p>}</div>
            {selectedId ? <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="border-t border-slate-100 p-3">
              {selectedFile ? <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{selectedFile.name}</span><button type="button" onClick={() => setSelectedFile(null)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label={isArabic ? "إزالة المرفق" : "Remove attachment"}><X className="h-3.5 w-3.5" /></button></div> : null}
              <div className="flex items-end gap-2">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation" className="sr-only" onChange={(event) => { selectFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} aria-label={isArabic ? "إرفاق ملف" : "Attach file"} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "إرفاق ملف" : "Attach file"} title={isArabic ? "إرفاق ملف" : "Attach file"}><Paperclip className="h-4 w-4" /></button>
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} className="min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" placeholder={isArabic ? "اكتب رسالة..." : "Write a message..."} aria-label={isArabic ? "نص الرسالة" : "Message"} />
                <button type="submit" disabled={!draft.trim() || uploading} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-40" aria-label={uploading ? (isArabic ? "جارٍ الرفع" : "Uploading") : (isArabic ? "إرسال" : "Send")} title={isArabic ? "إرسال" : "Send"}><Send className="h-4 w-4" /></button>
              </div>
            </form> : null}
          </div>
          <div className="absolute bottom-0 end-0 h-7 w-7 cursor-se-resize touch-none" onPointerDown={startResize} aria-label={isArabic ? "تغيير حجم نافذة المحادثة" : "Resize chat window"}><span className="pointer-events-none absolute bottom-1 end-1 h-3 w-3 border-b-2 border-e-2 border-slate-400" /></div>
        </section>
      ) : null}

      {open && minimized ? <button type="button" onPointerDown={startMiniDrag} onClick={(event) => { if (suppressMiniClickRef.current) { event.preventDefault(); suppressMiniClickRef.current = false; return; } setMinimized(false); }} className={cn("fixed z-[60] inline-flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl transition-shadow hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", dragging && "cursor-grabbing", "cursor-grab")} style={{ left: miniPosition.x, top: miniPosition.y }} aria-label={isArabic ? "فتح المحادثة" : "Open Chat"} title={isArabic ? "فتح المحادثة" : "Open Chat"}><MessageCircle className="h-7 w-7" aria-hidden="true" />{unread > 0 ? <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-white">{unread > 99 ? "99+" : unread}</span> : null}</button> : null}
    </div>
  );
}
