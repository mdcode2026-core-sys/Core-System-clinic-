import type { UserRole } from "@/core/permissions/types";

export type UserWorkspace = "administration" | "operation" | "clinical";

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
}

export interface UserAccessConfiguration {
  directPermissionIds?: string[];
  revokedPermissionIds?: string[];
}

export interface CreateUserInput extends UserAccessConfiguration {
  full_name: string;
  email: string;
  phone?: string;
  role_id: string;
  workspace?: UserWorkspace;
  is_active: boolean;
}

export interface UpdateUserInput extends UserAccessConfiguration {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role_id?: string;
  workspace?: UserWorkspace;
  is_active?: boolean;
}

export interface UserActionResult {
  success: boolean;
  error: string | null;
  userId?: string;
  activationLink?: string;
  emailSent?: boolean;
}
