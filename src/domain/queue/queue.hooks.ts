"use client";

// src/domain/queue/queue.hooks.ts
// Client-side React Query wrappers around the queue.queries.ts server actions.
//
// This file was missing entirely — QueueWidget.tsx imported `useQueueStats`
// from "@/domain/queue/queue.queries", but that file is a Server Action
// module ("use server") and never exported any such hook. This wrapper
// closes that gap without adding any new business logic: it simply calls
// the existing getQueueStats() server action via useQuery.

import { useQuery } from "@tanstack/react-query";
import { getQueueStats } from "./queue.queries";
import type { QueueStats } from "./queue.types";

export function useQueueStats(tenantId: string) {
  return useQuery<QueueStats>({
    queryKey: ["queue", "stats", tenantId],
    queryFn: () => getQueueStats(),
    enabled: !!tenantId,
  });
}
