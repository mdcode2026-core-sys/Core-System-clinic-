"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { AgendaEvent, AgendaEventInsert } from "./agenda.types";

const supabase = createClient();

export function useAgendaEvents(tenantId: string | null, date: string) {
  return useQuery({
    queryKey: ["agenda", tenantId, date],
    queryFn: async () => {
      const startOfDay = `${date}T00:00:00Z`;
      const endOfDay = `${date}T23:59:59Z`;
      const { data, error } = await supabase
        .from("master_agenda_events")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("scheduled_start", startOfDay)
        .lte("scheduled_start", endOfDay)
        .not("status", "in", "(cancelled,no_show)")
        .order("scheduled_start");
      if (error) throw error;
      return data as AgendaEvent[];
    },
    enabled: !!tenantId && !!date,
  });
}

export function useCreateAgendaEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: AgendaEventInsert) => {
      const { data, error } = await supabase
        .from("master_agenda_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agenda", variables.tenant_id] });
    },
  });
}
