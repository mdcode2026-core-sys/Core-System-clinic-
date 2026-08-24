"use client";

import type { Permission } from "@/core/permissions/types";

/**
 * M2.2 + M2.5 — Roles & Permissions Types
 *
 * Architecture per ADR-001:
 * - is_system_role = true → CORE SYSTEM provided template (immutable)
 * - is_system_role = false + tenant_id set → tenant-customized role
 * - role_template_id on clinic_users links a user to their role configuration
 */

export interface Role {
  id: string;
  role_key: string;
  role_name: string;
  role_name_ar: string | null;
  description: string | null;
  is_system_role: boolean;
  tenant_id: string | null;
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

export interface RoleWithPermissions extends Role {
  permissions: PermissionRow[];
}

export interface UpdateRolePermissionsInput {
  roleId: string;
  permissionIds: string[];
}

/* ── M2.5: Custom Role Management Types ── */

export interface CreateRoleInput {
  role_key: string;
  role_name: string;
  role_name_ar?: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  roleId: string;
  role_name?: string;
  role_name_ar?: string;
  description?: string;
}

export interface RoleActionResult {
  success: boolean;
  error: string | null;
  roleId?: string;
}
