"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { useLiveQueue, useUpdateSessionStatus } from "@/domain/queue/queue.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Stethoscope, Lock, Unlock, CheckCircle } from "lucide-react";

export function MyQueueView() {
  const { user, tenantId } = useAuth();
  const { data: queue, isLoading } = useLiveQueue(tenantId);
  const updateStatus = useUpdateSessionStatus();

  if (!tenantId || !user) return null;
  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  const mySessions = queue?.filter((s: any) => s.doctor_id === user.id || s.lock_holder_id === user.id);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Stethoscope className="w-6 h-6" />
        قائمة الكشف الخاصة بي
      </h2>
      <div className="grid gap-4">
        {mySessions?.map((session: any) => (
          <Card key={session.id} className={`border-l-4 ${session.lock_holder_id === user.id ? "border-l-emerald-500" : "border-l-slate-300"}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{session.clinic_patients?.first_name} {session.clinic_patients?.last_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{session.clinic_patients?.phone_primary}</p>
                </div>
                <Badge variant={session.lock_holder_id === user.id ? "secondary" : "outline"}>
                  {session.lock_holder_id === user.id ? "تحت الكشف" : "متاح"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {session.lock_holder_id === user.id && (
                  <Button onClick={() => updateStatus.mutate({ id: session.id, status: "pending_close" })} size="sm" variant="secondary" className="flex-1">
                    <CheckCircle className="w-4 h-4 ml-1" />إنهاء الكشف
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!mySessions || mySessions.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا يوجد مرضى في قائمتك</p>
        </div>
      )}
    </div>
  );
}
