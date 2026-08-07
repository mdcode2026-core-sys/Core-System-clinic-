"use client";

import { useMemo, useState, useEffect } from "react";
import type { WidgetDefinition } from "../workspace.types";
import { resolveWidgetVisibility } from "../workspaceEngine";
import { usePermissions } from "@/core/permissions/usePermissions";
import { isFeatureEnabled } from "@/core/features/featureRegistry";
import type { Permission } from "@/core/permissions/types";

export interface UseWidgetVisibilityResult {
  isVisible: boolean;
  reason: "permission" | "feature" | "user_hidden" | "visible";
  isLoading: boolean;
}

export function useWidgetVisibility(
  widget: WidgetDefinition,
  userHiddenKeys: Set<string>
): UseWidgetVisibilityResult {
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [featureEnabled, setFeatureEnabled] = useState<boolean>(false);
  const [featureLoading, setFeatureLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setFeatureLoading(true);
    isFeatureEnabled("", widget.moduleKey).then((result) => {
      if (!cancelled) {
        setFeatureEnabled(result);
        setFeatureLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [widget.moduleKey]);

  const hasPermissionWrapper = (perm: string): boolean => {
    return hasPermission(perm as Permission);
  };

  const isFeatureEnabledWrapper = (tenantId: string | null, moduleKey: string): boolean => {
    return featureEnabled;
  };

  const result = useMemo(
    () => resolveWidgetVisibility(
      widget,
      hasPermissionWrapper,
      isFeatureEnabledWrapper,
      null,
      userHiddenKeys
    ),
    [widget, hasPermissionWrapper, isFeatureEnabledWrapper, userHiddenKeys]
  );

  return {
    isVisible: result.isVisible,
    reason: result.reason,
    isLoading: permissionsLoading || featureLoading,
  };
}
