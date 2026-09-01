import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace, workspaceRoute } from "@/core/workspace/currentWorkspace";
import { HomeOverview } from "@/features/home/HomeOverview";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  const tenantResult = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).maybeSingle();
  const tenantId = tenantResult.data?.tenant_id;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  let appointmentsToday = 0;
  if (tenantId) {
    const { count } = await supabase
      .from("master_agenda_events")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("scheduled_start", start.toISOString())
      .lt("scheduled_start", end.toISOString())
      .not("status", "in", "(cancelled,no_show)");
    appointmentsToday = count ?? 0;
  }

  return <HomeOverview appointmentsToday={appointmentsToday} workspaceHref={assignedWorkspace ? workspaceRoute(assignedWorkspace) : null} />;
}
