"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  useInvalidatePersonalNotificationFeed,
  usePersonalNotificationFeed,
} from "@/domain/notifications/personal-notifications.queries";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/domain/notifications/personal-notifications.actions";

interface NotificationsHeaderControlProps {
  isArabic: boolean;
}

function formatTime(value: string, isArabic: boolean) {
  try {
    return new Intl.DateTimeFormat(isArabic ? "ar" : "en", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function NotificationsHeaderControl({ isArabic }: NotificationsHeaderControlProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = usePersonalNotificationFeed();
  const invalidate = useInvalidatePersonalNotificationFeed();
  const unreadCount = data?.unread_count ?? 0;

  const handleRead = async (notificationId: string) => {
    const result = await markNotificationRead(notificationId);
    if (result.success) await invalidate();
  };

  const handleReadAll = async () => {
    if (!unreadCount) return;
    const result = await markAllNotificationsRead();
    if (result.success) await invalidate();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={
          isArabic
            ? unreadCount > 0
              ? `الإشعارات، ${unreadCount} غير مقروء`
              : "الإشعارات"
            : unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid="notifications-header-control"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-semibold leading-4 text-white"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <section
          role="dialog"
          aria-label={isArabic ? "الإشعارات" : "Notifications"}
          className={cn(
            "absolute top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-white shadow-xl",
            isArabic ? "left-0" : "right-0",
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="font-semibold text-gray-900">
                {isArabic ? "الإشعارات" : "Notifications"}
              </h2>
              <p className="text-xs text-gray-500">
                {isArabic
                  ? unreadCount > 0
                    ? `${unreadCount} غير مقروءة`
                    : "لا توجد إشعارات غير مقروءة"
                  : unreadCount > 0
                    ? `${unreadCount} unread`
                    : "No unread notifications"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleReadAll}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                {isArabic ? "تعليم الكل كمقروء" : "Mark all read"}
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                {isArabic ? "جارٍ التحميل..." : "Loading..."}
              </p>
            ) : isError ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">
                {isArabic ? "تعذر تحميل الإشعارات." : "Unable to load notifications."}
              </p>
            ) : data?.items.length ? (
              data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRead(item.id)}
                  className="block w-full border-b px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                >
                  <div className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        item.is_read ? "bg-gray-200" : "bg-blue-600",
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      {item.message ? (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                          {item.message}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatTime(item.created_at, isArabic)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                {isArabic ? "لا توجد إشعارات حالياً." : "No notifications yet."}
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
