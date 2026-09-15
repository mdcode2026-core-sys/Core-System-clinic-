"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { Patient, PatientHistory } from "./patients.types";

const supabase = createClient();

/**
 * TanStack Query can cancel a query by aborting its signal. The pinned
 * Supabase client version used by this repository does not expose the
 * PostgREST `.abortSignal()` modifier in its TypeScript surface, so we
 * consume the signal at the Promise boundary instead. This prevents a
 * superseded read from publishing its result back into the query cache.
 */
function withAbortSignal<T>(promise: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new DOMException("The operation was aborted.", "AbortError"));
    };

    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener("abort", onAbort, { once: true });

    Promise.resolve(promise).then(
      (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      },
    );
  });
}

export function usePatients(tenantId: string | null) {
  return useQuery({
    queryKey: ["patients", tenantId],
    queryFn: async ({ signal }) => {
      const result = supabase
        .from("clinic_patients")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      const { data, error } = await withAbortSignal(result, signal);
      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!tenantId,
  });
}

export function usePatientById(patientId: string | null) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async ({ signal }) => {
      const result = supabase
        .from("clinic_patients")
        .select("*")
        .eq("id", patientId)
        .single();
      const { data, error } = await withAbortSignal(result, signal);
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!patientId,
  });
}

export function usePatientHistory(patientId: string | null) {
  return useQuery({
    queryKey: ["patient-history", patientId],
    queryFn: async ({ signal }) => {
      const result = supabase
        .from("patient_history")
        .select("*")
        .eq("patient_id", patientId)
        .single();
      const { data, error } = await withAbortSignal(result, signal);
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
