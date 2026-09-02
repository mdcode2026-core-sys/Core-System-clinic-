import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace, workspaceRoute } from "@/core/workspace/currentWorkspace";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import { WorkspaceRenderer } from "@/features/workspace/WorkspaceRenderer";

export default async function AdministrationWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  if (assignedWorkspace !== "administration") redirect(assignedWorkspace ? workspaceRoute(assignedWorkspace) : "/");

  if (!(await hasEffectivePermission("workspace:administration", user.id))) redirect("/");

  return <WorkspaceRenderer workspaceKey="administration" />;
}
