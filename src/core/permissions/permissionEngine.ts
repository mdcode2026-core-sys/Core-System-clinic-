"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { Permission } from "./types";

/** Clinic Admin is the tenant's unrestricted administrative role for the current foundation phase. */
export async function isClinicAdminUser(userId: string, tenantId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_users")
    .select("roles!clinic_users_role_id_fkey(role_key)")
    .eq("auth_user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return false;
  const role = Array.isArray(data.roles) ? data.roles[0] : data.roles;
  return (role as { role_key?: string } | null)?.role_key === "clinic_admin";
}

/**
 * Canonical permission resolution: clinic_users.role_id is the only role source.
 * role_template_id is retained only for compatibility elsewhere and is never used here.
 * Order is role -> direct grants -> latest explicit override, matching DB has_tenant_permission().
 */
export async function getEffectivePermissions(userId: string, tenantId: string): Promise<Permission[]> {
  const supabase = await createClient();
  const { data: clinicUser, error: userError } = await supabase
    .from("clinic_users")
    .select("id, tenant_id, role_id, is_active, roles!clinic_users_role_id_fkey(role_key)")
    .eq("auth_user_id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (userError || !clinicUser || !clinicUser.is_active || clinicUser.tenant_id !== tenantId || !clinicUser.role_id) return [];

  const role = Array.isArray(clinicUser.roles) ? clinicUser.roles[0] : clinicUser.roles;
  const roleKey = (role as { role_key?: string } | null)?.role_key;

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
  const { data: rolePerms } = await supabase
    .from("role_permissions")
    .select("permissions(permission_key)")
    .eq("role_id", clinicUser.role_id);
  for (const rp of rolePerms ?? []) {
    const key = (rp.permissions as { permission_key?: string } | null)?.permission_key;
    if (key) permissions.add(key);
  }

  const { data: directPerms } = await supabase
    .from("clinic_user_permissions")
    .select("granted, permissions(permission_key)")
    .eq("user_id", clinicUser.id)
    .eq("tenant_id", tenantId)
    .is("deleted_at", null);
  for (const item of directPerms ?? []) {
    const key = (item.permissions as { permission_key?: string } | null)?.permission_key;
    if (!key) continue;
    if (item.granted) permissions.add(key); else permissions.delete(key);
  }

  const { data: overrides } = await supabase
    .from("clinic_user_permission_overrides")
    .select("granted, permissions(permission_key)")
    .eq("user_id", clinicUser.id)
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const seenOverrides = new Set<string>();
  for (const item of overrides ?? []) {
    const key = (item.permissions as { permission_key?: string } | null)?.permission_key;
    if (!key || seenOverrides.has(key)) continue;
    seenOverrides.add(key);
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
