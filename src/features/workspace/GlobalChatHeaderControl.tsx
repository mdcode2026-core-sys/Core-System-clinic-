"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Minus, Paperclip, Search, Send, X } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { createCommunicationAttachmentUpload, createConversation, sendInternalMessage } from "@/domain/communications/communications.actions";
import { getInternalChatDirectory, getInternalChatMessages, markInternalChatRead, type InternalChatContact, type InternalChatMessage } from "@/domain/communications/chat.actions";

interface PanelGeometry { x: number; y: number; width: number; height: number }
const MIN_W = 300, MIN_H = 360, GAP = 12, TOP = 68, STORAGE = "core-system-global-chat-layout-v3";
const defaults = (): PanelGeometry => {
  if (typeof window === "undefined") return { x: 12, y: 68, width: 520, height: 560 };
  const mobile = window.innerWidth < 768;
  const width = mobile ? Math.max(MIN_W, window.innerWidth - GAP * 2) : Math.min(520, window.innerWidth - GAP * 2);
  const height = mobile ? Math.max(MIN_H, window.innerHeight - TOP - GAP) : Math.min(560, window.innerHeight - TOP - GAP);
  return { x: mobile ? GAP : Math.max(GAP, window.innerWidth - width - GAP), y: mobile ? TOP : Math.max(TOP, Math.round((window.innerHeight - height) / 2)), width, height };
};
const normalize = (v: PanelGeometry): PanelGeometry => {
  if (typeof window === "undefined") return v;
  const width = Math.min(v.width, Math.max(MIN_W, window.innerWidth - GAP * 2));
  const height = Math.min(v.height, Math.max(MIN_H, window.innerHeight - TOP - GAP));
  return { x: Math.min(Math.max(GAP, v.x), Math.max(GAP, window.innerWidth - width - GAP)), y: Math.min(Math.max(TOP, v.y), Math.max(TOP, window.innerHeight - height - GAP)), width, height };
};
const nameOf = (c: InternalChatContact) => c.fullName || c.email || "User";
const initialsOf = (c: InternalChatContact) => nameOf(c).trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "U";

export function GlobalChatHeaderControl({ isArabic }: { isArabic: boolean }) {
  const [open, setOpen] = useState(false), [minimized, setMinimized] = useState(false), [contacts, setContacts] = useState<InternalChatContact[]>([]), [query, setQuery] = useState(""), [selected, setSelected] = useState<InternalChatContact | null>(null), [messages, setMessages] = useState<InternalChatMessage[]>([]), [draft, setDraft] = useState(""), [currentUserId, setCurrentUserId] = useState<string | null>(null), [sending, setSending] = useState(false), [uploading, setUploading] = useState(false), [selectedFile, setSelectedFile] = useState<File | null>(null), [loadingContacts, setLoadingContacts] = useState(false), [loadingMessages, setLoadingMessages] = useState(false), [directoryError, setDirectoryError] = useState(false), [messageError, setMessageError] = useState<string | null>(null), [geometry, setGeometry] = useState<PanelGeometry>(defaults);
  const fileInput = useRef<HTMLInputElement>(null), trigger = useRef<HTMLButtonElement>(null), drag = useRef<{ pointerId: number; sx: number; sy: number; ox: number; oy: number } | null>(null);

  const loadIdentity = useCallback(async () => {
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { data } = await supabase.from("clinic_users").select("id").eq("auth_user_id", user.id).eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (data?.id) setCurrentUserId(data.id);
  }, []);
  const loadContacts = useCallback(async (value = query) => {
    setLoadingContacts(true); setDirectoryError(false);
    try { const rows = await getInternalChatDirectory(value); setContacts(rows); }
    catch (error) { console.error("Internal chat directory load failed", error); setContacts([]); setDirectoryError(true); }
    finally { setLoadingContacts(false); }
  }, [query]);
  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try { const rows = await getInternalChatMessages(conversationId); setMessages(rows); void markInternalChatRead(conversationId); }
    catch (error) { console.error("Internal chat message load failed", error); setMessageError(isArabic ? "تعذر تحميل الرسائل." : "Unable to load messages."); }
    finally { setLoadingMessages(false); }
  }, [isArabic]);

  useEffect(() => { void loadIdentity(); }, [loadIdentity]);
  useEffect(() => { if (!open || minimized) return; const timer = window.setTimeout(() => void loadContacts(query), 120); return () => window.clearTimeout(timer); }, [open, minimized, query, loadContacts]);
  useEffect(() => { if (!selected?.conversationId) { setMessages([]); return; } void loadMessages(selected.conversationId); }, [selected?.conversationId, loadMessages]);
  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();
    const channel = supabase.channel(`global-chat:${currentUserId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "communication_messages", filter: "message_kind=eq.message" }, payload => {
      const row = payload.new as { id?: string; conversation_id?: string; body?: string; sender_clinic_user_id?: string | null; created_at?: string; message_kind?: string };
      if (!row.id || !row.conversation_id || row.message_kind !== "message") return;
      if (selected?.conversationId === row.conversation_id) {
        setMessages(existing => existing.some(m => m.id === row.id) ? existing : [...existing, { id: row.id!, body: row.body ?? "", senderClinicUserId: row.sender_clinic_user_id ?? null, createdAt: row.created_at ?? new Date().toISOString(), messageKind: "message" }]);
        void markInternalChatRead(row.conversation_id);
      }
      void loadContacts(query);
    }).subscribe(status => { if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.error("Global chat realtime unavailable", status); });
    return () => { void supabase.removeChannel(channel); };
  }, [currentUserId, loadContacts, query, selected?.conversationId]);
  useEffect(() => { if (typeof window === "undefined" || !currentUserId) return; try { const saved = JSON.parse(window.localStorage.getItem(`${STORAGE}:${currentUserId}`) || "{}"); if (saved.geometry) setGeometry(normalize(saved.geometry)); } catch {} }, [currentUserId]);
  useEffect(() => { if (typeof window === "undefined" || !currentUserId) return; const timer = window.setTimeout(() => { try { window.localStorage.setItem(`${STORAGE}:${currentUserId}`, JSON.stringify({ geometry })); } catch {} }, 150); return () => window.clearTimeout(timer); }, [currentUserId, geometry]);

  const chooseContact = async (contact: InternalChatContact) => {
    setMessageError(null); setDraft(""); setSelectedFile(null); setSelected(contact);
    if (contact.conversationId) return;
    try { const conversationId = await createConversation({ subject: nameOf(contact), recipientUserId: contact.userId }); if (!conversationId) throw new Error("CONVERSATION_CREATE_FAILED"); setSelected({ ...contact, conversationId }); await loadContacts(query); await loadMessages(conversationId); }
    catch (error) { console.error("Internal chat conversation start failed", error); setMessageError(isArabic ? "تعذر فتح المحادثة. حاول مرة أخرى." : "Unable to open the conversation. Please try again."); }
  };
  const send = async () => {
    const body = draft.trim(), conversationId = selected?.conversationId; if (!body || !conversationId || sending || uploading) return;
    setSending(true); setMessageError(null);
    const optimisticId = `optimistic-${Date.now()}`;
    setMessages(existing => [...existing, { id: optimisticId, body, senderClinicUserId: currentUserId, createdAt: new Date().toISOString(), messageKind: "message" }]); setDraft("");
    try {
      const messageId = await sendInternalMessage({ conversationId, body }); if (!messageId) throw new Error("MESSAGE_SEND_FAILED");
      setMessages(existing => existing.map(m => m.id === optimisticId ? { ...m, id: messageId } : m)); setSending(false);
      if (selectedFile) { setUploading(true); const file = selectedFile; const upload = await createCommunicationAttachmentUpload({ messageId, fileName: file.name, mimeType: file.type, byteSize: file.size }); if (upload) { const supabase = createClient(); const { error } = await supabase.storage.from(upload.attachment.storage_bucket).uploadToSignedUrl(upload.path, upload.uploadToken, file); if (error) setMessageError(isArabic ? "تم إرسال الرسالة، لكن تعذر رفع الملف." : "Message sent, but the file upload failed."); } setUploading(false); setSelectedFile(null); }
      void loadContacts(query); void loadMessages(conversationId);
    } catch (error) { console.error("Internal chat send failed", error); setMessages(existing => existing.filter(m => m.id !== optimisticId)); setDraft(body); setMessageError(isArabic ? "تعذر إرسال الرسالة. حاول مرة أخرى." : "Unable to send the message. Please try again."); setSending(false); }
  };
  const openChat = () => { setOpen(true); setMinimized(false); setMessageError(null); };
  const closeChat = () => { setOpen(false); setMinimized(false); setSelected(null); setMessages([]); setDraft(""); setSelectedFile(null); setMessageError(null); trigger.current?.focus(); };

  useEffect(() => { const move = (event: PointerEvent) => { const state = drag.current; if (!state || state.pointerId !== event.pointerId) return; setGeometry(v => normalize({ ...v, x: state.ox + event.clientX - state.sx, y: state.oy + event.clientY - state.sy })); }; const up = () => { drag.current = null; }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); }; }, []);

  return <div className="relative">
    <button ref={trigger} type="button" onClick={openChat} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-slate-900" aria-label={isArabic ? "المحادثة" : "Chat"} data-testid="global-header-chat"><MessageCircle className="h-[19px] w-[19px]" /></button>
    {open && minimized ? <button type="button" onClick={() => setMinimized(false)} className="fixed bottom-5 end-5 z-[100] inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-2xl" aria-label={isArabic ? "استعادة المحادثة" : "Restore chat"}><MessageCircle className="h-7 w-7" /></button> : null}
    {open && !minimized ? <section data-testid="global-chat-panel" style={{ left: geometry.x, top: geometry.y, width: geometry.width, height: geometry.height }} className="fixed z-[100] flex max-w-[calc(100vw-24px)] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-label={isArabic ? "المحادثة" : "Chat"}>
      <header onPointerDown={event => { if (event.button === 0) drag.current = { pointerId: event.pointerId, sx: event.clientX, sy: event.clientY, ox: geometry.x, oy: geometry.y }; }} className="flex h-12 shrink-0 cursor-move items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 touch-none"><MessageCircle className="h-5 w-5 shrink-0 text-slate-600" /><strong className="min-w-0 flex-1 truncate text-sm text-slate-900">{selected ? nameOf(selected) : (isArabic ? "المحادثة" : "Chat")}</strong><div className="flex shrink-0 items-center gap-1"><button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setMinimized(true)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white" aria-label={isArabic ? "تصغير" : "Minimize"}><Minus className="h-4 w-4" /></button><button type="button" onPointerDown={e => e.stopPropagation()} onClick={closeChat} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white" aria-label={isArabic ? "إغلاق" : "Close"}><X className="h-4 w-4" /></button></div></header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
        <aside className="flex min-h-0 min-w-0 shrink-0 flex-col border-b border-slate-200 md:h-full md:w-64 md:border-b-0 md:border-e"><div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2.5"><Search className="h-4 w-4 shrink-0 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={isArabic ? "ابحث عن مستخدم" : "Search users"} className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none" aria-label={isArabic ? "البحث عن مستخدم" : "Search users"} /></div><div className="min-h-0 flex-1 overflow-y-auto p-1.5">{loadingContacts ? <div className="flex items-center gap-2 p-3 text-xs text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{isArabic ? "جارٍ التحميل..." : "Loading..."}</div> : null}{directoryError ? <div className="p-3 text-xs text-amber-700">{isArabic ? "تعذر تحميل المستخدمين. حاول مرة أخرى." : "Unable to load users. Please try again."}</div> : null}{!loadingContacts && !directoryError && !contacts.length ? <div className="p-3 text-xs text-slate-500">{query ? (isArabic ? "لا يوجد مستخدم مطابق." : "No matching user found.") : (isArabic ? "لا يوجد مستخدمون متاحون." : "No users are available.")}</div> : null}{!loadingContacts && !directoryError ? contacts.map(contact => <button key={contact.userId} type="button" onClick={() => void chooseContact(contact)} className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-start hover:bg-slate-50", selected?.userId === contact.userId && "bg-slate-100")}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{initialsOf(contact)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{nameOf(contact)}</span><span className="block truncate text-[11px] text-slate-500">{contact.lastMessage || contact.role || contact.email}</span></span>{contact.unreadCount > 0 ? <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">{contact.unreadCount > 99 ? "99+" : contact.unreadCount}</span> : null}</button>) : null}</div></aside>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col"><div className="min-h-0 flex-1 overflow-y-auto p-3">{!selected ? <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-slate-500">{isArabic ? "اختر مستخدمًا لبدء المحادثة." : "Choose a user to start a conversation."}</div> : loadingMessages ? <div className="flex h-full min-h-32 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{isArabic ? "جارٍ تحميل الرسائل..." : "Loading messages..."}</div> : !messages.length ? <div className="flex h-full min-h-32 items-center justify-center text-center text-sm text-slate-500">{isArabic ? "لا توجد رسائل بعد." : "No messages yet."}</div> : <div className="space-y-2">{messages.map(message => <div key={message.id} className={cn("max-w-[88%] rounded-2xl px-3 py-2", message.senderClinicUserId === currentUserId ? "ms-auto bg-slate-100" : "me-auto bg-blue-50")}><p className="whitespace-pre-wrap break-words text-sm leading-5 text-slate-800">{message.body}</p><time className="mt-1 block text-[10px] text-slate-400">{new Intl.DateTimeFormat(isArabic ? "ar" : "en", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time></div>)}</div>}</div>{messageError ? <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">{messageError}</p> : null}<form onSubmit={e => { e.preventDefault(); void send(); }} className="shrink-0 border-t border-slate-200 bg-white p-2.5">{selectedFile ? <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5" /><span className="min-w-0 flex-1 truncate">{selectedFile.name}</span><button type="button" onClick={() => setSelectedFile(null)} aria-label={isArabic ? "إزالة الملف" : "Remove file"}><X className="h-4 w-4" /></button></div> : null}<textarea value={draft} onChange={e => setDraft(e.target.value)} disabled={!selected || sending || uploading} rows={2} placeholder={selected ? (isArabic ? "اكتب رسالتك..." : "Write a message...") : (isArabic ? "اختر مستخدمًا أولًا" : "Choose a user first")} className="block min-h-14 max-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:bg-white disabled:opacity-60" /><div className="mt-2 flex items-center justify-between gap-2"><div><button type="button" onClick={() => fileInput.current?.click()} disabled={!selected || sending || uploading} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label={isArabic ? "إرفاق ملف" : "Attach file"}><Paperclip className="h-4 w-4" /></button><input ref={fileInput} type="file" className="hidden" accept="image/*,application/pdf,text/plain,.doc,.docx,.xls,.xlsx" onChange={e => { const file = e.target.files?.[0] ?? null; if (file && file.size <= 25 * 1024 * 1024) { setSelectedFile(file); setMessageError(null); } else if (file) setMessageError(isArabic ? "الحد الأقصى لحجم الملف 25 ميجابايت." : "Maximum file size is 25 MB."); e.currentTarget.value = ""; }} /></div><button type="submit" disabled={!selected || !draft.trim() || sending || uploading} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{uploading ? (isArabic ? "رفع..." : "Uploading...") : (isArabic ? "إرسال" : "Send")}</button></div></form></main>
      </div>
    </section> : null}
  </div>;
}