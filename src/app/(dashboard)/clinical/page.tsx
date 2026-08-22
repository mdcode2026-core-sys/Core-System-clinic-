import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getQueue } from "@/domain/queue/queue.queries";
import { ClinicalWorkspace } from "@/features/workspaces/ClinicalWorkspace";

export default async function ClinicalWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");

  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("workspace:clinical" as never)) redirect("/");

  const queue = await getQueue();
  return (
    <div className="container mx-auto py-6">
      <ClinicalWorkspace initialQueue={queue} />
    </div>
  );
}
