"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

const supabase = createClient();

export function useDailySnapshot(tenantId: string | null, date: string) {
  return useQuery({
    queryKey: ["analytics", "daily", tenantId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_daily_snapshots")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("snapshot_date", date)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !!date,
  });
}
