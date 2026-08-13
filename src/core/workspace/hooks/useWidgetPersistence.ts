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
  // storageKey and layout are hydrated together once the real user id
  // resolves, inside the async callback below — not synchronously in the
  // effect body. This also removes a real race that existed previously:
  // a separate "re-read on storageKey change" effect could run interleaved
  // with the "write on layout change" effect and persist the anonymous
  // layout under the newly-resolved user key.
  const [storageKey, setStorageKey] = useState<string>(() => getStorageKey(undefined));
  const [layout, setInternalLayout] = useState<WorkspaceUserState>(() =>
    readFromStorage(getStorageKey(undefined))
  );

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const resolvedKey = getStorageKey(data.user?.id);
      setStorageKey(resolvedKey);
      setInternalLayout(readFromStorage(resolvedKey));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeToStorage(storageKey, layout);
  }, [storageKey, layout]);

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
