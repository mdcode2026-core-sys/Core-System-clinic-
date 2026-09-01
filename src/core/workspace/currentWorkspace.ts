import { createClient } from "@/infrastructure/supabase/server";
import type { WorkspaceSurfaceKey } from "./workspaceSurfaces";

export const BUSINESS_WORKSPACE_KEYS = ["administration", "operation", "clinical"] as const;
export type BusinessWorkspaceKey = (typeof BUSINESS_WORKSPACE_KEYS)[number];

function isBusinessWorkspace(value: string | null | undefined): value is BusinessWorkspaceKey {
  return !!value && (BUSINESS_WORKSPACE_KEYS as readonly string[]).includes(value);
}

/**
 * Workspace assignment is an explicit tenant-user presentation assignment.
 * It is never inferred from Role or effective Permissions at runtime.
 */
export async function getAssignedWorkspace(userId: string): Promise<BusinessWorkspaceKey | null> {
  const supabase = await createClient();
  const { data: membership, error } = await supabase
    .from("clinic_user_workspaces")
    .select("workspace")
    .eq("user_id", userId)
    .eq("is_default", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return null;
  return isBusinessWorkspace(membership?.workspace) ? membership.workspace : null;
}

export function workspaceRoute(workspace: BusinessWorkspaceKey): string {
  return `/${workspace}`;
}

export function isWorkspaceSurfaceKey(value: string | null | undefined): value is WorkspaceSurfaceKey {
  return value === "administration" || value === "operation" || value === "clinical" || value === "global";
}
