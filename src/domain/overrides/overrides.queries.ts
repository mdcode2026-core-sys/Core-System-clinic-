"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { PermissionOverride, UserWithOverrides } from "./overrides.types";

const supabase = createClient();

/**
 * Fetch all permission overrides for a specific user.
 */
export function useUserPermissionOverrides(userId: string | null, tenantId: string | null) {
  return useQuery({
    queryKey: ["user-permission-overrides", userId, tenantId],
    queryFn: async (): Promise<PermissionOverride[]> => {
      if (!userId || !tenantId) return [];

      const { data, error } = await supabase
        .from("clinic_user_permission_overrides")
        .select(`
          id,
          tenant_id,
          user_id,
          permission_id,
          granted,
          created_by,
          created_at,
          updated_at,
          permissions:permission_id (
            id, permission_key, permission_name, resource, action
          )
        `)
        .eq("user_id", userId)
        .eq("tenant_id", tenantId);

      if (error) {
        console.error("[useUserPermissionOverrides] error:", error.message);
        throw new Error("Failed to load permission overrides");
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        tenant_id: row.tenant_id,
        user_id: row.user_id,
        permission_id: row.permission_id,
        permission_key: row.permissions?.[0]?.permission_key ?? "",
        permission_name: row.permissions?.[0]?.permission_name ?? "",
        resource: row.permissions?.[0]?.resource ?? "",
        action: row.permissions?.[0]?.action ?? "",
        granted: row.granted,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as PermissionOverride[];
    },
    enabled: !!userId && !!tenantId,
  });
}

/**
 * Fetch all clinic users with their overrides for the current tenant.
 */
export function useClinicUsersWithOverrides(tenantId: string | null) {
  return useQuery({
    queryKey: ["clinic-users-with-overrides", tenantId],
    queryFn: async (): Promise<UserWithOverrides[]> => {
      if (!tenantId) return [];

      // Fetch users with role info
      const { data: usersData, error: usersError } = await supabase
        .from("clinic_users")
        .select(`
          id,
          full_name,
          email,
          role,
          is_active,
          roles:role_template_id (
            id, role_name, role_name_ar
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (usersError) {
        console.error("[useClinicUsersWithOverrides] users error:", usersError.message);
        throw new Error("Failed to load clinic users");
      }

      // Fetch all overrides for this tenant
      const { data: overridesData, error: overridesError } = await supabase
        .from("clinic_user_permission_overrides")
        .select(`
          id,
          tenant_id,
          user_id,
          permission_id,
          granted,
          created_by,
          created_at,
          updated_at,
          permissions:permission_id (
            id, permission_key, permission_name, resource, action
          )
        `)
        .eq("tenant_id", tenantId);

      if (overridesError) {
        console.error("[useClinicUsersWithOverrides] overrides error:", overridesError.message);
        throw new Error("Failed to load permission overrides");
      }

      // Map overrides by user_id
      const overridesByUser = new Map<string, PermissionOverride[]>();
      for (const row of (overridesData ?? [])) {
        const override: PermissionOverride = {
          id: row.id,
          tenant_id: row.tenant_id,
          user_id: row.user_id,
          permission_id: row.permission_id,
          permission_key: row.permissions?.[0]?.permission_key ?? "",
          permission_name: row.permissions?.[0]?.permission_name ?? "",
          resource: row.permissions?.[0]?.resource ?? "",
          action: row.permissions?.[0]?.action ?? "",
          granted: row.granted,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
        if (!overridesByUser.has(row.user_id)) {
          overridesByUser.set(row.user_id, []);
        }
        overridesByUser.get(row.user_id)!.push(override);
      }

      return (usersData ?? []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        role: row.role,
        role_name: row.roles?.role_name ?? null,
        role_name_ar: row.roles?.role_name_ar ?? null,
        is_active: row.is_active,
        overrides: overridesByUser.get(row.id) ?? [],
      })) as UserWithOverrides[];
    },
    enabled: !!tenantId,
  });
}
