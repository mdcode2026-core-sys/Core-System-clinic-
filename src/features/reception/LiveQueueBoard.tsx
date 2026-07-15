"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { useLiveQueue, useUpdateSessionStatus } from "@/domain/queue/queue.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatTime } from "@/shared/utils/dateTime";
import { Users, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export function LiveQueueBoard() {
  const { tenantId } = useAuth();
  const { data: queue, isLoading } = useLiveQueue(tenantId);
  const updateStatus = useUpdateSessionStatus();

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  const waitingCount = queue?.filter((s: any) => s.session_status === "waiting").length ?? 0;
  const inConsultationCount = queue?.filter((s: any) => s.session_status === "in_consultation").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div className="flex gap-3">
            <Badge variant="outline">في الانتظار: {waitingCount}</Badge>
            <Badge variant="secondary">في الكشف: {inConsultationCount}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {queue?.map((session: any) => (
          <Card key={session.id} className={`border-l-4 ${
            session.session_status === "waiting" ? "border-l-amber-500" :
            session.session_status === "in_consultation" ? "border-l-emerald-500" :
            "border-l-blue-500"
          }`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {session.clinic_patients?.first_name} {session.clinic_patients?.last_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {session.clinic_patients?.phone_primary}
                  </p>
                </div>
                <Badge variant={session.session_status === "waiting" ? "default" : "secondary"}>
                  {session.session_status === "waiting" ? "في الانتظار" : "في الكشف"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الطبيب:</span>
                <span>{session.clinic_users?.full_name || "غير محدد"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">وقت الانتظار:</span>
                <span>{formatTime(session.created_at)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                {session.session_status === "waiting" && (
                  <Button onClick={() => updateStatus.mutate({ id: session.id, status: "in_consultation" })} size="sm" className="flex-1">
                    <ArrowRight className="w-4 h-4 ml-1" />
                    استدعاء
                  </Button>
                )}
                {session.session_status === "in_consultation" && (
                  <Button onClick={() => updateStatus.mutate({ id: session.id, status: "pending_close" })} size="sm" variant="secondary" className="flex-1">
                    <CheckCircle className="w-4 h-4 ml-1" />
                    إنهاء
                  </Button>
                )}
                <Button onClick={() => updateStatus.mutate({ id: session.id, status: "cancelled" })} size="sm" variant="outline" className="text-destructive">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!queue || queue.length === 0) && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا يوجد مرضى في الانتظار</p>
        </div>
      )}
    </div>
  );
}
