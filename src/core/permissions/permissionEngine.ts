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

  // During the foundation phase, Clinic Admin must see and administer the complete tenant platform surface.
  // Subscription/entitlement gating is intentionally deferred to the later commercial model.
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
