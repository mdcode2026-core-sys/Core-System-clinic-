// src/features/dashboard/DashboardShell.tsx
// Compatibility shim — re-exports WorkspaceShell.
// Per WORKSPACE_ARCHITECTURE_SPECIFICATION.md §19 (Legacy Files / Compatibility Rule).
// DELETE this file once a project-wide search confirms zero remaining imports
// to the old path "@/features/dashboard/DashboardShell".

export { WorkspaceShell as default } from "@/features/workspace/WorkspaceShell";
export { WorkspaceShell } from "@/features/workspace/WorkspaceShell";
