// src/core/workspace/hooks/useWorkspace.ts
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
  layout: WorkspaceUserState;
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

export function useWorkspace(workspaceKey: WorkspaceSurfaceKey = "global"): UseWorkspaceResult {
  const { layout, setLayout, reset } = useWidgetPersistence(workspaceKey);
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const moduleKeys = useMemo(() => Array.from(new Set(widgetRegistry.map((w) => w.moduleKey))), []);
  const { isFeatureEnabled, isLoading: featuresLoading } = useFeatureFlags(moduleKeys);
  const isLoading = permissionsLoading || featuresLoading;

  const surfaceWidgets = useMemo(
    () => widgetRegistry.filter((widget) => !widget.defaultWorkspaces || widget.defaultWorkspaces.includes(workspaceKey)),
    [workspaceKey],
  );

  const userHiddenKeys = useMemo(() => {
    const hidden = new Set<string>();
    for (const entry of layout.widgets) if (entry.state === "hidden") hidden.add(entry.key);
    return hidden;
  }, [layout.widgets]);

  const resolved = useMemo(() => {
    if (isLoading) return [];
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
    results.sort((a, b) => a.layout.order - b.layout.order || a.definition.layer - b.definition.layer);
    return results;
  }, [isLoading, hasPermission, isFeatureEnabled, userHiddenKeys, layout.widgets, surfaceWidgets]);

  const availableWidgets = useMemo(() => {
    if (isLoading) return [];
    return widgetRegistry.filter((widget) => hasPermission(widget.requiredPermission) && isFeatureEnabled(widget.moduleKey));
  }, [isLoading, hasPermission, isFeatureEnabled]);

  const visibleWidgets = useMemo(() => resolved.filter((r) => r.isVisible), [resolved]);
  const hasErrors = useMemo(() => resolved.some((r) => r.layout.state === "error"), [resolved]);

  const updateWidgetState = useCallback((key: string, state: WidgetState) => {
    setLayout((prev) => {
      const idx = prev.widgets.findIndex((w) => w.key === key);
      if (idx === -1) {
        const definition = widgetRegistry.find((widget) => widget.key === key);
        if (!definition) return prev;
        return { ...prev, widgets: [...prev.widgets, { key, order: prev.widgets.length, size: definition.defaultSize, state }], lastUpdated: new Date().toISOString() };
      }
      const next = [...prev.widgets];
      next[idx] = { ...next[idx], state };
      return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
    });
  }, [setLayout]);

  const addWidget = useCallback((key: string) => {
    const definition = widgetRegistry.find((widget) => widget.key === key);
    if (!definition || !hasPermission(definition.requiredPermission) || !isFeatureEnabled(definition.moduleKey)) return;
    setLayout((prev) => {
      const existing = prev.widgets.find((w) => w.key === key);
      if (existing) {
        return { ...prev, widgets: prev.widgets.map((w) => w.key === key ? { ...w, state: "visible" as WidgetState } : w), lastUpdated: new Date().toISOString() };
      }
      return { ...prev, widgets: [...prev.widgets, { key, order: prev.widgets.length, size: definition.defaultSize, state: "visible" }], lastUpdated: new Date().toISOString() };
    });
  }, [hasPermission, isFeatureEnabled, setLayout]);

  const removeWidget = useCallback((key: string) => {
    setLayout((prev) => ({ ...prev, widgets: prev.widgets.map((w) => w.key === key ? { ...w, state: "hidden" as WidgetState } : w), lastUpdated: new Date().toISOString() }));
  }, [setLayout]);

  const reorderWidgets = useCallback((orderedKeys: string[]) => {
    setLayout((prev) => {
      const positions = new Map(orderedKeys.map((key, index) => [key, index]));
      return { ...prev, widgets: prev.widgets.map((w) => positions.has(w.key) ? { ...w, order: positions.get(w.key)! } : w), lastUpdated: new Date().toISOString() };
    });
  }, [setLayout]);

  const resetLayout = useCallback(() => reset(), [reset]);

  return { layout, resolved, visibleWidgets, availableWidgets, isLoading, hasErrors, updateWidgetState, addWidget, removeWidget, reorderWidgets, resetLayout };
}
