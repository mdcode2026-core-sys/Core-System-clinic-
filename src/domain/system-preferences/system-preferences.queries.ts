"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { SystemPreferences } from "./system-preferences.types";

const supabase = createClient();

export function useSystemPreferences(tenantId: string | null) {
  return useQuery({
    queryKey: ["system-preferences", tenantId],
    queryFn: async (): Promise<SystemPreferences | null> => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from("master_tenants")
        .select("language, direction, timezone, currency")
        .eq("id", tenantId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[useSystemPreferences] error:", error.message);
        throw new Error("Failed to load system preferences");
      }

      if (!data) return null;

      return {
        language: (data.language as "ar" | "en") ?? "en",
        direction: (data.direction as "rtl" | "ltr") ?? "ltr",
        timezone: data.timezone ?? "Asia/Riyadh",
        currency: data.currency ?? "SAR",
      };
    },
    enabled: !!tenantId,
  });
}
