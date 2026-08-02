"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { Permission } from "./types";

/**
 * Resolves a user's effective permissions by:
 * 1. Looking up the user's role in clinic_users (by auth_user_id, limit 1)
 * 2. Finding the matching role template in roles
 * 3. Collecting all permissions from role_permissions
 * 4. Applying any user-specific overrides from clinic_user_permission_overrides
 *
 * Fix: replaced .maybeSingle() with .limit(1) to handle duplicate rows gracefully.
 */
export async function getEffectivePermissions(
  userId: string,
  tenantId: string
): Promise<Permission[]> {
  const supabase = await createClient();

  // Step 1: Get the user's role from clinic_users
  // Use .limit(1) instead of .maybeSingle() to avoid "multiple rows" error
  const { data: clinicUsers, error: userError } = await supabase
    .from("clinic_users")
    .select("role, tenant_id")
    .eq("auth_user_id", userId)
    .limit(1);

  if (userError) {
    console.error("[permissionEngine] Failed to fetch clinic user:", userError.message);
    return [];
  }

  if (!clinicUsers || clinicUsers.length === 0) {
    console.warn("[permissionEngine] No clinic user found for auth_user_id:", userId);
    return [];
  }

  const clinicUser = clinicUsers[0];
  const roleKey = clinicUser.role;

  // Step 2: Get the role template ID from roles
  const { data: roleTemplate, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("role_key", roleKey)
    .maybeSingle();

  if (roleError) {
    console.error("[permissionEngine] Failed to fetch role template:", roleError.message);
    return [];
  }

  if (!roleTemplate) {
    console.warn("[permissionEngine] No role template found for key:", roleKey);
    return [];
  }

  // Step 3: Get all permissions mapped to this role
  const { data: rolePerms, error: rpError } = await supabase
    .from("role_permissions")
    .select("permissions(permission_key)")
    .eq("role_id", roleTemplate.id);

  if (rpError) {
    console.error("[permissionEngine] Failed to fetch role permissions:", rpError.message);
    return [];
  }

  // Build the base permission set from the role template
  const basePermissions = new Set<string>();
  for (const rp of rolePerms ?? []) {
    // @ts-expect-error — Supabase nested select returns permissions as an object
    const key = rp.permissions?.permission_key as string | undefined;
    if (key) {
      basePermissions.add(key);
    }
  }

  // Step 4: Apply user-specific overrides
  const { data: overrides, error: ovError } = await supabase
    .from("clinic_user_permission_overrides")
    .select("granted, permissions(permission_key)")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId);

  if (ovError) {
    console.error("[permissionEngine] Failed to fetch overrides:", ovError.message);
    // Continue with base permissions — don't fail entirely
  }

  for (const ov of overrides ?? []) {
    // @ts-expect-error — Supabase nested select returns permissions as an object
    const key = ov.permissions?.permission_key as string | undefined;
    if (!key) continue;

    if (ov.granted === true) {
      basePermissions.add(key);
    } else if (ov.granted === false) {
      basePermissions.delete(key);
    }
  }

  // Cast to Permission type (filter out any unknown keys for safety)
  const validPermissions: Permission[] = [];
  for (const key of basePermissions) {
    validPermissions.push(key as Permission);
  }

  return validPermissions;
}
