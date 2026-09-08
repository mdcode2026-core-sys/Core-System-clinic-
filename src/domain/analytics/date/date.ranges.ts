import type { DateRange, DatePreset } from "../analytics.types";

type Parts = { year: number; month: number; day: number };

function localParts(date: Date, timezone: string): Parts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
  };
}

function isoDate({ year, month, day }: Parts): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(parts: Parts, days: number): Parts {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function startOfWeekMonday(parts: Parts): Parts {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const day = d.getUTCDay();
  const delta = day === 0 ? -6 : 1 - day;
  return addDays(parts, delta);
}

function startOfMonth(parts: Parts): Parts {
  return { year: parts.year, month: parts.month, day: 1 };
}

function startOfQuarter(parts: Parts): Parts {
  return { year: parts.year, month: Math.floor((parts.month - 1) / 3) * 3 + 1, day: 1 };
}

function toUtcBoundary(parts: Parts, timezone: string): Date {
  const naiveUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const rendered = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(naiveUtc);
  const values = Object.fromEntries(rendered.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  const offset = asUtc - naiveUtc.getTime();
  return new Date(naiveUtc.getTime() - offset);
}

export async function resolveDateRange(preset: DatePreset, timezone = "UTC"): Promise<DateRange> {
  const now = new Date();
  const current = localParts(now, timezone);

  let from: Parts;
  let to: Parts;

  switch (preset) {
    case "today":
      from = current;
      to = current;
      break;
    case "yesterday":
      from = addDays(current, -1);
      to = from;
      break;
    case "this_week":
      from = startOfWeekMonday(current);
      to = addDays(from, 6);
      break;
    case "last_week":
      to = addDays(startOfWeekMonday(current), -1);
      from = addDays(to, -6);
      break;
    case "this_month":
      from = startOfMonth(current);
      to = addDays({ year: current.year, month: current.month + 1 > 12 ? 1 : current.month + 1, day: 1 }, -1);
      if (current.month === 12) from = { year: current.year, month: 1, day: 1 };
      break;
    case "last_month": {
      const thisMonth = startOfMonth(current);
      to = addDays(thisMonth, -1);
      from = startOfMonth(to);
      break;
    }
    case "this_quarter":
      from = startOfQuarter(current);
      to = addDays(addDays(startOfQuarter(current), 90), -1);
      while (isoDate(to).slice(0, 7) === isoDate(addDays(to, 1)).slice(0, 7)) to = addDays(to, -1);
      // Explicit calendar calculation avoids assuming every quarter has 90 days.
      const quarterEndMonth = from.month + 2;
      const quarterEndYear = from.year + (quarterEndMonth > 12 ? 1 : 0);
      const normalizedEndMonth = quarterEndMonth > 12 ? quarterEndMonth - 12 : quarterEndMonth;
      to = addDays({ year: quarterEndYear, month: normalizedEndMonth + 1 > 12 ? 1 : normalizedEndMonth + 1, day: 1 }, -1);
      break;
    case "custom":
      throw new Error("Custom date ranges require an explicit from/to range");
    default:
      throw new Error(`Unknown date preset: ${preset}`);
  }

  const fromDate = isoDate(from);
  const toDate = isoDate(to);
  const startAt = toUtcBoundary(from, timezone).toISOString();
  const endAtExclusive = toUtcBoundary(addDays(to, 1), timezone).toISOString();

  return { from: fromDate, to: toDate, startAt, endAtExclusive, timezone };
}
