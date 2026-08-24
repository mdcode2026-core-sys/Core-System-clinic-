import type { Locale } from "@/core/i18n/messages";

const localeCode = (locale: Locale): string => (locale === "ar" ? "ar-JO" : "en-US");

export function formatDate(date: Date | string, locale: Locale = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeCode(locale), { year: "numeric", month: "long", day: "numeric" });
}

export function formatTime(date: Date | string, locale: Locale = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(localeCode(locale), { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(date: Date | string, locale: Locale = "ar"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export function getTodayString(): string { return new Date().toISOString().split("T")[0]; }
export function addMinutes(date: Date, minutes: number): Date { return new Date(date.getTime() + minutes * 60000); }
