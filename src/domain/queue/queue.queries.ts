"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

const supabase = createClient();

export function useLiveQueue(tenantId: string | null) {
  return useQuery({
    queryKey: ["queue", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_visit_sessions")
        .select(`
          *,
          clinic_patients(first_name, last_name, phone_primary, patient_status),
          clinic_users!clinic_visit_sessions_doctor_id_fkey(full_name)
        `)
        .eq("tenant_id", tenantId)
        .in("session_status", ["waiting", "in_consultation", "pending_close"])
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
    refetchInterval: 5000,
  });
}

export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("clinic_visit_sessions")
        .update({ session_status: status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}
