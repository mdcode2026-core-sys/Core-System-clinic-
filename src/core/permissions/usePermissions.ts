"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEffectivePermissions } from "./permissionEngine";
import { useTenantId } from "@/core/auth/useTenantId";
import type { Permission } from "./types";

interface UsePermissionsReturn { permissions: Permission[]; hasPermission: (key: Permission) => boolean; hasAnyPermission: (keys: Permission[]) => boolean; isLoading: boolean; error: string | null; }

export function usePermissions(): UsePermissionsReturn {
  const { tenantId, userId, isLoading: tenantLoading, error: tenantError } = useTenantId();
  const { data: permissions = [], isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ["permissions", userId, tenantId],
    queryFn: () => getEffectivePermissions(userId as string, tenantId as string),
    enabled: !tenantLoading && !!userId && !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const hasPermission = useCallback((key: Permission): boolean => permissions.includes(key), [permissions]);
  const hasAnyPermission = useCallback((keys: Permission[]): boolean => keys.some((key) => permissions.includes(key)), [permissions]);
  const isLoading = tenantLoading || (!!userId && !!tenantId && permissionsLoading);
  const error = tenantError ?? (permissionsError instanceof Error ? permissionsError.message : null);
  return useMemo(() => ({ permissions, hasPermission, hasAnyPermission, isLoading, error }), [permissions, hasPermission, hasAnyPermission, isLoading, error]);
}
