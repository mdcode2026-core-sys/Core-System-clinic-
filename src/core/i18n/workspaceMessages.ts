import type { Locale } from "./messages";

export const workspaceMessages = {
  ar: {
    layerQuickActions: "إجراءات سريعة",
    layerStatusAnalytics: "الحالة والتحليلات",
    noWidgets: "لا توجد أدوات متاحة",
    contactAdmin: "اتصل بالمسؤول لتمكين الوحدات",
  },
  en: {
    layerQuickActions: "Quick Actions",
    layerStatusAnalytics: "Status & Analytics",
    noWidgets: "No widgets are available",
    contactAdmin: "Contact an administrator to enable modules",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function getWorkspaceMessages(locale: Locale) {
  return workspaceMessages[locale];
}
