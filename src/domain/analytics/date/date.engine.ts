"use server";

import { resolveDateRange } from "./date.ranges";
import type { DateRange, DatePreset } from "../analytics.types";

export const dateEngine = {
  resolve(preset: DatePreset): DateRange {
    return resolveDateRange(preset);
  },
};
