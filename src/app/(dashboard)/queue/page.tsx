// src/app/(dashboard)/queue/page.tsx
// Phase 4 — Queue Management Module
// Main queue page — simplified, no Tabs

import { redirect } from "next/navigation";
import { getQueue, getQueueStats, getActiveDoctors } from "@/domain/queue/queue.queries";
import { LiveQueueBoard } from "@/features/reception/LiveQueueBoard";
import { MyQueueView } from "@/features/doctor/MyQueueView";
import { AmbientKioskView } from "@/features/kiosk/AmbientKioskView";

export default async function QueuePage() {
  try {
    await Promise.all([
      getQueue(),
      getQueueStats(),
      getActiveDoctors(),
    ]);

    // TODO: قراءة الدور من JWT لاحقاُ
    const isDoctor = false;

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
          <LiveQueueBoard />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">كشك التسجيل</h2>
          <AmbientKioskView />
        </div>
      </div>
    );

  } catch (error) {
    redirect("/login");
  }
}
