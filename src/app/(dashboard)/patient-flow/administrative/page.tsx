import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getQueue } from "@/domain/queue/queue.queries";
import { PatientFlowBoard } from "@/features/patient-flow/PatientFlowBoard";

export default async function PatientFlowAdministrativePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("patient_flow:administrative") || !permissions.includes("sessions:read")) redirect("/patient-flow");
  const queue = await getQueue();
  return <PatientFlowBoard context="administrative" initialQueue={queue} />;
}
