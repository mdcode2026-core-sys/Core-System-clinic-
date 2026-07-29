"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsOverview, getAnalyticsByCategory } from "./analytics.actions";
import type { KpiResult, DatePreset } from "./analytics.types";

export function useAnalyticsOverview(
  authUserId: string | null | undefined,
  datePreset: DatePreset = "today"
) {
  return useQuery({
    queryKey: ["analytics", "overview", authUserId, datePreset],
    queryFn: async () => {
      if (!authUserId) return [] as KpiResult[];
      return getAnalyticsOverview(authUserId, datePreset);
    },
    enabled: !!authUserId,
  });
}

export function useAnalyticsByCategory(
  authUserId: string | null | undefined,
  category: "patients" | "appointments" | "queue" | "revenue" | "invoices",
  datePreset: DatePreset = "today"
) {
  return useQuery({
    queryKey: ["analytics", "category", category, authUserId, datePreset],
    queryFn: async () => {
      if (!authUserId) return [] as KpiResult[];
      return getAnalyticsByCategory(authUserId, category, datePreset);
    },
    enabled: !!authUserId,
  });
}
