import type { Locale } from "./messages";

export const subscriptionMessages = {
  ar: {
    trial: "فترة تجريبية", clinic: "العيادة", tenantId: "Tenant ID", licenseKey: "مفتاح الترخيص", startDate: "تاريخ البدء", endDate: "تاريخ الانتهاء", daysRemaining: "المدة المتبقية", planLimits: "حدود الخطة", planLimitsDescription: "الموارد المتاحة في اشتراكك الحالي", branches: "الفروع", devices: "الأجهزة", activationDescription: "أدخل رمز التفعيل الذي تلقيته من إدارة المنصة", activationPlaceholder: "أدخل رمز التفعيل...", note: "ملاحظة", contactInformation: "معلومات التواصل",
  },
  en: {
    trial: "Trial", clinic: "Clinic", tenantId: "Tenant ID", licenseKey: "License key", startDate: "Start date", endDate: "End date", daysRemaining: "Days remaining", planLimits: "Plan limits", planLimitsDescription: "Resources included in your current subscription", branches: "Branches", devices: "Devices", activationDescription: "Enter the activation code provided by platform administration.", activationPlaceholder: "Enter activation code...", note: "Note", contactInformation: "Contact information",
  },
} as const;

export function getSubscriptionMessages(locale: Locale) { return subscriptionMessages[locale]; }
