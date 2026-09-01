import { createClient } from "@/infrastructure/supabase/server";
import { getQueue } from "@/domain/queue/queue.queries";
import { PatientFlowBoard } from "@/features/patient-flow/PatientFlowBoard";

export default async function PatientFlowOperationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const queue = await getQueue();
  return <PatientFlowBoard context="operations" initialQueue={queue} />;
}
