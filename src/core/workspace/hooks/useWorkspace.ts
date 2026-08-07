// src/core/workspace/hooks/useWorkspace.ts
// Workspace Architecture — Main workspace hook

import { useCallback, useMemo } from "react";
import type { WidgetLayoutEntry, WidgetState, WorkspaceUserState } from "../workspace.types";
import { useWorkspaceEngine } from "../workspaceEngine";
import { useWidgetPersistence } from "./useWidgetPersistence";

export interface UseWorkspaceResult {
  resolved: ReturnType<typeof useWorkspaceEngine>["resolved"];  // ✅ تم التصحيح
  visibleWidgets: ReturnType<typeof useWorkspaceEngine>["visibleWidgets"];  // ✅ تم التصحيح
  isLoading: boolean;
  hasErrors: boolean;
  updateWidgetState: (key: string, state: WidgetState) => void;
  reorderWidgets: (orderedKeys: string[]) => void;
  resetLayout: () => void;
}

export function useWorkspace(): UseWorkspaceResult {
  const { layout, setLayout, reset } = useWidgetPersistence();
  const engine = useWorkspaceEngine(layout.widgets);

  const updateWidgetState = useCallback(
    (key: string, state: WidgetState) => {
      setLayout((prev) => {
        const idx = prev.widgets.findIndex((w) => w.key === key);
        if (idx === -1) {
          return {
            ...prev,
            widgets: [
              ...prev.widgets,
              { key, order: prev.widgets.length, size: { width: "half", height: "standard" }, state },
            ],
            lastUpdated: new Date().toISOString(),
          };
        }
        const next = [...prev.widgets];
        next[idx] = { ...next[idx], state };
        return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
      });
    },
    [setLayout]
  );

  const reorderWidgets = useCallback(
    (orderedKeys: string[]) => {
      setLayout((prev) => {
        const next = prev.widgets.map((w) => {
          const newOrder = orderedKeys.indexOf(w.key);
          return newOrder >= 0 ? { ...w, order: newOrder } : w;
        });
        return { ...prev, widgets: next, lastUpdated: new Date().toISOString() };
      });
    },
    [setLayout]
  );

  const resetLayout = useCallback(() => {
    reset();
  }, [reset]);

  return {
    resolved: engine.resolved,
    visibleWidgets: engine.visibleWidgets,
    isLoading: engine.isLoading,
    hasErrors: engine.hasErrors,
    updateWidgetState,
    reorderWidgets,
    resetLayout,
  };
}
