import type { Locale } from "@/core/i18n/messages";

export const dashboardMessages = {
  ar: {
    title: "لوحة التحكم",
    management: "الإدارة والمراقبة",
    description: "ملخص إداري مركز لحالة العيادة وأهم مؤشرات العمل اليومية، مع إبقاء التحليلات التفصيلية في سطحها المستقل.",
    openAnalytics: "فتح التحليلات التفصيلية",
    noData: "لا توجد مؤشرات متاحة للعرض حالياً.",
    sections: {
      patients: "المرضى",
      appointments: "المواعيد",
      queue: "الطابور",
      revenue: "الإيرادات",
      invoices: "الفواتير",
      inventory: "المخزون",
      followup: "المتابعة",
    },
  },
  en: {
    title: "Dashboard",
    management: "Management & Monitoring",
    description: "A focused management snapshot of clinic status and key daily indicators, while detailed analytics remain in their dedicated surface.",
    openAnalytics: "Open detailed analytics",
    noData: "No indicators are currently available.",
    sections: {
      patients: "Patients",
      appointments: "Appointments",
      queue: "Queue",
      revenue: "Revenue",
      invoices: "Invoices",
      inventory: "Inventory",
      followup: "Follow-up",
    },
  },
} as const;

export function getDashboardMessages(locale: Locale) {
  return dashboardMessages[locale];
}
