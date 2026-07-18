"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { hasPermission } from "./permissions";
import type { Permission } from "./permissions";

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { role } = useAuth();

  if (!role || !hasPermission(role as any, permission)) {
    return fallback;
  }

  return children;
}
