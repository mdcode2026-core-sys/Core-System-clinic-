import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { EntitlementAwareWorkspaceShell } from "@/features/workspace/EntitlementAwareWorkspaceShell";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { DirectionProvider } from "@/components/DirectionProvider";
import { getAssignedWorkspace } from "@/core/workspace/currentWorkspace";
import { isClinicAdminUser } from "@/core/permissions/permissionEngine";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  const clinicUserResult = await supabase.from("clinic_users").select("id,tenant_id").eq("auth_user_id", user.id).maybeSingle();
  const clinicAdmin = !!clinicUserResult.data?.tenant_id && await isClinicAdminUser(user.id, clinicUserResult.data.tenant_id);
  let showPatientFlow = false;
  if (clinicAdmin && clinicUserResult.data) {
    const { data: settings } = await supabase.from("clinic_user_settings").select("preferences").eq("tenant_id", clinicUserResult.data.tenant_id).eq("user_id", clinicUserResult.data.id).maybeSingle();
    const preferences = settings?.preferences && typeof settings.preferences === "object" && !Array.isArray(settings.preferences) ? settings.preferences as Record<string, unknown> : {};
    showPatientFlow = preferences.show_patient_flow !== false;
  }

  return <AuthProvider><DirectionProvider><EntitlementAwareWorkspaceShell user={user} assignedWorkspace={assignedWorkspace} clinicAdmin={clinicAdmin} showPatientFlow={showPatientFlow}>{children}</EntitlementAwareWorkspaceShell></DirectionProvider></AuthProvider>;
}
