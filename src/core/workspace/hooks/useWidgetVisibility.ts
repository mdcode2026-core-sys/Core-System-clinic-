// src/core/workspace/hooks/useWidgetVisibility.ts
// Workspace Architecture — Per-widget visibility wrapper
// Thin wrapper around workspaceEngine.ts for single-widget consumers.

import { useMemo } from "react";
import type { WidgetDefinition, WidgetState } from "../workspace.types";
import { resolveWidgetVisibility } from "../workspaceEngine";
import { usePermissions } from "@/core/permissions/usePermissions";
import { isFeatureEnabled } from "@/core/features/featureRegistry";
import { useAuth } from "@/lib/supabase/useAuth";

export interface UseWidgetVisibilityResult {
  isVisible: boolean;
  reason: "permission" | "feature" | "user_hidden" | "visible";
  isLoading: boolean;
}

export function useWidgetVisibility(
  widget: WidgetDefinition,
  userHiddenKeys: Set<string>
): UseWidgetVisibilityResult {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermissions();
  const tenantId = user?.user_metadata?.tenant_id ?? null;

  const result = useMemo(
    () => resolveWidgetVisibility(widget, hasPermission, isFeatureEnabled, tenantId, userHiddenKeys),
    [widget, hasPermission, tenantId, userHiddenKeys]
  );

  return {
    isVisible: result.isVisible,
    reason: result.reason,
    isLoading,
  };
}
