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
 * Fix: reads tenant_id from clinic_users table directly instead of metadata,
 * to handle users whose metadata may be stale or missing.
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

        // FIX: Read tenant_id from clinic_users directly, not from metadata
        const { data: clinicUser, error: clinicError } = await supabase
          .from("clinic_users")
          .select("tenant_id")
          .eq("auth_user_id", userId)
          .limit(1)
          .maybeSingle();

        if (clinicError) {
          throw new Error(`Failed to fetch clinic user: ${clinicError.message}`);
        }

        const tenantId = clinicUser?.tenant_id;

        if (!tenantId) {
          console.warn("[usePermissions] No tenant_id found for user", userId);
          setPermissions([]);
          setIsLoading(false);
          return;
        }

        // Call the server-side permission engine
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
