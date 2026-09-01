import type { UserRole } from "@/core/permissions/types";
import type { BusinessWorkspaceKey } from "@/core/workspace/currentWorkspace";

export interface ClinicUser {
  id: string;
  auth_user_id: string | null;
  tenant_id: string;
  role: UserRole | string;
  role_id: string;
  role_template_id: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClinicUserWithRole extends ClinicUser {
  role_name: string | null;
  role_name_ar: string | null;
  is_system_role: boolean;
  role_workspace: string | null;
  assigned_workspace?: BusinessWorkspaceKey | null;
}

export interface CreateUserInput {
  full_name: string;
  email: string;
  phone?: string;
  role_id: string;
  workspace: BusinessWorkspaceKey;
}

export interface UpdateUserInput {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role_id?: string;
  workspace?: BusinessWorkspaceKey;
}

export interface UserActionResult {
  success: boolean;
  error: string | null;
  userId?: string;
}
