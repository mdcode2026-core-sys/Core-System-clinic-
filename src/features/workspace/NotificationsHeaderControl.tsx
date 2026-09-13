"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useQueryClient } from "@tanstack/react-query";
import { useInvalidatePersonalNotificationFeed, usePersonalNotificationFeed, type PersonalNotificationFeed } from "@/domain/notifications/personal-notifications.queries";
import { markAllNotificationsRead, markNotificationRead } from "@/domain/notifications/personal-notifications.actions";
import { resolveNotificationDestination } from "@/domain/notifications/notification-destination";

interface NotificationsHeaderControlProps { isArabic: boolean; }
function formatTime(value: string, isArabic: boolean) { try { return new Intl.DateTimeFormat(isArabic ? "ar" : "en", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); } catch { return value; } }

export function NotificationsHeaderControl({ isArabic }: NotificationsHeaderControlProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = usePersonalNotificationFeed();
  const invalidate = useInvalidatePersonalNotificationFeed();
  const queryClient = useQueryClient();
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unreadCount = data?.unread_count ?? 0;

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

  const closePanel = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleRead = async (notificationId: string) => {
    const item = data?.items.find((candidate) => candidate.id === notificationId);
    const result = await markNotificationRead(notificationId);
    if (!result.success) return;
    queryClient.setQueryData<PersonalNotificationFeed>(["personal-notification-feed"], (current) => current ? { ...current, unread_count: Math.max(0, current.unread_count - (current.items.some((candidate) => candidate.id === notificationId && !candidate.is_read) ? 1 : 0)), items: current.items.map((candidate) => candidate.id === notificationId ? { ...candidate, is_read: true } : candidate) } : current);
    await invalidate();
    const destination = resolveNotificationDestination(item?.destination_path);
    closePanel();
    if (destination) router.push(destination);
  };

  const handleReadAll = async () => {
    if (!unreadCount) return;
    const result = await markAllNotificationsRead();
    if (!result.success) return;
    queryClient.setQueryData<PersonalNotificationFeed>(["personal-notification-feed"], (current) => current ? { ...current, unread_count: 0, items: current.items.map((item) => ({ ...item, is_read: true })) } : current);
    await invalidate();
  };

  return <div className="relative">
    <button ref={triggerRef} type="button" onClick={() => setOpen((value) => !value)} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 md:w-auto md:px-2.5" aria-label={isArabic ? unreadCount > 0 ? `الإشعارات، ${unreadCount} غير مقروء` : "الإشعارات" : unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"} aria-expanded={open} aria-haspopup="dialog" data-testid="notifications-header-control">
      <Bell className="h-[18px] w-[18px]" aria-hidden="true" /><span className="sr-only">{isArabic ? "الإشعارات" : "Notifications"}</span>
      {unreadCount > 0 && <span className="absolute -end-0.5 -top-0.5 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-4 text-white ring-2 ring-slate-50" aria-label={isArabic ? `${unreadCount} غير مقروء` : `${unreadCount} unread`}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      <span className="hidden xl:inline ms-1 text-sm font-medium">{isArabic ? "الإشعارات" : "Notifications"}</span>
    </button>
    <div aria-live="polite" aria-atomic="true" className="sr-only">{isArabic ? `عدد الإشعارات غير المقروءة: ${unreadCount}` : `Unread notifications: ${unreadCount}`}</div>
    {open && <section role="dialog" aria-label={isArabic ? "الإشعارات" : "Notifications"} className={cn("absolute top-11 z-50 w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl", isArabic ? "start-0" : "end-0")} data-testid="notifications-header-panel">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><div><h2 className="font-semibold text-slate-900">{isArabic ? "الإشعارات" : "Notifications"}</h2><p className="mt-0.5 text-xs text-slate-500">{isArabic ? unreadCount > 0 ? `${unreadCount} غير مقروءة` : "لا توجد إشعارات غير مقروءة" : unreadCount > 0 ? `${unreadCount} unread` : "No unread notifications"}</p></div>{unreadCount > 0 && <button type="button" onClick={() => void handleReadAll()} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{isArabic ? "تعليم الكل كمقروء" : "Mark all read"}</button>}</div>
      <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
        {isLoading ? <p className="px-4 py-8 text-center text-sm text-slate-500">{isArabic ? "جارٍ التحميل..." : "Loading..."}</p> : isError ? <p className="px-4 py-8 text-center text-sm text-red-600">{isArabic ? "تعذر تحميل الإشعارات." : "Unable to load notifications."}</p> : data?.items.length ? data.items.map((item) => <button key={item.id} type="button" onClick={() => void handleRead(item.id)} className="block w-full border-b border-slate-100 px-4 py-3.5 text-start transition-colors last:border-b-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"><div className="flex gap-3"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.is_read ? "bg-slate-300" : "bg-blue-600")} aria-hidden="true" /><div className="min-w-0 flex-1"><p className={cn("text-sm text-slate-900", item.is_read ? "font-normal" : "font-semibold")}>{item.title}</p>{item.message && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.message}</p>}<p className="mt-1.5 text-[11px] text-slate-400">{formatTime(item.created_at, isArabic)}</p></div></div></button>) : <p className="px-4 py-8 text-center text-sm text-slate-500">{isArabic ? "لا توجد إشعارات حالياً." : "No notifications yet."}</p>}
      </div>
    </section>}
  </div>;
}
