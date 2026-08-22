"use client";

/**
 * PJ Stage 3 — Clinic Service Catalog Queries
 * Client-side React Query hooks for procedure management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { ClinicProcedure, ClinicProcedureInsert, ClinicProcedureUpdate } from "./procedures.types";

const supabase = createClient();

const procedureKeys = {
  all: ["procedures"] as const,
  tenant: (tenantId: string) => [...procedureKeys.all, tenantId] as const,
  detail: (tenantId: string, id: string) =>
    [...procedureKeys.tenant(tenantId), "detail", id] as const,
};

/**
 * List all procedures for a tenant.
 * @param includeInactive — when true, returns both active and inactive (for management)
 */
export function useProcedures(tenantId: string | null, opts?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...procedureKeys.tenant(tenantId ?? ""), opts],
    queryFn: async () => {
      if (!tenantId) return [];
      let query = supabase
        .from("clinic_procedures")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("display_order", { ascending: true })
        .order("procedure_name", { ascending: true });

      if (!opts?.includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ClinicProcedure[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch a single procedure by ID.
 */
export function useProcedure(tenantId: string | null, id: string | null) {
  return useQuery({
    queryKey: id && tenantId ? procedureKeys.detail(tenantId, id) : procedureKeys.all,
    queryFn: async () => {
      if (!tenantId || !id) return null;
      const { data, error } = await supabase
        .from("clinic_procedures")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ClinicProcedure | null;
    },
    enabled: !!tenantId && !!id,
  });
}

/**
 * Create a new procedure (client-side hook).
 */
export function useCreateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClinicProcedureInsert) => {
      const { data, error } = await supabase
        .from("clinic_procedures")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as ClinicProcedure;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procedureKeys.tenant(data.tenant_id) });
    },
  });
}

/**
 * Update an existing procedure (client-side hook).
 */
export function useUpdateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tenantId,
      updates,
    }: {
      id: string;
      tenantId: string;
      updates: ClinicProcedureUpdate;
    }) => {
      const { data, error } = await supabase
        .from("clinic_procedures")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data as ClinicProcedure;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procedureKeys.tenant(data.tenant_id) });
      queryClient.invalidateQueries({ queryKey: procedureKeys.detail(data.tenant_id, data.id) });
    },
  });
}

/**
 * Toggle procedure active state (client-side hook).
 */
export function useToggleProcedureActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tenantId,
      isActive,
    }: {
      id: string;
      tenantId: string;
      isActive: boolean;
    }) => {
      const { data, error } = await supabase
        .from("clinic_procedures")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();
      if (error) throw error;
      return data as ClinicProcedure;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: procedureKeys.tenant(data.tenant_id) });
    },
  });
}
