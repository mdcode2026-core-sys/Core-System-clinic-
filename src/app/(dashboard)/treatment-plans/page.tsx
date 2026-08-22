import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { TreatmentPlanWorkspace } from "@/features/treatment-plans/TreatmentPlanWorkspace";

export default async function TreatmentPlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("treatment_plans:read")) redirect("/");
  return <div className="container mx-auto py-6"><TreatmentPlanWorkspace /></div>;
}
