// src/core/workspace/workspaceEngine.ts
// Workspace Architecture — Visibility Engine
// Per WORKSPACE_ARCHITECTURE_SPECIFICATION.md §9
//
// Formula: Visible = PermissionGranted AND FeatureEnabled AND NOT UserHidden

import { useMemo } from "react";
import type { WidgetDefinition, ResolvedWidget, WidgetLayoutEntry, WidgetState } from "./workspace.types";
import { widgetRegistry } from "./widgetRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { isFeatureEnabled } from "@/core/features/featureRegistry";
import { useAuth } from "@/lib/supabase/useAuth";

// ---------------------------------------------------------------------------
// Visibility resolution
// ---------------------------------------------------------------------------

export interface VisibilityResult {
  definition: WidgetDefinition;
  isVisible: boolean;
  reason: "permission" | "feature" | "user_hidden" | "visible";
}

/**
 * Resolve visibility for a single widget.
 * Called by useWidgetVisibility (hook) and useWorkspace (aggregate).
 */
export function resolveWidgetVisibility(
  widget: WidgetDefinition,
  hasPermission: (perm: string) => boolean,
  isFeatureEnabledFn: (tenantId: string | null, moduleKey: string) => boolean,
  tenantId: string | null,
  userHiddenKeys: Set<string>
): VisibilityResult {
  // 1. Permission gate
  if (!hasPermission(widget.requiredPermission)) {
    return { definition: widget, isVisible: false, reason: "permission" };
  }

  // 2. Feature flag gate
  if (!isFeatureEnabledFn(tenantId, widget.moduleKey)) {
    return { definition: widget, isVisible: false, reason: "feature" };
  }

  // 3. User preference gate
  if (userHiddenKeys.has(widget.key)) {
    return { definition: widget, isVisible: false, reason: "user_hidden" };
  }

  return { definition: widget, isVisible: true, reason: "visible" };
}

// ---------------------------------------------------------------------------
// React hook: aggregate workspace resolution
// ---------------------------------------------------------------------------

export interface UseWorkspaceEngineResult {
  /** All widgets from registry resolved against current user */
  resolved: ResolvedWidget[];
  /** Only the visible ones, ordered by layer then registry order */
  visibleWidgets: ResolvedWidget[];
  /** Loading state (permissions or features still resolving) */
  isLoading: boolean;
  /** Any widget hit an error state? */
  hasErrors: boolean;
}

export function useWorkspaceEngine(
  userLayout: WidgetLayoutEntry[]
): UseWorkspaceEngineResult {
  const { user } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  const tenantId = user?.user_metadata?.tenant_id ?? null;

  // Build a Set of user-hidden keys from persisted layout
  const userHiddenKeys = useMemo(() => {
    const hidden = new Set<string>();
    for (const entry of userLayout) {
      if (entry.state === "hidden") {
        hidden.add(entry.key);
      }
    }
    return hidden;
  }, [userLayout]);

  // Resolve every widget in the registry
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

      // Merge with user layout (order, size, state overrides)
      const layoutEntry = userLayout.find((l) => l.key === def.key);
      const layout: WidgetLayoutEntry = layoutEntry ?? {
        key: def.key,
        order: widgetRegistry.indexOf(def),
        size: def.defaultSize,
        state: vis.isVisible ? "visible" : "hidden",
      };

      results.push({
        definition: def,
        layout,
        isVisible: vis.isVisible,
      });
    }

    // Sort: layer ascending, then order ascending
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
    hasErrors: resolved.some(
      (r) => r.layout.state === "error"
    ),
  };
}
