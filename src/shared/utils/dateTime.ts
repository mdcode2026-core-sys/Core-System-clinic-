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

export function formatDate(date: Date | string, locale: Locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeCode(locale), {
    ...numericOptions,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string, locale: Locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(localeCode(locale), {
    ...numericOptions,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string, locale: Locale = "en"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export function getTodayString(): string { return new Date().toISOString().split("T")[0]; }
export function addMinutes(date: Date, minutes: number): Date { return new Date(date.getTime() + minutes * 60000); }

/** Convert a tenant-local wall-clock datetime (without offset) to an absolute UTC ISO timestamp. */
export function tenantLocalToUtc(value: string, timeZone: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error("Invalid datetime");
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(normalized)) return new Date(normalized).toISOString();

  const wallClockAsUtc = new Date(`${normalized}Z`);
  if (Number.isNaN(wallClockAsUtc.getTime())) throw new Error("Invalid datetime");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(wallClockAsUtc);
  const p = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const renderedUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  const offsetMs = renderedUtc - wallClockAsUtc.getTime();
  return new Date(wallClockAsUtc.getTime() - offsetMs).toISOString();
}

/** Format an absolute UTC datetime for editing as tenant-local date/time inputs. */
export function utcToTenantInput(value: string, timeZone: string): { date: string; time: string } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid datetime");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const p = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

export function formatDateInTimeZone(date: Date | string, locale: Locale = "en", timeZone = "UTC"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeCode(locale), { ...numericOptions, timeZone, year: "numeric", month: "long", day: "numeric" });
}

export function formatTimeInTimeZone(date: Date | string, locale: Locale = "en", timeZone = "UTC"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(localeCode(locale), { ...numericOptions, timeZone, hour: "2-digit", minute: "2-digit" });
}
