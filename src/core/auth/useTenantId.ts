"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

interface UseTenantIdReturn {
  tenantId: string | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface TenantQueryResult {
  tenantId: string | null;
  userId: string | null;
}

async function fetchTenantId(): Promise<TenantQueryResult> {
  const supabase = createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.user) {
    return { tenantId: null, userId: null };
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

  return { tenantId: clinicUser?.tenant_id ?? null, userId: session.user.id };
}

/**
 * Single source of truth for the current user's tenant_id.
 *
 * Reads tenant_id from the clinic_users table (via auth_user_id), NOT from
 * auth user_metadata — metadata may be stale or missing (see usePermissions.ts,
 * where this exact fix was already applied for the Permission Engine).
 *
 * This hook centralizes that same logic so every consumer (usePermissions,
 * useFeatureFlags, and the workspace widgets) resolves tenant_id the same
 * way — and, since it's backed by React Query with the app's shared
 * QueryClient, every consumer mounted at the same time shares a single
 * in-flight request and a single cached result instead of each one
 * independently calling auth.getSession() and querying clinic_users.
 * Previously, a page like the workspace dashboard — which mounts several
 * widgets that each call usePermissions()/useTenantId() — issued one
 * separate session+tenant lookup per widget.
 */
export function useTenantId(): UseTenantIdReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant-id"],
    queryFn: fetchTenantId,
  });

  return {
    tenantId: data?.tenantId ?? null,
    userId: data?.userId ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
