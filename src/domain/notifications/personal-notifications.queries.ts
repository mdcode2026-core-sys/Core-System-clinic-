"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

export interface PersonalNotificationItem {
  id: string;
  title: string;
  message: string | null;
  created_at: string;
  is_read: boolean;
}

export interface PersonalNotificationFeed {
  unread_count: number;
  items: PersonalNotificationItem[];
}

const supabase = createClient();
const QUERY_KEY = ["personal-notification-feed"];

export function usePersonalNotificationFeed() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<PersonalNotificationFeed> => {
      const { data, error } = await supabase.rpc("get_personal_notification_feed", {
        p_limit: 8,
      });

      if (error) {
        console.error("[usePersonalNotificationFeed]", error.message);
        throw new Error("Failed to load notifications");
      }

      const result = (data ?? {}) as Partial<PersonalNotificationFeed>;
      return {
        unread_count: Number(result.unread_count ?? 0),
        items: Array.isArray(result.items) ? (result.items as PersonalNotificationItem[]) : [],
      };
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useInvalidatePersonalNotificationFeed() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
}
