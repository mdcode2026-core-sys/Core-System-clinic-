// src/app/(dashboard)/queue/page.tsx
// Package 3.1.4 — Queue Migration & Critical Bug Closure
// Removed hardcoded isDoctor; uses permission engine

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getQueue, getQueueStats, getActiveDoctors } from "@/domain/queue/queue.queries";
import { LiveQueueBoard } from "@@/features/reception/LiveQueueBoard";
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

  // Resolve effective permissions via permission engine
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

  // Fetch queue data — errors logged but not redirected to prevent false loop
  let queueData: Awaited<ReturnType<typeof getQueue>> = [];
  let statsData: Awaited<ReturnType<typeof getQueueStats>> | null = null;
  let doctorsData: Awaited<ReturnType<typeof getActiveDoctors>> = [];

  try {
    [queueData, statsData, doctorsData] = await Promise.all([
      getQueue(),
      getQueueStats(),
      getActiveDoctors(),
    ]);
  } catch (error: any) {
    console.error("[QueuePage] Data fetch failed:", error?.message || error);
    // Render with empty data instead of redirecting to login
  }

  // Doctor view: user has sessions:update (can call/complete/hold/resume)
  const isDoctorView = canUpdateSession;

  if (isDoctorView) {
    return (
      <MyQueueView
        initialSessions={queueData}
        initialStats={statsData}
        canUpdateSession={canUpdateSession}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة الانتظار</h1>
          <p className="text-muted-foreground">إدارة تدفق المرضى والكشف</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveQueueBoard
            initialSessions={queueData}
            initialStats={statsData}
            initialDoctors={doctorsData}
            canUpdateSession={canUpdateSession}
          />
        </div>
        <div>
          <AmbientKioskView tenantId={tenantId} />
        </div>
      </div>
    </div>
  );
}
