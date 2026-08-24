import type { Locale } from "./messages";

export const workspaceMessages = {
  ar: {
    layerQuickActions: "إجراءات سريعة",
    layerStatusAnalytics: "الحالة والتحليلات",
    noWidgets: "لا توجد أدوات متاحة",
    contactAdmin: "اتصل بالمسؤول لتمكين الوحدات",
    widgetError: "حدث خطأ غير متوقع",
    retry: "إعادة المحاولة",
    collapsed: "مطوي",
    expand: "توسيع",
    collapse: "طي",
    unpin: "إلغاء التثبيت",
    pin: "تثبيت",
    show: "إظهار",
    hide: "إخفاء",
  },
  en: {
    layerQuickActions: "Quick Actions",
    layerStatusAnalytics: "Status & Analytics",
    noWidgets: "No widgets are available",
    contactAdmin: "Contact an administrator to enable modules",
    widgetError: "An unexpected error occurred",
    retry: "Retry",
    collapsed: "Collapsed",
    expand: "Expand",
    collapse: "Collapse",
    unpin: "Unpin",
    pin: "Pin",
    show: "Show",
    hide: "Hide",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function getWorkspaceMessages(locale: Locale) {
  return workspaceMessages[locale];
}
