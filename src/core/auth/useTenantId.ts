"use client";

import { useAuth } from "./AuthContext";

interface UseTenantIdReturn { tenantId: string | null; userId: string | null; isLoading: boolean; error: string | null; }

/**
 * Canonical client identity bridge.
 *
 * AuthProvider already owns the authenticated session, tenant and user identity
 * and updates them from onAuthStateChange. Do not maintain a second cached
 * identity query here: a query created before login can otherwise remain a
 * cached anonymous/null identity and suppress permission-dependent UI after
 * authentication.
 */
export function useTenantId(): UseTenantIdReturn {
  const { tenantId, user, isLoading } = useAuth();
  return {
    tenantId,
    userId: user?.id ?? null,
    isLoading,
    error: null,
  };
}
