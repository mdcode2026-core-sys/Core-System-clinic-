// src/core/workspace/workspace.constants.ts
// Workspace Architecture — Fixed Values
// Per WORKSPACE_ARCHITECTURE_SPECIFICATION.md §7, §12

import type { WidgetSize, WidgetState } from "./workspace.types";

// Layer labels (for UI chrome, not logic)
export const LAYER_LABELS = {
  2: "Quick Actions",
  3: "Status & Analytics",
} as const;

export const LAYER_LABELS_AR = {
  2: "إجراءات سريعة",
  3: "الحالة والتحليلات",
} as const;

// Default sizes per category (§7)
export const DEFAULT_SIZES: Record<string, WidgetSize> = {
  interactive: { width: "half", height: "standard" },
  workflow: { width: "half", height: "standard" },
  informational: { width: "third", height: "compact" },
  analytics: { width: "half", height: "tall" },
  communication: { width: "third", height: "compact" },
  system: { width: "quarter", height: "compact" },
  reports: { width: "half", height: "tall" },
};

// Valid state transitions (§12)
export const VALID_STATE_TRANSITIONS: Record<WidgetState, WidgetState[]> = {
  visible: ["hidden", "collapsed", "pinned", "loading", "error"],
  hidden: ["visible"],
  collapsed: ["visible", "pinned", "hidden"],
  pinned: ["visible", "collapsed", "hidden"],
  disabled: ["visible"],
  loading: ["visible", "error"],
  error: ["loading", "visible", "hidden"],
};

// localStorage key prefix
export const WORKSPACE_STORAGE_PREFIX = "clinic_workspace_v1";

// Max widgets per layer (soft guard, not enforced)
export const MAX_WIDGETS_PER_LAYER = 12;
