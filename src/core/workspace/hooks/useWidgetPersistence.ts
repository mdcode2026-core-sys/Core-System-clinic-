"use client";

import { useCallback, useEffect, useState } from "react";
import type { WidgetLayoutEntry, WorkspaceUserState } from "../workspace.types";
import type { WorkspaceSurfaceKey } from "../workspaceSurfaces";
import { WORKSPACE_STORAGE_PREFIX } from "../workspace.constants";
import { createClient } from "@/infrastructure/supabase/client";

const DEFAULT_STATE: WorkspaceUserState = {
  widgets: [],
  lastUpdated: new Date().toISOString(),
};

function getStorageKey(userId: string | undefined, workspaceKey: WorkspaceSurfaceKey): string {
  const identity = userId ?? "anonymous";
  return `${WORKSPACE_STORAGE_PREFIX}_${identity}_${workspaceKey}`;
}

function readFromStorage(key: string): WorkspaceUserState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as WorkspaceUserState;
    if (!parsed.widgets || !Array.isArray(parsed.widgets)) return DEFAULT_STATE;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function writeToStorage(key: string, state: WorkspaceUserState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage full or private mode — silently fail
  }
}

export interface UseWidgetPersistenceResult {
  layout: WorkspaceUserState;
  setLayout: (updater: (prev: WorkspaceUserState) => WorkspaceUserState) => void;
  reset: () => void;
}

/**
 * Persist presentation state per authenticated user and Workspace surface.
 * Workspace personalization remains a presentation concern and never grants
 * access. Per-surface storage prevents a preference on Home from silently
 * changing the working layout of Operations or Clinical.
 */
export function useWidgetPersistence(workspaceKey: WorkspaceSurfaceKey = "global"): UseWidgetPersistenceResult {
  const initialKey = getStorageKey(undefined, workspaceKey);
  const [storageKey, setStorageKey] = useState<string>(initialKey);
  const [layout, setInternalLayout] = useState<WorkspaceUserState>(() => readFromStorage(initialKey));

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const resolvedKey = getStorageKey(data.user?.id, workspaceKey);
      setStorageKey(resolvedKey);
      setInternalLayout(readFromStorage(resolvedKey));
    });
    return () => {
      cancelled = true;
    };
  }, [workspaceKey]);

  useEffect(() => {
    writeToStorage(storageKey, layout);
  }, [storageKey, layout]);

  const setLayout = useCallback(
    (updater: (prev: WorkspaceUserState) => WorkspaceUserState) => {
      setInternalLayout((prev) => updater(prev));
    },
    [],
  );

  const reset = useCallback(() => {
    setInternalLayout(DEFAULT_STATE);
  }, []);

  return { layout, setLayout, reset };
}
