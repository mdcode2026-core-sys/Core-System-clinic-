"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { CreateUserInput, UpdateUserInput, UserActionResult } from "./users.types";

function appUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const url = configured || (vercel ? `https://${vercel}` : "");
  if (!url) throw new Error("APPLICATION_URL_NOT_CONFIGURED");
  return url.replace(/\/$/, "");
}

function generateEmployeeCode() {
  return `EMP-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

async function resolveCaller() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw "UNAUTHORIZED";
  const { data: clinicUser, error } = await supabase.from("clinic_users").select("id,tenant_id,role,role_id").eq("auth_user_id", user.id).eq("is_active", true).maybeSingle();
  if (error || !clinicUser?.tenant_id) throw "TENANT_RESOLUTION_FAILED";
  return { user, tenantId: clinicUser.tenant_id, callerClinicUserId: clinicUser.id, callerRole: clinicUser.role };
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

async function loadTarget(supabase: any, userId: string, tenantId: string) {
  const { data, error } = await supabase.from("clinic_users").select("id,tenant_id,auth_user_id,full_name,email,is_active,role").eq("id", userId).eq("tenant_id", tenantId).maybeSingle();
  if (error || !data) throw "USER_NOT_FOUND";
  return data;
}

async function provisionAuthAccount(target: { id: string; email: string; full_name: string | null }, tenantId: string): Promise<UserActionResult> {
  const admin = createAdminClient();
  const redirectTo = `${appUrl()}/activate`;
  const metadata = { full_name: target.full_name, tenant_id: tenantId, clinic_user_id: target.id };
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(target.email, { data: metadata, redirectTo });
  if (invited?.user) return { success: true, error: null, userId: invited.user.id, emailSent: true };
  const { data: generated, error: generateError } = await admin.auth.admin.generateLink({ type: "invite", email: target.email, options: { data: metadata, redirectTo } });
  if (generated?.user && generated.properties?.action_link) return { success: true, error: null, userId: generated.user.id, activationLink: generated.properties.action_link, emailSent: false };
  return { success: false, error: generateError?.message || inviteError?.message || "AUTH_INVITATION_FAILED" };
}

async function insertClinicUser(supabase: any, payload: Record<string, unknown>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase.from("clinic_users").insert({ ...payload, employee_code: generateEmployeeCode(), pin_code: "" }).select("id,full_name,email").single();
    if (!error && data) return { data, error: null };
    if (error?.code !== "23505") return { data: null, error };
    const message = String(error?.message || "");
    if (message.includes("uq_clinic_users_tenant_email_active")) return { data: null, error: { code: "USER_EMAIL_EXISTS" } };
    if (attempt === 2) return { data: null, error: { code: "USER_EMPLOYEE_CODE_EXISTS" } };
  }
  return { data: null, error: { code: "USER_CREATE_FAILED" } };
}

async function applyAccessConfiguration(supabase: any, userId: string, tenantId: string, callerId: string, directPermissionIds: string[] = [], revokedPermissionIds: string[] = []) {
  await requirePermission(callerId, tenantId, "overrides:manage");
  const directIds = [...new Set(directPermissionIds)].filter(Boolean);
  const revokedIds = [...new Set(revokedPermissionIds)].filter(id => id && !directIds.includes(id));
  const allIds = [...new Set([...directIds, ...revokedIds])];
  if (allIds.length) {
    const { data: validPermissions, error: permissionError } = await supabase.from("permissions").select("id").in("id", allIds);
    if (permissionError || (validPermissions ?? []).length !== allIds.length) throw "PERMISSION_REFERENCE_INVALID";
  }
  const { error: clearDirectError } = await supabase.from("clinic_user_permissions").delete().eq("tenant_id", tenantId).eq("user_id", userId);
  if (clearDirectError) throw "DIRECT_PERMISSION_SAVE_FAILED";
  const { error: clearOverrideError } = await supabase.from("clinic_user_permission_overrides").delete().eq("tenant_id", tenantId).eq("user_id", userId);
  if (clearOverrideError) throw "OVERRIDE_SAVE_FAILED";
  if (directIds.length) {
    const { error } = await supabase.from("clinic_user_permissions").insert(directIds.map(permission_id => ({ tenant_id: tenantId, user_id: userId, permission_id, granted: true, created_by: callerId })));
    if (error) throw "DIRECT_PERMISSION_SAVE_FAILED";
  }
  if (revokedIds.length) {
    const { error } = await supabase.from("clinic_user_permission_overrides").insert(revokedIds.map(permission_id => ({ tenant_id: tenantId, user_id: userId, permission_id, granted: false, created_by: callerId })));
    if (error) throw "OVERRIDE_SAVE_FAILED";
  }
}

export async function createClinicUser(input: CreateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:create");
    const role = await resolveRole(supabase, input.role_id, tenantId);
    const workspace = input.workspace || role.workspace || "operation";
    const { data: inserted, error } = await insertClinicUser(supabase, {
      tenant_id: tenantId,
      auth_user_id: null,
      role: role.role_key,
      role_id: role.id,
      role_template_id: role.is_system_role ? role.id : null,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      is_active: true,
    });
    if (error || !inserted) return { success: false, error: error?.code === "USER_EMAIL_EXISTS" ? "USER_EMAIL_OR_USER_EXISTS" : error?.code === "USER_EMPLOYEE_CODE_EXISTS" ? "USER_EMPLOYEE_CODE_EXISTS" : "USER_CREATE_FAILED" };

    const { error: workspaceError } = await supabase.from("clinic_user_workspaces").insert({ tenant_id: tenantId, user_id: inserted.id, workspace, is_default: true });
    if (workspaceError) { await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId); return { success: false, error: "USER_WORKSPACE_SETUP_FAILED" }; }

    const authResult = await provisionAuthAccount(inserted, tenantId);
    if (!authResult.success || !authResult.userId) { await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId); return { success: false, error: authResult.error || "AUTH_INVITATION_FAILED" }; }
    const { error: linkError } = await supabase.from("clinic_users").update({ auth_user_id: authResult.userId }).eq("id", inserted.id).eq("tenant_id", tenantId).is("auth_user_id", null);
    if (linkError) { try { await createAdminClient().auth.admin.deleteUser(authResult.userId); } catch {} await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId); return { success: false, error: "AUTH_LINK_FAILED" }; }

    try { await applyAccessConfiguration(supabase, inserted.id, tenantId, user.id, input.directPermissionIds, input.revokedPermissionIds); }
    catch (error) {
      try { await createAdminClient().auth.admin.deleteUser(authResult.userId); } catch {}
      await supabase.from("clinic_users").delete().eq("id", inserted.id).eq("tenant_id", tenantId);
      return { success: false, error: typeof error === "string" ? error : "USER_ACCESS_SETUP_FAILED" };
    }

    revalidatePath("/settings");
    return { success: true, error: null, userId: inserted.id, activationLink: authResult.activationLink, emailSent: authResult.emailSent };
  } catch (err) { return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" }; }
}

export async function activateClinicUserAccount(userId: string): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, userId, tenantId);
    if (!target.email) return { success: false, error: "USER_EMAIL_REQUIRED" };
    if (target.auth_user_id) {
      const { error } = await createAdminClient().auth.admin.updateUserById(target.auth_user_id, { ban_duration: "0s" });
      if (error) return { success: false, error: "AUTH_REACTIVATION_FAILED" };
      const { error: dbError } = await supabase.from("clinic_users").update({ is_active: true }).eq("id", target.id).eq("tenant_id", tenantId);
      if (dbError) return { success: false, error: "USER_STATUS_UPDATE_FAILED" };
      revalidatePath("/settings"); return { success: true, error: null, userId: target.id, emailSent: false };
    }
    const authResult = await provisionAuthAccount({ id: target.id, email: target.email, full_name: target.full_name }, tenantId);
    if (!authResult.success || !authResult.userId) return { success: false, error: authResult.error || "AUTH_INVITATION_FAILED" };
    const { error: linkError } = await supabase.from("clinic_users").update({ auth_user_id: authResult.userId, is_active: true }).eq("id", target.id).eq("tenant_id", tenantId).is("auth_user_id", null);
    if (linkError) { try { await createAdminClient().auth.admin.deleteUser(authResult.userId); } catch {} return { success: false, error: "AUTH_LINK_FAILED" }; }
    revalidatePath("/settings"); return { success: true, error: null, userId: target.id, activationLink: authResult.activationLink, emailSent: authResult.emailSent };
  } catch (err) { return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" }; }
}

export async function updateClinicUser(input: UpdateUserInput): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:update");
    const target = await loadTarget(supabase, input.id, tenantId);
    if (target.auth_user_id === user.id && input.role_id) {
      const role = await resolveRole(supabase, input.role_id, tenantId);
      if (role.role_key !== "clinic_admin") return { success: false, error: "CLINIC_ADMIN_ACCOUNT_PROTECTED" };
    }
    const updatePayload: Record<string, unknown> = {};
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.email !== undefined) updatePayload.email = input.email.trim().toLowerCase();
    if (input.phone !== undefined) updatePayload.phone = input.phone.trim() || null;
    if (input.role_id !== undefined) { const role = await resolveRole(supabase, input.role_id, tenantId); updatePayload.role_id = role.id; updatePayload.role = role.role_key; updatePayload.role_template_id = role.is_system_role ? role.id : null; }
    if (!Object.keys(updatePayload).length && !input.workspace && input.directPermissionIds === undefined && input.revokedPermissionIds === undefined) return { success: false, error: "NO_FIELDS_TO_UPDATE" };
    if (input.email !== undefined && target.auth_user_id) { const { error: authError } = await createAdminClient().auth.admin.updateUserById(target.auth_user_id, { email: input.email.trim().toLowerCase() }); if (authError) return { success: false, error: "AUTH_EMAIL_UPDATE_FAILED" }; }
    if (Object.keys(updatePayload).length) {
      const { error } = await supabase.from("clinic_users").update(updatePayload).eq("id", input.id).eq("tenant_id", tenantId);
      if (error) return { success: false, error: error.code === "23505" ? "USER_EMAIL_OR_USER_EXISTS" : "USER_UPDATE_FAILED" };
    }
    if (input.workspace) {
      const { error: ensureWorkspaceError } = await supabase.from("clinic_user_workspaces").upsert({ tenant_id: tenantId, user_id: input.id, workspace: input.workspace, is_default: true }, { onConflict: "tenant_id,user_id,workspace" });
      if (ensureWorkspaceError) return { success: false, error: "USER_WORKSPACE_UPDATE_FAILED" };
      const { error: defaultError } = await supabase.from("clinic_user_workspaces").update({ is_default: false }).eq("tenant_id", tenantId).eq("user_id", input.id).neq("workspace", input.workspace);
      if (defaultError) return { success: false, error: "USER_WORKSPACE_UPDATE_FAILED" };
    }
    if (input.directPermissionIds !== undefined || input.revokedPermissionIds !== undefined) {
      try { await applyAccessConfiguration(supabase, input.id, tenantId, user.id, input.directPermissionIds, input.revokedPermissionIds); }
      catch (error) { return { success: false, error: typeof error === "string" ? error : "USER_ACCESS_UPDATE_FAILED" }; }
    }
    revalidatePath("/settings"); return { success: true, error: null };
  } catch (err) { return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" }; }
}

export async function toggleClinicUserActive(userId: string, isActive: boolean): Promise<UserActionResult> {
  try {
    const supabase = await createClient();
    const { user, tenantId } = await resolveCaller();
    await requirePermission(user.id, tenantId, "users:delete");
    const target = await loadTarget(supabase, userId, tenantId);
    if (target.auth_user_id === user.id) return { success: false, error: "CLINIC_ADMIN_ACCOUNT_PROTECTED" };
    if (target.auth_user_id) { const { error: authError } = await createAdminClient().auth.admin.updateUserById(target.auth_user_id, { ban_duration: isActive ? "0s" : "876000h" }); if (authError) return { success: false, error: "AUTH_STATUS_UPDATE_FAILED" }; }
    const { error } = await supabase.from("clinic_users").update({ is_active: isActive }).eq("id", userId).eq("tenant_id", tenantId);
    if (error) return { success: false, error: "USER_STATUS_UPDATE_FAILED" };
    revalidatePath("/settings"); return { success: true, error: null };
  } catch (err) { return { success: false, error: typeof err === "string" ? err : err instanceof Error ? err.message : "UNKNOWN" }; }
}