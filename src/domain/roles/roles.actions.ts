"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";

export interface UpdateRolePermissionsResult {
  success: boolean;
  error: string | null;
}

/**
 * Server Action: Update the permissions assigned to a role.
 *
 * Authorization: requires `roles:manage` permission.
 * Only non-system roles (is_system_role = false) can be modified.
 * System roles are immutable by design (ADR-001).
 */
export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[]
): Promise<UpdateRolePermissionsResult> {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Resolve tenant_id from clinic_users (canonical pattern)
  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id, role")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    return { success: false, error: "Tenant resolution failed" };
  }

  const tenantId = clinicUser.tenant_id;

  // 3. Permission check: roles:manage
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("roles:manage")) {
    return { success: false, error: "Permission denied: roles:manage required" };
  }

  // 4. Verify the role exists and is NOT a system role
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id, is_system_role, tenant_id")
    .eq("id", roleId)
    .maybeSingle();

  if (roleError || !roleData) {
    return { success: false, error: "Role not found" };
  }

  if (roleData.is_system_role) {
    return { success: false, error: "System roles cannot be modified" };
  }

  if (roleData.tenant_id !== tenantId) {
    return { success: false, error: "Role does not belong to this tenant" };
  }

  // 5. Validate permission IDs exist in the catalog
  const { data: validPerms, error: permCheckError } = await supabase
    .from("permissions")
    .select("id")
    .in("id", permissionIds);

  if (permCheckError) {
    return { success: false, error: "Failed to validate permissions" };
  }

  const validPermIds = new Set((validPerms ?? []).map((p) => p.id));
  const filteredPermissionIds = permissionIds.filter((id) => validPermIds.has(id));

  // 6. Transaction: delete existing + insert new
  // Note: Supabase JS does not support true transactions, so we do delete-then-insert
  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  if (deleteError) {
    console.error("[updateRolePermissions] delete error:", deleteError.message);
    return { success: false, error: "Failed to update role permissions" };
  }

  if (filteredPermissionIds.length > 0) {
    const inserts = filteredPermissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(inserts);

    if (insertError) {
      console.error("[updateRolePermissions] insert error:", insertError.message);
      return { success: false, error: "Failed to save role permissions" };
    }
  }

  revalidatePath("/settings");
  return { success: true, error: null };
}
