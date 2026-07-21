// src/app/(dashboard)/queue/page.tsx
// Phase 4 — Queue Management Module
// Main queue page — all roles see reception view for now

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getQueue, getQueueStats, getActiveDoctors } from "@/domain/queue/queue.queries";
import { LiveQueueBoard } from "@/features/reception/LiveQueueBoard";
import { MyQueueView } from "@/features/doctor/MyQueueView";
import { AmbientKioskView } from "@/features/kiosk/AmbientKioskView";

export default async function QueuePage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const tenantId = user.user_metadata?.tenant_id as string | undefined;

    if (!tenantId) {
      redirect("/login");
    }

    const [queue, stats, doctors] = await Promise.all([
      getQueue(tenantId),
      getQueueStats(tenantId),
      getActiveDoctors(tenantId),
    ]);

    // TODO: تفعيل الشاشات المستقلة حسب الدور لاحقاً
    // عند الوصول إلى مرحلة تفعيل الصلاحيات والشاشات المستقلة
    const isDoctor = false;

    if (isDoctor) {
      return (
        <div className="container mx-auto py-6">
          <MyQueueView initialQueue={queue} tenantId={tenantId} />
        </div>
      );
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">لوحة الانتظار</h1>
        <p className="text-muted-foreground">إدارة تدفق المرضى والكشف</p>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">الاستقبال</h2>
          <LiveQueueBoard initialQueue={queue} initialStats={stats} initialDoctors={doctors} tenantId={tenantId} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">كشك التسجيل</h2>
          <AmbientKioskView tenantId={tenantId} />
        </div>
      </div>
    );

  } catch (error) {
    redirect("/login");
  }
}
