"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { Patient, PatientInsert, PatientUpdate } from "./patients.types";

const supabase = createClient();

export function usePatients(tenantId: string | null) {
  return useQuery({
    queryKey: ["patients", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_patients")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!tenantId,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: PatientInsert) => {
      const { data, error } = await supabase
        .from("clinic_patients")
        .insert(patient)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients", variables.tenant_id] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: PatientUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("clinic_patients")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
