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

export const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string; labelEn: string }[] = [
  { value: "ar", label: "العربية", labelEn: "Arabic" },
  { value: "en", label: "English", labelEn: "English" },
];

export const SUPPORTED_DIRECTIONS: { value: SupportedDirection; label: string; labelEn: string }[] = [
  { value: "rtl", label: "من اليمين لليسار (RTL)", labelEn: "Right-to-Left (RTL)" },
  { value: "ltr", label: "من اليسار لليمين (LTR)", labelEn: "Left-to-Right (LTR)" },
];

export const SUPPORTED_TIMEZONES: string[] = [
  "UTC",
  "Asia/Riyadh",
  "Asia/Dubai",
  "Asia/Kuwait",
  "Asia/Qatar",
  "Asia/Bahrain",
  "Asia/Muscat",
  "Asia/Amman",
  "Asia/Beirut",
  "Asia/Damascus",
  "Asia/Baghdad",
  "Asia/Jerusalem",
  "Africa/Cairo",
  "Europe/Istanbul",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

export const SUPPORTED_CURRENCIES: { value: string; label: string; labelEn: string }[] = [
  { value: "SAR", label: "ريال سعودي", labelEn: "Saudi Riyal (SAR)" },
  { value: "AED", label: "درهم إماراتي", labelEn: "UAE Dirham (AED)" },
  { value: "KWD", label: "دينار كويتي", labelEn: "Kuwaiti Dinar (KWD)" },
  { value: "QAR", label: "ريال قطري", labelEn: "Qatari Riyal (QAR)" },
  { value: "BHD", label: "دينار بحريني", labelEn: "Bahraini Dinar (BHD)" },
  { value: "OMR", label: "ريال عماني", labelEn: "Omani Rial (OMR)" },
  { value: "JOD", label: "دينار أردني", labelEn: "Jordanian Dinar (JOD)" },
  { value: "USD", label: "دولار أمريكي", labelEn: "US Dollar (USD)" },
  { value: "EUR", label: "يورو", labelEn: "Euro (EUR)" },
  { value: "GBP", label: "جنيه إسترليني", labelEn: "British Pound (GBP)" },
  { value: "EGP", label: "جنيه مصري", labelEn: "Egyptian Pound (EGP)" },
];
