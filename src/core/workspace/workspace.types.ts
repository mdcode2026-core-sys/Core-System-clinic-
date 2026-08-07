// src/core/workspace/workspace.types.ts
// Workspace Architecture — Type Definitions
// Per WORKSPACE_ARCHITECTURE_SPECIFICATION.md §7

import type { ComponentType } from "react";

// §6 — Widget categories
export type WidgetCategory =
  | "informational"
  | "interactive"
  | "workflow"
  | "communication"
  | "system"
  | "analytics"
  | "reports";

// §7 — Widget layer (2 = quick actions, 3 = deep status)
export type WidgetLayer = 2 | 3;

// §12 — Widget visual state
export type WidgetState =
  | "visible"
  | "hidden"
  | "collapsed"
  | "pinned"
  | "disabled"
  | "loading"
  | "error";

// §7 — Widget size contract
export interface WidgetSize {
  width: "full" | "half" | "third" | "quarter";
  height: "auto" | "compact" | "standard" | "tall";
}

// §7 — Core widget definition (registry entry)
export interface WidgetDefinition {
  /** Unique widget key (kebab-case, stable forever) */
  key: string;
  /** Display label (English) */
  label: string;
  /** Display label (Arabic) */
  labelAr: string;
  /** §6 category */
  category: WidgetCategory;
  /** §7 layer — 2 (interactive/quick) or 3 (informational/status) */
  layer: WidgetLayer;
  /** Default render size */
  defaultSize: WidgetSize;
  /** Permission key required to see this widget */
  requiredPermission: string;
  /** Feature module key for feature-flag gating */
  moduleKey: string;
  /** Lazy-loaded component reference */
  component: ComponentType<WidgetComponentProps>;
}

// Props passed to every widget component by WidgetContainer
export interface WidgetComponentProps {
  /** The widget's own definition */
  widget: WidgetDefinition;
  /** Current visual state */
  state: WidgetState;
  /** Callback to change state */
  onStateChange: (newState: WidgetState) => void;
}

// Per-user persisted layout entry
export interface WidgetLayoutEntry {
  key: string;
  order: number;
  size: WidgetSize;
  state: WidgetState;
}

// Full persisted workspace state for one user
export interface WorkspaceUserState {
  widgets: WidgetLayoutEntry[];
  lastUpdated: string; // ISO timestamp
}

// Resolved widget ready for rendering
export interface ResolvedWidget {
  definition: WidgetDefinition;
  layout: WidgetLayoutEntry;
  isVisible: boolean;
}
