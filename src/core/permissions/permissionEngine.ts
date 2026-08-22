"use server";

import { createClient } from "@/infrastructure/supabase/server";
import type { Permission } from "./types";

const CLINIC_ADMIN_WORKSPACE_PERMISSIONS: Permission[] = [
  "workspace:operation",
  "workspace:clinical",
  "workspace:administration",
];

export async function getEffectivePermissions(
  userId: string,
  tenantId: string
): Promise<Permission[]> {
  const supabase = await createClient();

  const { data: clinicUsers, error: userError } = await supabase
    .from("clinic_users")
    .select("id, role, tenant_id, role_template_id")
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
  const roleTemplateId = clinicUser.role_template_id;

  let roleId: string | null = null;

  if (roleTemplateId) {
    const { data: templateRole, error: templateError } = await supabase
      .from("roles")
      .select("id, tenant_id, is_system_role")
      .eq("id", roleTemplateId)
      .maybeSingle();

    if (templateError) {
      console.error("[permissionEngine] Failed to fetch template role:", templateError.message);
    } else if (templateRole) {
      if (templateRole.is_system_role || templateRole.tenant_id === tenantId) {
        roleId = templateRole.id;
      } else {
        console.warn("[permissionEngine] Template role tenant mismatch, ignoring template");
      }
    }
  }

  if (!roleId) {
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

    roleId = roleTemplate.id;
  }

  const { data: rolePerms, error: rpError } = await supabase
    .from("role_permissions")
    .select("permissions(permission_key)")
    .eq("role_id", roleId);

  if (rpError) {
    console.error("[permissionEngine] Failed to fetch role permissions:", rpError.message);
    return [];
  }

  const basePermissions = new Set<string>();
  for (const rp of rolePerms ?? []) {
    const key = (rp.permissions as any)?.permission_key as string | undefined;
    if (key) {
      basePermissions.add(key);
    }
  }

  const { data: overrides, error: ovError } = await supabase
    .from("clinic_user_permission_overrides")
    .select("granted, permissions(permission_key)")
    .eq("user_id", clinicUser.id)
    .eq("tenant_id", tenantId);

  if (ovError) {
    console.error("[permissionEngine] Failed to fetch overrides:", ovError.message);
  }

  for (const ov of overrides ?? []) {
    const key = (ov.permissions as any)?.permission_key as string | undefined;
    if (!key) continue;

    if (ov.granted === true) {
      basePermissions.add(key);
    } else if (ov.granted === false) {
      basePermissions.delete(key);
    }
  }

  // Clinic Admin is the tenant administrator and must retain access to all
  // three tenant workspaces regardless of user-level permission overrides.
  if (roleKey === "clinic_admin") {
    for (const permission of CLINIC_ADMIN_WORKSPACE_PERMISSIONS) {
      basePermissions.add(permission);
    }
  }

  const validPermissions: Permission[] = [];
  for (const key of basePermissions) {
    validPermissions.push(key as Permission);
  }

  return validPermissions;
}
