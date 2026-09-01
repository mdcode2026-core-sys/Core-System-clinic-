"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { CreateUserInput, UpdateUserInput, UserActionResult } from "./users.types";

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "UNAUTHORIZED";
  const { data: clinicUser, error } = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (error || !clinicUser?.tenant_id) throw "TENANT_RESOLUTION_FAILED";
  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id };
}

async function requirePermission(userId: string, tenantId: string, permission: string) {
  const permissions = await getEffectivePermissions(userId, tenantId);
  if (!permissions.includes(permission as any)) throw "PERMISSION_DENIED";
}

async function resolveRole(supabase: any, roleId: string, tenantId: string) {
  const { data, error } = await supabase.from("roles").select("id,role_key,tenant_id,is_system_role,workspace").eq("id", roleId).maybeSingle();
  if (error || !data) throw "ROLE_NOT_FOUND";
  if (!data.is_system_role && data.tenant_id !== tenantId) throw "ROLE_WRONG_TENANT";
  if (data.role_key === "super_admin") throw "ROLE_NOT_ASSIGNABLE";
  return data;
}

async function saveWorkspaceAssignment(supabase: any, tenantId: string, userId: string, workspace: CreateUserInput["workspace"]) {
  const { error } = await supabase.from("clinic_user_workspaces").upsert({ tenant_id: tenantId, user_id: userId, workspace, is_default: true }, { onConflict: "tenant_id,user_id,workspace" });
  if (error) throw "WORKSPACE_ASSIGNMENT_FAILED";
}

export async function createClinicUser(input: CreateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:create");
    const role = await resolveRole(supabase, input.role_id, tenantId);

    const { data: inserted, error } = await supabase.from("clinic_users").insert({ tenant_id: tenantId, auth_user_id: null, role: role.role_key, role_id: role.id, role_template_id: role.is_system_role ? role.id : null, full_name: input.full_name.trim(), email: input.email.trim(), phone: input.phone?.trim() || null, is_active: true }).select("id").single();
    if (error) return { success: false, error: "USER_CREATE_FAILED" };
    await saveWorkspaceAssignment(supabase, tenantId, inserted.id, input.workspace);
    revalidatePath("/settings");
    return { success: true, error: null, userId: inserted.id };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}

export async function updateClinicUser(input: UpdateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const { data: target, error: targetError } = await supabase.from("clinic_users").select("id,tenant_id,role_id").eq("id", input.id).eq("tenant_id", tenantId).maybeSingle();
    if (targetError || !target) return { success: false, error: "USER_NOT_FOUND" };

    const updatePayload: Record<string, unknown> = {};
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.email !== undefined) updatePayload.email = input.email.trim();
    if (input.phone !== undefined) updatePayload.phone = input.phone.trim() || null;
    if (input.role_id !== undefined) {
      const role = await resolveRole(supabase, input.role_id, tenantId);
      updatePayload.role_id = role.id;
      updatePayload.role = role.role_key;
      updatePayload.role_template_id = role.is_system_role ? role.id : null;
    }
    if (!Object.keys(updatePayload).length && input.workspace === undefined) return { success: false, error: "NO_FIELDS_TO_UPDATE" };

    if (Object.keys(updatePayload).length) {
      const { error } = await supabase.from("clinic_users").update(updatePayload).eq("id", input.id).eq("tenant_id", tenantId);
      if (error) return { success: false, error: "USER_UPDATE_FAILED" };
    }
    if (input.workspace !== undefined) {
      await supabase.from("clinic_user_workspaces").update({ is_default: false }).eq("tenant_id", tenantId).eq("user_id", input.id).eq("is_default", true);
      await saveWorkspaceAssignment(supabase, tenantId, input.id, input.workspace);
    }
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}

export async function toggleClinicUserActive(userId: string, isActive: boolean): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:delete");
    const { data: target } = await supabase.from("clinic_users").select("id,auth_user_id").eq("id", userId).eq("tenant_id", tenantId).maybeSingle();
    if (!target) return { success: false, error: "USER_NOT_FOUND" };
    if (target.auth_user_id === user.id && !isActive) return { success: false, error: "CANNOT_DEACTIVATE_SELF" };
    const { error } = await supabase.from("clinic_users").update({ is_active: isActive }).eq("id", userId).eq("tenant_id", tenantId);
    if (error) return { success: false, error: "USER_STATUS_UPDATE_FAILED" };
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: typeof err === "string" ? err : "UNKNOWN" };
  }
}
