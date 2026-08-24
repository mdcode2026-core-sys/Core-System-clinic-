import type { Locale } from "@/core/i18n/messages";

/**
 * Application locale policy:
 * - language is independent from country/market
 * - Arabic and English are the only UI locales
 * - Western digits (0123456789) are mandatory in both languages
 * - currency is an independent business preference
 */
const localeCode = (locale: Locale): string => (locale === "ar" ? "ar" : "en-US");

export function formatCurrency(
  subunits: number,
  currency = "JOD",
  locale: Locale = "ar",
): string {
  const amount = subunits / 100;
  return new Intl.NumberFormat(localeCode(locale), {
    style: "currency",
    currency,
    numberingSystem: "latn",
  }).format(amount);
}

export function subunitsToUnits(subunits: number): number {
  return subunits / 100;
}

export function unitsToSubunits(units: number): number {
  return Math.round(units * 100);
}
