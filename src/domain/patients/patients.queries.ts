"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { Patient, PatientHistory } from "./patients.types";

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

export function usePatientById(patientId: string | null) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_patients")
        .select("*")
        .eq("id", patientId)
        .single();
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!patientId,
  });
}

export function usePatientHistory(patientId: string | null) {
  return useQuery({
    queryKey: ["patient-history", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_history")
        .select("*")
        .eq("patient_id", patientId)
        .single();
      if (error) throw error;
      return data as PatientHistory;
    },
    enabled: !!patientId,
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { data, error } = await supabase
        .from("clinic_patients")
        .update({ 
          deleted_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients", variables.tenantId] });
    },
  });
}

export function useInvalidatePatients() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: (tenantId?: string) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: ["patients", tenantId] });
      }
    },
    invalidatePatient: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient-history", patientId] });
    },
  };
}
