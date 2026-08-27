"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { Role, RoleWithPermissions, PermissionRow } from "./roles.types";

const supabase = createClient();
const roleFields = "id, role_key, role_name, role_name_ar, description, is_system_role, tenant_id, workspace, created_at";

export function useRoles(tenantId: string | null) {
  return useQuery({
    queryKey: ["roles", tenantId],
    queryFn: async (): Promise<Role[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase.from("roles").select(roleFields).or(`is_system_role.eq.true,and(tenant_id.eq.${tenantId},is_system_role.eq.false)`).order("is_system_role", { ascending: false }).order("role_name", { ascending: true });
      if (error) throw new Error("Failed to load roles");
      return (data ?? []) as Role[];
    },
    enabled: !!tenantId,
  });
}

export function useRoleWithPermissions(roleId: string | null) {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async (): Promise<RoleWithPermissions | null> => {
      if (!roleId) return null;
      const { data: roleData, error: roleError } = await supabase.from("roles").select(roleFields).eq("id", roleId).maybeSingle();
      if (roleError || !roleData) return null;
      const { data: permData } = await supabase.from("role_permissions").select("id,permission_id,permissions:permission_id (id,permission_key,permission_name,resource,action,description)").eq("role_id", roleId);
      const permissions: PermissionRow[] = (permData ?? []).map((rp: any) => rp.permissions).filter(Boolean);
      return { ...(roleData as Role), permissions };
    },
    enabled: !!roleId,
  });
}

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ["permissions-catalog"],
    queryFn: async (): Promise<PermissionRow[]> => {
      const { data, error } = await supabase.from("permissions").select("id,permission_key,permission_name,resource,action,description").order("resource").order("action");
      if (error) throw new Error("Failed to load permissions catalog");
      return (data ?? []) as PermissionRow[];
    },
  });
}
