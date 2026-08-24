import type { Locale } from "@/core/i18n/messages";

/**
 * Global formatting policy:
 * - language is independent from country/market
 * - Arabic and English are the UI locales
 * - Western digits (0123456789) are mandatory in both languages
 * - currency is an explicit business preference and must be supplied by the caller
 */
const localeCode = (locale: Locale): string => (locale === "ar" ? "ar" : "en-US");

export function formatCurrency(subunits: number, currency: string, locale: Locale = "en"): string {
  const amount = subunits / 100;
  return new Intl.NumberFormat(localeCode(locale), {
    style: "currency",
    currency,
    numberingSystem: "latn",
  }).format(amount);
}

export function subunitsToUnits(subunits: number): number { return subunits / 100; }
export function unitsToSubunits(units: number): number { return Math.round(units * 100); }
