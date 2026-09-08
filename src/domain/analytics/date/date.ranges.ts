import type { DateRange, DatePreset } from "../analytics.types";

const ANALYTICS_TIME_ZONE = "Asia/Amman";

function getAmmanParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export async function resolveDateRange(preset: DatePreset): Promise<DateRange> {
  const { year, month, day } = getAmmanParts();
  const todayStr = `${year}-${pad(month)}-${pad(day)}`;

  if (preset === "today") {
    return { from: todayStr, to: todayStr };
  }

  if (preset === "this_month") {
    const firstDay = `${year}-${pad(month)}-01`;
    const lastDayNumber = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const lastDay = `${year}-${pad(month)}-${pad(lastDayNumber)}`;
    return { from: firstDay, to: lastDay };
  }

  throw new Error(`Unknown date preset: ${preset}`);
}
