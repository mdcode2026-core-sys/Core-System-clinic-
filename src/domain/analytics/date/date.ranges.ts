import type { DateRange, DatePreset } from "../analytics.types";

export async function resolveDateRange(preset: DatePreset): Promise<DateRange> {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (preset === "today") {
    return { from: todayStr, to: todayStr };
  }

  if (preset === "this_month") {
    const firstDay = `${yyyy}-${mm}-01`;
    const lastDay = new Date(yyyy, today.getMonth() + 1, 0);
    const lastDayStr = `${yyyy}-${mm}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return { from: firstDay, to: lastDayStr };
  }

  throw new Error(`Unknown date preset: ${preset}`);
}
