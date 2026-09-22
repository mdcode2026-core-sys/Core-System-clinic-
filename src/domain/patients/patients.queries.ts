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


export interface PatientVisitContinuity {
  id: string;
  patient_id: string;
  session_status: string;
  session_started_at: string | null;
  session_ended_at: string | null;
  visit_closed_at: string | null;
  agenda_event_id: string | null;
  created_at: string;
}

export function usePatientVisits(patientId: string | null) {
  return useQuery({
    queryKey: ["patient-visits", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_visit_sessions")
        .select("id,patient_id,session_status,session_started_at,session_ended_at,visit_closed_at,agenda_event_id,created_at")
        .eq("patient_id", patientId)
        .eq("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PatientVisitContinuity[];
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
      void queryClient.refetchQueries({ queryKey: ["patients", variables.tenantId], type: "active" });
    },
  });
}

export function useInvalidatePatients() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: (tenantId?: string) => {
      const queryKey = tenantId ? ["patients", tenantId] : ["patients"];
      void queryClient.refetchQueries({ queryKey, type: "active" });
    },
    invalidatePatient: (patientId: string) => {
      void queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      void queryClient.invalidateQueries({ queryKey: ["patient-history", patientId] });
    },
  };
}
