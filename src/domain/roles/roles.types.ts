import type { Permission } from "@/core/permissions/types";

export type Workspace = "administration" | "operation" | "clinical";

export interface Role {
  id: string;
  role_key: string;
  role_name: string;
  role_name_ar: string | null;
  description: string | null;
  is_system_role: boolean;
  tenant_id: string | null;
  workspace: Workspace | null;
  created_at: string | null;
}

export interface PermissionRow {
  id: string;
  permission_key: Permission;
  permission_name: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  permission_key: Permission;
  permission_name: string;
  resource: string;
  action: string;
}

export interface RoleWithPermissions extends Role { permissions: PermissionRow[]; }
export interface UpdateRolePermissionsInput { roleId: string; permissionIds: string[]; }
export interface CreateRoleInput { role_key: string; role_name: string; role_name_ar?: string; description?: string; workspace?: Workspace; permissionIds?: string[]; }
export interface UpdateRoleInput { roleId: string; role_name?: string; role_name_ar?: string; description?: string; workspace?: Workspace | null; }
export interface RoleActionResult { success: boolean; error: string | null; roleId?: string; }
