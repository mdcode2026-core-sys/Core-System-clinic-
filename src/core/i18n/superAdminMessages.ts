import type { Locale } from "./messages";

export const superAdminMessages = {
  ar: {
    tenantRegistry: {
      title: "إدارة المستأجرين",
      addClinic: "إضافة عيادة",
      searchPlaceholder: "البحث...",
      users: "مستخدم",
      patient: "مريض",
      active: "نشط",
      inactive: "معطل",
      tiers: {
        essential: "أساسية",
        professional: "احترافية",
        enterprise: "مؤسسية",
      },
    },
  },
  en: {
    tenantRegistry: {
      title: "Tenant Management",
      addClinic: "Add clinic",
      searchPlaceholder: "Search...",
      users: "users",
      patient: "patient",
      active: "Active",
      inactive: "Disabled",
      tiers: {
        essential: "Essential",
        professional: "Professional",
        enterprise: "Enterprise",
      },
    },
  },
} as const;

export function getSuperAdminMessages(locale: Locale) {
  return superAdminMessages[locale];
}
