// src/app/(dashboard)/page.tsx
// Workspace Architecture — Dashboard home route
// Renders through WorkspaceRenderer + widgetRegistry instead of hardcoded JSX.
// Per Package 3.1.1: this file replaces the need for src/app/page.tsx redirect.

import { WorkspaceRenderer } from "@/features/workspace/WorkspaceRenderer";

export default function DashboardPage() {
  return <WorkspaceRenderer />;
}
