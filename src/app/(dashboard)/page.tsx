// src/app/(dashboard)/page.tsx
// Global/Home route — the user's Workspace, not the management Dashboard.
// Renders through WorkspaceRenderer + widgetRegistry instead of hardcoded JSX.

import { WorkspaceRenderer } from "@/features/workspace/WorkspaceRenderer";

export default function WorkspaceHomePage() {
  return <WorkspaceRenderer />;
}
