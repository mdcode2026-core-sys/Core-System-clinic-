"use client";

import type { UserRole } from "@/core/permissions/types";

/**
 * M2.3 — User Management Types
 *
 * Represents a clinic user row joined with their role information.
 * System roles are referenced by role_key; custom roles by role_template_id.
 */

export interface ClinicUser {
  id: string;
  auth_user_id: string | null;
  tenant_id: string;
  role: UserRole;
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
}

export interface CreateUserInput {
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  role_template_id?: string | null;
}

export interface UpdateUserInput {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  role_template_id?: string | null;
}

export interface UserActionResult {
  success: boolean;
  error: string | null;
  userId?: string;
}
