// src/core/workspace/hooks/useWorkspace.ts
// Workspace Architecture — Main workspace hook (orchestration layer)

"use client";

import { useCallback, useMemo } from "react";
import type {
  WidgetState,
  WorkspaceUserState,
  ResolvedWidget,
  WidgetLayoutEntry,
  WidgetDefinition,
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
  availableWidgets: WidgetDefinition[];
  isLoading: boolean;
  hasErrors: boolean;
  updateWidgetState: (key: string, state: WidgetState) => void;
  addWidget: (key: string) => void;
  removeWidget: (key: string) => void;
  reorderWidgets: (orderedKeys: string[]) => void;
  resetLayout: () => void;
}

/**
 * Resolve the canonical Workspace implementation against a presentation
 * context. Personalization changes presentation only; authorization remains
 * in the existing permission + feature layers.
 */
export function useWorkspace(workspaceKey: WorkspaceSurfaceKey = "global"): UseWorkspaceResult {
  const { layout, setLayout, reset } = useWidgetPersistence(workspaceKey);
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  const moduleKeys = useMemo(
    () => Array.from(new Set(widgetRegistry.map((w) => w.moduleKey))),
    [],
  );
  const { isFeatureEnabled, isLoading: featuresLoading } = useFeatureFlags(moduleKeys);

  const isLoading = permissionsLoading || featuresLoading;

  const availableWidgets = useMemo(() => {
    if (isLoading) return [];
    return widgetRegistry.filter(
      (widget) => hasPermission(widget.requiredPermission) && isFeatureEnabled(widget.moduleKey),
    );
  }, [isLoading, hasPermission, isFeatureEnabled]);

  const userHiddenKeys = useMemo(() => {
    const hidden = new Set<string>();
    for (const entry of layout.widgets) {
      if (entry.state === "hidden") hidden.add(entry.key);
    }
    return hidden;
  }, [layout.widgets]);

  const resolved = useMemo(() => {
    if (isLoading) return [];

    const defaultSurfaceKeys = new Set(
      widgetRegistry
        .filter((widget) => !widget.defaultWorkspaces || widget.defaultWorkspaces.includes(workspaceKey))
        .map((widget) => widget.key),
    );

    // Defaults belong to the current surface. A personalized widget that is
    // explicitly present in this user's layout remains available on this
    // surface even when it is not a default for that context.
    const surfaceWidgets = widgetRegistry.filter(
      (widget) => defaultSurfaceKeys.has(widget.key) || layout.widgets.some((entry) => entry.key === widget.key),
    );

    const results: ResolvedWidget[] = [];
    for (const def of surfaceWidgets) {
      const vis = resolveWidgetVisibility(def, hasPermission, isFeatureEnabled, userHiddenKeys);
      const layoutEntry = layout.widgets.find((l) => l.key === def.key);
      const widgetLayout: WidgetLayoutEntry = layoutEntry ?? {
        key: def.key,
        order: surfaceWidgets.indexOf(def),
        size: def.defaultSize,
        state: vis.isVisible ? "visible" : "hidden",
      };

      results.push({ definition: def, layout: widgetLayout, isVisible: vis.isVisible });
    }

    results.sort((a, b) => {
      if (a.definition.layer !== b.definition.layer) {
        return a.definition.layer - b.definition.layer;
      }
      return a.layout.order - b.layout.order;
    });

    return results;
  }, [isLoading, hasPermission, isFeatureEnabled, userHiddenKeys, layout.widgets, workspaceKey]);

  const visibleWidgets = useMemo(() => resolved.filter((r) => r.isVisible), [resolved]);
  const hasErrors = useMemo(() => resolved.some((r) => r.layout.state === "error"), [resolved]);

  const updateWidgetState = useCallback(
    (key: string, state: WidgetState) => {
      if (!widgetRegistry.some((widget) => widget.key === key)) return;
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

  const addWidget = useCallback(
    (key: string) => {
      if (!availableWidgets.some((widget) => widget.key === key)) return;
      setLayout((prev: WorkspaceUserState) => {
        const existing = prev.widgets.findIndex((w) => w.key === key);
        if (existing >= 0) {
          const next = [...prev.widgets];
          next[existing] = { ...next[existing], state: "visible" };
          return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
        }
        const definition = widgetRegistry.find((widget) => widget.key === key);
        if (!definition) return prev;
        const maxOrder = prev.widgets.reduce((max, widget) => Math.max(max, widget.order), -1);
        return {
          ...prev,
          widgets: [
            ...prev.widgets,
            { key, order: maxOrder + 1, size: definition.defaultSize, state: "visible" },
          ],
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [availableWidgets, setLayout],
  );

  const removeWidget = useCallback(
    (key: string) => {
      if (!availableWidgets.some((widget) => widget.key === key)) return;
      updateWidgetState(key, "hidden");
    },
    [availableWidgets, updateWidgetState],
  );

  const reorderWidgets = useCallback(
    (orderedKeys: string[]) => {
      const orderByKey = new Map(orderedKeys.map((key, index) => [key, index]));
      setLayout((prev: WorkspaceUserState) => {
        const next = prev.widgets.map((widget) =>
          orderByKey.has(widget.key) ? { ...widget, order: orderByKey.get(widget.key) ?? widget.order } : widget,
        );
        return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
      });
    },
    [setLayout],
  );

  const resetLayout = useCallback(() => reset(), [reset]);

  return {
    resolved,
    visibleWidgets,
    availableWidgets,
    isLoading,
    hasErrors,
    updateWidgetState,
    addWidget,
    removeWidget,
    reorderWidgets,
    resetLayout,
  };
}
