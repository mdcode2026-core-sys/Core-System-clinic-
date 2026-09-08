import { resolveDateRange } from "./date.ranges";
import type { DateRange, DatePreset } from "../analytics.types";

export const dateEngine = {
  async resolve(preset: DatePreset, timezone: string): Promise<DateRange> {
    return resolveDateRange(preset, timezone);
  },
};
