"use client";

import { useCallback, useEffect, useState } from "react";
import type { WidgetLayoutEntry, WorkspaceUserState } from "../workspace.types";
import { WORKSPACE_STORAGE_PREFIX } from "../workspace.constants";
import { createClient } from "@/infrastructure/supabase/client";

const DEFAULT_STATE: WorkspaceUserState = {
  widgets: [],
  lastUpdated: new Date().toISOString(),
};

function getStorageKey(userId: string | undefined): string {
  if (!userId) return `${WORKSPACE_STORAGE_PREFIX}_anonymous`;
  return `${WORKSPACE_STORAGE_PREFIX}_${userId}`;
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

export function useWidgetPersistence(): UseWidgetPersistenceResult {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const storageKey = getStorageKey(userId);

  const [layout, setInternalLayout] = useState<WorkspaceUserState>(() =>
    readFromStorage(storageKey)
  );

  useEffect(() => {
    writeToStorage(storageKey, layout);
  }, [storageKey, layout]);

  useEffect(() => {
    setInternalLayout(readFromStorage(storageKey));
  }, [storageKey]);

  const setLayout = useCallback(
    (updater: (prev: WorkspaceUserState) => WorkspaceUserState) => {
      setInternalLayout((prev) => updater(prev));
    },
    []
  );

  const reset = useCallback(() => {
    setInternalLayout(DEFAULT_STATE);
  }, []);

  return { layout, setLayout, reset };
}
