"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Mail } from "lucide-react";
import { getCommunicationsHeaderFeed } from "@/domain/communications/communications.header.actions";
import { markConversationRead } from "@/domain/communications/communications.actions";

interface CommunicationsHeaderControlProps { isArabic: boolean; }

export function CommunicationsHeaderControl({ isArabic }: CommunicationsHeaderControlProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState<Awaited<ReturnType<typeof getCommunicationsHeaderFeed>>["unread"]>([]);
  const [requests, setRequests] = useState<Awaited<ReturnType<typeof getCommunicationsHeaderFeed>>["requests"]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    const feed = await getCommunicationsHeaderFeed();
    setUnread(feed.unread);
    setRequests(feed.requests);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 15000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const utilityCount = unread.length + requests.length;

  const readAndOpen = async (conversationId: string) => {
    await markConversationRead(conversationId);
    setOpen(false);
    await refresh();
  };

  return (
    <div className="relative shrink-0">
      <button ref={triggerRef} type="button" onClick={() => { setOpen((value) => !value); if (!open) void refresh(); }} className="cs-interactive inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--cs-slate-700)] sm:h-10 sm:w-10" aria-label={isArabic ? "الاتصالات الداخلية" : "Communications"} title={isArabic ? "الاتصالات الداخلية" : "Communications"} aria-expanded={open} aria-haspopup="dialog" data-testid="global-header-communications">
        <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
        {utilityCount > 0 ? <span className="absolute -end-0.5 -top-1 min-w-5 rounded-full bg-[var(--cs-danger-700)] px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-white" aria-label={isArabic ? `${utilityCount} جديد` : `${utilityCount} new`}>{utilityCount > 99 ? "99+" : utilityCount}</span> : null}
      </button>

      {open ? <div role="dialog" aria-label={isArabic ? "الاتصالات" : "Communications"} className="fixed inset-x-2 top-[4.25rem] z-[80] w-auto overflow-hidden rounded-xl border border-[var(--cs-slate-200)] bg-white shadow-[var(--cs-shadow-md)] md:absolute md:inset-x-auto md:end-0 md:top-11 md:w-[min(22rem,calc(100vw-1rem))]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--cs-slate-200)] px-4 py-3"><strong className="text-sm text-[var(--cs-ink-950)]">{isArabic ? "الاتصالات" : "Communications"}</strong><Link href="/communications" onClick={() => setOpen(false)} className="cs-interactive rounded text-xs font-semibold text-[var(--cs-azure-700)]">{isArabic ? "فتح المركز" : "Open center"}</Link></div>
        <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-2">
          {unread.length === 0 && requests.length === 0 ? <p className="px-3 py-6 text-center text-sm text-[var(--cs-slate-500)]">{isArabic ? "لا توجد اتصالات جديدة" : "No new communications"}</p> : null}
          {unread.length > 0 ? <section><div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--cs-slate-500)]">{isArabic ? "رسائل وملاحظات جديدة" : "New messages & notes"}</div>{unread.map((item) => <Link key={item.id} href="/communications" onClick={() => void readAndOpen(item.conversation_id)} className="cs-interactive flex items-start gap-2 rounded-lg px-2.5 py-2.5 text-start"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cs-slate-500)]" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-xs font-medium text-[var(--cs-ink-950)]">{item.message_kind === "internal_note" ? (isArabic ? "ملاحظة داخلية" : "Internal note") : (isArabic ? "رسالة" : "Message")}</span><span className="mt-0.5 block truncate text-xs text-[var(--cs-slate-500)]">{item.body}</span></span></Link>)}</section> : null}
          {requests.length > 0 ? <section className="mt-2 border-t border-[var(--cs-slate-200)] pt-2"><div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--cs-slate-500)]">{isArabic ? "طلبات الاتصالات" : "Communication requests"}</div>{requests.map((request) => <Link key={request.id} href="/communications" onClick={() => setOpen(false)} className="cs-interactive block rounded-lg px-2.5 py-2.5"><span className="block truncate text-xs font-medium text-[var(--cs-ink-950)]">{request.title}</span><span className="mt-0.5 block text-[11px] text-[var(--cs-slate-500)]">{request.priority} · {request.status}</span></Link>)}</section> : null}
        </div>
      </div> : null}
    </div>
  );
}
