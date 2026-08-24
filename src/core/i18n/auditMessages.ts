import type { Locale } from "./messages";

export const auditMessages = {
  ar: {
    searchLabel: "بحث", searchPlaceholder: "الإجراء أو الجدول أو السبب...", allActions: "كل الإجراءات", allTables: "كل الجداول", from: "من", to: "إلى", clearFilters: "مسح الفلاتر", record: "السجل", previous: "السابق", next: "التالي"
  },
  en: {
    searchLabel: "Search", searchPlaceholder: "Action, table, reason...", allActions: "All actions", allTables: "All tables", from: "From", to: "To", clearFilters: "Clear filters", record: "Record", previous: "Previous", next: "Next"
  }
} as const satisfies Record<Locale, unknown>;

export function getAuditMessages(locale: Locale) { return auditMessages[locale]; }
