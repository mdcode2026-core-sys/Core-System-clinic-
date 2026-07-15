"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

export function useQueueSubscription(tenantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("queue_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clinic_visit_sessions",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["queue", tenantId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tenantId, queryClient]);
}
