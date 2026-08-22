"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

const supabase = createClient();

export function useRooms(tenantId: string | null, options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false;

  return useQuery({
    queryKey: ["rooms", "management", tenantId, includeInactive],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("clinic_rooms")
        .select("id, tenant_id, room_name, room_type, floor_number, capacity, is_active, created_at, updated_at")
        .eq("tenant_id", tenantId)
        .order("room_name");

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenantId,
  });
}
