import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace } from "@/core/workspace/currentWorkspace";
import { WorkspaceRenderer } from "@/features/workspace/WorkspaceRenderer";

export default async function AdministrationWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  if (assignedWorkspace !== "administration") redirect("/");

  return <WorkspaceRenderer workspaceKey="administration" />;
}
