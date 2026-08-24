import type { Locale } from "./messages";

export const followupMessages = {
  ar: { noScheduled: "لا توجد متابعات مجدولة.", unknownPatient: "مريض غير معروف", cancel: "إلغاء", actions: { call: "اتصال", whatsapp: "واتساب", sms: "رسالة SMS", email: "بريد إلكتروني", appointment: "موعد", review: "مراجعة", general: "عام" } },
  en: { noScheduled: "No scheduled follow-ups.", unknownPatient: "Unknown patient", cancel: "Cancel", actions: { call: "Call", whatsapp: "WhatsApp", sms: "SMS", email: "Email", appointment: "Appointment", review: "Review", general: "General" } },
} as const;
export function getFollowupMessages(locale: Locale) { return followupMessages[locale]; }
