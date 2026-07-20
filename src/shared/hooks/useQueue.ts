"use client";

// src/shared/hooks/useQueue.ts
// Phase 4 — Queue Management Module
// Realtime subscription + manual refresh for Queue

import { useEffect, useCallback } from "react";
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
          // تحديث React Query Cache
          queryClient.invalidateQueries({ queryKey: ["queue", tenantId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tenantId, queryClient]);
}

// ── دالة تحديث يدوي (تُستدعى بعد Server Actions) ───────────
export function useQueueRefresh() {
  const queryClient = useQueryClient();

  const refreshQueue = useCallback((tenantId?: string | null) => {
    if (tenantId) {
      queryClient.invalidateQueries({ queryKey: ["queue", tenantId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    }
  }, [queryClient]);

  return { refreshQueue };
}
