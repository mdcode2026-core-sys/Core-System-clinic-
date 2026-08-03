// src/app/(dashboard)/queue/page.tsx
// Phase 4 — Queue Management Module
// Main queue page — simplified, no Tabs

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getQueue, getQueueStats, getActiveDoctors } from "@/domain/queue/queue.queries";
import { LiveQueueBoard } from "@/features/reception/LiveQueueBoard";
import { MyQueueView } from "@/features/doctor/MyQueueView";
import { AmbientKioskView } from "@/features/kiosk/AmbientKioskView";

export default async function QueuePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tenantId = user.user_metadata?.tenant_id as string | undefined;

  if (!tenantId) {
    redirect("/login");
  }

  // Resolve permissions via permission engine
  let permissions: string[] = [];
  try {
    permissions = await getEffectivePermissions(user.id, tenantId);
  } catch (permError) {
    console.error("[QueuePage] Failed to resolve permissions:", permError);
  }

  const canReadSessions = permissions.includes("sessions:read");
  const canUpdateSession = permissions.includes("sessions:update");

  if (!canReadSessions) {
    redirect("/");
  }

  // Fetch queue data
  let queueData: Awaited<ReturnType<typeof getQueue>> = [];
  let statsData: Awaited<ReturnType<typeof getQueueStats>> | null = null;
  let doctorsData: Awaited<ReturnType<typeof getActiveDoctors>> = [];

  try {
    const result = await Promise.all([
      getQueue(),
      getQueueStats(),
      getActiveDoctors(),
    ]);
    queueData = result[0];
    statsData = result[1];
    doctorsData = result[2];
  } catch (error: any) {
    console.error("[QueuePage] Data fetch failed:", error?.message || error);
  }

  // Doctor view determined by permission, not hardcoded role
  const isDoctorView = canUpdateSession;

  if (isDoctorView) {
    return (
      <div className="container mx-auto py-6">
        <MyQueueView canUpdateSession={canUpdateSession} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">لوحة الانتظار</h1>
      <p className="text-muted-foreground">إدارة تدفق المرضى والكشف</p>

      <div>
        <h2 className="text-xl font-semibold mb-4">الاستقبال</h2>
        <LiveQueueBoard
          tenantId={tenantId}
          initialQueue={queueData}
          initialStats={statsData}
          initialDoctors={doctorsData}
          canUpdateSession={canUpdateSession}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">كشك التسجيل</h2>
        <AmbientKioskView />
      </div>
    </div>
  );
}
