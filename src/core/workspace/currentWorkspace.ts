import { createClient } from "@/infrastructure/supabase/server";
import type { WorkspaceSurfaceKey } from "./workspaceSurfaces";

export const BUSINESS_WORKSPACE_KEYS = ["administration", "operation", "clinical"] as const;
export type BusinessWorkspaceKey = (typeof BUSINESS_WORKSPACE_KEYS)[number];

function isBusinessWorkspace(value: string | null | undefined): value is BusinessWorkspaceKey {
  return !!value && (BUSINESS_WORKSPACE_KEYS as readonly string[]).includes(value);
}

/**
 * Workspace is an explicit user-level presentation assignment.
 * It is never inferred from Role, job title, or permissions.
 * Permissions control capabilities inside the assigned Workspace.
 *
 * Auth identity and clinic user identity are different IDs:
 * auth.users.id -> clinic_users.auth_user_id -> clinic_user_workspaces.user_id.
 */
export async function getAssignedWorkspace(userId: string): Promise<BusinessWorkspaceKey | null> {
  const supabase = await createClient();

  const { data: clinicUser, error: clinicUserError } = await supabase
    .from("clinic_users")
    .select("id")
    .eq("auth_user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (clinicUserError || !clinicUser?.id) return null;

  const { data: defaultMembership } = await supabase
    .from("clinic_user_workspaces")
    .select("workspace")
    .eq("user_id", clinicUser.id)
    .eq("is_default", true)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (isBusinessWorkspace(defaultMembership?.workspace)) return defaultMembership.workspace;

  // Preserve compatibility with existing assignments that predate the default flag.
  const { data: anyMembership } = await supabase
    .from("clinic_user_workspaces")
    .select("workspace")
    .eq("user_id", clinicUser.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  return isBusinessWorkspace(anyMembership?.workspace) ? anyMembership.workspace : null;
}

export function workspaceRoute(workspace: BusinessWorkspaceKey): string {
  return `/${workspace}`;
}

export function isWorkspaceSurfaceKey(value: string | null | undefined): value is WorkspaceSurfaceKey {
  return value === "administration" || value === "operation" || value === "clinical" || value === "global";
}
