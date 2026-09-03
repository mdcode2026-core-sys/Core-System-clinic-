"use client";

import { usePermissions } from "./usePermissions";
import type { Permission } from "./types";

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, isLoading } = usePermissions();

  // Presentation guard only. Security authorization remains server/RLS/RPC enforced.
  if (isLoading || !hasPermission(permission)) return fallback;
  return children;
}
