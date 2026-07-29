// src/app/(dashboard)/queue/page.tsx
// TEMPORARY DEBUG VERSION — TASK-QUEUE-FIX-002 — MUST BE REVERTED

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
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

  const [queueResult, statsResult, doctorsResult] = await Promise.allSettled([
    getQueue(),
    getQueueStats(),
    getActiveDoctors(),
  ]);

  const labeled = [
    { name: "getQueue", result: queueResult },
    { name: "getQueueStats", result: statsResult },
    { name: "getActiveDoctors", result: doctorsResult },
  ];

  const failures = labeled
    .filter((x) => x.result.status === "rejected")
    .map((x) => ({
      fn: x.name,
      message: String(
        (x.result as PromiseRejectedResult).reason?.message ??
          (x.result as PromiseRejectedResult).reason
      ),
      stack: String((x.result as PromiseRejectedResult).reason?.stack ?? "no stack"),
    }));

  if (failures.length > 0) {
    return (
      <div style={{ padding: 24, fontFamily: "monospace", direction: "ltr", textAlign: "left", background: "#111", color: "#0f0", minHeight: "100vh" }}>
        <h1 style={{ color: "#f55" }}>TEMPORARY DEBUG OUTPUT — TASK-QUEUE-FIX-002</h1>
        <p>tenantId used: {tenantId}</p>
        <p>user id: {user.id}</p>
        <pre>{JSON.stringify(failures, null, 2)}</pre>
      </div>
    );
  }

  const queueData = (queueResult as PromiseFulfilledResult<any>).value;
  const statsData = (statsResult as PromiseFulfilledResult<any>).value;
  const doctorsData = (doctorsResult as PromiseFulfilledResult<any>).value;

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
