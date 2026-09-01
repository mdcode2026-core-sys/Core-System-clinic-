import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace } from "@/core/workspace/currentWorkspace";
import { getQueue } from "@/domain/queue/queue.queries";
import { OperationWorkspace } from "@/features/workspaces/OperationWorkspace";

export default async function OperationWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if ((await getAssignedWorkspace(user.id)) !== "operation") redirect("/");
  const queue = await getQueue();
  return <div className="container mx-auto py-6"><OperationWorkspace initialQueue={queue} /></div>;
}
