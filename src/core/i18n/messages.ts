export type Locale = "ar" | "en";

export const messages = {
  ar: {
    nav: {
      dashboard: "لوحة التحكم",
      operation: "مساحة التشغيل",
      clinical: "المساحة الطبية",
      treatmentPlans: "خطط العلاج",
      patients: "المرضى",
      agenda: "الأجندة",
      queue: "الطابور",
      invoices: "الفواتير",
      inventory: "المخزون",
      reports: "التقارير",
      analytics: "التحليلات",
      followUp: "المتابعة",
      settings: "الإعدادات",
    },
    shell: {
      workspace: "مساحة العمل",
      signOut: "تسجيل الخروج",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
    },
    language: {
      label: "اللغة",
      arabic: "العربية",
      english: "English",
    },
  },
  en: {
    nav: {
      dashboard: "Dashboard",
      operation: "Operation Workspace",
      clinical: "Clinical Workspace",
      treatmentPlans: "Treatment Plans",
      patients: "Patients",
      agenda: "Agenda",
      queue: "Queue",
      invoices: "Invoices",
      inventory: "Inventory",
      reports: "Reports",
      analytics: "Analytics",
      followUp: "Follow-up",
      settings: "Settings",
    },
    shell: {
      workspace: "Workspace",
      signOut: "Sign out",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    language: {
      label: "Language",
      arabic: "العربية",
      english: "English",
    },
  },
} as const;

export type Messages = typeof messages.en;

export function getMessages(locale: Locale): Messages {
  return messages[locale] as Messages;
}
