"use client";

import type { Permission } from "@/core/permissions/types";

/**
 * M2.4 — Permission Overrides Types
 *
 * Represents per-user permission overrides beyond their role template.
 * - granted = true: explicit grant (adds permission beyond template)
 * - granted = false: explicit revoke (removes permission from template)
 */

export interface PermissionOverride {
  id: string;
  tenant_id: string;
  user_id: string;
  permission_id: string;
  permission_key: Permission;
  permission_name: string;
  resource: string;
  action: string;
  granted: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserWithOverrides {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  role_name: string | null;
  role_name_ar: string | null;
  is_active: boolean;
  overrides: PermissionOverride[];
}

export interface SetOverrideInput {
  userId: string;
  permissionId: string;
  granted: boolean;
}

export interface RemoveOverrideInput {
  userId: string;
  permissionId: string;
}

export interface OverrideActionResult {
  success: boolean;
  error: string | null;
}
