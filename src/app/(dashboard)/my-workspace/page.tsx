import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace, workspaceRoute } from "@/core/workspace/currentWorkspace";

export default async function MyWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  if (assignedWorkspace) redirect(workspaceRoute(assignedWorkspace));
  redirect("/");
}
