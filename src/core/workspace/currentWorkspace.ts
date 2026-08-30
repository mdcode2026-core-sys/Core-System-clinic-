import { createClient } from "@/infrastructure/supabase/server";
import type { WorkspaceSurfaceKey } from "./workspaceSurfaces";

export const BUSINESS_WORKSPACE_KEYS = ["administration", "operation", "clinical"] as const;
export type BusinessWorkspaceKey = (typeof BUSINESS_WORKSPACE_KEYS)[number];

function isBusinessWorkspace(value: string | null | undefined): value is BusinessWorkspaceKey {
  return !!value && (BUSINESS_WORKSPACE_KEYS as readonly string[]).includes(value);
}

/**
 * The assigned/default Workspace is a user-level presentation assignment.
 * It is intentionally read from clinic_user_workspaces, not inferred from
 * effective permissions. Permissions control capabilities inside a Workspace.
 */
export async function getAssignedWorkspace(userId: string): Promise<BusinessWorkspaceKey | null> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("clinic_user_workspaces")
    .select("workspace")
    .eq("user_id", userId)
    .eq("is_default", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (isBusinessWorkspace(membership?.workspace)) return membership.workspace;

  // Compatibility fallback for older users whose workspace membership was not
  // backfilled. This is not the authoritative assignment mechanism.
  const { data: legacyUser } = await supabase
    .from("clinic_users")
    .select("role, role_id, roles:role_id(workspace)")
    .eq("auth_user_id", userId)
    .maybeSingle();

  const role = Array.isArray(legacyUser?.roles) ? legacyUser.roles[0] : legacyUser?.roles;
  if (isBusinessWorkspace(role?.workspace)) return role.workspace;
  if (legacyUser?.role === "clinic_admin") return "administration";
  return null;
}

export function workspaceRoute(workspace: BusinessWorkspaceKey): string {
  return `/${workspace}`;
}

export function isWorkspaceSurfaceKey(value: string | null | undefined): value is WorkspaceSurfaceKey {
  return value === "administration" || value === "operation" || value === "clinical" || value === "global";
}
