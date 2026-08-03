// src/app/(dashboard)/follow-up/page.tsx
// Package 3.1.9 — Follow-up Module Route
// Server-side permission guard + data fetch; delegates rendering to feature layer.

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { listFollowups, getScheduledFollowups } from "@/domain/followup/followup.queries";
import { FollowupShell } from "@/features/followup/followup-shell";

export default async function FollowUpPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const tenantId = user.user_metadata?.tenant_id as string | undefined;
  if (!tenantId) {
    redirect("/login");
  }

  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("followup:read")) {
    redirect("/");
  }

  const [listResult, scheduledResult] = await Promise.all([
    listFollowups(),
    getScheduledFollowups(),
  ]);

  const listData = listResult.success ? listResult.data : [];
  const scheduledData = scheduledResult.success ? scheduledResult.data : [];
  const errorMessage = !listResult.success ? listResult.error : !scheduledResult.success ? scheduledResult.error : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">المتابعة</h1>
        <p className="text-sm text-muted-foreground">إدارة متابعات المرضى والمواعيد</p>
      </div>

      <FollowupShell
        initialList={listData}
        initialScheduled={scheduledData}
        initialError={errorMessage}
        canUpdate={permissions.includes("followup:update")}
      />
    </div>
  );
}
