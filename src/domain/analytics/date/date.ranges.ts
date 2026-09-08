import type { DateRange, DatePreset } from "../analytics.types";

type Parts = { year: number; month: number; day: number };

function localParts(date: Date, timezone: string): Parts {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
  };
}

function isoDate({ year, month, day }: Parts): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value: string): Parts {
  const [year, month, day] = value.split("-").map(Number);
  if (![year, month, day].every(Number.isInteger)) throw new Error(`Invalid analytics date: ${value}`);
  return { year, month, day };
}

function addMonths(parts: Parts, months: number): Parts {
  const zeroBased = parts.year * 12 + (parts.month - 1) + months;
  const year = Math.floor(zeroBased / 12);
  const month = zeroBased - year * 12 + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day: Math.min(parts.day, lastDay) };
}

function addDays(parts: Parts, days: number): Parts {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function startOfWeekMonday(parts: Parts): Parts {
  const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return addDays(parts, day === 0 ? -6 : 1 - day);
}

function startOfMonth(parts: Parts): Parts { return { year: parts.year, month: parts.month, day: 1 }; }
function startOfQuarter(parts: Parts): Parts { return { year: parts.year, month: Math.floor((parts.month - 1) / 3) * 3 + 1, day: 1 }; }

function toUtcBoundary(parts: Parts, timezone: string): Date {
  const naiveUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const rendered = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(naiveUtc);
  const values = Object.fromEntries(rendered.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return new Date(naiveUtc.getTime() - (asUtc - naiveUtc.getTime()));
}

export function explicitDateRange(from: string, to: string, timezone = "UTC"): DateRange {
  const fromParts = parseDate(from);
  const toParts = parseDate(to);
  const fromDate = isoDate(fromParts);
  const toDate = isoDate(toParts);
  if (fromDate > toDate) throw new Error("Analytics date range start must not be after end");
  return {
    from: fromDate,
    to: toDate,
    startAt: toUtcBoundary(fromParts, timezone).toISOString(),
    endAtExclusive: toUtcBoundary(addDays(toParts, 1), timezone).toISOString(),
    timezone,
  };
}

export async function resolveDateRange(preset: DatePreset, timezone = "UTC", customFrom?: string, customTo?: string): Promise<DateRange> {
  if (preset === "custom") {
    if (!customFrom || !customTo) throw new Error("Custom analytics range requires from and to");
    return explicitDateRange(customFrom, customTo, timezone);
  }

  const current = localParts(new Date(), timezone);
  let from: Parts;
  let to: Parts;

  switch (preset) {
    case "today": from = current; to = current; break;
    case "yesterday": from = addDays(current, -1); to = from; break;
    case "this_week": from = startOfWeekMonday(current); to = addDays(from, 6); break;
    case "last_week": { to = addDays(startOfWeekMonday(current), -1); from = addDays(to, -6); break; }
    case "this_month": { from = startOfMonth(current); to = addDays(addMonths(from, 1), -1); break; }
    case "last_month": { to = addDays(startOfMonth(current), -1); from = startOfMonth(to); break; }
    case "this_quarter": { from = startOfQuarter(current); to = addDays(addMonths(from, 3), -1); break; }
    default: throw new Error(`Unknown date preset: ${preset}`);
  }
  return explicitDateRange(isoDate(from), isoDate(to), timezone);
}
