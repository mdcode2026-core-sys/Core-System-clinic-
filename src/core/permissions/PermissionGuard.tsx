"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { hasPermission } from "./permissionMatrix";
import type { PermissionGuardProps } from "./types";

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { role } = useAuth();

  if (!role || !hasPermission(role, permission)) {
    return fallback;
  }

  return <>{children}</>;
}
