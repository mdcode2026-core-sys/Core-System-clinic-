"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { Role, RoleWithPermissions, PermissionRow } from "./roles.types";

const supabase = createClient();

/**
 * Fetch all roles visible to a tenant.
 * System roles (is_system_role = true) are always visible.
 * Tenant-specific roles (is_system_role = false + matching tenant_id) are visible.
 */
export function useRoles(tenantId: string | null) {
  return useQuery({
    queryKey: ["roles", tenantId],
    queryFn: async (): Promise<Role[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("roles")
        .select("id, role_key, role_name, role_name_ar, description, is_system_role, tenant_id, created_at")
        .or(`is_system_role.eq.true,and(tenant_id.eq.${tenantId},is_system_role.eq.false)`)
        .order("is_system_role", { ascending: false })
        .order("role_name", { ascending: true });

      if (error) {
        console.error("[useRoles] error:", error.message);
        throw new Error("Failed to load roles");
      }

      return (data ?? []) as Role[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch a single role with its full permission set.
 */
export function useRoleWithPermissions(roleId: string | null) {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async (): Promise<RoleWithPermissions | null> => {
      if (!roleId) return null;

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id, role_key, role_name, role_name_ar, description, is_system_role, tenant_id, created_at")
        .eq("id", roleId)
        .maybeSingle();

      if (roleError || !roleData) {
        console.error("[useRoleWithPermissions] role error:", roleError?.message);
        return null;
      }

      // Fetch permissions via role_permissions join
      const { data: permData, error: permError } = await supabase
        .from("role_permissions")
        .select(`
          id,
          permission_id,
          permissions:permission_id (
            id, permission_key, permission_name, resource, action, description
          )
        `)
        .eq("role_id", roleId);

      if (permError) {
        console.error("[useRoleWithPermissions] permissions error:", permError.message);
      }

      const permissions: PermissionRow[] = (permData ?? [])
        .map((rp: any) => rp.permissions)
        .filter(Boolean);

      return {
        ...(roleData as Role),
        permissions,
      };
    },
    enabled: !!roleId,
  });
}

/**
 * Fetch all available permissions from the catalog.
 */
export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ["permissions-catalog"],
    queryFn: async (): Promise<PermissionRow[]> => {
      const { data, error } = await supabase
        .from("permissions")
        .select("id, permission_key, permission_name, resource, action, description")
        .order("resource", { ascending: true })
        .order("action", { ascending: true });

      if (error) {
        console.error("[usePermissionsCatalog] error:", error.message);
        throw new Error("Failed to load permissions catalog");
      }

      return (data ?? []) as PermissionRow[];
    },
  });
}
