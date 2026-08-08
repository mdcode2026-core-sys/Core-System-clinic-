// src/core/workspace/workspaceEngine.ts
// Workspace Architecture — Pure Engine
//
// This file is intentionally free of React, hooks, and I/O (no Supabase,
// no async, no "use client"). It exists to be trivially testable and
// deterministic: same inputs -> same output, every time.
//
// The orchestration Hook that resolves permissions/feature-flags (async)
// and then calls this pure function lives in hooks/useWorkspace.ts.

import type { WidgetDefinition } from "./workspace.types";
import type { Permission } from "@/core/permissions/types";

export interface VisibilityResult {
  definition: WidgetDefinition;
  isVisible: boolean;
  reason: "permission" | "feature" | "user_hidden" | "visible";
}

export function resolveWidgetVisibility(
  widget: WidgetDefinition,
  hasPermission: (perm: Permission) => boolean,
  isFeatureEnabledFn: (moduleKey: WidgetDefinition["moduleKey"]) => boolean,
  userHiddenKeys: Set<string>
): VisibilityResult {
  if (!hasPermission(widget.requiredPermission)) {
    return { definition: widget, isVisible: false, reason: "permission" };
  }
  if (!isFeatureEnabledFn(widget.moduleKey)) {
    return { definition: widget, isVisible: false, reason: "feature" };
  }
  if (userHiddenKeys.has(widget.key)) {
    return { definition: widget, isVisible: false, reason: "user_hidden" };
  }
  return { definition: widget, isVisible: true, reason: "visible" };
}
