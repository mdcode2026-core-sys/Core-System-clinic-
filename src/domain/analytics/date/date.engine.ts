import { resolveDateRange, explicitDateRange } from "./date.ranges";
import type { DateRange, DatePreset } from "../analytics.types";

export const dateEngine = {
  async resolve(preset: DatePreset, timezone: string, customFrom?: string, customTo?: string): Promise<DateRange> {
    return resolveDateRange(preset, timezone, customFrom, customTo);
  },
  fromDates(from: string, to: string, timezone: string): DateRange {
    return explicitDateRange(from, to, timezone);
  },
};
