// src/core/workspace/hooks/useWorkspace.ts
// Workspace Architecture — Main workspace hook (orchestration layer)
//
// This hook owns everything the pure Engine (workspaceEngine.ts) is not
// allowed to own: fetching permissions (usePermissions), fetching feature
// flags (useFeatureFlags), and reading/writing the persisted layout
// (useWidgetPersistence). Once all async data is resolved, it calls the
// pure, synchronous resolveWidgetVisibility() for each registered widget.

"use client";

import { useCallback, useMemo } from "react";
import type {
  WidgetState,
  WorkspaceUserState,
  ResolvedWidget,
  WidgetLayoutEntry,
} from "../workspace.types";
import type { WorkspaceSurfaceKey } from "../workspaceSurfaces";
import { resolveWidgetVisibility } from "../workspaceEngine";
import { widgetRegistry } from "../widgetRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useFeatureFlags } from "@/core/features/useFeatureFlags";
import { useWidgetPersistence } from "./useWidgetPersistence";

export interface UseWorkspaceResult {
  resolved: ResolvedWidget[];
  visibleWidgets: ResolvedWidget[];
  isLoading: boolean;
  hasErrors: boolean;
  updateWidgetState: (key: string, state: WidgetState) => void;
  reorderWidgets: (orderedKeys: string[]) => void;
  resetLayout: () => void;
}

/**
 * Resolve one existing Workspace implementation against a presentation
 * context. Context changes which registered Widgets are appropriate defaults;
 * it never changes authorization and never creates a second Workspace engine.
 */
export function useWorkspace(workspaceKey: WorkspaceSurfaceKey = "global"): UseWorkspaceResult {
  const { layout, setLayout, reset } = useWidgetPersistence();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  // All distinct module keys referenced by the registry — fetched once.
  const moduleKeys = useMemo(
    () => Array.from(new Set(widgetRegistry.map((w) => w.moduleKey))),
    [],
  );
  const { isFeatureEnabled, isLoading: featuresLoading } = useFeatureFlags(moduleKeys);

  const userHiddenKeys = useMemo(() => {
    const hidden = new Set<string>();
    for (const entry of layout.widgets) {
      if (entry.state === "hidden") hidden.add(entry.key);
    }
    return hidden;
  }, [layout.widgets]);

  const isLoading = permissionsLoading || featuresLoading;

  const resolved = useMemo(() => {
    if (isLoading) return [];

    const results: ResolvedWidget[] = [];
    const surfaceWidgets = widgetRegistry.filter(
      (widget) => !widget.defaultWorkspaces || widget.defaultWorkspaces.includes(workspaceKey),
    );

    for (const def of surfaceWidgets) {
      const vis = resolveWidgetVisibility(def, hasPermission, isFeatureEnabled, userHiddenKeys);
      const layoutEntry = layout.widgets.find((l) => l.key === def.key);
      const widgetLayout: WidgetLayoutEntry = layoutEntry ?? {
        key: def.key,
        order: surfaceWidgets.indexOf(def),
        size: def.defaultSize,
        state: vis.isVisible ? "visible" : "hidden",
      };

      results.push({
        definition: def,
        layout: widgetLayout,
        isVisible: vis.isVisible,
      });
    }

    results.sort((a, b) => {
      if (a.definition.layer !== b.definition.layer) {
        return a.definition.layer - b.definition.layer;
      }
      return a.layout.order - b.layout.order;
    });

    return results;
  }, [isLoading, hasPermission, isFeatureEnabled, userHiddenKeys, layout.widgets, workspaceKey]);

  const visibleWidgets = useMemo(
    () => resolved.filter((r) => r.isVisible),
    [resolved],
  );

  const hasErrors = useMemo(
    () => resolved.some((r) => r.layout.state === "error"),
    [resolved],
  );

  const updateWidgetState = useCallback(
    (key: string, state: WidgetState) => {
      setLayout((prev: WorkspaceUserState) => {
        const idx = prev.widgets.findIndex((w) => w.key === key);
        if (idx === -1) {
          const definition = widgetRegistry.find((widget) => widget.key === key);
          return {
            ...prev,
            widgets: [
              ...prev.widgets,
              {
                key,
                order: prev.widgets.length,
                size: definition?.defaultSize ?? { width: "half", height: "standard" },
                state,
              },
            ],
            lastUpdated: new Date().toISOString(),
          };
        }
        const next = [...prev.widgets];
        next[idx] = { ...next[idx], state };
        return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
      });
    },
    [setLayout],
  );

  const reorderWidgets = useCallback(
    (orderedKeys: string[]) => {
      setLayout((prev: WorkspaceUserState) => {
        const next = prev.widgets.map((w) => {
          const newOrder = orderedKeys.indexOf(w.key);
          return newOrder >= 0 ? { ...w, order: newOrder } : w;
        });
        return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
      });
    },
    [setLayout],
  );

  const resetLayout = useCallback(() => reset(), [reset]);

  return {
    resolved,
    visibleWidgets,
    isLoading,
    hasErrors,
    updateWidgetState,
    reorderWidgets,
    resetLayout,
  };
}
