"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { Permission } from "./types";

/**
 * Clinic Admin is the tenant's operational administrator. During the current
 * foundation phase the role is intentionally not constrained by the temporary
 * subscription/entitlement catalogue. Future commercial gating may restrict
 * tenant-facing features, but it must not silently remove Clinic Admin's
 * ability to see and administer the current tenant platform surface.
 */
export async function getEffectivePermissions(userId: string, tenantId: string): Promise<Permission[]> {
  const supabase = await createClient();
  const { data: clinicUser, error: userError } = await supabase
    .from("clinic_users")
    .select("id, tenant_id, role_id, role_template_id, is_active, roles!clinic_users_role_id_fkey(role_key)")
    .eq("auth_user_id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (userError || !clinicUser || !clinicUser.is_active || clinicUser.tenant_id !== tenantId) return [];

  const role = Array.isArray(clinicUser.roles) ? clinicUser.roles[0] : clinicUser.roles;
  const roleKey = (role as { role_key?: string } | null)?.role_key;
  const roleId = clinicUser.role_id ?? clinicUser.role_template_id;
  if (!roleId) return [];

  // Clinic Admin receives the complete permission catalogue for the tenant.
  // This is intentionally independent of the temporary subscription model.
  if (roleKey === "clinic_admin") {
    const { data: allPermissions, error: allPermissionsError } = await supabase
      .from("permissions")
      .select("permission_key");
    if (!allPermissionsError) {
      return (allPermissions ?? [])
        .map((p) => p.permission_key)
        .filter((key): key is string => typeof key === "string") as Permission[];
    }
  }

  const permissions = new Set<string>();
  const { data: rolePerms } = await supabase.from("role_permissions").select("permissions(permission_key)").eq("role_id", roleId);
  for (const rp of rolePerms ?? []) {
    const key = (rp.permissions as { permission_key?: string } | null)?.permission_key;
    if (key) permissions.add(key);
  }

  const { data: directPerms } = await supabase.from("clinic_user_permissions").select("granted, permissions(permission_key)").eq("user_id", clinicUser.id).eq("tenant_id", tenantId);
  for (const item of directPerms ?? []) {
    const key = (item.permissions as { permission_key?: string } | null)?.permission_key;
    if (!key) continue;
    if (item.granted) permissions.add(key); else permissions.delete(key);
  }

  const { data: overrides } = await supabase.from("clinic_user_permission_overrides").select("granted, permissions(permission_key)").eq("user_id", clinicUser.id).eq("tenant_id", tenantId);
  for (const item of overrides ?? []) {
    const key = (item.permissions as { permission_key?: string } | null)?.permission_key;
    if (!key) continue;
    if (item.granted) permissions.add(key); else permissions.delete(key);
  }

  return Array.from(permissions) as Permission[];
}

export async function hasEffectivePermission(permission: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: tenantId, error } = await supabase.rpc("get_current_tenant_id");
  if (error || !tenantId) return false;
  const permissions = await getEffectivePermissions(userId, tenantId);
  return permissions.includes(permission as Permission);
}
