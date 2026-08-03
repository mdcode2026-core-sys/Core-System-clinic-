// src/features/followup/followup-scheduled-view.tsx
// Package 3.1.9 — Follow-up Scheduled View
// Shows only pending follow-ups with future scheduled_for. Status update only.

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Phone } from "lucide-react";
import { updateFollowupStatus } from "@/domain/followup/followup.queries";
import type { FollowupRecord, FollowupDeliveryStatus } from "@/domain/followup/followup.types";

interface FollowupScheduledViewProps {
  records: FollowupRecord[];
  canUpdate: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  isPending: boolean;
}

const typeLabels: Record<string, string> = {
  post_visit_24h: "متابعة 24 ساعة",
  post_visit_7d: "متابعة 7 أيام",
  reactivation_30d: "تفعيل 30 يوم",
  reactivation_60d: "تفعيل 60 يوم",
  reactivation_90d: "تفعيل 90 يوم",
  appointment_reminder_24h: "تذكير 24 ساعة",
  appointment_reminder_2h: "تذكير ساعتين",
  birthday: "عيد ميلاد",
  custom: "مخصص",
};

export function FollowupScheduledView({ records, canUpdate, onStatusUpdate, isPending }: FollowupScheduledViewProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: FollowupDeliveryStatus) => {
    setUpdatingId(id);
    const result = await updateFollowupStatus({ followup_id: id, new_status: newStatus });
    if (result.success) {
      onStatusUpdate(id, newStatus);
    }
    setUpdatingId(null);
  };

  const now = new Date();

  // Group by date (YYYY-MM-DD)
  const grouped = records.reduce<Record<string, FollowupRecord[]>>((acc, record) => {
    const dateKey = record.scheduled_for.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarClock className="mx-auto mb-3 h-8 w-8 opacity-50" />
            لا توجد متابعات مجدولة مستقبلية
          </CardContent>
        </Card>
      ) : (
        sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {new Date(dateKey).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </h3>
            <div className="grid gap-3">
              {grouped[dateKey].map((record) => (
                <Card key={record.id} className="overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{record.patient_name ?? "مريض غير معروف"}</span>
                          {record.patient_phone && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {record.patient_phone}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{typeLabels[record.followup_type] ?? record.followup_type}</Badge>
                          <span>•</span>
                          <span>{new Date(record.scheduled_for).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                          {record.channel && (
                            <>
                              <span>•</span>
                              <span>{record.channel}</span>
                            </>
                          )}
                        </div>
                        {record.message_body && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{record.message_body}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">معلّقة</Badge>
                        {canUpdate && (
                          <Select
                            disabled={updatingId === record.id || isPending}
                            value={record.delivery_status ?? "pending"}
                            onValueChange={(val) => handleStatusChange(record.id, val as FollowupDeliveryStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="تحديث" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">معلّقة</SelectItem>
                              <SelectItem value="sent">تم الإرسال</SelectItem>
                              <SelectItem value="delivered">تم التوصيل</SelectItem>
                              <SelectItem value="read">مقروءة</SelectItem>
                              <SelectItem value="failed">فشل</SelectItem>
                              <SelectItem value="cancelled">ملغاة</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
