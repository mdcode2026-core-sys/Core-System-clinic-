"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, Loader2, MessageCircle, Minus, Paperclip, Search, Send, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { createCommunicationAttachmentUpload, createConversation, sendInternalMessage } from "@/domain/communications/communications.actions";
import { getInternalChatDirectory, getInternalChatMessages, markInternalChatRead, type InternalChatContact, type InternalChatMessage } from "@/domain/communications/chat.actions";

interface PanelGeometry { x: number; y: number; width: number; height: number }
type ViewportMode = "mobile" | "tablet" | "desktop";

const MIN_W = 300;
const MIN_H = 360;
const GAP = 12;
const TOP = 68;
const STORAGE = "core-system-global-chat-layout-v5";

const getViewportMode = (): ViewportMode => {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
};

const defaults = (): PanelGeometry => {
  if (typeof window === "undefined") return { x: GAP, y: TOP, width: 520, height: 560 };
  const mode = getViewportMode();
  if (mode === "mobile") return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  if (mode === "tablet") {
    const width = Math.min(720, window.innerWidth - GAP * 2);
    const height = Math.min(620, window.innerHeight - GAP * 2);
    return { x: GAP, y: Math.max(TOP, window.innerHeight - height - GAP), width, height };
  }
  const width = Math.min(520, window.innerWidth - GAP * 2);
  const height = Math.min(560, window.innerHeight - TOP - GAP);
  return { x: GAP, y: Math.max(TOP, Math.round((window.innerHeight - height) / 2)), width, height };
};

const normalize = (value: PanelGeometry): PanelGeometry => {
  if (typeof window === "undefined") return value;
  const mode = getViewportMode();
  if (mode === "mobile") return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
  const maxWidth = Math.max(MIN_W, window.innerWidth - GAP * 2);
  const maxHeight = Math.max(MIN_H, window.innerHeight - TOP - GAP);
  const width = Math.min(Math.max(MIN_W, value.width), maxWidth);
  const height = Math.min(Math.max(MIN_H, value.height), maxHeight);
  return {
    x: Math.min(Math.max(GAP, value.x), Math.max(GAP, window.innerWidth - width - GAP)),
    y: Math.min(Math.max(TOP, value.y), Math.max(TOP, window.innerHeight - height - GAP)),
    width,
    height,
  };
};

const nameOf = (contact: InternalChatContact) => contact.fullName || contact.email || "User";
const initialsOf = (contact: InternalChatContact) => nameOf(contact).trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "U";

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mobileDirectoryOpen, setMobileDirectoryOpen] = useState(true);
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [contacts, setContacts] = useState<InternalChatContact[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<InternalChatContact | null>(null);
  const [messages, setMessages] = useState<InternalChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [directoryError, setDirectoryError] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [geometry, setGeometry] = useState<PanelGeometry>(defaults);

  const fileInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ pointerId: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resize = useRef<{ pointerId: number; sx: number; sy: number; ow: number; oh: number } | null>(null);

  const loadIdentity = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("clinic_users").select("id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (data?.id) setCurrentUserId(data.id);
  }, []);

  const loadContacts = useCallback(async (value = query) => {
    setLoadingContacts(true);
    setDirectoryError(false);
    try {
      setContacts(await getInternalChatDirectory(value));
    } catch (error) {
      console.error("Internal chat directory load failed", error);
      setContacts([]);
      setDirectoryError(true);
    } finally {
      setLoadingContacts(false);
    }
  }, [query]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      setMessages(await getInternalChatMessages(conversationId));
      void markInternalChatRead(conversationId);
    } catch (error) {
      console.error("Internal chat message load failed", error);
      setMessageError(isArabic ? "تعذر تحميل الرسائل." : "Unable to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, [isArabic]);

  const openChat = () => {
    setOpen(true);
    setMinimized(false);
    setMessageError(null);
  };

  const closeChat = useCallback(() => {
    setOpen(false);
    setMinimized(false);
    setMobileDirectoryOpen(true);
    setSelected(null);
    setMessages([]);
    setDraft("");
    setSelectedFile(null);
    setMessageError(null);
    trigger.current?.focus();
  }, []);

  useEffect(() => { void loadIdentity(); }, [loadIdentity]);

  useEffect(() => {
    const onViewportChange = () => {
      setViewportMode(getViewportMode());
      setGeometry(value => normalize(value));
    };
    onViewportChange();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!open || minimized || (viewportMode === "mobile" && !mobileDirectoryOpen)) return;
    const timer = window.setTimeout(() => void loadContacts(query), 120);
    return () => window.clearTimeout(timer);
  }, [open, minimized, mobileDirectoryOpen, viewportMode, query, loadContacts]);

  useEffect(() => {
    if (!selected?.conversationId) {
      setMessages([]);
      return;
    }
    void loadMessages(selected.conversationId);
  }, [selected?.conversationId, loadMessages]);

  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    const channel = supabase.channel(`global-chat:${currentUserId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "communication_messages", filter: "message_kind=eq.message" }, payload => {
      const row = payload.new as { id?: string; conversation_id?: string; body?: string; sender_clinic_user_id?: string | null; created_at?: string; message_kind?: string };
      if (!row.id || !row.conversation_id || row.message_kind !== "message") return;
      if (selected?.conversationId === row.conversation_id) {
        setMessages(existing => existing.some(message => message.id === row.id) ? existing : [...existing, { id: row.id!, body: row.body ?? "", senderClinicUserId: row.sender_clinic_user_id ?? null, createdAt: row.created_at ?? new Date().toISOString(), messageKind: "message" }]);
        void markInternalChatRead(row.conversation_id);
      }
      void loadContacts(query);
    }).subscribe(status => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.error("Global chat realtime unavailable", status);
    });
    return () => { void supabase.removeChannel(channel); };
  }, [currentUserId, loadContacts, query, selected?.conversationId]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentUserId || viewportMode === "mobile") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(`${STORAGE}:${currentUserId}`) || "{}");
      if (saved.geometry) setGeometry(normalize(saved.geometry));
    } catch {}
  }, [currentUserId, viewportMode]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentUserId || viewportMode === "mobile") return;
    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(`${STORAGE}:${currentUserId}`, JSON.stringify({ geometry })); } catch {}
    }, 150);
    return () => window.clearTimeout(timer);
  }, [currentUserId, geometry, viewportMode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeChat();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeChat]);

  const chooseContact = async (contact: InternalChatContact) => {
    setMessageError(null);
    setDraft("");
    setSelectedFile(null);
    setSelected(contact);
    if (viewportMode === "mobile") setMobileDirectoryOpen(false);
    if (contact.conversationId) return;
    try {
      const conversationId = await createConversation({ subject: nameOf(contact), recipientUserId: contact.userId });
      if (!conversationId) throw new Error("CONVERSATION_CREATE_FAILED");
      setSelected({ ...contact, conversationId });
      await loadContacts(query);
      await loadMessages(conversationId);
    } catch (error) {
      console.error("Internal chat conversation start failed", error);
      setMessageError(isArabic ? "تعذر فتح المحادثة. حاول مرة أخرى." : "Unable to open the conversation. Please try again.");
    }
  };

  const send = async () => {
    const body = draft.trim();
    const conversationId = selected?.conversationId;
    if (!body || !conversationId || sending || uploading) return;
    setSending(true);
    setMessageError(null);
    const optimisticId = `optimistic-${Date.now()}`;
    setMessages(existing => [...existing, { id: optimisticId, body, senderClinicUserId: currentUserId, createdAt: new Date().toISOString(), messageKind: "message" }]);
    setDraft("");
    try {
      const messageId = await sendInternalMessage({ conversationId, body });
      if (!messageId) throw new Error("MESSAGE_SEND_FAILED");
      setMessages(existing => existing.map(message => message.id === optimisticId ? { ...message, id: messageId } : message));
      setSending(false);
      if (selectedFile) {
        setUploading(true);
        const file = selectedFile;
        const upload = await createCommunicationAttachmentUpload({ messageId, fileName: file.name, mimeType: file.type, byteSize: file.size });
        if (upload) {
          const supabase = createClient();
          const { error } = await supabase.storage.from(upload.attachment.storage_bucket).uploadToSignedUrl(upload.path, upload.uploadToken, file);
          if (error) setMessageError(isArabic ? "تم إرسال الرسالة، لكن تعذر رفع الملف." : "Message sent, but the file upload failed.");
        }
        setUploading(false);
        setSelectedFile(null);
      }
      void loadContacts(query);
      void loadMessages(conversationId);
    } catch (error) {
      console.error("Internal chat send failed", error);
      setMessages(existing => existing.filter(message => message.id !== optimisticId));
      setDraft(body);
      setMessageError(isArabic ? "تعذر إرسال الرسالة. حاول مرة أخرى." : "Unable to send the message. Please try again.");
      setSending(false);
    }
  };

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (viewportMode !== "desktop" || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, sx: event.clientX, sy: event.clientY, ox: geometry.x, oy: geometry.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (viewportMode !== "desktop" || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    resize.current = { pointerId: event.pointerId, sx: event.clientX, sy: event.clientY, ow: geometry.width, oh: geometry.height };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const resizeState = resize.current;
      if (resizeState && resizeState.pointerId === event.pointerId) {
        const horizontalDelta = isArabic ? -1 : 1;
        setGeometry(value => normalize({ ...value, width: resizeState.ow + horizontalDelta * (event.clientX - resizeState.sx), height: resizeState.oh + event.clientY - resizeState.sy }));
        return;
      }
      const dragState = drag.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const horizontalDelta = isArabic ? -1 : 1;
      setGeometry(value => normalize({ ...value, x: dragState.ox + horizontalDelta * (event.clientX - dragState.sx), y: dragState.oy + event.clientY - dragState.sy }));
    };
    const end = (event: PointerEvent) => {
      if (resize.current?.pointerId === event.pointerId) resize.current = null;
      if (drag.current?.pointerId === event.pointerId) drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [isArabic]);

  const isMobile = viewportMode === "mobile";
  const panelStyle = isMobile
    ? { top: "env(safe-area-inset-top)", insetInlineStart: 0, width: "100vw", height: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))" }
    : viewportMode === "tablet"
      ? { top: geometry.y, left: "50%", transform: "translateX(-50%)", width: "min(720px, calc(100vw - 24px))", height: "min(620px, calc(100dvh - 92px))" }
      : { top: geometry.y, insetInlineStart: geometry.x, width: geometry.width, height: geometry.height };

  return <div className="relative">
    <button ref={trigger} type="button" onClick={openChat} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "المحادثة" : "Chat"} aria-expanded={open} aria-controls="global-chat-panel" data-testid="global-header-chat"><MessageCircle className="h-[19px] w-[19px]" aria-hidden="true" /></button>
    {open && minimized ? <button type="button" onClick={() => setMinimized(false)} className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] end-4 z-[100] inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "استعادة المحادثة" : "Restore chat"}><MessageCircle className="h-7 w-7" aria-hidden="true" /></button> : null}
    {open && !minimized ? <section id="global-chat-panel" data-testid="global-chat-panel" dir={isArabic ? "rtl" : "ltr"} style={panelStyle} className={cn("fixed z-[100] flex min-w-0 flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl", isMobile ? "rounded-none" : "rounded-2xl")} role="dialog" aria-modal="false" aria-label={isArabic ? "المحادثة" : "Chat"}>
      <header onPointerDown={startDrag} className={cn("flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3", viewportMode === "desktop" ? "cursor-move touch-none" : "") }>
        {isMobile && selected ? <button type="button" onClick={() => setMobileDirectoryOpen(true)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "العودة إلى المستخدمين" : "Back to users"}><ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /></button> : null}
        <MessageCircle className="h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
        <strong className="min-w-0 flex-1 truncate text-sm text-slate-900">{selected ? nameOf(selected) : (isArabic ? "المحادثة" : "Chat")}</strong>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => setMinimized(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "تصغير" : "Minimize"}><Minus className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" onPointerDown={event => event.stopPropagation()} onClick={closeChat} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "إغلاق" : "Close"}><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </header>
      <div className={cn("flex min-h-0 min-w-0 flex-1", isMobile ? "flex-col" : "flex-row")}>
        {(!isMobile || mobileDirectoryOpen || !selected) ? <aside className={cn("flex min-h-0 min-w-0 shrink-0 flex-col border-slate-200", isMobile ? "h-full border-b" : "h-full w-64 border-e") }>
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2.5"><Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={isArabic ? "ابحث عن مستخدم" : "Search users"} className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none" aria-label={isArabic ? "البحث عن مستخدم" : "Search users"} /></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {loadingContacts ? <div className="flex items-center gap-2 p-3 text-xs text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{isArabic ? "جارٍ التحميل..." : "Loading..."}</div> : null}
            {directoryError ? <div className="p-3 text-xs text-amber-700">{isArabic ? "تعذر تحميل المستخدمين. حاول مرة أخرى." : "Unable to load users. Please try again."}</div> : null}
            {!loadingContacts && !directoryError && !contacts.length ? <div className="p-3 text-xs text-slate-500">{query ? (isArabic ? "لا يوجد مستخدم مطابق." : "No matching user found.") : (isArabic ? "لا يوجد مستخدمون متاحون." : "No users are available.")}</div> : null}
            {!loadingContacts && !directoryError ? contacts.map(contact => <button key={contact.userId} type="button" onClick={() => void chooseContact(contact)} className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-start hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", selected?.userId === contact.userId && "bg-slate-100")}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{initialsOf(contact)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{nameOf(contact)}</span><span className="block truncate text-[11px] text-slate-500">{contact.lastMessage || contact.role || contact.email}</span></span>{contact.unreadCount > 0 ? <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">{contact.unreadCount > 99 ? "99+" : contact.unreadCount}</span> : null}
            </button>) : null}
          </div>
        </aside> : null}
        {(!isMobile || !mobileDirectoryOpen) ? <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {!selected ? <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-slate-500">{isArabic ? "اختر مستخدمًا لبدء المحادثة." : "Choose a user to start a conversation."}</div> : loadingMessages ? <div className="flex h-full min-h-32 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{isArabic ? "جارٍ تحميل الرسائل..." : "Loading messages..."}</div> : !messages.length ? <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-slate-500">{isArabic ? "لا توجد رسائل بعد." : "No messages yet."}</div> : <div className="space-y-2">{messages.map(message => <div key={message.id} className={cn("max-w-[88%] rounded-2xl px-3 py-2", message.senderClinicUserId === currentUserId ? "ms-auto bg-slate-100" : "me-auto bg-blue-50")}><p className="whitespace-pre-wrap break-words text-sm leading-5 text-slate-800">{message.body}</p><time className="mt-1 block text-[10px] text-slate-400">{new Intl.DateTimeFormat(isArabic ? "ar" : "en", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div>)}</div>}
          </div>
          {messageError ? <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-800" role="status">{messageError}</p> : null}
          <form onSubmit={event => { event.preventDefault(); void send(); }} className="shrink-0 border-t border-slate-200 bg-white p-2.5 pb-[calc(env(safe-area-inset-bottom)+0.625rem)]">
            {selectedFile ? <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{selectedFile.name}</span><button type="button" onClick={() => setSelectedFile(null)} aria-label={isArabic ? "إزالة الملف" : "Remove file"} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><X className="h-4 w-4" aria-hidden="true" /></button></div> : null}
            <textarea value={draft} onChange={event => setDraft(event.target.value)} disabled={!selected || sending || uploading} rows={2} placeholder={selected ? (isArabic ? "اكتب رسالتك..." : "Write a message...") : (isArabic ? "اختر مستخدمًا أولًا" : "Choose a user first")} className="block min-h-14 max-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:bg-white disabled:opacity-60" aria-label={isArabic ? "نص الرسالة" : "Message text"} />
            <div className="mt-2 flex items-center justify-between gap-2"><div><button type="button" onClick={() => fileInput.current?.click()} disabled={!selected || sending || uploading} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={isArabic ? "إرفاق ملف" : "Attach file"}><Paperclip className="h-4 w-4" aria-hidden="true" /></button><input ref={fileInput} type="file" className="hidden" accept="image/*,application/pdf,text/plain,.doc,.docx,.xls,.xlsx" onChange={event => { const file = event.target.files?.[0] ?? null; if (file && file.size <= 25 * 1024 * 1024) { setSelectedFile(file); setMessageError(null); } else if (file) setMessageError(isArabic ? "الحد الأقصى لحجم الملف 25 ميجابايت." : "Maximum file size is 25 MB."); event.currentTarget.value = ""; }} /></div><button type="submit" disabled={!selected || !draft.trim() || sending || uploading} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden="true" />}{uploading ? (isArabic ? "رفع..." : "Uploading...") : (isArabic ? "إرسال" : "Send")}</button></div>
          </form>
        </main> : null}
      </div>
      {viewportMode === "desktop" ? <button type="button" onPointerDown={startResize} className={cn("absolute bottom-1 end-1 z-10 h-7 w-7 touch-none rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", isArabic ? "cursor-nesw-resize" : "cursor-nwse-resize")} aria-label={isArabic ? "تغيير حجم المحادثة" : "Resize chat"} title={isArabic ? "تغيير حجم المحادثة" : "Resize chat"}>
        <span className="pointer-events-none absolute inset-0" aria-hidden="true"><span className="absolute bottom-1 end-2 h-px w-3 rotate-45 bg-slate-400" /><span className="absolute bottom-2 end-1 h-px w-3 rotate-45 bg-slate-400" /></span>
      </button> : null}
    </section> : null}
  </div>;
}
