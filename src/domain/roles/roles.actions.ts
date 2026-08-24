"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { CreateRoleInput, UpdateRoleInput, RoleActionResult } from "./roles.types";

export interface UpdateRolePermissionsResult { success: boolean; error: string | null; }

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "UNAUTHORIZED";
  const { data: clinicUser, error: clinicError } = await supabase.from("clinic_users").select("tenant_id, role, id").eq("auth_user_id", user.id).limit(1).maybeSingle();
  if (clinicError || !clinicUser?.tenant_id) throw "TENANT_RESOLUTION_FAILED";
  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id };
}

async function requirePermission(userId: string, tenantId: string, perm: string) {
  const effectivePerms = await getEffectivePermissions(userId, tenantId);
  if (!effectivePerms.includes(perm as any)) throw "PERMISSION_DENIED";
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<UpdateRolePermissionsResult> {
  const supabase = await createClient();
  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id, is_system_role, tenant_id").eq("id", roleId).maybeSingle();
    if (roleError || !roleData) return { success: false, error: "ROLE_NOT_FOUND" };
    if (roleData.is_system_role) return { success: false, error: "SYSTEM_ROLE_IMMUTABLE" };
    if (roleData.tenant_id !== tenantId) return { success: false, error: "ROLE_WRONG_TENANT" };
    const { data: validPerms, error: permCheckError } = await supabase.from("permissions").select("id").in("id", permissionIds);
    if (permCheckError) return { success: false, error: "PERMISSIONS_VALIDATION_FAILED" };
    const validPermIds = new Set((validPerms ?? []).map((p) => p.id));
    const filteredPermissionIds = permissionIds.filter((id) => validPermIds.has(id));
    const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);
    if (deleteError) { console.error("[updateRolePermissions] delete error:", deleteError.message); return { success: false, error: "ROLE_PERMISSIONS_UPDATE_FAILED" }; }
    if (filteredPermissionIds.length > 0) {
      const inserts = filteredPermissionIds.map((permissionId) => ({ role_id: roleId, permission_id: permissionId }));
      const { error: insertError } = await supabase.from("role_permissions").insert(inserts);
      if (insertError) { console.error("[updateRolePermissions] insert error:", insertError.message); return { success: false, error: "ROLE_PERMISSIONS_SAVE_FAILED" }; }
    }
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN";
    console.error("[updateRolePermissions] error:", message);
    return { success: false, error: message };
  }
}

export async function createRole(input: CreateRoleInput): Promise<RoleActionResult> {
  const supabase = await createClient();
  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");
    const key = input.role_key.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key || key.length < 2) return { success: false, error: "ROLE_KEY_TOO_SHORT" };
    if (!/^[a-z0-9_]+$/.test(key)) return { success: false, error: "ROLE_KEY_INVALID" };
    const { data: existing, error: checkError } = await supabase.from("roles").select("id").eq("role_key", key).eq("tenant_id", tenantId).maybeSingle();
    if (checkError) { console.error("[createRole] check error:", checkError.message); return { success: false, error: "ROLE_KEY_VALIDATION_FAILED" }; }
    if (existing) return { success: false, error: "ROLE_KEY_EXISTS" };
    const { data: roleData, error: insertError } = await supabase.from("roles").insert({ role_key: key, role_name: input.role_name.trim(), role_name_ar: input.role_name_ar?.trim() || null, description: input.description?.trim() || null, is_system_role: false, tenant_id: tenantId }).select("id").single();
    if (insertError) { console.error("[createRole] insert error:", insertError.message); return { success: false, error: "ROLE_CREATE_FAILED" }; }
    if (input.permissionIds && input.permissionIds.length > 0) {
      const { data: validPerms, error: permCheckError } = await supabase.from("permissions").select("id").in("id", input.permissionIds);
      if (permCheckError) { console.error("[createRole] permission validation error:", permCheckError.message); return { success: false, error: "PERMISSIONS_VALIDATION_FAILED" }; }
      const validIds = (validPerms ?? []).map((p) => p.id);
      if (validIds.length > 0) {
        const inserts = validIds.map((permissionId) => ({ role_id: roleData.id, permission_id: permissionId }));
        const { error: permInsertError } = await supabase.from("role_permissions").insert(inserts);
        if (permInsertError) { console.error("[createRole] permission insert error:", permInsertError.message); return { success: false, error: "ROLE_PERMISSION_ASSIGN_FAILED" }; }
      }
    }
    revalidatePath("/settings");
    return { success: true, error: null, roleId: roleData.id };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN";
    console.error("[createRole] error:", message);
    return { success: false, error: message };
  }
}

export async function updateRole(input: UpdateRoleInput): Promise<RoleActionResult> {
  const supabase = await createClient();
  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id, is_system_role, tenant_id").eq("id", input.roleId).maybeSingle();
    if (roleError || !roleData) return { success: false, error: "ROLE_NOT_FOUND" };
    if (roleData.is_system_role) return { success: false, error: "SYSTEM_ROLE_IMMUTABLE" };
    if (roleData.tenant_id !== tenantId) return { success: false, error: "ROLE_WRONG_TENANT" };
    const updates: { role_name?: string; role_name_ar?: string | null; description?: string | null } = {};
    if (input.role_name !== undefined) updates.role_name = input.role_name.trim();
    if (input.role_name_ar !== undefined) updates.role_name_ar = input.role_name_ar.trim() || null;
    if (input.description !== undefined) updates.description = input.description.trim() || null;
    if (Object.keys(updates).length === 0) return { success: true, error: null };
    const { error: updateError } = await supabase.from("roles").update(updates).eq("id", input.roleId);
    if (updateError) { console.error("[updateRole] error:", updateError.message); return { success: false, error: "ROLE_UPDATE_FAILED" }; }
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN";
    console.error("[updateRole] error:", message);
    return { success: false, error: message };
  }
}

export async function deleteRole(roleId: string): Promise<RoleActionResult> {
  const supabase = await createClient();
  try {
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "roles:manage");
    const { data: roleData, error: roleError } = await supabase.from("roles").select("id, is_system_role, tenant_id").eq("id", roleId).maybeSingle();
    if (roleError || !roleData) return { success: false, error: "ROLE_NOT_FOUND" };
    if (roleData.is_system_role) return { success: false, error: "SYSTEM_ROLE_IMMUTABLE" };
    if (roleData.tenant_id !== tenantId) return { success: false, error: "ROLE_WRONG_TENANT" };
    const { data: usersWithRole, error: userCheckError } = await supabase.from("clinic_users").select("id").eq("role_template_id", roleId).limit(1);
    if (userCheckError) { console.error("[deleteRole] user check error:", userCheckError.message); return { success: false, error: "ROLE_USAGE_CHECK_FAILED" }; }
    if (usersWithRole && usersWithRole.length > 0) return { success: false, error: "ROLE_IN_USE" };
    const { error: deleteError } = await supabase.from("roles").delete().eq("id", roleId);
    if (deleteError) { console.error("[deleteRole] delete error:", deleteError.message); return { success: false, error: "ROLE_DELETE_FAILED" }; }
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    const message = typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN";
    console.error("[deleteRole] error:", message);
    return { success: false, error: message };
  }
}
