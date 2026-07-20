// src/app/(dashboard)/queue/page.tsx
// Phase 4 — Queue Management Module
// Main queue page — routes to appropriate view based on role

import { redirect } from "next/navigation";
import { getQueue, getQueueStats, getActiveDoctors } from "@/domain/queue/queue.queries";
import { LiveQueueBoard } from "@/features/reception/LiveQueueBoard";
import { MyQueueView } from "@/features/doctor/MyQueueView";
import { AmbientKioskView } from "@/features/kiosk/AmbientKioskView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Monitor, UserCheck, Stethoscope } from "lucide-react";

// ── Server Component — يقرأ الدور من JWT ───────────────────
export default async function QueuePage() {
  // ملاحظة: في الإصدار الكامل، نقرأ الدور من JWT أو Session
  // الآن نستخدم طريقة مباشرة عبر getQueue التي تتحقق من Auth
  
  let userRole = "receptionist"; // افتراضي — سيتم تحديده من Auth لاحقاً
  let currentUserId = "";
  let currentUserName = "";

  try {
    const [queue, stats, doctors] = await Promise.all([
      getQueue(),
      getQueueStats(),
      getActiveDoctors(),
    ]);

    // تحديد الدور من أول طبيب في القائمة (منطق مؤقت)
    // في الإصدار الكامل: نقرأ الدور من JWT Claims
    const isDoctor = false; // سيتم تحديده من Auth
    
    if (isDoctor) {
      return (
        <div className="container mx-auto py-6">
          <MyQueueView />
        </div>
      );
    }

    // عرض الاستقبال (الافتراضي)
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">لوحة الانتظار</h1>
            <p className="text-muted-foreground">
              إدارة تدفق المرضى والكشف
            </p>
          </div>
        </div>

        <Tabs defaultValue="board" className="space-y-4">
          <TabsList>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              لوحة الانتظار
            </TabsTrigger>
            <TabsTrigger value="kiosk" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              كشك التسجيل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <LiveQueueBoard />
          </TabsContent>

          <TabsContent value="kiosk">
            <Card>
              <CardContent className="p-0">
                <AmbientKioskView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );

  } catch (error) {
    // إذا فشل Auth، نُعيد توجيه لـ Login
    redirect("/login");
  }
}
