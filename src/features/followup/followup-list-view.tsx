// src/features/followup/followup-list-view.tsx
// Package 3.1.9 — Follow-up List View
// Renders all follow-ups with filtering by status/type. Status update only.

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateFollowupStatus } from "@/domain/followup/followup.queries";
import type { FollowupRecord, FollowupDeliveryStatus } from "@/domain/followup/followup.types";

interface FollowupListViewProps {
  records: FollowupRecord[];
  canUpdate: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  isPending: boolean;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "معلّقة", variant: "secondary" },
  sent: { label: "تم الإرسال", variant: "default" },
  delivered: { label: "تم التوصيل", variant: "default" },
  read: { label: "مقروءة", variant: "default" },
  failed: { label: "فشل", variant: "destructive" },
  cancelled: { label: "ملغاة", variant: "outline" },
};

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

export function FollowupListView({ records, canUpdate, onStatusUpdate, isPending }: FollowupListViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filterStatus === "all"
    ? records
    : records.filter((r) => r.delivery_status === filterStatus);

  const handleStatusChange = async (id: string, newStatus: FollowupDeliveryStatus) => {
    setUpdatingId(id);
    const result = await updateFollowupStatus({ followup_id: id, new_status: newStatus });
    if (result.success) {
      onStatusUpdate(id, newStatus);
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">تصفية حسب الحالة:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">معلّقة</SelectItem>
            <SelectItem value="sent">تم الإرسال</SelectItem>
            <SelectItem value="delivered">تم التوصيل</SelectItem>
            <SelectItem value="read">مقروءة</SelectItem>
            <SelectItem value="failed">فشل</SelectItem>
            <SelectItem value="cancelled">ملغاة</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground mr-auto">الإجمالي: {filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد متابعات مطابقة للتصفية
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((record) => {
            const status = record.delivery_status ?? "pending";
            const cfg = statusConfig[status] ?? { label: status, variant: "secondary" };

            return (
              <Card key={record.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{record.patient_name ?? "مريض غير معروف"}</span>
                        {record.patient_phone && (
                          <span className="text-sm text-muted-foreground">{record.patient_phone}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{typeLabels[record.followup_type] ?? record.followup_type}</Badge>
                        <span>•</span>
                        <span>{new Date(record.scheduled_for).toLocaleString("ar-SA")}</span>
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
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {canUpdate && (
                        <Select
                          disabled={updatingId === record.id || isPending}
                          value={status}
                          onValueChange={(val) => handleStatusChange(record.id, val as FollowupDeliveryStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="تغيير الحالة" />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
