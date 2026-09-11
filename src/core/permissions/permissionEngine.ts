"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { Permission } from "./types";

export async function isClinicAdminUser(userId: string, tenantId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_users")
    .select("roles!clinic_users_role_id_fkey(role_key)")
    .eq("auth_user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return false;
  const role = Array.isArray(data.roles) ? data.roles[0] : data.roles;
  return (role as { role_key?: string } | null)?.role_key === "clinic_admin";
}

/**
 * Canonical permission resolution is owned by the database permission engine.
 * Subscription is the ceiling; role/direct grants and the latest override are
 * resolved server-side by get_effective_permissions().
 *
 * Communications domain entry is a baseline tenant capability rather than an
 * Admin-granted read permission. Action permissions such as send/manage/request
 * remain governed by the normal effective-permission engine.
 */
export async function getEffectivePermissions(userId: string, tenantId: string): Promise<Permission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_effective_permissions", {
    p_user_id: userId,
    p_tenant_id: tenantId,
  });

  if (error || !Array.isArray(data)) return [];
  const resolved = data.filter((key): key is Permission => typeof key === "string") as Permission[];
  return resolved.includes("communications:read") ? resolved : [...resolved, "communications:read"];
}

export async function hasEffectivePermission(permission: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: tenantId, error } = await supabase.rpc("get_current_tenant_id");
  if (error || !tenantId) return false;

  const { data, error: permissionError } = await supabase.rpc("has_effective_permission", {
    p_permission_key: permission,
    p_user_id: userId,
  });

  return permissionError ? false : data === true;
}
