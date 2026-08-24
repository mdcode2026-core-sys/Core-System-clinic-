import type { Locale } from "@/core/i18n/messages";

/**
 * Global application language policy. Country/market and timezone are
 * independent settings; Arabic must not imply Jordanian regional formatting.
 * Western digits are mandatory in both supported UI languages.
 */
const localeCode = (locale: Locale): string => (locale === "ar" ? "ar" : "en-US");

const numericOptions = {
  numberingSystem: "latn" as const,
};

export function formatDate(date: Date | string, locale: Locale = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeCode(locale), {
    ...numericOptions,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string, locale: Locale = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(localeCode(locale), {
    ...numericOptions,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string, locale: Locale = "ar"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export function getTodayString(): string { return new Date().toISOString().split("T")[0]; }
export function addMinutes(date: Date, minutes: number): Date { return new Date(date.getTime() + minutes * 60000); }
