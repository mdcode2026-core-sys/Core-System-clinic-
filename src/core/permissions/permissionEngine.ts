"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { Permission } from "./types";

export async function getEffectivePermissions(userId: string, tenantId: string): Promise<Permission[]> {
  const supabase = await createClient();
  const { data: clinicUser, error: userError } = await supabase
    .from("clinic_users")
    .select("id, tenant_id, role_id, role_template_id, is_active")
    .eq("auth_user_id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (userError || !clinicUser || !clinicUser.is_active || clinicUser.tenant_id !== tenantId) return [];

  const roleId = clinicUser.role_id ?? clinicUser.role_template_id;
  if (!roleId) return [];

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
