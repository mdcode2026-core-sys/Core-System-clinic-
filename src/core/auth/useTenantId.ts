"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/infrastructure/supabase/client";

interface UseTenantIdReturn {
  tenantId: string | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Single source of truth for the current user's tenant_id.
 *
 * Reads tenant_id from the clinic_users table (via auth_user_id), NOT from
 * auth user_metadata — metadata may be stale or missing (see usePermissions.ts,
 * where this exact fix was already applied for the Permission Engine).
 *
 * This hook centralizes that same logic so every consumer (usePermissions,
 * useFeatureFlags, and the workspace widgets) resolves tenant_id the same way.
 */
export function useTenantId(): UseTenantIdReturn {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTenantId() {
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
          if (!cancelled) {
            setTenantId(null);
            setUserId(null);
            setIsLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setUserId(session.user.id);
        }

        const { data: clinicUser, error: clinicError } = await supabase
          .from("clinic_users")
          .select("tenant_id")
          .eq("auth_user_id", session.user.id)
          .limit(1)
          .maybeSingle();

        if (clinicError) {
          throw new Error(`Failed to fetch clinic user: ${clinicError.message}`);
        }

        if (!cancelled) {
          setTenantId(clinicUser?.tenant_id ?? null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[useTenantId] Failed to resolve tenant_id:", message);
        if (!cancelled) {
          setError(message);
          setTenantId(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTenantId();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tenantId, userId, isLoading, error };
}
