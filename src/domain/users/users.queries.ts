"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { ClinicUserWithRole } from "./users.types";

const supabase = createClient();

/**
 * Fetch all clinic users for the current tenant, joined with role info.
 */
export function useClinicUsers(tenantId: string | null) {
  return useQuery({
    queryKey: ["clinic-users", tenantId],
    queryFn: async (): Promise<ClinicUserWithRole[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("clinic_users")
        .select(`
          id,
          auth_user_id,
          tenant_id,
          role,
          role_template_id,
          full_name,
          phone,
          email,
          is_active,
          created_at,
          updated_at,
          roles:role_template_id (
            id, role_name, role_name_ar, is_system_role
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useClinicUsers] error:", error.message);
        throw new Error("Failed to load clinic users");
      }

      return (data ?? []).map((row: any) => ({
        ...row,
        role_name: row.roles?.role_name ?? null,
        role_name_ar: row.roles?.role_name_ar ?? null,
        is_system_role: row.roles?.is_system_role ?? true,
      })) as ClinicUserWithRole[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch a single clinic user by ID.
 */
export function useClinicUser(userId: string | null, tenantId: string | null) {
  return useQuery({
    queryKey: ["clinic-user", userId, tenantId],
    queryFn: async (): Promise<ClinicUserWithRole | null> => {
      if (!userId || !tenantId) return null;

      const { data, error } = await supabase
        .from("clinic_users")
        .select(`
          id,
          auth_user_id,
          tenant_id,
          role,
          role_template_id,
          full_name,
          phone,
          email,
          is_active,
          created_at,
          updated_at,
          roles:role_template_id (
            id, role_name, role_name_ar, is_system_role
          )
        `)
        .eq("id", userId)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (error) {
        console.error("[useClinicUser] error:", error.message);
        throw new Error("Failed to load clinic user");
      }

      if (!data) return null;

      return {
        ...data,
        role_name: data.roles?.[0]?.role_name ?? null,
        role_name_ar: data.roles?.[0]?.role_name_ar ?? null,
        is_system_role: data.roles?.[0]?.is_system_role ?? true,
      } as ClinicUserWithRole;
    },
    enabled: !!userId && !!tenantId,
  });
}
