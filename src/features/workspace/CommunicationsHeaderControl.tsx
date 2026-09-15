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

  const openUtility = () => {
    setOpen((value) => !value);
    if (!open) void refresh();
  };

  const closeUtility = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const readAndOpen = async (conversationId: string) => {
    await markConversationRead(conversationId);
    closeUtility();
    await refresh();
  };

  const utilityCount = unread.length + requests.length;

  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={openUtility} className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1" aria-label={isArabic ? "تنبيهات وملاحظات الاتصالات" : "Communications alerts and notes"} title={isArabic ? "تنبيهات وملاحظات الاتصالات" : "Communications alerts and notes"} aria-expanded={open} aria-controls="global-communications-panel" aria-haspopup="dialog" data-testid="global-header-communications">
        <Mail className="h-[19px] w-[19px]" aria-hidden="true" />
        {utilityCount > 0 ? <span className="absolute -end-0.5 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[10px] font-bold leading-5 text-white ring-2 ring-white" aria-label={isArabic ? `${utilityCount} جديد` : `${utilityCount} new`}>{utilityCount > 99 ? "99+" : utilityCount}</span> : null}
      </button>

      {open ? <div id="global-communications-panel" role="dialog" aria-modal="false" aria-label={isArabic ? "تنبيهات وملاحظات الاتصالات" : "Communications alerts and notes"} className="fixed inset-x-2 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[80] w-auto max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:absolute md:inset-x-auto md:top-11 md:end-0 md:w-[min(22rem,calc(100vw-1rem))]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><strong className="text-sm text-slate-900">{isArabic ? "الاتصالات" : "Communications"}</strong><Link href="/communications" onClick={closeUtility} className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{isArabic ? "فتح المركز" : "Open center"}</Link></div>
        <div className="max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain p-2">
          {unread.length === 0 && requests.length === 0 ? <p className="px-3 py-6 text-center text-sm text-slate-500">{isArabic ? "لا توجد تنبيهات أو ملاحظات جديدة" : "No new communications alerts or notes"}</p> : null}
          {unread.length > 0 ? <section><div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{isArabic ? "رسائل وملاحظات جديدة" : "New messages & notes"}</div>{unread.map((item) => <Link key={item.id} href="/communications" onClick={() => void readAndOpen(item.conversation_id)} className="flex items-start gap-2 rounded-xl px-2.5 py-2.5 text-start hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-xs font-medium text-slate-900">{item.message_kind === "internal_note" ? (isArabic ? "ملاحظة داخلية" : "Internal note") : (isArabic ? "رسالة" : "Message")}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{item.body}</span></span></Link>)}</section> : null}
          {requests.length > 0 ? <section className="mt-2 border-t border-slate-100 pt-2"><div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{isArabic ? "طلبات الاتصالات" : "Communication requests"}</div>{requests.map((request) => <Link key={request.id} href="/communications" onClick={closeUtility} className="block rounded-xl px-2.5 py-2.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="block truncate text-xs font-medium text-slate-900">{request.title}</span><span className="mt-0.5 block text-[11px] text-slate-500">{request.priority} · {request.status}</span></Link>)}</section> : null}
        </div>
      </div> : null}
    </div>
  );
}
