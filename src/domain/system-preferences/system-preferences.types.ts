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

/**
 * Canonical ISO 4217 currency codes: Arab League currencies plus USD and EUR.
 * User-facing currency names/symbols are rendered through the active locale.
 */
export const SUPPORTED_CURRENCIES: string[] = [
  "DZD", "BHD", "KMF", "DJF", "EGP", "IQD", "JOD", "KWD", "LBP", "LYD", "MAD", "MRU", "OMR", "QAR", "SAR", "SOS", "SDG", "SYP", "TND", "AED", "YER", "USD", "EUR",
];
