// src/core/workspace/workspaceEngine.ts
// Workspace Architecture — Visibility Engine
// Per WORKSPACE_ARCHITECTURE_SPECIFICATION.md §9

import { useMemo } from "react";
import type { WidgetDefinition, ResolvedWidget, WidgetLayoutEntry, WidgetState } from "./workspace.types";
import { widgetRegistry } from "./widgetRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { isFeatureEnabled } from "@/core/features/featureRegistry";
import { useAuth } from "@/lib/supabase/useAuth";

export interface VisibilityResult {
  definition: WidgetDefinition;
  isVisible: boolean;
  reason: "permission" | "feature" | "user_hidden" | "visible";
}

export function resolveWidgetVisibility(
  widget: WidgetDefinition,
  hasPermission: (perm: string) => boolean,
  isFeatureEnabledFn: (tenantId: string | null, moduleKey: string) => boolean,
  tenantId: string | null,
  userHiddenKeys: Set<string>  // ✅ تم التصحيح
): VisibilityResult {
  if (!hasPermission(widget.requiredPermission)) {
    return { definition: widget, isVisible: false, reason: "permission" };
  }
  if (!isFeatureEnabledFn(tenantId, widget.moduleKey)) {
    return { definition: widget, isVisible: false, reason: "feature" };
  }
  if (userHiddenKeys.has(widget.key)) {
    return { definition: widget, isVisible: false, reason: "user_hidden" };
  }
  return { definition: widget, isVisible: true, reason: "visible" };
}

export interface UseWorkspaceEngineResult {
  resolved: ResolvedWidget[];
  visibleWidgets: ResolvedWidget[];
  isLoading: boolean;
  hasErrors: boolean;
}

export function useWorkspaceEngine(
  userLayout: WidgetLayoutEntry[]
): UseWorkspaceEngineResult {
  const { user } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const tenantId = user?.user_metadata?.tenant_id ?? null;

  const userHiddenKeys = useMemo(() => {
    const hidden = new Set<string>();  // ✅ تم التصحيح
    for (const entry of userLayout) {
      if (entry.state === "hidden") {
        hidden.add(entry.key);
      }
    }
    return hidden;
  }, [userLayout]);

  const resolved = useMemo(() => {
    const results: ResolvedWidget[] = [];
    for (const def of widgetRegistry) {
      const vis = resolveWidgetVisibility(
        def,
        hasPermission,
        isFeatureEnabled,
        tenantId,
        userHiddenKeys
      );
      const layoutEntry = userLayout.find((l) => l.key === def.key);
      const layout: WidgetLayoutEntry = layoutEntry ?? {
        key: def.key,
        order: widgetRegistry.indexOf(def),
        size: def.defaultSize,
        state: vis.isVisible ? "visible" : "hidden",
      };
      results.push({ definition: def, layout, isVisible: vis.isVisible });
    }
    results.sort((a, b) => {
      if (a.definition.layer !== b.definition.layer) {
        return a.definition.layer - b.definition.layer;
      }
      return a.layout.order - b.layout.order;
    });
    return results;
  }, [hasPermission, tenantId, userHiddenKeys, userLayout]);

  const visibleWidgets = useMemo(
    () => resolved.filter((r) => r.isVisible),
    [resolved]
  );

  return {
    resolved,
    visibleWidgets,
    isLoading: permissionsLoading,
    hasErrors: resolved.some((r) => r.layout.state === "error"),
  };
}
