"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import { useTenantId } from "@/core/auth/useTenantId";

export interface UseEntitlementsReturn {
  capabilities: string[];
  hasCapability: (key: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useEntitlements(): UseEntitlementsReturn {
  const { tenantId, isLoading: tenantLoading, error: tenantError } = useTenantId();
  const supabase = createClient();

  const { data: capabilities = [], isLoading: capabilityLoading, error: capabilityError } = useQuery({
    queryKey: ["tenant-capabilities", tenantId],
    queryFn: async () => {
      if (!tenantId) return [] as string[];
      const { data: grants, error: grantsError } = await supabase
        .from("tenant_entitlements")
        .select("entitlement_key")
        .eq("tenant_id", tenantId)
        .eq("status", "active");
      if (grantsError) throw grantsError;
      const keys = [...new Set((grants ?? []).map((row) => row.entitlement_key))];
      if (!keys.length) return [] as string[];
      const { data: mappings, error: mappingsError } = await supabase
        .from("entitlement_capabilities")
        .select("capability_key")
        .in("entitlement_key", keys);
      if (mappingsError) throw mappingsError;
      return [...new Set((mappings ?? []).map((row) => row.capability_key))];
    },
    enabled: !tenantLoading && !!tenantId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const hasCapability = (key: string) => capabilities.includes(key);
  const isLoading = tenantLoading || (!!tenantId && capabilityLoading);
  const error = tenantError ?? (capabilityError instanceof Error ? capabilityError.message : null);

  return useMemo(
    () => ({ capabilities, hasCapability, isLoading, error }),
    [capabilities, hasCapability, isLoading, error],
  );
}
