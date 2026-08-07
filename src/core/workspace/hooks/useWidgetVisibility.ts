"use client";

import { useMemo } from "react";
import type { WidgetDefinition } from "../workspace.types";
import { resolveWidgetVisibility } from "../workspaceEngine";
import { usePermissions } from "@/core/permissions/usePermissions";
import { isFeatureEnabled } from "@/core/features/featureRegistry";

export interface UseWidgetVisibilityResult {
  isVisible: boolean;
  reason: "permission" | "feature" | "user_hidden" | "visible";
  isLoading: boolean;
}

export function useWidgetVisibility(
  widget: WidgetDefinition,
  userHiddenKeys: Set<string>
): UseWidgetVisibilityResult {
  const { hasPermission, isLoading } = usePermissions();

  const result = useMemo(
    () => resolveWidgetVisibility(widget, hasPermission, isFeatureEnabled, null, userHiddenKeys),
    [widget, hasPermission, userHiddenKeys]
  );

  return {
    isVisible: result.isVisible,
    reason: result.reason,
    isLoading,
  };
}
