// src/app/(dashboard)/follow-up/page.tsx
// PJ Stage 9 — Follow-up Work Management route

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { listFollowupPatients, listFollowups } from "@/domain/followup/followup.queries";
import { FollowupShell } from "@/features/followup/followup-shell";
import { FollowupPageHeader } from "@/features/followup/FollowupPageHeader";

export default async function FollowUpPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("followup:read")) redirect("/");

  // One canonical follow-up read feeds all three views. Work and Scheduled are filtered client-side,
  // so the page must not fetch and serialize the same tenant-wide follow-up rows twice.
  const [listResult, patientsResult] = await Promise.all([
    listFollowups(), permissions.includes("followup:create") ? listFollowupPatients() : Promise.resolve({ success: true as const, data: [] }),
  ]);
  const listData = listResult.success ? listResult.data : [];
  const scheduledData = listData;
  const patients = patientsResult.success ? patientsResult.data : [];
  const errorMessage = !listResult.success ? listResult.error : !patientsResult.success ? patientsResult.error : null;

  return <div className="space-y-6"><FollowupPageHeader /><FollowupShell initialList={listData} initialScheduled={scheduledData} patients={patients} initialError={errorMessage} canCreate={permissions.includes("followup:create")} canUpdate={permissions.includes("followup:update")} /></div>;
}
