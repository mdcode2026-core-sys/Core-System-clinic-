"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Grip, Mail, Minus, Paperclip, Send, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { createCommunicationAttachmentUpload, markConversationRead, sendInternalMessage } from "@/domain/communications/communications.actions";

interface Conversation { id: string; subject: string | null; kind: string; updated_at: string; }
interface ChatAttachment { id: string; file_name: string; mime_type: string; byte_size: number; }
interface ChatMessage { id: string; body: string; sender_clinic_user_id: string | null; created_at: string; message_kind: string; }
interface PanelGeometry { x: number; y: number; width: number; height: number; }
interface DragState { mode: "panel" | "resize" | "mini"; pointerId: number; startX: number; startY: number; originX: number; originY: number; originWidth: number; originHeight: number; moved: boolean; }

const PANEL_MIN_WIDTH = 320;
const PANEL_MIN_HEIGHT = 320;
const PANEL_GAP = 12;
const PANEL_TOP_GAP = 68;

function getInitialPanelGeometry() {
  if (typeof window === "undefined") return { x: PANEL_GAP, y: PANEL_TOP_GAP, width: 520, height: 560 };
  const width = Math.min(520, Math.max(300, window.innerWidth - PANEL_GAP * 2));
  const height = Math.min(560, Math.max(320, window.innerHeight - PANEL_TOP_GAP - PANEL_GAP));
  return { x: Math.max(PANEL_GAP, window.innerWidth - width - PANEL_GAP), y: Math.max(PANEL_TOP_GAP, window.innerHeight - height - PANEL_GAP), width, height };
}

function getInitialMiniPosition() {
  if (typeof window === "undefined") return { x: 24, y: 80 };
  return { x: Math.max(12, window.innerWidth - 72), y: Math.max(72, window.innerHeight - 92) };
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
  const [miniPosition, setMiniPosition] = useState(() => getInitialMiniPosition());
  const [dragging, setDragging] = useState(false);
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
        setGeometry((current) => ({
          ...current,
          width: Math.max(PANEL_MIN_WIDTH, drag.originWidth + dx),
          height: Math.max(PANEL_MIN_HEIGHT, drag.originHeight + dy),
        }));
      } else {
        setMiniPosition({ x: drag.originX + dx, y: drag.originY + dy });
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (drag.mode === "mini") {
        suppressMiniClickRef.current = drag.moved;
        const rect = { left: miniPosition.x, top: miniPosition.y, right: miniPosition.x + 58, bottom: miniPosition.y + 58 };
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
    setGeometry((current) => {
      const next = getInitialPanelGeometry();
      return current.width === next.width && current.height === next.height ? current : next;
    });
    setOpen(true);
    setMinimized(false);
  };

  const startPanelDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { mode: "panel", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: geometry.x, originY: geometry.y, originWidth: geometry.width, originHeight: geometry.height, moved: false };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.button !== 0) return;
    dragRef.current = { mode: "resize", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: geometry.x, originY: geometry.y, originWidth: geometry.width, originHeight: geometry.height, moved: false };
    setDragging(true);
  };

  const startMiniDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { mode: "mini", pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: miniPosition.x, originY: miniPosition.y, originWidth: 58, originHeight: 58, moved: false };
    suppressMiniClickRef.current = false;
    setDragging(true);
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
      <button ref={triggerRef} type="button" onClick={openChat} className="relative inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 md:px-3" aria-label={isArabic ? "المحادثات" : "Communications"} title={isArabic ? "المحادثات" : "Communications"} aria-expanded={open && !minimized} data-testid="global-header-chat">
        <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
        <span className="hidden xl:inline">{isArabic ? "المحادثات" : "Communications"}</span>
        {unread > 0 && <span className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-slate-50" aria-label={isArabic ? `${unread} غير مقروءة` : `${unread} unread`}>{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && !minimized ? (
        <section role="dialog" aria-label={isArabic ? "المحادثات" : "Chat"} className="fixed z-[60] flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" style={{ left: geometry.x, top: geometry.y, width: Math.min(geometry.width, Math.max(PANEL_MIN_WIDTH, typeof window !== "undefined" ? window.innerWidth - PANEL_GAP * 2 : geometry.width)), height: Math.min(geometry.height, Math.max(PANEL_MIN_HEIGHT, typeof window !== "undefined" ? window.innerHeight - PANEL_TOP_GAP : geometry.height)) }} data-testid="global-chat-panel">
          <div className="flex w-36 shrink-0 flex-col border-e border-slate-200 bg-slate-50 md:w-44">
            <div className={cn("flex items-center gap-2 border-b border-slate-200 px-3 py-3.5", dragging && "cursor-grabbing", "cursor-grab")} onPointerDown={startPanelDrag}>
              <Grip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <strong className="min-w-0 flex-1 truncate text-sm text-slate-900">{isArabic ? "المحادثات" : "Chat"}</strong>
              <div className="flex shrink-0 items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
                <button type="button" onClick={() => { setMinimized(true); setMiniPosition(getInitialMiniPosition()); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "تصغير" : "Minimize"} title={isArabic ? "تصغير" : "Minimize"}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={closeChat} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "إغلاق" : "Close"} title={isArabic ? "إغلاق" : "Close"}><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">{loading ? <p className="p-3 text-xs text-slate-500">{isArabic ? "جارٍ التحميل..." : "Loading..."}</p> : conversations.length ? conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={cn("w-full rounded-lg px-2.5 py-2.5 text-start text-xs transition-colors", selectedId === conversation.id ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/80")}>{conversation.subject || (conversation.kind === "patient" ? (isArabic ? "محادثة مريض" : "Patient conversation") : (isArabic ? "محادثة داخلية" : "Internal conversation"))}</button>) : <p className="p-3 text-xs text-slate-500">{isArabic ? "لا توجد محادثات" : "No conversations"}</p>}</div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 items-center gap-2 border-b border-slate-100 px-3 py-3.5">
              <strong className="min-w-0 flex-1 truncate text-sm text-slate-900">{conversations.find((item) => item.id === selectedId)?.subject || (isArabic ? "محادثة" : "Conversation")}</strong>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto bg-white p-3" aria-live="polite">{selectedId && messages.length ? messages.map((message) => <div key={message.id} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", message.sender_clinic_user_id === currentUserId ? "ms-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-800")}><p className="whitespace-pre-wrap break-words">{message.body}</p>{attachments[message.id]?.length ? <div className="mt-2 space-y-1 border-t border-white/20 pt-2">{attachments[message.id].map((attachment) => <div key={attachment.id} className="flex items-center gap-2 text-xs"><Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="min-w-0 truncate">{attachment.file_name}</span></div>)}</div> : null}</div>) : <p className="py-8 text-center text-sm text-slate-500">{isArabic ? "اختر محادثة لبدء العمل" : "Select a conversation to start"}</p>}</div>
            {selectedId ? <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="border-t border-slate-100 p-3">
              {selectedFile ? <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{selectedFile.name}</span><button type="button" onClick={() => setSelectedFile(null)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label={isArabic ? "إزالة المرفق" : "Remove attachment"}><X className="h-3.5 w-3.5" /></button></div> : null}
              <div className="flex items-end gap-2">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation" className="sr-only" onChange={(event) => { selectFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} aria-label={isArabic ? "إرفاق ملف" : "Attach file"} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "إرفاق ملف" : "Attach file"} title={isArabic ? "إرفاق ملف" : "Attach file"}><Paperclip className="h-4 w-4" aria-hidden="true" /></button>
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} className="min-h-10 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" placeholder={isArabic ? "اكتب رسالة..." : "Write a message..."} aria-label={isArabic ? "نص الرسالة" : "Message"} />
                <button type="submit" disabled={!draft.trim() || uploading} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-40" aria-label={uploading ? (isArabic ? "جارٍ الرفع" : "Uploading") : (isArabic ? "إرسال" : "Send")} title={isArabic ? "إرسال" : "Send"}><Send className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </form> : null}
          </div>
          <div className="absolute bottom-1 end-1 h-4 w-4 cursor-se-resize touch-none rounded-br-lg" onPointerDown={startResize} aria-label={isArabic ? "تغيير حجم نافذة المحادثة" : "Resize chat window"} />
        </section>
      ) : null}

      {open && minimized ? <button type="button" onPointerDown={startMiniDrag} onClick={(event) => { if (suppressMiniClickRef.current) { event.preventDefault(); suppressMiniClickRef.current = false; return; } setMinimized(false); }} className={cn("fixed z-[60] inline-flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl transition-shadow hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", dragging && "cursor-grabbing", "cursor-grab")} style={{ left: miniPosition.x, top: miniPosition.y }} aria-label={isArabic ? "فتح المحادثات" : "Open Chat"} title={isArabic ? "فتح المحادثات" : "Open Chat"}><Mail className="h-7 w-7" aria-hidden="true" />{unread > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-white">{unread > 99 ? "99+" : unread}</span> : null}</button> : null}
    </div>
  );
}
