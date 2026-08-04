import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { ReportsShell } from "@/features/reports/reports-shell";

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Server-side guard: reports:read
  const { data: clinicUsers } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1);

  const tenantId = clinicUsers?.[0]?.tenant_id;
  if (!tenantId) {
    redirect("/");
  }

  const perms = await getEffectivePermissions(user.id, tenantId);
  if (!perms.includes("reports:read")) {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">التقارير</h1>
      <ReportsShell />
    </div>
  );
}
