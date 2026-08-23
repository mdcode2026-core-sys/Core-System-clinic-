// src/core/workspace/workspace.types.ts
// Workspace Architecture — Type Definitions

import type { ComponentType } from "react";
import type { Permission } from "@/core/permissions/types";
import type { FeatureModuleKey } from "@/core/features/types";

export type WidgetCategory =
  | "informational"
  | "interactive"
  | "workflow"
  | "communication"
  | "system"
  | "analytics"
  | "reports";

export type WidgetLayer = 2 | 3;

export type WidgetState =
  | "visible"
  | "hidden"
  | "collapsed"
  | "pinned"
  | "disabled"
  | "loading"
  | "error";

export type WidgetSize = {
  width: "full" | "half" | "third" | "quarter";
  height: "auto" | "compact" | "standard" | "tall";
};

export interface WorkspaceContext {
  tenantId?: string;
  patientId?: string;
  visitId?: string;
  workspaceKey?: string;
}

export interface WidgetDefinition {
  key: string;
  label: string;
  labelAr: string;
  category: WidgetCategory;
  layer: WidgetLayer;
  defaultSize: WidgetSize;
  requiredPermission: Permission;
  moduleKey: FeatureModuleKey;
  component: ComponentType<WidgetComponentProps>;
  defaultWorkspaces?: string[];
  contextual?: boolean;
}

export interface WidgetComponentProps {
  widget: WidgetDefinition;
  state: WidgetState;
  onStateChange: (newState: WidgetState) => void;
  context?: WorkspaceContext;
}

export interface WidgetLayoutEntry {
  key: string;
  order: number;
  size: WidgetSize;
  state: WidgetState;
}

export interface WorkspaceUserState {
  widgets: WidgetLayoutEntry[];
  lastUpdated: string;
}

export interface ResolvedWidget {
  definition: WidgetDefinition;
  layout: WidgetLayoutEntry;
  isVisible: boolean;
}
