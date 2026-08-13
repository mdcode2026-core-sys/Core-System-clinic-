"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { CreateRoleInput, UpdateRoleInput, RoleActionResult } from "./roles.types";

export interface UpdateRolePermissionsResult {
  success: boolean;
  error: string | null;
}

/**
 * Helper: Resolve caller identity and tenant via the canonical pattern.
 */
async function resolveCaller() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw "Unauthorized";
  }

  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id, role, id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    throw "Tenant resolution failed";
  }

  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id };
}

/**
 * Helper: Check a permission server-side.
 */
async function requirePermission(userId: string, tenantId: string, perm: string) {
  const effectivePerms = await getEffectivePermissions(userId, tenantId);
  if (!effectivePerms.includes(perm as any)) {
    throw `Permission denied: ${perm} required`;
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */

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

  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");

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
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[updateRolePermissions] error:", message);
    return { success: false, error: message };
  }
}

/* ── M2.5: Custom Role Management Actions ── */

/**
 * Server Action: Create a new tenant-specific custom role.
 *
 * Authorization: requires `roles:manage` permission.
 */
export async function createRole(
  input: CreateRoleInput
): Promise<RoleActionResult> {
  const supabase = await createClient();

  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");

    // Validate role_key format
    const key = input.role_key.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key || key.length < 2) {
      return { success: false, error: "Role key must be at least 2 characters" };
    }
    if (!/^[a-z0-9_]+$/.test(key)) {
      return { success: false, error: "Role key can only contain lowercase letters, numbers, and underscores" };
    }

    // Check for duplicate role_key within tenant
    const { data: existing, error: checkError } = await supabase
      .from("roles")
      .select("id")
      .eq("role_key", key)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (checkError) {
      console.error("[createRole] check error:", checkError.message);
      return { success: false, error: "Failed to validate role key" };
    }

    if (existing) {
      return { success: false, error: "A role with this key already exists in your clinic" };
    }

    // Insert the new role
    const { data: roleData, error: insertError } = await supabase
      .from("roles")
      .insert({
        role_key: key,
        role_name: input.role_name.trim(),
        role_name_ar: input.role_name_ar?.trim() || null,
        description: input.description?.trim() || null,
        is_system_role: false,
        tenant_id: tenantId,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[createRole] insert error:", insertError.message);
      return { success: false, error: "Failed to create role" };
    }

    // Optionally assign initial permissions
    if (input.permissionIds && input.permissionIds.length > 0) {
      const { data: validPerms } = await supabase
        .from("permissions")
        .select("id")
        .in("id", input.permissionIds);

      const validIds = (validPerms ?? []).map((p) => p.id);
      if (validIds.length > 0) {
        const inserts = validIds.map((permissionId) => ({
          role_id: roleData.id,
          permission_id: permissionId,
        }));
        await supabase.from("role_permissions").insert(inserts);
      }
    }

    revalidatePath("/settings");
    return { success: true, error: null, roleId: roleData.id };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[createRole] error:", message);
    return { success: false, error: message };
  }
}

/**
 * Server Action: Update a custom role's metadata.
 *
 * Authorization: requires `roles:manage` permission.
 * Only non-system roles owned by the tenant can be modified.
 */
export async function updateRole(
  input: UpdateRoleInput
): Promise<RoleActionResult> {
  const supabase = await createClient();

  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");

    // Verify role exists, is not system, and belongs to tenant
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id, is_system_role, tenant_id")
      .eq("id", input.roleId)
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

    const updates: { role_name?: string; role_name_ar?: string | null; description?: string | null } = {};
    if (input.role_name !== undefined) updates.role_name = input.role_name.trim();
    if (input.role_name_ar !== undefined) updates.role_name_ar = input.role_name_ar.trim() || null;
    if (input.description !== undefined) updates.description = input.description.trim() || null;

    if (Object.keys(updates).length === 0) {
      return { success: true, error: null };
    }

    const { error: updateError } = await supabase
      .from("roles")
      .update(updates)
      .eq("id", input.roleId);

    if (updateError) {
      console.error("[updateRole] error:", updateError.message);
      return { success: false, error: "Failed to update role" };
    }

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[updateRole] error:", message);
    return { success: false, error: message };
  }
}

/**
 * Server Action: Delete a custom role.
 *
 * Authorization: requires `roles:manage` permission.
 * Only non-system roles owned by the tenant can be deleted.
 * Role must not be assigned to any clinic_users.
 */
export async function deleteRole(roleId: string): Promise<RoleActionResult> {
  const supabase = await createClient();

  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");

    // Verify role exists, is not system, and belongs to tenant
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id, is_system_role, tenant_id")
      .eq("id", roleId)
      .maybeSingle();

    if (roleError || !roleData) {
      return { success: false, error: "Role not found" };
    }

    if (roleData.is_system_role) {
      return { success: false, error: "System roles cannot be deleted" };
    }

    if (roleData.tenant_id !== tenantId) {
      return { success: false, error: "Role does not belong to this tenant" };
    }

    // Check if role is assigned to any clinic_users
    const { data: usersWithRole, error: userCheckError } = await supabase
      .from("clinic_users")
      .select("id")
      .eq("role_template_id", roleId)
      .limit(1);

    if (userCheckError) {
      console.error("[deleteRole] user check error:", userCheckError.message);
      return { success: false, error: "Failed to check role usage" };
    }

    if (usersWithRole && usersWithRole.length > 0) {
      return {
        success: false,
        error: "لا يمكن حذف هذا الدور لأنه مُخصص لمستخدمين حاليين. يرجى إعادة تعيين المستخدمين إلى دور آخر أولاً.",
      };
    }

    // Delete the role (FK CASCADE on role_permissions handles cleanup automatically)
    const { error: deleteError } = await supabase
      .from("roles")
      .delete()
      .eq("id", roleId);

    if (deleteError) {
      console.error("[deleteRole] delete error:", deleteError.message);
      return { success: false, error: "Failed to delete role" };
    }

    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "Unknown error";
    console.error("[deleteRole] error:", message);
    return { success: false, error: message };
  }
}
