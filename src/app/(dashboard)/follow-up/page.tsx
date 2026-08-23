// src/app/(dashboard)/follow-up/page.tsx
// PJ Stage 9 — Follow-up Work Management route

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getFollowupWorkQueue, listFollowupPatients, listFollowups } from "@/domain/followup/followup.queries";
import { FollowupShell } from "@/features/followup/followup-shell";

export default async function FollowUpPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("followup:read")) redirect("/");

  const [listResult, scheduledResult, patientsResult] = await Promise.all([
    listFollowups(), getFollowupWorkQueue(), permissions.includes("followup:create") ? listFollowupPatients() : Promise.resolve({ success: true as const, data: [] }),
  ]);
  const listData = listResult.success ? listResult.data : [];
  const scheduledData = scheduledResult.success ? scheduledResult.data : [];
  const patients = patientsResult.success ? patientsResult.data : [];
  const errorMessage = !listResult.success ? listResult.error : !scheduledResult.success ? scheduledResult.error : !patientsResult.success ? patientsResult.error : null;

  return <div className="space-y-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">المتابعة</h1><p className="text-sm text-muted-foreground">إدارة متابعات المرضى ومهام المتابعة اليومية</p></div><FollowupShell initialList={listData} initialScheduled={scheduledData} patients={patients} initialError={errorMessage} canCreate={permissions.includes("followup:create")} canUpdate={permissions.includes("followup:update")} /></div>;
}
