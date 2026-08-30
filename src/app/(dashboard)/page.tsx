// src/app/(dashboard)/page.tsx
// Workspace entry point. The user lands in the Workspace assigned to them.
// Home is not used as the user's default business Workspace.

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace, workspaceRoute } from "@/core/workspace/currentWorkspace";

export default async function WorkspaceEntryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  if (!assignedWorkspace) {
    redirect("/settings");
  }

  redirect(workspaceRoute(assignedWorkspace));
}
