"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { isFeatureEnabled } from "./featureRegistry";
import { useTenantId } from "@/core/auth/useTenantId";
import type { FeatureModuleKey } from "./types";

interface UseFeatureFlagsReturn {
  isFeatureEnabled: (moduleKey: FeatureModuleKey) => boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Client-side hook that resolves feature flags for a fixed set of module
 * keys once (not per-render), and exposes a synchronous
 * isFeatureEnabled(moduleKey): boolean lookup once loading is complete.
 *
 * Mirrors usePermissions.ts exactly: this is the Hook-layer counterpart to
 * the server-only featureRegistry.ts, closing the structural gap that
 * previously caused an async server action to be called synchronously
 * inside the (pure, sync) Workspace Engine.
 *
 * tenantId is resolved via the shared useTenantId() hook — same single
 * source of truth (clinic_users) used by usePermissions.ts.
 */
export function useFeatureFlags(moduleKeys: FeatureModuleKey[]): UseFeatureFlagsReturn {
  const { tenantId, isLoading: tenantLoading } = useTenantId();
  const [flags, setFlags] = useState<Map<FeatureModuleKey, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable dependency key so effect doesn't re-run on every render
  // when the caller passes a fresh array literal.
  const moduleKeysKey = moduleKeys.join(",");

  useEffect(() => {
    let cancelled = false;

    async function fetchFlags() {
      if (tenantLoading) {
        return;
      }

      if (!tenantId) {
        setFlags(new Map());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const keys = moduleKeysKey.length > 0
          ? (moduleKeysKey.split(",") as FeatureModuleKey[])
          : [];

        const results = await Promise.all(
          keys.map(async (key) => [key, await isFeatureEnabled(tenantId, key)] as const)
        );

        if (!cancelled) {
          setFlags(new Map(results));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[useFeatureFlags] Failed to fetch feature flags:", message);
        if (!cancelled) {
          setError(message);
          setFlags(new Map());
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchFlags();

    return () => {
      cancelled = true;
    };
  }, [tenantId, tenantLoading, moduleKeysKey]);

  const isFeatureEnabledSync = useCallback(
    (moduleKey: FeatureModuleKey): boolean => {
      return flags.get(moduleKey) === true;
    },
    [flags]
  );

  return useMemo(
    () => ({
      isFeatureEnabled: isFeatureEnabledSync,
      isLoading: isLoading || tenantLoading,
      error,
    }),
    [isFeatureEnabledSync, isLoading, tenantLoading, error]
  );
}
