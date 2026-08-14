"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { ChannelPreference, NotificationChannel } from "./notification.types";

const supabase = createClient();

const ALL_CHANNELS: NotificationChannel[] = ["whatsapp", "sms", "email", "in_app"];

/**
 * Fetch notification channel preferences for the current tenant.
 * Returns a complete set: existing rows from DB + default-enabled
 * placeholders for any missing channels so the UI always has 4 items.
 */
export function useNotificationPreferences(tenantId: string | null) {
  return useQuery({
    queryKey: ["notification-preferences", tenantId],
    queryFn: async (): Promise<ChannelPreference[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("tenant_notification_channel_prefs")
        .select("id, tenant_id, channel, is_enabled, created_at, updated_at")
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[useNotificationPreferences] error:", error.message);
        throw new Error("Failed to load notification preferences");
      }

      const existing = new Map<NotificationChannel, ChannelPreference>();
      for (const row of (data ?? []) as any[]) {
        existing.set(row.channel as NotificationChannel, {
          id: row.id,
          tenant_id: row.tenant_id,
          channel: row.channel as NotificationChannel,
          is_enabled: row.is_enabled,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
      }

      // Ensure every supported channel is represented
      const complete: ChannelPreference[] = [];
      for (const ch of ALL_CHANNELS) {
        const found = existing.get(ch);
        if (found) {
          complete.push(found);
        } else {
          complete.push({
            id: "",
            tenant_id: tenantId,
            channel: ch,
            is_enabled: true,
            created_at: "",
            updated_at: "",
          });
        }
      }

      return complete;
    },
    enabled: !!tenantId,
  });
}
