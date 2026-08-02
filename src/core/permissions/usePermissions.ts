"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { getEffectivePermissions } from "./permissionEngine";
import type { Permission } from "./types";

interface UsePermissionsReturn {
  permissions: Permission[];
  hasPermission: (key: Permission) => boolean;
  hasAnyPermission: (keys: Permission[]) => boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Client-side hook that fetches the current user's effective permissions
 * once at session start (not per-render) and exposes:
 * - hasPermission(key): boolean
 * - hasAnyPermission(keys[]): boolean
 *
 * This supplements (does not replace) the synchronous hasPermission()
 * in permissionMatrix.ts. Use this hook for database-backed permission checks.
 */
export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPermissions() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          setPermissions([]);
          setIsLoading(false);
          return;
        }

        const userId = session.user.id;
        const tenantId =
          (session.user.app_metadata?.tenant_id as string | undefined) ||
          (session.user.user_metadata?.tenant_id as string | undefined);

        if (!tenantId) {
          console.warn("[usePermissions] No tenant_id found in user metadata");
          setPermissions([]);
          setIsLoading(false);
          return;
        }

        // Call the server-side permission engine (static import)
        const effectivePerms = await getEffectivePermissions(userId, tenantId);

        if (!cancelled) {
          setPermissions(effectivePerms);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[usePermissions] Failed to fetch permissions:", message);
        if (!cancelled) {
          setError(message);
          setPermissions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, []);

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
