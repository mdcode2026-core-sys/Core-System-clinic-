"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEffectivePermissions } from "./permissionEngine";
import { useTenantId } from "@/core/auth/useTenantId";
import type { Permission } from "./types";

interface UsePermissionsReturn {
  permissions: Permission[];
  hasPermission: (key: Permission) => boolean;
  hasAnyPermission: (keys: Permission[]) => boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Client-side hook that fetches the current user's effective permissions,
 * cached and shared (via React Query) across every component that calls
 * this hook, and exposes:
 * - hasPermission(key): boolean
 * - hasAnyPermission(keys[]): boolean
 *
 * tenant_id and userId are resolved via the shared useTenantId() hook
 * (clinic_users table — single source of truth), not from auth
 * user_metadata, which may be stale or missing. Since useTenantId() already
 * resolves the session, this hook no longer makes its own separate
 * auth.getSession() call.
 */
export function usePermissions(): UsePermissionsReturn {
  const { tenantId, userId, isLoading: tenantLoading, error: tenantError } = useTenantId();

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useQuery({
    queryKey: ["permissions", userId, tenantId],
    queryFn: () => getEffectivePermissions(userId as string, tenantId as string),
    enabled: !tenantLoading && !!userId && !!tenantId,
  });

  const hasPermission = useCallback(
    (key: Permission): boolean => {
      return permissions.includes(key);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (keys: Permission[]): boolean => {
      return keys.some((key) => permissions.includes(key));
    },
    [permissions]
  );

  const isLoading = tenantLoading || (!!userId && !!tenantId && permissionsLoading);
  const error =
    tenantError ?? (permissionsError instanceof Error ? permissionsError.message : null);

  return useMemo(
    () => ({
      permissions,
      hasPermission,
      hasAnyPermission,
      isLoading,
      error,
    }),
    [permissions, hasPermission, hasAnyPermission, isLoading, error]
  );
}
