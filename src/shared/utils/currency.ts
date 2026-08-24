import type { Locale } from "@/core/i18n/messages";

const localeCode = (locale: Locale): string => (locale === "ar" ? "ar-JO" : "en-US");

export function formatCurrency(
  subunits: number,
  currency = "JOD",
  locale: Locale = "ar",
): string {
  const amount = subunits / 100;
  return new Intl.NumberFormat(localeCode(locale), {
    style: "currency",
    currency,
  }).format(amount);
}

export function subunitsToUnits(subunits: number): number {
  return subunits / 100;
}

export function unitsToSubunits(units: number): number {
  return Math.round(units * 100);
}
