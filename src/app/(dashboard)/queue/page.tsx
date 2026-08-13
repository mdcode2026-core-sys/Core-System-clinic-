// src/app/(dashboard)/queue/page.tsx
// Phase 4 — Queue Management Module
// Main queue page — simplified, no Tabs

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
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

  const tenantId = await resolveTenantId(user.id);

  if (!tenantId) {
    redirect("/login");
  }

  // Permission engine guard
  let permissions: string[] = [];
  try {
    permissions = await getEffectivePermissions(user.id, tenantId);
  } catch (permError) {
    console.error("[QueuePage] Failed to resolve permissions:", permError);
  }

  const canReadSessions = permissions.includes("sessions:read");

  if (!canReadSessions) {
    redirect("/");
  }

  // Data fetching happens in its own try/catch, with no JSX constructed
  // inside it. React defers actual rendering of <MyQueueView />,
  // <LiveQueueBoard />, and <AmbientKioskView /> until later in the
  // reconciler, so a try/catch wrapped around JSX never actually catches
  // errors thrown while rendering those components — it only looked like
  // it did. Keeping the try/catch scoped to the awaited data calls below
  // means it catches exactly what it appears to catch.
  let queueData: Awaited<ReturnType<typeof getQueue>>;
  let statsData: Awaited<ReturnType<typeof getQueueStats>>;
  let doctorsData: Awaited<ReturnType<typeof getActiveDoctors>>;

  try {
    [queueData, statsData, doctorsData] = await Promise.all([
      getQueue(),
      getQueueStats(),
      getActiveDoctors(),
    ]);
  } catch (error) {
    console.error("[QueuePage] Failed to load queue data:", error);
    redirect("/login");
  }

  // View selection: use actual role from user metadata, NOT permission key
  // sessions:update is shared by clinic_admin and doctor for different reasons
  const isDoctor = user.user_metadata?.role === "doctor";

  if (isDoctor) {
    return (
      <div className="container mx-auto py-6">
        <MyQueueView />
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
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">كشك التسجيل</h2>
        <AmbientKioskView />
      </div>
    </div>
  );
}
