"use client";

export type SupportedLanguage = "ar" | "en";
export type SupportedDirection = "rtl" | "ltr";

export interface SystemPreferences {
  language: SupportedLanguage;
  direction: SupportedDirection;
  timezone: string;
  currency: string;
}

export interface SystemPreferencesUpdateInput {
  language?: SupportedLanguage;
  direction?: SupportedDirection;
  timezone?: string;
  currency?: string;
}

/** Canonical business/configuration codes only. User-facing labels belong to i18n catalogs. */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["ar", "en"];
export const SUPPORTED_DIRECTIONS: SupportedDirection[] = ["rtl", "ltr"];

export const SUPPORTED_TIMEZONES: string[] = [
  "UTC", "Asia/Riyadh", "Asia/Dubai", "Asia/Kuwait", "Asia/Qatar", "Asia/Bahrain", "Asia/Muscat", "Asia/Amman",
  "Asia/Beirut", "Asia/Damascus", "Asia/Baghdad", "Asia/Jerusalem", "Africa/Cairo", "Europe/Istanbul", "Europe/London",
  "America/New_York", "America/Los_Angeles",
];

/** Canonical ISO 4217 currency codes. Labels are rendered through the locale catalog. */
export const SUPPORTED_CURRENCIES: string[] = ["SAR", "AED", "KWD", "QAR", "BHD", "OMR", "JOD", "USD", "EUR", "GBP", "EGP"];
