// src/app/(dashboard)/layout.tsx
// Workspace Architecture — Dashboard layout
// Updated to import WorkspaceShell from new path.

import { WorkspaceShell } from "@/features/workspace/WorkspaceShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
